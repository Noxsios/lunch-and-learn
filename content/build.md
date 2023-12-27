---
title: Building the Site
slug: building-the-site
---

## Why?

...

<https://noxsios.github.io/config-composer/> --> YAML parsing + `mustache` templating, + `remark-gfm`

blog --> `zola` folder layouts

bb-docs-compiler --> `mkdocs` + `mkdocs-material` + `mkdocs-git-revision-date-localized-plugin`

adidoks --> font inspiration + simple layout

I had already done some similar work when I wrote the compiler for [Big Bang's docs](https://docs-bigbang.dso.mil).

And I really like showing Git information in the docs, so I wanted to replicate that.

```python
# source: https://github.com/Noxsios/bb-docs-compiler/blob/d5da5b6a90108570c018b98ac30bc9da6807c610/docs-compiler/repo.py#L46-47
def get_revision_date(self, abspath):
    return self.repo.git.log(abspath, n=1, date="short", format="%ad by %cn")
```
