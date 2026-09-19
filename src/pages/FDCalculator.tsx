import React, { useMemo } from 'react'
import { CalculatorLayout } from '../components/layout/CalculatorLayout'
import {
  CurrencyInput,
  PercentageInput,
  NumberInput,
  SummaryRow,
  ChartCard,
  DataTable,
  ExportMenu,
  Disclaimer,
  FAQ,
  SectionHeading,
  Card,
  SelectInput,
  Toggle,
} from '../components/ui'
import { GrowthChart } from '../charts/GrowthChart'
import { InvestedVsReturnsChart } from '../charts/InvestedVsReturnsChart'
import { calculateFD, type CompoundingFrequency, type TenureUnit } from '../calculations'
import { validateAmount, validateRate, isFormValid } from '../utils/validation'
import { buildCSV, downloadCSV } from '../utils/csvExport'
import { downloadPDF } from '../utils/pdfExport'
import { formatINR } from '../utils/format'
import { DISCLAIMER_TEXT } from '../components/ui/Disclaimer'
import type { DataTableColumn } from '../components/ui/DataTable'

const YEARLY_COLUMNS: DataTableColumn[] = [
  { key: 'year', label: 'Year', isCurrency: false },
  { key: 'openingBalance', label: 'Opening Value' },
  { key: 'returns', label: 'Interest Earned' },
  { key: 'closingBalance', label: 'Closing Value' },
]

const COMPOUNDING_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half-yearly', label: 'Half-Yearly' },
  { value: 'yearly', label: 'Yearly' },
]

const FAQS = [
  { question: 'What is the difference between cumulative and non-cumulative FD?', answer: 'A cumulative FD reinvests the interest each period, so it compounds along with the principal and is paid out in full at maturity. A non-cumulative FD pays out the interest to you at each period instead of reinvesting it.' },
  { question: 'How does compounding frequency affect my returns?', answer: 'More frequent compounding (e.g. monthly vs yearly) lets interest start earning its own interest sooner, which slightly increases the effective annualized return for the same stated rate.' },
  { question: 'What is effective annualized return?', answer: "It is the actual annual growth rate your FD delivers once compounding is accounted for, which can be marginally higher than the bank's stated nominal rate for more frequent compounding." },
  { question: 'Is the FD interest rate guaranteed?', answer: 'The rate a bank offers on a fixed deposit is contractually fixed for that tenure once booked. This calculator simply projects the maturity value based on the rate you enter — always confirm the exact rate with your bank before investing.' },
  { question: 'Does this calculator include tax (TDS)?', answer: 'No. FD interest is taxable as per your income slab, and banks may deduct TDS. This calculator shows pre-tax figures only.' },
  { question: 'What happens if I enter tenure in months instead of years?', answer: 'Switch the tenure unit toggle to "Months" and enter the tenure directly in months — the calculator converts internally and produces the same accurate monthly-resolution projection.' },
]

