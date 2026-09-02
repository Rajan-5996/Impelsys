import { motion } from "framer-motion"
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
        "relative flex min-w-0 flex-col gap-1.5 rounded-xl border p-3 text-left shadow-sm transition-shadow",
        FILL[accent],
        onClick && "hover:shadow-md"
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <span className="truncate text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          {kpi.label}
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
