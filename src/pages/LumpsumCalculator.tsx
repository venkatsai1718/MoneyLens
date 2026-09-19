import React, { useMemo, useEffect } from 'react'
import { CalculatorLayout } from '../components/layout/CalculatorLayout'
import { CurrencyInput, PercentageInput, YearsInput, SummaryRow, ChartCard, DataTable, ExportMenu, Disclaimer, FAQ, SectionHeading, Card } from '../components/ui'
import { GrowthChart } from '../charts/GrowthChart'
import { InvestedVsReturnsChart } from '../charts/InvestedVsReturnsChart'
import { calculateLumpsum } from '../calculations'
import { useUrlState } from '../hooks/useUrlState'
import { validateAmount, validateRate, validateYears, isFormValid } from '../utils/validation'
import { buildCSV, downloadCSV } from '../utils/csvExport'
import { downloadPDF } from '../utils/pdfExport'
import { formatINR, formatPercent } from '../utils/format'
import { DISCLAIMER_TEXT } from '../components/ui/Disclaimer'
import type { DataTableColumn } from '../components/ui/DataTable'

const YEARLY_COLUMNS: DataTableColumn[] = [
  { key: 'year', label: 'Year', isCurrency: false },
  { key: 'invested', label: 'Invested' },
  { key: 'returns', label: 'Expected Returns' },
  { key: 'closingBalance', label: 'Total Value' },
]

const FAQS = [
  { question: 'What is a lumpsum investment?', answer: 'A lumpsum investment means investing a single, one-time amount into a mutual fund or other instrument, rather than spreading it out over regular instalments like a SIP.' },
  { question: 'Lumpsum vs SIP — what is the difference?', answer: 'A lumpsum invests the entire amount on day one, so it is fully exposed to market movement from the start. A SIP spreads investment over time, averaging the purchase price across market ups and downs.' },
  { question: 'When might a lumpsum investment work better than a SIP?', answer: 'If a large amount is available at once and the investment horizon is long, a lumpsum can benefit from more time in the market. This calculator does not advise which approach to choose — it only projects the numbers for the assumptions you enter.' },
  { question: 'Is the expected return guaranteed?', answer: 'No. The return rate you enter is an assumption for illustration only. Actual returns depend on market performance and are never guaranteed.' },
  { question: 'How does the inflation-adjusted value work here?', answer: "If you enter an inflation rate, MoneyLens discounts your projected final value back to today's purchasing power, so you can see what the corpus would be worth in real terms." },
]

interface LumpsumFormState {
  [key: string]: number
  amount: number
  ret: number
  years: number
  inflation: number
}

