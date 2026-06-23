/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        google: {
          blue: {
            DEFAULT: '#1a73e8',
            light: '#e8f0fe',
            dark: '#1557b0',
            bright: '#8ab4f8'
          },
          red: {
            DEFAULT: '#ea4335',
            light: '#fce8e6',
            dark: '#c5221f',
            bright: '#f28b82'
          },
          yellow: {
            DEFAULT: '#fbbc05',
            light: '#fef7e0',
            dark: '#b06000',
            bright: '#fdd663'
          },
          green: {
            DEFAULT: '#34a853',
            light: '#e6f4ea',
            dark: '#137333',
            bright: '#81c995'
          },
          gray: {
            50: '#f8f9fa',
            100: '#f1f3f4',
            200: '#e8eaed',
            300: '#dadce0',
            400: '#bdc1c6',
            500: '#9aa0a6',
            600: '#70757a',
            700: '#5f6368',
            800: '#3c4043',
            900: '#202124'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.15) 100%)',
        'glass-dark-gradient': 'linear-gradient(135deg, rgba(30, 30, 30, 0.6) 0%, rgba(30, 30, 30, 0.35) 100%)',
        'gsa-gradient': 'linear-gradient(135deg, #ea4335 0%, #1a73e8 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
        'google-card': '0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15)',
        'google-card-hover': '0 1px 3px 0 rgba(60, 64, 67, 0.3), 0 4px 8px 3px rgba(60, 64, 67, 0.15)',
      }
    },
  },
  plugins: [],
}
