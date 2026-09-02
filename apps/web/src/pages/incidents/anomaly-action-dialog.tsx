import { useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

import { StatusChip } from "@/components/status-chip"
import { ANOMALY_TYPE_LABEL } from "@/lib/anomaly-labels"
import { formatDetailEntries, humanizeSnake } from "@/lib/format-labels"
import { decideAnomaly, type Anomaly } from "@/store/anomalies-slice"
import { useAppDispatch } from "@/store/hooks"
import { pushToast } from "@/store/ui-slice"

export function AnomalyActionDialog({
  anomaly,
  onClose,
  onDecided,
}: {
  anomaly: Anomaly | null
  onClose: () => void
  onDecided: (result: { run_id: string; status: string }) => void
}) {
  const dispatch = useAppDispatch()
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)

  function closeAndReset() {
    setNote("")
    onClose()
  }

  async function submit(approve: boolean) {
    if (!anomaly) return
    setSubmitting(true)
    try {
      const result = await dispatch(
        decideAnomaly({ anomalyId: anomaly.anomaly_id, approve, actor: "operator", note })
      ).unwrap()
      dispatch(pushToast(`Anomaly ${approve ? "approved" : "rejected"}.`, "success"))
      onDecided(result)
      closeAndReset()
    } catch (error) {
      dispatch(pushToast(typeof error === "string" ? error : "Decision failed.", "warn"))
    } finally {
      setSubmitting(false)
    }
  }

  const isPending = anomaly?.status === "pending"

  return (
    <Dialog open={anomaly !== null} onOpenChange={(open) => !open && closeAndReset()}>
      <DialogContent size="narrow">
        <DialogHeader>
          <DialogTitle>
            {anomaly ? ANOMALY_TYPE_LABEL[anomaly.anomaly_type] ?? anomaly.anomaly_type : "Anomaly"}
          </DialogTitle>
        </DialogHeader>
        {anomaly ? (
          <div className="flex flex-col gap-3 p-5">
            <p className="text-xs text-muted-foreground">
              {formatDetailEntries(anomaly.details)}
            </p>
            {isPending ? (
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Note (optional)
                </span>
                <Input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add a note for the audit trail"
                />
              </label>
            ) : (
              <div className="flex flex-col gap-1.5">
                <StatusChip
                  variant={anomaly.status === "approved" ? "ok" : "critical"}
                  className="w-fit"
                >
                  {humanizeSnake(anomaly.status)}
                </StatusChip>
                {anomaly.decision_note ? (
                  <p className="text-[11px] text-muted-foreground">
                    Note from {anomaly.decided_by}: &ldquo;{anomaly.decision_note}&rdquo;
                  </p>
                ) : null}
              </div>
            )}
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={closeAndReset} disabled={submitting}>
            Cancel
          </Button>
          {isPending ? (
            <>
              <Button variant="destructive" onClick={() => submit(false)} disabled={submitting}>
                Reject
              </Button>
              <Button onClick={() => submit(true)} disabled={submitting}>
                Approve
              </Button>
            </>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
