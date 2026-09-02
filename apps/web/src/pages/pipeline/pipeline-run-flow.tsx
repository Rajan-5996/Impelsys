import { Link } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { EmptyState } from "@/components/empty-state"
import { StageFlow, type StageNodeState } from "@/components/stage-flow"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { runDetailPath } from "@/constants/routes"
import { humanizeSnake } from "@/lib/format-labels"
import { STAGE_ORDER, selectRunFlow, type StageKey } from "@/store/run-flow-slice"
import { useAppSelector } from "@/store/hooks"

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
  const { runId, currentStage, status, message, streaming } = useAppSelector(selectRunFlow)

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
        />

        <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-border pt-3">
          <span className="text-[11px] font-semibold text-foreground">{runId}</span>
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
