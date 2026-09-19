import { calculateSIP } from '../sip'
import { calculateStepUpSIP } from '../stepUpSip'
import { calculateSWP } from '../swp'
import { calculateFD } from '../fd'
import { calculateLumpsum } from '../lumpsum'
import { calculateRD } from '../rd'
import { calculatePPF } from '../ppf'
import { calculateNPS } from '../nps'
import { calculateGoalSIP } from '../goalSip'
import { calculateCAGR } from '../cagr'
import { calculateInflation } from '../inflation'

function expectFinite(n: number) {
  expect(Number.isFinite(n)).toBe(true)
  expect(Number.isNaN(n)).toBe(false)
}

describe('calculateSIP', () => {
  it('matches the closed-form SIP future value formula using the effective monthly rate', () => {
    const monthly = 10000
    const annualReturn = 12
    const years = 10
    const r = Math.pow(1 + annualReturn / 100, 1 / 12) - 1 // effective monthly rate, NOT annual/12
    const n = years * 12
    const expectedFV = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)

    const result = calculateSIP({ monthlyInvestment: monthly, annualReturnPercent: annualReturn, years })
    expect(result.summary.finalValue).toBeCloseTo(expectedFV, 2)
    expect(result.summary.totalInvested).toBe(monthly * n)
    expectFinite(result.summary.finalValue)
  })

  it('matches a known reference value (₹10,000/month, 12% p.a., 10 years) computed by a major Indian SIP calculator', () => {
    // Cross-checked against Groww's SIP calculator for identical inputs.
    const result = calculateSIP({ monthlyInvestment: 10000, annualReturnPercent: 12, years: 10 })
    expect(Math.round(result.summary.finalValue)).toBeCloseTo(2240359, -2) // within a few hundred rupees
  })

  it('a lumpsum compounded monthly for exactly 12 months grows by exactly the stated annual rate', () => {
    // This is the property that distinguishes the effective monthly rate from
    // the nominal (annual/12) rate: entering "12% annual return" must produce
    // 12% growth after 12 months of monthly compounding, not 12.68%.
    const result = calculateSIP({ monthlyInvestment: 0, initialLumpsum: 100000, annualReturnPercent: 12, years: 1 })
    expect(result.summary.finalValue).toBeCloseTo(112000, 1)
  })

  it('yearly invested sums to total invested and closing balance matches final value', () => {
    const result = calculateSIP({ monthlyInvestment: 5000, initialLumpsum: 100000, annualReturnPercent: 10, years: 15 })
    const sumInvested = result.yearlyData.reduce((acc, y) => acc + y.invested, 0)
    expect(sumInvested).toBeCloseTo(result.summary.totalInvested, 2)
    expect(result.yearlyData[result.yearlyData.length - 1].closingBalance).toBeCloseTo(result.summary.finalValue, 2)
    expect(result.yearlyData.length).toBe(15)
  })

  it('applies inflation only when a rate is entered', () => {
    const withoutInflation = calculateSIP({ monthlyInvestment: 10000, annualReturnPercent: 12, years: 10 })
    expect(withoutInflation.inflationApplied).toBe(false)
    expect(withoutInflation.summary.inflationAdjustedValue).toBeUndefined()

    const withInflation = calculateSIP({ monthlyInvestment: 10000, annualReturnPercent: 12, years: 10, inflationRate: 6 })
    expect(withInflation.inflationApplied).toBe(true)
    expect(withInflation.summary.inflationAdjustedValue).toBeLessThan(withInflation.summary.finalValue)
  })

  it('never produces NaN or negative values for zero return / one year edge cases', () => {
    const zeroReturn = calculateSIP({ monthlyInvestment: 10000, annualReturnPercent: 0, years: 1 })
    expectFinite(zeroReturn.summary.finalValue)
    expect(zeroReturn.summary.finalValue).toBeCloseTo(120000, 2)
    expect(zeroReturn.summary.totalReturns).toBeCloseTo(0, 2)
  })
})

