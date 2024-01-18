import fm from "front-matter"
import fs from "node:fs"
import { glob } from "glob"
import hbs from "handlebars"
import path from "path"
import { CustomFrontmatter } from "./index"
import satori from "satori"

const template = hbs.compile(fs.readFileSync("generator/og.json", "utf-8"))

const files = glob.sync(path.join("content", "*.md"))

const neon = fs.readFileSync("static/fonts/MonaspaceNeon-Regular.woff")
const mono = fs.readFileSync("static/fonts/PTMono-Regular.ttf")

for (const file of files) {
  const fileContent = fs.readFileSync(file, "utf-8")
  const content = fm(fileContent)
  const attributes = content.attributes as CustomFrontmatter
  if (attributes.slug === "index") {
    attributes.title = "Lunch & Learn"
  }
  const rendered = template({
    title: attributes.title,
  })
  const json = JSON.parse(rendered)
  const svg = await satori(json, {
    width: 1200,
    height: 630,
    // debug: true,
    fonts: [
      {
        name: "No Tears",
        data: neon,
        style: "normal",
      },
      {
        name: "PT Mono",
        data: mono,
        style: "normal",
      },
    ],
  })

  if (attributes.slug === "index") {
    fs.writeFileSync(path.join("public", "og.svg"), svg)
    continue
  }

  fs.writeFileSync(path.join("public", attributes.slug, "og.svg"), svg)
}
