import React, { useMemo, useEffect, useState } from 'react'
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
import { CorpusDepletionChart } from '../charts/CorpusDepletionChart'
import { InvestedVsReturnsChart } from '../charts/InvestedVsReturnsChart'
import { calculateSWP } from '../calculations'
import { useUrlState } from '../hooks/useUrlState'
import { validateAmount, validateRate, validateYears, isFormValid } from '../utils/validation'
import { buildCSV, downloadCSV } from '../utils/csvExport'
import { downloadPDF } from '../utils/pdfExport'
import { formatINR, formatPercent } from '../utils/format'
import { DISCLAIMER_TEXT } from '../components/ui/Disclaimer'
import type { DataTableColumn } from '../components/ui/DataTable'

const YEARLY_COLUMNS: DataTableColumn[] = [
  { key: 'year', label: 'Year', isCurrency: false },
  { key: 'openingBalance', label: 'Opening Corpus' },
  { key: 'withdrawals', label: 'Withdrawals' },
  { key: 'returns', label: 'Expected Returns' },
  { key: 'closingBalance', label: 'Closing Corpus' },
]

const FAQS = [
  { question: 'What is an SWP?', answer: 'A Systematic Withdrawal Plan lets you withdraw a fixed (or gradually increasing) amount from an investment corpus at regular intervals, while the remaining balance stays invested and continues to grow.' },
  { question: 'How is SWP different from a fixed monthly pension?', answer: 'A pension typically pays a contractually fixed amount regardless of market performance. An SWP\'s remaining corpus stays market-linked, so its longevity depends on your withdrawal rate versus the actual returns generated — it is not a guaranteed income stream.' },
  { question: 'What happens when the corpus runs out?', answer: 'Withdrawals simply stop once the corpus reaches zero — MoneyLens never shows a negative balance. The year and month this happens (if it happens within your chosen duration) is clearly marked.' },
  { question: 'Can I increase withdrawals every year to keep pace with expenses?', answer: 'Yes — use the "Annual Withdrawal Increase" field to model a withdrawal amount that steps up by a fixed percentage every 12 months, similar to how expenses tend to rise with inflation.' },
  { question: 'Is SWP taxed differently from withdrawing a lumpsum?', answer: 'Tax treatment depends on the underlying investment type and current tax law, and can differ from a one-time lumpsum withdrawal. Please consult a tax advisor for guidance specific to your situation.' },
  { question: 'How do I choose a safe withdrawal rate?', answer: 'If you withdraw more each year than the corpus grows, the balance will gradually shrink and may eventually be exhausted. There is no single "safe" percentage that applies to everyone — it depends on your expected return, time horizon and how much depletion risk you are comfortable with.' },
]

interface SWPFormState {
  [key: string]: number
  corpus: number
  ret: number
  withdrawal: number
  years: number
  increase: number
  inflation: number
}

