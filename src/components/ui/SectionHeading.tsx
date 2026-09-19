import React from 'react'
import clsx from 'clsx'

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  as: As = 'h2',
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  as?: 'h1' | 'h2' | 'h3'
}) {
  return (
    <div className={clsx('mb-8 sm:mb-10', align === 'center' && 'text-center')}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">{eyebrow}</p>}
      <As className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">{title}</As>
      {subtitle && <p className={clsx('text-ink-muted mt-2.5 text-[15px] leading-relaxed', align === 'center' && 'max-w-2xl mx-auto')}>{subtitle}</p>}
    </div>
  )
}
