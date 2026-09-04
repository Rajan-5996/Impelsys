import { Fragment, type KeyboardEvent } from "react"
import { motion } from "framer-motion"
import {
  AlertTriangleIcon,
  CircleIcon,
  DatabaseIcon,
  FlagIcon,
  InboxIcon,
  Loader2Icon,
  ScanSearchIcon,
  ShieldCheckIcon,
  SaveIcon,
  SparklesIcon,
  WorkflowIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

export type StageNodeState = "done" | "active" | "in-progress" | "paused" | "failed" | "pending"
export type StageFlowDirection = "horizontal" | "vertical"

const NODE_STYLE: Record<StageNodeState, string> = {
  done: "border-status-good bg-status-good/15 text-status-good-ink",
  active: "border-primary bg-primary/15 text-primary",
  "in-progress": "border-primary bg-primary/15 text-primary",
  paused: "border-status-warning bg-status-warning/15 text-status-warning-foreground",
  failed: "border-status-critical bg-status-critical/15 text-status-critical-ink",
  pending: "border-border bg-muted/30 text-muted-foreground",
}

const STAGE_ICON: Record<string, LucideIcon> = {
  ingestion: InboxIcon,
  anomaly_detection: ScanSearchIcon,
  quality_check: ShieldCheckIcon,
  etl: WorkflowIcon,
  done: FlagIcon,
  validate: ShieldCheckIcon,
  context: DatabaseIcon,
  llm: SparklesIcon,
  persist: SaveIcon,
}

function NodeIcon({ state, stageKey }: { state: StageNodeState; stageKey: string }) {
  if (state === "active") return <Loader2Icon className="size-4 animate-spin" />
  if (state === "paused") return <AlertTriangleIcon className="size-4" />
  if (state === "failed") return <XIcon className="size-4" />
  const StageIcon = STAGE_ICON[stageKey] ?? CircleIcon
  return <StageIcon className="size-4" />
}

const FLOW_PARTICLES = [
  { delay: 0, duration: 1.5, size: "size-1.5" },
  { delay: 0.22, duration: 1.3, size: "size-1" },
  { delay: 0.44, duration: 1.7, size: "size-2" },
  { delay: 0.66, duration: 1.4, size: "size-1" },
  { delay: 0.88, duration: 1.6, size: "size-1.5" },
  { delay: 1.1, duration: 1.35, size: "size-1" },
]

const DRIFT_PARTICLES = [0, 0.9, 1.8]

function Connector({
  lit,
  flowing,
  settled,
  direction = "horizontal",
}: {
  lit: boolean
  flowing: boolean
  settled?: boolean
  direction?: StageFlowDirection
}) {
  const isVertical = direction === "vertical"
  const trackClass = isVertical
    ? "relative w-px flex-1 min-h-10 overflow-visible"
    : "relative h-px flex-1 overflow-visible"
  const driftDotClass = isVertical
    ? "absolute inset-x-0 mx-auto size-1 rounded-full bg-primary/60"
    : "absolute inset-y-0 my-auto size-1 rounded-full bg-primary/60"

  return (
    <div className={trackClass}>
      <div className="absolute inset-0 overflow-hidden rounded-full bg-border">
        {lit && !flowing && !settled
          ? DRIFT_PARTICLES.map((delay) => (
              <motion.span
                key={delay}
                className={driftDotClass}
                initial={isVertical ? { top: "-6%", opacity: 0 } : { left: "-6%", opacity: 0 }}
                animate={
                  isVertical
                    ? { top: ["-6%", "106%"], opacity: [0, 0.9, 0.9, 0] }
                    : { left: ["-6%", "106%"], opacity: [0, 0.9, 0.9, 0] }
                }
                transition={{
                  repeat: Infinity,
                  duration: 3.2,
                  delay,
                  ease: "linear",
                  times: [0, 0.1, 0.9, 1],
                }}
              />
            ))
          : null}
      </div>
      {flowing && !settled
        ? FLOW_PARTICLES.map(({ delay, duration, size }) => (
            <motion.span
              key={delay}
              className={cn(
                "absolute rounded-full bg-primary",
                isVertical ? "inset-x-0 mx-auto" : "inset-y-0 my-auto",
                size
              )}
              style={{ boxShadow: "0 0 3px 0.5px var(--color-primary)" }}
              initial={isVertical ? { top: "-8%", opacity: 0 } : { left: "-8%", opacity: 0 }}
              animate={
                isVertical
                  ? { top: ["-8%", "108%"], opacity: [0, 1, 1, 0] }
                  : { left: ["-8%", "108%"], opacity: [0, 1, 1, 0] }
              }
              transition={{
                repeat: Infinity,
                duration,
                delay,
                ease: "easeInOut",
                times: [0, 0.15, 0.85, 1],
              }}
            />
          ))
        : null}
    </div>
  )
}

function ActiveNodePing({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <motion.span
      className="absolute inset-0 rounded-full bg-primary/60"
      initial={{ opacity: 0.5, scale: 1 }}
      animate={{ opacity: 0, scale: 1.9 }}
      transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }}
    />
  )
}

