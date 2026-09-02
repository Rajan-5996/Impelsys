import { Breadcrumbs } from "@/components/breadcrumbs"
import { AgentWorkspaceCard } from "@/pages/agents/agent-workspace-card"
import { AGENTS } from "@/data/agents"

export function AgentWorkspacePage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Breadcrumbs trail={[{ label: "Agent Workspace" }]} />
        <h1 className="mt-1 text-lg font-semibold text-foreground">
          Agent Workspace
        </h1>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          {AGENTS.length} autonomous agents operating across supplier intake,
          pipeline remediation, and data quality
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {AGENTS.map((agent) => (
          <AgentWorkspaceCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  )
}
