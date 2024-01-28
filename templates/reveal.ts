import Reveal from "reveal.js"
import RevealMarkdown from "reveal.js/plugin/markdown/markdown.esm.js"
import RevealHighlight from "reveal.js/plugin/highlight/highlight.esm.js"

import "reveal.js/dist/reveal.css" // becomes public/reveal.css

const deck = new Reveal({
  hash: true,
  embedded: true,

  // Learn about plugins: https://revealjs.com/plugins/
  plugins: [RevealMarkdown, RevealHighlight],
})
deck.initialize()
