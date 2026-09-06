import { useEffect, useState } from "react"
import { CheckCheckIcon, FlaskConicalIcon, ShieldAlertIcon, UserCheckIcon, WrenchIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { EmptyState } from "@/components/empty-state"
import { StatusChip } from "@/components/status-chip"
import { humanizeSnake, lastErrorLine } from "@/lib/format-labels"
import { TERMINAL_STATUSES } from "@/lib/stage-visual"
import { AnomalyDecisionDialog, type PendingDecision } from "@/pages/incidents/anomaly-decision-dialog"
import { ActionItemRow, PendingAnomalyRow } from "@/pages/pipeline/pipeline-action-item-rows"
import {
  decideAnomaly,
  fetchAnomalies,
  selectAnomalies,
  selectAnomaliesError,
  selectAnomaliesStatus,
} from "@/store/anomalies-slice"
import { fetchEtlAdvisory, selectEtlAdvisory } from "@/store/etl-advisory-slice"
import { fetchEtlAttempts, selectEtlAttempts } from "@/store/etl-slice"
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
  const advisory = useAppSelector(selectEtlAdvisory(runId ?? ""))
  const attempts = useAppSelector(selectEtlAttempts(runId ?? ""))
  const [decision, setDecision] = useState<PendingDecision | null>(null)
  const [retryTick, setRetryTick] = useState(0)
  const [approvingAll, setApprovingAll] = useState(false)

  useEffect(() => {
    if (runId) dispatch(fetchAnomalies())
  }, [dispatch, runId, runStatus, retryTick])

  // A run can reach "Fix Pending" (ETL failed, needs a corrected script) after
  // already having gone through the advisory gate earlier in its lifecycle --
  // surface that prior advisory context alongside the fix review either way.
  useEffect(() => {
    if (runId) dispatch(fetchEtlAdvisory(runId))
  }, [dispatch, runId, runStatus])

  useEffect(() => {
    if (runId) dispatch(fetchEtlAttempts(runId))
  }, [dispatch, runId, runStatus])

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
  const awaitingDq = !isTerminal && runStatus === "awaiting_dq_approval"
  const awaitingAdvisory = !isTerminal && runStatus === "awaiting_advisory_approval"
  // FlowFix Agent's correction is worth showing for the rest of this run's
  // life, not just while it's still "awaiting_retry" or freshly exhausted --
  // whether the run went on to self-heal successfully or gave up for good,
  // the correction it tried (and why) is real diagnostic history that
  // shouldn't disappear the moment the run's status moves on.
  const lastFailedAttempt = [...(attempts?.data ?? [])].reverse().find((attempt) => attempt.status === "failed")
  const hasFailedAttempt = !!lastFailedAttempt
  const showCorrectionHistory = !awaitingRetry && hasFailedAttempt
  const lastEtlError = lastErrorLine(lastFailedAttempt?.error_message)
  const totalCount =
    isTerminal
      ? 0
      : pending.length + (awaitingRetry ? 1 : 0) + (awaitingDq ? 1 : 0) + (awaitingAdvisory ? 1 : 0)
  const showApproveAll = runStatus === "awaiting_anomaly_approval" && pending.length > 0
  const isLoading = status === "loading" || status === "idle"
  const isFailed = status === "failed"

  // Nothing awaiting approval and nothing to report -- don't show an empty
  // container for it, just like the data-quality and output-files sections.
  if (!isLoading && !isFailed && totalCount === 0 && !showCorrectionHistory) return null

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
          Agents Awaiting Approval
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
        {isFailed ? (
          <EmptyState message={error ?? "Failed to load action items."} />
        ) : isLoading ? (
          <div className="h-24 animate-pulse rounded-md bg-muted/40" />
        ) : (
          <>
            {showCorrectionHistory ? (
              <ActionItemRow
                variant={runStatus === "failed_max_retries" ? "critical" : "neutral"}
                toneClass={
                  runStatus === "failed_max_retries"
                    ? "border-status-critical/25 bg-status-critical/10"
                    : "border-border bg-muted/20"
                }
                badge={runStatus === "failed_max_retries" ? "Failed Max Retries" : "FlowFix Agent"}
                title={
                  runStatus === "failed_max_retries"
                    ? "FlowFix Agent Couldn't Fix This Run"
                    : "FlowFix Agent Corrected This Run"
                }
                description={
                  runStatus === "failed_max_retries"
                    ? (runMessage ?? "FlowFix Agent tried its correction and the run still failed -- see what it attempted below.")
                    : "An ETL attempt failed earlier in this run and FlowFix Agent applied a correction -- see what it changed."
                }
                errorDetail={lastEtlError}
                actionLabel="View Agent's Correction"
                actionIcon={WrenchIcon}
                actionVariant="outline"
                onAction={() => dispatch(openDrawer({ type: "etl-failure-analysis", runId }))}
              />
            ) : null}
            {awaitingRetry ? (
              <ActionItemRow
                variant="medium"
                toneClass="border-status-warning/25 bg-status-warning/10"
                badge="Fix Pending"
                title="FlowFix Agent Needs Your Review"
                description={runMessage ?? "ETL failed and needs review before the fix can be applied."}
                errorDetail={lastEtlError}
                actionLabel="Review Agent's Fix"
                actionIcon={WrenchIcon}
                onAction={() => dispatch(openDrawer({ type: "etl-retry", runId }))}
              />
            ) : null}
            {awaitingRetry && advisory?.data?.exists ? (
              <ActionItemRow
                variant="neutral"
                toneClass="border-border bg-muted/20"
                badge="Advisory Agent"
                title="Earlier Advisory Findings for This Run"
                description={`${advisory.data.warnings.length} warning${advisory.data.warnings.length === 1 ? "" : "s"} flagged before ETL ran · ${humanizeSnake(advisory.data.status)}`}
                actionLabel="View Advisory"
                actionIcon={FlaskConicalIcon}
                actionVariant="outline"
                onAction={() => dispatch(openDrawer({ type: "etl-advisory", runId }))}
              />
            ) : null}
            {awaitingDq ? (
              <ActionItemRow
                variant="medium"
                toneClass="border-status-warning/25 bg-status-warning/10"
                badge="Awaiting DQ Approval"
                title="Data Quality Score Needs Review"
                description={runMessage ?? "Quality score is below threshold and needs approval before ETL runs."}
                actionLabel="Review & Decide"
                actionIcon={ShieldAlertIcon}
                onAction={() => dispatch(openDrawer({ type: "quality-check", runId }))}
              />
            ) : null}
            {awaitingAdvisory ? (
              <ActionItemRow
                variant="medium"
                toneClass="border-status-warning/25 bg-status-warning/10"
                badge="Awaiting Advisory Approval"
                title="PreFlight Agent Flagged a Risk"
                description={runMessage ?? "PreFlight Agent flagged something in the incoming data -- take a look before the run continues."}
                actionLabel="Review & Decide"
                actionIcon={FlaskConicalIcon}
                onAction={() => dispatch(openDrawer({ type: "etl-advisory", runId }))}
              />
            ) : null}
            {pending.map((anomaly) => (
              <PendingAnomalyRow
                key={anomaly.anomaly_id}
                anomaly={anomaly}
                onApprove={() => setDecision({ anomalyId: anomaly.anomaly_id, approve: true })}
                onReject={() => setDecision({ anomalyId: anomaly.anomaly_id, approve: false })}
              />
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
