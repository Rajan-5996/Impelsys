import { CheckIcon, LoaderCircleIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { EXECUTION_STEPS } from "@/pages/incidents/execution-steps"

type ExecutionLogProps = {
  completedCount: number
}

export function ExecutionLog({ completedCount }: ExecutionLogProps) {
  return (
    <div className="border border-border p-3.5">
      {EXECUTION_STEPS.map((step, index) => {
        const isDone = index < completedCount
        const isActive = index === completedCount
        const isFinal = index === EXECUTION_STEPS.length - 1

        return (
          <div
            key={step}
            className={cn(
              "flex items-center gap-2.5 py-1.5",
              isFinal && isDone && "font-bold text-foreground"
            )}
          >
            <span
              className={cn(
                "flex size-4.5 shrink-0 items-center justify-center rounded-full border-2 border-border",
                isDone && "border-status-good bg-status-good",
                isActive && "border-status-info"
              )}
            >
              {isDone ? <CheckIcon className="size-2.5 text-white" /> : null}
              {isActive ? (
                <LoaderCircleIcon className="size-2.5 animate-spin text-status-info" />
              ) : null}
            </span>
            <span
              className={cn(
                "text-[12px]",
                isDone ? "text-foreground" : "text-muted-foreground",
                isActive && "text-status-info"
              )}
            >
              {step}
            </span>
          </div>
        )
      })}
    </div>
  )
}
