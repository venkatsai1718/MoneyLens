import type { CalculationResult, MonthlyDataPoint } from '../types/calculator'
import { aggregateYearly, monthlyRateFromAnnual, inflationAdjustedValue, formatAssumption, isInflationEntered } from './helpers'
import { clampNonNegative } from '../utils/validation'
import { formatINR } from '../utils/format'

export interface LumpsumInput {
  initialInvestment: number
  annualReturnPercent: number
  years: number
  inflationRate?: number | null
}

/** One-time investment compounded monthly. */
export function calculateLumpsum(input: LumpsumInput): CalculationResult {
  const principal = clampNonNegative(input.initialInvestment)
  const annualReturn = clampNonNegative(input.annualReturnPercent)
  const years = Math.max(1, Math.round(clampNonNegative(input.years) || 1))
  const totalMonths = years * 12
  const r = monthlyRateFromAnnual(annualReturn)

  const monthlyData: MonthlyDataPoint[] = []
  let balance = principal

  for (let m = 1; m <= totalMonths; m++) {
    balance = balance * (1 + r)
    monthlyData.push({
      month: m,
      year: Math.ceil(m / 12),
      invested: principal,
      interest: balance - principal,
      balance,
      contribution: m === 1 ? principal : 0,
    })
  }

  const yearlyData = aggregateYearly(monthlyData)
  const finalValue = balance
  const totalReturns = finalValue - principal
  const inflationApplied = isInflationEntered(input.inflationRate)
  const inflationAdjusted = inflationApplied ? inflationAdjustedValue(finalValue, input.inflationRate!, years) : undefined

  return {
    calculatorName: 'Lumpsum',
    summary: {
      totalInvested: principal,
      totalReturns,
      finalValue,
      inflationAdjustedValue: inflationAdjusted,
    },
    monthlyData,
    yearlyData,
    assumptions: [
      formatAssumption('Initial Investment', formatINR(principal)),
      formatAssumption('Expected Annual Return', `${annualReturn}%`),
      formatAssumption('Investment Period', `${years} Years`),
      ...(inflationApplied ? [formatAssumption('Inflation Rate', `${input.inflationRate}%`)] : []),
    ],
    inflationApplied,
    inflationRate: inflationApplied ? input.inflationRate! : undefined,
  }
}
