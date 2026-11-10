import { calculateLumpsum } from '../../src/calculations/lumpsum'
import { REF } from '../support/references'

describe('calculateLumpsum', () => {
  it.each([
    [100000, 12, 1, REF.lumpsum.oneYear_1L_12],
    [500000, 10, 5, REF.lumpsum.fiveYear_5L_10],
    [100000, 12, 10, REF.lumpsum.tenYear_1L_12],
  ])('₹%p @%p%% for %py => P(1+r)^n reference', (p, rate, years, expected) => {
    const r = calculateLumpsum({ initialInvestment: p, annualReturnPercent: rate, years })
    expect(r.summary.finalValue).toBeCloseTo(expected, 0)
    expect(r.summary.totalInvested).toBe(p)
    expect(r.summary.totalReturns).toBeCloseTo(expected - p, 0)
  })

  it('0% return leaves the principal unchanged', () => {
    const r = calculateLumpsum({ initialInvestment: 250000, annualReturnPercent: 0, years: 5 })
    expect(r.summary.finalValue).toBeCloseTo(250000, 6)
  })

  it('contribution is recorded only in month 1, invested stays constant', () => {
    const r = calculateLumpsum({ initialInvestment: 100000, annualReturnPercent: 8, years: 2 })
    expect(r.monthlyData[0].contribution).toBe(100000)
    expect(r.monthlyData.slice(1).every((m) => m.contribution === 0)).toBe(true)
    expect(r.yearlyData[0].invested).toBe(100000)
    expect(r.yearlyData[1].invested).toBe(0)
  })

  it('inflation adjusted value discounts by (1+i)^years', () => {
    const r = calculateLumpsum({ initialInvestment: 100000, annualReturnPercent: 12, years: 10, inflationRate: 6 })
    expect(r.summary.inflationAdjustedValue).toBeCloseTo(REF.lumpsum.tenYear_1L_12 / Math.pow(1.06, 10), 2)
  })

  it('never yields NaN for garbage input', () => {
    const r = calculateLumpsum({ initialInvestment: NaN, annualReturnPercent: -3, years: -1 })
    expect(r.summary.finalValue).toBe(0)
  })
})
