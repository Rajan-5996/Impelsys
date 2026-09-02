import { Bar, CartesianGrid, Cell, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { ChartTooltip } from "@/components/charts/chart-tooltip"

export type BarLineDatum = {
  key: string
  label: string
  value: number
  color: string
}

const TICK_STYLE = { fill: "var(--color-muted-foreground)", fontSize: 10.5 }

export function BarLineComboChart({
  data,
  height = 168,
  valueFormatter,
  lineColor = "var(--color-primary)",
}: {
  data: BarLineDatum[]
  height?: number
  valueFormatter?: (value: number | string) => string
  lineColor?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" tick={TICK_STYLE} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={TICK_STYLE} axisLine={false} tickLine={false} width={28} />
        <Tooltip
          cursor={{ fill: "var(--color-muted)" }}
          content={<ChartTooltip valueFormatter={valueFormatter} />}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {data.map((row) => (
            <Cell key={row.key} fill={row.color} />
          ))}
        </Bar>
        <Line
          type="linear"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={2.5}
          dot={{ r: 4, fill: lineColor, stroke: "var(--color-card)", strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
