import { matchPath, useLocation } from "react-router-dom"
import { CheckIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { LIFECYCLE_STEPS, ROUTE_LIFECYCLE_STEP, ROUTES } from "@/constants/routes"
import type { LifecycleFlowStep } from "@/data/command-center"

function useCurrentLifecycleStep() {
  const location = useLocation()
  const matchedPath = Object.values(ROUTES).find((path) =>
    matchPath(path, location.pathname)
  )
  if (!matchedPath) return null
  return ROUTE_LIFECYCLE_STEP[matchedPath] ?? null
}

export function LifecycleStepper() {
  const currentStep = useCurrentLifecycleStep()
  if (!currentStep) return null

  const currentIndex = LIFECYCLE_STEPS.indexOf(currentStep)

  return (
    <div className="flex items-center gap-0 border-b border-border bg-card px-5 py-1.5">
      <span className="mr-3.5 border-r border-border pr-3.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
        Core Journey
      </span>
      {LIFECYCLE_STEPS.map((step, index) => {
        const isDone = index < currentIndex
        const isActive = index === currentIndex
        return (
          <span key={step} className="flex items-center">
            <span
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] font-bold tracking-wide uppercase",
                isActive && "text-primary",
                isDone && "text-status-good-ink",
                !isActive && !isDone && "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full bg-muted text-[9.5px] font-bold text-muted-foreground",
                  isActive && "bg-primary text-primary-foreground",
                  isDone && "bg-status-good text-status-good-foreground"
                )}
              >
                {isDone ? <CheckIcon className="size-2.5" /> : index + 1}
              </span>
              {step}
            </span>
            {index < LIFECYCLE_STEPS.length - 1 ? (
              <span className="mx-0.5 text-border">&rarr;</span>
            ) : null}
          </span>
        )
      })}
    </div>
  )
}

type LifecycleFlowDiagramProps = {
  steps: LifecycleFlowStep[]
}

const STAGE_INTERVAL_S = 0.9
const PARTICLE_COUNT = 3
const PARTICLE_GAP_S = 0.5
const PARTICLE_DURATION_S = 2

export function LifecycleFlowDiagram({ steps }: LifecycleFlowDiagramProps) {
  const cycleDuration = steps.length * STAGE_INTERVAL_S

  return (
    <div className="flex w-full items-stretch gap-2.5 py-1.5">
      {steps.map((step, index) => (
        <div
          key={step.label}
          className="relative min-w-0 flex-1 border border-border px-1 py-3 text-center"
          style={{
            animation: `stage-pulse ${cycleDuration}s ease-in-out infinite`,
            animationDelay: `${index * STAGE_INTERVAL_S}s`,
          }}
        >
          <p className="truncate text-[10.5px] font-bold text-foreground">
            {step.count}
          </p>
          <p className="truncate text-[10.5px] font-semibold text-foreground">
            {step.label}
          </p>
          <p className="truncate text-[9.5px] text-muted-foreground">
            {step.unit}
          </p>
          {index < steps.length - 1 ? (
            <span
              aria-hidden
              className="absolute top-1/2 -right-2.5 z-10 h-2.5 w-2.5 -translate-y-1/2"
            >
              {Array.from({ length: PARTICLE_COUNT }).map((_, particleIndex) => (
                <span
                  key={particleIndex}
                  className="absolute top-1/2 left-0 size-[3px] -translate-y-1/2 rounded-full bg-status-info"
                  style={{
                    animation: `flow-particle ${PARTICLE_DURATION_S}s linear infinite`,
                    animationDelay: `${particleIndex * PARTICLE_GAP_S}s`,
                  }}
                />
              ))}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}
