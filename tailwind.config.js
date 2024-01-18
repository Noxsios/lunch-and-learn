import typography from "@tailwindcss/typography"
import daisyui from "daisyui"

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./templates/**/*.{js,ts,hbs,css}"],
  plugins: [typography, daisyui],
  daisyui: {
    themes: ["dim", "light"],
    darkTheme: "dim",
  },
}
