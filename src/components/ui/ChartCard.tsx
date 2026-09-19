import React from 'react'

export function ChartCard({ title, subtitle, legend, children }: { title: string; subtitle?: string; legend?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="chart-lift rounded-2xl border border-border bg-white p-4 sm:p-6 shadow-card ring-1 ring-inset ring-white/[0.03] animate-fadeIn">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          {subtitle && <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>}
        </div>
        {legend}
      </div>
      <div className="w-full" style={{ height: 320 }}>
        {children}
      </div>
    </div>
  )
}
