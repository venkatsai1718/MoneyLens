import { calculateCAGR } from '../../src/calculations/cagr'
import { REF } from '../support/references'

describe('calculateCAGR', () => {
  it('₹1L → ₹2L in 5y = 14.87%', () => {
    const r = calculateCAGR({ initialValue: 100000, finalValue: 200000, years: 5 })
    expect(r.cagrPercent).toBeCloseTo(REF.cagr.double5y, 6)
    expect(r.cagrPercent.toFixed(2)).toBe('14.87')
    expect(r.summary.totalReturns).toBe(100000)
  })

  it('₹2.5L → ₹10L in 10y = 14.87% (4x in 10y)', () => {
    expect(calculateCAGR({ initialValue: 250000, finalValue: 1000000, years: 10 }).cagrPercent).toBeCloseTo(REF.cagr.quadruple10y, 6)
  })

  it('negative growth: ₹1L → ₹80k in 2y = -10.56%', () => {
    const r = calculateCAGR({ initialValue: 100000, finalValue: 80000, years: 2 })
    expect(r.cagrPercent).toBeCloseTo(REF.cagr.loss, 6)
    expect(r.summary.totalReturns).toBe(-20000)
  })

  it('same start and end value = 0%', () => {
    expect(calculateCAGR({ initialValue: 5000, finalValue: 5000, years: 3 }).cagrPercent).toBeCloseTo(0, 10)
  })

  it('1-year CAGR is the simple return', () => {
    expect(calculateCAGR({ initialValue: 1000, finalValue: 1150, years: 1 }).cagrPercent).toBeCloseTo(15, 8)
  })

  it('supports fractional years (₹1L→₹1.5L in 2.5y)', () => {
    const r = calculateCAGR({ initialValue: 100000, finalValue: 150000, years: 2.5 })
    expect(r.cagrPercent).toBeCloseTo((Math.pow(1.5, 1 / 2.5) - 1) * 100, 8)
  })

  it('growth path ends at the final value', () => {
    const r = calculateCAGR({ initialValue: 100000, finalValue: 200000, years: 5 })
    expect(r.monthlyData).toHaveLength(60)
    expect(r.monthlyData[59].balance).toBeCloseTo(200000, 4)
  })

  it('zero final value does not crash (-100%)', () => {
    const r = calculateCAGR({ initialValue: 1000, finalValue: 0, years: 2 })
    expect(r.cagrPercent).toBeCloseTo(-100, 8)
  })
})
