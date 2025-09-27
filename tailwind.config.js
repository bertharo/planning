/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg:       "rgb(var(--bg) / <alpha-value>)",
        fg:       "rgb(var(--fg) / <alpha-value>)",
        muted:    "rgb(var(--muted) / <alpha-value>)",
        card:     "rgb(var(--card) / <alpha-value>)",
        border:   "rgb(var(--border) / <alpha-value>)",
        accent:   {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          fg:      "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        ring:     "rgb(var(--ring) / <alpha-value>)",
        success:  "rgb(var(--success) / <alpha-value>)",
        warning:  "rgb(var(--warning) / <alpha-value>)",
        destructive: "rgb(var(--destructive) / <alpha-value>)",
        fgMuted:  "rgb(var(--fg-muted) / <alpha-value>)",
        // Legacy mappings for existing components
        background: "rgb(var(--bg) / <alpha-value>)",
        foreground: "rgb(var(--fg) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--fg) / <alpha-value>)",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.06), 0 6px 24px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        '2xl': '1rem',
        xl: '0.75rem',
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-in-scale': 'fadeInScale 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'slide-left': 'slideLeft 0.2s ease-out',
        'slide-right': 'slideRight 0.2s ease-out',
        'stagger': 'stagger 0.1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        stagger: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
}
