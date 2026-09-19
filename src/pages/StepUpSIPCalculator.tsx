import React, { useMemo, useEffect, useState } from 'react'
import { CalculatorLayout } from '../components/layout/CalculatorLayout'
import {
  CurrencyInput,
  PercentageInput,
  YearsInput,
  Toggle,
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
import { calculateStepUpSIP, type StepUpMode } from '../calculations'
import { useUrlState } from '../hooks/useUrlState'
import { validateAmount, validateRate, validateYears, isFormValid } from '../utils/validation'
import { buildCSV, downloadCSV } from '../utils/csvExport'
import { downloadPDF } from '../utils/pdfExport'
import { formatINR, formatPercent } from '../utils/format'
import { DISCLAIMER_TEXT } from '../components/ui/Disclaimer'
import type { DataTableColumn } from '../components/ui/DataTable'

const YEARLY_COLUMNS: DataTableColumn[] = [
  { key: 'year', label: 'Year', isCurrency: false },
  { key: 'monthlyAmount', label: 'Monthly SIP' },
  { key: 'invested', label: 'Invested' },
  { key: 'returns', label: 'Expected Returns' },
  { key: 'closingBalance', label: 'Total Value' },
]

const FAQS = [
  { question: 'What is a Step-Up SIP?', answer: 'A Step-Up (or "top-up") SIP automatically increases your monthly investment amount at a fixed interval — typically once a year — either by a percentage or a fixed rupee amount, so your contribution keeps pace with your growing income.' },
  { question: 'Percentage vs fixed step-up — when should I use which?', answer: 'A percentage step-up (e.g. +10% a year) scales naturally with a growing income and a larger base amount. A fixed step-up (e.g. +₹1,000 a year) is simpler to plan around but represents a shrinking proportional increase as your SIP grows larger.' },
  { question: 'How much more can a step-up SIP earn compared to a flat SIP?', answer: 'Because later instalments are larger and each additional rupee still has years left to compound, a step-up SIP can meaningfully increase your invested amount and final corpus over long horizons — the exact difference depends entirely on your step-up rate, return assumption and duration.' },
  { question: 'Is step-up automatic in real mutual funds?', answer: 'Many Asset Management Companies (AMCs) offer a "top-up SIP" or "step-up SIP" feature that lets you pre-authorize automatic annual increases, so you do not need to manually modify your SIP each year — availability varies by fund house.' },
  { question: 'Does a step-up SIP increase my investment risk?', answer: 'No — you are investing in the same underlying fund with the same risk profile. A step-up SIP simply increases the amount invested over time; it does not change the nature of the fund itself.' },
  { question: 'What do "Total SIP Contribution" and "Total Step-Up Contribution" mean?', answer: 'Total SIP Contribution is what you would have invested if your instalment had stayed flat at the initial amount for the whole period. Total Step-Up Contribution is the additional amount invested purely because of the annual increases.' },
]

interface StepUpSIPFormState {
  [key: string]: number
  initial: number
  stepUpValue: number
  lumpsum: number
  ret: number
  years: number
  inflation: number
}

export function StepUpSIPCalculator() {
  const { initialState, updateUrl } = useUrlState<StepUpSIPFormState>({ initial: 10000, stepUpValue: 10, lumpsum: 0, ret: 12, years: 10, inflation: 0 })

  const [stepUpMode, setStepUpMode] = useState<StepUpMode>('percentage')
  const [initialMonthlySip, setInitialMonthlySip] = useState<number | null>(initialState.initial || 10000)
  const [stepUpValue, setStepUpValue] = useState<number | null>(initialState.stepUpValue || 10)
  const [initialLumpsum, setInitialLumpsum] = useState<number | null>(initialState.lumpsum || null)
  const [annualReturn, setAnnualReturn] = useState<number | null>(initialState.ret || 12)
  const [years, setYears] = useState<number | null>(initialState.years || 10)
  const [inflationRate, setInflationRate] = useState<number | null>(initialState.inflation || null)

  useEffect(() => {
    updateUrl({
      initial: initialMonthlySip ?? 0,
      stepUpValue: stepUpValue ?? 0,
      lumpsum: initialLumpsum ?? 0,
      ret: annualReturn ?? 0,
      years: years ?? 0,
      inflation: inflationRate ?? 0,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMonthlySip, stepUpValue, initialLumpsum, annualReturn, years, inflationRate])

  const validations = {
    initial: validateAmount(initialMonthlySip, { required: true, label: 'Initial monthly SIP' }),
    stepUpValue: validateAmount(stepUpValue, { required: true, label: 'Step-up value', allowZero: true }),
    lumpsum: validateAmount(initialLumpsum, { label: 'Initial lumpsum', allowZero: true }),
    ret: validateRate(annualReturn, { required: true, label: 'Expected return' }),
    years: validateYears(years, { label: 'Investment period' }),
    inflation: validateRate(inflationRate, { label: 'Inflation', max: 20 }),
  }
  const valid = isFormValid(Object.values(validations))

  const result = useMemo(() => {
    if (!valid || !initialMonthlySip || stepUpValue === null || annualReturn === null || !years) return null
    return calculateStepUpSIP({
      initialMonthlySip,
      stepUpMode,
      stepUpValue,
      initialLumpsum: initialLumpsum ?? 0,
      annualReturnPercent: annualReturn,
      years,
      inflationRate,
    })
  }, [valid, initialMonthlySip, stepUpMode, stepUpValue, initialLumpsum, annualReturn, years, inflationRate])

  function handleCSV() {
    if (!result) return
    downloadCSV('moneylens-step-up-sip-calculation', buildCSV(result, YEARLY_COLUMNS))
  }
  function handlePDF() {
    if (!result) return
    downloadPDF(result, YEARLY_COLUMNS, 'moneylens-step-up-sip-calculation', { disclaimer: DISCLAIMER_TEXT })
  }

  return (
    <CalculatorLayout
      seoTitle="Step-Up SIP Calculator – Calculate SIP with Annual Top-Up | MoneyLens"
      seoDescription="Calculate how a SIP that increases every year — by a fixed percentage or amount — grows over time, with a full year-wise breakdown, using MoneyLens' free Step-Up SIP calculator."
      eyebrow="Growth Calculator"
      title="Step-Up SIP Calculator"
      subtitle="Model a SIP that automatically increases every year, and see how it compares to a flat monthly contribution."
    >
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-5 sm:p-7 space-y-5 lg:border-r border-border-soft">
            <CurrencyInput label="Initial Monthly SIP" value={initialMonthlySip} onChange={setInitialMonthlySip} max={2_00_000} step={500} error={validations.initial.error} />
            <Toggle
              label="Step-Up Mode"
              value={stepUpMode}
              onChange={(v) => setStepUpMode(v as StepUpMode)}
              options={[
                { value: 'percentage', label: 'Percentage' },
                { value: 'amount', label: 'Fixed Amount' },
              ]}
            />
            {stepUpMode === 'percentage' ? (
              <PercentageInput label="Annual Step-Up" value={stepUpValue} onChange={setStepUpValue} max={50} step={1} error={validations.stepUpValue.error} hint="Increase applied once every 12 months." />
            ) : (
              <CurrencyInput label="Annual Step-Up Amount" value={stepUpValue} onChange={setStepUpValue} max={20000} step={500} error={validations.stepUpValue.error} hint="Increase applied once every 12 months." />
            )}
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
                  <p className="text-xs text-ink-muted mt-1.5 max-w-[220px]">
                    We'll calculate your estimated investment growth, returns and year-wise breakdown.
                  </p>
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

                <div className="mt-4 pt-4 border-t border-border-soft">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">Contribution Breakdown</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-ink-muted">Base SIP</p>
                      <p className="text-sm font-bold text-ink mt-1 tabular-nums">{formatINR(result.summary.totalSipContribution ?? 0)}</p>
                      <p className="text-[11px] text-ink-muted mt-1">Without any step-up.</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-muted">From Step-Ups</p>
                      <p className="text-sm font-bold text-accent-growth mt-1 tabular-nums">{formatINR(result.summary.totalStepUpContribution ?? 0)}</p>
                      <p className="text-[11px] text-ink-muted mt-1">Extra via annual increases.</p>
                    </div>
                  </div>
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
              <SectionHeading title="Year-Wise Breakdown" subtitle="Monthly SIP amount, invested total, growth and total value for each year." align="left" as="h3" />
              <ExportMenu onCSV={handleCSV} onPDF={handlePDF} />
            </div>
            <DataTable columns={YEARLY_COLUMNS} rows={result.yearlyData} />
          </div>
        </>
      )}

      <Card className="p-5 sm:p-7">
        <SectionHeading title="How Step-Up SIP Growth Is Calculated" as="h3" />
        <p className="text-sm text-ink-soft leading-relaxed mb-4">
          MoneyLens starts with your initial monthly SIP and increases it once every 12 months, either by the percentage or fixed amount you choose.
          Each month's contribution is then compounded at the effective monthly rate implied by your expected annual return, exactly like the SIP
          calculator.
        </p>
        <div className="rounded-xl bg-platinum/50 border border-border-soft px-5 py-4 font-mono text-sm text-ink overflow-x-auto">
          {stepUpMode === 'percentage' ? 'P₍year₎ = P₁ × (1 + step-up%)^(year − 1)' : 'P₍year₎ = P₁ + (year − 1) × step-up amount'}
        </div>
        <dl className="mt-4 space-y-2.5">
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">P₁</dt>
            <dd className="text-sm text-ink-soft">Your initial monthly SIP instalment</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-14 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">P₍year₎</dt>
            <dd className="text-sm text-ink-soft">The monthly instalment during a given year, after step-ups so far</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">r</dt>
            <dd className="text-sm text-ink-soft">Effective monthly rate — set so 12 months of compounding equal exactly your entered annual return</dd>
          </div>
        </dl>
        {result && initialMonthlySip && (
          <p className="text-sm text-ink-soft leading-relaxed mt-4">
            For example: starting at <strong className="text-ink">{formatINR(initialMonthlySip)}</strong>/month, stepped up{' '}
            <strong className="text-ink">
              {stepUpMode === 'percentage' ? `${stepUpValue}%` : formatINR(stepUpValue ?? 0)}
            </strong>{' '}
            every year for <strong className="text-ink">{years} years</strong> at <strong className="text-ink">{annualReturn}%</strong> expected
            return works out to a final value of <strong className="text-ink">{formatINR(result.summary.finalValue)}</strong>.
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
