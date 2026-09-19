import React from 'react'
import clsx from 'clsx'
import { formatINR } from '../../utils/format'
import { useCountUp } from '../../hooks/useCountUp'

export interface SummaryRowProps {
  label: string
  value: number
  tone?: 'default' | 'growth' | 'withdraw'
  emphasize?: boolean
}

/** One label/value line in a plain-text results summary — no box, no border, just a clean row. */
export function SummaryRow({ label, value, tone = 'default', emphasize }: SummaryRowProps) {
  const animated = useCountUp(value)
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={clsx('text-sm', emphasize ? 'text-ink font-semibold' : 'text-ink-muted')}>{label}</span>
      <span
        className={clsx(
          'tabular-nums',
          emphasize ? 'text-lg sm:text-xl font-extrabold' : 'text-sm font-bold',
          tone === 'growth' && 'text-accent-growth',
          tone === 'withdraw' && 'text-accent-withdraw',
          (!tone || tone === 'default') && 'text-ink',
        )}
        title={formatINR(value)}
      >
        {formatINR(animated)}
      </span>
    </div>
  )
}
