import type { CalculationResult } from '../types/calculator'
import { monthlyRateFromAnnual, futureInflatedValue, formatAssumption, isInflationEntered } from './helpers'
import { clampNonNegative } from '../utils/validation'
import { formatINR } from '../utils/format'
import { calculateSIP } from './sip'

export interface GoalSIPInput {
  goalAmount: number
  currentSavings?: number
  years: number
  annualReturnPercent: number
  inflationRate?: number | null
}

/**
 * Solves for the monthly SIP required to reach a goal, then reuses the SIP
 * engine to produce the full monthly/yearly breakdown for that instalment —
 * so the resulting table, chart, CSV and PDF are all internally consistent
 * with the SIP calculation logic.
 */
export function calculateGoalSIP(input: GoalSIPInput): CalculationResult {
  const goalAmount = clampNonNegative(input.goalAmount)
  const currentSavings = clampNonNegative(input.currentSavings ?? 0)
  const annualReturn = clampNonNegative(input.annualReturnPercent)
  const years = Math.max(1, Math.round(clampNonNegative(input.years) || 1))
  const totalMonths = years * 12
  const r = monthlyRateFromAnnual(annualReturn)

  const inflationApplied = isInflationEntered(input.inflationRate)
  const inflationAdjustedGoal = inflationApplied ? futureInflatedValue(goalAmount, input.inflationRate!, years) : goalAmount

  const futureValueOfCurrentSavings = currentSavings * Math.pow(1 + r, totalMonths)
  const targetFromSip = Math.max(0, inflationAdjustedGoal - futureValueOfCurrentSavings)

  // Invert the annuity-due SIP future-value formula: FV = P * [((1+r)^n - 1)/r] * (1+r)
  const annuityFactor = r > 0 ? ((Math.pow(1 + r, totalMonths) - 1) / r) * (1 + r) : totalMonths
  const requiredMonthlySip = annuityFactor > 0 ? targetFromSip / annuityFactor : 0

  const sipResult = calculateSIP({
    monthlyInvestment: requiredMonthlySip,
    initialLumpsum: currentSavings,
    annualReturnPercent: annualReturn,
    years,
    inflationRate: null, // goal already accounts for inflation via the target
  })

  return {
    ...sipResult,
    calculatorName: 'Goal-Based SIP',
    summary: {
      ...sipResult.summary,
      todaysGoal: goalAmount,
      inflationAdjustedGoal,
      requiredMonthlySip,
      inflationAdjustedValue: inflationApplied ? sipResult.summary.finalValue : undefined,
    },
    assumptions: [
      formatAssumption("Today's Goal", formatINR(goalAmount)),
      ...(currentSavings > 0 ? [formatAssumption('Current Savings', formatINR(currentSavings))] : []),
      formatAssumption('Time to Goal', `${years} Years`),
      formatAssumption('Expected Annual Return', `${annualReturn}%`),
      ...(inflationApplied ? [formatAssumption('Inflation Rate', `${input.inflationRate}%`)] : []),
      formatAssumption('Required Monthly SIP', formatINR(requiredMonthlySip)),
    ],
    inflationApplied,
    inflationRate: inflationApplied ? input.inflationRate! : undefined,
  }
}
