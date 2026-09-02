import { motion } from "framer-motion"
import { AlertTriangleIcon, CheckIcon, CircleIcon, Loader2Icon, XIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

export type StageNodeState = "done" | "active" | "in-progress" | "paused" | "failed" | "pending"

const NODE_STYLE: Record<StageNodeState, string> = {
  done: "border-status-good bg-status-good/15 text-status-good-ink",
  active: "border-primary bg-primary/15 text-primary",
  "in-progress": "border-primary bg-primary/15 text-primary",
  paused: "border-status-warning bg-status-warning/15 text-status-warning-foreground",
  failed: "border-status-critical bg-status-critical/15 text-status-critical-ink",
  pending: "border-border bg-muted/30 text-muted-foreground",
}

function NodeIcon({ state }: { state: StageNodeState }) {
  if (state === "done") return <CheckIcon className="size-4" />
  if (state === "active") return <Loader2Icon className="size-4 animate-spin" />
  if (state === "in-progress") return <CircleIcon className="size-4 fill-current" />
  if (state === "paused") return <AlertTriangleIcon className="size-4" />
  if (state === "failed") return <XIcon className="size-4" />
  return <CircleIcon className="size-2.5" />
}

function Connector({ lit, flowing }: { lit: boolean; flowing: boolean }) {
  return (
    <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-muted/40">
      {lit ? <div className="absolute inset-0 rounded-full bg-status-good" /> : null}
      {flowing ? (
        <motion.div
          className="absolute inset-y-0 w-1/3 rounded-full bg-primary"
          initial={{ left: "-33%" }}
          animate={{ left: ["-33%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut" }}
        />
      ) : null}
    </div>
  )
}

/** A generic, animated horizontal stage-progress row -- reused by the smart_etl
 * run flow and the QA agent analysis flow, parameterized by each domain's own
 * stage list, labels, and per-node visual-state function. */
export function StageFlow<T extends string>({
  stages,
  labels,
  activeIndex,
  nodeState,
}: {
  stages: T[]
  labels: Record<T, string>
  activeIndex: number
  nodeState: (stage: T, index: number) => StageNodeState
}) {
  return (
    <div className="flex items-center">
      {stages.map((stageKey, index) => {
        const state = nodeState(stageKey, index)
        return (
          <div key={stageKey} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={state === "active" ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={
                  state === "active" ? { repeat: Infinity, duration: 1.6, ease: "easeInOut" } : undefined
                }
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border-2",
                  NODE_STYLE[state]
                )}
              >
                <NodeIcon state={state} />
              </motion.div>
              <span className="w-20 text-center text-[9.5px] font-semibold text-muted-foreground">
                {labels[stageKey]}
              </span>
            </div>
            {index < stages.length - 1 ? (
              <Connector lit={index < activeIndex} flowing={index === activeIndex - 1} />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
