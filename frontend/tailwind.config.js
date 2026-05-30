/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
      },
      fontFamily: {
        sans: ['"SN Pro"', '"Google Sans"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgb(var(--color-accent) / 0.4)',
        'glow-primary': '0 0 20px rgb(var(--color-primary) / 0.15)',
        'glow-warning': '0 0 20px rgb(var(--color-warning) / 0.4)',
        'glow-error': '0 0 20px rgb(var(--color-error) / 0.4)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      transitionProperty: {
        DEFAULT: 'opacity',
      },
      keyframes: {
        'fade-in-out': {
          '0%': { opacity: '0' },
          '10%, 90%': { opacity: '1' },
          '100%': { opacity: '0' },
        }
      },
      animation: {
        'fade-in-out': 'fade-in-out 2s ease-in-out forwards',
      }
    },
  },
  plugins: [],
}
