import type { CalculationResult, MonthlyDataPoint } from '../types/calculator'
import { aggregateYearly, monthlyRateFromAnnual, inflationAdjustedValue, formatAssumption, isInflationEntered } from './helpers'
import { clampNonNegative } from '../utils/validation'
import { formatINR } from '../utils/format'

export interface NPSInput {
  monthlyContribution: number
  annualReturnPercent: number
  years: number
  annualStepUpPercent?: number
  annuityPercent?: number
  /** Annual rate the annuity corpus is assumed to pay out as pension, e.g. 6. Independent of the accumulation-phase return — annuities are priced like fixed-income/insurance products, not equity-linked funds. */
  annuityRatePercent?: number
  inflationRate?: number | null
}

/**
 * NPS accumulation phase, calculated exactly like a (Step-Up) SIP, with an
 * estimated annuity / lump-sum split applied to the final corpus, and an
 * estimated pension payout from the annuity portion (Annuity Corpus ×
 * Annuity Rate ÷ 12 — the same approximation used by bank/AMC NPS
 * calculators, since the actual payout depends on the annuity plan and
 * insurer chosen at retirement). All outputs are estimates — real NPS
 * returns depend on the pension fund manager's actual asset allocation and
 * market performance, and the real pension depends on prevailing annuity
 * rates and plan type at the time of purchase.
 */
export function calculateNPS(input: NPSInput): CalculationResult {
  const baseContribution = clampNonNegative(input.monthlyContribution)
  const annualReturn = clampNonNegative(input.annualReturnPercent)
  const years = Math.max(1, Math.round(clampNonNegative(input.years) || 1))
  const stepUp = clampNonNegative(input.annualStepUpPercent ?? 0)
  const annuityPercent = Math.min(100, Math.max(40, clampNonNegative(input.annuityPercent ?? 40)))
  const annuityRate = clampNonNegative(input.annuityRatePercent ?? 6)
  const totalMonths = years * 12
  const r = monthlyRateFromAnnual(annualReturn)

  const monthlyData: MonthlyDataPoint[] = []
  let balance = 0
  let invested = 0
  let currentContribution = baseContribution

  for (let m = 1; m <= totalMonths; m++) {
    if (m > 1 && (m - 1) % 12 === 0 && stepUp > 0) {
      currentContribution = currentContribution * (1 + stepUp / 100)
    }
    balance = (balance + currentContribution) * (1 + r)
    invested += currentContribution
    monthlyData.push({
      month: m,
      year: Math.ceil(m / 12),
      invested,
      interest: balance - invested,
      balance,
      contribution: currentContribution,
    })
  }

  const yearlyData = aggregateYearly(monthlyData)
  const finalValue = balance
  const totalReturns = finalValue - invested
  const inflationApplied = isInflationEntered(input.inflationRate)
  const inflationAdjusted = inflationApplied ? inflationAdjustedValue(finalValue, input.inflationRate!, years) : undefined
  const estimatedAnnuityAllocation = finalValue * (annuityPercent / 100)
  const estimatedLumpSum = finalValue - estimatedAnnuityAllocation
  const estimatedAnnualPension = estimatedAnnuityAllocation * (annuityRate / 100)
  const estimatedMonthlyPension = estimatedAnnualPension / 12

  return {
    calculatorName: 'NPS',
    summary: {
      totalInvested: invested,
      totalReturns,
      finalValue,
      inflationAdjustedValue: inflationAdjusted,
      estimatedAnnuityAllocation,
      estimatedLumpSum,
      estimatedMonthlyPension,
      estimatedAnnualPension,
    },
    monthlyData,
    yearlyData,
    assumptions: [
      formatAssumption('Monthly Contribution', formatINR(baseContribution)),
      formatAssumption('Expected Annual Return', `${annualReturn}%`),
      formatAssumption('Investment Period', `${years} Years`),
      ...(stepUp > 0 ? [formatAssumption('Annual Step-Up', `${stepUp}%`)] : []),
      formatAssumption('Annuitization', `${annuityPercent}% annuity / ${100 - annuityPercent}% lump sum`),
      formatAssumption('Assumed Annuity Rate', `${annuityRate}% p.a.`),
      ...(inflationApplied ? [formatAssumption('Inflation Rate', `${input.inflationRate}%`)] : []),
    ],
    inflationApplied,
    inflationRate: inflationApplied ? input.inflationRate! : undefined,
  }
}
