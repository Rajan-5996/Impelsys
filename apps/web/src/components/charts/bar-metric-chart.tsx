import { useId, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { ChartTooltip } from "@/components/charts/chart-tooltip"

export type BarMetricDatum = {
  key: string
  label: string
  value: number
  color: string
}

const TICK_STYLE = { fill: "var(--color-muted-foreground)", fontSize: 10.5 }

export function BarMetricChart({
  data,
  height = 168,
  valueFormatter,
}: {
  data: BarMetricDatum[]
  height?: number
  valueFormatter?: (value: number | string) => string
}) {
  const gradientId = useId()
  const [hoverKey, setHoverKey] = useState(0)

  return (
    <ResponsiveContainer width="100%" height={height} onMouseLeave={() => setHoverKey((k) => k + 1)}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {data.map((row) => (
            <linearGradient key={row.key} id={`${gradientId}-${row.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={row.color} stopOpacity={1} />
              <stop offset="100%" stopColor={row.color} stopOpacity={0.55} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" tick={TICK_STYLE} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={TICK_STYLE} axisLine={false} tickLine={false} width={28} />
        <Tooltip
          key={hoverKey}
          cursor={{ fill: "var(--color-muted)" }}
          content={<ChartTooltip valueFormatter={valueFormatter} />}
        />
        <Bar
          dataKey="value"
          radius={[6, 6, 2, 2]}
          maxBarSize={40}
          animationDuration={700}
          animationEasing="ease-out"
        >
          <LabelList
            dataKey="value"
            position="insideTop"
            formatter={(value) =>
              valueFormatter ? valueFormatter(value as number) : `${value}`
            }
            fill="white"
            fontSize={10.5}
            fontWeight={600}
          />
          {data.map((row) => (
            <Cell key={row.key} fill={`url(#${gradientId}-${row.key})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
