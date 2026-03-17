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
        background: '#ffffff',
        foreground: '#050505',
        accent: '#8B5CF6',
        'accent-light': '#A78BFA',
        surface: '#F4F4F5',
        cream: '#FAFAF8',
        sand: '#E8E5DE',
        charcoal: '#2D2D2D',
        vermillion: '#8B5CF6',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        display: ['var(--font-oswald)'],
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        widest: '.25em',
      },
      boxShadow: {
        'soft': '0 2px 20px rgba(0,0,0,0.06)',
        'card': '0 4px 24px rgba(0,0,0,0.08)',
        'glass': '0 8px 32px rgba(139, 92, 246, 0.15)',
        'glow': '0 0 40px rgba(139, 92, 246, 0.3)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(-6px) rotate(-0.5deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        scan: 'scan 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
