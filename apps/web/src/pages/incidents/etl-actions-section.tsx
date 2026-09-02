import { useEffect, useRef, useState } from "react"

import { Button } from "@workspace/ui/components/button"

import { ExecutionLog } from "@/pages/incidents/execution-log"
import { EXECUTION_STEPS } from "@/pages/incidents/execution-steps"
import { ETL_INCIDENT } from "@/data/incidents"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { addAuditEntry } from "@/store/audit-slice"
import { approveEtl, selectEtlState } from "@/store/incidents-slice"
import { addKbArticle } from "@/store/knowledge-slice"
import { resolveDownstreamStages } from "@/store/pipeline-slice"
import { openModal, pushToast } from "@/store/ui-slice"

type Phase = "idle" | "confirming" | "running" | "done"

const STEP_DELAY_MS = 420

export function EtlActionsSection() {
  const dispatch = useAppDispatch()
  const etl = useAppSelector(selectEtlState)
  const [phase, setPhase] = useState<Phase>("idle")
  const [completedCount, setCompletedCount] = useState(0)
  const timeoutsRef = useRef<number[]>([])

  useEffect(() => {
    const timeouts = timeoutsRef.current
    return () => {
      timeouts.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  function runExecution() {
    setPhase("running")
    setCompletedCount(0)

    EXECUTION_STEPS.forEach((_, index) => {
      const timeoutId = window.setTimeout(
        () => {
          setCompletedCount(index + 1)
          if (index === EXECUTION_STEPS.length - 1) {
            finalize()
          }
        },
        STEP_DELAY_MS * (index + 1)
      )
      timeoutsRef.current.push(timeoutId)
    })
  }

  function finalize() {
    dispatch(resolveDownstreamStages())
    dispatch(approveEtl())
    dispatch(
      addAuditEntry({
        id: `audit-${Date.now()}`,
        ts: new Date().toISOString().slice(0, 19).replace("T", " "),
        agent: ETL_INCIDENT.agent,
        action: "Quarantine and continue",
        incident: ETL_INCIDENT.id,
        supplier: ETL_INCIDENT.supplier,
        policy: ETL_INCIDENT.policy,
        mode: "Human Approval Required",
        approver: "Siva Ram Murugan",
        decision: "Approved",
        result: "Resolved, zero downstream impact",
        evidence: `${ETL_INCIDENT.affected} records failing ${ETL_INCIDENT.error}`,
        reco: ETL_INCIDENT.recommendation,
        env: "Production",
      })
    )
    dispatch(
      addKbArticle({
        id: ETL_INCIDENT.id,
        type: "ServiceNow Incident",
        title:
          "SALES_DAILY_ETL, Customer Validation failure, CUSTOMER_ID NULL, DataSphere",
        when: "Today",
        tag: "Resolved",
      })
    )
    dispatch(pushToast("SALES_DAILY_ETL resolved, processing resumed.", "success"))
    setPhase("done")
  }

  return (
    <section id="actions" className="scroll-mt-28 border border-border p-4">
      <h2 className="mb-3 text-xs font-bold tracking-wide text-foreground uppercase">
        Actions
      </h2>

      {etl.status === "rejected" ? (
        <p className="border border-status-critical/30 bg-status-critical/10 px-3.5 py-2.5 text-[12px] font-semibold text-status-critical-ink">
          This recommendation was rejected. The incident remains open for
          manual remediation.
        </p>
      ) : null}

      {etl.status === "resolved" || phase === "done" || phase === "running" ? (
        <ExecutionLog completedCount={phase === "running" ? completedCount : EXECUTION_STEPS.length} />
      ) : null}

      {etl.status === "open" && phase === "idle" ? (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setPhase("confirming")}>
            Approve &amp; Execute Remediation
          </Button>
          <Button
            variant="outline"
            onClick={() => dispatch(openModal({ type: "modify-action" }))}
          >
            Modify Action
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              dispatch(pushToast("Escalated to Data Engineering lead.", "info"))
            }
          >
            Escalate
          </Button>
          <Button
            variant="destructive"
            onClick={() => dispatch(openModal({ type: "confirm", action: "reject-etl" }))}
          >
            Reject
          </Button>
        </div>
      ) : null}

      {etl.status === "open" && phase === "confirming" ? (
        <div className="border border-border bg-muted/20 p-3.5">
          <p className="mb-3 text-[12px] text-foreground">
            Quarantine {ETL_INCIDENT.affected.toLocaleString()} records and
            resume processing for {ETL_INCIDENT.valid.toLocaleString()} valid
            records?
          </p>
          <div className="flex gap-2">
            <Button onClick={runExecution}>Confirm &amp; Execute</Button>
            <Button variant="outline" onClick={() => setPhase("idle")}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
