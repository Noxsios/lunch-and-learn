import typography from "@tailwindcss/typography"
import colors from "tailwindcss/colors"

const round = (num) =>
  num
    .toFixed(7)
    .replace(/(\.[0-9]+?)0+$/, "$1")
    .replace(/\.0$/, "")
const rem = (px) => `${round(px / 16)}rem`
const em = (px, base) => `${round(px / base)}em`

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./templates/**/*.{js,hbs,css}"],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-hr": colors.zinc[300],
            "code::before": {
              content: "none",
            },
            "code::after": {
              content: "none",
            },
            code: {
              fontFamily: '"PT Mono", monospace',
              backgroundColor: colors.slate[300],
              paddingTop: em(6, 18),
              paddingBottom: em(6, 18),
              paddingLeft: em(10, 18),
              paddingRight: em(10, 18),
            },
            "pre code": {
              fontFamily: '"PT Mono", monospace',
            },
            hr: {
              borderTopWidth: "2px",
              marginTop: em(20, 14),
              marginBottom: em(20, 14),
            },
            kbd: {
              borderRadius: "0 !important", // need to investigate why needed to override w/ !important
            },
            pre: {
              borderRadius: "0 !important", // need to investigate why needed to override w/ !important
            },
          },
        },
      },
    },
  },
  plugins: [typography],
}
