import { calculateInflation } from '../../src/calculations/inflation'
import { REF } from '../support/references'

describe('calculateInflation', () => {
  it("₹1L @6% for 10y => costs ₹1,79,085; worth ₹55,839 in today's money", () => {
    const r = calculateInflation({ currentAmount: 100000, inflationRatePercent: 6, years: 10 })
    expect(r.futureAmountRequired).toBeCloseTo(REF.inflation.fv_1L_6_10, 2)
    expect(r.equivalentPurchasingPower).toBeCloseTo(REF.inflation.pv_1L_6_10, 2)
    expect(Math.round(r.futureAmountRequired)).toBe(179085)
  })

  it('₹50k @7% for 20y', () => {
    expect(calculateInflation({ currentAmount: 50000, inflationRatePercent: 7, years: 20 }).futureAmountRequired).toBeCloseTo(REF.inflation.fv_50k_7_20, 2)
  })

  it('future × purchasing-power = amount²', () => {
    const r = calculateInflation({ currentAmount: 80000, inflationRatePercent: 5.5, years: 12 })
    expect(r.futureAmountRequired * r.equivalentPurchasingPower).toBeCloseTo(80000 ** 2, 2)
  })

  it('yearly table compounds year by year and ends at the future amount', () => {
    const r = calculateInflation({ currentAmount: 100000, inflationRatePercent: 6, years: 10 })
    expect(r.yearlyData).toHaveLength(10)
    expect(r.yearlyData[0].closingBalance).toBeCloseTo(106000, 6)
    expect(r.yearlyData[0].openingBalance).toBe(100000)
    expect(r.yearlyData[9].closingBalance).toBeCloseTo(r.futureAmountRequired, 6)
    expect(r.yearlyData.reduce((a, y) => a + y.returns, 0)).toBeCloseTo(r.summary.totalReturns, 6)
  })

  it('0% inflation changes nothing', () => {
    const r = calculateInflation({ currentAmount: 100000, inflationRatePercent: 0, years: 10 })
    expect(r.futureAmountRequired).toBe(100000)
    expect(r.equivalentPurchasingPower).toBe(100000)
  })
})
