/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      dropShadow: {
        'glow-white': '0 0 10px rgba(255, 255, 255, 0.35)',
        'glow-yellow': '0 0 10px rgba(250, 204, 21, 0.35)',
        'glow-amber': '0 0 10px rgba(217, 119, 6, 0.35)',
        'glow-red': '0 0 10px rgba(239, 68, 68, 0.35)',
      },
      boxShadow: {
        'glow-blue': '0 0 15px rgba(37, 99, 235, 0.35)',
        'glow-red': '0 0 15px rgba(239, 68, 68, 0.35)',
      },
      animation: {
        'bounce': 'bounce 2s infinite',
        'bounce-slow': 'bounce 3s infinite',
        'pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-reverse': 'spin-reverse 1s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'ellipsis': 'ellipsis 1.4s infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '0.15' },
        },
        'spin-reverse': {
          'to': { transform: 'rotate(-360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        ellipsis: {
          '0%': { opacity: '0' },
          '25%': { opacity: '1' },
          '50%': { opacity: '0' },
          '100%': { opacity: '0' },
        },
      },
      backgroundImage: {
        'dots-pattern': 'radial-gradient(#ffffff33 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(ellipse 50% 50% at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif']
      },
      colors: {
        'primary': '#1a365d',
        'secondary': '#2d3748'
      }
    },
  },
  plugins: [],
} 