import { useMemo } from "react"
import { motion } from "framer-motion"
import { CheckCircle2Icon, ClockIcon, XCircleIcon, type LucideIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { PieMetricChart, type PieMetricDatum } from "@/components/charts/pie-metric-chart"
import { EmptyState } from "@/components/empty-state"
import { ANOMALY_TYPE_LABEL } from "@/lib/anomaly-labels"
import { CATEGORICAL_CHART_COLORS } from "@/lib/status-bar-colors"
import type { Anomaly } from "@/store/anomalies-slice"
import { useAppDispatch } from "@/store/hooks"
import { openDrawer } from "@/store/ui-slice"

const STATUS_TILES = [
  {
    key: "pending",
    label: "Pending Review",
    icon: ClockIcon,
    classes: "border-status-warning/30 bg-status-warning/10",
    iconBox: "border-status-warning/30 bg-status-warning/15 text-status-warning-foreground",
    barClass: "bg-status-warning",
    ghostClass: "text-status-warning",
  },
  {
    key: "approved",
    label: "Approved",
    icon: CheckCircle2Icon,
    classes: "border-status-good/30 bg-status-good/10",
    iconBox: "border-status-good/30 bg-status-good/15 text-status-good-ink",
    barClass: "bg-status-good",
    ghostClass: "text-status-good",
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: XCircleIcon,
    classes: "border-status-critical/30 bg-status-critical/10",
    iconBox: "border-status-critical/30 bg-status-critical/15 text-status-critical-ink",
    barClass: "bg-status-critical",
    ghostClass: "text-status-critical",
  },
] as const

function StatusTile({
  label,
  value,
  total,
  icon: Icon,
  classes,
  iconBox,
  barClass,
  ghostClass,
  index,
  onClick,
}: {
  label: string
  value: number
  total: number
  icon: LucideIcon
  classes: string
  iconBox: string
  barClass: string
  ghostClass: string
  index: number
  onClick: () => void
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className={cn(
        "relative flex flex-1 cursor-pointer flex-col gap-2 overflow-hidden rounded-xl border p-3 text-left shadow-sm transition-shadow duration-300 hover:shadow-lg",
        classes
      )}
    >
      <Icon aria-hidden className={cn("pointer-events-none absolute -right-3 -bottom-4 size-20 opacity-[0.08]", ghostClass)} />
      <div className="relative z-10 flex items-center justify-between gap-2">
        <span className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg border", iconBox)}>
          <Icon aria-hidden className="size-3.5" />
        </span>
      </div>
      <p className="relative z-10 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <div className="relative z-10 mt-auto flex flex-col gap-1.5">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted/40">
          <motion.div
            className={cn("h-full rounded-full", barClass)}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, delay: 0.15 + index * 0.06, ease: "easeOut" }}
          />
        </div>
        <p className="text-[10px] font-medium text-muted-foreground">
          {pct}% of {total} anomalies
        </p>
      </div>
    </motion.button>
  )
}

export function AnomalyBreakdown({
  anomalies,
  vendorBreakdown,
}: {
  anomalies: Anomaly[]
  vendorBreakdown?: PieMetricDatum[]
}) {
  const dispatch = useAppDispatch()
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { pending: 0, approved: 0, rejected: 0 }
    for (const anomaly of anomalies) {
      counts[anomaly.status] = (counts[anomaly.status] ?? 0) + 1
    }
    return counts
  }, [anomalies])

  const typeBreakdown = useMemo(() => {
    const counts = new Map<string, number>()
    for (const anomaly of anomalies) {
      counts.set(anomaly.anomaly_type, (counts.get(anomaly.anomaly_type) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([type, count], index) => ({
        key: type,
        label: ANOMALY_TYPE_LABEL[type] ?? type,
        value: count,
        color: CATEGORICAL_CHART_COLORS[index % CATEGORICAL_CHART_COLORS.length]!,
      }))
      .sort((a, b) => b.value - a.value)
  }, [anomalies])

  if (anomalies.length === 0) {
    return <EmptyState message="No anomalies detected yet." />
  }

  const statusTotal = anomalies.length

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="grid grid-cols-3 gap-2.5 lg:flex-1">
        {STATUS_TILES.map((tile, index) => (
          <StatusTile
            key={tile.key}
            label={tile.label}
            value={statusCounts[tile.key] ?? 0}
            total={statusTotal}
            icon={tile.icon}
            classes={tile.classes}
            iconBox={tile.iconBox}
            barClass={tile.barClass}
            ghostClass={tile.ghostClass}
            index={index}
            onClick={() => dispatch(openDrawer({ type: "anomaly-status-list", status: tile.key }))}
          />
        ))}
      </div>
      <div className="flex flex-col gap-3 lg:w-[280px] lg:shrink-0">
        <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-muted/20 p-2.5">
          <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
            By Type
          </p>
          <PieMetricChart data={typeBreakdown} size={88} />
        </div>
        {vendorBreakdown && vendorBreakdown.length > 0 ? (
          <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-muted/20 p-2.5">
            <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
              By Vendor
            </p>
            <PieMetricChart data={vendorBreakdown} size={88} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
