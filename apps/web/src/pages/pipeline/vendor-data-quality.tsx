import { useEffect } from "react"
import { Loader2Icon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { TERMINAL_STATUSES } from "@/lib/stage-visual"
import { fetchRunQualityCheck, selectRunQualityCheck } from "@/store/dq-gate-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { STAGE_ORDER, type StageKey } from "@/store/run-flow-slice"

export function VendorDataQuality({
  runId,
  currentStage,
  runStatus,
}: {
  runId: string
  currentStage: StageKey | null
  runStatus: string | null
}) {
  const dispatch = useAppDispatch()
  const quality = useAppSelector(selectRunQualityCheck(runId))
  const hasResult = !!quality?.data

  const qualityCheckIndex = STAGE_ORDER.indexOf("quality_check")
  const currentIndex = STAGE_ORDER.indexOf(currentStage ?? "ingestion")
  const closeToQuality = currentIndex >= qualityCheckIndex

  useEffect(() => {
    if (!closeToQuality) return
    dispatch(fetchRunQualityCheck(runId))
  }, [dispatch, runId, closeToQuality])

  // The quality check only becomes available once the run reaches Stage 3 --
  // poll for it instead of requiring a manual refresh, and stop once we have
  // a result or the run has ended without ever reaching that stage.
  useEffect(() => {
    if (!closeToQuality || hasResult || (runStatus && TERMINAL_STATUSES.has(runStatus))) return
    const interval = setInterval(() => dispatch(fetchRunQualityCheck(runId)), 3000)
    return () => clearInterval(interval)
  }, [dispatch, runId, closeToQuality, hasResult, runStatus])

  if (!hasResult) {
    if (!closeToQuality || (runStatus && TERMINAL_STATUSES.has(runStatus))) return null
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-[11px] text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Waiting for DataGuard Agent to finish its quality check...
      </div>
    )
  }

  const data = quality!.data!

  return (
    <Card>
      <CardHeader>
        <CardTitle>DataGuard Quality Check</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {data.issues.length > 0 ? (
          <div className="rounded-md border border-status-critical/30 bg-status-critical/10 p-3">
            <p className="mb-1.5 text-[11px] font-semibold text-status-critical-ink">Issues</p>
            <ul className="list-disc space-y-1.5 pl-4 text-[11px] leading-relaxed text-status-critical-ink">
              {data.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
