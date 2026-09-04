import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PauseIcon, PlayIcon, XIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { PipelineParticleField } from "@/components/pipeline-particle-field"
import { StageFlow } from "@/components/stage-flow"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { runDetailPath } from "@/constants/routes"
import { formatTimestamp, humanizeSnake } from "@/lib/format-labels"
import { nodeVisualState, STAGE_LABELS, TERMINAL_STATUSES } from "@/lib/stage-visual"
import type { ActivityFeedEntry } from "@/store/command-center-slice"
import { fetchEtlAttempts, selectEtlAttempts } from "@/store/etl-slice"
import { fetchPipelineAuditTrail, selectPipelineAuditTrail } from "@/store/pipeline-slice"
import {
  cancelRun,
  fetchActiveRun,
  pauseRun,
  resumeRun,
  STAGE_ORDER,
  selectRunFlow,
} from "@/store/run-flow-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { openDrawer, pushToast } from "@/store/ui-slice"

const STATUS_VARIANT: Record<string, StatusChipVariant> = {
  running: "low",
  awaiting_anomaly_approval: "medium",
  awaiting_dq_approval: "medium",
  awaiting_retry: "medium",
  completed: "ok",
  halted: "critical",
  etl_validation_failed: "critical",
  failed_max_retries: "critical",
  failed: "critical",
  cancelled: "critical",
  cancel_requested: "medium",
  paused: "medium",
  pause_requested: "medium",
}

export function PipelineRunFlow() {
  const dispatch = useAppDispatch()
  const { runId, currentStage, status, message, streaming } = useAppSelector(selectRunFlow)
  const attempts = useAppSelector(selectEtlAttempts(runId ?? ""))
  const [cancelOpen, setCancelOpen] = useState(false)
  const [actionBusy, setActionBusy] = useState(false)
  const [pauseRequested, setPauseRequested] = useState(false)
  const isPaused = pauseRequested || status === "paused"

  useEffect(() => {
    if (runId) dispatch(fetchEtlAttempts(runId))
    setPauseRequested(false)
  }, [dispatch, runId])

  async function handlePauseToggle() {
    if (!runId) return
    setActionBusy(true)
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
    } catch (error) {
      dispatch(pushToast(typeof error === "string" ? error : "Action failed.", "warn"))
    } finally {
      setActionBusy(false)
    }
  }

  async function handleCancelConfirm() {
    if (!runId) return
    setActionBusy(true)
    try {
      await dispatch(cancelRun({ runId })).unwrap()
      dispatch(pushToast("Run cancelled.", "success"))
      dispatch(fetchActiveRun(runId))
    } catch (error) {
      dispatch(pushToast(typeof error === "string" ? error : "Cancel failed.", "warn"))
    } finally {
      setActionBusy(false)
      setCancelOpen(false)
    }
  }

  if (!runId) {
    return (
      <Card className="relative overflow-hidden">
        <PipelineParticleField density={28} />
        <CardHeader className="relative z-10">
          <CardTitle>Smart ETL Run Flow</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <EmptyState message="No run triggered yet -- click Trigger Agent to start one." />
        </CardContent>
      </Card>
    )
  }

  const activeIndex = STAGE_ORDER.indexOf(currentStage ?? "ingestion")
  const qualityCheckIndex = STAGE_ORDER.indexOf("quality_check")
  const hasFailedEtlAttempt = attempts?.data.some((attempt) => attempt.status === "failed") ?? false
  const qualityCheckReached = activeIndex >= qualityCheckIndex
  const runControlsVisible = !status || !TERMINAL_STATUSES.has(status)

  return (
    <>
    <Card className="relative overflow-hidden">
      <PipelineParticleField active={streaming} density={54} />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2">
          Smart ETL Run Flow
          {streaming ? (
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
          ) : null}
        </CardTitle>
        {runControlsVisible ? (
          <CardAction className="flex items-center gap-2">
            <Button variant="outline" size="xs" onClick={handlePauseToggle} disabled={actionBusy}>
              {isPaused ? <PlayIcon /> : <PauseIcon />}
              {isPaused ? "Continue" : "Pause"}
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setCancelOpen(true)}
              disabled={actionBusy}
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
      <CardContent className="relative z-10 flex flex-col gap-4">
        <StageFlow
          stages={STAGE_ORDER}
          labels={STAGE_LABELS}
          activeIndex={activeIndex}
          settled={!!status && TERMINAL_STATUSES.has(status)}
          nodeState={(stageKey, index) => nodeVisualState(stageKey, index, activeIndex, status, streaming)}
          isNodeClickable={(stageKey) =>
            (stageKey === "etl" && hasFailedEtlAttempt) ||
            (stageKey === "quality_check" && qualityCheckReached)
          }
          onNodeClick={(stageKey) => {
            if (stageKey === "etl" && hasFailedEtlAttempt) {
              dispatch(openDrawer({ type: "etl-failure-analysis", runId }))
            } else if (stageKey === "quality_check" && qualityCheckReached) {
              dispatch(openDrawer({ type: "quality-check", runId }))
            }
          }}
        />

        <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-border pt-3">
          <Link
            to={runDetailPath(runId)}
            className="text-[11px] font-semibold text-status-info underline underline-offset-2 hover:text-status-info/80"
          >
            {runId}
          </Link>
          {status ? (
            <StatusChip variant={STATUS_VARIANT[status] ?? "medium"}>
              {humanizeSnake(status)}
            </StatusChip>
          ) : null}
          <span className="text-[11px] text-muted-foreground">{message}</span>
          {status === "awaiting_anomaly_approval" ? (
            <Link
              to={runDetailPath(runId)}
              className="ml-auto text-[11px] font-semibold text-primary hover:underline"
            >
              Review in Incidents &rarr;
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>

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
          <Button variant="outline" onClick={() => setCancelOpen(false)} disabled={actionBusy}>
            Keep Running
          </Button>
          <Button
            onClick={handleCancelConfirm}
            disabled={actionBusy}
            className="border-0 text-status-critical-foreground hover:brightness-110"
            style={{
              background:
                "linear-gradient(135deg, var(--color-status-critical), color-mix(in oklab, var(--color-status-critical) 65%, black))",
            }}
          >
            {actionBusy ? "Cancelling..." : "Cancel Run"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}

const AUDIT_COLUMNS: DataTableColumn<ActivityFeedEntry>[] = [
  { key: "ts", header: "Timestamp", render: (row) => formatTimestamp(row.ts) },
  { key: "agent", header: "Agent", render: (row) => row.agent },
  { key: "action", header: "Action", render: (row) => row.action },
  { key: "decision", header: "Decision", render: (row) => row.decision ?? "—" },
]

export function PipelineAuditTrail() {
  const dispatch = useAppDispatch()
  const auditTrail = useAppSelector(selectPipelineAuditTrail)

  useEffect(() => {
    dispatch(fetchPipelineAuditTrail("SALES_DAILY_ETL"))
  }, [dispatch])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Audit Trail</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {auditTrail.status === "failed" ? (
          <EmptyState message={auditTrail.error ?? "Failed to load the audit trail."} />
        ) : auditTrail.status === "loading" || auditTrail.status === "idle" ? (
          <div className="h-20 animate-pulse rounded-md bg-muted/40" />
        ) : (
          <DataTable
            columns={AUDIT_COLUMNS}
            rows={auditTrail.data.entries}
            rowKey={(row) => `${row.ts}-${row.action}`}
            emptyMessage="No audit trail entries for this pipeline."
          />
        )}
      </CardContent>
    </Card>
  )
}
