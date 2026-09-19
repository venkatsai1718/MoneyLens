import React from 'react'
import clsx from 'clsx'

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('rounded-2xl border border-border bg-white shadow-card ring-1 ring-inset ring-white/[0.03] animate-fadeIn', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('px-5 sm:px-6 py-4 sm:py-5 border-b border-border-soft', className)} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('px-5 sm:px-6 py-5 sm:py-6', className)} {...props}>
      {children}
    </div>
  )
}
