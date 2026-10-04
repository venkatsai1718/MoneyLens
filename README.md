# MoneyLens

Premium investment calculators for Indian investors — SIP, Step-Up SIP, SWP, FD, Lumpsum, RD, PPF, NPS, Goal Planning, CAGR, Inflation, and a side-by-side Compare tool. Everything runs client-side; there is no backend or authentication.

## Stack

- React + TypeScript (Create React App / `react-scripts`)
- Tailwind CSS (near-black, green-accent design system)
- React Router
- Recharts for charts
- jsPDF + jspdf-autotable for PDF export
- Client-side CSV export

## Architecture

- `src/calculations/` — the centralized calculation engine. Every calculator is a pure function that computes month-granular data, aggregates it into year-wise rows, and returns a single normalized `CalculationResult` (see `src/types/calculator.ts`). Summary cards, charts, tables, CSV export, PDF export and the comparison tool all read from this same object — nothing is calculated twice.
- `src/components/ui/` — reusable design-system components (inputs, cards, tables, charts scaffolding, FAQ, disclaimer, export menu).
- `src/charts/` — Recharts wrappers that consume `CalculationResult` data directly.
- `src/pages/` — one page per calculator, plus Home, Compare and Resources.
- `src/utils/` — formatting (Indian Lakh/Crore aware), validation, CSV/PDF export.

## Scripts

```bash
npm start       # dev server
npm run build   # production build
npm test        # runs the calculation-engine test suite (Jest)
```

## Disclaimer

All calculations are estimates based on user-entered assumptions. Expected returns are never guaranteed. This app is for educational and informational purposes and is not investment advice.

claude --resume 5a61bc9a-4da3-4760-8b0b-24df008af107

