import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeftIcon, PauseIcon, PlayIcon, XIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { CollapsibleCard } from "@/components/collapsible-card"
import { EmptyState } from "@/components/empty-state"
import { EtlFailureAnalysisContent } from "@/components/overlays/etl-failure-analysis-drawer-body"
import { EtlRetryPanel } from "@/components/overlays/etl-retry-drawer-body"
import { PipelineParticleField } from "@/components/pipeline-particle-field"
import { RunFilesList } from "@/components/run-files-list"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { pipelineVendorDetailPath, ROUTES } from "@/constants/routes"
import { runStatusLabel } from "@/lib/format-labels"
import { TERMINAL_STATUSES, type DisplayStageKey } from "@/lib/stage-visual"
import { sourceSystemsForVendor } from "@/lib/vendor-source-labels"
import { AnomalyDecisionDialog, type PendingDecision } from "@/pages/incidents/anomaly-decision-dialog"
import { AuditEventCard } from "@/pages/incidents/audit-event-card"
import { PipelineFlowRow } from "@/pages/pipeline/pipeline-flow-row"
import { fetchAnomalies, selectAnomalies } from "@/store/anomalies-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { normalizeStage } from "@/store/run-flow-events"
import { cancelRun, fetchActiveRun, pauseRun, resumeRun, STAGE_ORDER } from "@/store/run-flow-slice"
import { fetchRunAudit, fetchRuns, selectRunAudit, selectRuns, selectRunFiles } from "@/store/runs-slice"
import { openDrawer, pushToast } from "@/store/ui-slice"
import { fetchVendors, selectVendors } from "@/store/vendors-slice"

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
  const audit = useAppSelector(selectRunAudit(runId ?? ""))
  const runs = useAppSelector(selectRuns)
  const vendors = useAppSelector(selectVendors)
  const anomalies = useAppSelector(selectAnomalies)
  const files = useAppSelector(selectRunFiles(runId ?? ""))
  const hasRunFiles = !!files?.data && files.data.length > 0
  const [decision, setDecision] = useState<PendingDecision | null>(null)
  const [anomaliesOpen, setAnomaliesOpen] = useState(true)
  const [retryOpen, setRetryOpen] = useState(true)
  const [filesOpen, setFilesOpen] = useState(true)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelBusy, setCancelBusy] = useState(false)
  const [pauseBusy, setPauseBusy] = useState(false)
  const [pauseRequested, setPauseRequested] = useState(false)

  const run = runs.find((item) => item.run_id === runId)
  const vendor = vendors.find((item) => item.vendor_id === run?.vendor_id)
  const isPaused = pauseRequested || run?.status === "paused"
  const wasAwaitingAnomalyRef = useRef(false)

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
    dispatch(fetchVendors())
    setPauseRequested(false)
  }, [dispatch, runId])

  useEffect(() => {
    const isPendingAnomaly = run?.status === "awaiting_anomaly_approval"
    if (wasAwaitingAnomalyRef.current && !isPendingAnomaly) setAnomaliesOpen(false)
    wasAwaitingAnomalyRef.current = isPendingAnomaly
  }, [run?.status])

  function refresh() {
    if (!runId) return
    dispatch(fetchRunAudit(runId))
    dispatch(fetchAnomalies())
    dispatch(fetchRuns())
  }

  async function handlePauseToggle() {
    if (!runId) return
    setPauseBusy(true)
    try {
      if (isPaused) {
        await dispatch(resumeRun({ runId })).unwrap()
        setPauseRequested(false)
        dispatch(pushToast("Run resumed.", "success"))
      } else {
        await dispatch(pauseRun({ runId })).unwrap()
        setPauseRequested(true)
        dispatch(pushToast("Pause requested -- takes effect after the current stage.", "info"))
      }
      dispatch(fetchActiveRun(runId))
      refresh()
    } catch (error) {
      dispatch(pushToast(typeof error === "string" ? error : "Action failed.", "warn"))
    } finally {
      setPauseBusy(false)
    }
  }

  async function handleCancelConfirm() {
    if (!runId) return
    setCancelBusy(true)
    try {
      await dispatch(cancelRun({ runId })).unwrap()
      dispatch(pushToast("Run cancelled.", "success"))
      dispatch(fetchActiveRun(runId))
      refresh()
    } catch (error) {
      dispatch(pushToast(typeof error === "string" ? error : "Cancel failed.", "warn"))
    } finally {
      setCancelBusy(false)
      setCancelOpen(false)
    }
  }

  function handleAdvance(result: { run_id: string; status: string }) {
    void result
    refresh()
    if (runId) dispatch(fetchActiveRun(runId))
  }

  function isDisplayStageClickable(displayStage: DisplayStageKey): boolean {
    if (!run) return false
    const activeIndex = STAGE_ORDER.indexOf(normalizeStage(run.current_stage))
    const qualityCheckIndex = STAGE_ORDER.indexOf("quality_check")
    return (
      (displayStage === "advisory" && run.status === "awaiting_advisory_approval") ||
      (displayStage === "quality_check" && activeIndex >= qualityCheckIndex)
    )
  }

  function handleDisplayStageClick(displayStage: DisplayStageKey) {
    if (!run || !runId) return
    if (displayStage === "advisory" && run.status === "awaiting_advisory_approval") {
      dispatch(openDrawer({ type: "etl-advisory", runId }))
    } else if (displayStage === "quality_check" && isDisplayStageClickable(displayStage)) {
      dispatch(openDrawer({ type: "quality-check", runId }))
    }
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
              {runStatusLabel(run.status)}
            </StatusChip>
          ) : null}
        </div>
        {run?.vendor_id ? (
          <Link
            to={pipelineVendorDetailPath(run.vendor_id)}
            className="mt-1 flex w-fit items-center gap-1 text-[11.5px] font-semibold text-status-info underline underline-offset-2 hover:text-status-info/80"
          >
            {vendor?.name ?? run.vendor_id}
          </Link>
        ) : null}
      </div>

      {run ? (
        <Card className="relative overflow-hidden">
          <PipelineParticleField density={54} active={run.status === "running"} />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              Agent Execution Pipeline
              {run.status === "running" ? (
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
              ) : null}
            </CardTitle>
            {!TERMINAL_STATUSES.has(run.status) ? (
              <CardAction className="flex items-center gap-2">
                <Button variant="outline" size="xs" onClick={handlePauseToggle} disabled={pauseBusy}>
                  {isPaused ? <PlayIcon /> : <PauseIcon />}
                  {isPaused ? "Continue" : "Pause"}
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setCancelOpen(true)}
                  disabled={pauseBusy}
                  className="border-0 text-status-critical-foreground hover:brightness-110"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-status-critical), color-mix(in oklab, var(--color-status-critical) 65%, black))",
                  }}
                >
                  <XIcon />
                  Cancel
                </Button>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent className="relative z-10">
            <PipelineFlowRow
              runId={runId}
              sources={sourceSystemsForVendor(run.vendor_id ?? "")}
              currentStage={run.current_stage}
              status={run.status}
              streaming={run.status === "running"}
              isDisplayStageClickable={isDisplayStageClickable}
              onDisplayStageClick={handleDisplayStageClick}
            />
          </CardContent>
        </Card>
      ) : null}

      <CollapsibleCard title="Anomaly Agent Review" open={anomaliesOpen} onOpenChange={setAnomaliesOpen}>
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
      </CollapsibleCard>

      {run?.status === "awaiting_retry" ? (
        <CollapsibleCard title="Agent ETL Approval" open={retryOpen} onOpenChange={setRetryOpen}>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[11px] font-semibold text-foreground">
                What the Agent Is Planning to Change
              </p>
              <div className="mt-2">
                <EtlFailureAnalysisContent runId={runId} />
              </div>
            </div>
            <EtlRetryPanel runId={runId} onDecided={handleAdvance} />
          </div>
        </CollapsibleCard>
      ) : null}

      {hasRunFiles ? (
        <CollapsibleCard title="Agent Output Files" open={filesOpen} onOpenChange={setFilesOpen}>
          <RunFilesList runId={runId} />
        </CollapsibleCard>
      ) : null}

      <AnomalyDecisionDialog
        decision={decision}
        onClose={() => setDecision(null)}
        onDecided={handleAdvance}
      />

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent size="narrow">
          <DialogHeader>
            <DialogTitle>Cancel this run?</DialogTitle>
          </DialogHeader>
          <div className="p-5">
            <p className="text-xs text-muted-foreground">
              This stops the Smart ETL run in progress. Any stage already completed
              will remain recorded, but the remaining stages will not run.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)} disabled={cancelBusy}>
              Keep Running
            </Button>
            <Button
              onClick={handleCancelConfirm}
              disabled={cancelBusy}
              className="border-0 text-status-critical-foreground hover:brightness-110"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-status-critical), color-mix(in oklab, var(--color-status-critical) 65%, black))",
              }}
            >
              {cancelBusy ? "Cancelling..." : "Cancel Run"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
