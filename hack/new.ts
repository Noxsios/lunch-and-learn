import { file, write, $ } from "bun"
import pc from "picocolors"
import inquirer from "inquirer"
import { slugify } from "../generator/md"

console.log(pc.gray("Follow the prompts below to author a new post"))

const ans = await inquirer.prompt([
  {
    type: "input",
    name: "title",
    message: "Title:",
  },
  {
    type: "list",
    name: "layout",
    message: "Layout:",
    choices: ["default", "slides"],
  },
])

const { title, layout } = ans

const slug = slugify(title)

const filepath = `content/${slug}.md`

if (await file(filepath).exists()) {
  throw new Error(`File already exists: ${filepath}`)
}

await $`git checkout -b ${slug}`

await write(
  file(`content/${slug}.md`),
  `---
title: ${title}
slug: ${slug}
layout: ${layout}
# draft: true
---

`,
)

await console.log(pc.green(`Created ${filepath}`))
