import type { CalculationResult, MonthlyDataPoint } from '../types/calculator'
import { aggregateYearly, monthlyRateFromAnnual, inflationAdjustedValue, formatAssumption, isInflationEntered } from './helpers'
import { clampNonNegative } from '../utils/validation'
import { formatINR } from '../utils/format'

export type ContributionTiming = 'start' | 'end'

export interface PPFInput {
  annualContribution: number
  annualRatePercent: number
  years: number
  contributionTiming: ContributionTiming
  inflationRate?: number | null
}

/**
 * PPF, modeled with one contribution per year (at the chosen timing) and the
 * annual rate applied as a smooth monthly-compounding approximation.
 * Actual PPF interest is computed monthly on the lowest balance between the
 * 5th and last day of the month and credited annually — this is a
 * simplified, clearly-labeled illustration, not the exact government method.
 */
export function calculatePPF(input: PPFInput): CalculationResult {
  const contribution = clampNonNegative(input.annualContribution)
  const rate = clampNonNegative(input.annualRatePercent)
  const years = Math.max(1, Math.round(clampNonNegative(input.years) || 1))
  const totalMonths = years * 12
  const monthlyRate = monthlyRateFromAnnual(rate)

  const monthlyData: MonthlyDataPoint[] = []
  let balance = 0
  let invested = 0

  for (let m = 1; m <= totalMonths; m++) {
    const monthOfYear = ((m - 1) % 12) + 1
    if (input.contributionTiming === 'start' && monthOfYear === 1) {
      balance += contribution
      invested += contribution
    }
    balance *= 1 + monthlyRate
    if (input.contributionTiming === 'end' && monthOfYear === 12) {
      balance += contribution
      invested += contribution
    }
    monthlyData.push({
      month: m,
      year: Math.ceil(m / 12),
      invested,
      interest: balance - invested,
      balance,
      contribution: monthOfYear === (input.contributionTiming === 'start' ? 1 : 12) ? contribution : 0,
    })
  }

  const yearlyData = aggregateYearly(monthlyData)
  const maturityValue = balance
  const totalContribution = invested
  const interestEarned = maturityValue - totalContribution
  const inflationApplied = isInflationEntered(input.inflationRate)
  const inflationAdjusted = inflationApplied ? inflationAdjustedValue(maturityValue, input.inflationRate!, years) : undefined

  return {
    calculatorName: 'PPF',
    summary: {
      totalInvested: totalContribution,
      totalReturns: interestEarned,
      finalValue: maturityValue,
      inflationAdjustedValue: inflationAdjusted,
    },
    monthlyData,
    yearlyData,
    assumptions: [
      formatAssumption('Annual Contribution', formatINR(contribution)),
      formatAssumption('Interest Rate (assumed)', `${rate}% p.a.`),
      formatAssumption('Investment Duration', `${years} Years`),
      formatAssumption('Contribution Timing', input.contributionTiming === 'start' ? 'Start of Year' : 'End of Year'),
      ...(inflationApplied ? [formatAssumption('Inflation Rate', `${input.inflationRate}%`)] : []),
    ],
    inflationApplied,
    inflationRate: inflationApplied ? input.inflationRate! : undefined,
  }
}
