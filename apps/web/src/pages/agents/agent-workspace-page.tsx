import { useEffect } from "react"

import { EmptyState } from "@/components/empty-state"
import { AgentWorkspaceCard } from "@/pages/agents/agent-workspace-card"
import { fetchAgents, selectAgents, selectAgentsError, selectAgentsStatus } from "@/store/agents-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

export function AgentWorkspacePage() {
  const dispatch = useAppDispatch()
  const agents = useAppSelector(selectAgents)
  const status = useAppSelector(selectAgentsStatus)
  const error = useAppSelector(selectAgentsError)

  useEffect(() => {
    dispatch(fetchAgents())
  }, [dispatch])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="mt-1 text-lg font-semibold text-foreground">
          Agent Workspace
        </h1>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          {agents.length > 0 ? `${agents.length} autonomous agents` : "Autonomous agents"}{" "}
          operating across supplier intake, pipeline remediation, and data quality
        </p>
      </div>

      {status === "failed" ? (
        <EmptyState message={error ?? "Failed to load agents."} />
      ) : status === "loading" || status === "idle" ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-[360px] animate-pulse rounded-md bg-muted/40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentWorkspaceCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  )
}
