import {
  calculateSIP, calculateStepUpSIP, calculateLumpsum, calculateGoalSIP, calculateNPS,
  calculateFD, calculateRD, calculatePPF, calculateSWP, calculateCAGR, calculateInflation,
  compareInvestments, buildComparisonSeries,
} from '../../src/calculations'
import type { CalculationResult } from '../../src/types/calculator'
import { buildCSV } from '../../src/utils/csvExport'

/** Invariants every calculator must satisfy so tables, charts and exports agree. */
function expectInternallyConsistent(r: CalculationResult) {
  const last = r.yearlyData[r.yearlyData.length - 1]
  expect(last.closingBalance).toBeCloseTo(r.summary.finalValue, 4)
  expect(r.yearlyData.reduce((a, y) => a + y.invested, 0)).toBeCloseTo(last.totalInvestedTillDate, 4)
  for (let i = 1; i < r.yearlyData.length; i++) {
    expect(r.yearlyData[i].openingBalance).toBeCloseTo(r.yearlyData[i - 1].closingBalance, 6)
  }
  for (const m of r.monthlyData) {
    for (const v of [m.balance, m.invested, m.interest]) expect(Number.isFinite(v)).toBe(true)
  }
}

const cases: [string, CalculationResult][] = [
  ['SIP', calculateSIP({ monthlyInvestment: 10000, initialLumpsum: 50000, annualReturnPercent: 12, years: 10 })],
  ['Step-Up SIP', calculateStepUpSIP({ initialMonthlySip: 10000, stepUpMode: 'percentage', stepUpValue: 10, annualReturnPercent: 12, years: 10 })],
  ['Lumpsum', calculateLumpsum({ initialInvestment: 500000, annualReturnPercent: 10, years: 8 })],
  ['FD', calculateFD({ principal: 100000, annualRatePercent: 7, tenureValue: 30, tenureUnit: 'months', compoundingFrequency: 'quarterly', cumulative: true })],
  ['RD', calculateRD({ monthlyDeposit: 5000, annualRatePercent: 7, tenureMonths: 30, compoundingFrequency: 'quarterly' })],
  ['PPF', calculatePPF({ annualContribution: 150000, annualRatePercent: 7.1, years: 15, contributionTiming: 'start' })],
  ['NPS', calculateNPS({ monthlyContribution: 5000, annualReturnPercent: 10, years: 25, annualStepUpPercent: 5 })],
  ['Goal SIP', calculateGoalSIP({ goalAmount: 5000000, currentSavings: 100000, years: 12, annualReturnPercent: 12, inflationRate: 5 })],
  ['SWP', calculateSWP({ initialCorpus: 5000000, annualReturnPercent: 8, monthlyWithdrawal: 30000, years: 15, annualIncreasePercent: 5 })],
  ['CAGR', calculateCAGR({ initialValue: 100000, finalValue: 300000, years: 6 })],
]

describe('integration: engine-wide consistency', () => {
  it.each(cases)('%s: yearly table, monthly series and summary agree', (_n, r) => expectInternallyConsistent(r))

  it.each(cases.filter(([n]) => n !== 'CAGR'))('%s: totalReturns = finalValue + withdrawn - totalInvested', (_n, r) => {
    const w = r.summary.totalWithdrawn ?? 0
    expect(r.summary.totalReturns).toBeCloseTo(r.summary.finalValue + w - r.summary.totalInvested, 4)
  })
})

