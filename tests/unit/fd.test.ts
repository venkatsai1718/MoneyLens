import { calculateFD, FDInput } from '../../src/calculations/fd'
import { REF } from '../support/references'

const base: FDInput = { principal: 100000, annualRatePercent: 7, tenureValue: 5, tenureUnit: 'years', compoundingFrequency: 'quarterly', cumulative: true }

describe('calculateFD — cumulative reference values', () => {
  it('₹1L @7% quarterly 5y', () => {
    expect(calculateFD(base).summary.finalValue).toBeCloseTo(REF.fd.q_1L_7_5, 0)
  })
  it('₹1L @7% monthly 5y', () => {
    expect(calculateFD({ ...base, compoundingFrequency: 'monthly' }).summary.finalValue).toBeCloseTo(REF.fd.m_1L_7_5, 0)
  })
  it('₹1L @6.5% yearly 3y', () => {
    const r = calculateFD({ ...base, annualRatePercent: 6.5, tenureValue: 3, compoundingFrequency: 'yearly' })
    expect(r.summary.finalValue).toBeCloseTo(REF.fd.y_1L_6_5_3, 0)
    expect(r.summary.totalReturns).toBeCloseTo(REF.fd.y_1L_6_5_3 - 100000, 0)
  })
  it('₹5L @7.1% half-yearly 2y', () => {
    const r = calculateFD({ ...base, principal: 500000, annualRatePercent: 7.1, tenureValue: 2, compoundingFrequency: 'half-yearly' })
    expect(r.summary.finalValue).toBeCloseTo(REF.fd.h_5L_7_1_2, 0)
  })
})

describe('calculateFD — behaviour', () => {
  it('more frequent compounding yields more', () => {
    const f = (c: FDInput['compoundingFrequency']) => calculateFD({ ...base, compoundingFrequency: c }).summary.finalValue
    expect(f('monthly')).toBeGreaterThan(f('quarterly'))
    expect(f('quarterly')).toBeGreaterThan(f('half-yearly'))
    expect(f('half-yearly')).toBeGreaterThan(f('yearly'))
  })

  it('senior-citizen extra rate is added to the base rate', () => {
    const sr = calculateFD({ ...base, seniorCitizenExtraRate: 0.5 })
    const plain = calculateFD({ ...base, annualRatePercent: 7.5 })
    expect(sr.summary.finalValue).toBeCloseTo(plain.summary.finalValue, 6)
    expect(sr.assumptions.find((a) => a.label === 'Interest Rate')?.value).toContain('senior citizen')
  })

  it('non-cumulative: simple interest paid out, principal intact (₹1L @7% 5y = ₹35,000)', () => {
    const r = calculateFD({ ...base, cumulative: false, compoundingFrequency: 'yearly' })
    expect(r.summary.totalReturns).toBeCloseTo(35000, 4)
    expect(r.summary.finalValue).toBeCloseTo(135000, 4)
  })

  it('tenure in months equals the same tenure in years', () => {
    const m = calculateFD({ ...base, tenureValue: 36, tenureUnit: 'months' }).summary.finalValue
    const y = calculateFD({ ...base, tenureValue: 3, tenureUnit: 'years' }).summary.finalValue
    expect(m).toBeCloseTo(y, 6)
  })

  it('partial trailing period earns simple interest (₹1L @8% yearly, 18 months = 1.08 * (1+0.08*0.5))', () => {
    const r = calculateFD({ ...base, annualRatePercent: 8, tenureValue: 18, tenureUnit: 'months', compoundingFrequency: 'yearly' })
    expect(r.summary.finalValue).toBeCloseTo(100000 * 1.08 * 1.04, 4)
    expect(r.yearlyData).toHaveLength(2)
  })

  it('0% rate returns the principal', () => {
    expect(calculateFD({ ...base, annualRatePercent: 0 }).summary.finalValue).toBeCloseTo(100000, 6)
  })

  it('reports an effective annualised return above the nominal rate for sub-annual compounding', () => {
    const v = calculateFD(base).assumptions.find((a) => a.label === 'Effective Annualized Return')!.value
    expect(parseFloat(v)).toBeCloseTo(7.19, 2) // (1+0.07/4)^4 - 1
  })
})
