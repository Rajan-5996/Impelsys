import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { ChartTooltip } from "@/components/charts/chart-tooltip"

export type DonutMetricDatum = {
  key: string
  label: string
  value: number
  color: string
}

export function DonutMetricChart({
  data,
  size = 132,
}: {
  data: DonutMetricDatum[]
  size?: number
}) {
  const total = data.reduce((sum, row) => sum + row.value, 0)

  return (
    <div className="flex items-center gap-4">
      <div style={{ width: size, height: size }} className="shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={data.length > 1 ? 3 : 0}
              stroke="var(--color-card)"
              strokeWidth={2}
            >
              {data.map((row) => (
                <Cell key={row.key} fill={row.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {data.map((row) => (
          <div key={row.key} className="flex items-center gap-1.5 text-[11px]">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: row.color }}
            />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">{row.label}</span>
            <span className="shrink-0 font-semibold text-foreground">
              {total > 0 ? Math.round((row.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
