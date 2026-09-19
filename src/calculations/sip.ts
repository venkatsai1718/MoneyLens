import type { CalculationResult, MonthlyDataPoint } from '../types/calculator'
import { aggregateYearly, monthlyRateFromAnnual, inflationAdjustedValue, formatAssumption, isInflationEntered } from './helpers'
import { clampNonNegative } from '../utils/validation'
import { formatINR } from '../utils/format'

export interface SIPInput {
  monthlyInvestment: number
  initialLumpsum?: number
  annualReturnPercent: number
  years: number
  inflationRate?: number | null
}

/**
 * SIP future value, computed at monthly granularity (contribution first,
 * then growth for that month — i.e. investment made on the 1st).
 */
export function calculateSIP(input: SIPInput): CalculationResult {
  const monthlyInvestment = clampNonNegative(input.monthlyInvestment)
  const initialLumpsum = clampNonNegative(input.initialLumpsum ?? 0)
  const annualReturn = clampNonNegative(input.annualReturnPercent)
  const years = Math.max(1, Math.round(clampNonNegative(input.years) || 1))
  const totalMonths = years * 12
  const r = monthlyRateFromAnnual(annualReturn)

  const monthlyData: MonthlyDataPoint[] = []
  let balance = initialLumpsum
  let invested = initialLumpsum

  for (let m = 1; m <= totalMonths; m++) {
    balance = (balance + monthlyInvestment) * (1 + r)
    invested += monthlyInvestment
    monthlyData.push({
      month: m,
      year: Math.ceil(m / 12),
      invested,
      interest: balance - invested,
      balance,
      contribution: monthlyInvestment,
    })
  }

  const yearlyData = aggregateYearly(monthlyData)
  const finalValue = balance
  const totalInvested = invested
  const totalReturns = finalValue - totalInvested
  const inflationApplied = isInflationEntered(input.inflationRate)
  const inflationAdjusted = inflationApplied ? inflationAdjustedValue(finalValue, input.inflationRate!, years) : undefined

  return {
    calculatorName: 'SIP',
    summary: {
      totalInvested,
      totalReturns,
      finalValue,
      inflationAdjustedValue: inflationAdjusted,
    },
    monthlyData,
    yearlyData,
    assumptions: [
      formatAssumption('Monthly Investment', formatINR(monthlyInvestment)),
      ...(initialLumpsum > 0 ? [formatAssumption('Initial Lumpsum', formatINR(initialLumpsum))] : []),
      formatAssumption('Expected Annual Return', `${annualReturn}%`),
      formatAssumption('Investment Period', `${years} Years`),
      ...(inflationApplied ? [formatAssumption('Inflation Rate', `${input.inflationRate}%`)] : []),
    ],
    inflationApplied,
    inflationRate: inflationApplied ? input.inflationRate! : undefined,
  }
}
