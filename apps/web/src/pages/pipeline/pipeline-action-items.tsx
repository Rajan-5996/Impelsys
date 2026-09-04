import { useEffect, useState } from "react"
import { CheckCheckIcon, UserCheckIcon, WrenchIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { EmptyState } from "@/components/empty-state"
import { StatusChip } from "@/components/status-chip"
import { ANOMALY_TYPE_LABEL } from "@/lib/anomaly-labels"
import { formatDetailEntries, formatTimestamp, humanizeSnake } from "@/lib/format-labels"
import { TERMINAL_STATUSES } from "@/lib/stage-visual"
import { AnomalyDecisionDialog, type PendingDecision } from "@/pages/incidents/anomaly-decision-dialog"
import {
  decideAnomaly,
  fetchAnomalies,
  selectAnomalies,
  selectAnomaliesError,
  selectAnomaliesStatus,
} from "@/store/anomalies-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchActiveRun } from "@/store/run-flow-slice"
import { openDrawer, pushToast } from "@/store/ui-slice"

export function PipelineActionItems({
  runId,
  runStatus,
  runMessage,
}: {
  runId: string | null
  runStatus: string | null
  runMessage: string | null
}) {
  const dispatch = useAppDispatch()
  const anomalies = useAppSelector(selectAnomalies)
  const status = useAppSelector(selectAnomaliesStatus)
  const error = useAppSelector(selectAnomaliesError)
  const [decision, setDecision] = useState<PendingDecision | null>(null)
  const [retryTick, setRetryTick] = useState(0)
  const [approvingAll, setApprovingAll] = useState(false)

  useEffect(() => {
    if (runId) dispatch(fetchAnomalies())
  }, [dispatch, runId, runStatus, retryTick])

  useEffect(() => {
    setRetryTick(0)
  }, [runId, runStatus])

  const pending = anomalies.filter(
    (anomaly) => anomaly.status === "pending" && anomaly.run_id === runId
  )

  // The backend emits the "awaiting_anomaly_approval" pause slightly before the
  // anomaly rows are queryable, so the first fetch can race ahead of them --
  // retry a few times until they show up instead of leaving a stale empty state.
  useEffect(() => {
    if (runStatus !== "awaiting_anomaly_approval" || pending.length > 0 || retryTick >= 4) return
    const timeout = setTimeout(() => setRetryTick((n) => n + 1), 900)
    return () => clearTimeout(timeout)
  }, [runStatus, pending.length, retryTick])

  if (!runId) return null

  const isTerminal = !!runStatus && TERMINAL_STATUSES.has(runStatus)
  const awaitingRetry = !isTerminal && runStatus === "awaiting_retry"
  const totalCount = isTerminal ? 0 : pending.length + (awaitingRetry ? 1 : 0)
  const showApproveAll = runStatus === "awaiting_anomaly_approval" && pending.length > 0

  async function handleApproveAll() {
    setApprovingAll(true)
    try {
      for (const anomaly of pending) {
        await dispatch(
          decideAnomaly({ anomalyId: anomaly.anomaly_id, approve: true, actor: "operator", note: "" })
        ).unwrap()
      }
      dispatch(pushToast("All anomalies approved.", "success"))
      dispatch(fetchAnomalies())
      if (runId) dispatch(fetchActiveRun(runId))
    } catch (error) {
      dispatch(pushToast(typeof error === "string" ? error : "Approve all failed.", "warn"))
    } finally {
      setApprovingAll(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheckIcon className="size-3.5 text-primary" />
          Human-in-the-Loop Approvals
          {totalCount > 0 ? <StatusChip variant="medium">{totalCount}</StatusChip> : null}
        </CardTitle>
        {showApproveAll ? (
          <CardAction>
            <Button
              size="xs"
              onClick={handleApproveAll}
              disabled={approvingAll}
              className="cursor-pointer"
            >
              <CheckCheckIcon />
              {approvingAll ? "Approving..." : "Approve All"}
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {status === "failed" ? (
          <EmptyState message={error ?? "Failed to load action items."} />
        ) : status === "loading" || status === "idle" ? (
          <div className="h-24 animate-pulse rounded-md bg-muted/40" />
        ) : isTerminal ? (
          <EmptyState
            message={
              runStatus === "cancelled"
                ? "This run was cancelled -- no further approvals are needed."
                : `This run is ${humanizeSnake(runStatus ?? "").toLowerCase()} -- no further approvals are needed.`
            }
          />
        ) : totalCount === 0 ? (
          <EmptyState message="Nothing needs your attention on this run right now." />
        ) : (
          <>
            {awaitingRetry ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-status-warning/25 bg-status-warning/10 p-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusChip variant="medium">Awaiting Retry</StatusChip>
                    <span className="text-[12.5px] font-semibold text-foreground">
                      ETL Retry Needs Review
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {runMessage ?? "ETL failed and needs review before it can be retried."}
                  </p>
                </div>
                <Button
                  size="xs"
                  onClick={() => dispatch(openDrawer({ type: "etl-retry", runId }))}
                >
                  <WrenchIcon /> Review &amp; Retry
                </Button>
              </div>
            ) : null}
            {pending.map((anomaly) => (
              <div
                key={anomaly.anomaly_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-status-warning/25 bg-status-warning/10 p-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusChip variant="medium">Pending</StatusChip>
                    <span className="text-[12.5px] font-semibold text-foreground">
                      {ANOMALY_TYPE_LABEL[anomaly.anomaly_type] ?? anomaly.anomaly_type}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatDetailEntries(anomaly.details)}
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                    Detected {formatTimestamp(anomaly.created_at)} &middot; Precedent:{" "}
                    {anomaly.has_precedent ? "Yes" : "No"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    size="xs"
                    onClick={() => setDecision({ anomalyId: anomaly.anomaly_id, approve: true })}
                  >
                    Approve
                  </Button>
                  <Button
                    size="xs"
                    variant="destructive"
                    onClick={() => setDecision({ anomalyId: anomaly.anomaly_id, approve: false })}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </>
        )}
      </CardContent>

      <AnomalyDecisionDialog
        decision={decision}
        onClose={() => setDecision(null)}
        onDecided={() => {
          dispatch(fetchAnomalies())
          dispatch(fetchActiveRun(runId))
        }}
      />
    </Card>
  )
}
