import React, { useMemo } from 'react'
import { CalculatorLayout } from '../components/layout/CalculatorLayout'
import { CurrencyInput, PercentageInput, NumberInput, SummaryRow, ChartCard, DataTable, ExportMenu, Disclaimer, FAQ, SectionHeading, Card, SelectInput } from '../components/ui'
import { GrowthChart } from '../charts/GrowthChart'
import { InvestedVsReturnsChart } from '../charts/InvestedVsReturnsChart'
import { calculateRD, type CompoundingFrequency } from '../calculations'
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

const COMPOUNDING_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half-yearly', label: 'Half-Yearly' },
  { value: 'yearly', label: 'Yearly' },
]

const FAQS = [
  { question: 'What is a Recurring Deposit (RD)?', answer: 'An RD lets you deposit a fixed amount every month into a bank account for a set tenure, earning interest similar to a fixed deposit but built up through regular instalments.' },
  { question: 'How is an RD different from an FD?', answer: 'An FD invests a lump sum all at once, while an RD builds up the deposit through equal monthly instalments — helpful when you want to save a fixed amount every month rather than invest a large sum upfront.' },
  { question: 'How is RD interest compounded?', answer: 'Interest is calculated at the compounding frequency you select (commonly quarterly for Indian RDs) and applied to the accumulated balance at each period boundary.' },
  { question: 'Can I withdraw an RD before maturity?', answer: 'Most banks allow premature withdrawal, usually with a penalty or reduced interest rate. This calculator does not model early-withdrawal penalties.' },
  { question: 'Is an RD safer than a SIP into mutual funds?', answer: 'An RD offers a fixed, contractual interest rate with capital protection, while a SIP into market-linked funds carries market risk with potentially higher long-term growth. This calculator does not recommend one over the other.' },
]

