import ms from "ms"

const $ = document.querySelector.bind(document)
// const $$ = document.querySelectorAll.bind(document)

const now = new Date().getTime()

const then = new Date(Number($("#timeago")!.textContent!)).getTime()

$("#timeago")!.textContent = ms(now - then, {
  long: true,
})