export function FDCalculator() {
  const [principal, setPrincipal] = React.useState<number | null>(100000)
  const [rate, setRate] = React.useState<number | null>(7)
  const [tenureValue, setTenureValue] = React.useState<number | null>(5)
  const [tenureUnit, setTenureUnit] = React.useState<TenureUnit>('years')
  const [compounding, setCompounding] = React.useState<CompoundingFrequency>('quarterly')
  const [cumulative, setCumulative] = React.useState(true)
  const [seniorRate, setSeniorRate] = React.useState<number | null>(null)
  const [inflationRate, setInflationRate] = React.useState<number | null>(null)

  const validations = {
    principal: validateAmount(principal, { required: true, label: 'Principal' }),
    rate: validateRate(rate, { required: true, label: 'Interest rate', max: 15 }),
    tenure: validateAmount(tenureValue, { required: true, label: 'Tenure' }),
    seniorRate: validateRate(seniorRate, { label: 'Senior citizen rate', max: 2 }),
    inflation: validateRate(inflationRate, { label: 'Inflation', max: 20 }),
  }
  const valid = isFormValid(Object.values(validations))

  const result = useMemo(() => {
    if (!valid || !principal || rate === null || !tenureValue) return null
    return calculateFD({
      principal,
      annualRatePercent: rate,
      tenureValue,
      tenureUnit,
      compoundingFrequency: compounding,
      cumulative,
      seniorCitizenExtraRate: seniorRate ?? 0,
      inflationRate,
    })
  }, [valid, principal, rate, tenureValue, tenureUnit, compounding, cumulative, seniorRate, inflationRate])

  function handleCSV() {
    if (!result) return
    downloadCSV('moneylens-fd-calculation', buildCSV(result, YEARLY_COLUMNS))
  }
  function handlePDF() {
    if (!result) return
    downloadPDF(result, YEARLY_COLUMNS, 'moneylens-fd-calculation', { disclaimer: DISCLAIMER_TEXT })
  }

  return (
    <CalculatorLayout
      seoTitle="FD Calculator – Fixed Deposit Maturity Calculator | MoneyLens"
      seoDescription="Calculate your fixed deposit maturity value at any compounding frequency — monthly, quarterly, half-yearly or yearly — with a year-wise breakdown."
      eyebrow="Fixed Income Calculator"
      title="FD Calculator"
      subtitle="Calculate the maturity value of your fixed deposit at any compounding frequency, for cumulative or non-cumulative FDs."
    >
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-5 sm:p-7 space-y-5 lg:border-r border-border-soft">
            <CurrencyInput label="Principal" value={principal} onChange={setPrincipal} max={50_00_000} step={5000} error={validations.principal.error} />
            <PercentageInput label="Interest Rate" value={rate} onChange={setRate} max={12} step={0.1} error={validations.rate.error} />
            <div className="grid grid-cols-2 gap-3">
              <NumberInput label="Tenure" value={tenureValue} onChange={setTenureValue} min={1} max={tenureUnit === 'years' ? 30 : 360} error={validations.tenure.error} />
              <Toggle
                label="Tenure Unit"
                value={tenureUnit}
                onChange={(v) => setTenureUnit(v as TenureUnit)}
                options={[
                  { value: 'years', label: 'Years' },
                  { value: 'months', label: 'Months' },
                ]}
              />
            </div>
            <SelectInput label="Compounding Frequency" value={compounding} onChange={(v) => setCompounding(v as CompoundingFrequency)} options={COMPOUNDING_OPTIONS} />
            <Toggle
              label="FD Type"
              value={cumulative ? 'cumulative' : 'non-cumulative'}
              onChange={(v) => setCumulative(v === 'cumulative')}
              options={[
                { value: 'cumulative', label: 'Cumulative' },
                { value: 'non-cumulative', label: 'Non-Cumulative' },
              ]}
            />
            <PercentageInput
              label="Senior Citizen Extra Rate"
              value={seniorRate}
              onChange={setSeniorRate}
              max={2}
              step={0.1}
              error={validations.seniorRate.error}
              optional
              hint="Adds to the base interest rate, if applicable."
            />
            <PercentageInput label="Inflation" value={inflationRate} onChange={setInflationRate} max={15} step={0.5} error={validations.inflation.error} optional />
          </div>

          <div className="p-5 sm:p-7 flex flex-col">
            {!result ? (
              <div className="flex-1 flex items-center justify-center text-center py-10">
                <div>
                  <p className="text-sm font-semibold text-ink">Enter your FD details</p>
                  <p className="text-xs text-ink-muted mt-1.5 max-w-[220px]">We'll calculate your maturity value and year-wise growth.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="chart-lift rounded-xl h-48 sm:h-56">
                  <InvestedVsReturnsChart invested={result.summary.totalInvested} returns={result.summary.totalReturns} />
                </div>
                <div className="mt-5 space-y-3">
                  <SummaryRow label="Principal" value={result.summary.totalInvested} />
                  <SummaryRow label="Total Interest" value={result.summary.totalReturns} tone="growth" />
                  <div className="border-t border-border-soft pt-3">
                    <SummaryRow label="Maturity Amount" value={result.summary.finalValue} emphasize />
                  </div>
                  {!cumulative && (
                    <p className="text-xs text-ink-muted pt-1">Non-cumulative: interest shown here is paid out periodically, not compounded into the principal.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {result && (
        <>
          <ChartCard title="Value Growth" subtitle="Principal held vs. accumulated value, year over year">
            <GrowthChart data={result.yearlyData} />
          </ChartCard>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <SectionHeading title="Year-Wise Breakdown" subtitle="Opening value, interest earned and closing value for each year." align="left" as="h3" />
              <ExportMenu onCSV={handleCSV} onPDF={handlePDF} />
            </div>
            <DataTable columns={YEARLY_COLUMNS} rows={result.yearlyData} />
          </div>
        </>
      )}

      <Card className="p-5 sm:p-7">
        <SectionHeading title="How FD Maturity Is Calculated" as="h3" />
        <p className="text-sm text-ink-soft leading-relaxed mb-4">
          For a cumulative FD, the bank adds interest back into your balance at every compounding date, so the next round of interest is calculated
          on a slightly bigger amount — this is the standard compound-interest formula every bank uses:
        </p>
        <div className="rounded-xl bg-platinum/50 border border-border-soft px-5 py-4 font-mono text-sm text-ink overflow-x-auto">A = P × (1 + r/n)^(n×t)</div>
        <dl className="mt-4 space-y-2.5">
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">A</dt>
            <dd className="text-sm text-ink-soft">Maturity amount — what you get back when the FD matures</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">P</dt>
            <dd className="text-sm text-ink-soft">Principal — the amount you deposit up front</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">r</dt>
            <dd className="text-sm text-ink-soft">Annual interest rate the bank offers (as a decimal, e.g. 7% = 0.07)</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">n</dt>
            <dd className="text-sm text-ink-soft">Compounding frequency — how many times a year interest is added (12 for monthly, 4 for quarterly, and so on)</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 w-12 text-center rounded-md bg-platinum px-1.5 py-1 text-xs font-mono font-bold text-ink">t</dt>
            <dd className="text-sm text-ink-soft">Tenure — how long the deposit runs, in years</dd>
          </div>
        </dl>
        <p className="text-sm text-ink-soft leading-relaxed mt-4">
          A non-cumulative FD uses the same rate, but pays the interest out to you at each period instead of folding it back into the principal —
          so the deposited amount itself never compounds. This calculator shows pre-tax figures only; it does not account for TDS or income tax.
        </p>
        {result && principal && rate !== null && tenureValue && (
          <p className="text-sm text-ink-soft leading-relaxed mt-4">
            For example: depositing <strong className="text-ink">{formatINR(principal)}</strong> at{' '}
            <strong className="text-ink">{(rate + (seniorRate ?? 0)).toFixed(2)}%</strong> p.a., compounded{' '}
            <strong className="text-ink">{compounding}</strong>, for <strong className="text-ink">{tenureValue} {tenureUnit}</strong> works out to a
            maturity amount of <strong className="text-ink">{formatINR(result.summary.finalValue)}</strong>.
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