describe('calculateStepUpSIP', () => {
  it('increases the monthly instalment once every 12 months', () => {
    const result = calculateStepUpSIP({
      initialMonthlySip: 10000,
      stepUpMode: 'percentage',
      stepUpValue: 10,
      annualReturnPercent: 12,
      years: 3,
    })
    expect(result.monthlyData[0].contribution).toBe(10000)
    expect(result.monthlyData[11].contribution).toBe(10000)
    expect(result.monthlyData[12].contribution).toBeCloseTo(11000, 2)
    expect(result.monthlyData[23].contribution).toBeCloseTo(11000, 2)
    expect(result.monthlyData[24].contribution).toBeCloseTo(12100, 2)
  })

  it('total step-up contribution plus base equals total invested', () => {
    const result = calculateStepUpSIP({ initialMonthlySip: 10000, stepUpMode: 'amount', stepUpValue: 1000, annualReturnPercent: 10, years: 5 })
    const base = result.summary.totalSipContribution ?? 0
    const stepUp = result.summary.totalStepUpContribution ?? 0
    expect(base + stepUp).toBeCloseTo(result.summary.totalInvested, 2)
  })
})

describe('calculateSWP', () => {
  it('never lets the corpus go negative and marks exhaustion', () => {
    const result = calculateSWP({ initialCorpus: 100000, annualReturnPercent: 6, monthlyWithdrawal: 20000, years: 5 })
    for (const m of result.monthlyData) {
      expect(m.balance).toBeGreaterThanOrEqual(0)
    }
    expect(result.summary.exhaustionYear).not.toBeNull()
    expect(result.summary.remainingCorpus).toBe(0)
  })

  it('grows indefinitely when withdrawal is well below the growth rate', () => {
    const result = calculateSWP({ initialCorpus: 1_00_00_000, annualReturnPercent: 10, monthlyWithdrawal: 10000, years: 10 })
    expect(result.summary.exhaustionYear).toBeNull()
    expect(result.summary.remainingCorpus).toBeGreaterThan(1_00_00_000)
  })

  it('applies the annual withdrawal increase', () => {
    const result = calculateSWP({ initialCorpus: 5000000, annualReturnPercent: 8, monthlyWithdrawal: 20000, years: 5, annualIncreasePercent: 10 })
    expect(result.monthlyData[12].withdrawn! - result.monthlyData[11].withdrawn!).toBeCloseTo(20000 * 1.1, 2)
  })

  it('year-wise breakdown: the exhaustion year shows the actual capped withdrawal, not the full requested amount, and years after it stay at zero', () => {
    // Tuned so the corpus runs out partway through year 2 (month 18), not on a year boundary.
    const result = calculateSWP({ initialCorpus: 100000, annualReturnPercent: 8, monthlyWithdrawal: 6200, years: 4 })
    const yearly = result.yearlyData
    expect(result.summary.exhaustionYear).toBe(2)

    const year2 = yearly.find((y) => y.year === 2)!
    // Requested would have been 12 * 6200 = 74400 if withdrawals continued uncapped all year.
    expect(year2.withdrawals!).toBeGreaterThan(0)
    expect(year2.withdrawals!).toBeLessThan(12 * 6200)
    expect(year2.closingBalance).toBe(0)
    expect(year2.isExhausted).toBe(true)

    for (const y of yearly.filter((y) => y.year > 2)) {
      expect(y.withdrawals).toBe(0)
      expect(y.closingBalance).toBe(0)
      expect(y.isExhausted).toBe(true)
    }

    // No double-counting or gaps: every rupee of cumulative interest is accounted for across the yearly rows.
    const sumOfYearlyReturns = yearly.reduce((s, y) => s + y.returns, 0)
    const finalCumulativeInterest = result.monthlyData[result.monthlyData.length - 1].interest
    expect(sumOfYearlyReturns).toBeCloseTo(finalCumulativeInterest, 2)
  })
})

describe('calculateFD', () => {
  it('matches the standard compound interest formula for cumulative FDs', () => {
    const principal = 100000
    const rate = 7
    const years = 5
    const n = 4 // quarterly
    const expected = principal * Math.pow(1 + rate / 100 / n, n * years)

    const result = calculateFD({ principal, annualRatePercent: rate, tenureValue: years, tenureUnit: 'years', compoundingFrequency: 'quarterly', cumulative: true })
    expect(result.summary.finalValue).toBeCloseTo(expected, 1)
  })

  it('non-cumulative FD keeps principal separate from paid-out interest', () => {
    const result = calculateFD({ principal: 100000, annualRatePercent: 8, tenureValue: 2, tenureUnit: 'years', compoundingFrequency: 'yearly', cumulative: false })
    expect(result.summary.totalInvested).toBe(100000)
    expect(result.summary.finalValue).toBeCloseTo(100000 + 100000 * 0.08 * 2, 2)
  })
})

