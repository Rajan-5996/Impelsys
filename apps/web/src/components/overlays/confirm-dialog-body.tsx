import { Button } from "@workspace/ui/components/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { ETL_INCIDENT, NORTHSTAR_INCIDENT } from "@/data/incidents"
import { useAppDispatch } from "@/store/hooks"
import { addAuditEntry } from "@/store/audit-slice"
import {
  acknowledgeNorthstar,
  rejectEtl,
  rejectNorthstar,
} from "@/store/incidents-slice"
import { addKbArticle } from "@/store/knowledge-slice"
import { closeModal, pushToast, type ModalDescriptor } from "@/store/ui-slice"

type ConfirmAction = Extract<ModalDescriptor, { type: "confirm" }>["action"]

function nowTimestamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ")
}

const CONFIG: Record<
  ConfirmAction,
  { title: string; description: string; confirmLabel: string }
> = {
  "acknowledge-northstar": {
    title: "Notify NorthStar Data",
    description: NORTHSTAR_INCIDENT.action,
    confirmLabel: "Send Notification",
  },
  "reject-northstar": {
    title: "Reject Recommendation",
    description:
      "This will reject the agent's recommended action for the NorthStar Data incident and log the decision.",
    confirmLabel: "Reject Recommendation",
  },
  "reject-etl": {
    title: "Reject Recommendation",
    description:
      "This will reject the agent's recommended quarantine-and-continue action for INC-2026-0901-02.",
    confirmLabel: "Reject Recommendation",
  },
}

export function ConfirmDialogBody({ action }: { action: ConfirmAction }) {
  const dispatch = useAppDispatch()
  const config = CONFIG[action]

  function handleConfirm() {
    const ts = nowTimestamp()

    if (action === "acknowledge-northstar") {
      dispatch(acknowledgeNorthstar())
      dispatch(
        addAuditEntry({
          id: `audit-${Date.now()}`,
          ts,
          agent: NORTHSTAR_INCIDENT.agent,
          action: "Vendor notification",
          incident: NORTHSTAR_INCIDENT.id,
          supplier: NORTHSTAR_INCIDENT.supplier,
          policy: "DQ-POL-004",
          mode: "Human Approval Required",
          approver: "Siva Ram Murugan",
          decision: "Approved",
          result: "Vendor notified, awaiting re-delivery",
          evidence: "Volume deviation of -78.6 percent against the 90-day model",
          reco: NORTHSTAR_INCIDENT.action,
          env: "Production",
        })
      )
      dispatch(
        addKbArticle({
          id: NORTHSTAR_INCIDENT.id,
          type: "ServiceNow Incident",
          title: `SALES_DAILY_ETL, volume anomaly, ${NORTHSTAR_INCIDENT.supplier}`,
          when: "Today",
          tag: "Acknowledged",
        })
      )
      dispatch(pushToast("NorthStar Data has been notified.", "success"))
    }

    if (action === "reject-northstar") {
      dispatch(rejectNorthstar())
      dispatch(
        addAuditEntry({
          id: `audit-${Date.now()}`,
          ts,
          agent: NORTHSTAR_INCIDENT.agent,
          action: "Recommendation rejected",
          incident: NORTHSTAR_INCIDENT.id,
          supplier: NORTHSTAR_INCIDENT.supplier,
          policy: "DQ-POL-004",
          mode: "Human Approval Required",
          approver: "Siva Ram Murugan",
          decision: "Pending",
          result: "Recommendation rejected by reviewer",
          evidence: "Volume deviation of -78.6 percent against the 90-day model",
          reco: NORTHSTAR_INCIDENT.action,
          env: "Production",
        })
      )
      dispatch(pushToast("Recommendation rejected.", "warn"))
    }

    if (action === "reject-etl") {
      dispatch(rejectEtl())
      dispatch(
        addAuditEntry({
          id: `audit-${Date.now()}`,
          ts,
          agent: ETL_INCIDENT.agent,
          action: "Recommendation rejected",
          incident: ETL_INCIDENT.id,
          supplier: ETL_INCIDENT.supplier,
          policy: ETL_INCIDENT.policy,
          mode: "Human Approval Required",
          approver: "Siva Ram Murugan",
          decision: "Pending",
          result: "Recommendation rejected by reviewer",
          evidence: `${ETL_INCIDENT.affected} records failing ${ETL_INCIDENT.error}`,
          reco: ETL_INCIDENT.recommendation,
          env: "Production",
        })
      )
      dispatch(pushToast("Recommendation rejected.", "warn"))
    }

    dispatch(closeModal())
  }

  return (
    <DialogContent size="narrow">
      <DialogHeader>
        <DialogTitle>{config.title}</DialogTitle>
      </DialogHeader>
      <div className="p-5">
        <DialogDescription>{config.description}</DialogDescription>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => dispatch(closeModal())}>
          Cancel
        </Button>
        <Button onClick={handleConfirm}>{config.confirmLabel}</Button>
      </DialogFooter>
    </DialogContent>
  )
}