export function SWPCalculator() {
  const { initialState, updateUrl } = useUrlState<SWPFormState>({ corpus: 5000000, ret: 8, withdrawal: 30000, years: 15, increase: 0, inflation: 0 })

  const [initialCorpus, setInitialCorpus] = useState<number | null>(initialState.corpus || 5000000)
  const [annualReturn, setAnnualReturn] = useState<number | null>(initialState.ret || 8)
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState<number | null>(initialState.withdrawal || 30000)
  const [years, setYears] = useState<number | null>(initialState.years || 15)
  const [annualIncrease, setAnnualIncrease] = useState<number | null>(initialState.increase || null)
  const [inflationRate, setInflationRate] = useState<number | null>(initialState.inflation || null)

  useEffect(() => {
    updateUrl({
      corpus: initialCorpus ?? 0,
      ret: annualReturn ?? 0,
      withdrawal: monthlyWithdrawal ?? 0,
      years: years ?? 0,
      increase: annualIncrease ?? 0,
      inflation: inflationRate ?? 0,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCorpus, annualReturn, monthlyWithdrawal, years, annualIncrease, inflationRate])

  const validations = {
    corpus: validateAmount(initialCorpus, { required: true, label: 'Initial corpus' }),
    ret: validateRate(annualReturn, { required: true, label: 'Expected return' }),
    withdrawal: validateAmount(monthlyWithdrawal, { required: true, label: 'Monthly withdrawal' }),
    years: validateYears(years, { label: 'Withdrawal duration' }),
    increase: validateRate(annualIncrease, { label: 'Annual withdrawal increase', max: 30 }),
    inflation: validateRate(inflationRate, { label: 'Inflation', max: 20 }),
  }
  const valid = isFormValid(Object.values(validations))

  const result = useMemo(() => {
    if (!valid || !initialCorpus || annualReturn === null || !monthlyWithdrawal || !years) return null
    return calculateSWP({
      initialCorpus,
      annualReturnPercent: annualReturn,
      monthlyWithdrawal,
      years,
      annualIncreasePercent: annualIncrease ?? 0,
      inflationRate,
    })
  }, [valid, initialCorpus, annualReturn, monthlyWithdrawal, years, annualIncrease, inflationRate])

  function handleCSV() {
    if (!result) return
    downloadCSV('moneylens-swp-calculation', buildCSV(result, YEARLY_COLUMNS))
  }
  function handlePDF() {
    if (!result) return
    downloadPDF(result, YEARLY_COLUMNS, 'moneylens-swp-calculation', { disclaimer: DISCLAIMER_TEXT, withdrawMode: true })
  }

  return (
    <CalculatorLayout
      seoTitle="SWP Calculator – Systematic Withdrawal Plan Calculator | MoneyLens"
      seoDescription="Plan regular withdrawals from your investment corpus while it keeps growing, with a year-wise breakdown and corpus depletion chart, using MoneyLens' free SWP calculator."
      eyebrow="Income Calculator"
      title="SWP Calculator"
      subtitle="Plan regular withdrawals from a corpus while the remaining balance stays invested and continues to grow."
    >
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-5 sm:p-7 space-y-5 lg:border-r border-border-soft">
            <CurrencyInput label="Initial Corpus" value={initialCorpus} onChange={setInitialCorpus} max={5_00_00_000} step={10000} error={validations.corpus.error} />
            <PercentageInput label="Expected Annual Return" value={annualReturn} onChange={setAnnualReturn} max={25} step={0.5} error={validations.ret.error} />
            <CurrencyInput label="Monthly Withdrawal" value={monthlyWithdrawal} onChange={setMonthlyWithdrawal} max={5_00_000} step={1000} error={validations.withdrawal.error} />
            <YearsInput label="Withdrawal Duration" value={years} onChange={setYears} max={40} error={validations.years.error} />
            <PercentageInput
              label="Annual Withdrawal Increase"
              value={annualIncrease}
              onChange={setAnnualIncrease}
              max={20}
              step={0.5}
              error={validations.increase.error}
              optional
              hint="Leave empty for a flat monthly withdrawal."
            />
            <PercentageInput label="Inflation" value={inflationRate} onChange={setInflationRate} max={15} step={0.5} error={validations.inflation.error} optional hint="Leave empty to skip inflation adjustment." />
          </div>

          <div className="p-5 sm:p-7 flex flex-col">
            {!result ? (
              <div className="flex-1 flex items-center justify-center text-center py-10">
                <div>
                  <p className="text-sm font-semibold text-ink">Enter your withdrawal plan details</p>
                  <p className="text-xs text-ink-muted mt-1.5 max-w-[220px]">We'll calculate how long your corpus lasts and how much you can withdraw.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="chart-lift rounded-xl h-48 sm:h-56">
                  <InvestedVsReturnsChart invested={result.summary.totalWithdrawn ?? 0} returns={result.summary.totalReturns} />
                </div>
                <div className="mt-5 space-y-3">
                  {result.summary.exhaustionYear && (
                    <div className="rounded-lg bg-platinum px-3 py-2 text-xs text-ink-soft">
                      Corpus exhausted in Year {result.summary.exhaustionYear} — withdrawals stopped from that point onward.
                    </div>
                  )}
                  <SummaryRow label="Initial Corpus" value={initialCorpus ?? 0} />
                  <SummaryRow label="Total Withdrawn" value={result.summary.totalWithdrawn ?? 0} tone="withdraw" />
                  <SummaryRow label="Expected Returns" value={result.summary.totalReturns} tone="growth" />
                  <div className="border-t border-border-soft pt-3">
                    <SummaryRow label="Remaining Corpus" value={result.summary.remainingCorpus ?? 0} emphasize />
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
          <ChartCard title="Corpus Depletion" subtitle="Closing corpus and withdrawals, year over year">
            <CorpusDepletionChart data={result.yearlyData} exhaustionYear={result.summary.exhaustionYear} />
          </ChartCard>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <SectionHeading title="Year-Wise Breakdown" subtitle="Opening corpus, withdrawals, growth and closing corpus for each year." align="left" as="h3" />
              <ExportMenu onCSV={handleCSV} onPDF={handlePDF} />
            </div>
            <DataTable columns={YEARLY_COLUMNS} rows={result.yearlyData} />
          </div>
        </>
      )}

      <Card className="p-5 sm:p-7">
        <SectionHeading title="How SWP Is Calculated" as="h3" />
        <p className="text-sm text-ink-soft leading-relaxed mb-4">
          There's no single formula for an SWP the way there is for a lumpsum or a fixed deposit — instead, MoneyLens works through your corpus one
          month at a time, repeating three steps until your chosen duration is up:
        </p>
        <ol className="list-decimal list-inside text-sm text-ink-soft space-y-1.5">
          <li>Apply growth to the corpus for that month, at the effective monthly rate implied by your expected annual return.</li>
          <li>Deduct that month's withdrawal — capped at whatever balance is actually available, so the corpus never goes negative.</li>
          <li>If an annual withdrawal increase is set, bump the withdrawal amount once every 12 months, then repeat from step 1.</li>
        </ol>
        <p className="text-sm text-ink-soft leading-relaxed mt-4">
          Once the corpus hits zero, withdrawals stop permanently for the rest of the duration. These monthly results are then rolled up into the
          year-wise table above.
        </p>
        {result && initialCorpus && annualReturn !== null && monthlyWithdrawal && years && (
          <p className="text-sm text-ink-soft leading-relaxed mt-4">
            For example: starting with <strong className="text-ink">{formatINR(initialCorpus)}</strong>, withdrawing{' '}
            <strong className="text-ink">{formatINR(monthlyWithdrawal)}</strong> every month at an expected{' '}
            <strong className="text-ink">{annualReturn}%</strong> annual return over <strong className="text-ink">{years} years</strong>
            {result.summary.exhaustionYear ? (
              <>
                {' '}
                exhausts the corpus in <strong className="text-ink">Year {result.summary.exhaustionYear}</strong> — after that, no further
                withdrawals are possible.
              </>
            ) : (
              <>
                {' '}
                leaves a remaining corpus of <strong className="text-ink">{formatINR(result.summary.remainingCorpus ?? 0)}</strong> at the end of
                the period.
              </>
            )}
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
