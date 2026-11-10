import { calculateGoalSIP } from '../../src/calculations/goalSip'
import { REF } from '../support/references'

describe('calculateGoalSIP', () => {
  it('₹1Cr in 10y @12%, no savings => required SIP reference', () => {
    const r = calculateGoalSIP({ goalAmount: 10000000, years: 10, annualReturnPercent: 12 })
    expect(r.summary.requiredMonthlySip).toBeCloseTo(REF.goal.cr_12_10, 1)
    expect(r.summary.inflationAdjustedGoal).toBe(10000000)
    expect(r.summary.finalValue).toBeCloseTo(10000000, 0)
  })

  it('₹50L today, ₹5L saved, 15y, 12%, 6% inflation', () => {
    const r = calculateGoalSIP({ goalAmount: 5000000, currentSavings: 500000, years: 15, annualReturnPercent: 12, inflationRate: 6 })
    expect(r.summary.inflationAdjustedGoal).toBeCloseTo(REF.goal.withSavingsInflation.goalFuture, 1)
    expect(r.summary.requiredMonthlySip).toBeCloseTo(REF.goal.withSavingsInflation.sip, 1)
    expect(r.summary.finalValue).toBeCloseTo(REF.goal.withSavingsInflation.goalFuture, 0)
    expect(r.summary.todaysGoal).toBe(5000000)
    expect(r.summary.inflationAdjustedValue).toBeCloseTo(r.summary.finalValue, 6)
  })

  it('SIP is zero when current savings alone already reach the goal', () => {
    const r = calculateGoalSIP({ goalAmount: 1000000, currentSavings: 900000, years: 10, annualReturnPercent: 12 })
    expect(r.summary.requiredMonthlySip).toBe(0)
  })

  it('0% return: SIP = (goal - savings) / months', () => {
    const r = calculateGoalSIP({ goalAmount: 1200000, currentSavings: 0, years: 5, annualReturnPercent: 0 })
    expect(r.summary.requiredMonthlySip).toBeCloseTo(20000, 6)
  })

  it('a longer horizon or higher return lowers the required SIP', () => {
    const f = (years: number, rate: number) => calculateGoalSIP({ goalAmount: 5000000, years, annualReturnPercent: rate }).summary.requiredMonthlySip!
    expect(f(15, 12)).toBeLessThan(f(10, 12))
    expect(f(10, 14)).toBeLessThan(f(10, 12))
  })

  it('inflation only appears when entered', () => {
    const r = calculateGoalSIP({ goalAmount: 1000000, years: 5, annualReturnPercent: 10 })
    expect(r.inflationApplied).toBe(false)
    expect(r.summary.inflationAdjustedValue).toBeUndefined()
  })
})
