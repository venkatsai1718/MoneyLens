import type { CalculationResult, YearlyDataPoint } from '../types/calculator'
import { formatAssumption } from './helpers'
import { clampNonNegative } from '../utils/validation'
import { formatINR } from '../utils/format'

export interface InflationInput {
  currentAmount: number
  inflationRatePercent: number
  years: number
}

export interface InflationOutput extends CalculationResult {
  futureAmountRequired: number
  equivalentPurchasingPower: number
}

/**
 * Projects how much a present-day amount will cost in the future, and what
 * today's amount will be "worth" in future purchasing-power terms.
 */
export function calculateInflation(input: InflationInput): InflationOutput {
  const currentAmount = clampNonNegative(input.currentAmount)
  const rate = clampNonNegative(input.inflationRatePercent)
  const years = Math.max(1, Math.round(clampNonNegative(input.years) || 1))

  const futureAmountRequired = currentAmount * Math.pow(1 + rate / 100, years)
  const equivalentPurchasingPower = currentAmount / Math.pow(1 + rate / 100, years)

  const yearlyData: YearlyDataPoint[] = []
  let prevFuture = currentAmount
  for (let y = 1; y <= years; y++) {
    const futureValue = currentAmount * Math.pow(1 + rate / 100, y)
    yearlyData.push({
      year: y,
      invested: 0,
      returns: futureValue - prevFuture,
      closingBalance: futureValue,
      totalInvestedTillDate: currentAmount,
      openingBalance: prevFuture,
    })
    prevFuture = futureValue
  }

  return {
    calculatorName: 'Inflation',
    futureAmountRequired,
    equivalentPurchasingPower,
    summary: {
      totalInvested: currentAmount,
      totalReturns: futureAmountRequired - currentAmount,
      finalValue: futureAmountRequired,
    },
    monthlyData: [],
    yearlyData,
    assumptions: [
      formatAssumption('Current Amount', formatINR(currentAmount)),
      formatAssumption('Inflation Rate', `${rate}%`),
      formatAssumption('Duration', `${years} Years`),
    ],
    inflationApplied: true,
    inflationRate: rate,
  }
}
