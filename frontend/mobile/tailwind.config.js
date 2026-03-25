/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0a0f1a",
          900: "#111827",
          800: "#1e293b",
          700: "#334155",
        },
        brand: {
          orange: "#f97316",
          teal: "#14b8a6",
          danger: "#ef4444",
          warning: "#f59e0b",
          success: "#22c55e",
        },
      },
    },
  },
  plugins: [],
};
