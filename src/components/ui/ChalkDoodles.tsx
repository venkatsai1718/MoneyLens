import React from 'react'

type DoodleType =
  | 'coin'
  | 'cashBundle'
  | 'briefcase'
  | 'wallet'
  | 'piggyBank'
  | 'clock'
  | 'bank'
  | 'safe'
  | 'coinStack'
  | 'ledger'
  | 'abacus'
  | 'formula'
  | 'tree'
  | 'barChart'
  | 'lineChart'
  | 'pieChart'
  | 'bulb'
  | 'rocket'
  | 'trophy'
  | 'arrow'
  | 'percent'
  | 'target'
  | 'chest'
  | 'calendar'
  | 'growthArrow'
  | 'spreadsheet'
  | 'currencySymbol'
  | 'moneyBag'

interface Placement {
  type: DoodleType
  x: number
  y: number
  rotate: number
  scale: number
  opacity: number
}

// Hand-placed — edit freely. Canvas is 1040 x 700 (the viewBox on the
// <svg> below), so x/y are just coordinates in that space (0,0 = top-left).
// `rotate` is degrees, `scale` is a size multiplier (1 = the icon's native
// ~40x40 size). `opacity` is per-icon (0-1) and multiplies with the whole
// sheet's own opacity (set on the wrapping <div> below), so 1 here means
// "as visible as the sheet allows," not "fully opaque." Add, remove or
// reposition entries as you like; every icon type below is available in
// RENDERERS further down this file.
const PLACEMENTS: Placement[] = [
  // Row 1 (y ~145-200)
  { type: 'coin', x: 74, y: 200, rotate: -18, scale: 1, opacity: 1 },
  { type: 'trophy', x: 385, y: 175, rotate: 7, scale: 1.2, opacity: 1 },
  { type: 'clock', x: 520, y: 150, rotate: 6, scale: 1.4, opacity: 1 },
  { type: 'tree', x: 817, y: 165, rotate: 4, scale: 1.1, opacity: 0.8 },
  { type: 'ledger', x: 925, y: 145, rotate: -4, scale: 1.4, opacity: 1 },

  // Row 2 (y ~265-300)
  { type: 'spreadsheet', x: 335, y: 350, rotate: 5, scale: 1.25, opacity: 0.8 },
  { type: 'growthArrow', x: 630, y: 270, rotate: 8, scale: 2.5, opacity: 0.8 },
  { type: 'currencySymbol', x: 800, y: 300, rotate: -5, scale: 2, opacity: 1 },
  { type: 'rocket', x: 1000, y: 265, rotate: 20, scale: 0.85, opacity: 0.8 },

  // Row 3 (y ~370-420)
  { type: 'bulb', x: 148, y: 370, rotate: -8, scale: 2, opacity: 1 },
  { type: 'formula', x: 300, y: 420, rotate: -17, scale: 0.65, opacity: 1 },
  { type: 'barChart', x: 705, y: 415, rotate: -8, scale: 1.25, opacity: 1 },
  { type: 'pieChart', x: 900, y: 420, rotate: 5, scale: 2.5, opacity: 0.8 },

  // Row 4 (y ~480-545)
  { type: 'coinStack', x: 15, y: 515, rotate: -9, scale: 1.15, opacity: 0.75 },
  { type: 'lineChart', x: 350, y: 490, rotate: 8, scale: 1.4, opacity: 1 },
  { type: 'briefcase', x: 450, y: 540, rotate: -7, scale: 0.9, opacity: 1 },
  { type: 'target', x: 530, y: 480, rotate: 4, scale: 1.4, opacity: 0.75 },
  { type: 'abacus', x: 680, y: 545, rotate: -13, scale: 1.5, opacity: 1 },
  { type: 'calendar', x: 820, y: 485, rotate: 6, scale: 0.95, opacity: 1 },
]

// Bars/slices/canopies are filled with hand-drawn diagonal hatching — like
// chalk scribbled back and forth to shade an area — rather than a flat
// outline, which is what actually reads as "authentic chalkboard" instead
// of a thin vector line icon.
function Hatch({ d }: { d: string }) {
  return <path d={d} fill="url(#chalk-hatch)" stroke="currentColor" />
}

function Coin() {
  return (
    <g>
      <circle cx="20" cy="20" r="16" />
      <circle cx="20" cy="20" r="11.5" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180
        const x1 = 20 + Math.cos(a) * 16.5
        const y1 = 20 + Math.sin(a) * 16.5
        const x2 = 20 + Math.cos(a) * 19
        const y2 = 20 + Math.sin(a) * 19
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
      })}
      <text x="20" y="25" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor" stroke="none" fontFamily="Manrope, Arial, sans-serif">
        ₹
      </text>
    </g>
  )
}

