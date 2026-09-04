import { useState } from "react"
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

import { ChartTooltip } from "@/components/charts/chart-tooltip"

export type RadarMetricDatum = {
  key: string
  label: string
  value: number
}

const AXIS_TICK = { fill: "var(--color-muted-foreground)", fontSize: 10.5 }
const RADIUS_TICK = { fill: "var(--color-muted-foreground)", fontSize: 8.5 }

export function RadarMetricChart({
  data,
  size = 220,
  color = "var(--color-primary)",
}: {
  data: RadarMetricDatum[]
  size?: number
  color?: string
}) {
  const [hoverKey, setHoverKey] = useState(0)

  return (
    <ResponsiveContainer width="100%" height={size} onMouseLeave={() => setHoverKey((k) => k + 1)}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis dataKey="label" tick={AXIS_TICK} />
        <PolarRadiusAxis tick={RADIUS_TICK} axisLine={false} allowDecimals={false} />
        <Tooltip key={hoverKey} content={<ChartTooltip />} />
        <Radar
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.32}
          strokeWidth={2}
          dot={{ r: 3.5, fill: color, stroke: "var(--color-card)", strokeWidth: 2 }}
          animationDuration={700}
          animationEasing="ease-out"
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
