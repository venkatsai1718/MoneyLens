import React from 'react'
import { formatINR } from '../../utils/format'
import type { YearlyDataPoint } from '../../types/calculator'

export interface DataTableColumn {
  key: keyof YearlyDataPoint
  label: string
  isCurrency?: boolean
}

export function DataTable({ columns, rows }: { columns: DataTableColumn[]; rows: YearlyDataPoint[] }) {
  return (
    <div className="overflow-x-auto scrollbar-thin rounded-xl border border-border animate-fadeIn">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="bg-platinum/60 text-left">
            {columns.map((col) => (
              <th key={String(col.key)} scope="col" className="px-4 py-3 font-semibold text-ink-soft whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            // A row is only worth flagging once the corpus has actually run
            // out — the exhaustion year itself gets a clear badge, and every
            // year after it (which would otherwise silently repeat as a
            // string of identical ₹0 rows) is visually dimmed so it reads as
            // "already exhausted", not as new, distinct activity.
            const wasExhaustedBefore = i > 0 && rows[i - 1].isExhausted
            const isExhaustionYear = row.isExhausted && !wasExhaustedBefore
            return (
              <tr
                key={row.year}
                className={[i % 2 === 1 ? 'bg-snow/60' : 'bg-white', wasExhaustedBefore ? 'opacity-50' : ''].join(' ')}
              >
                {columns.map((col) => {
                  const val = row[col.key]
                  const isYearCol = col.key === 'year'
                  return (
                    <td key={String(col.key)} className="px-4 py-3 text-ink whitespace-nowrap tabular-nums">
                      <span className="inline-flex items-center gap-1.5">
                        {typeof val === 'number' ? (col.isCurrency !== false ? formatINR(val) : val) : String(val ?? '—')}
                        {isYearCol && isExhaustionYear && (
                          <span className="rounded-full bg-accent-warn/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent-warn whitespace-nowrap">
                            Exhausted
                          </span>
                        )}
                      </span>
                    </td>
                  )
                })}
              </tr>
            )
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-ink-muted">
                No data to display yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
