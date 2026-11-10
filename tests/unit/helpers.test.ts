import { monthlyRateFromAnnual, aggregateYearly, inflationAdjustedValue, futureInflatedValue, isInflationEntered } from '../../src/calculations/helpers'
import { clampNonNegative, safeNumber, validateAmount, validateRate, validateYears } from '../../src/utils/validation'
import { formatINR } from '../../src/utils/format'

describe('monthlyRateFromAnnual', () => {
  it('compounds back to the annual rate over 12 months', () => {
    for (const a of [1, 6.5, 12, 18, 30]) {
      expect(Math.pow(1 + monthlyRateFromAnnual(a), 12) - 1).toBeCloseTo(a / 100, 12)
    }
  })
  it('12% => 0.9489% per month (not 1%)', () => {
    expect(monthlyRateFromAnnual(12)).toBeCloseTo(0.009489, 6)
  })
  it('0% => 0', () => expect(monthlyRateFromAnnual(0)).toBe(0))
})

describe('inflation helpers', () => {
  it('discount and inflate are inverses', () => {
    expect(inflationAdjustedValue(futureInflatedValue(1000, 6, 10), 6, 10)).toBeCloseTo(1000, 8)
  })
  it('return the input untouched for non-positive rates', () => {
    expect(inflationAdjustedValue(500, 0, 5)).toBe(500)
    expect(futureInflatedValue(500, -2, 5)).toBe(500)
  })
  it('isInflationEntered only accepts positive finite numbers', () => {
    expect([5, 0, -1, NaN, null, undefined].map(isInflationEntered)).toEqual([true, false, false, false, false, false])
  })
})

describe('aggregateYearly', () => {
  it('returns [] for no data', () => expect(aggregateYearly([])).toEqual([]))
  it('derives per-year deltas from cumulative values', () => {
    const rows = aggregateYearly([
      { month: 1, year: 1, invested: 100, interest: 5, balance: 105, contribution: 100 },
      { month: 2, year: 1, invested: 200, interest: 12, balance: 212, contribution: 100 },
      { month: 3, year: 2, invested: 300, interest: 30, balance: 330, contribution: 100 },
    ])
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ year: 1, invested: 200, returns: 12, openingBalance: 0, closingBalance: 212 })
    expect(rows[1]).toMatchObject({ year: 2, invested: 100, returns: 18, openingBalance: 212, closingBalance: 330, totalInvestedTillDate: 300 })
  })
})

describe('validation utils', () => {
  it('safeNumber / clampNonNegative neutralise NaN, Infinity and negatives', () => {
    expect(safeNumber(NaN)).toBe(0)
    expect(safeNumber(Infinity, 7)).toBe(7)
    expect(clampNonNegative(-5)).toBe(0)
    expect(clampNonNegative(12.5)).toBe(12.5)
  })
  it('validateAmount', () => {
    expect(validateAmount(null, { required: true }).valid).toBe(false)
    expect(validateAmount(null).valid).toBe(true)
    expect(validateAmount(-1).valid).toBe(false)
    expect(validateAmount(0, { required: true }).valid).toBe(false)
    expect(validateAmount(0, { required: true, allowZero: true }).valid).toBe(true)
    expect(validateAmount(1e12).valid).toBe(false)
    expect(validateAmount(5000).valid).toBe(true)
  })
  it('validateRate (default 0–50%)', () => {
    expect(validateRate(12).valid).toBe(true)
    expect(validateRate(51).valid).toBe(false)
    expect(validateRate(-1).valid).toBe(false)
    expect(validateRate(Infinity).valid).toBe(false)
  })
  it('validateYears (default 1–75)', () => {
    expect(validateYears(10).valid).toBe(true)
    expect(validateYears(0).valid).toBe(false)
    expect(validateYears(76).valid).toBe(false)
    expect(validateYears(null).valid).toBe(false)
  })
})

describe('formatINR', () => {
  it('uses Indian digit grouping', () => {
    expect(formatINR(2240359)).toContain('22,40,359')
    expect(formatINR(1200000)).toContain('12,00,000')
  })
})
