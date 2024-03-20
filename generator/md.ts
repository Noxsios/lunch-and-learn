import hljs from "highlight.js"
import markdownit from "markdown-it"
import anchor from "markdown-it-anchor"
import pc from "picocolors"
import path from "path"
import fs from "fs"
import fm from "front-matter"
import { CustomFrontmatter } from "./main"

export const md = markdownit({
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (e) {
        console.log(pc.red(`Error highlighting code: ${e}`))
        return ""
      }
    }

    return ""
  },
})
  .use(anchor, {
    permalink: anchor.permalink.headerLink(),
  })
  .use(extractHeadersPlugin)
  .use(fixInternalLinksPlugin)

export const slugify = (s: string): string => {
  return encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, "-"))
}

type Header = {
  depth: number
  title: string
  slug: string
}

export interface Env {
  headers?: Header[]
}

function extractHeadersPlugin(md: markdownit): void {
  // Store the original MarkdownIt renderer rules for headings
  const defaultRender =
    md.renderer.rules.heading_open ||
    ((tokens, idx, options, env, self) => {
      return self.renderToken(tokens, idx, options)
    })

  md.renderer.rules.heading_open = (tokens, idx, options, env: Env, self) => {
    const depth = Number(tokens[idx].tag.replace("h", "")) - 2

    // Fail on h1 due to mdlint rule of title in frontmatter
    if (depth === -1) {
      throw new Error("h1 is not allowed")
    }

    // Only process headings up to level 3
    if (depth > 3) {
      return defaultRender(tokens, idx, options, env, self)
    }

    // Find the corresponding text token; usually the next token is the text token for headers
    const titleToken = tokens[idx + 1]
    if (titleToken.type === "inline") {
      const title = titleToken.children?.map((t) => t.content).join("") || ""
      const slug = slugify(title)

      // Initialize headers array in the environment object
      env.headers = env.headers || []

      // Add header information to the headers array
      env.headers.push({ depth, title, slug })
    }

    // Return the original render output
    return defaultRender(tokens, idx, options, env, self)
  }
}

// plugin to fix links to internal .md files to go to the generated /<slug>/ path
function fixInternalLinksPlugin(md: markdownit): void {
  const defaultRender =
    md.renderer.rules.link_open ||
    ((tokens, idx, options, env, self) => {
      return self.renderToken(tokens, idx, options)
    })

  md.renderer.rules.link_open = (tokens, idx, options, env: Env, self) => {
    const href = tokens[idx].attrGet("href")
    if (href && href.endsWith(".md") && !href.startsWith("http")) {
      const filepath = path.join("content", href)

      // fail if the filepath is outside of the content directory
      if (!filepath.startsWith("content")) {
        throw new Error(`Invalid link to ${filepath}`)
      }

      // fail if the file doesn't exist
      if (!fs.existsSync(filepath)) {
        throw new Error(`File ${filepath} does not exist`)
      }

      if (filepath === path.join("content", "_index.md")) {
        tokens[idx].attrSet("href", "/")
      } else {
        const content = fm(fs.readFileSync(filepath, "utf-8"))
        const attributes = content.attributes as CustomFrontmatter
        const slug = slugify(attributes.slug || "")
        tokens[idx].attrSet("href", `/${slug}`)
      }
    }
    return defaultRender(tokens, idx, options, env, self)
  }
}
