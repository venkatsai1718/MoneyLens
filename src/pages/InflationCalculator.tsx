import React, { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CalculatorLayout } from '../components/layout/CalculatorLayout'
import { CurrencyInput, PercentageInput, YearsInput, ChartCard, DataTable, ExportMenu, Disclaimer, FAQ, SectionHeading, Card } from '../components/ui'
import { calculateInflation } from '../calculations'
import { validateAmount, validateRate, validateYears, isFormValid } from '../utils/validation'
import { buildCSV, downloadCSV } from '../utils/csvExport'
import { downloadPDF } from '../utils/pdfExport'
import { formatINR, formatAxisINR } from '../utils/format'
import { CHART_COLORS } from '../utils/chartColors'
import { ChartTooltip } from '../charts/ChartTooltip'
import { DISCLAIMER_TEXT } from '../components/ui/Disclaimer'
import type { DataTableColumn } from '../components/ui/DataTable'

const YEARLY_COLUMNS: DataTableColumn[] = [
  { key: 'year', label: 'Year', isCurrency: false },
  { key: 'closingBalance', label: 'Future Amount Required' },
]

const FAQS = [
  { question: 'What is inflation?', answer: 'Inflation is the rate at which the general cost of goods and services rises over time, which reduces how much a fixed amount of money can buy in the future.' },
  { question: 'Why does inflation matter for financial planning?', answer: 'A goal or expense priced in today\'s money will typically cost more by the time you actually need it. Accounting for inflation helps you plan for the real future cost, not just the current one.' },
  { question: 'Is the inflation rate I enter guaranteed to hold?', answer: 'No. Inflation varies year to year based on the economy. The rate you enter is your own assumption for planning purposes, not a forecast or guarantee.' },
  { question: 'How is "purchasing power" different from "future amount required"?', answer: '"Future Amount Required" tells you how much money you will need in the future to buy what your current amount buys today. "Equivalent Purchasing Power" instead tells you what your current amount will feel worth, in today\'s terms, after inflation erodes it.' },
  { question: 'How should I pick an inflation rate assumption?', answer: 'Many long-term Indian financial plans use historical CPI inflation, commonly cited in the 5–7% range, as a reference point — but this is not an official current rate, and you should choose an assumption appropriate to your own planning horizon.' },
]

