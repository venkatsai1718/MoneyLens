/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Near-black minimal palette, modeled on blrstartuparena.com (near-black
        // bg/surface separated mainly by subtle borders, a zinc-gray text scale,
        // one vivid accent) and moneymath.in (the accent itself — a finance-app
        // teal-green, doubling as the "growth" signal). Every pairing below is
        // contrast-checked against these exact backgrounds, not assumed.
        white: '#0a0a0a', // overrides Tailwind's default white — every bg-white/card surface goes near-black
        snow: '#020202', // page background
        platinum: '#262626', // subtle recessed fill (badges, track backgrounds, icon wells, hover states)
        alabaster: '#383838', // secondary-button hover fill / deeper hover state
        carbon: '#20d49a', // primary accent (buttons, CTAs) — 10.3:1 on card bg
        gunmetal: '#5eead4', // accent hover / focus border — brighter, not darker, since the accent is already light
        'on-accent': '#052013', // dark text/icons for use ON the accent surfaces (a bright green needs dark text, not light)
        ink: {
          DEFAULT: '#fafafa', // 19:1 on page/card bg
          soft: '#a3a3a3', // 7.9:1 on card bg
          muted: '#8b8b93', // 5.9:1 on card bg — comfortably above the 4.5:1 minimum
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.12)',
          soft: 'rgba(255, 255, 255, 0.06)',
        },
        slate: '#0a2e1c', // muted-on-accent text (e.g. prominent card sublabels on the green accent) — dark, not light
        // Growth/withdraw/warn: growth intentionally matches the brand accent
        // (green = both "the product" and "positive returns", same convention
        // CRED/Cash App use) — withdraw/warn get their own distinct hues so a
        // donut or badge never relies on lightness alone to read as different.
        accent: {
          growth: '#20d49a', // 10.3:1 on card bg
          withdraw: '#f87171', // 7.2:1 on card bg
          warn: '#fbbf24', // 11.9:1 on card bg
        },
      },
      fontFamily: {
        sans: ['"Manrope"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      // A deliberate type scale: display sizes get tighter line-height and
      // negative tracking (how professionally-set headline type behaves —
      // Tailwind's defaults are tuned for body copy, not large type), while
      // small/body sizes are left at their defaults since they're already
      // used consistently across the app.
      fontSize: {
        '2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        '3xl': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        '4xl': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        '6xl': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0, 0, 0, 0.5), 0 1px 3px 0 rgba(0, 0, 0, 0.4)',
        elevated: '0 12px 32px -8px rgba(32, 212, 154, 0.25), 0 4px 12px -4px rgba(0, 0, 0, 0.6)',
        focus: '0 0 0 3px rgba(94, 234, 212, 0.35)',
        glow: '0 0 0 1px rgba(32, 212, 154, 0.4), 0 8px 24px -6px rgba(32, 212, 154, 0.45)',
        'glow-soft': '0 8px 30px -10px rgba(32, 212, 154, 0.35)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        auroraA: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(5%, -8%) scale(1.12)' },
          '66%': { transform: 'translate(-4%, 5%) scale(0.94)' },
        },
        auroraB: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '40%': { transform: 'translate(-6%, 6%) scale(1.08)' },
          '75%': { transform: 'translate(4%, -4%) scale(0.96)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out both',
        float: 'float 4s ease-in-out infinite',
        auroraA: 'auroraA 22s ease-in-out infinite',
        auroraB: 'auroraB 26s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