export function LumpsumCalculator() {
  const { initialState, updateUrl } = useUrlState<LumpsumFormState>({ amount: 100000, ret: 12, years: 10, inflation: 0 })

  const [initialInvestment, setInitialInvestment] = React.useState<number | null>(initialState.amount || 100000)
  const [annualReturn, setAnnualReturn] = React.useState<number | null>(initialState.ret || 12)
  const [years, setYears] = React.useState<number | null>(initialState.years || 10)
  const [inflationRate, setInflationRate] = React.useState<number | null>(initialState.inflation || null)

  useEffect(() => {
    updateUrl({ amount: initialInvestment ?? 0, ret: annualReturn ?? 0, years: years ?? 0, inflation: inflationRate ?? 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialInvestment, annualReturn, years, inflationRate])

  const validations = {
    amount: validateAmount(initialInvestment, { required: true, label: 'Initial investment' }),
    ret: validateRate(annualReturn, { required: true, label: 'Expected return' }),
    years: validateYears(years, { label: 'Investment duration' }),
    inflation: validateRate(inflationRate, { label: 'Inflation', max: 20 }),
  }
  const valid = isFormValid(Object.values(validations))

  const result = useMemo(() => {
    if (!valid || !initialInvestment || annualReturn === null || !years) return null
    return calculateLumpsum({ initialInvestment, annualReturnPercent: annualReturn, years, inflationRate })
  }, [valid, initialInvestment, annualReturn, years, inflationRate])

  function handleCSV() {
    if (!result) return
    downloadCSV('moneylens-lumpsum-calculation', buildCSV(result, YEARLY_COLUMNS))
  }
  function handlePDF() {
    if (!result) return
    downloadPDF(result, YEARLY_COLUMNS, 'moneylens-lumpsum-calculation', { disclaimer: DISCLAIMER_TEXT })
  }

  return (
    <CalculatorLayout
      seoTitle="Lumpsum Calculator – Calculate Lumpsum Investment Returns | MoneyLens"
      seoDescription="Calculate the future value of a one-time lumpsum investment, with year-wise growth, charts and CSV/PDF export."
      eyebrow="Growth Calculator"
      title="Lumpsum Calculator"
      subtitle="See how a one-time investment could grow over time, with a full year-wise breakdown."
    >
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-5 sm:p-7 space-y-5 lg:border-r border-border-soft">
            <CurrencyInput label="Initial Investment" value={initialInvestment} onChange={setInitialInvestment} max={50_00_000} step={5000} error={validations.amount.error} />
            <PercentageInput label="Expected Annual Return" value={annualReturn} onChange={setAnnualReturn} max={30} step={0.5} error={validations.ret.error} />
            <YearsInput label="Investment Duration" value={years} onChange={setYears} max={40} error={validations.years.error} />
            <PercentageInput label="Inflation" value={inflationRate} onChange={setInflationRate} max={15} step={0.5} error={validations.inflation.error} optional hint="Leave empty to skip inflation adjustment." />
          </div>

          <div className="p-5 sm:p-7 flex flex-col">
            {!result ? (
              <div className="flex-1 flex items-center justify-center text-center py-10">
                <div>
                  <p className="text-sm font-semibold text-ink">Enter your investment details</p>
                  <p className="text-xs text-ink-muted mt-1.5 max-w-[220px]">We'll calculate your estimated growth and year-wise breakdown.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="chart-lift rounded-xl h-48 sm:h-56">
                  <InvestedVsReturnsChart invested={result.summary.totalInvested} returns={result.summary.totalReturns} />
                </div>
                <div className="mt-5 space-y-3">
                  <SummaryRow label="Total Invested" value={result.summary.totalInvested} />
                  <SummaryRow label="Expected Returns" value={result.summary.totalReturns} tone="growth" />
                  <div className="border-t border-border-soft pt-3">
                    <SummaryRow label="Final Value" value={result.summary.finalValue} emphasize />
                  </div>
                  {result.inflationApplied && result.summary.inflationAdjustedValue !== undefined && (
                    <div className="flex items-center justify-between gap-3 rounded-lg bg-platinum px-3 py-2 mt-1">
                      <span className="text-xs text-ink-muted">Worth today at {formatPercent(result.inflationRate!, 1)} inflation</span>
                      <span className="text-sm font-bold text-ink tabular-nums">{formatINR(result.summary.inflationAdjustedValue)}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {result && (
        <>
          <ChartCard title="Portfolio Growth" subtitle="Total invested vs. portfolio value, year over year">
            <GrowthChart data={result.yearlyData} />
          </ChartCard>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <SectionHeading title="Year-Wise Breakdown" subtitle="Growth and total value for each year of your investment." align="left" as="h3" />
              <ExportMenu onCSV={handleCSV} onPDF={handlePDF} />
            </div>
            <DataTable columns={YEARLY_COLUMNS} rows={result.yearlyData} />
          </div>
        </>
      )}

      <Card className="p-5 sm:p-7">
        <SectionHeading title="How Lumpsum Returns Are Calculated" as="h3" />
        <p className="text-sm text-ink-soft leading-relaxed mb-4">
          MoneyLens compounds your one-time principal monthly, using the effective monthly rate implied by your expected annual return, over
          your chosen duration.
        </p>
        <div className="rounded-xl bg-platinum/50 border border-border-soft px-5 py-4 font-mono text-sm text-ink overflow-x-auto">FV = P × (1 + r)ⁿ, where r = (1 + annual return)^(1/12) − 1</div>
        <dl className="mt-4 space-y-2.5">
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">FV</dt>
            <dd className="text-sm text-ink-soft">Future value — what your investment grows into</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">P</dt>
            <dd className="text-sm text-ink-soft">Your one-time principal, invested on day one</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">r</dt>
            <dd className="text-sm text-ink-soft">Effective monthly rate — set so 12 months of compounding equal exactly your entered annual return</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">n</dt>
            <dd className="text-sm text-ink-soft">Total number of months invested (years × 12)</dd>
          </div>
        </dl>
        {result && initialInvestment && annualReturn !== null && years && (
          <p className="text-sm text-ink-soft leading-relaxed mt-4">
            For example: a one-time investment of <strong className="text-ink">{formatINR(initialInvestment)}</strong> at an expected{' '}
            <strong className="text-ink">{annualReturn}%</strong> annual return, left untouched for <strong className="text-ink">{years} years</strong>,
            grows to <strong className="text-ink">{formatINR(result.summary.finalValue)}</strong> — {formatINR(result.summary.totalReturns)} of that
            is projected growth.
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
