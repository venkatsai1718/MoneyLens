import { calculateStepUpSIP } from '../../src/calculations/stepUpSip'
import { REF } from '../support/references'

describe('calculateStepUpSIP — reference values', () => {
  it('₹10,000/mo, +10%/yr, 12% return, 10y', () => {
    const r = calculateStepUpSIP({ initialMonthlySip: 10000, stepUpMode: 'percentage', stepUpValue: 10, annualReturnPercent: 12, years: 10 })
    expect(r.summary.finalValue).toBeCloseTo(REF.stepUp.pct_10k_10_12_10.final, 0)
    expect(r.summary.totalInvested).toBeCloseTo(REF.stepUp.pct_10k_10_12_10.invested, 2)
  })

  it('₹5,000/mo, +₹500/yr, 10% return, 5y', () => {
    const r = calculateStepUpSIP({ initialMonthlySip: 5000, stepUpMode: 'amount', stepUpValue: 500, annualReturnPercent: 10, years: 5 })
    expect(r.summary.finalValue).toBeCloseTo(REF.stepUp.amt_5k_500_10_5.final, 0)
    expect(r.summary.totalInvested).toBe(REF.stepUp.amt_5k_500_10_5.invested)
  })
})

describe('calculateStepUpSIP — behaviour', () => {
  it('instalment steps on months 13, 25… and stays flat in between (percentage)', () => {
    const r = calculateStepUpSIP({ initialMonthlySip: 10000, stepUpMode: 'percentage', stepUpValue: 10, annualReturnPercent: 12, years: 3 })
    const c = r.monthlyData.map((m) => m.contribution)
    expect(c[0]).toBe(10000)
    expect(c[11]).toBe(10000)
    expect(c[12]).toBeCloseTo(11000, 6)
    expect(c[23]).toBeCloseTo(11000, 6)
    expect(c[24]).toBeCloseTo(12100, 6)
  })

  it('fixed-amount step-up adds the same rupees each year', () => {
    const r = calculateStepUpSIP({ initialMonthlySip: 5000, stepUpMode: 'amount', stepUpValue: 500, annualReturnPercent: 10, years: 3 })
    expect(r.yearlyData.map((y) => y.monthlyAmount)).toEqual([5000, 5500, 6000])
  })

  it('base + step-up contribution + lumpsum = total invested', () => {
    const r = calculateStepUpSIP({ initialMonthlySip: 8000, stepUpMode: 'percentage', stepUpValue: 5, initialLumpsum: 50000, annualReturnPercent: 11, years: 6 })
    expect(r.summary.totalSipContribution).toBe(8000 * 72)
    expect((r.summary.totalSipContribution ?? 0) + (r.summary.totalStepUpContribution ?? 0) + 50000).toBeCloseTo(r.summary.totalInvested, 4)
  })

  it('beats a flat SIP of the same starting amount', () => {
    const flat = calculateStepUpSIP({ initialMonthlySip: 10000, stepUpMode: 'percentage', stepUpValue: 0, annualReturnPercent: 12, years: 10 })
    const step = calculateStepUpSIP({ initialMonthlySip: 10000, stepUpMode: 'percentage', stepUpValue: 10, annualReturnPercent: 12, years: 10 })
    expect(step.summary.finalValue).toBeGreaterThan(flat.summary.finalValue)
    expect(flat.summary.totalStepUpContribution).toBe(0)
  })
})
