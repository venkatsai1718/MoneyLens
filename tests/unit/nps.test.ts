import { calculateNPS } from '../../src/calculations/nps'
import { REF } from '../support/references'

describe('calculateNPS', () => {
  it('₹5,000/mo @10% 30y, 40% annuity @6%: corpus, annuity, lumpsum and pension', () => {
    const r = calculateNPS({ monthlyContribution: 5000, annualReturnPercent: 10, years: 30 })
    const ref = REF.nps.flat_5k_10_30
    expect(r.summary.finalValue).toBeCloseTo(ref.final, 0)
    expect(r.summary.totalInvested).toBe(ref.invested)
    expect(r.summary.estimatedAnnuityAllocation).toBeCloseTo(ref.annuity40, 0)
    expect(r.summary.estimatedLumpSum).toBeCloseTo(ref.final - ref.annuity40, 0)
    expect(r.summary.estimatedMonthlyPension).toBeCloseTo(ref.pension, 1)
    expect(r.summary.estimatedAnnualPension).toBeCloseTo(ref.pension * 12, 0)
  })

  it('with 10% annual step-up: ₹10k/mo @12% 25y', () => {
    const r = calculateNPS({ monthlyContribution: 10000, annualReturnPercent: 12, years: 25, annualStepUpPercent: 10 })
    expect(r.summary.finalValue).toBeCloseTo(REF.nps.stepUp_10k_10pct_12_25.final, 0)
    expect(r.summary.totalInvested).toBeCloseTo(REF.nps.stepUp_10k_10pct_12_25.invested, 2)
  })

  it('annuity + lump sum always add back to the corpus', () => {
    for (const pct of [40, 55, 80, 100]) {
      const r = calculateNPS({ monthlyContribution: 5000, annualReturnPercent: 9, years: 20, annuityPercent: pct })
      expect(r.summary.estimatedAnnuityAllocation! + r.summary.estimatedLumpSum!).toBeCloseTo(r.summary.finalValue, 6)
    }
  })

  it('annuity % is clamped into 40–100', () => {
    const lo = calculateNPS({ monthlyContribution: 5000, annualReturnPercent: 9, years: 10, annuityPercent: 10 })
    const hi = calculateNPS({ monthlyContribution: 5000, annualReturnPercent: 9, years: 10, annuityPercent: 250 })
    expect(lo.summary.estimatedAnnuityAllocation! / lo.summary.finalValue).toBeCloseTo(0.4, 10)
    expect(hi.summary.estimatedLumpSum).toBeCloseTo(0, 6)
  })

  it('pension is driven by the annuity rate, not the accumulation return', () => {
    const a = calculateNPS({ monthlyContribution: 5000, annualReturnPercent: 10, years: 20, annuityRatePercent: 6 })
    const b = calculateNPS({ monthlyContribution: 5000, annualReturnPercent: 10, years: 20, annuityRatePercent: 3 })
    expect(a.summary.estimatedMonthlyPension).toBeCloseTo(2 * b.summary.estimatedMonthlyPension!, 6)
  })
})
