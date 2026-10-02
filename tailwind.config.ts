import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#2f475f',
          secondary: '#374f67',
        },
        'dusty-blue': '#9cb6d7',
        'pale-blue': '#edf2f5',
        cream: '#fdf8d9',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Impact', 'Arial Narrow', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'stripe-pattern': `repeating-linear-gradient(
          90deg,
          transparent,
          transparent 40px,
          rgba(156,182,215,0.08) 40px,
          rgba(156,182,215,0.08) 41px
        )`,
      },
      boxShadow: {
        'soft': '0 2px 16px 0 rgba(47,71,95,0.08)',
        'card': '0 4px 24px 0 rgba(47,71,95,0.10)',
        'float': '0 8px 32px 0 rgba(47,71,95,0.14)',
      },
      borderRadius: {
        pill: '9999px',
        card: '1.25rem',
      },
    },
  },
  plugins: [],
}

export default config
