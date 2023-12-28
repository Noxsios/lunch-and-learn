import { main, reloadTemplate } from "./index"
import chokidar from "chokidar"
import pc from "picocolors"

// Initialize watcher.
const watcher = chokidar.watch(["templates", "static", "content"], {
  ignored: /^\./, // ignore dotfiles
  persistent: true,
})

if (import.meta.main) {
  console.log("running dev")
  main()
  // Something to use when events are received.
  // Add event listeners.
  watcher.on("change", (path) => {
    const now = new Date()
    if (path === "templates/layout.hbs") {
      reloadTemplate()
    }
    console.log(pc.gray(`\nFile ${path} changed.\n`))
    main()
    const elapsed = new Date().getTime() - now.getTime()
    console.log(pc.cyan(`Done in ${elapsed}ms.`))
  })
}
