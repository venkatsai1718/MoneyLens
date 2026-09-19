import React, { useMemo } from 'react'
import { CalculatorLayout } from '../components/layout/CalculatorLayout'
import { CurrencyInput, PercentageInput, YearsInput, SummaryRow, ChartCard, DataTable, ExportMenu, Disclaimer, FAQ, SectionHeading, Card, Toggle } from '../components/ui'
import { GrowthChart } from '../charts/GrowthChart'
import { InvestedVsReturnsChart } from '../charts/InvestedVsReturnsChart'
import { calculatePPF, type ContributionTiming } from '../calculations'
import { validateAmount, validateRate, isFormValid } from '../utils/validation'
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

const FAQS = [
  { question: 'What is PPF?', answer: 'The Public Provident Fund (PPF) is a long-term, government-backed savings scheme with a statutory annual contribution cap and a standard 15-year lock-in.' },
  { question: 'Is PPF interest tax-free?', answer: 'PPF currently falls under the EEE (Exempt-Exempt-Exempt) tax category, meaning contributions, interest and maturity proceeds are typically tax-exempt under prevailing rules — always confirm the current tax treatment before relying on it.' },
  { question: 'What is the 15-year lock-in?', answer: "A PPF account has a standard tenure of 15 years from the end of the financial year it was opened in, before which withdrawals are restricted (partial withdrawal is allowed after year 6, subject to rules)." },
  { question: 'Can I extend my PPF account after maturity?', answer: 'Yes, PPF accounts can typically be extended in blocks of 5 years, with or without further contributions. This calculator only models the initial term you enter — it does not project extensions.' },
  { question: 'How is PPF interest calculated in real life vs this calculator?', answer: 'The government calculates PPF interest monthly, on the lowest balance between the 5th and the last day of each month, and credits it annually. This calculator uses a simplified smooth annual-compounding approximation for illustration, so results may differ slightly from an actual PPF passbook.' },
  { question: 'Is the interest rate guaranteed?', answer: 'The PPF rate is set by the government and revised quarterly — it is not fixed for the life of your account. This calculator uses whatever rate you enter as an assumption; it is not a live rate feed and should not be treated as guaranteed for future years.' },
]

