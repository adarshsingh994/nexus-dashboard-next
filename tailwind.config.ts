import type { Config } from "tailwindcss";
import type { PluginAPI } from 'tailwindcss/types/config';

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--md-background)",
        surface: "var(--md-surface)",
        primary: {
          DEFAULT: "var(--md-primary)",
          light: "var(--md-primary-light)",
          dark: "var(--md-primary-dark)",
        },
        secondary: "var(--md-secondary)",
        error: "var(--md-error)",
        "on-primary": "var(--md-on-primary)",
        "on-secondary": "var(--md-on-secondary)",
        "on-background": "var(--md-on-background)",
        "on-surface": "var(--md-on-surface)",
        "on-error": "var(--md-on-error)",
      },
      boxShadow: {
        'elevation-1': 'var(--md-elevation-1)',
        'elevation-2': 'var(--md-elevation-2)',
        'elevation-3': 'var(--md-elevation-3)',
        'elevation-4': 'var(--md-elevation-4)',
      },
      transitionProperty: {
        'shadow': 'box-shadow',
      },
      transitionTimingFunction: {
        'material': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        'material': '200ms',
        'material-emphasized': '300ms',
      },
      keyframes: {
        loading: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.35' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'zoom-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'slide-in-bottom': {
          '0%': { transform: 'translateY(10%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'slide-in-top': {
          '0%': { transform: 'translateY(-10%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        'loading': 'loading 1s ease-in-out infinite',
        'ripple': 'ripple 0.8s linear',
        'fade-in': 'fade-in 200ms ease-out',
        'zoom-in': 'zoom-in 200ms ease-out',
        'slide-in-bottom': 'slide-in-bottom 200ms ease-out',
        'slide-in-top': 'slide-in-top 200ms ease-out'
      },
      fontFamily: {
        'geist-sans': ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        'geist-mono': ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [
    function({ addUtilities }: PluginAPI) {
      addUtilities({
        '.animate-in': {
          'animation-fill-mode': 'forwards',
          'animation-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
      });
    },
  ],
} satisfies Config;
