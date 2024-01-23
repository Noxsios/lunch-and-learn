import ms from "ms"

export const $ = document.querySelector.bind(document)
export const $$ = document.querySelectorAll.bind(document)

// fire this code before everything so there is no FUOC
const userPref = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dim" : "light"
const current = localStorage.getItem("theme") || userPref || "light"
document.documentElement.setAttribute("data-theme", current)

const toggleTheme = () => {
  const theme = document.documentElement.getAttribute("data-theme")
  const next = theme === "light" ? "dim" : "light"
  document.documentElement.setAttribute("data-theme", next)
  localStorage.setItem("theme", next)
}

function findClosestHeading(): Element | null {
  const headings = $$("article h2, article h3, article h4, article h5, article h6")
  let closestHeading: Element | null = null
  let closestDistance = Infinity

  headings.forEach((heading) => {
    const distance = heading.getBoundingClientRect().top

    if (distance < closestDistance && distance >= 0) {
      closestHeading = heading
      closestDistance = distance
    }
  })

  return closestHeading
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

  const getNavLink = (id: string) => {
    return $(`nav[aria-label='Table of Contents'] a[href="#${id}"]`)
  }

  const prog = $("#progress") as HTMLProgressElement

  if (prog) {
    const totalHeight = document.body.scrollHeight - window.innerHeight

    window.addEventListener("scroll", () => {
      prog.value = (window.scrollY / totalHeight) * 100
    })
  }

  if ($("nav[aria-label='Table of Contents']")) {
    const headings = $$("article h2, article h3, article h4, article h5, article h6")
    const toc = $$("nav[aria-label='Table of Contents'] a")

    // find the closest heading to the current scroll position
    const closest = findClosestHeading()
    if (closest) {
      // add the active class to the closest heading
      const id = closest!.getAttribute("id")
      const navLink = getNavLink(id!)
      navLink!.classList.add("active")
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target!.getAttribute("id")
          const navLink = getNavLink(id!)

          if (entry.isIntersecting) {
            toc.forEach((link) => link.classList.remove("active"))
            navLink!.classList.add("active")
          }
        })
      },
      { threshold: 0.5 },
    )

    headings.forEach((heading) => {
      observer.observe(heading)
    })
  }
})
