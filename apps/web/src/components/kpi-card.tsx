import { motion } from "framer-motion"
import {
  ActivitySquareIcon,
  AlertOctagonIcon,
  AlertTriangleIcon,
  AwardIcon,
  DatabaseIcon,
  FlameIcon,
  ListChecksIcon,
  RadioTowerIcon,
  RssIcon,
  ShieldCheckIcon,
  TimerIcon,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import type { KpiDef } from "@/data/command-center"

const DELTA_COLOR: Record<"up" | "down" | "flat", string> = {
  up: "text-status-good-ink",
  down: "text-status-critical-ink",
  flat: "text-muted-foreground",
}

export type AccentKey = "up" | "down" | "flat" | "info"

const FILL: Record<AccentKey, string> = {
  up: "border-status-good/30 bg-status-good/10",
  down: "border-status-critical/30 bg-status-critical/10",
  flat: "border-status-warning/30 bg-status-warning/10",
  info: "border-status-info/30 bg-status-info/10",
}

const WATERMARK_COLOR: Record<AccentKey, string> = {
  up: "text-status-good",
  down: "text-status-critical",
  flat: "text-status-warning",
  info: "text-status-info",
}

const LABEL_ICON: Record<string, LucideIcon> = {
  "Data Feeds Today": RadioTowerIcon,
  "Healthy Feeds": ShieldCheckIcon,
  "Active Anomalies": AlertTriangleIcon,
  "Open Incidents": FlameIcon,
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
}

export function KpiCard({ kpi, index = 0, onClick }: KpiCardProps) {
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
      whileHover={onClick ? { y: -2 } : undefined}
      className={cn(
        "relative flex min-w-0 flex-col gap-1.5 overflow-hidden rounded-xl border p-3 text-left shadow-sm transition-shadow",
        FILL[accent],
        onClick && "hover:shadow-md"
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-1 -bottom-1 size-20 opacity-[0.24]",
          WATERMARK_COLOR[accent]
        )}
      />
      <div className="relative flex min-w-0 flex-col gap-1.5">
        <span className="truncate text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          {kpi.label}
        </span>
        <span className="truncate text-xl font-semibold tracking-tight text-foreground">
          {kpi.value}
          {kpi.suffix ? (
            <small className="ml-0.5 text-xs font-semibold text-muted-foreground">
              {kpi.suffix}
            </small>
          ) : null}
        </span>
      </div>
      <span className="relative truncate text-[11px] text-muted-foreground">
        {kpi.sub}
      </span>
      {kpi.delta ? (
        <span
          className={cn(
            "relative truncate text-[10.5px] font-semibold",
            DELTA_COLOR[kpi.delta.dir]
          )}
        >
          {kpi.delta.text}
        </span>
      ) : null}
    </motion.button>
  )
}
