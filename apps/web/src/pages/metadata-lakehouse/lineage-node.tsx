import { motion } from "framer-motion"
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  Code2Icon,
  DatabaseIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  Loader2Icon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import type { LineageNode } from "./lineage-types"

interface LineageNodeProps {
  node: LineageNode
  isHighlighted?: boolean
  isDimmed?: boolean
  isSelected?: boolean
  inPortOffsets?: number[]
  outPortOffsets?: number[]
  onSelectNode: (node: LineageNode) => void
  onHoverStart: (nodeId: string) => void
  onHoverEnd: () => void
}

const BADGE_COLOR_MAP: Record<string, string> = {
  source: "bg-slate-800 text-slate-100 border-slate-700",
  anomaly: "bg-amber-950/80 text-amber-300 border-amber-800/60",
  quality: "bg-purple-950/80 text-purple-300 border-purple-800/60",
  etl: "bg-indigo-950/80 text-indigo-300 border-indigo-800/60",
  powerbi: "bg-emerald-950/80 text-emerald-300 border-emerald-800/60",
}

function getNodeIcon(category: string, status: string) {
  if (status === "running") return <Loader2Icon className="size-3.5 text-primary animate-spin" />
  if (status === "error") return <AlertCircleIcon className="size-3.5 text-status-critical" />
  if (category === "source") return <DatabaseIcon className="size-3.5 text-primary" />
  if (category === "anomaly") return <ShieldAlertIcon className="size-3.5 text-amber-500" />
  if (category === "quality") return <ShieldCheckIcon className="size-3.5 text-purple-400" />
  if (category === "etl") return <Code2Icon className="size-3.5 text-standard" />
  if (category === "powerbi") return <LayoutDashboardIcon className="size-3.5 text-emerald-500" />
  return <SparklesIcon className="size-3.5 text-muted-foreground" />
}

function getCategoryAvatarIcon(category: string) {
  if (category === "anomaly") return <ShieldAlertIcon className="size-4" />
  if (category === "quality") return <ShieldCheckIcon className="size-4" />
  if (category === "etl") return <Code2Icon className="size-4" />
  if (category === "powerbi") return <LayoutDashboardIcon className="size-4" />
  if (category === "source") return <DatabaseIcon className="size-4" />
  return <SparklesIcon className="size-4" />
}

// Centered exactly on the card border (half of size-2.5's 10px = 5px offset)
// so the connecting line's stroke still lands in the right spot -- kept
// invisible (opacity-0) since the dot itself is purely decorative and the
// edge lines already anchor to this same coordinate independently.
const PORT_DOT = "absolute z-10 size-2.5 -translate-y-1/2 rounded-full opacity-0"

const CARD_GRADIENT = "bg-gradient-to-br from-primary/20 via-primary/[0.06] to-card"

function portClass(side: "left" | "right", isSuccess?: boolean, isRunning?: boolean, isHighlighted?: boolean, isError?: boolean) {
  return cn(
    PORT_DOT, side === "left" ? "-left-[5px]" : "-right-[5px]",
    isSuccess && "bg-status-good shadow-[0_0_6px_rgba(12,163,12,0.7)]",
    isRunning && "bg-primary shadow-[0_0_8px_rgba(112,48,177,0.9)] animate-ping",
    isHighlighted && "bg-primary shadow-[0_0_6px_rgba(112,48,177,0.6)]",
    isError && "bg-status-critical shadow-[0_0_6px_rgba(208,59,59,0.6)]"
  )
}

