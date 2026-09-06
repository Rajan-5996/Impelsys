import type { LucideIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { ANOMALY_TYPE_LABEL } from "@/lib/anomaly-labels"
import { formatDetailEntries, formatTimestamp } from "@/lib/format-labels"
import type { Anomaly } from "@/store/anomalies-slice"

export function ActionItemRow({
  variant,
  toneClass,
  badge,
  title,
  description,
  errorDetail,
  actionLabel,
  actionIcon: Icon,
  actionVariant = "default",
  onAction,
}: {
  variant: StatusChipVariant
  toneClass: string
  badge: string
  title: string
  description: string
  errorDetail?: string | null
  actionLabel: string
  actionIcon: LucideIcon
  actionVariant?: "default" | "outline" | "destructive"
  onAction: () => void
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3", toneClass)}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip variant={variant}>{badge}</StatusChip>
          <span className="text-[12.5px] font-semibold text-foreground">{title}</span>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
        {errorDetail ? (
          <p className="mt-1 truncate rounded bg-black/[0.04] px-1.5 py-1 font-mono text-[10.5px] text-status-critical-ink dark:bg-white/[0.06]">
            {errorDetail}
          </p>
        ) : null}
      </div>
      <Button size="xs" variant={actionVariant} onClick={onAction}>
        <Icon /> {actionLabel}
      </Button>
    </div>
  )
}

export function PendingAnomalyRow({
  anomaly,
  onApprove,
  onReject,
}: {
  anomaly: Anomaly
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-status-warning/25 bg-status-warning/10 p-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip variant="medium">Pending</StatusChip>
          <span className="text-[12.5px] font-semibold text-foreground">
            {ANOMALY_TYPE_LABEL[anomaly.anomaly_type] ?? anomaly.anomaly_type}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDetailEntries(anomaly.details)}</p>
        <p className="mt-0.5 text-[10.5px] text-muted-foreground">
          Detected {formatTimestamp(anomaly.created_at)} &middot; Precedent: {anomaly.has_precedent ? "Yes" : "No"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button size="xs" onClick={onApprove}>
          Approve
        </Button>
        <Button size="xs" variant="destructive" onClick={onReject}>
          Reject
        </Button>
      </div>
    </div>
  )
}