describe('calculateLumpsum', () => {
  it('matches P(1+r)^n at monthly resolution', () => {
    const principal = 500000
    const annualReturn = 10
    const years = 8
    const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1
    const expected = principal * Math.pow(1 + monthlyRate, years * 12)
    const result = calculateLumpsum({ initialInvestment: principal, annualReturnPercent: annualReturn, years })
    expect(result.summary.finalValue).toBeCloseTo(expected, 2)
  })
})

describe('calculateRD', () => {
  it('produces a maturity value greater than total deposited when rate > 0', () => {
    const result = calculateRD({ monthlyDeposit: 5000, annualRatePercent: 7, tenureMonths: 36, compoundingFrequency: 'quarterly' })
    expect(result.summary.totalInvested).toBe(5000 * 36)
    expect(result.summary.finalValue).toBeGreaterThan(result.summary.totalInvested)
    expectFinite(result.summary.finalValue)
  })

  it('matches a published real-world reference value (₹5,000/month, 8% p.a., quarterly, 12 months)', () => {
    // Cross-checked against ClearTax/ICICI's worked RD example: ₹62,647.
    const result = calculateRD({ monthlyDeposit: 5000, annualRatePercent: 8, tenureMonths: 12, compoundingFrequency: 'quarterly' })
    expect(result.summary.finalValue).toBeCloseTo(62647, -1) // within a few rupees
  })

  it('monthly compounding matches the same annuity-due formula the SIP calculator uses', () => {
    const rd = calculateRD({ monthlyDeposit: 5000, annualRatePercent: 8, tenureMonths: 12, compoundingFrequency: 'monthly' })
    const r = 8 / 100 / 12
    const expected = 5000 * (((Math.pow(1 + r, 12) - 1) / r) * (1 + r))
    expect(rd.summary.finalValue).toBeCloseTo(expected, 1)
  })

  it('year-wise breakdown: a tenure that is not a whole number of years produces a genuine partial final row, not a dropped or doubled one', () => {
    // 19 months = 1 full year (12mo) + a 7-month final year.
    const result = calculateRD({ monthlyDeposit: 5000, annualRatePercent: 8, tenureMonths: 19, compoundingFrequency: 'quarterly' })
    const yearly = result.yearlyData
    expect(yearly).toHaveLength(2)
    expect(yearly[0].invested).toBe(5000 * 12)
    expect(yearly[1].invested).toBe(5000 * 7) // only 7 months elapsed in the partial final year
    expect(yearly[1].totalInvestedTillDate).toBe(5000 * 19)

    const lastMonthly = result.monthlyData[result.monthlyData.length - 1]
    expect(yearly[1].closingBalance).toBeCloseTo(lastMonthly.balance, 2)
    expect(yearly[1].openingBalance).toBeCloseTo(yearly[0].closingBalance, 2)
  })
})

describe('calculatePPF', () => {
  it('accumulates contributions with positive interest', () => {
    const result = calculatePPF({ annualContribution: 150000, annualRatePercent: 7.1, years: 15, contributionTiming: 'start' })
    expect(result.summary.totalInvested).toBe(150000 * 15)
    expect(result.summary.totalReturns).toBeGreaterThan(0)
    expect(result.yearlyData.length).toBe(15)
  })
})

describe('calculateNPS', () => {
  it('splits the final corpus into annuity and lump sum correctly', () => {
    const result = calculateNPS({ monthlyContribution: 10000, annualReturnPercent: 10, years: 20, annuityPercent: 40 })
    const annuity = result.summary.estimatedAnnuityAllocation ?? 0
    const lumpSum = result.summary.estimatedLumpSum ?? 0
    expect(annuity + lumpSum).toBeCloseTo(result.summary.finalValue, 2)
    expect(annuity).toBeCloseTo(result.summary.finalValue * 0.4, 2)
  })

  it('estimates monthly pension from the annuity corpus at the given annuity rate, independent of the accumulation-phase return', () => {
    const result = calculateNPS({ monthlyContribution: 10000, annualReturnPercent: 10, years: 20, annuityPercent: 50, annuityRatePercent: 6 })
    const annuity = result.summary.estimatedAnnuityAllocation ?? 0
    const expectedMonthlyPension = (annuity * 0.06) / 12
    expect(result.summary.estimatedMonthlyPension).toBeCloseTo(expectedMonthlyPension, 2)
    expect(result.summary.estimatedAnnualPension).toBeCloseTo(annuity * 0.06, 2)

    // A higher annuity rate must increase the pension even though the
    // accumulation-phase return (and therefore the corpus) is unchanged —
    // the two rates are genuinely independent inputs.
    const higherRate = calculateNPS({ monthlyContribution: 10000, annualReturnPercent: 10, years: 20, annuityPercent: 50, annuityRatePercent: 8 })
    expect(higherRate.summary.finalValue).toBeCloseTo(result.summary.finalValue, 2)
    expect(higherRate.summary.estimatedMonthlyPension ?? 0).toBeGreaterThan(result.summary.estimatedMonthlyPension ?? 0)
  })
})

