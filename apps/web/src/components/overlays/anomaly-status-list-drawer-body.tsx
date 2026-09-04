import { CheckCircle2Icon, ClockIcon, XCircleIcon, type LucideIcon } from "lucide-react"

import { SheetContent, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet"

import { EmptyState } from "@/components/empty-state"
import { ANOMALY_TYPE_LABEL } from "@/lib/anomaly-labels"
import { formatDetailEntries, formatTimestamp } from "@/lib/format-labels"
import { selectAnomalies } from "@/store/anomalies-slice"
import { useAppSelector } from "@/store/hooks"

type AnomalyStatus = "pending" | "approved" | "rejected"

const STATUS_META: Record<
  AnomalyStatus,
  { title: string; icon: LucideIcon; badgeClass: string }
> = {
  pending: {
    title: "Pending Review",
    icon: ClockIcon,
    badgeClass: "border-status-warning/30 bg-status-warning/15 text-status-warning-foreground",
  },
  approved: {
    title: "Approved Anomalies",
    icon: CheckCircle2Icon,
    badgeClass: "border-status-good/30 bg-status-good/15 text-status-good-ink",
  },
  rejected: {
    title: "Rejected Anomalies",
    icon: XCircleIcon,
    badgeClass: "border-status-critical/30 bg-status-critical/15 text-status-critical-ink",
  },
}

export function AnomalyStatusListDrawerBody({ status }: { status: AnomalyStatus }) {
  const anomalies = useAppSelector(selectAnomalies).filter((anomaly) => anomaly.status === status)
  const meta = STATUS_META[status]
  const Icon = meta.icon

  return (
    <SheetContent className="data-[side=right]:sm:max-w-lg">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Icon className="size-4" />
          {meta.title}
        </SheetTitle>
      </SheetHeader>
      <div className="flex flex-col gap-2.5 overflow-y-auto px-8 pb-8">
        {anomalies.length === 0 ? (
          <EmptyState message={`No ${status} anomalies right now.`} />
        ) : (
          anomalies.map((anomaly) => (
            <div
              key={anomaly.anomaly_id}
              className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12.5px] font-semibold text-foreground">
                  {ANOMALY_TYPE_LABEL[anomaly.anomaly_type] ?? anomaly.anomaly_type}
                </span>
                <span
                  className={
                    "rounded-full border px-2 py-0.5 text-[9.5px] font-bold tracking-wide uppercase " +
                    meta.badgeClass
                  }
                >
                  {status}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {formatDetailEntries(anomaly.details)}
              </p>
              <p className="text-[10.5px] text-muted-foreground">
                Run{" "}
                <span className="font-semibold text-foreground">{anomaly.run_id}</span>
                {" "}&middot; Detected {formatTimestamp(anomaly.created_at)}
              </p>
              {anomaly.decided_by ? (
                <p className="text-[10.5px] text-muted-foreground">
                  Decided by{" "}
                  <span className="font-semibold text-foreground">{anomaly.decided_by}</span>
                  {anomaly.decided_at ? ` · ${formatTimestamp(anomaly.decided_at)}` : ""}
                </p>
              ) : null}
              {anomaly.decision_note ? (
                <p className="rounded-md bg-muted/50 p-2 text-[11px] text-foreground">
                  &ldquo;{anomaly.decision_note}&rdquo;
                </p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </SheetContent>
  )
}
