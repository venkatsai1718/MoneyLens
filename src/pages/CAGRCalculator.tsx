import React, { useMemo } from 'react'
import { CalculatorLayout } from '../components/layout/CalculatorLayout'
import { CurrencyInput, YearsInput, ChartCard, DataTable, ExportMenu, Disclaimer, FAQ, SectionHeading, Card } from '../components/ui'
import { GrowthChart } from '../charts/GrowthChart'
import { calculateCAGR } from '../calculations'
import { validateAmount, validateYears, isFormValid } from '../utils/validation'
import { buildCSV, downloadCSV } from '../utils/csvExport'
import { downloadPDF } from '../utils/pdfExport'
import { formatINR, formatPercent } from '../utils/format'
import { DISCLAIMER_TEXT } from '../components/ui/Disclaimer'
import type { DataTableColumn } from '../components/ui/DataTable'

const YEARLY_COLUMNS: DataTableColumn[] = [
  { key: 'year', label: 'Year', isCurrency: false },
  { key: 'closingBalance', label: 'Value' },
]

const FAQS = [
  { question: 'What is CAGR?', answer: 'The Compound Annual Growth Rate (CAGR) is the single average annual growth rate that would take an initial value to a final value over a given period, if it grew steadily every year.' },
  { question: 'How is CAGR different from average annual return?', answer: 'A simple average of yearly returns can be misleading because it ignores compounding and volatility. CAGR instead smooths the entire period into one consistent compounding rate, based only on the start and end values.' },
  { question: 'Can CAGR be negative?', answer: 'Yes — if the final value is lower than the initial value, CAGR will be negative, reflecting an overall decline over the period.' },
  { question: 'What is CAGR used for?', answer: 'It is commonly used to compare the historical growth of investments, companies or funds over the same time period, since it reduces performance to a single comparable number.' },
  { question: 'Does CAGR predict future returns?', answer: 'No. CAGR is a backward-looking calculation based on two known historical values — it does not forecast or guarantee future performance.' },
]

export function CAGRCalculator() {
  const [initialValue, setInitialValue] = React.useState<number | null>(100000)
  const [finalValue, setFinalValue] = React.useState<number | null>(250000)
  const [years, setYears] = React.useState<number | null>(5)

  const validations = {
    initial: validateAmount(initialValue, { required: true, label: 'Initial value' }),
    final: validateAmount(finalValue, { required: true, label: 'Final value', allowZero: true }),
    years: validateYears(years, { label: 'Duration' }),
  }
  const valid = isFormValid(Object.values(validations))

  const result = useMemo(() => {
    if (!valid || !initialValue || finalValue === null || !years) return null
    return calculateCAGR({ initialValue, finalValue, years })
  }, [valid, initialValue, finalValue, years])

  function handleCSV() {
    if (!result) return
    downloadCSV('moneylens-cagr-calculation', buildCSV(result, YEARLY_COLUMNS))
  }
  function handlePDF() {
    if (!result) return
    downloadPDF(result, YEARLY_COLUMNS, 'moneylens-cagr-calculation', { disclaimer: DISCLAIMER_TEXT })
  }

  return (
    <CalculatorLayout
      seoTitle="CAGR Calculator – Compound Annual Growth Rate Calculator | MoneyLens"
      seoDescription="Calculate the compound annual growth rate (CAGR) between two values over any duration, with a growth chart and year-wise table."
      eyebrow="Analysis Calculator"
      title="CAGR Calculator"
      subtitle="Find the compound annual growth rate between an initial and final value, over any period."
    >
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-5 sm:p-7 space-y-5 lg:border-r border-border-soft">
            <CurrencyInput label="Initial Value" value={initialValue} onChange={setInitialValue} max={50_00_000} step={1000} error={validations.initial.error} />
            <CurrencyInput label="Final Value" value={finalValue} onChange={setFinalValue} max={1_00_00_000} step={1000} error={validations.final.error} />
            <YearsInput label="Duration" value={years} onChange={setYears} max={40} />
          </div>

          <div className="p-5 sm:p-7 flex flex-col">
            {!result ? (
              <div className="flex-1 flex items-center justify-center text-center py-10">
                <div>
                  <p className="text-sm font-semibold text-ink">Enter your values</p>
                  <p className="text-xs text-ink-muted mt-1.5 max-w-[220px]">We'll calculate the compound annual growth rate between them.</p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs font-medium text-ink-muted mb-1.5">Compound Annual Growth Rate</p>
                <p className="text-4xl sm:text-5xl font-extrabold text-ink tabular-nums">{formatPercent(result.cagrPercent, 2)}</p>
                <div className="mt-6 space-y-3">
                  <div className="border-t border-border-soft pt-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-ink-muted">Initial Value</span>
                      <span className="text-sm font-bold text-ink tabular-nums">{formatINR(result.summary.totalInvested)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-ink-muted">Final Value</span>
                    <span className="text-sm font-bold text-ink tabular-nums">{formatINR(result.summary.finalValue)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-ink-muted">Duration</span>
                    <span className="text-sm font-bold text-ink tabular-nums">{years} Years</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {result && (
        <>
          <ChartCard title="Growth Trajectory" subtitle="Implied smooth growth from initial to final value at the computed CAGR">
            <GrowthChart data={result.yearlyData} />
          </ChartCard>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <SectionHeading title="Year-Wise Breakdown" subtitle="Implied value at the end of each year." align="left" as="h3" />
              <ExportMenu onCSV={handleCSV} onPDF={handlePDF} />
            </div>
            <DataTable columns={YEARLY_COLUMNS} rows={result.yearlyData} />
          </div>
        </>
      )}

      <Card className="p-5 sm:p-7">
        <SectionHeading title="How CAGR Is Calculated" as="h3" />
        <p className="text-sm text-ink-soft leading-relaxed mb-4">
          CAGR answers one question: if this investment had grown by the same steady percentage every single year — instead of the bumpy,
          real-world path it actually took — what would that one percentage have to be? It only looks at the start and end values, so it
          smooths away whatever happened in between.
        </p>
        <div className="rounded-xl bg-platinum/50 border border-border-soft px-5 py-4 font-mono text-sm text-ink overflow-x-auto">
          CAGR = ( (Final Value / Initial Value) ^ (1/n) − 1 ) × 100
        </div>
        <dl className="mt-4 space-y-2.5">
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">n</dt>
            <dd className="text-sm text-ink-soft">Number of years between the initial and final value</dd>
          </div>
        </dl>
        {result && initialValue && finalValue !== null && years && (
          <p className="text-sm text-ink-soft leading-relaxed mt-4">
            For example: growing from <strong className="text-ink">{formatINR(initialValue)}</strong> to{' '}
            <strong className="text-ink">{formatINR(finalValue)}</strong> over <strong className="text-ink">{years} years</strong> works out
            to a CAGR of <strong className="text-ink">{formatPercent(result.cagrPercent, 2)}</strong> — as if it had grown by that much,
            compounded, every single year.
          </p>
        )}
        <p className="text-sm text-ink-soft leading-relaxed mt-3">
          CAGR is a backward-looking historical calculation, not a projection of future returns.
        </p>
      </Card>

      <div>
        <SectionHeading title="Frequently Asked Questions" as="h3" />
        <FAQ items={FAQS} />
      </div>

      <Disclaimer />
    </CalculatorLayout>
  )
}
