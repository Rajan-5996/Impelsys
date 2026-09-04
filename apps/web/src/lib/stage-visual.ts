import type { StageNodeState } from "@/components/stage-flow"
import type { StageKey } from "@/store/run-flow-slice"

export const STAGE_LABELS: Record<StageKey, string> = {
  ingestion: "Ingestion",
  anomaly_detection: "Anomaly Detection",
  quality_check: "Quality Check",
  etl: "ETL",
  done: "Done",
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
