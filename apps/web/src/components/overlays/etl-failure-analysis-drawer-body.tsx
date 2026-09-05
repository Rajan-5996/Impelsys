import { useEffect, useState } from "react"
import { ChevronDownIcon, CheckIcon, CopyIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { ScriptDiff } from "@/components/code-diff"
import { EmptyState } from "@/components/empty-state"
import { MarkdownText } from "@/components/markdown-text"
import { StageFlow } from "@/components/stage-flow"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { formatTimestamp, humanizeSnake } from "@/lib/format-labels"
import {
  fetchEtlAttempts,
  fetchEtlFailureAnalysis,
  selectEtlAttempts,
  selectEtlFailureAnalysis,
} from "@/store/etl-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const CONFIDENCE_VARIANT: Record<string, StatusChipVariant> = {
  high: "ok",
  medium: "medium",
  low: "critical",
}

const STAGE_STATUS_VARIANT: Record<string, StatusChipVariant> = {
  ok: "ok",
  error: "critical",
}

const ATTEMPT_STATUS_VARIANT: Record<string, StatusChipVariant> = {
  success: "ok",
  validation_failed: "medium",
  failed: "critical",
}

// The ETL engine runs these substages strictly in order (clean -> transform ->
// enrich -> aggregate_load) and stops at the first failure, so the reported
// failing_stage alone is enough to derive which ones passed/failed/never ran
// -- no need to fetch a separate per-substage log for this.
type EtlSubstage = "clean" | "transform" | "enrich" | "aggregate_load"
const ETL_SUBSTAGE_ORDER: EtlSubstage[] = ["clean", "transform", "enrich", "aggregate_load"]
const ETL_SUBSTAGE_LABELS: Record<EtlSubstage, string> = {
  clean: "Clean",
  transform: "Transform",
  enrich: "Enrich",
  aggregate_load: "Aggregate & Load",
}

function failingSubstageIndex(failingStage: string | null): number {
  if (!failingStage) return -1
  return ETL_SUBSTAGE_ORDER.indexOf(failingStage.replace(/^stage_/, "") as EtlSubstage)
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable -- non-fatal, the block is still selectable/readable
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-foreground">{label}</p>
        <Button variant="ghost" size="xs" onClick={handleCopy}>
          {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words border border-border bg-muted/30 p-2.5 font-mono text-[10.5px] leading-relaxed text-foreground">
        {code}
      </pre>
    </div>
  )
}

