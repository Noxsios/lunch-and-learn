---
title: Building the Site
slug: building-the-site
---

## Why?

When I set out to make a website for Lunch and Learns; I looked at using an existing static site generator (SSG). After a good amount of research (and general familiarity with the landscape), I ended up dissatisfied.

I wanted something that was:

- Simple
- Minimal
- Fast
- In the JS/TS ecosystem

There are a multitude of options, but I ended up not liking any of them:

- [Hugo](https://gohugo.io/) is bulky, boilerplate-y, and has a lot of features I don't need.
- [11ty](https://www.11ty.dev/) had a lot of the same issues as Hugo, too many features and too complex to setup a simple site.
- [mkdocs](https://www.mkdocs.org/) (especially with the [material theme](https://squidfunk.github.io/mkdocs-material/)) was a good option, but it's written in Python and I wanted to keep everything within HTML+TS+CSS. Plus I used it in a previous project, so I wanted to try something new.
- I actually use [zola](https://www.getzola.org/) for my [blog](https://blog.razzle.cloud), but it's written in Rust, so it falls into the same category as mkdocs.
- [Gatsby](https://www.gatsbyjs.com/), [Remix](https://remix.run), [Next.js](https://nextjs.org/), and [Nuxt.js](https://nuxtjs.org/) are all great options, but they're all React/Vue based, and I wanted to stay low-level.

I could have also built a bespoke solution in Svelte, but that seemed to be overengineering the problem.

At the end of the day all I really wanted was to take a directory of Markdown files and turn them into an educational website. So I decided to build my own simple SSG.

> The goal of this SSG was never to scale it to become its own product. It was just a fun project to build something simple and minimal.

## Inspiration and previous works

Many of the pieces of this project were inspired by other projects I've worked on or seen.

Back in my Air Force days I wrote a small PWA for templating configuration files. It was written in React and used `mustache` for templating, `remark-gfm` for parsing Markdown, and `js-yaml` for parsing YAML configuration files. I called it [Config Composer](https://noxsios.github.io/config-composer/).

As mentioned earlier, I use `zola` for my blog. I really like the simplicity of the layouts and the speed of the build process. This formed the basis for the layout of the project:

```bash
❯ tree . -I "node_modules|public"
.
├── README.md
├── bun.lockb            # lockfile for bun
├── content              # markdown files
├── generator/*.ts|mjs   # typescript build system
├── package.json
├── static               # static assets (images, manifest, etc)
├── tailwind.config.js   # tailwind config
├── templates            # html templates + css and TS entrypoints
└── tsconfig.json        # typescript compiler config
```

In college I made slide decks using `reveal.js` and hosting via GitHub pages. I actually would just submit the URL to the professor. Here's a report on Gettysburg: <https://noxsios.github.io/gettysburg/>.

One of the final projects I wrote for [Platform One](https://p1.dso.mil) was the documentation compiler that powers [Big Bang's docs](https://docs-bigbang.dso.mil) (it's still going strong 1+ years later!).

It was originally a side project that I was working on in my spare time, so the source code can actually be found on Github: [bb-docs-compiler](https://github.com/Noxsios/bb-docs-compiler). The upstream repo is private, so I can't link to it, and has some final changes + features that I never merged back into the public repo.

The compiler was written in Python and used `mkdocs` as the base SSG. I also used `mkdocs-material` as the theme, and `mkdocs-git-revision-date-localized-plugin` to show Git information in the docs.

```python
# source: https://github.com/Noxsios/bb-docs-compiler/blob/d5da5b6a90108570c018b98ac30bc9da6807c610/docs-compiler/repo.py#L46-47
def get_revision_date(self, abspath):
    return self.repo.git.log(abspath, n=1, date="short", format="%ad by %cn")
```

More recently, I was looking at themes for Zola and came across [adidoks](https://adidoks.netlify.app/docs/getting-started/introduction/). I really liked it's use of minimal color, wide spacing, and clear typography. I used it as inspiration for the web layout of this site.

## Core features

- Content as either a blog post or a slide deck
  - YAML front matter via `front-matter`
  - Articles rendered w/ `markdown-it`, `markdown-it-anchor` and `highlight.js`
  - Slides rendered w/ `reveal.js`
  - TypeScript compiled w/ `esbuild`
  - Reading time estimation via `reading-time`
- Templating via `handlebars`
- Git integration via `isomorphic-git`, client side "timeago" via `ms`
- Simple layout
- Fast build times
- Easy to use
- Minimal client side JS
