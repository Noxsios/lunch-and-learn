import Reveal from "reveal.js"
import RevealMarkdown from "reveal.js/plugin/markdown/markdown.esm.js"
import RevealHighlight from "reveal.js/plugin/highlight/highlight.esm.js"
import RevealNotes from "reveal.js/plugin/notes/notes.esm.js"
import RevealZoom from "reveal.js/plugin/zoom/zoom.esm"

import "reveal.js/dist/reveal.css"

const deck = new Reveal({
  hash: true,
  embedded: true,
  center: true,

  // Learn about plugins: https://revealjs.com/plugins/
  plugins: [RevealMarkdown, RevealHighlight, RevealNotes, RevealZoom],
})
deck.initialize()
