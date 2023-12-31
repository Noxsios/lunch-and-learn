/*
This file exists because Bun's node:fs implementation is not 100% feature parity
with the native fs module.

Its a bit of a hack and pretty ugly, but w/e.
*/
import git from "isomorphic-git"
import fs from "node:fs"
import { glob } from "glob"
import path from "node:path"

const files = glob.sync(path.join("content", "*.md"))

let stdout = []

for (const filepath of files) {
  const dir = "."
  let latestCommit
  try {
    latestCommit = await git.log({ fs, dir, filepath, depth: 1 }).then((log) => log[0].commit)
  } catch (err) {
    if (err instanceof git.Errors.NotFoundError) {
      continue
    }
    throw err
  }
  const by = latestCommit.author.name
  const timestamp = latestCommit.author.timestamp

  const then = new Date(timestamp * 1000).getTime()

  stdout = [...stdout, { filepath, then, by }]
}

console.log(JSON.stringify(stdout, null, 2))
