import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import { CALCULATORS } from '../data/calculators'
import { Button } from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'
import { SectionHeading } from '../components/ui/SectionHeading'
import { FAQ } from '../components/ui/FAQ'
import { Reveal } from '../components/ui/Reveal'
import { Aurora } from '../components/ui/Aurora'
import { ChalkDoodles } from '../components/ui/ChalkDoodles'
import { SummaryRow } from '../components/ui/SummaryRow'
import { calculateSIP, calculateFD, calculateNPS } from '../calculations'
import { formatINR } from '../utils/format'
import { EDU_TOPICS } from '../data/eduTopics'

const FEATURED_KEYS = ['sip', 'step-up-sip', 'swp', 'fd', 'ppf', 'goal-sip']

const HOME_FAQS = [
  {
    question: 'Is MoneyLens free to use?',
    answer: 'Yes. Every calculator on MoneyLens is completely free, runs entirely in your browser, and does not require sign-up or login.',
  },
  {
    question: 'Are the returns shown by MoneyLens guaranteed?',
    answer: 'No. Every calculator uses the expected return rate you enter as an assumption for illustration. Actual investment returns depend on market performance and are never guaranteed.',
  },
  {
    question: 'Can I compare different investment types?',
    answer: "Yes — use the Compare tool to build multiple scenarios (SIP, Step-Up SIP, FD, Lumpsum, RD and more) side by side, with a shared growth chart and a clear list of each scenario's assumptions.",
  },
  {
    question: 'Does MoneyLens account for inflation?',
    answer: 'Inflation is optional on every relevant calculator. Leave it blank to skip it, or enter a rate to see the inflation-adjusted value alongside the nominal one.',
  },
]

