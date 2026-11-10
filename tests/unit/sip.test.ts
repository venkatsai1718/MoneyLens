import { calculateSIP } from '../../src/calculations/sip'
import { REF } from '../support/references'

describe('calculateSIP — reference values', () => {
  it('₹10,000/mo @12% for 10y matches the independent reference (effective monthly rate)', () => {
    const r = calculateSIP({ monthlyInvestment: 10000, annualReturnPercent: 12, years: 10 })
    expect(r.summary.totalInvested).toBe(1200000)
    expect(r.summary.finalValue).toBeCloseTo(REF.sip.effective_10k_12_10, 0)
    expect(r.summary.totalReturns).toBeCloseTo(REF.sip.effective_10k_12_10 - 1200000, 0)
  })

  it('DOCUMENTED DIVERGENCE: differs from the nominal r/12 convention (₹23.23L) by ~3.6%', () => {
    // Many calculators (and several pages claiming to mirror Groww) use i = r/12.
    // This app deliberately uses (1+r)^(1/12)-1. If you ever switch convention,
    // this test is the one that should change — on purpose.
    const r = calculateSIP({ monthlyInvestment: 10000, annualReturnPercent: 12, years: 10 })
    const gap = REF.sip.nominal_10k_12_10 - r.summary.finalValue
    expect(gap).toBeGreaterThan(80000)
    expect(gap / REF.sip.nominal_10k_12_10).toBeLessThan(0.04)
  })

  it('with initial lumpsum: ₹5,000/mo + ₹1L @10% for 15y', () => {
    const r = calculateSIP({ monthlyInvestment: 5000, initialLumpsum: 100000, annualReturnPercent: 10, years: 15 })
    expect(r.summary.finalValue).toBeCloseTo(REF.sip.withLumpsum_5k_10_15_lump1L, 0)
    expect(r.summary.totalInvested).toBe(100000 + 5000 * 180)
  })

  it('large case: ₹25,000/mo @15% for 20y', () => {
    const r = calculateSIP({ monthlyInvestment: 25000, annualReturnPercent: 15, years: 20 })
    expect(r.summary.finalValue).toBeCloseTo(REF.sip.big_25k_15_20, 0)
  })
})

describe('calculateSIP — properties & edges', () => {
  it('12 months of a lumpsum grows by exactly the stated annual rate', () => {
    const r = calculateSIP({ monthlyInvestment: 0, initialLumpsum: 100000, annualReturnPercent: 12, years: 1 })
    expect(r.summary.finalValue).toBeCloseTo(112000, 6)
  })

  it('0% return: final value equals total invested', () => {
    const r = calculateSIP({ monthlyInvestment: 7500, annualReturnPercent: 0, years: 4 })
    expect(r.summary.finalValue).toBeCloseTo(360000, 6)
    expect(r.summary.totalReturns).toBeCloseTo(0, 6)
  })

  it('produces years*12 monthly rows and `years` yearly rows', () => {
    const r = calculateSIP({ monthlyInvestment: 1000, annualReturnPercent: 8, years: 7 })
    expect(r.monthlyData).toHaveLength(84)
    expect(r.yearlyData).toHaveLength(7)
  })

  it('first-month balance = contribution * (1+r): investment is made at the start of the month', () => {
    const r = calculateSIP({ monthlyInvestment: 10000, annualReturnPercent: 12, years: 1 })
    expect(r.monthlyData[0].balance).toBeCloseTo(10000 * Math.pow(1.12, 1 / 12), 6)
  })

  it('is monotonic: higher rate / more years / larger SIP => larger corpus', () => {
    const base = calculateSIP({ monthlyInvestment: 5000, annualReturnPercent: 10, years: 10 }).summary.finalValue
    expect(calculateSIP({ monthlyInvestment: 5000, annualReturnPercent: 11, years: 10 }).summary.finalValue).toBeGreaterThan(base)
    expect(calculateSIP({ monthlyInvestment: 5000, annualReturnPercent: 10, years: 11 }).summary.finalValue).toBeGreaterThan(base)
    expect(calculateSIP({ monthlyInvestment: 5001, annualReturnPercent: 10, years: 10 }).summary.finalValue).toBeGreaterThan(base)
  })

  it('is linear in the monthly amount (doubling SIP doubles corpus)', () => {
    const a = calculateSIP({ monthlyInvestment: 3000, annualReturnPercent: 12, years: 8 }).summary.finalValue
    const b = calculateSIP({ monthlyInvestment: 6000, annualReturnPercent: 12, years: 8 }).summary.finalValue
    expect(b).toBeCloseTo(2 * a, 4)
  })

  it('inflation-adjusted value = finalValue / (1+i)^years', () => {
    const r = calculateSIP({ monthlyInvestment: 10000, annualReturnPercent: 12, years: 10, inflationRate: 6 })
    expect(r.summary.inflationAdjustedValue).toBeCloseTo(r.summary.finalValue / Math.pow(1.06, 10), 4)
    expect(r.inflationRate).toBe(6)
  })

  it.each([0, -5, NaN, null])('treats inflation %p as "not entered"', (v) => {
    const r = calculateSIP({ monthlyInvestment: 1000, annualReturnPercent: 10, years: 2, inflationRate: v as number | null })
    expect(r.inflationApplied).toBe(false)
    expect(r.summary.inflationAdjustedValue).toBeUndefined()
  })

  it('sanitises bad inputs (negative, NaN, fractional/zero years) without NaN output', () => {
    const r = calculateSIP({ monthlyInvestment: -100, annualReturnPercent: NaN, years: 0 })
    expect(r.summary.finalValue).toBe(0)
    expect(r.monthlyData).toHaveLength(12) // years floors to a minimum of 1
    const frac = calculateSIP({ monthlyInvestment: 1000, annualReturnPercent: 10, years: 2.6 })
    expect(frac.monthlyData).toHaveLength(36) // rounds to 3
  })

  it('assumptions list the lumpsum only when one is provided', () => {
    const without = calculateSIP({ monthlyInvestment: 1000, annualReturnPercent: 10, years: 1 })
    const withL = calculateSIP({ monthlyInvestment: 1000, initialLumpsum: 500, annualReturnPercent: 10, years: 1 })
    expect(without.assumptions.map((a) => a.label)).not.toContain('Initial Lumpsum')
    expect(withL.assumptions.map((a) => a.label)).toContain('Initial Lumpsum')
  })
})
