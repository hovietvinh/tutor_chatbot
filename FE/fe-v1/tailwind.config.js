/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        primaryBg:{
          default:"#FFFFFF",
          sibar:"#F9F9F9",
          hover:"#ECECEC"

        },
        primaryText:{
          default:"#0D0D0D",
          second:"#7D7D7D",
          third:"#8F8F8F"
        }
      }
    },
  },
  plugins: [],
}

