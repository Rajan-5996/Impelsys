import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { EmptyState } from "@/components/empty-state"
import { PipelineParticleField } from "@/components/pipeline-particle-field"
import { TERMINAL_STATUSES, type DisplayStageKey } from "@/lib/stage-visual"
import { sourceSystemsForVendor } from "@/lib/vendor-source-labels"
import { ConnectorsFeed } from "@/pages/pipeline/pipeline-flow-endpoints"
import { PipelineFlowRow } from "@/pages/pipeline/pipeline-flow-row"
import {
  PipelineCancelDialog,
  PipelineFullscreenCanvas,
  PipelineRunControls,
  PipelineRunFooter,
} from "@/pages/pipeline/pipeline-run-flow-overlays"
import { fetchEtlAttempts, selectEtlAttempts } from "@/store/etl-slice"
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

export function PipelineRunFlow({ sourceVendorId }: { sourceVendorId?: string | null }) {
  const dispatch = useAppDispatch()
  const sources = sourceVendorId ? sourceSystemsForVendor(sourceVendorId) : []
  const { runId, currentStage, status, message, streaming } = useAppSelector(selectRunFlow)
  const attempts = useAppSelector(selectEtlAttempts(runId ?? ""))
  const [cancelOpen, setCancelOpen] = useState(false)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)
  const [actionBusy, setActionBusy] = useState(false)
  const [pauseRequested, setPauseRequested] = useState(false)
  const isPaused = pauseRequested || status === "paused"

  useEffect(() => {
    if (runId) {
      dispatch(fetchEtlAttempts(runId))
    }
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
          <CardTitle>Agent Execution Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 flex flex-col gap-4">
          <ConnectorsFeed sources={sources} />
          <EmptyState message="No run triggered yet -- starting the pipeline..." />
        </CardContent>
      </Card>
    )
  }

  const activeIndex = STAGE_ORDER.indexOf(currentStage ?? "ingestion")
  const qualityCheckIndex = STAGE_ORDER.indexOf("quality_check")
  const hasFailedEtlAttempt = attempts?.data.some((attempt) => attempt.status === "failed") ?? false
  const qualityCheckReached = activeIndex >= qualityCheckIndex
  const runControlsVisible = !status || !TERMINAL_STATUSES.has(status)

  function isDisplayStageClickable(displayStage: DisplayStageKey) {
    return (
      (displayStage === "advisory" && status === "awaiting_advisory_approval") ||
      (displayStage === "etl" && hasFailedEtlAttempt) ||
      (displayStage === "quality_check" && qualityCheckReached)
    )
  }

  function handleDisplayStageClick(displayStage: DisplayStageKey) {
    if (displayStage === "advisory" && status === "awaiting_advisory_approval") {
      dispatch(openDrawer({ type: "etl-advisory", runId: runId! }))
    } else if (displayStage === "etl" && hasFailedEtlAttempt) {
      dispatch(openDrawer({ type: "etl-failure-analysis", runId: runId! }))
    } else if (displayStage === "quality_check" && qualityCheckReached) {
      dispatch(openDrawer({ type: "quality-check", runId: runId! }))
    }
  }

  const pipelineDiagram = (
    <PipelineFlowRow
      runId={runId}
      sources={sources}
      currentStage={currentStage}
      status={status}
      streaming={streaming}
      isDisplayStageClickable={isDisplayStageClickable}
      onDisplayStageClick={handleDisplayStageClick}
    />
  )

  return (
    <>
    <Card className="relative overflow-hidden">
      <PipelineParticleField active={streaming} density={54} />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2">
          Agent Execution Pipeline
          {streaming ? (
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
          ) : null}
        </CardTitle>
        <PipelineRunControls
          isPaused={isPaused}
          runControlsVisible={runControlsVisible}
          actionBusy={actionBusy}
          onPauseToggle={handlePauseToggle}
          onCancelClick={() => setCancelOpen(true)}
          onFullscreenClick={() => setFullscreenOpen(true)}
        />
      </CardHeader>
      <CardContent className="relative z-10 flex flex-col gap-4">
        {pipelineDiagram}
        <PipelineRunFooter runId={runId} status={status} message={message} />
      </CardContent>
    </Card>

    <PipelineCancelDialog
      open={cancelOpen}
      onOpenChange={setCancelOpen}
      onConfirm={handleCancelConfirm}
      busy={actionBusy}
    />

    <PipelineFullscreenCanvas
      open={fullscreenOpen}
      onOpenChange={setFullscreenOpen}
      runId={runId}
      sources={sources}
      activeIndex={activeIndex}
      status={status}
      streaming={streaming}
      isDisplayStageClickable={isDisplayStageClickable}
      handleDisplayStageClick={handleDisplayStageClick}
    />
    </>
  )
}
