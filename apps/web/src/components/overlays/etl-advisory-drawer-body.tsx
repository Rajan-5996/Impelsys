import { useEffect, useState } from "react"
import { AlertTriangleIcon, Loader2Icon, PauseIcon, PlayIcon, XIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"

import { EmptyState } from "@/components/empty-state"
import { StatusText, type StatusChipVariant } from "@/components/status-chip"
import { humanizeSnake } from "@/lib/format-labels"
import { PipelineCancelDialog } from "@/pages/pipeline/pipeline-run-flow-overlays"
import {
  decideAdvisory,
  fetchEtlAdvisory,
  selectEtlAdvisory,
} from "@/store/etl-advisory-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { cancelRun, fetchActiveRun, pauseRun, resumeRun } from "@/store/run-flow-slice"
import { closeDrawer, pushToast } from "@/store/ui-slice"

const DECISION_STATUS_VARIANT: Record<string, StatusChipVariant> = {
  approved: "ok",
  pending: "medium",
  rejected: "critical",
}

export function EtlAdvisoryDialogBody({ runId }: { runId: string }) {
  const dispatch = useAppDispatch()
  const advisory = useAppSelector(selectEtlAdvisory(runId))
  const [deciding, setDeciding] = useState(false)
  const [runActionBusy, setRunActionBusy] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchEtlAdvisory(runId))
  }, [dispatch, runId])

  async function handlePauseToggle() {
    setRunActionBusy(true)
    try {
      if (isPaused) {
        await dispatch(resumeRun({ runId })).unwrap()
        setIsPaused(false)
        dispatch(pushToast("Run resumed.", "success"))
      } else {
        await dispatch(pauseRun({ runId })).unwrap()
        setIsPaused(true)
        dispatch(pushToast("Pause requested -- takes effect after the current stage.", "info"))
      }
      dispatch(fetchActiveRun(runId))
    } catch (error) {
      dispatch(pushToast(typeof error === "string" ? error : "Action failed.", "warn"))
    } finally {
      setRunActionBusy(false)
    }
  }

  async function handleCancelConfirm() {
    setRunActionBusy(true)
    try {
      await dispatch(cancelRun({ runId })).unwrap()
      dispatch(pushToast("Run cancelled.", "success"))
      dispatch(fetchActiveRun(runId))
      dispatch(closeDrawer())
    } catch (error) {
      dispatch(pushToast(typeof error === "string" ? error : "Cancel failed.", "warn"))
    } finally {
      setRunActionBusy(false)
      setCancelOpen(false)
    }
  }

  async function handleDecide(approve: boolean) {
    setDeciding(true)
    try {
      await dispatch(decideAdvisory({ runId, approve, actor: "operator" })).unwrap()
      dispatch(
        pushToast(
          approve
            ? "Advisory approved -- ETL will resume as-is."
            : "Advisory rejected -- run halted.",
          approve ? "success" : "warn"
        )
      )
      // Await the refetch before closing -- closing right away used to leave
      // the page behind this dialog showing stale data for the few seconds
      // the refetch took (same bug fixed in etl-retry-drawer-body.tsx).
      await dispatch(fetchActiveRun(runId))
      if (approve) dispatch(closeDrawer())
    } catch (error) {
      dispatch(pushToast(typeof error === "string" ? error : "Failed to submit decision.", "warn"))
    } finally {
      setDeciding(false)
    }
  }

  if (!advisory || advisory.status === "loading" || advisory.status === "idle") {
    return (
      <DialogContent size="huge">
        <DialogHeader>
          <DialogTitle>PreFlight Agent Review</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 p-6">
          <div className="h-24 animate-pulse rounded-md bg-muted/40" />
          <div className="h-32 animate-pulse rounded-md bg-muted/40" />
        </div>
      </DialogContent>
    )
  }

  if (advisory.status === "failed" || !advisory.data || !advisory.data.exists) {
    return (
      <DialogContent size="huge">
        <DialogHeader>
          <DialogTitle>PreFlight Agent Review</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <EmptyState
            message={
              advisory.status === "failed"
                ? (advisory.error ?? "Failed to load advisory review for this run.")
                : "PreFlight Agent didn't find anything to flag for this run -- no review needed."
            }
          />
        </div>
      </DialogContent>
    )
  }

  const data = advisory.data

  return (
    <DialogContent size="huge" showCloseButton={!deciding}>
      <DialogHeader className="flex-row items-center justify-between">
        <DialogTitle>PreFlight Agent Review</DialogTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="xs" onClick={handlePauseToggle} disabled={runActionBusy || deciding}>
            {isPaused ? <PlayIcon /> : <PauseIcon />}
            {isPaused ? "Continue" : "Pause"}
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => setCancelOpen(true)}
            disabled={runActionBusy || deciding}
            className="border-0 text-status-critical-foreground hover:brightness-110"
            style={{
              background:
                "linear-gradient(135deg, var(--color-status-critical), color-mix(in oklab, var(--color-status-critical) 65%, black))",
            }}
          >
            <XIcon />
            Cancel
          </Button>
        </div>
      </DialogHeader>
      <div className="relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
        {deciding && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-card/85 backdrop-blur-xs">
            <Loader2Icon className="size-6 animate-spin text-primary" />
            <p className="text-xs font-medium text-muted-foreground">Submitting your decision and refreshing this run...</p>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <span className="text-[11.5px] font-semibold text-foreground">{runId}</span>
          <div className="flex flex-wrap items-center gap-2">
            <StatusText variant={DECISION_STATUS_VARIANT[data.status] ?? "medium"}>
              {humanizeSnake(data.status)}
            </StatusText>
            <span className="text-border">&middot;</span>
            <span className="text-[11px] text-muted-foreground">
              ETL attempt #{data.attempt_number}
            </span>
          </div>
        </div>

        <p className="text-[10.5px] leading-relaxed text-muted-foreground">
          PreFlight Agent spotted something in the incoming data that could break this run
          or its output. Approving lets the run continue as-is -- PreFlight Agent only
          warns you here, it never changes the data itself.
        </p>

        {data.status === "pending" ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-status-warning/25 bg-status-warning/10 p-3">
            <p className="text-[11px] text-muted-foreground">
              This run is paused awaiting your decision on the warnings below.
            </p>
            <div className="flex shrink-0 gap-2">
              <Button size="xs" onClick={() => handleDecide(true)} disabled={deciding}>
                Approve
              </Button>
              <Button
                size="xs"
                variant="destructive"
                onClick={() => handleDecide(false)}
                disabled={deciding}
              >
                Reject
              </Button>
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-status-warning/30 bg-status-warning/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-status-warning/20 text-status-warning-foreground">
              <AlertTriangleIcon className="size-3.5" />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground">Warnings</p>
          </div>
          <ul className="list-disc space-y-1.5 pl-4 text-[11.5px] leading-relaxed text-muted-foreground">
            {data.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      </div>
      <PipelineCancelDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancelConfirm}
        busy={runActionBusy}
      />
    </DialogContent>
  )
}
