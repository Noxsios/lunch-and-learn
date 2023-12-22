import fm from "front-matter";
import fs from "fs";
import { glob } from "glob";
import hbs from "handlebars";
import hljs from "highlight.js";
import markdownit from "markdown-it";
import anchorit from "markdown-it-anchor";
import path from "path";
import { exit } from "process";
import { preflight } from "./utils";

const md = markdownit({
  //   html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }

    return "";
  },
}).use(anchorit, {
  permalink: anchorit.permalink.headerLink(),
});

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
    const { slug } = attributes;
    return slug;
  });

  console.log(routes);

  for (const file of files) {
    const fileContent = fs.readFileSync(file, "utf-8");
    // console.log(pc.cyan(file));

    const content = fm(fileContent);
    const attributes = content.attributes as Attributes;
    const { slug } = attributes;

    // TODO: ensure title always exists
    // TODO: ensure slug format
    // TODO: ensure date format

    const html = md.render(content.body);

    const result = template({ ...attributes, body: html });

    const filename = path.join("public", `${slug}.html`);

    fs.writeFileSync(filename, result);
  }
}

if (import.meta.main) {
  main();
}
