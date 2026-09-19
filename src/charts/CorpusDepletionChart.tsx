import React from 'react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { YearlyDataPoint } from '../types/calculator'
import { formatAxisINR } from '../utils/format'
import { CHART_COLORS } from '../utils/chartColors'
import { ChartTooltip } from './ChartTooltip'

/** Remaining corpus vs. withdrawals, with the exhaustion year marked if applicable. */
export function CorpusDepletionChart({ data, exhaustionYear }: { data: YearlyDataPoint[]; exhaustionYear?: number | null }) {
  const chartData = data.map((d) => ({
    year: d.year,
    'Closing Corpus': Math.round(d.closingBalance),
    Withdrawals: Math.round(d.withdrawals ?? 0),
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
        <defs>
          <linearGradient id="withdrawBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.withdraw} stopOpacity={0.95} />
            <stop offset="100%" stopColor={CHART_COLORS.withdraw} stopOpacity={0.55} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="year"
          tickFormatter={(y) => `Y${y}`}
          tick={{ fontSize: 11, fill: CHART_COLORS.axisText }}
          axisLine={{ stroke: CHART_COLORS.border }}
          tickLine={false}
          label={{ value: 'Year', position: 'insideBottom', offset: -4, fontSize: 11, fill: CHART_COLORS.axisText }}
        />
        <YAxis
          tickFormatter={formatAxisINR}
          tick={{ fontSize: 11, fill: CHART_COLORS.axisText }}
          axisLine={false}
          tickLine={false}
          width={64}
          label={{ value: 'Value (₹)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: CHART_COLORS.axisText }}
        />
        <Tooltip content={<ChartTooltip />} cursor={false} />
        <Legend
          verticalAlign="top"
          align="right"
          height={28}
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-xs text-ink-soft">{value}</span>}
        />
        <Bar
          dataKey="Withdrawals"
          fill="url(#withdrawBarGradient)"
          radius={[3, 3, 0, 0]}
          barSize={18}
          animationDuration={800}
          animationEasing="ease-out"
          style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.3))' }}
        />
        <Line
          type="monotone"
          dataKey="Closing Corpus"
          stroke={CHART_COLORS.value}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: CHART_COLORS.surface }}
          animationDuration={900}
          animationEasing="ease-out"
          animationBegin={150}
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
        />
        {exhaustionYear && (
          <ReferenceLine x={exhaustionYear} stroke={CHART_COLORS.warn} strokeDasharray="4 4" label={{ value: 'Corpus Exhausted', position: 'insideTopRight', fontSize: 10, fill: CHART_COLORS.warn }} />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
