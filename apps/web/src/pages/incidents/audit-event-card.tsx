import { Button } from "@workspace/ui/components/button"

import { StatusChip } from "@/components/status-chip"
import { ANOMALY_TYPE_LABEL } from "@/lib/anomaly-labels"
import { formatDetailEntries, formatTimestamp, humanizePascal, humanizeSnake } from "@/lib/format-labels"
import type { Anomaly } from "@/store/anomalies-slice"
import type { RunAuditEntry } from "@/store/runs-slice"

type AnomalyDetectedDetails = {
  anomaly_id: string
  anomaly_type: string
  details: Record<string, unknown>
  has_precedent: boolean
}

function isAnomalyDetectedDetails(value: unknown): value is AnomalyDetectedDetails {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { anomaly_id?: unknown }).anomaly_id === "string"
  )
}

export function AuditEventCard({
  entry,
  anomaly,
  onRequestDecision,
}: {
  entry: RunAuditEntry
  anomaly: Anomaly | undefined
  onRequestDecision: (anomalyId: string, approve: boolean) => void
}) {
  const isAnomalyDetected = entry.event === "AnomalyDetected" && isAnomalyDetectedDetails(entry.details)
  const anomalyDetails = isAnomalyDetected ? (entry.details as unknown as AnomalyDetectedDetails) : null

  return (
    <div className="border border-border p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StatusChip variant="neutral">{humanizeSnake(entry.stage)}</StatusChip>
          <span className="text-[12.5px] font-semibold text-foreground">
            {humanizePascal(entry.event)}
          </span>
        </div>
        <span className="text-[10.5px] text-muted-foreground">
          {entry.actor} &middot; {formatTimestamp(entry.created_at)}
        </span>
      </div>

      {anomalyDetails ? (
        <div className="mt-3 flex flex-col gap-2.5 border-t border-dashed border-border pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[12px] font-semibold text-foreground">
                {ANOMALY_TYPE_LABEL[anomalyDetails.anomaly_type] ?? anomalyDetails.anomaly_type}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {formatDetailEntries(anomalyDetails.details)}
              </p>
              <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                Precedent: {anomalyDetails.has_precedent ? "Yes" : "No"}
              </p>
            </div>
            {anomaly && anomaly.status !== "pending" ? (
              <StatusChip variant={anomaly.status === "approved" ? "ok" : "critical"}>
                {humanizeSnake(anomaly.status)}
              </StatusChip>
            ) : null}
          </div>

          {anomaly?.status === "pending" ? (
            <div className="flex items-center gap-2">
              <Button
                size="xs"
                onClick={() => onRequestDecision(anomalyDetails.anomaly_id, true)}
              >
                Approve
              </Button>
              <Button
                size="xs"
                variant="destructive"
                onClick={() => onRequestDecision(anomalyDetails.anomaly_id, false)}
              >
                Reject
              </Button>
            </div>
          ) : anomaly?.decision_note ? (
            <p className="text-[10.5px] text-muted-foreground">
              Note from {anomaly.decided_by}: &ldquo;{anomaly.decision_note}&rdquo;
            </p>
          ) : null}
        </div>
      ) : Object.keys(entry.details).length > 0 ? (
        <p className="mt-2 text-[11px] text-muted-foreground">
          {formatDetailEntries(entry.details)}
        </p>
      ) : null}
    </div>
  )
}
