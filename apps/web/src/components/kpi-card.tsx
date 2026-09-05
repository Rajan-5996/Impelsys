import { motion } from "framer-motion"
import type { ReactNode } from "react"
import {
  ActivitySquareIcon,
  AlertOctagonIcon,
  AlertTriangleIcon,
  AwardIcon,
  DatabaseIcon,
  ListChecksIcon,
  RadioTowerIcon,
  RssIcon,
  ShieldCheckIcon,
  TimerIcon,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import type { KpiDef } from "@/store/command-center-slice"

const DELTA_COLOR: Record<"up" | "down" | "flat", string> = {
  up: "text-status-good-ink",
  down: "text-status-critical-ink",
  flat: "text-muted-foreground",
}

export type AccentKey = "up" | "down" | "flat" | "info"

const FILL: Record<AccentKey, string> = {
  up: "border-status-good/30 bg-status-good/10",
  down: "border-status-critical/30 bg-status-critical/10",
  flat: "border-accent/35 bg-accent/12",
  info: "border-primary/30 bg-primary/10",
}

const ICON_COLOR: Record<AccentKey, string> = {
  up: "text-status-good-ink",
  down: "text-status-critical-ink",
  flat: "text-standard",
  info: "text-primary",
}

const ICON_BOX: Record<AccentKey, string> = {
  up: "border-status-good/30 bg-status-good/15",
  down: "border-status-critical/30 bg-status-critical/15",
  flat: "border-accent/40 bg-accent/20",
  info: "border-primary/30 bg-primary/15",
}

const GLOW: Record<AccentKey, string> = {
  up: "hover:shadow-status-good/20",
  down: "hover:shadow-status-critical/20",
  flat: "hover:shadow-accent/20",
  info: "hover:shadow-primary/20",
}

const SPARK_COLOR: Record<AccentKey, string> = {
  up: "var(--color-status-good)",
  down: "var(--color-status-critical)",
  flat: "var(--color-standard)",
  info: "var(--color-primary)",
}

function seededSparkline(seed: string, dir: "up" | "down" | "flat") {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const rand = () => {
    h = (h * 1103515245 + 12345) >>> 0
    return (h % 1000) / 1000
  }
  const phase = rand() * Math.PI * 2
  const waveFreq = 0.8 + rand() * 0.5
  const slope = dir === "up" ? 0.05 : dir === "down" ? -0.05 : 0
  const points: number[] = []
  for (let i = 0; i < 9; i++) {
    const wave = Math.sin(phase + i * waveFreq) * 0.24
    const noise = (rand() - 0.5) * 0.1
    let value = 0.5 + slope * (i - 4) + wave + noise
    value = Math.max(0.08, Math.min(0.92, value))
    points.push(value)
  }
  return points
}

function Sparkline({ seed, dir, color }: { seed: string; dir: "up" | "down" | "flat"; color: string }) {
  const points = seededSparkline(seed, dir)
  const width = 100
  const height = 26
  const stepX = width / (points.length - 1)
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(i * stepX).toFixed(1)} ${(height - p * height).toFixed(1)}`)
    .join(" ")
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-6 w-full">
      <path d={areaPath} fill={color} opacity={0.14} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const LABEL_ICON: Record<string, LucideIcon> = {
  "Data Feeds Today": RadioTowerIcon,
  "Healthy Feeds": ShieldCheckIcon,
  "Active Anomalies": AlertTriangleIcon,
  "Enterprise Data Quality": ActivitySquareIcon,
  "Suppliers Within SLA": TimerIcon,
  Score: AwardIcon,
  "Active Feeds": RssIcon,
  SLA: TimerIcon,
  "Enterprise Data Quality Score": ShieldCheckIcon,
  "Datasets Monitored": DatabaseIcon,
  "Rules Evaluated Today": ListChecksIcon,
  "Critical Rule Failures": AlertOctagonIcon,
  "Quality Issues Open": AlertTriangleIcon,
  "Overall Score": AwardIcon,
  Records: DatabaseIcon,
  "Rules Passed": ListChecksIcon,
  Failed: AlertOctagonIcon,
}

function accentFor(kpi: KpiDef): AccentKey {
  if (kpi.accent) return kpi.accent
  if (!kpi.delta) return "info"
  return kpi.delta.dir
}

type KpiCardProps = {
  kpi: KpiDef
  index?: number
  onClick?: () => void
  displayLabel?: string
  visual?: (color: string) => ReactNode
}

export function KpiCard({ kpi, index = 0, onClick, displayLabel, visual }: KpiCardProps) {
  const accent = accentFor(kpi)
  const Icon = LABEL_ICON[kpi.label] ?? ActivitySquareIcon

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className={cn(
        "relative flex min-w-0 flex-col gap-1.5 rounded-xl border p-3 text-left shadow-sm transition-shadow duration-300 hover:shadow-lg",
        FILL[accent],
        GLOW[accent],
        onClick && "cursor-pointer"
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <span className="truncate text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          {displayLabel ?? kpi.label}
        </span>
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg border",
            ICON_BOX[accent]
          )}
        >
          <Icon aria-hidden className={cn("size-3.5", ICON_COLOR[accent])} />
        </span>
      </div>
      <span className="truncate text-xl font-semibold tracking-tight text-foreground">
        {kpi.value}
        {kpi.suffix ? (
          <small className="ml-0.5 text-xs font-semibold text-muted-foreground">
            {kpi.suffix}
          </small>
        ) : null}
      </span>
      <span className="truncate text-[11px] text-muted-foreground">{kpi.sub}</span>
      {visual ? (
        visual(SPARK_COLOR[accent])
      ) : (
        <Sparkline seed={kpi.label} dir={kpi.delta?.dir ?? "flat"} color={SPARK_COLOR[accent]} />
      )}
      {kpi.delta ? (
        <span
          className={cn(
            "truncate text-[10.5px] font-semibold",
            DELTA_COLOR[kpi.delta.dir]
          )}
        >
          {kpi.delta.text}
        </span>
      ) : null}
    </motion.button>
  )
}
