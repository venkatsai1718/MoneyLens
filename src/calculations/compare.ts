import type { CalculationResult, ComparisonScenario } from '../types/calculator'

// Multi-series comparison lines are the one place this palette allows more
// than one hue — telling 3-6 scenarios apart at a glance is a functional
// need a single accent color can't meet on its own. All 6 are spread across
// distinct hues (no two are "shades of the same color") and every one clears
// 7:1+ contrast against the near-black card background.
export const SCENARIO_COLORS = ['#20d49a', '#38bdf8', '#fbbf24', '#f87171', '#a3e635', '#e5e5e5']

/**
 * Normalizes a set of already-computed calculator results into comparison
 * scenarios. Each calculator keeps its own calculation mechanics — this
 * layer only packages the common, normalized fields (summary + yearlyData)
 * so the comparison table and chart can render every investment type
 * consistently, without ranking or recommending any of them.
 */
export function compareInvestments(
  entries: { name: string; type: string; result: CalculationResult }[],
): ComparisonScenario[] {
  return entries.map((entry, i) => ({
    id: `${entry.type}-${i}-${Date.now()}`,
    name: entry.name,
    type: entry.type,
    result: entry.result,
    color: SCENARIO_COLORS[i % SCENARIO_COLORS.length],
  }))
}

/** Builds a merged year -> {scenarioName: closingBalance} series for multi-line charts. */
export function buildComparisonSeries(scenarios: ComparisonScenario[]) {
  const maxYears = Math.max(0, ...scenarios.map((s) => s.result.yearlyData.length))
  const rows: Record<string, number | string>[] = []
  for (let y = 1; y <= maxYears; y++) {
    const row: Record<string, number | string> = { year: y }
    for (const s of scenarios) {
      const point = s.result.yearlyData.find((d) => d.year === y)
      row[s.name] = point ? Math.round(point.closingBalance) : (s.result.yearlyData[s.result.yearlyData.length - 1]?.closingBalance ?? 0)
    }
    rows.push(row)
  }
  return rows
}
