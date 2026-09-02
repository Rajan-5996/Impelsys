import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { AlertTriangleIcon, CheckIcon, CircleIcon, Loader2Icon, XIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

import { EmptyState } from "@/components/empty-state"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { runDetailPath } from "@/constants/routes"
import { humanizeSnake } from "@/lib/format-labels"
import { STAGE_ORDER, selectRunFlow, type StageKey } from "@/store/run-flow-slice"
import { useAppSelector } from "@/store/hooks"

const STAGE_LABELS: Record<StageKey, string> = {
  ingestion: "Ingestion",
  anomaly_detection: "Anomaly Detection",
  quality_check: "Quality Check",
  etl: "ETL",
  done: "Done",
}

const FAILED_STATUSES = new Set(["halted", "etl_validation_failed", "failed_max_retries", "failed"])
const PAUSED_STATUSES = new Set(["awaiting_anomaly_approval", "awaiting_dq_approval", "awaiting_retry"])

const STATUS_VARIANT: Record<string, StatusChipVariant> = {
  running: "low",
  awaiting_anomaly_approval: "medium",
  awaiting_dq_approval: "medium",
  awaiting_retry: "medium",
  completed: "ok",
  halted: "critical",
  etl_validation_failed: "critical",
  failed_max_retries: "critical",
  failed: "critical",
}

type NodeVisualState = "done" | "active" | "in-progress" | "paused" | "failed" | "pending"

function nodeVisualState(
  stageKey: StageKey,
  index: number,
  activeIndex: number,
  status: string | null,
  streaming: boolean
): NodeVisualState {
  if (index < activeIndex) return "done"
  if (index > activeIndex) return "pending"
  if (stageKey === "done" && status === "completed") return "done"
  if (status && FAILED_STATUSES.has(status)) return "failed"
  if (status && PAUSED_STATUSES.has(status)) return "paused"
  return streaming ? "active" : "in-progress"
}

const NODE_STYLE: Record<NodeVisualState, string> = {
  done: "border-status-good bg-status-good/15 text-status-good-ink",
  active: "border-primary bg-primary/15 text-primary",
  "in-progress": "border-primary bg-primary/15 text-primary",
  paused: "border-status-warning bg-status-warning/15 text-status-warning-foreground",
  failed: "border-status-critical bg-status-critical/15 text-status-critical-ink",
  pending: "border-border bg-muted/30 text-muted-foreground",
}

function NodeIcon({ state }: { state: NodeVisualState }) {
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
      {lit ? (
        <div className="absolute inset-0 rounded-full bg-status-good" />
      ) : null}
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

export function PipelineRunFlow() {
  const { runId, currentStage, status, message, streaming } = useAppSelector(selectRunFlow)

  if (!runId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart ETL Run Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState message="No run triggered yet -- click Trigger Agent to start one." />
        </CardContent>
      </Card>
    )
  }

  const activeIndex = STAGE_ORDER.indexOf(currentStage ?? "ingestion")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart ETL Run Flow</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center">
          {STAGE_ORDER.map((stageKey, index) => {
            const state = nodeVisualState(stageKey, index, activeIndex, status, streaming)
            return (
              <div key={stageKey} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div
                    animate={state === "active" ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                    transition={
                      state === "active"
                        ? { repeat: Infinity, duration: 1.6, ease: "easeInOut" }
                        : undefined
                    }
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full border-2",
                      NODE_STYLE[state]
                    )}
                  >
                    <NodeIcon state={state} />
                  </motion.div>
                  <span className="w-20 text-center text-[9.5px] font-semibold text-muted-foreground">
                    {STAGE_LABELS[stageKey]}
                  </span>
                </div>
                {index < STAGE_ORDER.length - 1 ? (
                  <Connector lit={index < activeIndex} flowing={index === activeIndex - 1} />
                ) : null}
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-border pt-3">
          <span className="text-[11px] font-semibold text-foreground">{runId}</span>
          {status ? (
            <StatusChip variant={STATUS_VARIANT[status] ?? "medium"}>
              {humanizeSnake(status)}
            </StatusChip>
          ) : null}
          <span className="text-[11px] text-muted-foreground">{message}</span>
          {status === "awaiting_anomaly_approval" ? (
            <Link
              to={runDetailPath(runId)}
              className="ml-auto text-[11px] font-semibold text-primary hover:underline"
            >
              Review in Incidents &rarr;
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
