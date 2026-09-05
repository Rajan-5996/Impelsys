import { useEffect } from "react"
import { Loader2Icon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { RunFilesList } from "@/components/run-files-list"
import { PAUSED_STATUSES, TERMINAL_STATUSES } from "@/lib/stage-visual"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { STAGE_ORDER, type StageKey } from "@/store/run-flow-slice"
import { fetchRunFiles, selectRunFiles } from "@/store/runs-slice"

/** Sits at the very bottom of the vendor detail page -- renders nothing at
 * all until the run is close enough to actually produce output (a loader,
 * no card), then shows the agent's output files once they exist. */
export function RunOutputSection({
  runId,
  currentStage,
  runStatus,
}: {
  runId: string
  currentStage: StageKey | null
  runStatus: string | null
}) {
  const dispatch = useAppDispatch()
  const files = useAppSelector(selectRunFiles(runId))
  const hasFiles = !!files?.data && files.data.length > 0

  useEffect(() => {
    dispatch(fetchRunFiles(runId))
  }, [dispatch, runId])

  useEffect(() => {
    if (hasFiles || (runStatus && TERMINAL_STATUSES.has(runStatus))) return
    const interval = setInterval(() => dispatch(fetchRunFiles(runId)), 3000)
    return () => clearInterval(interval)
  }, [dispatch, runId, hasFiles, runStatus])

  const etlIndex = STAGE_ORDER.indexOf("etl")
  const currentIndex = STAGE_ORDER.indexOf(currentStage ?? "ingestion")
  const failedTerminal = !!runStatus && TERMINAL_STATUSES.has(runStatus) && runStatus !== "completed"
  const isBlocked = !!runStatus && (PAUSED_STATUSES.has(runStatus) || failedTerminal)
  const closeToOutput = currentIndex >= etlIndex && !isBlocked

  if (!hasFiles && !closeToOutput) return null

  if (!hasFiles) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-[11px] text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Waiting for FlowFix Agent's output files...
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Output Files</CardTitle>
      </CardHeader>
      <CardContent>
        <RunFilesList runId={runId} />
      </CardContent>
    </Card>
  )
}
