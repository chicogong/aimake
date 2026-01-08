/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./frontend-components/**/*.{js,ts,jsx,tsx}",
    "./landing-page.html",
  ],
  theme: {
    extend: {
      colors: {
        // Sonic Blue - Primary Color System
        primary: {
          DEFAULT: '#1A6BA0',
          light: '#2D88C4',
          dark: '#145783',
          50: '#E6F2F8',
          100: '#CCE5F1',
          200: '#99CBE3',
          300: '#66B1D5',
          400: '#3397C7',
          500: '#1A6BA0',
          600: '#155680',
          700: '#104060',
          800: '#0B2B40',
          900: '#051520',
        },
        // Audio Orange - Accent Color System
        accent: {
          DEFAULT: '#E85D00',
          light: '#FF7C2E',
          dark: '#C44F00',
          50: '#FFF3E6',
          100: '#FFE7CC',
          200: '#FFCF99',
          300: '#FFB766',
          400: '#FF9F33',
          500: '#E85D00',
          600: '#BA4A00',
          700: '#8B3800',
          800: '#5D2500',
          900: '#2E1300',
        },
        // Neutral Colors (enhanced)
        slate: {
          DEFAULT: '#64748B',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      boxShadow: {
        'primary-sm': '0 1px 2px 0 rgba(26, 107, 160, 0.05)',
        'primary-md': '0 4px 6px -1px rgba(26, 107, 160, 0.1), 0 2px 4px -2px rgba(26, 107, 160, 0.1)',
        'primary-lg': '0 10px 15px -3px rgba(26, 107, 160, 0.1), 0 4px 6px -4px rgba(26, 107, 160, 0.1)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
