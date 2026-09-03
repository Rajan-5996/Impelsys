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
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" tick={TICK_STYLE} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={TICK_STYLE} axisLine={false} tickLine={false} width={28} />
        <Tooltip
          cursor={{ fill: "var(--color-muted)" }}
          content={<ChartTooltip valueFormatter={valueFormatter} />}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
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
            <Cell key={row.key} fill={row.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
