import { useState } from "react"
import { Sector } from "recharts"

export type PolarAreaDatum = {
  key: string
  label: string
  value: number
  color: string
}

export function PolarAreaChart({
  data,
  size = 176,
}: {
  data: PolarAreaDatum[]
  size?: number
}) {
  const [hovered, setHovered] = useState<PolarAreaDatum | null>(null)
  const cx = size / 2
  const cy = size / 2
  const maxRadius = size / 2 - 8
  const maxValue = Math.max(1, ...data.map((row) => row.value))
  const angleStep = 360 / Math.max(1, data.length)

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {[0.25, 0.5, 0.75, 1].map((step) => (
            <circle
              key={step}
              cx={cx}
              cy={cy}
              r={maxRadius * step}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth={1}
            />
          ))}
          {data.map((row, index) => {
            const startAngle = 90 - index * angleStep
            const endAngle = startAngle - angleStep
            const outerRadius = Math.max((row.value / maxValue) * maxRadius, 4)
            return (
              <Sector
                key={row.key}
                cx={cx}
                cy={cy}
                innerRadius={0}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={row.color}
                fillOpacity={hovered && hovered.key !== row.key ? 0.45 : 0.9}
                stroke="var(--color-card)"
                strokeWidth={2}
                style={{ cursor: "pointer", transition: "fill-opacity 150ms" }}
                onMouseEnter={() => setHovered(row)}
                onMouseLeave={() => setHovered(null)}
              />
            )
          })}
        </svg>
        {hovered ? (
          <div className="pointer-events-none absolute top-1 left-1 rounded-md border border-border bg-popover px-2 py-1 text-[10.5px] shadow-md">
            <span className="font-semibold text-foreground">{hovered.value}</span>{" "}
            <span className="text-muted-foreground">{hovered.label}</span>
          </div>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {data.map((row) => (
          <div key={row.key} className="flex items-center gap-1.5 text-[11px]">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: row.color }}
            />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">{row.label}</span>
            <span className="shrink-0 font-semibold text-foreground">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
