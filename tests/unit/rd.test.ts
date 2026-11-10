import { calculateRD, RDInput } from '../../src/calculations/rd'
import { REF } from '../support/references'

const base: RDInput = { monthlyDeposit: 5000, annualRatePercent: 8, tenureMonths: 12, compoundingFrequency: 'quarterly' }

describe('calculateRD', () => {
  it('₹5,000/mo @8% quarterly 12m => ₹62,647 (published bank example)', () => {
    const r = calculateRD(base)
    expect(r.summary.finalValue).toBeCloseTo(REF.rd.q_5k_8_12, 0)
    expect(Math.round(r.summary.finalValue)).toBe(62647)
    expect(r.summary.totalInvested).toBe(60000)
  })

  it('₹10,000/mo @7% quarterly 24m', () => {
    const r = calculateRD({ ...base, monthlyDeposit: 10000, annualRatePercent: 7, tenureMonths: 24 })
    expect(r.summary.finalValue).toBeCloseTo(REF.rd.q_10k_7_24, 0)
  })

  it('monthly compounding ₹1,000 @6% 12m', () => {
    const r = calculateRD({ monthlyDeposit: 1000, annualRatePercent: 6, tenureMonths: 12, compoundingFrequency: 'monthly' })
    expect(r.summary.finalValue).toBeCloseTo(REF.rd.m_1k_6_12, 0)
  })

  it('0% rate: maturity = deposits', () => {
    const r = calculateRD({ ...base, annualRatePercent: 0 })
    expect(r.summary.finalValue).toBe(60000)
    expect(r.summary.totalReturns).toBe(0)
  })

  it('non-whole-year tenure gives a partial last yearly row, total rows = ceil(months/12)', () => {
    const r = calculateRD({ ...base, tenureMonths: 18 })
    expect(r.yearlyData).toHaveLength(2)
    expect(r.yearlyData[1].invested).toBe(6 * 5000)
    expect(r.yearlyData[1].closingBalance).toBeCloseTo(r.summary.finalValue, 6)
  })

  it('interest is positive and grows with tenure', () => {
    const a = calculateRD({ ...base, tenureMonths: 12 }).summary.totalReturns
    const b = calculateRD({ ...base, tenureMonths: 24 }).summary.totalReturns
    expect(a).toBeGreaterThan(0)
    expect(b).toBeGreaterThan(a * 2)
  })
})