function CashBundle() {
  return (
    <g>
      <rect x="2" y="8" width="38" height="20" rx="2" />
      <rect x="6" y="12" width="30" height="12" rx="1.5" />
      <circle cx="21" cy="18" r="4" />
      <path d="M8 2 L34 2 L38 8 L4 8 Z" />
    </g>
  )
}

function Briefcase() {
  return (
    <g>
      <path d="M14 12 V7 a3 3 0 0 1 3-3 h6 a3 3 0 0 1 3 3 v5" />
      <rect x="2" y="12" width="36" height="24" rx="3" />
      <path d="M2 22 H38" />
      <rect x="17" y="19" width="6" height="6" rx="1" />
    </g>
  )
}

function Wallet() {
  return (
    <g>
      <rect x="2" y="10" width="34" height="24" rx="3" />
      <path d="M2 16 L18 3 L34 16" />
      <circle cx="26" cy="22" r="2.4" />
      <path d="M30 6 L40 10 L36 18" />
      <text x="35" y="12" fontSize="8" fontWeight="700" fill="currentColor" stroke="none" fontFamily="Manrope, Arial, sans-serif">
        $
      </text>
    </g>
  )
}

function PiggyBank() {
  return (
    <g>
      <ellipse cx="18" cy="24" rx="15" ry="11" />
      <ellipse cx="32" cy="23" rx="4.2" ry="3.4" />
      <circle cx="33" cy="23" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="31" cy="24" r="0.6" fill="currentColor" stroke="none" />
      <path d="M23 13 L20 6 L28 10 Z" />
      <circle cx="27" cy="18" r="1.3" fill="currentColor" stroke="none" />
      <path d="M13 13 H19" />
      <path d="M3 19 Q1 15 5 14 Q8 13 6 17" />
      <path d="M8 34 V39 M15 35 V40 M23 35 V40 M30 34 V39" />
    </g>
  )
}

function Clock() {
  return (
    <g>
      <circle cx="20" cy="22" r="15" />
      <path d="M20 22 V13 M20 22 L26 26" />
      <path d="M8 8 L3 3 M32 8 L37 3" />
      <path d="M3 3 A6 6 0 0 1 10 6" />
      <path d="M37 3 A6 6 0 0 0 30 6" />
      <path d="M20 9 V11 M20 33 V35 M7 22 H5 M35 22 H33" />
    </g>
  )
}

function Bank() {
  return (
    <g>
      <Hatch d="M2 14 L20 3 L38 14 Z" />
      <path d="M2 14 H38" />
      <path d="M6 14 V30 M14 14 V30 M20 14 V30 M26 14 V30 M34 14 V30" />
      <path d="M2 30 H38" />
      <path d="M0 36 H40" />
    </g>
  )
}

function Safe() {
  return (
    <g>
      <rect x="3" y="3" width="34" height="34" rx="3" />
      <circle cx="20" cy="20" r="9" />
      <circle cx="20" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <path d="M20 20 L20 13" />
      <path d="M29 8 L33 8 M29 12 L33 12" />
      <path d="M7 33 V37 M33 33 V37" />
    </g>
  )
}

function CoinStack() {
  return (
    <g>
      <ellipse cx="20" cy="31" rx="16" ry="5" />
      <path d="M4 31 V24 M36 31 V24" />
      <ellipse cx="20" cy="24" rx="16" ry="5" />
      <path d="M4 24 V17" />
      <path d="M36 24 V17" />
      <ellipse cx="20" cy="17" rx="16" ry="5" />
      <path d="M4 17 V10" />
      <path d="M36 17 V10" />
      <Hatch d="M4 10 a16 5 0 1 0 32 0 a16 5 0 1 0 -32 0" />
    </g>
  )
}

function Ledger() {
  return (
    <g>
      <path d="M6 2 H34 V33 L30 37 L26 33 L22 37 L18 33 L14 37 L10 33 L6 37 Z" />
      <path d="M11 10 H29 M11 16 H29 M11 22 H20" />
      <text x="24" y="28" fontSize="9" fontWeight="700" fill="currentColor" stroke="none" fontFamily="Manrope, Arial, sans-serif">
        ₹
      </text>
    </g>
  )
}

function Abacus() {
  return (
    <g>
      <rect x="2" y="4" width="36" height="30" rx="2" />
      <path d="M11 4 V34 M20 4 V34 M29 4 V34" />
      <circle cx="11" cy="13" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="11" cy="25" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="20" cy="11" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="20" cy="27" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="29" cy="17" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="29" cy="27" r="2.6" fill="currentColor" stroke="none" />
    </g>
  )
}

