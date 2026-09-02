import { useId } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { ChartTooltip } from "@/components/charts/chart-tooltip"

export type AreaTrendDatum = {
  key: string
  label: string
  value: number
}

const TICK_STYLE = { fill: "var(--color-muted-foreground)", fontSize: 10.5 }

export function AreaTrendChart({
  data,
  height = 168,
  color = "var(--color-primary)",
}: {
  data: AreaTrendDatum[]
  height?: number
  color?: string
}) {
  const gradientId = useId()

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={TICK_STYLE}
          axisLine={false}
          tickLine={false}
        />
        <YAxis allowDecimals={false} tick={TICK_STYLE} axisLine={false} tickLine={false} width={28} />
        <Tooltip cursor={{ stroke: "var(--color-border)" }} content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={{ r: 3, fill: color, stroke: "var(--color-card)", strokeWidth: 2 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
