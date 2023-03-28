/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        primary: ["ImpactReversed"],
        secondary: ["Impact"],
      },
      colors: {
        "custom-black": "#121212",
        "custom-white": "#F5F5F5",
        "custom-red": "#900001",
        "custom-orange": "#c84e3a",
        "custom-light-orange": "#e76d59",
        "custom-blue": "#24547A",
        "custom-dark-gray": "#1f1f1f",
        "custom-mid-gray": "#303030",
        "custom-light-gray": "#6F7273",
        "custom-pink": "#e99895",
      },
      screens: {
        "3xl": "2160px",
        "4xl": "3000px",
      },
    },
  },
  plugins: [],
};
