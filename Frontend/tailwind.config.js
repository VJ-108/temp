/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
   keyframes: {
        slide: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        slide: "slide 25s linear infinite",
      },
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
   daisyui: {
    themes: ["light", "dark", "halloween", "cupcake", "bumblebee"], 
  },
}
