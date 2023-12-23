import fm from "front-matter";
import fs from "fs";
import { glob } from "glob";
import hbs from "handlebars";
import path from "path";
import { preflight } from "./utils";
import { Env, md } from "./md";

interface Attributes {
  title: string;
  slug: string;
  date: string;
}

let template = hbs.compile(fs.readFileSync("templates/layout.hbs", "utf-8"));

export function reloadTemplate() {
  template = hbs.compile(fs.readFileSync("templates/layout.hbs", "utf-8"));
}

export function main() {
  const files = glob.sync("content/*.md");
  preflight(files);

  const routes = files.map((file) => {
    const fileContent = fs.readFileSync(file, "utf-8");
    const content = fm(fileContent);
    const attributes = content.attributes as Attributes;
    const { slug, title } = attributes;
    return { slug, title };
  });

  for (const file of files) {
    const fileContent = fs.readFileSync(file, "utf-8");

    const content = fm(fileContent);
    const attributes = content.attributes as Attributes;
    const { slug } = attributes;

    // TODO: ensure title always exists
    // TODO: ensure slug format
    // TODO: ensure date format

    let env: Env = {};

    const html = md.render(content.body, env);

    const result = template({ ...attributes, body: html, routes, toc: env.headers });

    const filename = path.join("public", `${slug}.html`);

    fs.writeFileSync(filename, result);
  }
}

if (import.meta.main) {
  main();
}