const SPARK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

function ActiveNodeSparks({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <>
      {SPARK_ANGLES.map((angle) => {
        const rad = (angle * Math.PI) / 180
        const dx = Math.round(Math.cos(rad) * 24)
        const dy = Math.round(Math.sin(rad) * 24)
        return (
          <motion.span
            key={angle}
            className="absolute top-1/2 left-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
            style={{ boxShadow: "0 0 4px 1px var(--color-primary)" }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: [0, dx], y: [0, dy], opacity: [0, 1, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              delay: (angle / 360) * 1.5,
              ease: "easeOut",
            }}
          />
        )
      })}
    </>
  )
}

function StageNode<T extends string>({
  stageKey,
  index,
  state,
  clickable,
  onNodeClick,
}: {
  stageKey: T
  index: number
  state: StageNodeState
  clickable: boolean
  onNodeClick?: (stage: T, index: number) => void
}) {
  return (
    <div className="relative flex size-9 shrink-0 items-center justify-center">
      <ActiveNodeSparks show={state === "active"} />
      <ActiveNodePing show={state === "active"} />
      <motion.div
        animate={
          state === "active" ? { scale: [1, 1, 1.25, 0.88, 1.15, 0.93, 1] } : { scale: 1 }
        }
        transition={
          state === "active"
            ? {
                repeat: Infinity,
                duration: 1.5,
                times: [0, 0.78, 0.84, 0.89, 0.94, 0.98, 1],
                ease: "easeOut",
              }
            : undefined
        }
        className={cn(
          "relative flex size-9 items-center justify-center rounded-full border-2",
          NODE_STYLE[state],
          clickable && "cursor-pointer hover:brightness-95"
        )}
        {...(clickable
          ? {
              role: "button",
              tabIndex: 0,
              onClick: () => onNodeClick?.(stageKey, index),
              onKeyDown: (event: KeyboardEvent) => {
                if (event.key === "Enter" || event.key === " ") onNodeClick?.(stageKey, index)
              },
            }
          : {})}
      >
        <NodeIcon state={state} stageKey={stageKey} />
      </motion.div>
    </div>
  )
}

type StageFlowProps<T extends string> = {
  stages: T[]
  labels: Record<T, string>
  activeIndex: number
  nodeState: (stage: T, index: number) => StageNodeState
  isNodeClickable?: (stage: T, index: number) => boolean
  onNodeClick?: (stage: T, index: number) => void
  direction?: StageFlowDirection
  settled?: boolean
}

/** A generic, animated stage-progress row/column -- reused by the smart_etl
 * run flow and the QA agent analysis flow, parameterized by each domain's own
 * stage list, labels, and per-node visual-state function. */
export function StageFlow<T extends string>({
  stages,
  labels,
  activeIndex,
  nodeState,
  isNodeClickable,
  onNodeClick,
  direction = "horizontal",
  settled = false,
}: StageFlowProps<T>) {
  const isVertical = direction === "vertical"

  if (isVertical) {
    return (
      <div className="flex h-full flex-col">
        {stages.map((stageKey, index) => {
          const state = nodeState(stageKey, index)
          const clickable = isNodeClickable?.(stageKey, index) ?? false
          return (
            <Fragment key={stageKey}>
              <div className="flex shrink-0 items-center gap-3">
                <StageNode
                  stageKey={stageKey}
                  index={index}
                  state={state}
                  clickable={clickable}
                  onNodeClick={onNodeClick}
                />
                <span className="text-[12px] font-semibold text-foreground">{labels[stageKey]}</span>
              </div>
              {index < stages.length - 1 ? (
                <div className="flex w-9 flex-1 flex-col items-center">
                  <Connector
                    lit={index < activeIndex}
                    flowing={index === activeIndex - 1}
                    settled={settled}
                    direction="vertical"
                  />
                </div>
              ) : null}
            </Fragment>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex items-center">
      {stages.map((stageKey, index) => {
        const state = nodeState(stageKey, index)
        const clickable = isNodeClickable?.(stageKey, index) ?? false
        return (
          <div key={stageKey} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <StageNode
                stageKey={stageKey}
                index={index}
                state={state}
                clickable={clickable}
                onNodeClick={onNodeClick}
              />
              <span className="w-max max-w-28 text-center text-[9.5px] font-semibold whitespace-nowrap text-muted-foreground">
                {labels[stageKey]}
              </span>
            </div>
            {index < stages.length - 1 ? (
              <Connector
                lit={index < activeIndex}
                flowing={index === activeIndex - 1}
                settled={settled}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
