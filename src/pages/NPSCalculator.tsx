import React, { useMemo } from 'react'
import { CalculatorLayout } from '../components/layout/CalculatorLayout'
import { CurrencyInput, PercentageInput, YearsInput, SummaryRow, ChartCard, DataTable, ExportMenu, Disclaimer, FAQ, SectionHeading, Card } from '../components/ui'
import { GrowthChart } from '../charts/GrowthChart'
import { InvestedVsReturnsChart } from '../charts/InvestedVsReturnsChart'
import { calculateNPS } from '../calculations'
import { validateAmount, validateRate, validateYears, isFormValid } from '../utils/validation'
import { buildCSV, downloadCSV } from '../utils/csvExport'
import { downloadPDF } from '../utils/pdfExport'
import { formatINR } from '../utils/format'
import { DISCLAIMER_TEXT } from '../components/ui/Disclaimer'
import type { DataTableColumn } from '../components/ui/DataTable'

const YEARLY_COLUMNS: DataTableColumn[] = [
  { key: 'year', label: 'Year', isCurrency: false },
  { key: 'invested', label: 'Invested' },
  { key: 'returns', label: 'Expected Returns' },
  { key: 'closingBalance', label: 'Total Value' },
]

const RETIREMENT_AGE = 60

const FAQS = [
  { question: 'What is NPS?', answer: 'The National Pension System (NPS) is a government-regulated, market-linked retirement savings scheme where contributions are invested across equity, corporate debt and government securities, per your chosen asset allocation.' },
  { question: 'Why does this calculator ask for my current age instead of a tenure?', answer: 'NPS contributions run from whenever you join until the statutory retirement age of 60 (Tier I) — the investment period is not really a free choice like it is for a SIP. Entering your current age lets the calculator work out that tenure for you, the same way most bank and NPS Trust calculators do.' },
  { question: 'How is the annuity split determined?', answer: 'At retirement, current NPS rules require a minimum portion of the corpus (commonly 40%) to be used to purchase an annuity (a regular pension), with the remainder available as a lump sum. This calculator lets you set that split within a 40–100% range.' },
  { question: 'Is 40% annuitization mandatory?', answer: 'Under prevailing rules, a minimum annuitization percentage applies at retirement — this calculator defaults to 40% but always confirm current regulations, as rules can change.' },
  { question: 'Does this calculator account for NPS return volatility?', answer: 'No. NPS returns depend on your chosen pension fund manager and asset allocation, and will fluctuate with markets. This calculator uses a single flat expected-return assumption for simplicity.' },
  { question: 'What happens to the annuity portion of my corpus?', answer: "It is used to purchase an annuity plan from an insurer, which then pays you a regular pension. This calculator estimates that monthly pension as (Annuity Allocation × Annuity Rate) ÷ 12, using the annuity rate you set — the real amount depends on the specific annuity plan, insurer and rate available when you actually retire." },
  { question: 'Can my NPS contribution step up every year?', answer: 'Yes — enter an annual step-up percentage to model contributions that grow each year, similar to a Step-Up SIP.' },
]

