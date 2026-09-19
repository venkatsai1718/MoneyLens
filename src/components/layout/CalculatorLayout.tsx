import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Aurora } from '../ui/Aurora'

export interface CalculatorLayoutProps {
  seoTitle: string
  seoDescription: string
  eyebrow: string
  title: string
  subtitle: string
  children: React.ReactNode
}

/**
 * Shared shell for every calculator page: SEO head tags + a consistent hero.
 * The page-specific content (inputs, results, charts, table, export,
 * formula, FAQ, disclaimer) is composed by each calculator page using the
 * shared UI components, keeping this wrapper lightweight and flexible.
 */
export function CalculatorLayout({ seoTitle, seoDescription, eyebrow, title, subtitle, children }: CalculatorLayoutProps) {
  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
      </Helmet>
      <div className="relative overflow-hidden">
        <Aurora className="opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-14 pb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2.5 animate-fadeIn">{eyebrow}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink max-w-2xl animate-fadeIn" style={{ animationDelay: '40ms' }}>
            {title}
          </h1>
          <p className="text-ink-muted mt-3 text-[15px] leading-relaxed max-w-2xl animate-fadeIn" style={{ animationDelay: '80ms' }}>
            {subtitle}
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-20 space-y-10 sm:space-y-14">{children}</div>
    </>
  )
}
