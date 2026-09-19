import type { CalculationResult, MonthlyDataPoint } from '../types/calculator'
import { aggregateYearly, inflationAdjustedValue, formatAssumption, isInflationEntered } from './helpers'
import { clampNonNegative } from '../utils/validation'
import { formatINR } from '../utils/format'

export type CompoundingFrequency = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'
export type TenureUnit = 'months' | 'years'

export interface FDInput {
  principal: number
  annualRatePercent: number
  tenureValue: number
  tenureUnit: TenureUnit
  compoundingFrequency: CompoundingFrequency
  cumulative: boolean
  seniorCitizenExtraRate?: number
  inflationRate?: number | null
}

const PERIODS_PER_YEAR: Record<CompoundingFrequency, number> = {
  monthly: 12,
  quarterly: 4,
  'half-yearly': 2,
  yearly: 1,
}

/**
 * Fixed Deposit. Simulated at monthly resolution: balance steps up whenever
 * a compounding period boundary is crossed, so charts/tables stay smooth
 * while the maturity value matches the standard FD compound-interest formula.
 */
export function calculateFD(input: FDInput): CalculationResult {
  const principal = clampNonNegative(input.principal)
  const baseRate = clampNonNegative(input.annualRatePercent)
  const rate = baseRate + clampNonNegative(input.seniorCitizenExtraRate ?? 0)
  const n = PERIODS_PER_YEAR[input.compoundingFrequency]
  const totalMonths = Math.max(1, Math.round(input.tenureUnit === 'years' ? input.tenureValue * 12 : input.tenureValue))
  const periodRate = rate / 100 / n
  const monthsPerPeriod = 12 / n

  // How many whole compounding periods have elapsed by month `m`, plus the
  // fraction of the way through the current (possibly partial) period —
  // e.g. quarterly compounding at month 20 is 6 whole quarters plus 2/3 of a
  // 7th. Banks credit simple interest for that trailing partial period
  // rather than dropping it, so a tenure that doesn't land exactly on a
  // period boundary (any tenure entered in months) still earns interest for
  // its last few weeks/months instead of losing them entirely.
  function periodsAt(m: number): { whole: number; frac: number } {
    const periods = m / monthsPerPeriod
    const whole = Math.floor(periods + 1e-9)
    return { whole, frac: periods - whole }
  }

  const monthlyData: MonthlyDataPoint[] = []

  if (input.cumulative) {
    for (let m = 1; m <= totalMonths; m++) {
      const { whole, frac } = periodsAt(m)
      const balance = principal * Math.pow(1 + periodRate, whole) * (1 + periodRate * frac)
      monthlyData.push({
        month: m,
        year: Math.ceil(m / 12),
        invested: principal,
        interest: balance - principal,
        balance,
        contribution: m === 1 ? principal : 0,
      })
    }
  } else {
    // Non-cumulative: interest is paid out (simple, per period) rather than
    // compounded, including a prorated amount for a trailing partial period.
    for (let m = 1; m <= totalMonths; m++) {
      const { whole, frac } = periodsAt(m)
      const cumulativePayout = principal * periodRate * (whole + frac)
      monthlyData.push({
        month: m,
        year: Math.ceil(m / 12),
        invested: principal,
        interest: cumulativePayout,
        balance: principal + cumulativePayout,
        contribution: m === 1 ? principal : 0,
      })
    }
  }

  const yearlyData = aggregateYearly(monthlyData)
  const last = monthlyData[monthlyData.length - 1]
  const maturityAmount = last.balance
  const totalInterest = maturityAmount - principal
  const years = totalMonths / 12
  const inflationApplied = isInflationEntered(input.inflationRate)
  const inflationAdjusted = inflationApplied ? inflationAdjustedValue(maturityAmount, input.inflationRate!, years) : undefined
  const effectiveAnnualReturn = years > 0 ? (Math.pow(maturityAmount / principal, 1 / years) - 1) * 100 : 0

  return {
    calculatorName: 'Fixed Deposit',
    summary: {
      totalInvested: principal,
      totalReturns: totalInterest,
      finalValue: maturityAmount,
      inflationAdjustedValue: inflationAdjusted,
    },
    monthlyData,
    yearlyData,
    assumptions: [
      formatAssumption('Principal', formatINR(principal)),
      formatAssumption('Interest Rate', `${rate}% p.a.${(input.seniorCitizenExtraRate ?? 0) > 0 ? ' (incl. senior citizen bonus)' : ''}`),
      formatAssumption('Tenure', `${input.tenureValue} ${input.tenureUnit}`),
      formatAssumption('Compounding', input.compoundingFrequency),
      formatAssumption('FD Type', input.cumulative ? 'Cumulative' : 'Non-Cumulative'),
      formatAssumption('Effective Annualized Return', `${effectiveAnnualReturn.toFixed(2)}%`),
      ...(inflationApplied ? [formatAssumption('Inflation Rate', `${input.inflationRate}%`)] : []),
    ],
    inflationApplied,
    inflationRate: inflationApplied ? input.inflationRate! : undefined,
  }
}
