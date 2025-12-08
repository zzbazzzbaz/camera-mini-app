/** @type {import('tailwindcss').Config} */
module.exports = {
  separator: "__",
  corePlugins: {
    preflight: false,
    space: false,
    divideWidth: false,
    divideColor: false,
    divideStyle: false,
    divideOpacity: false,
  },
  content: [
    "./src/pages/**/*.{vue,js,ts}",
    "./src/components/**/*.{vue,js,ts}",
    "./src/main.{js,ts}",
    "./src/App.vue",
    "./index.html",
  ],
  theme: { extend: {} },
  plugins: [],
};
