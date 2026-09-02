export type StageKey = "ingestion" | "anomaly_detection" | "quality_check" | "etl" | "done"

export const STAGE_ORDER: StageKey[] = [
  "ingestion",
  "anomaly_detection",
  "quality_check",
  "etl",
  "done",
]

export type RunFlowEvent = {
  event: string
  run_id?: string
  status?: string
  [key: string]: unknown
}

export function normalizeStage(raw: string | null | undefined): StageKey {
  if (raw === "etl_failure_analysis") return "etl"
  if (raw && (STAGE_ORDER as string[]).includes(raw)) return raw as StageKey
  return "ingestion"
}

function stageForPausedStatus(status?: string): StageKey {
  if (status === "awaiting_anomaly_approval") return "anomaly_detection"
  if (status === "awaiting_dq_approval") return "quality_check"
  return "etl"
}

function messageForPausedStatus(status?: string): string {
  switch (status) {
    case "awaiting_anomaly_approval":
      return "Waiting on anomaly approval"
    case "awaiting_dq_approval":
      return "Waiting on data-quality approval"
    case "awaiting_retry":
      return "ETL failed -- corrected script ready for retry"
    case "failed_max_retries":
      return "ETL failed after max retries"
    default:
      return "Run paused"
  }
}

export function messageForRunStatus(status: string): string {
  switch (status) {
    case "running":
      return "Run in progress"
    case "completed":
      return "Run completed"
    case "halted":
      return "Run halted"
    case "etl_validation_failed":
      return "Output validation failed"
    default:
      return messageForPausedStatus(status)
  }
}

export function describeEvent(event: RunFlowEvent): { stage?: StageKey; status?: string; message: string } {
  switch (event.event) {
    case "run_started":
      return { stage: "ingestion", status: "running", message: "Starting run..." }
    case "ingestion_complete": {
      const rowCount = (event.ingestion as { row_count?: number } | undefined)?.row_count
      return { stage: "ingestion", status: "running", message: `Ingested ${rowCount ?? "?"} rows` }
    }
    case "vendor_notified":
      return { stage: "anomaly_detection", status: "running", message: "Vendor notified of anomalies" }
    case "anomalies_auto_resolved":
      return { stage: "anomaly_detection", status: "running", message: "No anomalies required approval" }
    case "paused":
      return {
        stage: stageForPausedStatus(event.status),
        status: event.status,
        message: messageForPausedStatus(event.status),
      }
    case "quality_check_complete": {
      const score = (event.dq_result as { overall_score?: number } | undefined)?.overall_score
      return { stage: "quality_check", message: `Quality score: ${score ?? "?"}` }
    }
    case "quality_check_passed":
      return { stage: "quality_check", status: "running", message: "Quality check passed" }
    case "etl_attempt_started":
      return { stage: "etl", status: "running", message: `Running ETL attempt ${event.attempt_number}` }
    case "etl_attempt_complete":
      return { stage: "etl", message: `ETL attempt finished: ${event.status}` }
    case "run_completed":
      return { stage: "done", status: "completed", message: "Run completed" }
    case "validation_failed":
      return { stage: "etl", status: "etl_validation_failed", message: "Output validation failed" }
    case "etl_attempt_failed":
      return { stage: "etl", message: "ETL attempt failed -- analyzing root cause..." }
    case "failure_analysis_complete":
      return { stage: "etl", message: `Root cause: ${event.root_cause ?? "unknown"}` }
    case "error":
      return { status: "failed", message: typeof event.detail === "string" ? event.detail : "Run failed" }
    default:
      return { message: event.event }
  }
}

export function parseSseRecord(record: string): RunFlowEvent | null {
  const dataLine = record.split("\n").find((line) => line.startsWith("data:"))
  if (!dataLine) return null
  try {
    return JSON.parse(dataLine.slice(dataLine.indexOf(":") + 1).trim()) as RunFlowEvent
  } catch {
    return null
  }
}

export function isTerminalEvent(event: RunFlowEvent): boolean {
  return ["run_completed", "validation_failed", "paused", "error"].includes(event.event)
}
