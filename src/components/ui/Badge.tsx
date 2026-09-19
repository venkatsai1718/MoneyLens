import React from 'react'
import clsx from 'clsx'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'growth' | 'warn' | 'withdraw'
}

export function Badge({ tone = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        {
          'bg-platinum text-ink-soft': tone === 'neutral',
          'bg-accent-growth/15 text-accent-growth': tone === 'growth',
          'bg-accent-warn/15 text-accent-warn': tone === 'warn',
          'bg-accent-withdraw/15 text-accent-withdraw': tone === 'withdraw',
        },
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
