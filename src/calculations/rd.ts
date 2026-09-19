import type { CalculationResult, MonthlyDataPoint } from '../types/calculator'
import { aggregateYearly, inflationAdjustedValue, formatAssumption, isInflationEntered } from './helpers'
import { clampNonNegative } from '../utils/validation'
import { formatINR } from '../utils/format'
import type { CompoundingFrequency } from './fd'

export interface RDInput {
  monthlyDeposit: number
  annualRatePercent: number
  tenureMonths: number
  compoundingFrequency: CompoundingFrequency
  inflationRate?: number | null
}

const PERIODS_PER_YEAR: Record<CompoundingFrequency, number> = {
  monthly: 12,
  quarterly: 4,
  'half-yearly': 2,
  yearly: 1,
}

/**
 * Recurring Deposit, using the standard actuarial RD maturity formula banks
 * actually use for monthly deposits compounded at a (usually quarterly)
 * period boundary:
 *
 *   M = R × [ (1+i)^n − 1 ] / [ 1 − (1+i)^(−1/k) ]
 *
 * where i is the periodic rate, n is the number of elapsed periods, and k is
 * the number of months per compounding period. This is verified against a
 * published real-world example (₹5,000/month, 8% p.a., quarterly, 12
 * months → ₹62,647) and, for monthly compounding (k=1), reduces exactly to
 * the same annuity-due formula the SIP calculator uses — confirming it's
 * mathematically consistent, not a one-off approximation.
 *
 * A naive "add deposit then compound the running balance every k months"
 * simulation looks plausible but overstates the maturity value by ~0.6-1%
 * because it doesn't correctly weight each deposit's partial first period.
 */
export function calculateRD(input: RDInput): CalculationResult {
  const deposit = clampNonNegative(input.monthlyDeposit)
  const rate = clampNonNegative(input.annualRatePercent)
  const totalMonths = Math.max(1, Math.round(clampNonNegative(input.tenureMonths) || 1))
  const periodsPerYear = PERIODS_PER_YEAR[input.compoundingFrequency]
  const monthsPerPeriod = 12 / periodsPerYear
  const periodicRate = rate / 100 / periodsPerYear

  const denom = periodicRate === 0 ? 0 : 1 - Math.pow(1 + periodicRate, -1 / monthsPerPeriod)

  function balanceAtMonth(m: number): number {
    if (m <= 0) return 0
    if (periodicRate === 0) return deposit * m
    const n = m / monthsPerPeriod
    return (deposit * (Math.pow(1 + periodicRate, n) - 1)) / denom
  }

  const monthlyData: MonthlyDataPoint[] = []
  let invested = 0

  for (let m = 1; m <= totalMonths; m++) {
    invested += deposit
    const balance = balanceAtMonth(m)
    monthlyData.push({
      month: m,
      year: Math.ceil(m / 12),
      invested,
      interest: balance - invested,
      balance,
      contribution: deposit,
    })
  }

  const yearlyData = aggregateYearly(monthlyData)
  const maturityValue = monthlyData[monthlyData.length - 1]?.balance ?? 0
  const totalDeposited = invested
  const interestEarned = maturityValue - totalDeposited
  const years = totalMonths / 12
  const inflationApplied = isInflationEntered(input.inflationRate)
  const inflationAdjusted = inflationApplied ? inflationAdjustedValue(maturityValue, input.inflationRate!, years) : undefined

  return {
    calculatorName: 'Recurring Deposit',
    summary: {
      totalInvested: totalDeposited,
      totalReturns: interestEarned,
      finalValue: maturityValue,
      inflationAdjustedValue: inflationAdjusted,
    },
    monthlyData,
    yearlyData,
    assumptions: [
      formatAssumption('Monthly Deposit', formatINR(deposit)),
      formatAssumption('Interest Rate', `${rate}% p.a.`),
      formatAssumption('Tenure', `${totalMonths} Months`),
      formatAssumption('Compounding', input.compoundingFrequency),
      ...(inflationApplied ? [formatAssumption('Inflation Rate', `${input.inflationRate}%`)] : []),
    ],
    inflationApplied,
    inflationRate: inflationApplied ? input.inflationRate! : undefined,
  }
}
