import fm from "front-matter"
import fs from "node:fs"
import { glob } from "glob"
import hbs from "handlebars"
import path from "path"
import pc from "picocolors"
import { Env, md, slugify } from "./md"
import esbuild from "esbuild"
import rt from "reading-time"
import ms from "ms"

export interface CustomFrontmatter {
  title: string
  slug: string
  layout: "default" | "slides"
}

type LastModified = {
  filepath: string
  then: number
  by: string
  createdAt: number
}

async function main() {
  const start = Date.now()

  const { stdout } = Bun.spawn(["node", "generator/timestamps.mjs"])
  const lm: LastModified[] = await new Response(stdout).json()

  const partials = glob.sync("templates/partials/*.hbs")
  for (const filepath of partials) {
    const name = path.basename(filepath, ".hbs")
    const partial = hbs.compile(fs.readFileSync(filepath, "utf-8"))
    hbs.registerPartial(name, partial)
  }
  const template = hbs.compile(fs.readFileSync("templates/layout.hbs", "utf-8"))
  hbs.registerHelper("ifEquals", function (arg1, arg2, options) {
    // @ts-expect-error "this" is implicitly any because of the way handlebars works
    return arg1 === arg2 ? options.fn(this) : options.inverse(this)
  })

  const files = glob.sync(path.join("content", "*.md"))

  if (files.length === 0) {
    throw new Error("No markdown files found in content/")
  }
  fs.rmSync("public", { recursive: true, force: true })
  fs.mkdirSync("public", { recursive: true })

  // copy everything in static to public
  for (const filepath of glob.sync("static/**/*")) {
    const dst = path.join("public", path.relative("static", filepath))
    if (fs.lstatSync(filepath).isDirectory()) {
      fs.mkdirSync(dst)
      continue
    }
    fs.copyFileSync(filepath, dst)
  }

  // bundle the index.ts and reveal.ts entrypoints
  await esbuild.build({
    entryPoints: ["templates/index.ts", "templates/reveal.ts"],
    format: "esm",
    bundle: true,
    outdir: "public",
    minify: true,
    sourcemap: true,
    target: "esnext",
    platform: "browser",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
  })

  // build the routes
  const routes = lm
    .sort((a, b) => {
      // ensure content/_index.md is always first
      if (a.filepath === path.join("content", "_index.md")) {
        return -1
      }
      return a.createdAt - b.createdAt
    })
    .map((t) => {
      const fileContent = fs.readFileSync(t.filepath, "utf-8")
      const content = fm(fileContent)
      const attributes = content.attributes as CustomFrontmatter
      return { ...attributes, ...t, body: content.body }
    })

  const slugs = new Set<string>()

  for (const route of routes) {
    const { filepath, title, layout, body } = route

    console.log(pc.gray(`Generating ${filepath}`))

    let { slug } = route

    if (!slug && filepath !== path.join("content", "_index.md")) {
      throw new Error(`Missing slug in ${filepath}`)
    }

    slug = slugify(slug)

    if (slugs.has(slug)) {
      throw new Error(`Duplicate slug ${slug} in ${filepath}`)
    }
    slugs.add(slug)

    if (!title) {
      throw new Error(`Missing title in ${filepath}`)
    }

    const meta = {
      title,
      layout,
      routes: routes.filter((r) => r.slug !== "index"),
      ts: lm.find((t) => t.filepath === filepath),
    }

    let result = ""

    if (!layout || layout === "default") {
      const env: Env = {}
      const html = md.render(body, env)

      result = template({
        ...meta,
        body: html,
        toc: env.headers,
        readingTime: rt(body).text,
      })
    } else if (layout === "slides") {
      result = template({
        ...meta,
        body,
      })
    } else {
      throw new Error(`Unknown layout ${layout} in ${filepath}`)
    }

    // only _index.md should be written to public/index.html
    if (slug === "index") {
      fs.writeFileSync(path.join("public", "index.html"), result)
      continue
    }

    const routeDir = path.join("public", slug)

    fs.mkdirSync(routeDir)

    fs.writeFileSync(path.join(routeDir, "index.html"), result)
  }

  const end = Date.now()

  console.log(pc.gray(`Generated ${routes.length} routes`))
  console.log(pc.green(`Done in ${ms(end - start)}`))
}

if (import.meta.main) {
  await main()
}
