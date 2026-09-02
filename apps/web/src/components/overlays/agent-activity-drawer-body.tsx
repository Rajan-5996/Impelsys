import { useEffect } from "react"
import { CheckIcon } from "lucide-react"

import {
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"

import { EmptyState } from "@/components/empty-state"
import {
  fetchAgentActivity,
  selectAgentActivity,
  selectAgents,
} from "@/store/agents-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

export function AgentActivityDrawerBody({ agentId }: { agentId: string }) {
  const dispatch = useAppDispatch()
  const agent = useAppSelector(selectAgents).find((item) => item.id === agentId)
  const activity = useAppSelector(selectAgentActivity(agentId))

  useEffect(() => {
    dispatch(fetchAgentActivity(agentId))
  }, [dispatch, agentId])

  if (!agent) return null

  const timeline = activity?.timeline ?? []
  const activeIndex = timeline.findIndex((step) => step.status === "active")

  return (
    <SheetContent className="data-[side=right]:sm:max-w-lg">
      <SheetHeader>
        <SheetTitle>{agent.name} Activity</SheetTitle>
      </SheetHeader>
      <div className="flex flex-col gap-1 px-8 pb-8">
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          {agent.currentTask}
        </p>
        {activity?.status === "loading" ? (
          <div className="h-24 animate-pulse rounded-md bg-muted/40" />
        ) : activity?.status === "failed" ? (
          <EmptyState message={activity.error ?? "Failed to load activity."} />
        ) : timeline.length === 0 ? (
          <EmptyState message="No activity recorded for this agent." />
        ) : (
          <div className="relative pl-7">
            <div className="absolute top-1.5 bottom-1.5 left-4 w-px bg-border" />
            {timeline.map((item, index) => {
              const isDone = item.status === "done"
              const isActive = item.status === "active"
              return (
                <div key={`${item.step}-${index}`} className="relative pb-8 last:pb-0">
                  <span
                    className={cn(
                      "absolute -left-7 flex size-6 items-center justify-center rounded-full border-2 border-background",
                      isDone && "bg-status-good",
                      isActive && "bg-primary",
                      !isDone && !isActive && "bg-muted"
                    )}
                  >
                    {isDone ? <CheckIcon className="size-4 text-white" /> : null}
                  </span>
                  <p
                    className={cn(
                      "text-[12px] font-semibold",
                      isDone || isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {item.step}
                  </p>
                </div>
              )
            })}
          </div>
        )}
        {activeIndex >= 0 ? (
          <p className="mt-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
            Progress is paused at "{timeline[activeIndex]?.step}" pending human review.
          </p>
        ) : null}
      </div>
    </SheetContent>
  )
}
