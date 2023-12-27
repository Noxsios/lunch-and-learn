const ms = await import("ms");

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const now = new Date().getTime();

const then = new Date($("#timeago")!.textContent!).getTime();

document.querySelector("#timeago")!.textContent = ms(now - then, { long: true });
