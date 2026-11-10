import { calculatePPF } from '../../src/calculations/ppf'
import { REF } from '../support/references'

describe('calculatePPF', () => {
  it('₹1.5L/yr @7.1% 15y, start of year => ₹40,68,209 (widely published PPF maturity)', () => {
    const r = calculatePPF({ annualContribution: 150000, annualRatePercent: 7.1, years: 15, contributionTiming: 'start' })
    expect(r.summary.finalValue).toBeCloseTo(REF.ppf.start_150k_7_1_15, 0)
    expect(Math.round(r.summary.finalValue)).toBe(4068209)
    expect(r.summary.totalInvested).toBe(2250000)
    expect(r.summary.totalReturns).toBeCloseTo(4068209.22 - 2250000, 0)
  })

  it('end-of-year timing reference', () => {
    const r = calculatePPF({ annualContribution: 150000, annualRatePercent: 7.1, years: 15, contributionTiming: 'end' })
    expect(r.summary.finalValue).toBeCloseTo(REF.ppf.end_150k_7_1_15, 0)
  })

  it('start-of-year equals the annual-compounding annuity-due closed form', () => {
    const c = 100000, i = 0.071, n = 15
    const expected = c * ((Math.pow(1 + i, n) - 1) / i) * (1 + i)
    const r = calculatePPF({ annualContribution: c, annualRatePercent: 7.1, years: n, contributionTiming: 'start' })
    expect(r.summary.finalValue).toBeCloseTo(expected, 4)
  })

  it('end-of-year = start-of-year / (1+i) (one fewer year of growth)', () => {
    const s = calculatePPF({ annualContribution: 50000, annualRatePercent: 7.1, years: 10, contributionTiming: 'start' }).summary.finalValue
    const e = calculatePPF({ annualContribution: 50000, annualRatePercent: 7.1, years: 10, contributionTiming: 'end' }).summary.finalValue
    expect(e).toBeCloseTo(s / 1.071, 4)
  })

  it('contribution recorded in the right month (1 for start, 12 for end)', () => {
    const s = calculatePPF({ annualContribution: 1000, annualRatePercent: 7, years: 2, contributionTiming: 'start' })
    const e = calculatePPF({ annualContribution: 1000, annualRatePercent: 7, years: 2, contributionTiming: 'end' })
    expect(s.monthlyData.filter((m) => m.contribution).map((m) => m.month)).toEqual([1, 13])
    expect(e.monthlyData.filter((m) => m.contribution).map((m) => m.month)).toEqual([12, 24])
  })

  it('0% rate: maturity equals contributions', () => {
    const r = calculatePPF({ annualContribution: 150000, annualRatePercent: 0, years: 15, contributionTiming: 'start' })
    expect(r.summary.finalValue).toBe(2250000)
  })
})
