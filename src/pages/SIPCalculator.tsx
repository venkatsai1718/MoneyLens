import React, { useMemo, useEffect } from 'react'
import { CalculatorLayout } from '../components/layout/CalculatorLayout'
import {
  CurrencyInput,
  PercentageInput,
  YearsInput,
  SummaryRow,
  ChartCard,
  DataTable,
  ExportMenu,
  Disclaimer,
  FAQ,
  SectionHeading,
  Card,
} from '../components/ui'
import { GrowthChart } from '../charts/GrowthChart'
import { InvestedVsReturnsChart } from '../charts/InvestedVsReturnsChart'
import { calculateSIP } from '../calculations'
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
  { question: 'What is a SIP?', answer: 'A Systematic Investment Plan (SIP) lets you invest a fixed amount into a mutual fund at regular intervals — typically monthly — instead of investing a large sum at once.' },
  { question: 'How does a SIP calculator work?', answer: 'It projects the future value of your monthly contributions using a fixed expected annual return, compounding the investment each month over your chosen duration.' },
  { question: 'What is the SIP calculation formula?', answer: 'FV = P × [ ( (1+r)^n − 1 ) / r ] × (1+r), where P is the monthly investment, r is the monthly rate of return, and n is the number of months.' },
  { question: 'Is the expected return guaranteed?', answer: 'No. The return you enter is an assumption for illustration only. Actual mutual fund returns fluctuate with the market and are never guaranteed.' },
  { question: 'What does the inflation-adjusted value mean?', answer: "It shows what your final SIP corpus would be worth in today's purchasing power, discounted by the inflation rate you enter. It only appears if you enter an inflation rate." },
  { question: 'Can I include a one-time initial investment along with my SIP?', answer: 'Yes — use the "Initial Lumpsum" field to add a one-time amount invested on day one, in addition to your recurring monthly SIP.' },
  { question: 'Does increasing my SIP duration always increase returns?', answer: 'Generally yes, because of compounding — but the relationship is not linear. Returns accelerate more in later years than earlier years for the same monthly amount.' },
]

interface SIPFormState {
  [key: string]: number
  monthly: number
  lumpsum: number
  ret: number
  years: number
  inflation: number
}

