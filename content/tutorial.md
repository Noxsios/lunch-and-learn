---
title: Tutorial
slug: tutorial
---

## Overview

This page is a short tutorial on how to use this site. An interactive CLI is available to help you author new content. To use it, run the following command:

```bash
bun hack/new.ts
```

## Front Matter

For configuring routing, metadata, and other page-specific settings, this site uses YAML front matter. Front matter is a block of YAML at the top of a page that is surrounded by `---` delimiters. For example, the front matter for this page looks like:

```yaml
---
title: Tutorial
slug: tutorial
---
```

- `title`: (required) The title of the page. This is used in the `<title>` tag and in the navigation.
- `slug`: (required) The URL path for the page.
- `layout`: (optional) The layout to use for the page. Options: `default`, `slides`. This controls whether the page is rendered as a normal page or as a slide deck.

## Markdown

This site uses [`markdown-it`](https://github.com/markdown-it/markdown-it) for rendering Markdown and follows the [CommonMark](https://commonmark.org/) specification.

- [Markdown tutorial](https://commonmark.org/help/tutorial/)
- [Quick reference](https://commonmark.org/help/)

## Images

For right now, images are stored in the `static` directory, and placed within a directory named the same as the page's [`slug`](#front-matter). To include an image in a page, use the following syntax:

```markdown
<!-- The below is an _absolute_ link to the image -->
![alternate title](/<slug>/<image>)
```

## Slides

This site uses [`reveal.js`](https://revealjs.com/) for rendering slides. To create a slide deck, create a page with the `slides` layout and use the following syntax:

`reveal.js` allows for 2-dimentional slide decks. To place a slide "under" another slide, use `---` (3) delimiters. To place a slide "next to" another slide, use `-----` (5) delimiters.

```markdown
---
title: My Slide Deck
slug: my-slide-deck
layout: slides
---

# Slide 1

---

# Under slide 1

-----

# Slide 2

-----

# Slide 3
```

See an better example at [content/slides.md](https://raw.githubusercontent.com/Noxsios/lunch-and-learn/main/content/slides.md).

All Markdown syntax is supported in slides. See the [reveal.js documentation](https://revealjs.com/markdown/) for more information.
