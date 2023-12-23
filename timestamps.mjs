import git from "isomorphic-git";
import fs from "node:fs";
import { glob } from "glob";
import ms from "ms";

const files = glob.sync("content/*.md");

let stdout = [];

for (const filepath of files) {
  const now = new Date().getTime();
  const dir = ".";
  const latestCommit = await git.log({ fs, dir, filepath, depth: 1 }).then((log) => log[0].commit);
  const by = latestCommit.author.name;
  const timestamp = latestCommit.author.timestamp;

  const then = new Date(timestamp * 1000).getTime();

  const diff = ms(now - then, { long: true });

  stdout = [...stdout, { filepath, diff, by }];
}

console.log(JSON.stringify(stdout, null, 2));
