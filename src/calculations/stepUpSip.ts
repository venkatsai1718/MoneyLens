import type { CalculationResult, MonthlyDataPoint } from '../types/calculator'
import { aggregateYearly, monthlyRateFromAnnual, inflationAdjustedValue, formatAssumption, isInflationEntered } from './helpers'
import { clampNonNegative } from '../utils/validation'
import { formatINR } from '../utils/format'

export type StepUpMode = 'percentage' | 'amount'

export interface StepUpSIPInput {
  initialMonthlySip: number
  stepUpMode: StepUpMode
  stepUpValue: number // percent (e.g. 10) or fixed rupee amount (e.g. 1000)
  initialLumpsum?: number
  annualReturnPercent: number
  years: number
  inflationRate?: number | null
}

/**
 * Step-Up SIP. The monthly instalment increases once every 12 months,
 * either by a percentage or a fixed rupee amount. Calculated at monthly
 * granularity exactly like calculateSIP, so results stay consistent.
 */
export function calculateStepUpSIP(input: StepUpSIPInput): CalculationResult {
  const initialMonthlySip = clampNonNegative(input.initialMonthlySip)
  const initialLumpsum = clampNonNegative(input.initialLumpsum ?? 0)
  const annualReturn = clampNonNegative(input.annualReturnPercent)
  const years = Math.max(1, Math.round(clampNonNegative(input.years) || 1))
  const stepUpValue = clampNonNegative(input.stepUpValue)
  const totalMonths = years * 12
  const r = monthlyRateFromAnnual(annualReturn)

  const monthlyData: MonthlyDataPoint[] = []
  let balance = initialLumpsum
  let invested = initialLumpsum
  let currentSip = initialMonthlySip
  let totalSipContribution = 0 // what would have been invested with no step-up
  let totalActualSipCashflow = 0

  for (let m = 1; m <= totalMonths; m++) {
    const yearIndex = Math.ceil(m / 12)
    // Step up at the start of every year after the first.
    if (m > 1 && (m - 1) % 12 === 0) {
      currentSip = input.stepUpMode === 'percentage' ? currentSip * (1 + stepUpValue / 100) : currentSip + stepUpValue
    }
    balance = (balance + currentSip) * (1 + r)
    invested += currentSip
    totalActualSipCashflow += currentSip
    totalSipContribution += initialMonthlySip
    monthlyData.push({
      month: m,
      year: yearIndex,
      invested,
      interest: balance - invested,
      balance,
      contribution: currentSip,
    })
  }

  const yearlyData = aggregateYearly(monthlyData)
  const finalValue = balance
  const totalInvested = invested
  const totalReturns = finalValue - totalInvested
  const inflationApplied = isInflationEntered(input.inflationRate)
  const inflationAdjusted = inflationApplied ? inflationAdjustedValue(finalValue, input.inflationRate!, years) : undefined
  const totalStepUpContribution = Math.max(0, totalActualSipCashflow - totalSipContribution)

  return {
    calculatorName: 'Step-Up SIP',
    summary: {
      totalInvested,
      totalReturns,
      finalValue,
      inflationAdjustedValue: inflationAdjusted,
      totalSipContribution,
      totalStepUpContribution,
    },
    monthlyData,
    yearlyData,
    assumptions: [
      formatAssumption('Initial Monthly SIP', formatINR(initialMonthlySip)),
      formatAssumption('Step-Up', input.stepUpMode === 'percentage' ? `${stepUpValue}% every year` : `${formatINR(stepUpValue)} every year`),
      ...(initialLumpsum > 0 ? [formatAssumption('Initial Lumpsum', formatINR(initialLumpsum))] : []),
      formatAssumption('Expected Annual Return', `${annualReturn}%`),
      formatAssumption('Investment Period', `${years} Years`),
      ...(inflationApplied ? [formatAssumption('Inflation Rate', `${input.inflationRate}%`)] : []),
    ],
    inflationApplied,
    inflationRate: inflationApplied ? input.inflationRate! : undefined,
  }
}
