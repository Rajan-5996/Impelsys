import { STAGE_ORDER, type StageKey } from "@/store/run-flow-slice"
import type { StageNodeState } from "@/components/stage-flow"

export const STAGE_LABELS: Record<StageKey, string> = {
  ingestion: "Ingestion",
  anomaly_detection: "Anomaly Agent",
  quality_check: "QA Agent",
  etl: "ETL Agent",
  done: "Done",
}

export const NODE_STYLE: Record<StageNodeState, string> = {
  done: "border-status-good bg-status-good/15 text-status-good-ink",
  active: "border-primary bg-primary/15 text-primary",
  "in-progress": "border-primary bg-primary/15 text-primary",
  paused: "border-status-warning bg-status-warning/15 text-status-warning-foreground",
  failed: "border-status-critical bg-status-critical/15 text-status-critical-ink",
  pending: "border-border bg-muted/30 text-muted-foreground",
}

export const FAILED_STATUSES = new Set([
  "halted",
  "etl_validation_failed",
  "failed_max_retries",
  "failed",
  "cancelled",
])

export const TERMINAL_STATUSES = new Set([
  "completed",
  ...FAILED_STATUSES,
])

export const PAUSED_STATUSES = new Set([
  "awaiting_anomaly_approval",
  "awaiting_dq_approval",
  "awaiting_advisory_approval",
  "awaiting_retry",
  "paused",
  "pause_requested",
  "cancel_requested",
])

export function nodeVisualState(
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

// The "advisory" gate (Stage 4 contract-check, before the ETL script runs) is
// a real backend concept but not one of the run's five current_stage values
// -- it's displayed as an extra node between "quality_check" and "etl" here,
// with its own state derived from the run status instead of current_stage.
export type DisplayStageKey = StageKey | "advisory"

export const DISPLAY_STAGE_ORDER: DisplayStageKey[] = [
  "ingestion",
  "anomaly_detection",
  "quality_check",
  "advisory",
  "etl",
  "done",
]

export const DISPLAY_STAGE_LABELS: Record<DisplayStageKey, string> = {
  ...STAGE_LABELS,
  advisory: "Advisory Agent",
}

export function displayStageState(
  displayStage: DisplayStageKey,
  activeIndex: number,
  status: string | null,
  streaming: boolean
): StageNodeState {
  if (displayStage === "advisory") {
    const etlIndex = STAGE_ORDER.indexOf("etl")
    if (status === "awaiting_advisory_approval") return "paused"
    return activeIndex >= etlIndex ? "done" : "pending"
  }
  return nodeVisualState(displayStage, STAGE_ORDER.indexOf(displayStage), activeIndex, status, streaming)
}

export function displayActiveIndex(activeIndex: number, status: string | null): number {
  if (status === "awaiting_advisory_approval") return DISPLAY_STAGE_ORDER.indexOf("advisory")
  const realKey = STAGE_ORDER[activeIndex] ?? "ingestion"
  return DISPLAY_STAGE_ORDER.indexOf(realKey)
}
