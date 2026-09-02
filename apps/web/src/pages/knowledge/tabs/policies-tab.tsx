import { useEffect } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { EmptyState } from "@/components/empty-state"
import { PolicyCard } from "@/components/knowledge-cards"
import { setGovernanceMode } from "@/store/agents-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchPolicies, fetchPolicyById, selectPolicies } from "@/store/knowledge-slice"
import { pushToast } from "@/store/ui-slice"

const MODES = ["Human Approval Required", "Observe Only", "Policy-Controlled Autonomous"]

const POLICY_OWNER: Record<string, string> = {
  "DQ-POL-017": "AGENT-ETL",
  "DQ-POL-018": "AGENT-ETL",
  "DQ-POL-019": "AGENT-ETL",
}

export function PoliciesTab() {
  const dispatch = useAppDispatch()
  const { data: policies, status, error } = useAppSelector(selectPolicies)

  useEffect(() => {
    dispatch(fetchPolicies())
  }, [dispatch])

  if (status === "failed") {
    return <EmptyState message={error ?? "Failed to load policies."} />
  }

  if (status === "loading" || status === "idle") {
    return <div className="h-64 animate-pulse rounded-md bg-muted/40" />
  }

  async function handleModeChange(policyId: string, mode: string) {
    const agentId = POLICY_OWNER[policyId]
    try {
      await dispatch(
        setGovernanceMode({ agentId, policyId, mode })
      ).unwrap()
      dispatch(pushToast(`${policyId} governance mode updated`, "success"))
      dispatch(fetchPolicyById(policyId))
    } catch {
      dispatch(pushToast(`Failed to update ${policyId}'s governance mode`, "warn"))
    }
  }

  return (
    <div className="flex flex-col">
      {policies.map((policy) => {
        const agentId = POLICY_OWNER[policy.id]
        return (
          <PolicyCard
            key={policy.id}
            policy={policy}
            footer={
              agentId ? (
                <div className="mt-3 flex items-center gap-2 border-t border-border pt-2.5">
                  <span className="text-[10.5px] font-semibold text-muted-foreground">
                    Change mode ({agentId}):
                  </span>
                  <Select
                    value={policy.approvalMode}
                    onValueChange={(mode) => handleModeChange(policy.id, mode ?? policy.approvalMode)}
                  >
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODES.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {mode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null
            }
          />
        )
      })}
    </div>
  )
}
