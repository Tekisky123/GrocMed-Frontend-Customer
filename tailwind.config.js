/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // GrocMed Brand Colors (Modern Swap)
        primary: {
          DEFAULT: '#F8800E', // Primary brand orange (Modern)
          light: '#FAA353',
          dark: '#A7461B',    // Dark orange / brown accent
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#63B041', // Primary brand green (Freshness)
          light: '#85C866',
          dark: '#2C691D',    // Dark green accent
          foreground: '#FFFFFF',
        },
        cream: {
          DEFAULT: '#F8F9FA', // Modern Off-White (replaces cream)
          50: '#F8F9FA',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
        },
        neutral: {
          DEFAULT: '#64748B', // Slate 500 (Cool Gray)
          light: '#94A3B8',
          dark: '#475569',
        },
        // Semantic mappings
        background: '#F8F9FA',
        surface: '#FFFFFF',
      },
    }
  },
  plugins: []
}
