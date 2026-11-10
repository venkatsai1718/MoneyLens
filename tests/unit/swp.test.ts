import { calculateSWP } from '../../src/calculations/swp'
import { REF } from '../support/references'

describe('calculateSWP — reference values', () => {
  it('sustainable: ₹50L, 10%, ₹30k/mo, 10y', () => {
    const r = calculateSWP({ initialCorpus: 5000000, annualReturnPercent: 10, monthlyWithdrawal: 30000, years: 10 })
    expect(r.summary.remainingCorpus).toBeCloseTo(REF.swp.sustaining_50L_10_30k_10.remaining, 0)
    expect(r.summary.totalWithdrawn).toBeCloseTo(REF.swp.sustaining_50L_10_30k_10.withdrawn, 4)
    expect(r.summary.exhaustionYear).toBeNull()
  })

  it('with 5% yearly withdrawal increase: ₹1Cr, 8%, ₹50k/mo, 20y', () => {
    const r = calculateSWP({ initialCorpus: 10000000, annualReturnPercent: 8, monthlyWithdrawal: 50000, years: 20, annualIncreasePercent: 5 })
    expect(r.summary.remainingCorpus).toBeCloseTo(REF.swp.stepped_1Cr_8_50k_20_5pct.remaining, 0)
    expect(r.summary.totalWithdrawn).toBeCloseTo(REF.swp.stepped_1Cr_8_50k_20_5pct.withdrawn, 0)
  })

  it('exhaustion: ₹10L, 6%, ₹20k/mo runs out in month 58 (year 5)', () => {
    const r = calculateSWP({ initialCorpus: 1000000, annualReturnPercent: 6, monthlyWithdrawal: 20000, years: 5 })
    expect(r.summary.exhaustionMonth).toBe(REF.swp.exhausted_10L_6_20k_5.month)
    expect(r.summary.exhaustionYear).toBe(5)
    expect(r.summary.remainingCorpus).toBe(0)
    expect(r.summary.totalWithdrawn).toBeCloseTo(REF.swp.exhausted_10L_6_20k_5.withdrawn, 0)
  })
})

describe('calculateSWP — invariants', () => {
  it('0% return, no exhaustion: remaining = corpus - withdrawals exactly', () => {
    const r = calculateSWP({ initialCorpus: 1200000, annualReturnPercent: 0, monthlyWithdrawal: 10000, years: 5 })
    expect(r.summary.remainingCorpus).toBeCloseTo(600000, 6)
  })

  it('0% return exhausts linearly at month corpus/withdrawal', () => {
    const r = calculateSWP({ initialCorpus: 100000, annualReturnPercent: 0, monthlyWithdrawal: 10000, years: 2 })
    expect(r.summary.exhaustionMonth).toBe(10)
    expect(r.summary.totalWithdrawn).toBeCloseTo(100000, 6)
  })

  it('balance never negative; withdrawals stop after exhaustion; withdrawn is non-decreasing', () => {
    const r = calculateSWP({ initialCorpus: 100000, annualReturnPercent: 6, monthlyWithdrawal: 20000, years: 5 })
    let prev = 0
    for (const m of r.monthlyData) {
      expect(m.balance).toBeGreaterThanOrEqual(0)
      expect(m.withdrawn!).toBeGreaterThanOrEqual(prev)
      prev = m.withdrawn!
    }
    const tail = r.monthlyData.slice(r.summary.exhaustionMonth!)
    expect(tail.every((m) => m.balance === 0 && m.withdrawn === prev)).toBe(true)
  })

  it('accounting identity: totalReturns = remaining + withdrawn - corpus', () => {
    const r = calculateSWP({ initialCorpus: 3000000, annualReturnPercent: 9, monthlyWithdrawal: 25000, years: 12 })
    expect(r.summary.totalReturns).toBeCloseTo(r.summary.remainingCorpus! + r.summary.totalWithdrawn! - 3000000, 6)
    expect(r.summary.finalValue).toBe(r.summary.remainingCorpus)
  })

  it('yearly withdrawals sum to totalWithdrawn; exhausted flag set once the corpus is gone', () => {
    const r = calculateSWP({ initialCorpus: 100000, annualReturnPercent: 8, monthlyWithdrawal: 6200, years: 4 })
    const sum = r.yearlyData.reduce((a, y) => a + (y.withdrawals ?? 0), 0)
    expect(sum).toBeCloseTo(r.summary.totalWithdrawn!, 4)
    expect(r.yearlyData[0].isExhausted).toBe(false)
    expect(r.yearlyData[r.yearlyData.length - 1].isExhausted).toBe(true)
  })

  it('a withdrawal larger than the corpus empties it in month 1', () => {
    const r = calculateSWP({ initialCorpus: 5000, annualReturnPercent: 0, monthlyWithdrawal: 9000, years: 1 })
    expect(r.summary.exhaustionMonth).toBe(1)
    expect(r.summary.totalWithdrawn).toBe(5000)
  })

  it('exhaustion mid-year: that year shows the capped withdrawal, later years stay at zero, returns reconcile', () => {
    // Corpus runs out partway through year 2 (month 18), not on a year boundary.
    const r = calculateSWP({ initialCorpus: 100000, annualReturnPercent: 8, monthlyWithdrawal: 6200, years: 4 })
    expect(r.summary.exhaustionYear).toBe(2)
    const y2 = r.yearlyData.find((y) => y.year === 2)!
    expect(y2.withdrawals!).toBeGreaterThan(0)
    expect(y2.withdrawals!).toBeLessThan(12 * 6200)
    expect(y2.closingBalance).toBe(0)
    expect(y2.isExhausted).toBe(true)
    for (const y of r.yearlyData.filter((y) => y.year > 2)) {
      expect(y.withdrawals).toBe(0)
      expect(y.closingBalance).toBe(0)
      expect(y.isExhausted).toBe(true)
    }
    const sumReturns = r.yearlyData.reduce((s, y) => s + y.returns, 0)
    expect(sumReturns).toBeCloseTo(r.monthlyData[r.monthlyData.length - 1].interest, 2)
  })
})