describe('integration: calculators agree with each other', () => {
  const common = { annualReturnPercent: 12, years: 10 }

  it('Step-Up SIP at 0% step-up == plain SIP', () => {
    const a = calculateSIP({ monthlyInvestment: 10000, ...common })
    const b = calculateStepUpSIP({ initialMonthlySip: 10000, stepUpMode: 'percentage', stepUpValue: 0, ...common })
    expect(b.summary.finalValue).toBeCloseTo(a.summary.finalValue, 6)
    expect(b.summary.totalInvested).toBe(a.summary.totalInvested)
  })

  it('NPS accumulation == SIP; NPS with step-up == Step-Up SIP', () => {
    expect(calculateNPS({ monthlyContribution: 7000, ...common }).summary.finalValue).toBeCloseTo(calculateSIP({ monthlyInvestment: 7000, ...common }).summary.finalValue, 6)
    expect(calculateNPS({ monthlyContribution: 7000, annualStepUpPercent: 8, ...common }).summary.finalValue)
      .toBeCloseTo(calculateStepUpSIP({ initialMonthlySip: 7000, stepUpMode: 'percentage', stepUpValue: 8, ...common }).summary.finalValue, 6)
  })

  it('SIP lumpsum leg == Lumpsum calculator', () => {
    const s = calculateSIP({ monthlyInvestment: 0, initialLumpsum: 200000, ...common })
    const l = calculateLumpsum({ initialInvestment: 200000, ...common })
    expect(s.summary.finalValue).toBeCloseTo(l.summary.finalValue, 6)
  })

  it('SIP is additive: SIP + lumpsum = SIP-with-lumpsum', () => {
    const both = calculateSIP({ monthlyInvestment: 5000, initialLumpsum: 100000, ...common }).summary.finalValue
    const parts = calculateSIP({ monthlyInvestment: 5000, ...common }).summary.finalValue + calculateLumpsum({ initialInvestment: 100000, ...common }).summary.finalValue
    expect(both).toBeCloseTo(parts, 4)
  })

  it('Goal SIP round trip: the required SIP fed into the SIP calculator reaches the inflated goal', () => {
    const g = calculateGoalSIP({ goalAmount: 8000000, currentSavings: 250000, years: 14, annualReturnPercent: 11, inflationRate: 6 })
    const s = calculateSIP({ monthlyInvestment: g.summary.requiredMonthlySip!, initialLumpsum: 250000, annualReturnPercent: 11, years: 14 })
    expect(s.summary.finalValue).toBeCloseTo(g.summary.inflationAdjustedGoal!, 2)
  })

  it("SIP's inflation-adjusted value matches the Inflation calculator's purchasing power", () => {
    const s = calculateSIP({ monthlyInvestment: 10000, inflationRate: 6, ...common })
    const i = calculateInflation({ currentAmount: s.summary.finalValue, inflationRatePercent: 6, years: 10 })
    expect(s.summary.inflationAdjustedValue).toBeCloseTo(i.equivalentPurchasingPower, 4)
  })

  it('CAGR inverts Lumpsum growth', () => {
    const l = calculateLumpsum({ initialInvestment: 100000, annualReturnPercent: 13, years: 7 })
    expect(calculateCAGR({ initialValue: 100000, finalValue: l.summary.finalValue, years: 7 }).cagrPercent).toBeCloseTo(13, 8)
  })

  it('FD with yearly compounding == Lumpsum at the same rate', () => {
    const fd = calculateFD({ principal: 100000, annualRatePercent: 8, tenureValue: 6, tenureUnit: 'years', compoundingFrequency: 'yearly', cumulative: true })
    const l = calculateLumpsum({ initialInvestment: 100000, annualReturnPercent: 8, years: 6 })
    expect(fd.summary.finalValue).toBeCloseTo(l.summary.finalValue, 4)
  })

  it('RD with monthly compounding == annuity-due at the nominal monthly rate', () => {
    const rd = calculateRD({ monthlyDeposit: 2000, annualRatePercent: 6, tenureMonths: 24, compoundingFrequency: 'monthly' })
    const i = 0.06 / 12
    expect(rd.summary.finalValue).toBeCloseTo(2000 * ((Math.pow(1 + i, 24) - 1) / i) * (1 + i), 4)
  })

  it('SWP at 0% return drains a corpus in exactly corpus/withdrawal months', () => {
    const swp = calculateSWP({ initialCorpus: 1200000, annualReturnPercent: 0, monthlyWithdrawal: 10000, years: 10 })
    expect(swp.summary.exhaustionMonth).toBe(120)
    expect(swp.summary.totalWithdrawn).toBeCloseTo(1200000, 6)
  })
})

describe('integration: comparison + export pipeline', () => {
  const sip = calculateSIP({ monthlyInvestment: 10000, annualReturnPercent: 12, years: 10 })
  const fd = calculateFD({ principal: 1200000, annualRatePercent: 7, tenureValue: 5, tenureUnit: 'years', compoundingFrequency: 'quarterly', cumulative: true })
  const entries = [{ name: 'SIP', type: 'sip', result: sip }, { name: 'FD', type: 'fd', result: fd }]

  it('compareInvestments keeps results and assigns distinct colours', () => {
    const sc = compareInvestments(entries)
    expect(sc).toHaveLength(2)
    expect(sc[0].color).not.toBe(sc[1].color)
    expect(sc[0].result).toBe(sip)
  })

  it('buildComparisonSeries spans the longest horizon and holds a shorter series at its last value', () => {
    const rows = buildComparisonSeries(compareInvestments(entries))
    expect(rows).toHaveLength(10)
    expect(rows[4].FD).toBe(Math.round(fd.summary.finalValue))
    // NOTE: past a series' end the engine holds the *unrounded* last balance (in-range values are rounded) — harmless, but why this is closeTo.
    expect(rows[9].FD as number).toBeCloseTo(fd.summary.finalValue, 0)
    expect(rows[9].SIP).toBe(Math.round(sip.summary.finalValue))
  })

  it('buildComparisonSeries on nothing is empty', () => {
    expect(buildComparisonSeries([])).toEqual([])
  })

  it('CSV export carries the exact (rounded) numbers from the result', () => {
    const csv = buildCSV(sip, [{ key: 'year', label: 'Year' }, { key: 'closingBalance', label: 'Balance' }])
    const lines = csv.split('\n')
    expect(lines[0]).toBe('Calculator,SIP')
    expect(lines).toContain(`Total Invested,${Math.round(sip.summary.totalInvested)}`)
    expect(lines).toContain(`Final Value,${Math.round(sip.summary.finalValue)}`)
    expect(lines).toContain('Year,Balance')
    expect(lines).toContain(`10,${Math.round(sip.yearlyData[9].closingBalance)}`)
  })
})

describe('integration: large inputs stay finite', () => {
  it('SIP, CAGR and Inflation never yield NaN/Infinity for realistic large values', () => {
    const sip = calculateSIP({ monthlyInvestment: 10_00_000, annualReturnPercent: 15, years: 1 })
    expect(Number.isFinite(sip.summary.finalValue)).toBe(true)
    expect(sip.summary.finalValue).toBeGreaterThan(sip.summary.totalInvested)
    expect(Number.isFinite(calculateCAGR({ initialValue: 1, finalValue: 100_00_00_000, years: 25 }).cagrPercent)).toBe(true)
    const inf = calculateInflation({ currentAmount: 50_00_00_000, inflationRatePercent: 12, years: 40 })
    expect(Number.isFinite(inf.futureAmountRequired)).toBe(true)
    expect(Number.isFinite(inf.equivalentPurchasingPower)).toBe(true)
  })
})
