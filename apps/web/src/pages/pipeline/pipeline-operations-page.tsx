import { useEffect } from "react"
import { Loader2Icon, ZapIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { RunFilesList } from "@/components/run-files-list"
import { PipelineActionItems } from "@/pages/pipeline/pipeline-action-items"
import { PipelineAuditTrail, PipelineRunFlow } from "@/pages/pipeline/pipeline-run-flow"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchActiveRun,
  selectRunFlow,
  triggerRunStream,
  type RunFlowEvent,
} from "@/store/run-flow-slice"
import { pushToast } from "@/store/ui-slice"

const TERMINAL_STATUSES = new Set([
  "completed",
  "halted",
  "etl_validation_failed",
  "failed_max_retries",
])

export function PipelineOperationsPage() {
  const dispatch = useAppDispatch()
  const { runId, status, message, streaming } = useAppSelector(selectRunFlow)

  useEffect(() => {
    if (runId) dispatch(fetchActiveRun(runId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  // The SSE stream only covers one leg of the run and closes once it pauses --
  // any further progress the backend makes after a human decision (e.g. moving
  // from anomaly approval straight to an ETL failure) happens with no live
  // connection open, so poll the run's own state while it isn't actively
  // streaming to pick that up instead of requiring a manual page reload.
  useEffect(() => {
    if (!runId || streaming || (status && TERMINAL_STATUSES.has(status))) return
    const interval = setInterval(() => dispatch(fetchActiveRun(runId)), 2500)
    return () => clearInterval(interval)
  }, [dispatch, runId, streaming, status])

  async function handleTriggerAgent() {
    function onEvent(event: RunFlowEvent) {
      if (event.event !== "paused" || !event.run_id) return

      if (event.status === "awaiting_anomaly_approval") {
        dispatch(pushToast("Anomaly needs your approval.", "warn"))
      } else if (event.status === "awaiting_retry") {
        dispatch(pushToast("ETL failed -- retry needs your review.", "warn"))
      }
    }

    const result = await dispatch(triggerRunStream({ onEvent }))
    if (triggerRunStream.rejected.match(result)) {
      dispatch(pushToast((result.payload as string) ?? "Failed to trigger agent.", "warn"))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Pipeline Operations
          </h1>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            Live status for the current Smart ETL agent run
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={streaming}
          onClick={handleTriggerAgent}
        >
          {streaming ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <ZapIcon />
          )}
          {streaming ? "Triggering..." : "Trigger Agent"}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <PipelineRunFlow />
          {runId ? (
            <Card>
              <CardHeader>
                <CardTitle>Run Files</CardTitle>
              </CardHeader>
              <CardContent>
                <RunFilesList runId={runId} />
              </CardContent>
            </Card>
          ) : null}
        </div>
        <PipelineAuditTrail />
      </div>
      <PipelineActionItems runId={runId} runStatus={status} runMessage={message} />
    </div>
  )
}
