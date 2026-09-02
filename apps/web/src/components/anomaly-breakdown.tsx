import { useMemo } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { PieMetricChart } from "@/components/charts/pie-metric-chart"
import { EmptyState } from "@/components/empty-state"
import { ANOMALY_TYPE_LABEL } from "@/lib/anomaly-labels"
import { CATEGORICAL_CHART_COLORS } from "@/lib/status-bar-colors"
import type { Anomaly } from "@/store/anomalies-slice"

const STATUS_TILES = [
  { key: "pending", label: "Pending Review", classes: "border-status-warning/30 bg-status-warning/10 text-status-warning-foreground" },
  { key: "approved", label: "Approved", classes: "border-status-good/30 bg-status-good/10 text-status-good-ink" },
  { key: "rejected", label: "Rejected", classes: "border-status-critical/30 bg-status-critical/10 text-status-critical-ink" },
] as const

function StatusTile({
  label,
  value,
  classes,
}: {
  label: string
  value: number
  classes: string
}) {
  return (
    <div className={cn("border p-3 text-center", classes)}>
      <p className="text-lg font-semibold">{value}</p>
      <p className="mt-0.5 text-[9.5px] font-semibold tracking-wide uppercase opacity-80">
        {label}
      </p>
    </div>
  )
}

export function AnomalyBreakdown({ anomalies }: { anomalies: Anomaly[] }) {
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

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2.5">
        {STATUS_TILES.map((tile) => (
          <StatusTile
            key={tile.key}
            label={tile.label}
            value={statusCounts[tile.key] ?? 0}
            classes={tile.classes}
          />
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
          By Type
        </p>
        <PieMetricChart data={typeBreakdown} size={140} />
      </div>
    </div>
  )
}