export function RDCalculator() {
  const [monthlyDeposit, setMonthlyDeposit] = React.useState<number | null>(5000)
  const [rate, setRate] = React.useState<number | null>(6.5)
  const [tenureMonths, setTenureMonths] = React.useState<number | null>(36)
  const [compounding, setCompounding] = React.useState<CompoundingFrequency>('quarterly')
  const [inflationRate, setInflationRate] = React.useState<number | null>(null)

  const validations = {
    deposit: validateAmount(monthlyDeposit, { required: true, label: 'Monthly deposit' }),
    rate: validateRate(rate, { required: true, label: 'Interest rate', max: 12 }),
    months: validateAmount(tenureMonths, { required: true, label: 'Tenure' }),
    inflation: validateRate(inflationRate, { label: 'Inflation', max: 20 }),
  }
  const valid = isFormValid(Object.values(validations))

  const result = useMemo(() => {
    if (!valid || !monthlyDeposit || rate === null || !tenureMonths) return null
    return calculateRD({ monthlyDeposit, annualRatePercent: rate, tenureMonths, compoundingFrequency: compounding, inflationRate })
  }, [valid, monthlyDeposit, rate, tenureMonths, compounding, inflationRate])

  function handleCSV() {
    if (!result) return
    downloadCSV('moneylens-rd-calculation', buildCSV(result, YEARLY_COLUMNS))
  }
  function handlePDF() {
    if (!result) return
    downloadPDF(result, YEARLY_COLUMNS, 'moneylens-rd-calculation', { disclaimer: DISCLAIMER_TEXT })
  }

  return (
    <CalculatorLayout
      seoTitle="RD Calculator – Recurring Deposit Maturity Calculator | MoneyLens"
      seoDescription="Calculate the maturity value of your monthly recurring deposits with a year-wise breakdown and charts."
      eyebrow="Fixed Income Calculator"
      title="RD Calculator"
      subtitle="Calculate the maturity value of your monthly recurring deposit at any compounding frequency."
    >
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-5 sm:p-7 space-y-5 lg:border-r border-border-soft">
            <CurrencyInput label="Monthly Deposit" value={monthlyDeposit} onChange={setMonthlyDeposit} max={1_00_000} step={500} error={validations.deposit.error} />
            <PercentageInput label="Interest Rate" value={rate} onChange={setRate} max={12} step={0.1} error={validations.rate.error} />
            <NumberInput label="Tenure (Months)" value={tenureMonths} onChange={setTenureMonths} min={1} max={120} showSlider error={validations.months.error} />
            <SelectInput label="Compounding Frequency" value={compounding} onChange={(v) => setCompounding(v as CompoundingFrequency)} options={COMPOUNDING_OPTIONS} />
            <PercentageInput label="Inflation" value={inflationRate} onChange={setInflationRate} max={15} step={0.5} error={validations.inflation.error} optional />
          </div>

          <div className="p-5 sm:p-7 flex flex-col">
            {!result ? (
              <div className="flex-1 flex items-center justify-center text-center py-10">
                <div>
                  <p className="text-sm font-semibold text-ink">Enter your RD details</p>
                  <p className="text-xs text-ink-muted mt-1.5 max-w-[220px]">We'll calculate your maturity value and year-wise growth.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="chart-lift rounded-xl h-48 sm:h-56">
                  <InvestedVsReturnsChart invested={result.summary.totalInvested} returns={result.summary.totalReturns} />
                </div>
                <div className="mt-5 space-y-3">
                  <SummaryRow label="Total Deposited" value={result.summary.totalInvested} />
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
          <ChartCard title="Deposit Growth" subtitle="Total deposited vs. maturity value, year over year">
            <GrowthChart data={result.yearlyData} />
          </ChartCard>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <SectionHeading title="Year-Wise Breakdown" subtitle="Deposits, growth and total value for each year." align="left" as="h3" />
              <ExportMenu onCSV={handleCSV} onPDF={handlePDF} />
            </div>
            <DataTable columns={YEARLY_COLUMNS} rows={result.yearlyData} />
          </div>
        </>
      )}

      <Card className="p-5 sm:p-7">
        <SectionHeading title="How RD Maturity Is Calculated" as="h3" />
        <p className="text-sm text-ink-soft leading-relaxed mb-4">
          Unlike a lump-sum FD, an RD adds a fresh deposit every month but only compounds interest at set checkpoints (quarterly, for most Indian
          banks) — so each deposit earns a slightly different amount of interest depending on when in the cycle it landed. MoneyLens uses the same
          formula banks use to account for that, so results line up with a real RD passbook rather than a rough approximation:
        </p>
        <div className="rounded-xl bg-platinum/50 border border-border-soft px-5 py-4 font-mono text-sm text-ink overflow-x-auto">
          M = R × [ (1+i)ⁿ − 1 ] / [ 1 − (1+i)^(−1/k) ]
        </div>
        <dl className="mt-4 space-y-2.5">
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">M</dt>
            <dd className="text-sm text-ink-soft">Maturity value — what your RD is worth when it matures</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">R</dt>
            <dd className="text-sm text-ink-soft">Your fixed monthly deposit</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">i</dt>
            <dd className="text-sm text-ink-soft">Periodic interest rate — the annual rate divided by how many times a year interest compounds</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">n</dt>
            <dd className="text-sm text-ink-soft">Number of compounding periods that have gone by over the full tenure</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">k</dt>
            <dd className="text-sm text-ink-soft">Months per compounding period (3 for quarterly — the most common setup for Indian RDs)</dd>
          </div>
        </dl>
        {result && monthlyDeposit && rate !== null && tenureMonths && (
          <p className="text-sm text-ink-soft leading-relaxed mt-4">
            For example: depositing <strong className="text-ink">{formatINR(monthlyDeposit)}</strong> every month at{' '}
            <strong className="text-ink">{rate}%</strong> p.a., compounded <strong className="text-ink">{compounding}</strong>, for{' '}
            <strong className="text-ink">{tenureMonths} months</strong> works out to a maturity value of{' '}
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
