/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: {
          DEFAULT: '#09090B',
          light: '#FAFAFA',
          surface: '#18181B',
          'surface-light': '#FFFFFF',
        },
        primary: {
          DEFAULT: '#CCFF00',
          foreground: '#09090B',
        },
        secondary: {
          DEFAULT: '#FF6B00',
          foreground: '#FFFFFF',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
          muted: '#71717A',
          'primary-light': '#09090B',
          'secondary-light': '#52525B',
          'muted-light': '#A1A1AA',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          light: 'rgba(0, 0, 0, 0.1)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}