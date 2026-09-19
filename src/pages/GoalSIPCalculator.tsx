import React, { useMemo } from 'react'
import { CalculatorLayout } from '../components/layout/CalculatorLayout'
import { CurrencyInput, PercentageInput, YearsInput, SummaryRow, ChartCard, DataTable, ExportMenu, Disclaimer, FAQ, SectionHeading, Card } from '../components/ui'
import { GrowthChart } from '../charts/GrowthChart'
import { InvestedVsReturnsChart } from '../charts/InvestedVsReturnsChart'
import { calculateGoalSIP } from '../calculations'
import { validateAmount, validateRate, isFormValid } from '../utils/validation'
import { buildCSV, downloadCSV } from '../utils/csvExport'
import { downloadPDF } from '../utils/pdfExport'
import { formatINR, formatPercent } from '../utils/format'
import { DISCLAIMER_TEXT } from '../components/ui/Disclaimer'
import type { DataTableColumn } from '../components/ui/DataTable'
import { Link } from 'react-router-dom'

const YEARLY_COLUMNS: DataTableColumn[] = [
  { key: 'year', label: 'Year', isCurrency: false },
  { key: 'invested', label: 'Invested' },
  { key: 'returns', label: 'Expected Returns' },
  { key: 'closingBalance', label: 'Total Value' },
]

const FAQS = [
  { question: 'What is goal-based SIP planning?', answer: 'Instead of picking a monthly SIP amount arbitrarily, goal-based planning works backward from a target amount and date to calculate exactly how much you need to invest monthly to reach it, at your assumed rate of return.' },
  { question: 'Why does inflation matter for a future goal?', answer: "A goal amount expressed in today's money will cost more in the future. If you enter an inflation rate, MoneyLens first inflates your goal to its future cost, then calculates the SIP needed to reach that larger, inflation-adjusted number." },
  { question: 'What if I already have savings toward this goal?', answer: 'Enter it under "Current Savings" — MoneyLens assumes it continues growing at your expected return alongside your new SIP, and reduces the required monthly SIP accordingly.' },
  { question: 'What if the required SIP amount seems too high?', answer: 'You could consider extending the investment duration or revisiting your expected-return assumption — this calculator does not recommend a specific change, it only recalculates based on whatever inputs you enter.' },
  { question: 'Is the required SIP amount fixed forever in this model?', answer: 'Yes, this calculator assumes a constant monthly SIP for the full duration. If you would rather start smaller and increase contributions over time, see the Step-Up SIP calculator.' },
  { question: 'How accurate is this projection?', answer: 'It is only as accurate as the return and inflation assumptions you enter. Actual market returns and inflation will differ from any fixed assumption, so treat the result as a planning estimate, not a guarantee.' },
]

