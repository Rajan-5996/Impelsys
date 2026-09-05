import { useState } from "react"
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
  centerLabel = "Total",
}: {
  data: DonutMetricDatum[]
  size?: number
  centerLabel?: string
}) {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [hoverKey, setHoverKey] = useState(0)
  const total = data.reduce((sum, row) => sum + row.value, 0)

  function resetHover() {
    setActiveKey(null)
    setHoverKey((k) => k + 1)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold text-foreground">{total}</span>
          <span className="text-[8.5px] font-semibold tracking-wide text-muted-foreground uppercase">
            {centerLabel}
          </span>
        </div>
        <ResponsiveContainer width="100%" height="100%" onMouseLeave={resetHover}>
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
              animationDuration={700}
              animationEasing="ease-out"
              onMouseEnter={(row) => setActiveKey(typeof row.key === "string" ? row.key : null)}
              onMouseLeave={resetHover}
            >
              {data.map((row) => (
                <Cell
                  key={row.key}
                  fill={row.color}
                  style={{
                    transition: "opacity 150ms",
                    filter: "drop-shadow(0 1px 3px color-mix(in oklab, var(--color-standard) 45%, transparent))",
                  }}
                  opacity={activeKey && activeKey !== row.key ? 0.45 : 1}
                />
              ))}
            </Pie>
            <Tooltip key={hoverKey} content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {data.map((row) => (
          <div
            key={row.key}
            className="flex items-center gap-1.5 text-[11px] transition-opacity"
            style={{ opacity: activeKey && activeKey !== row.key ? 0.5 : 1 }}
            onMouseEnter={() => setActiveKey(row.key)}
            onMouseLeave={() => setActiveKey(null)}
          >
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
