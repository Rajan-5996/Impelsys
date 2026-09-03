import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2Icon, ZapIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { CollapsibleCard } from "@/components/collapsible-card"
import { RunFilesList } from "@/components/run-files-list"
import { PipelineAuditTrail, PipelineRunFlow } from "@/pages/pipeline/pipeline-run-flow"
import { runDetailPath } from "@/constants/routes"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchActiveRun,
  selectRunFlow,
  triggerRunStream,
  type RunFlowEvent,
} from "@/store/run-flow-slice"
import { pushToast } from "@/store/ui-slice"

export function PipelineOperationsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { runId, streaming } = useAppSelector(selectRunFlow)
  const [filesOpen, setFilesOpen] = useState(false)

  useEffect(() => {
    if (runId) dispatch(fetchActiveRun(runId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  async function handleTriggerAgent() {
    function onEvent(event: RunFlowEvent) {
      if (event.event !== "paused" || !event.run_id) return
      const runId = event.run_id

      if (event.status === "awaiting_anomaly_approval") {
        dispatch(pushToast("Anomaly needs your approval.", "warn"))
        setTimeout(() => navigate(runDetailPath(runId)), 1500)
      } else if (event.status === "awaiting_retry") {
        dispatch(pushToast("ETL failed -- retry needs your review.", "warn"))
        setTimeout(() => navigate(runDetailPath(runId)), 1500)
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
            <CollapsibleCard title="Run Files" open={filesOpen} onOpenChange={setFilesOpen}>
              <RunFilesList runId={runId} />
            </CollapsibleCard>
          ) : null}
        </div>
        <PipelineAuditTrail />
      </div>
    </div>
  )
}
