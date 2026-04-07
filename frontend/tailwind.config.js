/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b', // Deep Charcoal
        surface: '#18181b',    // Zinc/Charcoal surface
        primary: {
          DEFAULT: '#7c3aed', // Pure Violet/Plum
          hover: '#8b5cf6',
          muted: '#5b21b6',
        },
        secondary: {
          DEFAULT: '#c4b5fd', // Light Mauve
          muted: '#a78bfa',
        },
        accent: {
          DEFAULT: '#e879f9', // Vibrant Fuschia/Plum highlight
          muted: '#d946ef',
        },
        'glass-border': 'rgba(255, 255, 255, 0.08)',
        'glass-bg': 'rgba(24, 24, 27, 0.6)',
      },
      boxShadow: {
        'premium': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'plum-glow': '0 0 20px rgba(124, 58, 237, 0.2)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        'xl': '20px',
        '2xl': '40px',
      }
    },
  },
  plugins: [],
}

