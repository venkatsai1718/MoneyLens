import React from 'react'
import { formatINR } from '../utils/format'

interface TooltipPayloadEntry {
  dataKey?: string
  name?: string
  value?: number
  color?: string
  fill?: string
  payload?: { fill?: string }
}

export interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string | number
  /** Prefixes the title row, e.g. "Year" -> "Year 5". */
  labelPrefix?: string
  /** Explicitly suppress the title row (e.g. for a donut, which has no x-axis category to label). */
  hideTitle?: boolean
}

/**
 * Shared, polished tooltip for every chart in the app (donut, area, line,
 * composed) — one glass-panel look instead of each chart hand-rolling its
 * own. A single source also means a color/typography tweak here reaches
 * every chart at once.
 */
export function ChartTooltip({ active, payload, label, labelPrefix = 'Year', hideTitle = false }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="min-w-[150px] rounded-xl border border-border bg-white/95 backdrop-blur-sm px-4 py-3 shadow-elevated text-xs">
      {!hideTitle && label !== undefined && (
        <p className="font-semibold text-ink mb-2 pb-2 border-b border-border-soft">{labelPrefix ? `${labelPrefix} ${label}` : label}</p>
      )}
      <div className="space-y-1.5">
        {payload.map((p, i) => (
          <p key={p.dataKey ?? p.name ?? i} className="flex items-center justify-between gap-4 text-ink-soft">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color ?? p.payload?.fill ?? p.fill }} />
              {p.name}
            </span>
            <span className="font-semibold text-ink tabular-nums">{formatINR(p.value ?? 0)}</span>
          </p>
        ))}
      </div>
    </div>
  )
}
