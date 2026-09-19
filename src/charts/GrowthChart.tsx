import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { YearlyDataPoint } from '../types/calculator'
import { formatAxisINR } from '../utils/format'
import { CHART_COLORS } from '../utils/chartColors'
import { ChartTooltip } from './ChartTooltip'

/** Portfolio growth: total invested vs. portfolio value, year over year. */
export function GrowthChart({ data }: { data: YearlyDataPoint[] }) {
  const chartData = data.map((d) => ({
    year: d.year,
    Invested: Math.round(d.totalInvestedTillDate),
    'Portfolio Value': Math.round(d.closingBalance),
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
        <defs>
          <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.value} stopOpacity={0.35} />
            <stop offset="100%" stopColor={CHART_COLORS.value} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.invested} stopOpacity={0.22} />
            <stop offset="100%" stopColor={CHART_COLORS.invested} stopOpacity={0} />
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
        <Area type="monotone" dataKey="Invested" stroke={CHART_COLORS.invested} strokeWidth={2} fill="url(#investedGradient)" animationDuration={900} animationEasing="ease-out" />
        <Area
          type="monotone"
          dataKey="Portfolio Value"
          stroke={CHART_COLORS.value}
          strokeWidth={2.5}
          fill="url(#valueGradient)"
          animationDuration={900}
          animationEasing="ease-out"
          animationBegin={120}
          activeDot={{ r: 5, strokeWidth: 2, stroke: CHART_COLORS.surface }}
          style={{ filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.35))' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
