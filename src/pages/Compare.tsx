import React, { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Plus, Trash2 } from 'lucide-react'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { SectionHeading } from '../components/ui/SectionHeading'
import { ChartCard } from '../components/ui/ChartCard'
import { FAQ } from '../components/ui/FAQ'
import { Disclaimer } from '../components/ui/Disclaimer'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { PercentageInput } from '../components/ui/PercentageInput'
import { YearsInput } from '../components/ui/YearsInput'
import { SelectInput } from '../components/ui/SelectInput'
import { ComparisonChart } from '../charts/ComparisonChart'
import { InvestedVsReturnsChart } from '../charts/InvestedVsReturnsChart'
import { calculateSIP, calculateStepUpSIP, calculateLumpsum, calculateFD, calculateRD, compareInvestments } from '../calculations'
import type { CompoundingFrequency } from '../calculations/fd'
import type { CalculationResult, ComparisonScenario } from '../types/calculator'
import { formatINR } from '../utils/format'

type ScenarioType = 'sip' | 'stepup' | 'lumpsum' | 'fd' | 'rd'

const TYPE_LABELS: Record<ScenarioType, string> = {
  sip: 'SIP',
  stepup: 'Step-Up SIP',
  lumpsum: 'Lumpsum',
  fd: 'Fixed Deposit',
  rd: 'Recurring Deposit',
}

const TYPE_OPTIONS = (Object.keys(TYPE_LABELS) as ScenarioType[]).map((value) => ({ value, label: TYPE_LABELS[value] }))

const COMPOUNDING_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half-yearly', label: 'Half-Yearly' },
  { value: 'yearly', label: 'Yearly' },
]

interface SipScenario {
  id: string
  name: string
  type: 'sip'
  monthly: number
  lumpsum: number
  ret: number
  years: number
  inflation: number
}
interface StepUpScenario {
  id: string
  name: string
  type: 'stepup'
  monthly: number
  stepUpPercent: number
  ret: number
  years: number
  inflation: number
}
interface LumpsumScenario {
  id: string
  name: string
  type: 'lumpsum'
  principal: number
  ret: number
  years: number
  inflation: number
}
interface FDScenario {
  id: string
  name: string
  type: 'fd'
  principal: number
  rate: number
  years: number
  compounding: CompoundingFrequency
  inflation: number
}
interface RDScenario {
  id: string
  name: string
  type: 'rd'
  monthly: number
  rate: number
  years: number
  compounding: CompoundingFrequency
  inflation: number
}

type Scenario = SipScenario | StepUpScenario | LumpsumScenario | FDScenario | RDScenario

let idCounter = 0
function nextId(): string {
  idCounter += 1
  return `scenario-${idCounter}-${Date.now()}`
}

function createDefaultScenario(type: ScenarioType, id: string, name: string): Scenario {
  switch (type) {
    case 'sip':
      return { id, name, type, monthly: 10000, lumpsum: 0, ret: 12, years: 10, inflation: 0 }
    case 'stepup':
      return { id, name, type, monthly: 10000, stepUpPercent: 10, ret: 12, years: 10, inflation: 0 }
    case 'lumpsum':
      return { id, name, type, principal: 5_00_000, ret: 12, years: 10, inflation: 0 }
    case 'fd':
      return { id, name, type, principal: 5_00_000, rate: 7.5, years: 10, compounding: 'quarterly', inflation: 0 }
    case 'rd':
      return { id, name, type, monthly: 10000, rate: 7, years: 10, compounding: 'quarterly', inflation: 0 }
  }
}

function computeResult(s: Scenario): CalculationResult {
  switch (s.type) {
    case 'sip':
      return calculateSIP({ monthlyInvestment: s.monthly, initialLumpsum: s.lumpsum, annualReturnPercent: s.ret, years: s.years, inflationRate: s.inflation || null })
    case 'stepup':
      return calculateStepUpSIP({
        initialMonthlySip: s.monthly,
        stepUpMode: 'percentage',
        stepUpValue: s.stepUpPercent,
        annualReturnPercent: s.ret,
        years: s.years,
        inflationRate: s.inflation || null,
      })
    case 'lumpsum':
      return calculateLumpsum({ initialInvestment: s.principal, annualReturnPercent: s.ret, years: s.years, inflationRate: s.inflation || null })
    case 'fd':
      return calculateFD({
        principal: s.principal,
        annualRatePercent: s.rate,
        tenureValue: s.years,
        tenureUnit: 'years',
        compoundingFrequency: s.compounding,
        cumulative: true,
        inflationRate: s.inflation || null,
      })
    case 'rd':
      return calculateRD({ monthlyDeposit: s.monthly, annualRatePercent: s.rate, tenureMonths: Math.round(s.years * 12), compoundingFrequency: s.compounding, inflationRate: s.inflation || null })
  }
}

