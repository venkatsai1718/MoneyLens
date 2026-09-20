import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import { CALCULATORS } from '../data/calculators'
import { EDU_TOPICS } from '../data/eduTopics'
import { Card, CardBody } from '../components/ui/Card'
import { SectionHeading } from '../components/ui/SectionHeading'
import { Disclaimer } from '../components/ui/Disclaimer'
import { Aurora } from '../components/ui/Aurora'

export function Resources() {
  return (
    <>
      <Helmet>
        <title>Resources – Learn About SIP, FD, PPF & More | MoneyLens</title>
        <meta
          name="description"
          content="Plain-language explainers on SIP, Step-Up SIP, SWP, FD, Lumpsum, RD, PPF, NPS and other Indian investment options, plus general investing basics."
        />
      </Helmet>

      <div className="relative overflow-hidden">
        <Aurora className="opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-14 pb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2.5">Learn</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink max-w-2xl">Resources</h1>
          <p className="text-ink-muted mt-3 text-[15px] leading-relaxed max-w-2xl">
            Plain-language explainers for every investment type MoneyLens supports — no jargon, no promises.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-20 space-y-14">
        <div>
          <SectionHeading title="Investment Calculators" subtitle="Jump straight into any calculator to see a full year-wise breakdown." as="h2" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CALCULATORS.map((calc) => (
              <Link key={calc.key} to={calc.route} className="group">
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
            ))}
          </div>
        </div>

        <div id="basics" className="scroll-mt-24">
          <SectionHeading title="Investing Basics" subtitle="A few concepts worth understanding before you invest." as="h2" />

          {/* Quick jump — a single centered, wrapping row, not a second column */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {EDU_TOPICS.map((topic) => (
              <a
                key={topic.key}
                href={`#${topic.key}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-ink-soft hover:text-ink hover:border-gunmetal transition-colors"
              >
                <topic.icon className="h-3.5 w-3.5" />
                {topic.title}
              </a>
            ))}
          </div>

          <div className="space-y-6">
            {EDU_TOPICS.map((topic, i) => (
              <article
                key={topic.key}
                id={topic.key}
                className="scroll-mt-24 rounded-2xl border border-border bg-white ring-1 ring-inset ring-white/[0.03] shadow-card p-6 sm:p-10 flex flex-col sm:flex-row gap-6 sm:gap-10"
              >
                <div className="sm:w-52 shrink-0 flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-4">
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-platinum text-carbon">
                    <topic.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-semibold text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-ink mt-0.5">{topic.title}</h3>
                  </div>
                </div>
                <div className="space-y-4 sm:pt-1 sm:border-l sm:border-border-soft sm:pl-10 flex-1 min-w-0">
                  {topic.body.split('\n\n').map((para, pi) => (
                    <p key={pi} className={clsx('leading-relaxed', pi === 0 ? 'text-[16px] text-ink' : 'text-[15px] text-ink-soft')}>
                      {para}
                    </p>
                  ))}
                  <div className="pt-3 mt-1 border-t border-border-soft">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">How it's calculated</p>
                    <p className="text-sm text-ink-muted leading-relaxed">{topic.howCalculated}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <Disclaimer />
      </div>
    </>
  )
}