export function PPFCalculator() {
  const [annualContribution, setAnnualContribution] = React.useState<number | null>(150000)
  const [rate, setRate] = React.useState<number | null>(7.1)
  const [years, setYears] = React.useState<number | null>(15)
  const [timing, setTiming] = React.useState<ContributionTiming>('start')
  const [inflationRate, setInflationRate] = React.useState<number | null>(null)

  const validations = {
    contribution: validateAmount(annualContribution, { required: true, label: 'Annual contribution', max: 150000 }),
    rate: validateRate(rate, { required: true, label: 'Interest rate', max: 12 }),
    inflation: validateRate(inflationRate, { label: 'Inflation', max: 20 }),
  }
  const valid = isFormValid(Object.values(validations))

  const result = useMemo(() => {
    if (!valid || !annualContribution || rate === null || !years) return null
    return calculatePPF({ annualContribution, annualRatePercent: rate, years, contributionTiming: timing, inflationRate })
  }, [valid, annualContribution, rate, years, timing, inflationRate])

  function handleCSV() {
    if (!result) return
    downloadCSV('moneylens-ppf-calculation', buildCSV(result, YEARLY_COLUMNS))
  }
  function handlePDF() {
    if (!result) return
    downloadPDF(result, YEARLY_COLUMNS, 'moneylens-ppf-calculation', { disclaimer: DISCLAIMER_TEXT })
  }

  return (
    <CalculatorLayout
      seoTitle="PPF Calculator – Public Provident Fund Maturity Calculator | MoneyLens"
      seoDescription="Project your PPF maturity value with a year-wise breakdown. Clearly labeled assumptions — not a live government rate feed."
      eyebrow="Fixed Income Calculator"
      title="PPF Calculator"
      subtitle="Project your Public Provident Fund balance at maturity, based on the contribution and rate you enter."
    >
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-5 sm:p-7 space-y-5 lg:border-r border-border-soft">
            <CurrencyInput
              label="Annual Contribution"
              value={annualContribution}
              onChange={setAnnualContribution}
              max={150000}
              step={5000}
              error={validations.contribution.error}
              hint="The statutory PPF limit is ₹1.5 Lakh per financial year."
            />
            <PercentageInput
              label="Interest Rate (assumed)"
              value={rate}
              onChange={setRate}
              max={12}
              step={0.1}
              error={validations.rate.error}
              hint="PPF rates are revised quarterly by the government — enter the current rate or your own assumption. Not a live rate feed."
            />
            <YearsInput label="Investment Duration" value={years} onChange={setYears} max={40} min={1} hint="PPF has a standard 15-year lock-in." />
            <Toggle
              label="Contribution Timing"
              value={timing}
              onChange={(v) => setTiming(v as ContributionTiming)}
              options={[
                { value: 'start', label: 'Start of Year' },
                { value: 'end', label: 'End of Year' },
              ]}
            />
            <PercentageInput label="Inflation" value={inflationRate} onChange={setInflationRate} max={15} step={0.5} error={validations.inflation.error} optional />
          </div>

          <div className="p-5 sm:p-7 flex flex-col">
            {!result ? (
              <div className="flex-1 flex items-center justify-center text-center py-10">
                <div>
                  <p className="text-sm font-semibold text-ink">Enter your PPF details</p>
                  <p className="text-xs text-ink-muted mt-1.5 max-w-[220px]">We'll project your maturity value and year-wise growth.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="chart-lift rounded-xl h-48 sm:h-56">
                  <InvestedVsReturnsChart invested={result.summary.totalInvested} returns={result.summary.totalReturns} />
                </div>
                <div className="mt-5 space-y-3">
                  <SummaryRow label="Total Contribution" value={result.summary.totalInvested} />
                  <SummaryRow label="Interest Earned" value={result.summary.totalReturns} tone="growth" />
                  <div className="border-t border-border-soft pt-3">
                    <SummaryRow label="Maturity Value" value={result.summary.finalValue} emphasize />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {result && (
        <>
          <ChartCard title="Balance Growth" subtitle="Total contribution vs. account balance, year over year">
            <GrowthChart data={result.yearlyData} />
          </ChartCard>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <SectionHeading title="Year-Wise Breakdown" subtitle="Contributions, growth and balance for each year." align="left" as="h3" />
              <ExportMenu onCSV={handleCSV} onPDF={handlePDF} />
            </div>
            <DataTable columns={YEARLY_COLUMNS} rows={result.yearlyData} />
          </div>
        </>
      )}

      <Card className="p-5 sm:p-7">
        <SectionHeading title="How This PPF Projection Is Calculated" as="h3" />
        <p className="text-sm text-ink-soft leading-relaxed mb-4">
          This is a <strong className="text-ink">simplified approximation</strong>: it applies your chosen annual contribution once a year (at the
          start or end, per the toggle) and compounds it smoothly at the entered annual rate, the same way a standard "one deposit per year"
          annuity formula works:
        </p>
        <div className="rounded-xl bg-platinum/50 border border-border-soft px-5 py-4 font-mono text-sm text-ink overflow-x-auto">
          M = C × [ ((1+r)ⁿ − 1) / r ] × (1+r) &nbsp;<span className="text-ink-muted">— for "Start of Year" contributions</span>
        </div>
        <p className="text-xs text-ink-muted mt-2">For "End of Year" contributions, drop the trailing ×(1+r) — the last contribution has no time left in the year to earn interest.</p>
        <dl className="mt-4 space-y-2.5">
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">M</dt>
            <dd className="text-sm text-ink-soft">Maturity value at the end of your chosen duration</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">C</dt>
            <dd className="text-sm text-ink-soft">Your annual contribution</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">r</dt>
            <dd className="text-sm text-ink-soft">The annual interest rate you entered</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">n</dt>
            <dd className="text-sm text-ink-soft">Number of years you contribute for</dd>
          </div>
        </dl>
        <p className="text-sm text-ink-soft leading-relaxed mt-4">
          In reality, the government calculates PPF interest monthly, on the lowest balance in your account between the 5th and the last day of
          each month, and credits it once a year — so an actual passbook can differ slightly from this projection. The interest rate you enter is
          your own assumption, not a live government feed.
        </p>
        {result && annualContribution && rate !== null && years && (
          <p className="text-sm text-ink-soft leading-relaxed mt-4">
            For example: contributing <strong className="text-ink">{formatINR(annualContribution)}</strong> every year at{' '}
            <strong className="text-ink">{rate}%</strong> for <strong className="text-ink">{years} years</strong> works out to a maturity value of{' '}
            <strong className="text-ink">{formatINR(result.summary.finalValue)}</strong>.
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
