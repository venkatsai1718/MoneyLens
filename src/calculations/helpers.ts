import type { MonthlyDataPoint, YearlyDataPoint, InputAssumption } from '../types/calculator'
import { safeNumber } from '../utils/validation'

/**
 * Converts an annual percentage rate to its EFFECTIVE equivalent monthly
 * rate: (1 + annual)^(1/12) - 1.
 *
 * This is deliberately not `annual / 12 / 100` (the "nominal" monthly rate).
 * Dividing by 12 and compounding monthly overstates the real annual growth
 * — e.g. a nominal 12% p.a. divided into a 1%/month rate actually compounds
 * to 12.68% p.a., not 12%. The effective-rate conversion here guarantees
 * that entering "12% annual return" actually grows a lumpsum by exactly
 * 12% over 12 months, which is what users expect that number to mean, and
 * matches how major Indian investment calculators (e.g. Groww) compute it.
 */
export function monthlyRateFromAnnual(annualRatePercent: number): number {
  return Math.pow(1 + annualRatePercent / 100, 1 / 12) - 1
}

/**
 * Generic monthly -> yearly aggregator used by EVERY calculator.
 * This is the single source of truth for year-wise tables, so that
 * summary cards, charts, CSV and PDF all read from the same numbers.
 *
 * Each MonthlyDataPoint must carry *cumulative* invested/withdrawn/interest/
 * balance values; this function derives per-year deltas from those.
 */
export function aggregateYearly(monthly: MonthlyDataPoint[]): YearlyDataPoint[] {
  if (monthly.length === 0) return []
  const totalYears = monthly[monthly.length - 1].year
  const yearly: YearlyDataPoint[] = []

  let prevInvested = 0
  let prevWithdrawn = 0
  let prevInterest = 0
  let prevBalance = 0

  for (let y = 1; y <= totalYears; y++) {
    const monthsInYear = monthly.filter((m) => m.year === y)
    if (monthsInYear.length === 0) continue
    const last = monthsInYear[monthsInYear.length - 1]
    const monthlyAmount = monthsInYear[0].contribution

    const investedTillDate = safeNumber(last.invested)
    const withdrawnTillDate = safeNumber(last.withdrawn ?? 0)
    const interestTillDate = safeNumber(last.interest)
    const closingBalance = Math.max(0, safeNumber(last.balance))

    const isExhausted = last.balance <= 0 && (last.withdrawn ?? 0) > 0

    yearly.push({
      year: y,
      monthlyAmount,
      invested: Math.max(0, investedTillDate - prevInvested),
      withdrawals: last.withdrawn !== undefined ? Math.max(0, withdrawnTillDate - prevWithdrawn) : undefined,
      returns: interestTillDate - prevInterest,
      openingBalance: prevBalance,
      closingBalance,
      totalInvestedTillDate: investedTillDate,
      isExhausted,
    })

    prevInvested = investedTillDate
    prevWithdrawn = withdrawnTillDate
    prevInterest = interestTillDate
    prevBalance = closingBalance
  }

  return yearly
}

/** Discounts a future value back to today's purchasing power. */
export function inflationAdjustedValue(futureValue: number, inflationRatePercent: number, years: number): number {
  if (!inflationRatePercent || inflationRatePercent <= 0) return futureValue
  return futureValue / Math.pow(1 + inflationRatePercent / 100, years)
}

/** Future value of a present-day amount after inflation. */
export function futureInflatedValue(presentValue: number, inflationRatePercent: number, years: number): number {
  if (!inflationRatePercent || inflationRatePercent <= 0) return presentValue
  return presentValue * Math.pow(1 + inflationRatePercent / 100, years)
}

export function formatAssumption(label: string, value: string): InputAssumption {
  return { label, value }
}

/** True when a user-entered optional rate should be treated as "not set". */
export function isInflationEntered(inflationRate: number | null | undefined): inflationRate is number {
  return typeof inflationRate === 'number' && !isNaN(inflationRate) && inflationRate > 0
}
