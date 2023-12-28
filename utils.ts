import fs from "fs"
import path from "path"
import pc from "picocolors"
import { exit } from "process"
import { glob } from "glob"

export function preflight(files: string[]) {
  if (files.length === 0) {
    console.log(pc.blue("No files found"))
    exit(1)
  }
  fs.rmSync("public", { recursive: true, force: true })
  fs.mkdirSync("public", { recursive: true })

  // copy everything in static to public
  for (const file of glob.sync("static/**/*")) {
    const dest = path.join("public", path.relative("static", file))
    if (fs.lstatSync(file).isDirectory()) {
      fs.mkdirSync(dest)
      continue
    }
    fs.copyFileSync(file, dest)
  }
}
