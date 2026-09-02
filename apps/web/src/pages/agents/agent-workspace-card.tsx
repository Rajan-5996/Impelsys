import { CpuIcon, EyeIcon, ServerIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import type { Agent } from "@/store/agents-slice"
import { useAppDispatch } from "@/store/hooks"
import { openDrawer } from "@/store/ui-slice"

const GOV_VARIANT: Record<string, StatusChipVariant> = {
  "Human Approval Required": "medium",
  "Observe Only": "neutral",
  "Policy-Controlled Autonomous": "ok",
}

const AGENT_ICON: Record<string, typeof ServerIcon> = {
  "AGENT-INTAKE": ServerIcon,
  "AGENT-ETL": CpuIcon,
  "AGENT-DQ": EyeIcon,
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string
  value: string | number
  tone?: "warn"
}) {
  return (
    <div
      className={cn(
        "border border-border p-2.5 text-center",
        tone === "warn" && "border-warning/40 bg-warning/10"
      )}
    >
      <p
        className={cn(
          "text-base font-bold text-foreground",
          tone === "warn" && "text-warning-foreground"
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
    </div>
  )
}

export function AgentWorkspaceCard({ agent }: { agent: Agent }) {
  const dispatch = useAppDispatch()
  const Icon = AGENT_ICON[agent.id] ?? EyeIcon

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-start">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <div>
            <p className="text-[13px] font-bold text-foreground">{agent.name}</p>
            <p className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
              <span
                className={cn(
                  "size-1.5 rounded-full bg-status-good",
                  agent.status === "Active" && "animate-pulse"
                )}
              />
              {agent.status}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="text-[11.5px] text-muted-foreground">{agent.scope}</p>
        <div>
          <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
            Current Task
          </p>
          <p className="mt-0.5 text-[12px] text-foreground">{agent.currentTask}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatTile label="Actions Today" value={agent.actionsToday} />
          <StatTile label="Success Rate" value={`${Math.round(agent.successRate * 100)}%`} />
          <StatTile label="Avg Resolution" value={`${agent.avgResolutionTimeMinutes} min`} />
          <StatTile
            label="Awaiting Approval"
            value={agent.awaitingApproval}
            tone={agent.awaitingApproval > 0 ? "warn" : undefined}
          />
        </div>
        <StatusChip variant={GOV_VARIANT[agent.governanceMode] ?? "ok"}>
          {agent.governanceMode}
        </StatusChip>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() =>
            dispatch(openDrawer({ type: "agent-activity", agentId: agent.id }))
          }
        >
          View Agent Activity
        </Button>
      </CardFooter>
    </Card>
  )
}