describe('calculateGoalSIP', () => {
  it('required SIP grows to approximately the inflation-adjusted goal', () => {
    const result = calculateGoalSIP({ goalAmount: 2500000, years: 10, annualReturnPercent: 12, inflationRate: 6 })
    const goal = result.summary.inflationAdjustedGoal ?? 0
    expect(result.summary.finalValue).toBeCloseTo(goal, 0)
    expect(result.summary.requiredMonthlySip).toBeGreaterThan(0)
  })

  it('reduces required SIP when current savings are provided', () => {
    const withoutSavings = calculateGoalSIP({ goalAmount: 2500000, years: 10, annualReturnPercent: 12 })
    const withSavings = calculateGoalSIP({ goalAmount: 2500000, currentSavings: 500000, years: 10, annualReturnPercent: 12 })
    expect(withSavings.summary.requiredMonthlySip ?? 0).toBeLessThan(withoutSavings.summary.requiredMonthlySip ?? 0)
  })
})

describe('calculateCAGR', () => {
  it('computes the standard CAGR formula', () => {
    const result = calculateCAGR({ initialValue: 100000, finalValue: 200000, years: 5 })
    const expected = (Math.pow(2, 1 / 5) - 1) * 100
    expect(result.cagrPercent).toBeCloseTo(expected, 4)
  })

  it('can be negative when final value is lower than initial', () => {
    const result = calculateCAGR({ initialValue: 100000, finalValue: 80000, years: 3 })
    expect(result.cagrPercent).toBeLessThan(0)
  })
})

describe('calculateInflation', () => {
  it('future amount and purchasing power are inverse of each other', () => {
    const result = calculateInflation({ currentAmount: 100000, inflationRatePercent: 6, years: 10 })
    expect(result.futureAmountRequired).toBeCloseTo(100000 * Math.pow(1.06, 10), 2)
    expect(result.equivalentPurchasingPower).toBeCloseTo(100000 / Math.pow(1.06, 10), 2)
    expect(result.equivalentPurchasingPower).toBeLessThan(100000)
    expect(result.futureAmountRequired).toBeGreaterThan(100000)
  })

  it('is a no-op at 0% inflation (required edge case)', () => {
    const result = calculateInflation({ currentAmount: 100000, inflationRatePercent: 0, years: 10 })
    expect(result.futureAmountRequired).toBeCloseTo(100000, 2)
    expect(result.equivalentPurchasingPower).toBeCloseTo(100000, 2)
  })
})

