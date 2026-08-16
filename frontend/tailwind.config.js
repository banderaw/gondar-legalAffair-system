/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a365d',
          light: '#2c5282',
          dark: '#1a365d',
        },
        secondary: {
          DEFAULT: '#2c5282',
        },
        background: '#f7fafc',
        surface: '#ffffff',
        accent: {
          DEFAULT: '#c05621',
        },
        success: {
          DEFAULT: '#2f855a',
          light: '#c6f6d5',
          dark: '#2f855a',
        },
        warning: {
          DEFAULT: '#d69e2e',
          light: '#fefcbf',
          dark: '#d69e2e',
        },
        danger: {
          DEFAULT: '#c53030',
          light: '#fed7d7',
          dark: '#c53030',
        },
        text: {
          primary: '#1a202c',
          secondary: '#4a5568',
        },
        border: '#e2e8f0',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'h1': ['2.5rem', { lineHeight: '3rem', fontWeight: '600' }],
        'h2': ['2rem', { lineHeight: '2.25rem', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'h4': ['1.25rem', { lineHeight: '1.5rem', fontWeight: '500' }],
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'caption': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
      },
      spacing: {
        '0.5': '0.5rem',
        '1': '1rem',
        '1.5': '1.5rem',
        '2': '2rem',
        '3': '3rem',
        '4': '4rem',
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        'elevated': '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
