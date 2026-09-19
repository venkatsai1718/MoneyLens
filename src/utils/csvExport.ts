import type { CalculationResult, YearlyDataPoint } from '../types/calculator'
import { todayFormatted } from './format'

export interface CSVColumn {
  key: keyof YearlyDataPoint
  label: string
}

function csvEscape(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Builds CSV text from a normalized CalculationResult — the exact same
 * object used to render summary cards, charts and the year-wise table —
 * so the export can never drift from what's on screen.
 */
export function buildCSV(result: CalculationResult, columns: CSVColumn[]): string {
  const lines: string[] = []
  lines.push(`Calculator,${csvEscape(result.calculatorName)}`)
  lines.push(`Generated On,${csvEscape(todayFormatted())}`)
  lines.push('')
  lines.push('Assumptions')
  for (const a of result.assumptions) {
    lines.push(`${csvEscape(a.label)},${csvEscape(a.value)}`)
  }
  lines.push('')
  lines.push('Summary')
  lines.push(`Total Invested,${Math.round(result.summary.totalInvested)}`)
  lines.push(`Total Returns,${Math.round(result.summary.totalReturns)}`)
  lines.push(`Final Value,${Math.round(result.summary.finalValue)}`)
  if (result.summary.totalWithdrawn !== undefined) lines.push(`Total Withdrawn,${Math.round(result.summary.totalWithdrawn)}`)
  if (result.inflationApplied && result.summary.inflationAdjustedValue !== undefined) {
    lines.push(`Inflation-Adjusted Value,${Math.round(result.summary.inflationAdjustedValue)}`)
    lines.push(`Inflation Rate,${result.inflationRate}%`)
  }
  lines.push('')
  lines.push('Year-wise Breakdown')
  lines.push(columns.map((c) => csvEscape(c.label)).join(','))
  for (const row of result.yearlyData) {
    lines.push(
      columns
        .map((c) => {
          const val = row[c.key]
          if (typeof val === 'number') return Math.round(val)
          return csvEscape(String(val ?? ''))
        })
        .join(','),
    )
  }
  return lines.join('\n')
}

export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
