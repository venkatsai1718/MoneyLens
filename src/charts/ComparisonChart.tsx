import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ComparisonScenario } from '../types/calculator'
import { buildComparisonSeries } from '../calculations/compare'
import { formatAxisINR } from '../utils/format'
import { CHART_COLORS } from '../utils/chartColors'
import { ChartTooltip } from './ChartTooltip'

export function ComparisonChart({ scenarios }: { scenarios: ComparisonScenario[] }) {
  const data = buildComparisonSeries(scenarios)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
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
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: CHART_COLORS.textPrimary }} />
        {scenarios.map((s, i) => (
          <Line
            key={s.id}
            type="monotone"
            dataKey={s.name}
            stroke={s.color}
            strokeWidth={2.25}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: CHART_COLORS.surface }}
            animationDuration={800}
            animationEasing="ease-out"
            animationBegin={i * 100}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))' }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
