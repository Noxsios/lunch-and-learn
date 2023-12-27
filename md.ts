import hljs from "highlight.js";
import markdownit from "markdown-it";
import anchor from "markdown-it-anchor";

export const md = markdownit({
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
})
  .use(anchor, {
    permalink: anchor.permalink.headerLink(),
  })
  .use(extractHeadersPlugin);

export const slugify = (s: string): string => {
  return encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, "-"));
};

type Header = {
  depth: number;
  title: string;
  slug: string;
};

export interface Env {
  headers?: Header[];
}

function extractHeadersPlugin(md: markdownit): void {
  // Store the original MarkdownIt renderer rules for headings
  const defaultRender =
    md.renderer.rules.heading_open ||
    ((tokens, idx, options, env, self) => {
      return self.renderToken(tokens, idx, options);
    });

  md.renderer.rules.heading_open = (tokens, idx, options, env: Env, self) => {
    const depth = Number(tokens[idx].tag.replace("h", "")) - 2;

    // Fail on h1 due to mdlint rule of title in frontmatter
    if (depth === -1) {
      throw new Error("h1 is not allowed");
    }

    // Only process headings up to level 3
    if (depth > 3) {
      return defaultRender(tokens, idx, options, env, self);
    }

    // Find the corresponding text token; usually the next token is the text token for headers
    const titleToken = tokens[idx + 1];
    if (titleToken.type === "inline") {
      const title =
        titleToken.children
          ?.filter((t) => t.type === "text")
          .map((t) => t.content)
          .join("") || "";
      const slug = slugify(title);

      // Initialize headers array in the environment object
      env.headers = env.headers || [];

      // Add header information to the headers array
      env.headers.push({ depth, title, slug });
    }

    // Return the original render output
    return defaultRender(tokens, idx, options, env, self);
  };
}
