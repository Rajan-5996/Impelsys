import { useEffect, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import { DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"

import { EmptyState } from "@/components/empty-state"
import { StatusText, type StatusChipVariant } from "@/components/status-chip"
import { humanizeSnake } from "@/lib/format-labels"
import {
  decideAdvisory,
  fetchEtlAdvisory,
  selectEtlAdvisory,
} from "@/store/etl-advisory-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchActiveRun } from "@/store/run-flow-slice"
import { pushToast } from "@/store/ui-slice"

const DECISION_STATUS_VARIANT: Record<string, StatusChipVariant> = {
  approved: "ok",
  pending: "medium",
  rejected: "critical",
}

export function EtlAdvisoryDialogBody({ runId }: { runId: string }) {
  const dispatch = useAppDispatch()
  const advisory = useAppSelector(selectEtlAdvisory(runId))
  const [deciding, setDeciding] = useState(false)

  useEffect(() => {
    dispatch(fetchEtlAdvisory(runId))
  }, [dispatch, runId])

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
      dispatch(fetchActiveRun(runId))
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
          <DialogTitle>Stage 4 Advisory Review</DialogTitle>
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
          <DialogTitle>Stage 4 Advisory Review</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <EmptyState
            message={
              advisory.status === "failed"
                ? (advisory.error ?? "Failed to load advisory review for this run.")
                : "The advisory agent found nothing to flag for this run -- no review needed."
            }
          />
        </div>
      </DialogContent>
    )
  }

  const data = advisory.data

  return (
    <DialogContent size="huge">
      <DialogHeader>
        <DialogTitle>Stage 4 Advisory Review</DialogTitle>
      </DialogHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
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
          The advisory agent found something in the ingested data that could break the ETL
          script or its output validation. Approving resumes the withheld attempt as-is --
          the advisory agent only warns, it never modifies the data.
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

        <div className="border-t border-dashed border-border pt-4">
          <p className="mb-1.5 text-[11px] font-semibold text-foreground">Warnings</p>
          <ul className="list-disc space-y-1.5 pl-4 text-[11.5px] leading-relaxed text-muted-foreground">
            {data.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      </div>
    </DialogContent>
  )
}
