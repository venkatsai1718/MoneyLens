// Single source of truth for colors that can't be expressed as Tailwind
// classes (Recharts/canvas props need literal values). Mirrors the
// semantic tokens defined in tailwind.config.js — keep the two in sync.
//
// Palette follows the near-black system (see tailwind.config.js). "Invested"
// is deliberately a muted, desaturated steel tone everywhere it appears — it
// is always the baseline/context figure — so whichever series is the actual
// highlight (returns in the donut, portfolio value in the growth chart)
// reads as the vivid, "hero" line by contrast, the way a premium dashboard
// gives a highlighted metric more visual weight than its baseline.

export const CHART_COLORS = {
  surface: '#0a0a0a', // card bg (white)
  border: 'rgba(255,255,255,0.18)',
  borderSoft: 'rgba(255,255,255,0.08)',
  grid: 'rgba(255,255,255,0.08)',
  axisText: '#8b8b93', // ink-muted, 5.9:1 on card bg
  tooltipBg: '#111111',
  tooltipBorder: 'rgba(255,255,255,0.14)',
  textPrimary: '#fafafa', // ink, 19:1
  invested: '#94a3b8', // muted steel — principal/amount put in (baseline), 7.7:1 on card bg
  value: '#5eead4', // mint — total portfolio/corpus value (a third, distinct concept from "returns" alone), 13.4:1 on card bg
  growth: '#20d49a', // expected returns — the brand accent, 10.3:1 on card bg
  withdraw: '#f87171', // muted red, 7.2:1 on card bg
  warn: '#fbbf24', // muted amber, 11.9:1 on card bg
} as const
