import { useEffect } from "react"
import { Link } from "react-router-dom"
import { FileIcon, Maximize2Icon, PauseIcon, PlayIcon, XIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { CardAction } from "@workspace/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { PipelineCanvas, type CanvasNode } from "@/components/pipeline-canvas"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { runDetailPath } from "@/constants/routes"
import { runStatusLabel } from "@/lib/format-labels"
import {
  DISPLAY_STAGE_LABELS,
  DISPLAY_STAGE_ORDER,
  displayStageState,
  type DisplayStageKey,
} from "@/lib/stage-visual"
import type { VendorSourceSystem } from "@/lib/vendor-source-labels"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchRunFiles, selectRunFiles } from "@/store/runs-slice"

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

export function PipelineRunFooter({
  runId,
  status,
  message,
}: {
  runId: string
  status: string | null
  message: string | null
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-border pt-3">
      <Link
        to={runDetailPath(runId)}
        className="text-[11px] font-semibold text-status-info underline underline-offset-2 hover:text-status-info/80"
      >
        {runId}
      </Link>
      {status ? (
        <StatusChip variant={STATUS_VARIANT[status] ?? "medium"}>{runStatusLabel(status)}</StatusChip>
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
  )
}

export function PipelineRunControls({
  isPaused,
  runControlsVisible,
  actionBusy,
  onPauseToggle,
  onCancelClick,
  onFullscreenClick,
}: {
  isPaused: boolean
  runControlsVisible: boolean
  actionBusy: boolean
  onPauseToggle: () => void
  onCancelClick: () => void
  onFullscreenClick: () => void
}) {
  return (
    <CardAction className="flex items-center gap-2">
      <Button variant="outline" size="icon-xs" onClick={onFullscreenClick}>
        <Maximize2Icon />
      </Button>
      {runControlsVisible ? (
        <>
          <Button variant="outline" size="xs" onClick={onPauseToggle} disabled={actionBusy}>
            {isPaused ? <PlayIcon /> : <PauseIcon />}
            {isPaused ? "Continue" : "Pause"}
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={onCancelClick}
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
        </>
      ) : null}
    </CardAction>
  )
}

export function PipelineCancelDialog({
  open,
  onOpenChange,
  onConfirm,
  busy,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  busy: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Keep Running
          </Button>
          <Button
            onClick={onConfirm}
            disabled={busy}
            className="border-0 text-status-critical-foreground hover:brightness-110"
            style={{
              background:
                "linear-gradient(135deg, var(--color-status-critical), color-mix(in oklab, var(--color-status-critical) 65%, black))",
            }}
          >
            {busy ? "Cancelling..." : "Cancel Run"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** The Smart ETL Run Flow card's fullscreen popup -- the same pipeline as a
 * draggable node canvas. Once the run has actually produced output files,
 * "Done" is dropped from the stage row and the files themselves fan out from
 * the last real stage instead. */
export function PipelineFullscreenCanvas({
  open,
  onOpenChange,
  runId,
  sources,
  activeIndex,
  status,
  streaming,
  isDisplayStageClickable,
  handleDisplayStageClick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  runId: string
  sources: VendorSourceSystem[]
  activeIndex: number
  status: string | null
  streaming: boolean
  isDisplayStageClickable: (stage: DisplayStageKey) => boolean
  handleDisplayStageClick: (stage: DisplayStageKey) => void
}) {
  const dispatch = useAppDispatch()
  const files = useAppSelector(selectRunFiles(runId))

  useEffect(() => {
    dispatch(fetchRunFiles(runId))
  }, [dispatch, runId])

  const canvasConnectors: CanvasNode[] = sources.map((source) => ({
    id: `connector-${source.name}`,
    kind: "connector",
    label: source.name,
    logo: source.logo,
  }))

  const canvasOutputs: CanvasNode[] = (files?.data ?? []).map((file) => ({
    id: `output-${file.filename}`,
    kind: "output",
    label: file.label,
    icon: FileIcon,
  }))

  const displayStages =
    canvasOutputs.length > 0
      ? DISPLAY_STAGE_ORDER.filter((stageKey) => stageKey !== "done")
      : DISPLAY_STAGE_ORDER

  const canvasStages: CanvasNode[] = displayStages.map((stageKey) => {
    const clickable = isDisplayStageClickable(stageKey)
    return {
      id: stageKey,
      kind: "stage",
      label: DISPLAY_STAGE_LABELS[stageKey],
      state: displayStageState(stageKey, activeIndex, status, streaming),
      clickable,
      onClick: () => {
        if (clickable) handleDisplayStageClick(stageKey)
      },
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="huge" className="flex flex-col">
        <DialogHeader>
          <DialogTitle>Smart ETL Run Flow</DialogTitle>
        </DialogHeader>
        <div className="flex flex-1 p-4">
          <PipelineCanvas connectors={canvasConnectors} stages={canvasStages} outputs={canvasOutputs} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
