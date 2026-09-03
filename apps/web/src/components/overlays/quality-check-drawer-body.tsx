import { useEffect } from "react"

import {
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"

import { EmptyState } from "@/components/empty-state"
import { Gauge, MetricBar } from "@/components/metrics"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { formatTimestamp, humanizeSnake } from "@/lib/format-labels"
import { fetchRunQualityCheck, selectRunQualityCheck } from "@/store/run-flow-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const TIER_VARIANT: Record<string, StatusChipVariant> = {
  Preferred: "preferred",
  Approved: "approved",
  Monitor: "monitor",
  "At Risk": "atrisk",
}

const DECISION_STATUS_VARIANT: Record<string, StatusChipVariant> = {
  approved: "ok",
  pending: "medium",
  rejected: "critical",
}

function dimensionVariant(score: number): StatusChipVariant {
  if (score >= 90) return "ok"
  if (score >= 75) return "medium"
  return "critical"
}

const DIMENSION_DESCRIPTIONS: Record<string, string> = {
  freshness: "Share of rows within the expected recency window.",
  completeness: "Share of required fields that are populated.",
  validity: "Share of values conforming to the expected format or type.",
  accuracy: "Share of values that are numerically or logically correct.",
  consistency: "Share of values consistent across related fields.",
  uniqueness: "Share of rows free of unwanted duplicates.",
  referential_integrity: "Share of foreign-key values that resolve to a known record.",
  null_checks: "Share of critical fields free of unexpected nulls.",
}

export function QualityCheckDrawerBody({ runId }: { runId: string }) {
  const dispatch = useAppDispatch()
  const quality = useAppSelector(selectRunQualityCheck(runId))

  useEffect(() => {
    dispatch(fetchRunQualityCheck(runId))
  }, [dispatch, runId])

  if (!quality || quality.status === "loading" || quality.status === "idle") {
    return (
      <SheetContent className="data-[side=right]:sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Quality Check Result</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-3 px-8 pb-16">
          <div className="h-24 animate-pulse rounded-md bg-muted/40" />
          <div className="h-40 animate-pulse rounded-md bg-muted/40" />
        </div>
      </SheetContent>
    )
  }

  if (quality.status === "failed" || !quality.data) {
    return (
      <SheetContent className="data-[side=right]:sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Quality Check Result</SheetTitle>
        </SheetHeader>
        <div className="px-8 pb-16">
          <EmptyState message={quality.error ?? "No quality check result available for this run."} />
        </div>
      </SheetContent>
    )
  }

  const data = quality.data
  const dimensionEntries = Object.entries(data.dimension_scores)
  const weakDimensions = dimensionEntries.filter(([, score]) => score < 75)

  return (
    <SheetContent className="data-[side=right]:sm:max-w-lg">
      <SheetHeader>
        <SheetTitle>Quality Check Result</SheetTitle>
      </SheetHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-8 pb-16">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-[11.5px] font-semibold text-foreground">{runId}</span>
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip variant={TIER_VARIANT[data.tier] ?? "neutral"}>{data.tier}</StatusChip>
              <StatusChip variant={DECISION_STATUS_VARIANT[data.status] ?? "medium"}>
                {humanizeSnake(data.status)}
              </StatusChip>
            </div>
          </div>
          <Gauge score={data.overall_score} size={80} />
        </div>

        <p className="text-[10.5px] leading-relaxed text-muted-foreground">
          Runs with an overall score below 75 pause and require human approval before the
          curated data loads.
        </p>

        {weakDimensions.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {weakDimensions.map(([dimension, score]) => (
              <StatusChip key={dimension} variant="critical">
                {humanizeSnake(dimension)}: {score}
              </StatusChip>
            ))}
          </div>
        ) : null}

        <div className="border-t border-dashed border-border pt-4">
          <p className="mb-3 text-[11px] font-semibold text-foreground">Dimension Scores</p>
          {dimensionEntries.map(([dimension, score]) => (
            <div key={dimension} className="flex items-center gap-3">
              <div className="flex-1">
                <MetricBar label={humanizeSnake(dimension)} value={score} />
              </div>
              <StatusChip variant={dimensionVariant(score)} className="shrink-0">
                {score >= 90 ? "Healthy" : score >= 75 ? "Watch" : "Weak"}
              </StatusChip>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-border pt-4">
          <p className="mb-3 text-[11px] font-semibold text-foreground">Dimension Glossary</p>
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-[10.5px] leading-relaxed text-muted-foreground sm:grid-cols-2">
            {dimensionEntries.map(([dimension]) => (
              <p key={dimension}>
                <span className="font-semibold text-foreground">{humanizeSnake(dimension)}:</span>{" "}
                {DIMENSION_DESCRIPTIONS[dimension] ?? "Weighted quality dimension for this run."}
              </p>
            ))}
          </div>
        </div>

        {data.issues.length > 0 ? (
          <div className="border-t border-dashed border-border pt-4">
            <div className="rounded-md border border-status-critical/30 bg-status-critical/10 p-3">
              <p className="mb-1.5 text-[11px] font-semibold text-status-critical-ink">Issues</p>
              <ul className="list-disc space-y-1.5 pl-4 text-[11.5px] leading-relaxed text-status-critical-ink">
                {data.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5 border-t border-dashed border-border pt-4 text-[10.5px] text-muted-foreground">
          <span>Decided By: {data.decided_by ?? "—"}</span>
          {data.decision_note ? <span>Note: {data.decision_note}</span> : null}
          <span>Created: {formatTimestamp(data.created_at)}</span>
          {data.decided_at ? <span>Decided: {formatTimestamp(data.decided_at)}</span> : null}
        </div>
      </div>
    </SheetContent>
  )
}
