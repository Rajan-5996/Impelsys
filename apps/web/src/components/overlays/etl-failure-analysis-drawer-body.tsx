import { useEffect, useState } from "react"
import { CheckIcon, CopyIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"

import { EmptyState } from "@/components/empty-state"
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

export function EtlFailureAnalysisDrawerBody({ runId }: { runId: string }) {
  const dispatch = useAppDispatch()
  const analysis = useAppSelector(selectEtlFailureAnalysis(runId))
  const attempts = useAppSelector(selectEtlAttempts(runId))

  useEffect(() => {
    dispatch(fetchEtlFailureAnalysis(runId))
    dispatch(fetchEtlAttempts(runId))
  }, [dispatch, runId])

  if (!analysis || analysis.status === "loading" || analysis.status === "idle") {
    return (
      <SheetContent className="data-[side=right]:sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>ETL Failure Analysis</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-3 px-8 pb-16">
          <div className="h-24 animate-pulse rounded-md bg-muted/40" />
          <div className="h-40 animate-pulse rounded-md bg-muted/40" />
          <div className="h-40 animate-pulse rounded-md bg-muted/40" />
        </div>
      </SheetContent>
    )
  }

  if (analysis.status === "failed" || !analysis.data) {
    return (
      <SheetContent className="data-[side=right]:sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>ETL Failure Analysis</SheetTitle>
        </SheetHeader>
        <div className="px-8 pb-16">
          <EmptyState message={analysis.error ?? "No failure analysis available for this run."} />
        </div>
      </SheetContent>
    )
  }

  const data = analysis.data
  const attempt = attempts?.data.find((item) => item.attempt_id === data.attempt_id)

  return (
    <SheetContent className="data-[side=right]:sm:max-w-2xl">
      <SheetHeader>
        <SheetTitle>ETL Failure Analysis</SheetTitle>
      </SheetHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-8 pb-16">
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
          <div>
            <p className="text-[11px] font-semibold text-status-warning-foreground">Root Cause</p>
            <p className="mt-1 text-[12px] leading-relaxed text-status-warning-foreground">
              {data.root_cause}
            </p>
          </div>
        </div>

        {data.error_message ? (
          <CodeBlock label="Error / Traceback" code={data.error_message} />
        ) : null}

        {data.corrected_script ? (
          <CodeBlock label="Corrected Script" code={data.corrected_script} />
        ) : null}

        <div
          className="border-t border-dashed border-border pt-3 pb-[15px]"
          aria-hidden="true"
        />

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
    </SheetContent>
  )
}