export function GoalSIPCalculator() {
  const [goalAmount, setGoalAmount] = React.useState<number | null>(2500000)
  const [currentSavings, setCurrentSavings] = React.useState<number | null>(null)
  const [years, setYears] = React.useState<number | null>(10)
  const [annualReturn, setAnnualReturn] = React.useState<number | null>(12)
  const [inflationRate, setInflationRate] = React.useState<number | null>(null)

  const validations = {
    goal: validateAmount(goalAmount, { required: true, label: 'Goal amount' }),
    savings: validateAmount(currentSavings, { label: 'Current savings', allowZero: true }),
    ret: validateRate(annualReturn, { required: true, label: 'Expected return' }),
    inflation: validateRate(inflationRate, { label: 'Inflation', max: 20 }),
  }
  const valid = isFormValid(Object.values(validations))

  const result = useMemo(() => {
    if (!valid || !goalAmount || annualReturn === null || !years) return null
    return calculateGoalSIP({ goalAmount, currentSavings: currentSavings ?? 0, years, annualReturnPercent: annualReturn, inflationRate })
  }, [valid, goalAmount, currentSavings, years, annualReturn, inflationRate])

  function handleCSV() {
    if (!result) return
    downloadCSV('moneylens-goal-sip-calculation', buildCSV(result, YEARLY_COLUMNS))
  }
  function handlePDF() {
    if (!result) return
    downloadPDF(result, YEARLY_COLUMNS, 'moneylens-goal-sip-calculation', { disclaimer: DISCLAIMER_TEXT })
  }

  return (
    <CalculatorLayout
      seoTitle="Goal SIP Calculator – Calculate SIP Needed for Your Financial Goal | MoneyLens"
      seoDescription="Work backward from a financial goal to the monthly SIP you need, with optional inflation adjustment and a full year-wise breakdown."
      eyebrow="Planning Calculator"
      title="Goal-Based SIP Calculator"
      subtitle="Work backward from a financial goal to the monthly SIP required to reach it."
    >
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-5 sm:p-7 space-y-5 lg:border-r border-border-soft">
            <CurrencyInput label="Goal Amount (Today's Value)" value={goalAmount} onChange={setGoalAmount} max={5_00_00_000} step={50000} error={validations.goal.error} />
            <CurrencyInput label="Current Savings" value={currentSavings} onChange={setCurrentSavings} max={50_00_000} step={5000} error={validations.savings.error} optional hint="Lumpsum you've already saved toward this goal." />
            <YearsInput label="Time to Goal" value={years} onChange={setYears} max={40} />
            <PercentageInput label="Expected Annual Return" value={annualReturn} onChange={setAnnualReturn} max={30} step={0.5} error={validations.ret.error} />
            <PercentageInput
              label="Inflation"
              value={inflationRate}
              onChange={setInflationRate}
              max={15}
              step={0.5}
              error={validations.inflation.error}
              optional
              hint="If entered, we'll inflate your goal to its future cost before calculating the required SIP."
            />
          </div>

          <div className="p-5 sm:p-7 flex flex-col">
            {!result ? (
              <div className="flex-1 flex items-center justify-center text-center py-10">
                <div>
                  <p className="text-sm font-semibold text-ink">Enter your goal details</p>
                  <p className="text-xs text-ink-muted mt-1.5 max-w-[220px]">We'll calculate the monthly SIP required to reach it.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="chart-lift rounded-xl h-48 sm:h-56">
                  <InvestedVsReturnsChart invested={result.summary.totalInvested} returns={result.summary.totalReturns} />
                </div>
                <div className="mt-5 space-y-3">
                  <SummaryRow label="Today's Goal" value={result.summary.todaysGoal ?? 0} />
                  <SummaryRow label="Inflation-Adjusted Goal" value={result.summary.inflationAdjustedGoal ?? 0} />
                  <div className="border-t border-border-soft pt-3">
                    <SummaryRow label="Required Monthly SIP" value={result.summary.requiredMonthlySip ?? 0} emphasize />
                  </div>
                  {result.inflationApplied && (
                    <div className="rounded-lg bg-platinum px-3 py-2 mt-1">
                      <span className="text-xs text-ink-muted">
                        Inflation adjustment applied at {formatPercent(result.inflationRate!, 1)} annually — your goal was inflated to its future
                        cost before the required SIP was calculated.
                      </span>
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
          <Card className="p-5 sm:p-7">
            <SectionHeading title="Projected Investment Trajectory" subtitle="How the required SIP grows to meet your goal." align="left" as="h3" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <SummaryRow label="Total Invested" value={result.summary.totalInvested} />
              <SummaryRow label="Expected Returns" value={result.summary.totalReturns} tone="growth" />
              <SummaryRow label="Final Value" value={result.summary.finalValue} />
            </div>
          </Card>

          <ChartCard title="Portfolio Growth" subtitle="Total invested vs. portfolio value, year over year">
            <GrowthChart data={result.yearlyData} />
          </ChartCard>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <SectionHeading title="Year-Wise Breakdown" subtitle="Invested amount, growth and total value for each year." align="left" as="h3" />
              <ExportMenu onCSV={handleCSV} onPDF={handlePDF} />
            </div>
            <DataTable columns={YEARLY_COLUMNS} rows={result.yearlyData} />
          </div>
        </>
      )}

      <Card className="p-5 sm:p-7">
        <SectionHeading title="How the Required SIP Is Calculated" as="h3" />
        <p className="text-sm text-ink-soft leading-relaxed mb-4">
          First, if you enter an inflation rate, today's goal is inflated to its future cost over your chosen duration. Then, accounting for any
          current savings already growing at your expected return, MoneyLens solves the standard SIP future-value formula for the monthly
          instalment P that reaches the remaining target:
        </p>
        <div className="rounded-xl bg-platinum/50 border border-border-soft px-5 py-4 font-mono text-sm text-ink overflow-x-auto">
          P = FV<sub>target</sub> / ( [ ((1+r)ⁿ − 1) / r ] × (1+r) )
        </div>
        {result && (
          <p className="text-sm text-ink-soft leading-relaxed mt-4">
            For your inputs, this comes out to a required monthly SIP of <strong className="text-ink">{formatINR(result.summary.requiredMonthlySip ?? 0)}</strong>.
            For a SIP that starts smaller and increases every year instead of staying fixed, see the{' '}
            <Link to="/step-up-sip-calculator" className="text-ink underline underline-offset-2">
              Step-Up SIP Calculator
            </Link>
            .
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