function Formula() {
  return <path d="M32 5 H9 L20 20 L9 35 H32" />
}

function Tree() {
  return (
    <g>
      <Hatch d="M20 3 C12 3 8 9 10 15 C6 15 4 21 9 24 C7 28 11 32 16 30 C17 33 18 35 20 35 Z" />
      <path d="M20 3 C28 3 32 9 30 15 C34 15 36 21 31 24 C33 28 29 32 24 30 C23 33 22 35 20 35" />
      <path d="M20 35 V27" />
      <path d="M20 35 L13 40 M20 35 L27 40 M20 35 V41" />
    </g>
  )
}

function BarChart() {
  return (
    <g>
      <path d="M2 36 L2 4 M2 36 L38 36" />
      <Hatch d="M6 36 H12 V26 H6 Z" />
      <Hatch d="M15 36 H21 V18 H15 Z" />
      <Hatch d="M24 36 H30 V10 H24 Z" />
      <path d="M30 10 L36 4 M30 4 H36 V10" />
    </g>
  )
}

function LineChart() {
  return (
    <g>
      <path d="M2 36 L2 4 M2 36 L38 36" />
      <path d="M6 28 L13 22 L19 27 L25 15 L31 19 L36 6" />
      <path d="M29 6 H36 V13" />
    </g>
  )
}

// Real chart proportions (40/30/20/10-style, like the reference), not equal
// thirds — that's what actually reads as "a real chart" rather than a
// generic geometric icon. Each wedge gets its own texture (hatch,
// crosshatch, dots) so they're still visually distinct from each other
// without breaking from the sheet's monochrome chalk-white palette.
function PieChart() {
  return (
    <g>
      <path d="M20 20 L20 4 A16 16 0 0 1 29.4 32.9 Z" fill="url(#chalk-hatch)" stroke="currentColor" />
      <path d="M20 20 L29.4 32.9 A16 16 0 0 1 4.8 24.9 Z" fill="url(#chalk-crosshatch)" stroke="currentColor" />
      <path d="M20 20 L4.8 24.9 A16 16 0 0 1 10.6 7.1 Z" fill="url(#chalk-dots)" stroke="currentColor" />
      <path d="M20 20 L10.6 7.1 A16 16 0 0 1 20 4 Z" fill="none" stroke="currentColor" />
      <circle cx="20" cy="20" r="16" strokeWidth="2.6" />
    </g>
  )
}

function Bulb() {
  return (
    <g>
      <path d="M20 3 a11 11 0 0 1 6 20 c-1.5 1.5-2 3-2 5 h-8 c0-2-0.5-3.5-2-5 a11 11 0 0 1 6-20 Z" />
      <path d="M16 32 H24 M17 36 H23" />
      <path d="M17 22 q3-4 6 0" />
      <path d="M20 -1 V2 M6 12 H3 M37 12 H34 M9 3 L11 5 M31 3 L29 5" />
    </g>
  )
}

function Rocket() {
  return (
    <g>
      <path d="M20 2 C27 8 27 20 24 28 H16 C13 20 13 8 20 2 Z" />
      <circle cx="20" cy="14" r="3" />
      <path d="M16 24 L9 32 L16 30 Z" />
      <path d="M24 24 L31 32 L24 30 Z" />
      <path d="M17 28 Q20 38 23 28" />
    </g>
  )
}

function Trophy() {
  return (
    <g>
      <path d="M11 4 H29 V14 a9 9 0 0 1 -18 0 Z" />
      <path d="M11 6 H4 a2 2 0 0 0 -2 2 v2 a6 6 0 0 0 8 5.6" />
      <path d="M29 6 H36 a2 2 0 0 1 2 2 v2 a6 6 0 0 1 -8 5.6" />
      <path d="M20 23 V29 M13 34 H27 L25 29 H15 Z" />
      <path d="M20 9 L21.5 12 H18.5 Z" />
    </g>
  )
}

function Arrow() {
  return (
    <g>
      <path d="M3 34 Q18 30 34 6" />
      <path d="M22 6 H34 V18" />
    </g>
  )
}

function Percent() {
  return (
    <g>
      <circle cx="9" cy="9" r="6.5" />
      <circle cx="29" cy="29" r="6.5" />
      <path d="M31 6 L7 32" />
    </g>
  )
}

function CurrencySymbol() {
  return (
    <g>
      <text x="20" y="30" textAnchor="middle" fontSize="34" fontWeight="700" fill="currentColor" stroke="none" fontFamily="Manrope, Arial, sans-serif">
        ₹
      </text>
      <path d="M4 4 L9 9 M36 4 L31 9 M4 36 L9 31 M36 36 L31 31" />
    </g>
  )
}

