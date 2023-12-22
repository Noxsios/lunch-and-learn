import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./templates/**/*.{js,hbs,css}"],
  theme: {
    extend: {},
  },
  plugins: [typography],
};