export function EtlFailureAnalysisContent({ runId }: { runId: string }) {
  const dispatch = useAppDispatch()
  const analysis = useAppSelector(selectEtlFailureAnalysis(runId))
  const attempts = useAppSelector(selectEtlAttempts(runId))
  const [rootCauseExpanded, setRootCauseExpanded] = useState(false)

  useEffect(() => {
    dispatch(fetchEtlFailureAnalysis(runId))
    dispatch(fetchEtlAttempts(runId))
  }, [dispatch, runId])

  if (!analysis || analysis.status === "loading" || analysis.status === "idle") {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-24 animate-pulse rounded-md bg-muted/40" />
        <div className="h-40 animate-pulse rounded-md bg-muted/40" />
        <div className="h-40 animate-pulse rounded-md bg-muted/40" />
      </div>
    )
  }

  if (analysis.status === "failed" || !analysis.data) {
    return <EmptyState message={analysis.error ?? "No failure analysis available for this run."} />
  }

  const data = analysis.data
  const attempt = attempts?.data.find((item) => item.attempt_id === data.attempt_id)
  const failIndex = failingSubstageIndex(data.root_cause.failing_stage)
  const hasRootCauseDetail = Boolean(
    data.root_cause.failing_stage ||
      data.root_cause.failing_column ||
      data.root_cause.expected_column ||
      data.root_cause.investigation_trail
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11.5px] font-semibold text-foreground">{runId}</span>
        <StatusChip variant={CONFIDENCE_VARIANT[data.confidence] ?? "medium"}>
          {humanizeSnake(data.confidence)} confidence
        </StatusChip>
        <span className="text-[10.5px] text-muted-foreground">
          {humanizeSnake(data.source)} &middot; {formatTimestamp(data.created_at)}
        </span>
      </div>

      {attempt ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-dashed border-border pb-3">
          <StatusChip variant="neutral">Attempt #{attempt.attempt_number}</StatusChip>
          <StatusChip variant="neutral">{humanizeSnake(attempt.engine)}</StatusChip>
          {attempt.stage_log.map((entry, index) => (
            <StatusChip
              key={`${entry.stage}-${index}`}
              variant={STAGE_STATUS_VARIANT[entry.status] ?? "critical"}
            >
              {humanizeSnake(entry.stage)} ({entry.row_count})
            </StatusChip>
          ))}
        </div>
      ) : null}

      {attempt?.validation && !attempt.validation.passed ? (
        <div>
          <p className="text-[11px] font-semibold text-foreground">Validation Issues</p>
          <ul className="mt-1 list-disc pl-4 text-[11.5px] text-muted-foreground">
            {attempt.validation.issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex items-start gap-2 border border-status-warning/40 bg-status-warning/15 p-3">
        <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-status-warning-foreground" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-status-warning-foreground">Root Cause</p>
          <MarkdownText className="mt-1 text-[12px] leading-relaxed text-status-warning-foreground">
            {data.root_cause.summary}
          </MarkdownText>
          {hasRootCauseDetail ? (
            <button
              type="button"
              onClick={() => setRootCauseExpanded((prev) => !prev)}
              className="mt-1.5 flex items-center gap-1 text-[10.5px] font-semibold text-status-info underline underline-offset-2 hover:text-status-info/80"
            >
              <ChevronDownIcon
                className={`size-3 transition-transform duration-200 ${rootCauseExpanded ? "rotate-180" : ""}`}
              />
              {rootCauseExpanded ? "Show less" : "Show more"}
            </button>
          ) : null}
          {rootCauseExpanded ? (
            <div className="mt-2 flex flex-col gap-2.5 border-t border-status-warning/30 pt-2.5">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {data.root_cause.failing_stage ? (
                  <div className="rounded-md border border-status-warning/30 bg-card p-2">
                    <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
                      Failing Stage
                    </p>
                    <p className="mt-0.5 truncate text-[11.5px] font-semibold text-foreground">
                      {data.root_cause.failing_stage}
                    </p>
                  </div>
                ) : null}
                {data.root_cause.failing_column ? (
                  <div className="rounded-md border border-status-warning/30 bg-card p-2">
                    <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
                      Failing Column
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[11.5px] font-semibold text-status-critical-ink">
                      {data.root_cause.failing_column}
                    </p>
                  </div>
                ) : null}
                {data.root_cause.expected_column ? (
                  <div className="rounded-md border border-status-warning/30 bg-card p-2">
                    <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
                      Expected Column
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[11.5px] font-semibold text-status-good-ink">
                      {data.root_cause.expected_column}
                    </p>
                  </div>
                ) : null}
              </div>
              {data.root_cause.investigation_trail ? (
                <div className="rounded-md border border-status-warning/30 bg-card p-2.5">
                  <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
                    Investigation Trail
                  </p>
                  {failIndex >= 0 ? (
                    <div className="my-10 p-5 overflow-x-auto">
                      <StageFlow
                        stages={ETL_SUBSTAGE_ORDER}
                        labels={ETL_SUBSTAGE_LABELS}
                        activeIndex={failIndex}
                        settled
                        nodeState={(_, index) =>
                          index < failIndex ? "done" : index === failIndex ? "failed" : "pending"
                        }
                      />
                    </div>
                  ) : null}
                  <MarkdownText className="mt-1 text-[11px] leading-relaxed text-foreground">
                    {data.root_cause.investigation_trail}
                  </MarkdownText>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {data.corrected_script && data.original_script ? (
        <ScriptDiff
          before={data.original_script}
          after={data.corrected_script}
          reason={data.root_cause.summary}
        />
      ) : data.corrected_script ? (
        <CodeBlock label="Corrected Script" code={data.corrected_script} />
      ) : null}

      {attempts?.data && attempts.data.length > 1 ? (
        <div className="border-t border-dashed border-border pt-3">
          <p className="text-[11px] font-semibold text-foreground">
            All Attempts for This Run
          </p>
          <div className="mt-2 flex flex-col gap-1.5">
            {attempts.data.map((item) => (
              <div
                key={item.attempt_id}
                className="flex items-center justify-between gap-2 border border-border px-2.5 py-1.5"
              >
                <span className="text-[11px] font-medium text-foreground">
                  Attempt #{item.attempt_number}
                </span>
                <span className="text-[10.5px] text-muted-foreground">
                  {formatTimestamp(item.created_at)}
                </span>
                <StatusChip variant={ATTEMPT_STATUS_VARIANT[item.status] ?? "neutral"}>
                  {humanizeSnake(item.status)}
                </StatusChip>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function EtlFailureAnalysisDialogBody({ runId }: { runId: string }) {
  return (
    <DialogContent size="huge">
      <DialogHeader>
        <DialogTitle>ETL Failure Analysis</DialogTitle>
      </DialogHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
        <EtlFailureAnalysisContent runId={runId} />
      </div>
    </DialogContent>
  )
}
