import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

function scoreColor(score: number) {
  if (score >= 90) return "var(--color-status-good)"
  if (score >= 75) return "var(--color-status-warning)"
  return "var(--color-status-critical)"
}

type GaugeProps = {
  score: number
  size?: number
  label?: string
}

export function Gauge({ score, size = 96, label }: GaugeProps) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(100, Math.max(0, score)) / 100)

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={scoreColor(score)}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-foreground text-lg font-bold"
        >
          {score}
        </text>
      </svg>
      {label ? (
        <span className="text-center text-[10px] font-medium text-muted-foreground">
          {label}
        </span>
      ) : null}
    </div>
  )
}

type SparklineProps = {
  values: number[]
  width?: number
  height?: number
  className?: string
}

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return ""
  let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
  }
  return d
}

export function Sparkline({
  values,
  width = 90,
  height = 24,
  className,
}: SparklineProps) {
  if (values.length === 0) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const step = width / (values.length - 1 || 1)
  const pad = 2

  const points = values.map((value, index) => ({
    x: index * step,
    y: pad + (1 - (value - min) / range) * (height - pad * 2),
  }))

  const last = points[points.length - 1]

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      <path
        d={smoothPath(points)}
        fill="none"
        stroke="var(--color-status-info)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r={2} fill="var(--color-status-info)" />
    </svg>
  )
}

type MetricBarProps = {
  label: string
  value: number
  max?: number
}

export function MetricBar({ label, value, max = 100 }: MetricBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="w-40 shrink-0 truncate text-[11px] text-muted-foreground">
        {label}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-none bg-muted">
        <div
          className="h-full rounded-none"
          style={{ width: `${pct}%`, backgroundColor: scoreColor(pct) }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-[11.5px] font-semibold text-foreground">
        {value}
      </span>
    </div>
  )
}

type TrendBadgeProps = {
  dir: "up" | "down" | "flat"
  className?: string
}

export function TrendBadge({ dir, className }: TrendBadgeProps) {
  if (dir === "flat") {
    return (
      <span
        className={cn(
          "rounded-none bg-muted px-1.5 py-0.5 text-[10.5px] font-semibold text-muted-foreground",
          className
        )}
      >
        No change
      </span>
    )
  }

  const isUp = dir === "up"
  const Icon = isUp ? TrendingUpIcon : TrendingDownIcon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-none px-1.5 py-0.5 text-[10.5px] font-semibold",
        isUp
          ? "bg-status-good/10 text-status-good-ink"
          : "bg-status-critical/10 text-status-critical-ink",
        className
      )}
    >
      <Icon className="size-3" />
    </span>
  )
}
