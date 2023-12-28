import fm from "front-matter"
import fs from "node:fs"
import { glob } from "glob"
import hbs from "handlebars"
import path from "path"
import { preflight } from "./utils"
import { Env, md, slugify } from "./md"
import esbuild from "esbuild"

interface Attributes {
  title: string
  slug: string
  date: string
}

let template = hbs.compile(fs.readFileSync("templates/layout.hbs", "utf-8"))

export function reloadTemplate() {
  template = hbs.compile(fs.readFileSync("templates/layout.hbs", "utf-8"))
}

type LastModified = {
  filepath: string
  diff: string
  by: string
  raw: number
}

export async function main() {
  const { stdout } = Bun.spawn(["node", "timestamps.mjs"])
  const timestamps: LastModified[] = await new Response(stdout).json()

  const files = glob.sync(path.join("content", "*.md"))
  preflight(files)

  await esbuild.build({
    entryPoints: ["templates/main.ts"],
    format: "esm",
    bundle: true,
    outfile: "public/main.js",
    minify: true,
    sourcemap: true,
    target: "esnext",
    platform: "browser",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
  })

  const routes = timestamps
    .sort((a, b) => {
      // ensure content/_index.md is always first
      if (a.filepath === path.join("content", "_index.md")) {
        return -1
      }
      return a.raw - b.raw
    })
    .map((t) => {
      const fileContent = fs.readFileSync(t.filepath, "utf-8")
      const content = fm(fileContent)
      const attributes = content.attributes as Attributes
      const { slug, title } = attributes
      return { slug, title }
    })

  for (const filepath of files) {
    const fileContent = fs.readFileSync(filepath, "utf-8")
    const ts = timestamps.find((t) => t.filepath === filepath)

    const content = fm(fileContent)
    const attributes = content.attributes as Attributes

    if (!attributes.title) {
      throw new Error(`Missing title in ${filepath}`)
    }
    if (!attributes.slug) {
      throw new Error(`Missing slug in ${filepath}`)
    }
    attributes.slug = slugify(attributes.slug)

    let env: Env = {}

    const html = md.render(content.body, env)

    const result = template({
      ...attributes,
      body: html,
      routes,
      toc: env.headers,
      ...ts,
    })

    const filename = path.join("public", `${attributes.slug}.html`)

    fs.writeFileSync(filename, result)
  }
}

if (import.meta.main) {
  await main()
}
