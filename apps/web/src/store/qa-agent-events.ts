import type { SseEvent } from "@/lib/sse"

export type QaStageKey = "validate" | "context" | "llm" | "persist" | "done"

export const QA_STAGE_ORDER: QaStageKey[] = ["validate", "context", "llm", "persist", "done"]

export type QaAnalysisEvent = SseEvent & {
  analysis_id?: string
}

export function describeQaEvent(
  event: QaAnalysisEvent
): { stage?: QaStageKey; status?: string; message: string } {
  switch (event.event) {
    case "started":
      return { stage: "validate", status: "running", message: "Starting analysis..." }
    case "testing_type_validated":
      return { stage: "validate", status: "running", message: "Testing type validated" }
    case "repository_validated":
      return { stage: "validate", status: "running", message: "Repository validated" }
    case "branch_validated":
      return { stage: "validate", status: "running", message: "Branch validated" }
    case "context_built":
      return {
        stage: "context",
        status: "running",
        message: `Fetched ${event.commits_analyzed ?? "?"} commits, ${event.changed_files ?? "?"} changed files`,
      }
    case "llm_invoked":
      return {
        stage: "llm",
        status: "running",
        message: `AI analysis complete (${event.provider ?? "?"}/${event.model ?? "?"})`,
      }
    case "recommendations_ready":
      return {
        stage: "llm",
        status: "running",
        message: `${event.recommended_file_count ?? "?"} files flagged for testing`,
      }
    case "persisted":
      return { stage: "persist", status: "running", message: "Saved to history" }
    case "analysis_completed":
      return { stage: "done", status: "completed", message: "Analysis complete" }
    case "error":
      return { status: "failed", message: typeof event.detail === "string" ? event.detail : "Analysis failed" }
    default:
      return { message: event.event }
  }
}

export function isTerminalQaEvent(event: QaAnalysisEvent): boolean {
  return event.event === "analysis_completed" || event.event === "error"
}

export type QaTestingType = {
  id: string
  name: string
  description: string
}

export type QaCommit = {
  commit_id: string
  commit_name: string
  author: string | null
  date: string | null
  files_changed: number
}

export type QaRecommendation = {
  commit_id: string
  commit_name: string
  file_path: string
  test_type: string
  reason: string
  risk_level: string
  test_suggestions: string[] | null
}

export type QaLlmTelemetry = {
  called: boolean
  provider: string
  model: string
  latency_ms: number | null
  usage: Record<string, number> | null
}

export type QaAnalysisResult = {
  analysis_id: string
  owner: string
  repository: string
  branch: string
  testing_type: string
  status: string
  summary: string | null
  commits: QaCommit[]
  recommendations: QaRecommendation[]
  recommended_file_count: number
  llm_called: boolean
  llm_provider: string
  llm_model: string
  llm_execution: QaLlmTelemetry | null
  analyzed_at: string
  completed_at: string | null
  error_message?: string | null
}

export type QaHistorySummary = {
  analysis_id: string
  owner: string
  repository: string
  branch: string
  testing_type: string
  status: string
  analyzed_at: string
  completed_at: string | null
  recommended_file_count: number
  llm_called: boolean
  llm_provider: string | null
  llm_model: string | null
}

export type QaFileSource = {
  analysis_id: string
  owner: string
  repository: string
  branch: string
  commit_id: string | null
  file_path: string
  language: string
  source_code: string
}
