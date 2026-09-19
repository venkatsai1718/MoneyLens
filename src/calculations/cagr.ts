import type { CalculationResult, MonthlyDataPoint } from '../types/calculator'
import { aggregateYearly, monthlyRateFromAnnual, formatAssumption } from './helpers'
import { clampNonNegative } from '../utils/validation'
import { formatINR } from '../utils/format'

export interface CAGRInput {
  initialValue: number
  finalValue: number
  years: number
}

export interface CAGROutput extends CalculationResult {
  cagrPercent: number
}

/** Compound Annual Growth Rate between two known values over a period. */
export function calculateCAGR(input: CAGRInput): CAGROutput {
  const initialValue = Math.max(0.01, clampNonNegative(input.initialValue))
  const finalValue = clampNonNegative(input.finalValue)
  const years = Math.max(0.1, clampNonNegative(input.years) || 1)

  const cagrPercent = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100
  const monthlyGrowth = monthlyRateFromAnnual(cagrPercent)

  const totalMonths = Math.max(1, Math.round(years * 12))
  const monthlyData: MonthlyDataPoint[] = []
  for (let m = 1; m <= totalMonths; m++) {
    const balance = initialValue * Math.pow(1 + monthlyGrowth, m)
    monthlyData.push({
      month: m,
      year: Math.ceil(m / 12),
      invested: initialValue,
      interest: balance - initialValue,
      balance,
      contribution: m === 1 ? initialValue : 0,
    })
  }

  const yearlyData = aggregateYearly(monthlyData)

  return {
    calculatorName: 'CAGR',
    cagrPercent,
    summary: {
      totalInvested: initialValue,
      totalReturns: finalValue - initialValue,
      finalValue,
    },
    monthlyData,
    yearlyData,
    assumptions: [
      formatAssumption('Initial Value', formatINR(initialValue)),
      formatAssumption('Final Value', formatINR(finalValue)),
      formatAssumption('Duration', `${years} Years`),
    ],
    inflationApplied: false,
  }
}