function MoneyBag() {
  return (
    <g>
      <path d="M17 12 Q14 6 10 7" />
      <path d="M23 12 Q26 6 30 7" />
      <path d="M20 12 C9 12 5 21 6 28 C7 35 13 38 20 38 C27 38 33 35 34 28 C35 21 31 12 20 12 Z" />
      <path d="M13 12 H27" />
      <path d="M11 25 Q15 23 12 31" />
      <text x="20" y="29" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor" stroke="none" fontFamily="Manrope, Arial, sans-serif">
        ₹
      </text>
    </g>
  )
}

function Target() {
  return (
    <g>
      <circle cx="20" cy="20" r="17" />
      <circle cx="20" cy="20" r="11" />
      <circle cx="20" cy="20" r="4" />
      <path d="M32 8 L20 20" />
      <path d="M24 4 L32 8 L28 16 Z" />
    </g>
  )
}

function Chest() {
  return (
    <g>
      <path d="M2 16 Q20 4 38 16 V32 H2 Z" />
      <path d="M2 16 H38" />
      <rect x="15" y="14" width="10" height="9" rx="1.5" />
      <circle cx="20" cy="18.5" r="1.3" fill="currentColor" stroke="none" />
      <path d="M6 22 H10 M30 22 H34" />
    </g>
  )
}

function Calendar() {
  return (
    <g>
      <rect x="2" y="6" width="36" height="30" rx="2" />
      <path d="M2 15 H38" />
      <path d="M10 2 V9 M30 2 V9" />
      <rect x="9" y="21" width="6" height="6" fill="currentColor" stroke="none" opacity="0.7" />
      <path d="M20 21 H26 M20 27 H26 M31 21 H33 M31 27 H33" />
    </g>
  )
}

function GrowthArrow() {
  return (
    <g>
      <path d="M2 30 L11 21 L17 26 L23 15 L29 19 L37 4" />
      <path d="M27 4 L37 4 L37 13" />
    </g>
  )
}

function Spreadsheet() {
  return (
    <g>
      <rect x="2" y="4" width="36" height="28" rx="2" />
      <Hatch d="M2 4 H38 V12 H2 Z" />
      <path d="M2 20 H38 M2 28 H38" />
      <path d="M14 4 V32 M26 4 V32" />
    </g>
  )
}

const RENDERERS: Record<DoodleType, () => React.ReactElement> = {
  coin: Coin,
  cashBundle: CashBundle,
  briefcase: Briefcase,
  wallet: Wallet,
  piggyBank: PiggyBank,
  clock: Clock,
  bank: Bank,
  safe: Safe,
  coinStack: CoinStack,
  ledger: Ledger,
  abacus: Abacus,
  formula: Formula,
  tree: Tree,
  barChart: BarChart,
  lineChart: LineChart,
  pieChart: PieChart,
  bulb: Bulb,
  rocket: Rocket,
  trophy: Trophy,
  arrow: Arrow,
  percent: Percent,
  target: Target,
  chest: Chest,
  calendar: Calendar,
  growthArrow: GrowthArrow,
  spreadsheet: Spreadsheet,
  currencySymbol: CurrencySymbol,
  moneyBag: MoneyBag,
}

/**
 * A clean, bold line-icon doodle sheet — every icon is money, finance or
 * math themed (coins, cash, a bank, a safe, a ledger, an abacus, a growth
 * tree, charts with hand-hatched fills, a treasure chest, a target, a
 * spreadsheet) — placed via a seeded jittered grid so the scatter is
 * genuinely irregular with no visible rows/columns, at varied sizes. This
 * is deliberately a *clean* execution (single confident stroke, no texture
 * filter) rather than trying to fake rough hand-chalk wobble — closer to a
 * crisp white line-icon set on a blackboard than a scratchy sketch. The
 * near-black page background already IS that blackboard, so this draws
 * straight onto it with no separate image asset.
 */
export function ChalkDoodles({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 h-[92vh] overflow-hidden opacity-[0.16] text-ink ${className}`}>
      <svg
        className="h-full w-full"
        viewBox="0 0 1040 700"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <defs>
          <pattern id="chalk-hatch" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <pattern id="chalk-crosshatch" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" strokeWidth="1" />
            <line x1="0" y1="0" x2="4" y2="0" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <pattern id="chalk-dots" patternUnits="userSpaceOnUse" width="5" height="5">
            <circle cx="2.5" cy="2.5" r="1" fill="currentColor" />
          </pattern>
        </defs>
        {PLACEMENTS.map((p, i) => {
          const Icon = RENDERERS[p.type]
          return (
            <g key={i} opacity={p.opacity} transform={`translate(${p.x} ${p.y}) rotate(${p.rotate}) scale(${p.scale})`}>
              <Icon />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
