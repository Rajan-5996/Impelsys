import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { AGENTS } from "@/data/agents"
import { useAppDispatch } from "@/store/hooks"
import { openDrawer } from "@/store/ui-slice"

export function AgentMiniListSection() {
  const dispatch = useAppDispatch()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active AI Agents</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {AGENTS.map((agent) => (
          <button
            key={agent.id}
            type="button"
            onClick={() =>
              dispatch(openDrawer({ type: "agent-activity", agentId: agent.id }))
            }
            className="block w-full border-b border-border px-4 py-2.5 text-left last:border-b-0 hover:bg-muted/40"
          >
            <span className="flex items-center gap-1.5">
              <span className="relative flex size-1.5 rounded-full bg-status-good">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-status-good opacity-60" />
              </span>
              <span className="text-[12px] font-semibold text-foreground">
                {agent.short}
              </span>
            </span>
            <p className="mt-1 truncate text-[10.5px] text-muted-foreground">
              {agent.task}
            </p>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