function csvEscape(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str.replace(/"/g, '""')}"`
  return str
}

function buildComparisonCSV(scenarios: ComparisonScenario[]): string {
  const lines: string[] = []
  lines.push('Calculator,MoneyLens Comparison')
  lines.push(`Generated On,${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`)
  lines.push('')
  for (const s of scenarios) {
    lines.push(`Scenario,${csvEscape(s.name)} (${csvEscape(s.type)})`)
    for (const a of s.result.assumptions) lines.push(`${csvEscape(a.label)},${csvEscape(a.value)}`)
    lines.push('')
  }
  const showInflation = scenarios.some((s) => s.result.inflationApplied)
  lines.push(['Metric', ...scenarios.map((s) => csvEscape(s.name))].join(','))
  lines.push(['Total Invested', ...scenarios.map((s) => Math.round(s.result.summary.totalInvested))].join(','))
  lines.push(['Expected Returns', ...scenarios.map((s) => Math.round(s.result.summary.totalReturns))].join(','))
  lines.push(['Final Value', ...scenarios.map((s) => Math.round(s.result.summary.finalValue))].join(','))
  if (showInflation) {
    lines.push(['Inflation-Adjusted Value', ...scenarios.map((s) => (s.result.summary.inflationAdjustedValue !== undefined ? Math.round(s.result.summary.inflationAdjustedValue) : ''))].join(','))
  }
  return lines.join('\n')
}

function downloadText(filename: string, content: string) {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const FAQS = [
  { question: 'What does the Compare tool do?', answer: 'It lets you build multiple investment scenarios — SIP, Step-Up SIP, Lumpsum, FD or RD — using the same calculation engine as the individual calculators, and shows their total invested, expected returns, final value and growth chart side by side.' },
  { question: 'Why doesn’t MoneyLens rank or recommend an investment?', answer: 'Every investment type has different risk, liquidity and taxation characteristics that a calculator cannot fully capture. MoneyLens shows you the calculated numbers for the assumptions you enter, so you can make an informed decision with full context.' },
  { question: 'Can I compare more than two scenarios?', answer: 'Yes — use "Add Scenario" to add as many as you like. Each one can be a different investment type with its own assumptions.' },
  { question: 'Why might two scenarios show very different final values?', answer: 'Usually because their assumptions differ — a different expected return, contribution amount, duration or compounding frequency. Check the "Comparison Assumptions" section to see exactly what each scenario assumes.' },
  { question: 'Is the inflation-adjusted row always shown?', answer: 'No — it only appears when at least one of your scenarios has an inflation rate entered. Leave inflation blank on a scenario to exclude it from that adjustment.' },
]

export function Compare() {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    createDefaultScenario('sip', nextId(), 'Scenario A'),
    createDefaultScenario('stepup', nextId(), 'Scenario B'),
  ])

  function updateScenario(id: string, patch: Record<string, any>) {
    setScenarios((prev) => prev.map((s) => (s.id === id ? ({ ...s, ...patch } as Scenario) : s)))
  }

  function changeType(id: string, type: ScenarioType) {
    setScenarios((prev) => prev.map((s) => (s.id === id ? createDefaultScenario(type, s.id, s.name) : s)))
  }

  function addScenario() {
    const nextLetter = String.fromCharCode(65 + scenarios.length)
    setScenarios((prev) => [...prev, createDefaultScenario('sip', nextId(), `Scenario ${nextLetter}`)])
  }

  function removeScenario(id: string) {
    setScenarios((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev))
  }

  const comparisonScenarios = useMemo(
    () => compareInvestments(scenarios.map((s) => ({ name: s.name, type: TYPE_LABELS[s.type], result: computeResult(s) }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(scenarios)],
  )

  const showInflationRow = comparisonScenarios.some((s) => s.result.inflationApplied)

  function handleDownloadCSV() {
    downloadText('moneylens-comparison.csv', buildComparisonCSV(comparisonScenarios))
  }

  return (
    <>
      <Helmet>
        <title>Compare Investments – SIP vs FD vs Lumpsum & More | MoneyLens</title>
        <meta
          name="description"
          content="Compare SIP, Step-Up SIP, FD, Lumpsum and RD side by side. See total invested, expected returns, final value and a shared growth chart for each scenario's assumptions."
        />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-14 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2.5">Side-by-Side</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink max-w-2xl">Compare Investments</h1>
        <p className="text-ink-muted mt-3 text-[15px] leading-relaxed max-w-2xl">
          Build multiple scenarios and see how they stack up — without any ranking or recommendation.
        </p>
        <div className="mt-5 rounded-xl border border-border-soft bg-platinum/40 px-4 py-3 text-xs text-ink-muted max-w-2xl">
          MoneyLens does not rank or recommend any investment. The figures below reflect only the assumptions you've entered for each scenario.
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-20 space-y-10 sm:space-y-14">
        {/* Scenario editors */}
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {scenarios.map((s) => (
              <Card key={s.id}>
                <CardBody className="space-y-5">
                  <div className="flex items-center gap-3">
                    <input
                      value={s.name}
                      onChange={(e) => updateScenario(s.id, { name: e.target.value })}
                      className="flex-1 rounded-xl border border-border bg-white px-3.5 py-2.5 text-[15px] font-semibold text-ink outline-none focus:border-gunmetal focus:shadow-focus focus-visible:shadow-none"
                      aria-label="Scenario name"
                    />
                    <button
                      type="button"
                      onClick={() => removeScenario(s.id)}
                      disabled={scenarios.length <= 1}
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border text-ink-muted hover:text-accent-withdraw hover:border-accent-withdraw/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label={`Remove ${s.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <SelectInput label="Investment Type" value={s.type} onChange={(v) => changeType(s.id, v as ScenarioType)} options={TYPE_OPTIONS} />

                  <ScenarioFields scenario={s} onChange={(patch) => updateScenario(s.id, patch)} />
                </CardBody>
              </Card>
            ))}
          </div>
          <Button variant="outline" size="md" onClick={addScenario} className="mt-5">
            <Plus className="h-4 w-4" />
            Add Scenario
          </Button>
        </div>

        {/* Assumptions */}
        <div>
          <SectionHeading title="Comparison Assumptions" subtitle="Each scenario's inputs, shown side by side so differences are easy to spot." as="h2" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {comparisonScenarios.map((s) => (
              <Card key={s.id}>
                <CardBody>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="text-[15px] font-semibold text-ink">{s.name}</h3>
                    <Badge tone="neutral">{s.type}</Badge>
                  </div>
                  <dl className="space-y-1.5">
                    {s.result.assumptions.map((a) => (
                      <div key={a.label} className="flex items-center justify-between gap-4 text-sm">
                        <dt className="text-ink-muted">{a.label}</dt>
                        <dd className="font-semibold text-ink tabular-nums">{a.value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <SectionHeading title="Comparison" subtitle="Total invested, expected returns and final value for each scenario." as="h2" />
            <Button variant="outline" size="md" onClick={handleDownloadCSV}>
              Download CSV
            </Button>
          </div>
          <div className="overflow-x-auto scrollbar-thin rounded-xl border border-border">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="bg-platinum/60 text-left">
                  <th scope="col" className="px-4 py-3 font-semibold text-ink-soft whitespace-nowrap">
                    Metric
                  </th>
                  {comparisonScenarios.map((s) => (
                    <th key={s.id} scope="col" className="px-4 py-3 font-semibold text-ink-soft whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                        {s.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <MetricRow label="Total Invested" scenarios={comparisonScenarios} pick={(r) => r.summary.totalInvested} />
                <MetricRow label="Expected Returns" scenarios={comparisonScenarios} pick={(r) => r.summary.totalReturns} />
                <MetricRow label="Final Value" scenarios={comparisonScenarios} pick={(r) => r.summary.finalValue} emphasize />
                {showInflationRow && (
                  <MetricRow label="Inflation-Adjusted Value" scenarios={comparisonScenarios} pick={(r) => r.summary.inflationAdjustedValue ?? null} />
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Growth chart */}
        <ChartCard title="Growth Comparison" subtitle="Portfolio / corpus value for each scenario, year over year">
          <ComparisonChart scenarios={comparisonScenarios} />
        </ChartCard>

        {/* Invested vs returns per scenario */}
        <div>
          <SectionHeading title="Investment vs Returns" subtitle="Principal vs. growth, per scenario." as="h2" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {comparisonScenarios.map((s) => (
              <ChartCard key={s.id} title={s.name} subtitle={s.type}>
                <InvestedVsReturnsChart invested={s.result.summary.totalInvested} returns={s.result.summary.totalReturns} />
              </ChartCard>
            ))}
          </div>
        </div>

        <div>
          <SectionHeading title="Frequently Asked Questions" as="h3" />
          <FAQ items={FAQS} />
        </div>

        <Disclaimer />
      </div>
    </>
  )
}

function MetricRow({
  label,
  scenarios,
  pick,
  emphasize,
}: {
  label: string
  scenarios: ComparisonScenario[]
  pick: (r: CalculationResult) => number | null
  emphasize?: boolean
}) {
  return (
    <tr className="odd:bg-white even:bg-snow/60">
      <td className="px-4 py-3 text-ink-soft font-medium whitespace-nowrap">{label}</td>
      {scenarios.map((s) => {
        const value = pick(s.result)
        return (
          <td key={s.id} className={`px-4 py-3 whitespace-nowrap tabular-nums ${emphasize ? 'font-bold text-ink' : 'text-ink'}`}>
            {value === null ? '—' : formatINR(value)}
          </td>
        )
      })}
    </tr>
  )
}

function ScenarioFields({ scenario, onChange }: { scenario: Scenario; onChange: (patch: Record<string, any>) => void }) {
  if (scenario.type === 'sip') {
    return (
      <>
        <CurrencyInput label="Monthly Investment" value={scenario.monthly} onChange={(v) => onChange({ monthly: v ?? 0 })} max={2_00_000} step={500} />
        <CurrencyInput label="Initial Lumpsum" value={scenario.lumpsum} onChange={(v) => onChange({ lumpsum: v ?? 0 })} max={20_00_000} step={1000} optional />
        <PercentageInput label="Expected Annual Return" value={scenario.ret} onChange={(v) => onChange({ ret: v ?? 0 })} max={30} step={0.5} />
        <YearsInput label="Investment Period" value={scenario.years} onChange={(v) => onChange({ years: v ?? 1 })} max={40} />
        <PercentageInput label="Inflation" value={scenario.inflation} onChange={(v) => onChange({ inflation: v ?? 0 })} max={15} step={0.5} optional />
      </>
    )
  }
  if (scenario.type === 'stepup') {
    return (
      <>
        <CurrencyInput label="Initial Monthly SIP" value={scenario.monthly} onChange={(v) => onChange({ monthly: v ?? 0 })} max={2_00_000} step={500} />
        <PercentageInput label="Annual Step-Up" value={scenario.stepUpPercent} onChange={(v) => onChange({ stepUpPercent: v ?? 0 })} max={50} step={1} />
        <PercentageInput label="Expected Annual Return" value={scenario.ret} onChange={(v) => onChange({ ret: v ?? 0 })} max={30} step={0.5} />
        <YearsInput label="Investment Period" value={scenario.years} onChange={(v) => onChange({ years: v ?? 1 })} max={40} />
        <PercentageInput label="Inflation" value={scenario.inflation} onChange={(v) => onChange({ inflation: v ?? 0 })} max={15} step={0.5} optional />
      </>
    )
  }
  if (scenario.type === 'lumpsum') {
    return (
      <>
        <CurrencyInput label="Initial Investment" value={scenario.principal} onChange={(v) => onChange({ principal: v ?? 0 })} max={50_00_000} step={5000} />
        <PercentageInput label="Expected Annual Return" value={scenario.ret} onChange={(v) => onChange({ ret: v ?? 0 })} max={30} step={0.5} />
        <YearsInput label="Investment Period" value={scenario.years} onChange={(v) => onChange({ years: v ?? 1 })} max={40} />
        <PercentageInput label="Inflation" value={scenario.inflation} onChange={(v) => onChange({ inflation: v ?? 0 })} max={15} step={0.5} optional />
      </>
    )
  }
  if (scenario.type === 'fd') {
    return (
      <>
        <CurrencyInput label="Principal" value={scenario.principal} onChange={(v) => onChange({ principal: v ?? 0 })} max={50_00_000} step={5000} />
        <PercentageInput label="Interest Rate" value={scenario.rate} onChange={(v) => onChange({ rate: v ?? 0 })} max={15} step={0.1} />
        <YearsInput label="Tenure" value={scenario.years} onChange={(v) => onChange({ years: v ?? 1 })} max={30} />
        <SelectInput label="Compounding" value={scenario.compounding} onChange={(v) => onChange({ compounding: v as CompoundingFrequency })} options={COMPOUNDING_OPTIONS} />
        <PercentageInput label="Inflation" value={scenario.inflation} onChange={(v) => onChange({ inflation: v ?? 0 })} max={15} step={0.5} optional />
      </>
    )
  }
  return (
    <>
      <CurrencyInput label="Monthly Deposit" value={scenario.monthly} onChange={(v) => onChange({ monthly: v ?? 0 })} max={2_00_000} step={500} />
      <PercentageInput label="Interest Rate" value={scenario.rate} onChange={(v) => onChange({ rate: v ?? 0 })} max={15} step={0.1} />
      <YearsInput label="Tenure" value={scenario.years} onChange={(v) => onChange({ years: v ?? 1 })} max={30} />
      <SelectInput label="Compounding" value={scenario.compounding} onChange={(v) => onChange({ compounding: v as CompoundingFrequency })} options={COMPOUNDING_OPTIONS} />
      <PercentageInput label="Inflation" value={scenario.inflation} onChange={(v) => onChange({ inflation: v ?? 0 })} max={15} step={0.5} optional />
    </>
  )
}
