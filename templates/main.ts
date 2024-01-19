import ms from "ms"

export const $ = document.querySelector.bind(document)
export const $$ = document.querySelectorAll.bind(document)

const current = localStorage.getItem("theme") || "light"
document.documentElement.setAttribute("data-theme", current)

const toggleTheme = () => {
  const theme = document.documentElement.getAttribute("data-theme")
  const next = theme === "light" ? "dim" : "light"
  document.documentElement.setAttribute("data-theme", next)
  localStorage.setItem("theme", next)
}

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = $("#theme-toggle") as HTMLInputElement
  themeToggle!.checked = current === "dim"
  themeToggle!.addEventListener("click", toggleTheme)

  const now = new Date().getTime()

  const then = new Date(Number($("#timeago")!.textContent!)).getTime()

  $("#timeago")!.textContent = ms(now - then, {
    long: true,
  })
  $("#timeago")!.classList.value = ""
})