export function NPSCalculator() {
  const [monthlyContribution, setMonthlyContribution] = React.useState<number | null>(10000)
  const [annualReturn, setAnnualReturn] = React.useState<number | null>(10)
  const [currentAge, setCurrentAge] = React.useState<number | null>(30)
  const [stepUp, setStepUp] = React.useState<number | null>(null)
  const [annuityPercent, setAnnuityPercent] = React.useState<number | null>(40)
  const [annuityRate, setAnnuityRate] = React.useState<number | null>(6)
  const [inflationRate, setInflationRate] = React.useState<number | null>(null)

  // NPS contributions run until the statutory retirement age (60 for Tier I),
  // not a freely-chosen tenure — so the accumulation period is derived from
  // age rather than asked for directly, matching how real NPS calculators work.
  const years = currentAge !== null ? Math.max(1, RETIREMENT_AGE - currentAge) : null

  const validations = {
    contribution: validateAmount(monthlyContribution, { required: true, label: 'Monthly contribution' }),
    ret: validateRate(annualReturn, { required: true, label: 'Expected return' }),
    age: validateYears(currentAge, { required: true, label: 'Current age', min: 18, max: RETIREMENT_AGE - 1 }),
    stepUp: validateRate(stepUp, { label: 'Annual step-up', max: 50 }),
    annuity: validateRate(annuityPercent, { label: 'Annuity percentage', min: 40, max: 100 }),
    annuityRate: validateRate(annuityRate, { required: true, label: 'Annuity rate', min: 1, max: 15 }),
    inflation: validateRate(inflationRate, { label: 'Inflation', max: 20 }),
  }
  const valid = isFormValid(Object.values(validations))

  const result = useMemo(() => {
    if (!valid || !monthlyContribution || annualReturn === null || !years || annuityRate === null) return null
    return calculateNPS({
      monthlyContribution,
      annualReturnPercent: annualReturn,
      years,
      annualStepUpPercent: stepUp ?? 0,
      annuityPercent: annuityPercent ?? 40,
      annuityRatePercent: annuityRate,
      inflationRate,
    })
  }, [valid, monthlyContribution, annualReturn, years, stepUp, annuityPercent, annuityRate, inflationRate])

  function handleCSV() {
    if (!result) return
    downloadCSV('moneylens-nps-calculation', buildCSV(result, YEARLY_COLUMNS))
  }
  function handlePDF() {
    if (!result) return
    downloadPDF(result, YEARLY_COLUMNS, 'moneylens-nps-calculation', { disclaimer: DISCLAIMER_TEXT })
  }

  return (
    <CalculatorLayout
      seoTitle="NPS Calculator – National Pension System Calculator | MoneyLens"
      seoDescription="Estimate your NPS retirement corpus, annuity allocation, lump sum and monthly pension with a year-wise breakdown. All figures are estimates."
      eyebrow="Retirement Calculator"
      title="NPS Calculator"
      subtitle="Estimate your retirement corpus and the annuity / lump-sum split from your NPS contributions."
    >
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-5 sm:p-7 space-y-5 lg:border-r border-border-soft">
            <CurrencyInput label="Monthly Contribution" value={monthlyContribution} onChange={setMonthlyContribution} max={1_00_000} step={500} error={validations.contribution.error} />
            <PercentageInput
              label="Expected Annual Return"
              value={annualReturn}
              onChange={setAnnualReturn}
              max={20}
              step={0.5}
              error={validations.ret.error}
              hint="Actual NPS returns depend on your chosen fund manager and asset allocation."
            />
            <YearsInput
              label="Current Age"
              value={currentAge}
              onChange={setCurrentAge}
              min={18}
              max={RETIREMENT_AGE - 1}
              error={validations.age.error}
              hint={years !== null ? `Contributing for ${years} year${years === 1 ? '' : 's'}, until retirement at age ${RETIREMENT_AGE}.` : undefined}
            />
            <PercentageInput label="Annual Step-Up" value={stepUp} onChange={setStepUp} max={30} step={1} error={validations.stepUp.error} optional hint="Increase your contribution every year, optional." />
            <PercentageInput
              label="Annuity Percentage"
              value={annuityPercent}
              onChange={setAnnuityPercent}
              min={40}
              max={100}
              step={5}
              error={validations.annuity.error}
              hint="Minimum 40% is typically required to be annuitized under NPS rules."
            />
            <PercentageInput
              label="Assumed Annuity Rate"
              value={annuityRate}
              onChange={setAnnuityRate}
              min={1}
              max={15}
              step={0.25}
              error={validations.annuityRate.error}
              hint="The rate an insurer pays on your annuity corpus at retirement — typically 5–7% p.a., independent of your accumulation-phase return."
            />
            <PercentageInput label="Inflation" value={inflationRate} onChange={setInflationRate} max={15} step={0.5} error={validations.inflation.error} optional />
          </div>

          <div className="p-5 sm:p-7 flex flex-col">
            {!result ? (
              <div className="flex-1 flex items-center justify-center text-center py-10">
                <div>
                  <p className="text-sm font-semibold text-ink">Enter your NPS details</p>
                  <p className="text-xs text-ink-muted mt-1.5 max-w-[220px]">We'll estimate your retirement corpus and annuity split.</p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-ink-muted mb-3">All figures below are estimates.</p>
                <div className="chart-lift rounded-xl h-48 sm:h-56">
                  <InvestedVsReturnsChart invested={result.summary.totalInvested} returns={result.summary.totalReturns} />
                </div>
                <div className="mt-5 space-y-3">
                  <SummaryRow label="Total Contribution" value={result.summary.totalInvested} />
                  <SummaryRow label="Expected Returns" value={result.summary.totalReturns} tone="growth" />
                  <div className="border-t border-border-soft pt-3">
                    <SummaryRow label="Expected Corpus" value={result.summary.finalValue} emphasize />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border-soft space-y-3">
                  <SummaryRow label="Estimated Annuity Allocation" value={result.summary.estimatedAnnuityAllocation ?? 0} />
                  <SummaryRow label="Estimated Lump Sum" value={result.summary.estimatedLumpSum ?? 0} />
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-platinum px-3 py-2.5 mt-3">
                  <span className="text-xs text-ink-muted">Estimated Monthly Pension</span>
                  <span className="text-sm font-bold text-ink tabular-nums">{formatINR(result.summary.estimatedMonthlyPension ?? 0)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {result && (
        <>
          <ChartCard title="Corpus Growth" subtitle="Total contribution vs. expected corpus, year over year">
            <GrowthChart data={result.yearlyData} />
          </ChartCard>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <SectionHeading title="Year-Wise Breakdown" subtitle="Contributions, growth and corpus for each year." align="left" as="h3" />
              <ExportMenu onCSV={handleCSV} onPDF={handlePDF} />
            </div>
            <DataTable columns={YEARLY_COLUMNS} rows={result.yearlyData} />
          </div>
        </>
      )}

      <Card className="p-5 sm:p-7">
        <SectionHeading title="How This NPS Estimate Is Calculated" as="h3" />
        <p className="text-sm text-ink-soft leading-relaxed mb-4">
          The investment period is your current age subtracted from the statutory NPS retirement age of {RETIREMENT_AGE} — not a freely chosen
          number of years — since NPS Tier I contributions run until retirement. The accumulation phase itself works exactly like a Step-Up SIP:
          your monthly contribution compounds at the effective monthly rate implied by your expected annual return, increasing once a year if
          you set a step-up. Once you reach {RETIREMENT_AGE}, the projected corpus is split into an annuity portion and a lump sum, and the
          annuity portion is used to estimate a monthly pension — the same two-phase model (accumulate, then annuitize) real NPS uses.
        </p>
        <div className="rounded-xl bg-platinum/50 border border-border-soft px-5 py-4 font-mono text-sm text-ink overflow-x-auto space-y-1.5">
          <div>FV = accumulated like a Step-Up SIP (see the SIP/Step-Up SIP calculators for that formula)</div>
          <div>Annuity Allocation = FV × Annuity %</div>
          <div>Lump Sum = FV × (100% − Annuity %)</div>
          <div>Monthly Pension = (Annuity Allocation × Annuity Rate) ÷ 12</div>
        </div>
        <dl className="mt-4 space-y-2.5">
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">FV</dt>
            <dd className="text-sm text-ink-soft">Final corpus value — what your contributions grow into by the end of the term</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">Annuity %</dt>
            <dd className="text-sm text-ink-soft">The share of your final corpus set aside to buy a pension (minimum 40% under current NPS rules)</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">Annuity Rate</dt>
            <dd className="text-sm text-ink-soft">
              The annual rate an insurer pays out on the annuity corpus — set by the annuity plan you choose at retirement, not your fund's
              investment returns. Typically lower than equity-linked NPS returns since it behaves like a fixed-income insurance product.
            </dd>
          </div>
        </dl>
        {result && monthlyContribution && annualReturn !== null && years && (
          <p className="text-sm text-ink-soft leading-relaxed mt-4">
            For example: contributing <strong className="text-ink">{formatINR(monthlyContribution)}</strong> every month at an expected{' '}
            <strong className="text-ink">{annualReturn}%</strong> return for <strong className="text-ink">{years} years</strong> projects a
            corpus of <strong className="text-ink">{formatINR(result.summary.finalValue)}</strong>, split into roughly{' '}
            <strong className="text-ink">{formatINR(result.summary.estimatedAnnuityAllocation ?? 0)}</strong> for annuity and{' '}
            <strong className="text-ink">{formatINR(result.summary.estimatedLumpSum ?? 0)}</strong> as lump sum — at an assumed{' '}
            <strong className="text-ink">{annuityRate}%</strong> annuity rate, that works out to roughly{' '}
            <strong className="text-ink">{formatINR(result.summary.estimatedMonthlyPension ?? 0)}</strong> a month in pension.
          </p>
        )}
      </Card>

      <div>
        <SectionHeading title="Frequently Asked Questions" as="h3" />
        <FAQ items={FAQS} />
      </div>

      <Disclaimer />
    </CalculatorLayout>
  )
}