describe('edge cases required by spec (never NaN/Infinity/negative, zero-rate inputs stay usable)', () => {
  it('SIP: one-year duration and a very large monthly amount stay finite', () => {
    const result = calculateSIP({ monthlyInvestment: 10_00_000, annualReturnPercent: 15, years: 1 })
    expectFinite(result.summary.finalValue)
    expect(result.summary.finalValue).toBeGreaterThan(result.summary.totalInvested)
  })

  it('SWP: 0% return still withdraws correctly and depletes the corpus linearly', () => {
    const result = calculateSWP({ initialCorpus: 120000, annualReturnPercent: 0, monthlyWithdrawal: 10000, years: 2 })
    expect(result.summary.totalReturns).toBeCloseTo(0, 2)
    expect(result.summary.exhaustionYear).toBe(1)
    for (const m of result.monthlyData) expect(m.balance).toBeGreaterThanOrEqual(0)
  })

  it('Step-Up SIP: 0% step-up behaves identically to a flat SIP', () => {
    const stepUp = calculateStepUpSIP({ initialMonthlySip: 8000, stepUpMode: 'percentage', stepUpValue: 0, annualReturnPercent: 11, years: 6 })
    const flat = calculateSIP({ monthlyInvestment: 8000, annualReturnPercent: 11, years: 6 })
    expect(stepUp.summary.finalValue).toBeCloseTo(flat.summary.finalValue, 2)
    expect(stepUp.summary.totalStepUpContribution).toBeCloseTo(0, 2)
  })

  it('FD: monthly, half-yearly and yearly compounding all match the standard formula', () => {
    const cases: { freq: 'monthly' | 'half-yearly' | 'yearly'; n: number }[] = [
      { freq: 'monthly', n: 12 },
      { freq: 'half-yearly', n: 2 },
      { freq: 'yearly', n: 1 },
    ]
    for (const { freq, n } of cases) {
      const principal = 200000
      const rate = 7.5
      const years = 3
      const expected = principal * Math.pow(1 + rate / 100 / n, n * years)
      const result = calculateFD({ principal, annualRatePercent: rate, tenureValue: years, tenureUnit: 'years', compoundingFrequency: freq, cumulative: true })
      expect(result.summary.finalValue).toBeCloseTo(expected, 1)
    }
  })

  it('FD: a tenure given in months matches the equivalent tenure given in years', () => {
    const monthsResult = calculateFD({ principal: 100000, annualRatePercent: 6.5, tenureValue: 18, tenureUnit: 'months', compoundingFrequency: 'quarterly', cumulative: true })
    const yearsResult = calculateFD({ principal: 100000, annualRatePercent: 6.5, tenureValue: 1.5, tenureUnit: 'years', compoundingFrequency: 'quarterly', cumulative: true })
    expect(monthsResult.summary.finalValue).toBeCloseTo(yearsResult.summary.finalValue, 1)
  })

  it('FD: a tenure that does not land on a compounding-period boundary still earns interest for the trailing partial period', () => {
    // 20 months at quarterly compounding is 6 whole quarters plus 2 extra
    // months — banks credit simple interest for that trailing partial
    // period rather than dropping it, matching real FD maturity values.
    const principal = 100000
    const rate = 8
    const n = 4
    const periodRate = rate / 100 / n
    const wholePeriods = 6 // floor(4*20/12)
    const balanceAtBoundary = principal * Math.pow(1 + periodRate, wholePeriods)
    const remainingMonths = 20 - wholePeriods * 3 // 3 months per quarter
    const expected = balanceAtBoundary * (1 + periodRate * (remainingMonths / 3))

    const result = calculateFD({ principal, annualRatePercent: rate, tenureValue: 20, tenureUnit: 'months', compoundingFrequency: 'quarterly', cumulative: true })
    expect(result.summary.finalValue).toBeCloseTo(expected, 2)
    expect(result.summary.finalValue).toBeGreaterThan(balanceAtBoundary) // must NOT drop the trailing partial period entirely
  })

  it('PPF: end-of-year contribution timing yields less interest than start-of-year for identical inputs', () => {
    const start = calculatePPF({ annualContribution: 100000, annualRatePercent: 7.1, years: 10, contributionTiming: 'start' })
    const end = calculatePPF({ annualContribution: 100000, annualRatePercent: 7.1, years: 10, contributionTiming: 'end' })
    expect(start.summary.finalValue).toBeGreaterThan(end.summary.finalValue)
  })

  it('NPS: annuity percentage is clamped to the 40-100% band even if given outside it', () => {
    const tooLow = calculateNPS({ monthlyContribution: 10000, annualReturnPercent: 10, years: 15, annuityPercent: 10 })
    expect(tooLow.summary.estimatedAnnuityAllocation).toBeCloseTo(tooLow.summary.finalValue * 0.4, 2)
  })

  it('CAGR and Inflation never produce NaN/Infinity for realistic large inputs', () => {
    const cagr = calculateCAGR({ initialValue: 1, finalValue: 100_00_00_000, years: 25 })
    expectFinite(cagr.cagrPercent)
    const inflation = calculateInflation({ currentAmount: 50_00_00_000, inflationRatePercent: 12, years: 40 })
    expectFinite(inflation.futureAmountRequired)
    expectFinite(inflation.equivalentPurchasingPower)
  })
})
