/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slideIn: {
          '0%': {
            transform: 'translateX(-100%)'
          },

          '100%': {
            transform: 'translateX(0)'
          }
        }
      },
      animation: { // If don't want to define in theme than directly use as className = animate-[slideIn_0.5s_linear]
        slideIn: 'slideIn 0.5s linear',
      }
    },
  },
  plugins: [require("daisyui")],
}

