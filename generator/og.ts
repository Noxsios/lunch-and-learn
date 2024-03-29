import fs from "node:fs"
import hbs from "handlebars"
import path from "path"
import satori from "satori"

const template = hbs.compile(fs.readFileSync("generator/og.json", "utf-8"))

const neon = fs.readFileSync("static/fonts/MonaspaceNeon-Regular.woff")
const mono = fs.readFileSync("static/fonts/PTMono-Regular.ttf")

if (import.meta.main) {
  const title = "Lunch & Learn"

  const reactLike = template({ title })

  const json = JSON.parse(reactLike)
  const svg = await satori(json, {
    width: 1200,
    height: 630,
    // debug: true,
    fonts: [
      {
        name: "Neon",
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

  fs.writeFileSync(path.join("static", "og.svg"), svg)
}
