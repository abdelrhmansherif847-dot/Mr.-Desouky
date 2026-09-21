import type { Config } from 'tailwindcss'

/**
 * Design tokens for the Eng. Abdelrhman Desouky educational system.
 *
 * Colour has meaning here — do not add new hues without a reason:
 *   sky   = Learn        deep = Trust        growth = Progress
 *   olive = Identity     alert = Attention   paper/white = Clarity
 *
 * Target visual balance across a page:
 *   ~50% white / soft gray · ~25% deep blue · ~15% sky blue
 *   · ~7% green + olive · ~3% red
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Primary — Sky Blue · "Learn"
        sky: {
          50: '#EEF8FD',
          100: '#D6EEFA',
          200: '#AEDDF5',
          300: '#78C6ED',
          400: '#3FACE1',
          500: '#1597D4', // brand
          600: '#0F79AC',
          700: '#0E6088',
          800: '#114F6E',
          900: '#12425C',
        },
        // Secondary — Deep Blue · "Trust"
        deep: {
          50: '#F1F5F9',
          100: '#DCE5EE',
          200: '#B9CBDC',
          300: '#8AA8C3',
          400: '#5A80A2',
          500: '#356084',
          600: '#1E4C6F',
          700: '#123B5D', // brand
          800: '#0E2F4A',
          900: '#0A2137',
          950: '#061525',
        },
        // Growth — Light Green · "Progress"
        growth: {
          50: '#F1FAF3',
          100: '#DEF3E3',
          200: '#BFE7C9',
          300: '#7BCB8B', // brand
          400: '#5CB771',
          500: '#3F9C57',
          600: '#2F7C44',
          700: '#286238',
          800: '#234E2F',
          900: '#1E4128',
        },
        // Accent — Olive · "Identity" (use sparingly)
        olive: {
          50: '#F6F7EE',
          100: '#EAEDD6',
          200: '#D6DCAF',
          300: '#BCC581',
          400: '#A0AC5B',
          500: '#6F7F32', // brand
          600: '#5C6A2A',
          700: '#485424',
          800: '#3B4321',
          900: '#333A20',
        },
        // Alert — Red · "Attention" (never decorative)
        alert: {
          50: '#FDF3F3',
          100: '#FBE5E5',
          200: '#F7CFCF',
          300: '#EFADAD',
          400: '#E37E7E',
          500: '#D64545', // brand
          600: '#C13535',
          700: '#A22B2B',
          800: '#872828',
          900: '#712626',
        },
        // Neutral — "Clarity"
        paper: '#FFFFFF',
        mist: '#F4F6F7',
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Fluid display sizes — mobile is designed, not squeezed.
        'display-xl': ['clamp(2.5rem, 1.6rem + 4.2vw, 4.5rem)', { lineHeight: '1.04', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.1rem, 1.5rem + 2.9vw, 3.5rem)', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.75rem, 1.35rem + 1.9vw, 2.6rem)', { lineHeight: '1.14', letterSpacing: '-0.02em' }],
        'display-sm': ['clamp(1.4rem, 1.2rem + 1vw, 1.9rem)', { lineHeight: '1.22', letterSpacing: '-0.015em' }],
      },
      maxWidth: {
        prose: '68ch',
        container: '80rem',
      },
      borderRadius: {
        card: '1rem',
        panel: '1.5rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 59, 93, 0.04), 0 8px 24px -12px rgba(18, 59, 93, 0.16)',
        lift: '0 2px 4px rgba(18, 59, 93, 0.05), 0 20px 40px -16px rgba(18, 59, 93, 0.22)',
        ring: '0 0 0 1px rgba(18, 59, 93, 0.08)',
      },
      backgroundImage: {
        'grid-paper':
          'linear-gradient(to right, rgba(18,59,93,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(18,59,93,0.055) 1px, transparent 1px)',
        'grid-paper-dark':
          'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '32px 32px',
        'grid-lg': '48px 48px',
      },
      // Motion system — see src/lib/motion.ts and the MOTION layer in
      // globals.css. Durations and easings are shared across all three.
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'grow-bar': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        // Ambient: slow, low amplitude, peripheral only.
        'ambient-drift': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -10px, 0)' },
        },
        'ambient-breathe': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        // Nav active underline drawing itself in.
        'indicator-in': {
          from: { transform: 'scaleX(0)', opacity: '0' },
          to: { transform: 'scaleX(1)', opacity: '1' },
        },
        // A plotted line drawing itself left to right. Paths carry
        // pathLength="1" so one keyframe serves any length of curve.
        'draw-path': {
          from: { strokeDashoffset: '1' },
          to: { strokeDashoffset: '0' },
        },
        // A plotted point arriving on the curve.
        'plot-point': {
          from: { opacity: '0', transform: 'scale(0.4)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        // A confirmation mark drawing itself, for the moment a sign-in
        // succeeds. Same family as grow-bar: one direction, settling.
        'draw-check': {
          from: { strokeDashoffset: '32' },
          to: { strokeDashoffset: '0' },
        },
        // Mobile drawer.
        'drawer-in': {
          from: { opacity: '0', transform: 'translate3d(0, -8px, 0)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.62s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'grow-bar': 'grow-bar 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
        'ambient-drift': 'ambient-drift 22s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'ambient-drift-slow': 'ambient-drift 32s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'ambient-breathe': 'ambient-breathe 14s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'indicator-in': 'indicator-in 0.32s cubic-bezier(0.16, 1, 0.3, 1) both',
        'draw-path': 'draw-path 1.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'plot-point': 'plot-point 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'draw-check': 'draw-check 0.62s cubic-bezier(0.16, 1, 0.3, 1) both',
        'drawer-in': 'drawer-in 0.32s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      transitionTimingFunction: {
        calm: 'cubic-bezier(0.16, 1, 0.3, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
