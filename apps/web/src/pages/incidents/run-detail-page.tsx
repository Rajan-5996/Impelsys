import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeftIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { EmptyState } from "@/components/empty-state"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { ROUTES } from "@/constants/routes"
import { humanizeSnake } from "@/lib/format-labels"
import { AnomalyDecisionDialog, type PendingDecision } from "@/pages/incidents/anomaly-decision-dialog"
import { AuditEventCard } from "@/pages/incidents/audit-event-card"
import { fetchAnomalies, selectAnomalies } from "@/store/anomalies-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchActiveRun } from "@/store/run-flow-slice"
import { fetchRunAudit, fetchRuns, selectRunAudit, selectRuns } from "@/store/runs-slice"

const RUN_STATUS_VARIANT: Record<string, StatusChipVariant> = {
  running: "low",
  awaiting_anomaly_approval: "medium",
  awaiting_dq_approval: "medium",
  awaiting_retry: "medium",
  completed: "ok",
  halted: "critical",
  etl_validation_failed: "critical",
  failed_max_retries: "critical",
}

export function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const audit = useAppSelector(selectRunAudit(runId ?? ""))
  const runs = useAppSelector(selectRuns)
  const anomalies = useAppSelector(selectAnomalies)
  const [decision, setDecision] = useState<PendingDecision | null>(null)

  const run = runs.find((item) => item.run_id === runId)
  const anomalyById = useMemo(() => {
    const map = new Map(anomalies.map((anomaly) => [anomaly.anomaly_id, anomaly]))
    return map
  }, [anomalies])
  const anomalyEvents = useMemo(
    () => (audit?.data ?? []).filter((entry) => entry.event === "AnomalyDetected"),
    [audit]
  )

  useEffect(() => {
    if (!runId) return
    dispatch(fetchRunAudit(runId))
    dispatch(fetchAnomalies())
    dispatch(fetchRuns())
  }, [dispatch, runId])

  function refresh() {
    if (!runId) return
    dispatch(fetchRunAudit(runId))
    dispatch(fetchAnomalies())
    dispatch(fetchRuns())
  }

  function handleDecided(result: { run_id: string; status: string }) {
    refresh()
    if (runId) dispatch(fetchActiveRun(runId))
    if (result.status === "awaiting_anomaly_approval" || result.status === "awaiting_retry") return
    setTimeout(() => navigate(ROUTES.pipeline), 1500)
  }

  if (!runId) return null

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          to={ROUTES.incidents}
          className="flex w-fit items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to Incidents
        </Link>
        <div className="mt-2 flex items-center gap-2.5">
          <h1 className="text-lg font-semibold text-foreground">{runId}</h1>
          {run ? (
            <StatusChip variant={RUN_STATUS_VARIANT[run.status] ?? "medium"}>
              {humanizeSnake(run.status)}
            </StatusChip>
          ) : null}
        </div>
        {run ? (
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            Current stage: {humanizeSnake(run.current_stage)}
          </p>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Anomalies</CardTitle>
        </CardHeader>
        <CardContent>
          {audit?.status === "failed" ? (
            <EmptyState message={audit.error ?? "Failed to load anomalies."} />
          ) : audit?.status === "loading" || !audit || audit.status === "idle" ? (
            <div className="h-64 animate-pulse rounded-md bg-muted/40" />
          ) : anomalyEvents.length === 0 ? (
            <EmptyState message="No anomalies recorded for this run." />
          ) : (
            <div className="flex flex-col gap-2.5">
              {anomalyEvents.map((entry, index) => (
                <AuditEventCard
                  key={`${entry.event}-${entry.created_at}-${index}`}
                  entry={entry}
                  anomaly={
                    typeof entry.details.anomaly_id === "string"
                      ? anomalyById.get(entry.details.anomaly_id)
                      : undefined
                  }
                  onRequestDecision={(anomalyId, approve) =>
                    setDecision({ anomalyId, approve })
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AnomalyDecisionDialog
        decision={decision}
        onClose={() => setDecision(null)}
        onDecided={handleDecided}
      />
    </div>
  )
}
