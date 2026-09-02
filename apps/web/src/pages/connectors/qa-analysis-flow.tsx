import { StageFlow, type StageNodeState } from "@/components/stage-flow"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { QA_STAGE_ORDER, type QaStageKey } from "@/store/qa-agent-events"
import { selectQaAgent } from "@/store/qa-agent-slice"
import { useAppSelector } from "@/store/hooks"

const STAGE_LABELS: Record<QaStageKey, string> = {
  validate: "Validate",
  context: "Fetch Context",
  llm: "AI Analysis",
  persist: "Save",
  done: "Done",
}

const STATUS_VARIANT: Record<string, StatusChipVariant> = {
  running: "low",
  completed: "ok",
  failed: "critical",
}

function nodeVisualState(
  stageKey: QaStageKey,
  index: number,
  activeIndex: number,
  status: string | null,
  streaming: boolean
): StageNodeState {
  if (index < activeIndex) return "done"
  if (index > activeIndex) return "pending"
  if (stageKey === "done" && status === "completed") return "done"
  if (status === "failed") return "failed"
  return streaming ? "active" : "in-progress"
}

export function QaAnalysisFlow() {
  const { stage, status, message, streaming } = useAppSelector(selectQaAgent)
  const activeIndex = QA_STAGE_ORDER.indexOf(stage ?? "validate")

  return (
    <div className="flex flex-col gap-4 border border-border p-4">
      <StageFlow
        stages={QA_STAGE_ORDER}
        labels={STAGE_LABELS}
        activeIndex={activeIndex}
        nodeState={(stageKey, index) => nodeVisualState(stageKey, index, activeIndex, status, streaming)}
      />
      <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-border pt-3">
        {status ? <StatusChip variant={STATUS_VARIANT[status] ?? "medium"}>{status}</StatusChip> : null}
        <span className="text-[11px] text-muted-foreground">{message}</span>
      </div>
    </div>
  )
}
