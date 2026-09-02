import { useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

import { ETL_INCIDENT } from "@/data/incidents"
import { useAppDispatch } from "@/store/hooks"
import { closeModal, pushToast } from "@/store/ui-slice"

export function ModifyActionModalBody() {
  const dispatch = useAppDispatch()
  const [table, setTable] = useState("CUSTOMER_VALIDATION_EXCEPTION")
  const [note, setNote] = useState("")

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Modify Recommended Action</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4 p-5">
        <p className="text-xs text-muted-foreground">
          Adjust the remediation for {ETL_INCIDENT.affected} records failing{" "}
          {ETL_INCIDENT.error} before approving.
        </p>
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Quarantine table
          </span>
          <Input value={table} onChange={(event) => setTable(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Reviewer note
          </span>
          <Input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional note for the audit trail"
          />
        </label>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => dispatch(closeModal())}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            dispatch(pushToast("Action updated for this approval.", "info"))
            dispatch(closeModal())
          }}
        >
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
