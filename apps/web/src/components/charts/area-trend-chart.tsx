import { useId, useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { ChartTooltip } from "@/components/charts/chart-tooltip"

export type AreaTrendDatum = {
  key: string
  label: string
  value: number
}

const TICK_STYLE = { fill: "var(--color-muted-foreground)", fontSize: 10.5 }

function LastPointDot(props: { cx?: number; cy?: number; index?: number; color: string; count: number }) {
  const { cx, cy, index, color, count } = props
  if (cx === undefined || cy === undefined || index !== count - 1) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill={color} opacity={0.25}>
        <animate attributeName="r" values="5;10;5" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0;0.35" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r={3.5} fill={color} stroke="var(--color-card)" strokeWidth={2} />
    </g>
  )
}

export function AreaTrendChart({
  data,
  height = 168,
  color = "var(--color-primary)",
  seriesName = "Value",
}: {
  data: AreaTrendDatum[]
  height?: number
  color?: string
  seriesName?: string
}) {
  const gradientId = useId()
  const glowId = useId()
  const [hoverKey, setHoverKey] = useState(0)

  return (
    <ResponsiveContainer width="100%" height={height} onMouseLeave={() => setHoverKey((k) => k + 1)}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.32} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={TICK_STYLE}
          axisLine={false}
          tickLine={false}
        />
        <YAxis allowDecimals={false} tick={TICK_STYLE} axisLine={false} tickLine={false} width={28} />
        <Tooltip key={hoverKey} cursor={{ stroke: "var(--color-border)" }} content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          name={seriesName}
          stroke={color}
          strokeWidth={2.25}
          style={{ filter: `url(#${glowId})` }}
          fill={`url(#${gradientId})`}
          animationDuration={900}
          animationEasing="ease-out"
          dot={(props) => (
            <LastPointDot key={props.index} {...props} color={color} count={data.length} />
          )}
          activeDot={{ r: 5, fill: color, stroke: "var(--color-card)", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
