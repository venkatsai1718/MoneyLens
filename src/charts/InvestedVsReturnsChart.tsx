import React from 'react'
import { PieChart, Pie, Cell, Sector, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CHART_COLORS } from '../utils/chartColors'
import { ChartTooltip } from './ChartTooltip'

const COLORS = [CHART_COLORS.invested, CHART_COLORS.growth]

/** The hovered slice brightens in place — no radius growth, so it never looks like a separate piece detached from the ring. */
function renderActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      stroke="none"
      style={{ filter: 'brightness(1.15)', transition: 'filter 0.15s ease-out' }}
    />
  )
}

export function InvestedVsReturnsChart({ invested, returns }: { invested: number; returns: number }) {
  const data = [
    { name: 'Principal Invested', value: Math.max(0, Math.round(invested)) },
    { name: 'Expected Returns', value: Math.max(0, Math.round(returns)) },
  ]

  return (
    <div className="h-full animate-fadeIn">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="92%"
            paddingAngle={0}
            animationDuration={700}
            animationEasing="ease-out"
            activeShape={renderActiveShape}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" style={{ cursor: 'pointer' }} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip hideTitle />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-ink-soft">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
