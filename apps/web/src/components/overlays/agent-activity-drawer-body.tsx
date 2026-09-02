import { CheckIcon } from "lucide-react"

import {
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"

import { AGENT_ACTIVITY_STEPS, AGENTS } from "@/data/agents"

export function AgentActivityDrawerBody({ agentId }: { agentId: string }) {
  const agent = AGENTS.find((item) => item.id === agentId)
  if (!agent) return null

  const doneCount = agent.awaiting > 0 ? 5 : 8

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>{agent.short} Activity</SheetTitle>
      </SheetHeader>
      <div className="flex flex-col gap-1 px-8 pb-8">
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          {agent.lastAction}
        </p>
        <div className="relative pl-6">
          <div className="absolute top-1.5 bottom-1.5 left-2 w-px bg-border" />
          {AGENT_ACTIVITY_STEPS.map((step, index) => {
            const isDone = index < doneCount
            const isActive = index === doneCount
            return (
              <div key={step} className="relative pb-4 last:pb-0">
                <span
                  className={cn(
                    "absolute -left-6 flex size-4 items-center justify-center rounded-full border-2 border-background",
                    isDone && "bg-status-good",
                    isActive && "bg-primary",
                    !isDone && !isActive && "bg-muted"
                  )}
                >
                  {isDone ? <CheckIcon className="size-2.5 text-white" /> : null}
                </span>
                <p
                  className={cn(
                    "text-[12px] font-semibold",
                    isDone || isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step}
                </p>
              </div>
            )
          })}
        </div>
        {agent.awaiting > 0 ? (
          <p className="mt-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
            Progress is paused at Approval Requested pending human review.
          </p>
        ) : null}
      </div>
    </SheetContent>
  )
}
