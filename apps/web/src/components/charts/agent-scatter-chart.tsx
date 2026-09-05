import { useState } from "react"
import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts"

import { ChartTooltip } from "@/components/charts/chart-tooltip"

export type ScatterPoint = { x: number; y: number; z: number }
export type ScatterSeries = { key: string; label: string; color: string; points: ScatterPoint[] }

const TICK_STYLE = { fill: "var(--color-muted-foreground)", fontSize: 10.5 }
const LEGEND_STYLE = { fontSize: "10.5px", color: "var(--color-muted-foreground)" }

export function AgentScatterChart({
  series,
  height = 220,
  xLabel,
  xUnit,
  yLabel,
  yUnit,
  yDomain,
  zLabel,
  zRange = [48, 220],
}: {
  series: ScatterSeries[]
  height?: number
  xLabel: string
  xUnit?: string
  yLabel: string
  yUnit?: string
  yDomain?: [number, number]
  zLabel: string
  zRange?: [number, number]
}) {
  const [hoverKey, setHoverKey] = useState(0)

  return (
    <ResponsiveContainer width="100%" height={height} onMouseLeave={() => setHoverKey((k) => k + 1)}>
      <ScatterChart margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
        <CartesianGrid stroke="var(--color-border)" />
        <XAxis
          type="number"
          dataKey="x"
          name={xLabel}
          unit={xUnit}
          tick={TICK_STYLE}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={yLabel}
          unit={yUnit}
          domain={yDomain ?? ["auto", "auto"]}
          tick={TICK_STYLE}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <ZAxis type="number" dataKey="z" range={zRange} name={zLabel} />
        <Tooltip key={hoverKey} cursor={{ strokeDasharray: "3 3" }} content={<ChartTooltip />} />
        <Legend wrapperStyle={LEGEND_STYLE} iconType="circle" iconSize={8} />
        {series.map((s) => (
          <Scatter key={s.key} name={s.label} data={s.points} fill={s.color} fillOpacity={0.75} />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  )
}
