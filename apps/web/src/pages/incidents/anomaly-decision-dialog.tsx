import { useState } from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

import { decideAnomaly } from "@/store/anomalies-slice"
import { useAppDispatch } from "@/store/hooks"
import { pushToast } from "@/store/ui-slice"

export type PendingDecision = { anomalyId: string; approve: boolean }

export function AnomalyDecisionDialog({
  decision,
  onClose,
  onDecided,
}: {
  decision: PendingDecision | null
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

  async function handleSubmit() {
    if (!decision) return
    setSubmitting(true)
    try {
      const result = await dispatch(
        decideAnomaly({
          anomalyId: decision.anomalyId,
          approve: decision.approve,
          actor: "operator",
          note,
        })
      ).unwrap()
      dispatch(
        pushToast(
          `Anomaly ${decision.approve ? "approved" : "rejected"}.`,
          "success"
        )
      )
      onDecided(result)
      closeAndReset()
    } catch (error) {
      dispatch(pushToast(typeof error === "string" ? error : "Decision failed.", "warn"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={decision !== null} onOpenChange={(open) => !open && closeAndReset()}>
      <DialogContent size="narrow">
        <DialogHeader>
          <DialogTitle>{decision?.approve ? "Approve Anomaly" : "Reject Anomaly"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 p-5">
          <p className="text-xs text-muted-foreground">
            {decision?.approve
              ? "This clears the anomaly and lets the run continue once every pending anomaly is resolved."
              : "This halts the run at anomaly detection until it is manually restarted."}
          </p>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeAndReset} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2Icon className="animate-spin" />
                {decision?.approve ? "Approving..." : "Rejecting..."}
              </>
            ) : decision?.approve ? (
              "Approve"
            ) : (
              "Reject"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
