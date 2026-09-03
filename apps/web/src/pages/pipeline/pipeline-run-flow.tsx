import { useEffect } from "react"
import { Link } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { StageFlow, type StageNodeState } from "@/components/stage-flow"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { runDetailPath } from "@/constants/routes"
import { formatTimestamp, humanizeSnake } from "@/lib/format-labels"
import type { ActivityFeedEntry } from "@/store/command-center-slice"
import { fetchEtlAttempts, selectEtlAttempts } from "@/store/etl-slice"
import { fetchPipelineAuditTrail, selectPipelineAuditTrail } from "@/store/pipeline-slice"
import { STAGE_ORDER, selectRunFlow, type StageKey } from "@/store/run-flow-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { openDrawer } from "@/store/ui-slice"

const STAGE_LABELS: Record<StageKey, string> = {
  ingestion: "Ingestion",
  anomaly_detection: "Anomaly Detection",
  quality_check: "Quality Check",
  etl: "ETL",
  done: "Done",
}

const FAILED_STATUSES = new Set(["halted", "etl_validation_failed", "failed_max_retries", "failed"])
const PAUSED_STATUSES = new Set(["awaiting_anomaly_approval", "awaiting_dq_approval", "awaiting_retry"])

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
}

function nodeVisualState(
  stageKey: StageKey,
  index: number,
  activeIndex: number,
  status: string | null,
  streaming: boolean
): StageNodeState {
  if (index < activeIndex) return "done"
  if (index > activeIndex) return "pending"
  if (stageKey === "done" && status === "completed") return "done"
  if (status && FAILED_STATUSES.has(status)) return "failed"
  if (status && PAUSED_STATUSES.has(status)) return "paused"
  return streaming ? "active" : "in-progress"
}

export function PipelineRunFlow() {
  const dispatch = useAppDispatch()
  const { runId, currentStage, status, message, streaming } = useAppSelector(selectRunFlow)
  const attempts = useAppSelector(selectEtlAttempts(runId ?? ""))

  useEffect(() => {
    if (runId) dispatch(fetchEtlAttempts(runId))
  }, [dispatch, runId])

  if (!runId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart ETL Run Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState message="No run triggered yet -- click Trigger Agent to start one." />
        </CardContent>
      </Card>
    )
  }

  const activeIndex = STAGE_ORDER.indexOf(currentStage ?? "ingestion")
  const qualityCheckIndex = STAGE_ORDER.indexOf("quality_check")
  const hasFailedEtlAttempt = attempts?.data.some((attempt) => attempt.status === "failed") ?? false
  const qualityCheckReached = activeIndex >= qualityCheckIndex

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart ETL Run Flow</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <StageFlow
          stages={STAGE_ORDER}
          labels={STAGE_LABELS}
          activeIndex={activeIndex}
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