export function Home() {
  const featured = FEATURED_KEYS.map((k) => CALCULATORS.find((c) => c.key === k)!).filter(Boolean)

  return (
    <>
      <Helmet>
        <title>MoneyLens – Investment Calculators for India | SIP, SWP, FD, PPF & More</title>
        <meta
          name="description"
          content="Free, accurate investment calculators for Indian investors. Calculate SIP, Step-Up SIP, SWP, FD, Lumpsum, RD, PPF, NPS and Goal-based investments, and compare strategies side by side."
        />
      </Helmet>

      {/* Hero + Calculator grid share one continuous animated background */}
      <div className="relative overflow-hidden">
        <ChalkDoodles />
        <Aurora className="opacity-70" />

        {/* Hero */}
        <section className="relative min-h-[88vh] flex items-center">
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-16 text-center w-full">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-ink animate-fadeIn">See the Numbers Behind the Investment.</h1>
            <p className="text-ink-muted text-base sm:text-lg mt-5 max-w-lg mx-auto leading-relaxed animate-fadeIn" style={{ animationDelay: '80ms' }}>
              Enter your numbers and see the full picture — growth, returns, and how your money plays out over time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 animate-fadeIn" style={{ animationDelay: '160ms' }}>
              <Link to="/resources" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Explore Tools
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/compare" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Compare Investments
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Calculator grid — featured subset, link out to the rest */}
        <section id="calculators" className="relative scroll-mt-24 min-h-[80vh] flex flex-col justify-center mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <SectionHeading eyebrow="Calculators" title="Start with one of these" subtitle="Year-wise breakdown, real charts, CSV or PDF export — every calculator, same engine." align="center" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((calc, i) => (
              <Reveal key={calc.key} delayMs={(i % 3) * 70}>
                <Link to={calc.route} className="group block h-full">
                  <Card className="h-full transition-all duration-200 hover:border-gunmetal hover:shadow-elevated hover:-translate-y-0.5">
                    <CardBody>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-platinum text-ink-soft group-hover:bg-carbon group-hover:text-on-accent transition-colors">
                        <calc.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-[15px] font-semibold text-ink mt-4">{calc.name}</h3>
                      <p className="text-sm text-ink-muted mt-1.5 leading-relaxed">{calc.description}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink mt-4 group-hover:gap-2 transition-all">
                        Calculate <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </CardBody>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/resources" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink transition-colors">
              View all 11 calculators <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>

      {/* Learn — beyond calculators */}
      <section className="min-h-[70vh] flex items-center mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
          <Reveal>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-carbon mb-3">Beyond Calculators</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-ink leading-tight">Make the decision, not just the calculation.</h2>
              <p className="text-ink-muted text-[15px] leading-relaxed mt-5 max-w-md">
                MoneyLens is built around the questions people actually ask — SIP or FD? How much do I need for my goal? Use real numbers to
                understand the trade-offs before you decide.
              </p>
              <Link to="/resources#basics" className="inline-block mt-7">
                <Button variant="primary" size="lg">
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-4">
            {EDU_TOPICS.slice(0, 4).map((topic, i) => (
              <Reveal key={topic.key} delayMs={i * 80}>
                <TopicCard title={topic.title} summary={topic.summary} anchorKey={topic.key} icon={topic.icon} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Examples — real, computed results, not mockups */}
      <section className="min-h-[80vh] flex items-center border-y border-border-soft bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 w-full">
          <SectionHeading eyebrow="See It In Action" title="Real scenarios. Real calculations." align="center" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {EXAMPLES.map((ex, i) => (
              <Reveal key={ex.title} delayMs={i * 90}>
                <ExampleCard {...ex} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="min-h-[60vh] flex flex-col justify-center mx-auto max-w-2xl px-4 sm:px-6 pb-20">
        <SectionHeading title="Frequently Asked Questions" align="center" />
        <Reveal>
          <FAQ items={HOME_FAQS} />
        </Reveal>
      </section>
    </>
  )
}

function TopicCard({ title, summary, anchorKey, icon: Icon }: { title: string; summary: string; anchorKey: string; icon: LucideIcon }) {
  return (
    <Link to={`/resources#${anchorKey}`} className="group block h-full">
      <Card className="h-full transition-all duration-200 hover:border-gunmetal hover:shadow-elevated hover:-translate-y-0.5">
        <CardBody className="flex flex-col h-full p-4 sm:p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-platinum text-carbon mb-3">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-ink mb-1.5">{title}</h3>
          <p className="text-xs text-ink-muted leading-relaxed flex-1">{summary}</p>
          <ArrowRight className="h-4 w-4 text-carbon mt-3 transition-transform group-hover:translate-x-1" />
        </CardBody>
      </Card>
    </Link>
  )
}

// Computed once, at module load, by the exact same engine every calculator
// page uses — these are not typed-out numbers, so they can't drift out of
// sync with what the calculators actually produce.
const sipExample = calculateSIP({ monthlyInvestment: 5000, annualReturnPercent: 12, years: 15 })
const fdExample = calculateFD({ principal: 2_00_000, annualRatePercent: 7, tenureValue: 5, tenureUnit: 'years', compoundingFrequency: 'quarterly', cumulative: true })
// NPS contributions run until the statutory retirement age of 60, so this
// illustrates a subscriber starting at 35 (25 years to retirement) — the
// same age-based framing the NPS calculator itself uses, not an arbitrary tenure.
const npsExample = calculateNPS({ monthlyContribution: 10000, annualReturnPercent: 10, years: 60 - 35, annuityPercent: 40, annuityRatePercent: 6 })

interface ExampleRow {
  label: string
  value: number
  tone?: 'growth' | 'withdraw' | 'default'
}

const EXAMPLES: { title: string; tag: string; href: string; heroLabel: string; heroValue: number; rows: ExampleRow[] }[] = [
  {
    title: 'SIP',
    tag: '₹5,000/mo · 15 yrs · 12% p.a.',
    href: '/sip-calculator',
    heroLabel: 'Final Value',
    heroValue: sipExample.summary.finalValue,
    rows: [
      { label: 'Invested', value: sipExample.summary.totalInvested },
      { label: 'Expected Returns', value: sipExample.summary.totalReturns, tone: 'growth' },
    ],
  },
  {
    title: 'FD',
    tag: '₹2,00,000 · 7% p.a. · Quarterly · 5 yrs',
    href: '/fd-calculator',
    heroLabel: 'Maturity Amount',
    heroValue: fdExample.summary.finalValue,
    rows: [
      { label: 'Principal', value: fdExample.summary.totalInvested },
      { label: 'Interest Earned', value: fdExample.summary.totalReturns, tone: 'growth' },
    ],
  },
  {
    title: 'NPS',
    tag: '₹10,000/mo · Age 35 → 60 · 10% p.a.',
    href: '/nps-calculator',
    heroLabel: 'Expected Corpus',
    heroValue: npsExample.summary.finalValue,
    rows: [
      { label: 'Total Contribution', value: npsExample.summary.totalInvested },
      { label: 'Expected Returns', value: npsExample.summary.totalReturns, tone: 'growth' },
      { label: 'Est. Monthly Pension', value: npsExample.summary.estimatedMonthlyPension ?? 0 },
    ],
  },
]

function ExampleCard({ title, tag, href, heroLabel, heroValue, rows }: (typeof EXAMPLES)[number]) {
  return (
    <Link to={href} className="group block h-full">
      <Card className="h-full transition-all duration-300 hover:border-gunmetal hover:shadow-elevated hover:-translate-y-1 hover:scale-[1.03]">
        <CardBody className="flex flex-col h-full">
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{title}</span>
            <span className="text-[11px] text-ink-muted text-right">{tag}</span>
          </div>
          <p className="text-xs text-ink-muted mb-1">{heroLabel}</p>
          <p className="text-2xl font-extrabold text-ink tabular-nums mb-4">{formatINR(heroValue)}</p>
          <div className="space-y-2 border-t border-border-soft pt-3">
            {rows.map((r) => (
              <SummaryRow key={r.label} label={r.label} value={r.value} tone={r.tone} />
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink mt-auto pt-4 group-hover:gap-2 transition-all">
            Try it yourself <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </CardBody>
      </Card>
    </Link>
  )
}