export function SIPCalculator() {
  const { initialState, updateUrl } = useUrlState<SIPFormState>({ monthly: 10000, lumpsum: 0, ret: 12, years: 10, inflation: 0 })

  const [monthlyInvestment, setMonthlyInvestment] = React.useState<number | null>(initialState.monthly || null)
  const [initialLumpsum, setInitialLumpsum] = React.useState<number | null>(initialState.lumpsum || null)
  const [annualReturn, setAnnualReturn] = React.useState<number | null>(initialState.ret || 12)
  const [years, setYears] = React.useState<number | null>(initialState.years || 10)
  const [inflationRate, setInflationRate] = React.useState<number | null>(initialState.inflation || null)

  useEffect(() => {
    updateUrl({
      monthly: monthlyInvestment ?? 0,
      lumpsum: initialLumpsum ?? 0,
      ret: annualReturn ?? 0,
      years: years ?? 0,
      inflation: inflationRate ?? 0,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthlyInvestment, initialLumpsum, annualReturn, years, inflationRate])

  const validations = {
    monthly: validateAmount(monthlyInvestment, { required: true, label: 'Monthly investment' }),
    lumpsum: validateAmount(initialLumpsum, { label: 'Initial lumpsum', allowZero: true }),
    ret: validateRate(annualReturn, { required: true, label: 'Expected return' }),
    years: validateYears(years, { label: 'Investment period' }),
    inflation: validateRate(inflationRate, { label: 'Inflation', max: 20 }),
  }
  const valid = isFormValid(Object.values(validations))

  const result = useMemo(() => {
    if (!valid || !monthlyInvestment || annualReturn === null || !years) return null
    return calculateSIP({
      monthlyInvestment,
      initialLumpsum: initialLumpsum ?? 0,
      annualReturnPercent: annualReturn,
      years,
      inflationRate,
    })
  }, [valid, monthlyInvestment, initialLumpsum, annualReturn, years, inflationRate])

  function handleCSV() {
    if (!result) return
    const csv = buildCSV(result, YEARLY_COLUMNS)
    downloadCSV('moneylens-sip-calculation', csv)
  }

  function handlePDF() {
    if (!result) return
    downloadPDF(result, YEARLY_COLUMNS, 'moneylens-sip-calculation', { disclaimer: DISCLAIMER_TEXT })
  }

  return (
    <CalculatorLayout
      seoTitle="SIP Calculator – Calculate SIP Returns & Year-Wise Growth | MoneyLens"
      seoDescription="Calculate estimated SIP returns, total investment, expected growth and year-wise portfolio value using MoneyLens' free SIP calculator."
      eyebrow="Growth Calculator"
      title="SIP Calculator"
      subtitle="Estimate how your monthly SIP investments could grow over time, with a full year-wise breakdown and charts."
    >
      {/* Unified calculator: inputs left, chart + summary right — one card, not scattered boxes */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-5 sm:p-7 space-y-5 lg:border-r border-border-soft">
            <CurrencyInput label="Monthly Investment" value={monthlyInvestment} onChange={setMonthlyInvestment} max={2_00_000} step={500} error={validations.monthly.error} />
            <CurrencyInput label="Initial Lumpsum" value={initialLumpsum} onChange={setInitialLumpsum} max={20_00_000} step={1000} error={validations.lumpsum.error} optional />
            <PercentageInput label="Expected Annual Return" value={annualReturn} onChange={setAnnualReturn} max={30} step={0.5} error={validations.ret.error} />
            <YearsInput label="Investment Period" value={years} onChange={setYears} max={40} error={validations.years.error} />
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
                  <SummaryRow label="Invested Amount" value={result.summary.totalInvested} />
                  <SummaryRow label="Expected Returns" value={result.summary.totalReturns} tone="growth" />
                  <div className="border-t border-border-soft pt-3">
                    <SummaryRow label="Total Value" value={result.summary.finalValue} emphasize />
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
              <SectionHeading title="Year-Wise Breakdown" subtitle="Invested amount, growth and total value for each year of your SIP." align="left" as="h3" />
              <ExportMenu onCSV={handleCSV} onPDF={handlePDF} />
            </div>
            <DataTable columns={YEARLY_COLUMNS} rows={result.yearlyData} />
          </div>
        </>
      )}

      <Card className="p-5 sm:p-7">
        <SectionHeading title="How SIP Returns Are Calculated" as="h3" />
        <p className="text-sm text-ink-soft leading-relaxed mb-4">
          MoneyLens computes SIP growth at monthly granularity, compounding your monthly instalment by the effective monthly rate implied by
          your expected annual return, assuming each instalment is invested at the start of the month.
        </p>
        <div className="rounded-xl bg-platinum/50 border border-border-soft px-5 py-4 font-mono text-sm text-ink overflow-x-auto">
          FV = P × [ ((1 + r)ⁿ − 1) / r ] × (1 + r), where r = (1 + annual return)^(1/12) − 1
        </div>
        <dl className="mt-4 space-y-2.5">
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">FV</dt>
            <dd className="text-sm text-ink-soft">Future value — what your SIP investment grows into</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">P</dt>
            <dd className="text-sm text-ink-soft">Your monthly SIP instalment</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">r</dt>
            <dd className="text-sm text-ink-soft">Effective monthly rate — set so 12 months of compounding equal exactly your entered annual return</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">n</dt>
            <dd className="text-sm text-ink-soft">Total number of monthly instalments (years × 12)</dd>
          </div>
        </dl>
        {result && monthlyInvestment && annualReturn !== null && years && (
          <p className="text-sm text-ink-soft leading-relaxed mt-4">
            For example: investing <strong className="text-ink">{formatINR(monthlyInvestment)}</strong> every month at an expected{' '}
            <strong className="text-ink">{annualReturn}%</strong> annual return for <strong className="text-ink">{years} years</strong> works out to
            a final value of <strong className="text-ink">{formatINR(result.summary.finalValue)}</strong> — {formatINR(result.summary.totalInvested)}{' '}
            invested plus {formatINR(result.summary.totalReturns)} in projected growth.
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
