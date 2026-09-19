import type { CalculationResult, MonthlyDataPoint } from '../types/calculator'
import { aggregateYearly, monthlyRateFromAnnual, inflationAdjustedValue, formatAssumption, isInflationEntered } from './helpers'
import { clampNonNegative } from '../utils/validation'
import { formatINR } from '../utils/format'

export interface SWPInput {
  initialCorpus: number
  annualReturnPercent: number
  monthlyWithdrawal: number
  years: number
  annualIncreasePercent?: number
  inflationRate?: number | null
}

/**
 * Systematic Withdrawal Plan. Growth is applied first each month, then the
 * withdrawal is deducted (capped at the available balance) so the corpus
 * never goes negative. Once exhausted, withdrawals stop permanently.
 */
export function calculateSWP(input: SWPInput): CalculationResult {
  const initialCorpus = clampNonNegative(input.initialCorpus)
  const annualReturn = clampNonNegative(input.annualReturnPercent)
  const years = Math.max(1, Math.round(clampNonNegative(input.years) || 1))
  const annualIncrease = clampNonNegative(input.annualIncreasePercent ?? 0)
  const totalMonths = years * 12
  const r = monthlyRateFromAnnual(annualReturn)

  const monthlyData: MonthlyDataPoint[] = []
  let balance = initialCorpus
  let currentWithdrawal = clampNonNegative(input.monthlyWithdrawal)
  let cumulativeWithdrawn = 0
  let exhaustionYear: number | null = null
  let exhaustionMonth: number | null = null
  let exhausted = false

  for (let m = 1; m <= totalMonths; m++) {
    const yearIndex = Math.ceil(m / 12)
    if (m > 1 && (m - 1) % 12 === 0 && annualIncrease > 0) {
      currentWithdrawal = currentWithdrawal * (1 + annualIncrease / 100)
    }

    let actualWithdrawal = 0
    if (!exhausted) {
      balance = balance * (1 + r)
      actualWithdrawal = Math.min(currentWithdrawal, balance)
      balance -= actualWithdrawal
      cumulativeWithdrawn += actualWithdrawal
      if (balance <= 0.01) {
        balance = 0
        exhausted = true
        exhaustionYear = yearIndex
        exhaustionMonth = m
      }
    }

    const cumulativeInterest = balance - initialCorpus + cumulativeWithdrawn

    monthlyData.push({
      month: m,
      year: yearIndex,
      invested: initialCorpus,
      withdrawn: cumulativeWithdrawn,
      interest: cumulativeInterest,
      balance,
      contribution: 0,
    })
  }

  const yearlyData = aggregateYearly(monthlyData)
  const remainingCorpus = Math.max(0, balance)
  const totalReturns = remainingCorpus - initialCorpus + cumulativeWithdrawn
  const inflationApplied = isInflationEntered(input.inflationRate)
  const inflationAdjusted = inflationApplied ? inflationAdjustedValue(remainingCorpus, input.inflationRate!, years) : undefined

  return {
    calculatorName: 'SWP',
    summary: {
      totalInvested: initialCorpus,
      totalReturns,
      finalValue: remainingCorpus,
      inflationAdjustedValue: inflationAdjusted,
      totalWithdrawn: cumulativeWithdrawn,
      remainingCorpus,
      exhaustionYear,
      exhaustionMonth,
    },
    monthlyData,
    yearlyData,
    assumptions: [
      formatAssumption('Initial Corpus', formatINR(initialCorpus)),
      formatAssumption('Monthly Withdrawal', formatINR(input.monthlyWithdrawal)),
      formatAssumption('Expected Annual Return', `${annualReturn}%`),
      formatAssumption('Withdrawal Duration', `${years} Years`),
      ...(annualIncrease > 0 ? [formatAssumption('Annual Withdrawal Increase', `${annualIncrease}%`)] : []),
      ...(inflationApplied ? [formatAssumption('Inflation Rate', `${input.inflationRate}%`)] : []),
    ],
    inflationApplied,
    inflationRate: inflationApplied ? input.inflationRate! : undefined,
  }
}
