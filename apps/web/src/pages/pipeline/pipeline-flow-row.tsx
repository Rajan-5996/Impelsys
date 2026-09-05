import { useEffect } from "react"

import { StageFlow } from "@/components/stage-flow"
import {
  DISPLAY_STAGE_LABELS,
  DISPLAY_STAGE_ORDER,
  displayActiveIndex,
  displayStageState,
  TERMINAL_STATUSES,
  type DisplayStageKey,
} from "@/lib/stage-visual"
import type { VendorSourceSystem } from "@/lib/vendor-source-labels"
import { ConnectorsFeed, PipelineOutputBranch } from "@/pages/pipeline/pipeline-flow-endpoints"
import { normalizeStage } from "@/store/run-flow-events"
import { STAGE_ORDER } from "@/store/run-flow-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchRunFiles, selectRunFiles } from "@/store/runs-slice"

/** The horizontal "Agent Execution Pipeline" row shared by the vendor pipeline
 * page and the incidents run detail page -- connector sources feed into the
 * display-stage nodes, and once output files exist the "Done" node is dropped
 * in favour of a fan-out of downloadable files, mirroring the feed at the
 * start. */
export function PipelineFlowRow({
  runId,
  sources,
  currentStage,
  status,
  streaming = false,
  isDisplayStageClickable,
  onDisplayStageClick,
}: {
  runId: string
  sources: VendorSourceSystem[]
  currentStage?: string | null
  status?: string | null
  streaming?: boolean
  isDisplayStageClickable?: (stage: DisplayStageKey) => boolean
  onDisplayStageClick?: (stage: DisplayStageKey) => void
}) {
  const dispatch = useAppDispatch()
  const files = useAppSelector(selectRunFiles(runId))

  useEffect(() => {
    dispatch(fetchRunFiles(runId))
  }, [dispatch, runId])

  const outputFiles = files?.data ?? []
  const hasOutputs = outputFiles.length > 0
  const runStatus = status ?? null
  const activeIndex = STAGE_ORDER.indexOf(normalizeStage(currentStage ?? null))
  const displayStages = hasOutputs
    ? DISPLAY_STAGE_ORDER.filter((stageKey) => stageKey !== "done")
    : DISPLAY_STAGE_ORDER

  return (
    <div className="flex items-center overflow-x-auto pb-6">
      <ConnectorsFeed sources={sources} />
      <StageFlow
        stages={displayStages}
        labels={DISPLAY_STAGE_LABELS}
        size="lg"
        activeIndex={displayActiveIndex(activeIndex, runStatus)}
        settled={!!runStatus && TERMINAL_STATUSES.has(runStatus)}
        nodeState={(stageKey) => displayStageState(stageKey, activeIndex, runStatus, streaming)}
        isNodeClickable={(stageKey) => isDisplayStageClickable?.(stageKey) ?? false}
        onNodeClick={(stageKey) => onDisplayStageClick?.(stageKey)}
      />
      {hasOutputs ? <PipelineOutputBranch runId={runId} files={outputFiles} /> : null}
    </div>
  )
}