function InflationChart({ data }: { data: { year: number; closingBalance: number }[] }) {
  const chartData = data.map((d) => ({ year: d.year, 'Future Amount Required': Math.round(d.closingBalance) }))
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="inflationGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.value} stopOpacity={0.35} />
            <stop offset="100%" stopColor={CHART_COLORS.value} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="year"
          tickFormatter={(y) => `Y${y}`}
          tick={{ fontSize: 11, fill: CHART_COLORS.axisText }}
          axisLine={{ stroke: CHART_COLORS.border }}
          tickLine={false}
          label={{ value: 'Year', position: 'insideBottom', offset: -4, fontSize: 11, fill: CHART_COLORS.axisText }}
        />
        <YAxis
          tickFormatter={formatAxisINR}
          tick={{ fontSize: 11, fill: CHART_COLORS.axisText }}
          axisLine={false}
          tickLine={false}
          width={64}
          label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: CHART_COLORS.axisText }}
        />
        <Tooltip content={<ChartTooltip />} cursor={false} />
        <Area type="monotone" dataKey="Future Amount Required" stroke={CHART_COLORS.value} strokeWidth={2.5} fill="url(#inflationGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function InflationCalculator() {
  const [currentAmount, setCurrentAmount] = React.useState<number | null>(100000)
  const [inflationRate, setInflationRate] = React.useState<number | null>(6)
  const [years, setYears] = React.useState<number | null>(10)

  const validations = {
    amount: validateAmount(currentAmount, { required: true, label: 'Current amount' }),
    rate: validateRate(inflationRate, { required: true, label: 'Inflation rate', max: 20 }),
    years: validateYears(years, { label: 'Duration' }),
  }
  const valid = isFormValid(Object.values(validations))

  const result = useMemo(() => {
    if (!valid || !currentAmount || inflationRate === null || !years) return null
    return calculateInflation({ currentAmount, inflationRatePercent: inflationRate, years })
  }, [valid, currentAmount, inflationRate, years])

  function handleCSV() {
    if (!result) return
    downloadCSV('moneylens-inflation-calculation', buildCSV(result, YEARLY_COLUMNS))
  }
  function handlePDF() {
    if (!result) return
    downloadPDF(result, YEARLY_COLUMNS, 'moneylens-inflation-calculation', { disclaimer: DISCLAIMER_TEXT })
  }

  return (
    <CalculatorLayout
      seoTitle="Inflation Calculator – Calculate Future Value & Purchasing Power | MoneyLens"
      seoDescription="See how inflation erodes today's money over time. Calculate the future amount required and the equivalent purchasing power of your money."
      eyebrow="Analysis Calculator"
      title="Inflation Calculator"
      subtitle="See how inflation erodes today's money over time, and what you'll need in the future to maintain the same purchasing power."
    >
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-5 sm:p-7 space-y-5 lg:border-r border-border-soft">
            <CurrencyInput label="Current Amount" value={currentAmount} onChange={setCurrentAmount} max={1_00_00_000} step={5000} error={validations.amount.error} />
            <PercentageInput label="Inflation Rate" value={inflationRate} onChange={setInflationRate} max={15} step={0.5} error={validations.rate.error} />
            <YearsInput label="Number of Years" value={years} onChange={setYears} max={40} />
          </div>

          <div className="p-5 sm:p-7 flex flex-col justify-center">
            {!result ? (
              <div className="flex-1 flex items-center justify-center text-center py-10">
                <div>
                  <p className="text-sm font-semibold text-ink">Enter your details</p>
                  <p className="text-xs text-ink-muted mt-1.5 max-w-[220px]">We'll show how inflation affects your money over time.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium text-ink-muted mb-1.5">Future Amount Required</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-ink tabular-nums">{formatINR(result.futureAmountRequired)}</p>
                  <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">How much money you'll need in {years} years to buy what this amount buys today.</p>
                </div>
                <div className="border-t border-border-soft pt-5">
                  <p className="text-xs font-medium text-ink-muted mb-1.5">Equivalent Purchasing Power</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-ink tabular-nums">{formatINR(result.equivalentPurchasingPower)}</p>
                  <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">What this amount will feel worth, in today's terms, after {years} years of inflation.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {result && (
        <>
          <ChartCard title="Cost of Living Projection" subtitle="How much the same amount will cost, year by year">
            <InflationChart data={result.yearlyData} />
          </ChartCard>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <SectionHeading title="Year-Wise Breakdown" subtitle="Future amount required at the end of each year." align="left" as="h3" />
              <ExportMenu onCSV={handleCSV} onPDF={handlePDF} />
            </div>
            <DataTable columns={YEARLY_COLUMNS} rows={result.yearlyData} />
          </div>
        </>
      )}

      <Card className="p-5 sm:p-7">
        <SectionHeading title="How This Is Calculated" as="h3" />
        <p className="text-sm text-ink-soft leading-relaxed mb-4">
          Inflation is modelled as one flat rate that compounds every year. "Future Amount Required" projects your amount forward — how much
          you'd need later to buy what it buys today. "Equivalent Purchasing Power" runs the same idea in reverse — what today's amount will
          feel like it's worth once inflation has eaten into it.
        </p>
        <div className="space-y-3">
          <div className="rounded-xl bg-platinum/50 border border-border-soft px-5 py-4 font-mono text-sm text-ink overflow-x-auto">
            Future Amount Required = Current Amount × (1 + inflation rate)ⁿ
          </div>
          <div className="rounded-xl bg-platinum/50 border border-border-soft px-5 py-4 font-mono text-sm text-ink overflow-x-auto">
            Equivalent Purchasing Power = Current Amount ÷ (1 + inflation rate)ⁿ
          </div>
        </div>
        <dl className="mt-4 space-y-2.5">
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">n</dt>
            <dd className="text-sm text-ink-soft">Number of years the amount is projected over</dd>
          </div>
        </dl>
        {result && currentAmount && inflationRate !== null && years && (
          <p className="text-sm text-ink-soft leading-relaxed mt-4">
            For example: <strong className="text-ink">{formatINR(currentAmount)}</strong> today, at{' '}
            <strong className="text-ink">{inflationRate}%</strong> inflation over <strong className="text-ink">{years} years</strong>, would
            need to become <strong className="text-ink">{formatINR(result.futureAmountRequired)}</strong> to buy the same thing — or, viewed
            the other way, today's amount would feel like only{' '}
            <strong className="text-ink">{formatINR(result.equivalentPurchasingPower)}</strong> is worth by then.
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