export function LineageNodeComponent({
  node, isHighlighted, isDimmed, isSelected, inPortOffsets, outPortOffsets, onSelectNode, onHoverStart, onHoverEnd,
}: LineageNodeProps) {
  const isError = node.status === "error"
  const isWarning = node.status === "warning"
  const isSuccess = node.status === "success"
  const isRunning = node.status === "running"
  const isQueued = node.status === "queued"
  const isBypassed = node.status === "bypassed"

  const badgeTheme = BADGE_COLOR_MAP[node.category] ?? "bg-card text-foreground"
  const inPorts = inPortOffsets && inPortOffsets.length > 0 ? inPortOffsets : null
  const outPorts = outPortOffsets && outPortOffsets.length > 0 ? outPortOffsets : null

  return (
    <motion.div
      data-lineage-node="true"
      layoutId={`node-card-${node.id}`}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onMouseEnter={() => onHoverStart(node.id)}
      onMouseLeave={onHoverEnd}
      onClick={() => onSelectNode(node)}
      className={cn(
        "group relative flex w-[238px] h-[76px] justify-between cursor-pointer flex-col rounded-xl border p-2.5 shadow-xs backdrop-blur-xs transition-all duration-200",
        !isError && !isWarning && CARD_GRADIENT,
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isRunning && "border-primary shadow-lg shadow-primary/20 ring-1 ring-primary animate-pulse",
        isWarning && "border-amber-500/80 bg-amber-500/10 shadow-amber-500/20 ring-1 ring-amber-500 animate-pulse",
        isSuccess && "border-status-good/50 hover:border-status-good",
        isQueued && "opacity-50 grayscale-[40%] border-border/70",
        isHighlighted && "border-primary shadow-md shadow-primary/10",
        isDimmed && "opacity-30 grayscale-[50%]",
        isError
          ? "border-status-critical/70 bg-status-critical/10 shadow-status-critical/20 ring-1 ring-status-critical"
          : "border-border hover:border-primary/50 hover:shadow-md"
      )}
    >
      {inPorts
        ? inPorts.map((topPx, i) => (
            <span key={`in-${i}`} style={{ top: `${topPx}px` }} className={portClass("left", isSuccess, isRunning, isHighlighted, isError)} />
          ))
        : node.inputPorts.length > 0 ? (
            <span style={{ top: "50%" }} className={portClass("left", isSuccess, isRunning, isHighlighted, isError)} />
          ) : null}

      {outPorts
        ? outPorts.map((topPx, i) => (
            <span key={`out-${i}`} style={{ top: `${topPx}px` }} className={portClass("right", isSuccess, isRunning, isHighlighted, isError)} />
          ))
        : node.outputPorts.length > 0 ? (
            <span style={{ top: "50%" }} className={portClass("right", isSuccess, isRunning, isHighlighted, isError)} />
          ) : null}

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {node.logoSrc ? (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-white/95 p-1 shadow-xs ring-1 ring-black/5">
              <img src={node.logoSrc} alt={node.badgeCode} className="size-5 object-contain" />
            </span>
          ) : (
            <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg border shadow-xs", badgeTheme)}>
              {getCategoryAvatarIcon(node.category)}
            </span>
          )}
          <div className="min-w-0">
            <h4
              className={cn(
                "truncate text-[12.5px] font-semibold text-foreground transition-colors",
                isRunning && "text-primary font-bold",
                isError && "text-status-critical",
                isHighlighted && "text-primary font-bold"
              )}
            >
              {node.title}
            </h4>
            <p className="truncate text-[10px] text-muted-foreground">{node.subtitle}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          {isRunning ? (
            <span className="flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/30">
              <Loader2Icon className="size-3 animate-spin" /> RUNNING
            </span>
          ) : isWarning ? (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30 animate-pulse">
              <ShieldAlertIcon className="size-3" /> ANOMALY
            </span>
          ) : isError ? (
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="flex items-center justify-center rounded-full bg-status-critical/15 p-1 text-status-critical"
            >
              <AlertCircleIcon className="size-3.5" />
            </motion.span>
          ) : isSuccess ? (
            <span className="flex items-center justify-center rounded-full bg-status-good/15 p-1 text-status-good">
              <CheckCircle2Icon className="size-3.5" />
            </span>
          ) : isBypassed ? (
            <span className="flex items-center justify-center rounded-full bg-muted p-1 text-muted-foreground">
              <HelpCircleIcon className="size-3.5" />
            </span>
          ) : (
            <span className="flex items-center justify-center p-1 text-muted-foreground">
              {getNodeIcon(node.category, node.status)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-1.5 flex items-center justify-between border-t border-border/50 pt-1.5 text-[10px]">
        {isError ? (
          <span className="truncate font-medium text-status-critical">{node.errorMessage ?? "Downstream dependency failure"}</span>
        ) : isWarning ? (
          <span className="truncate font-medium text-amber-400">{node.errorMessage ?? "Anomaly detected"}</span>
        ) : isRunning ? (
          <span className="font-semibold text-primary">Processing transformations &amp; rules...</span>
        ) : (
          <>
            <span className="font-mono text-muted-foreground">
              {node.columnDependencies.length > 0 ? `${node.columnDependencies.length} cols in` : "root ingest"}
            </span>
            <span className={cn("rounded px-1.5 py-0.5 font-medium", isSuccess ? "bg-status-good/10 text-status-good" : "bg-muted/60 text-foreground/80")}>
              {isSuccess ? "COMPLETED" : isQueued ? "QUEUED" : node.category.toUpperCase()}
            </span>
          </>
        )}
      </div>
    </motion.div>
  )
}
