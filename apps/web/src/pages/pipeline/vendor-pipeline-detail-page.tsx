import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { EmptyState } from "@/components/empty-state"
import { ROUTES } from "@/constants/routes"
import { PipelineActionItems } from "@/pages/pipeline/pipeline-action-items"
import { PipelineRunFlow } from "@/pages/pipeline/pipeline-run-flow"
import { RunOutputSection } from "@/pages/pipeline/run-output-section"
import { VendorDataQuality } from "@/pages/pipeline/vendor-data-quality"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchActiveRun, selectRunFlow } from "@/store/run-flow-slice"
import { pushToast } from "@/store/ui-slice"
import { fetchVendors, selectVendors, triggerVendor } from "@/store/vendors-slice"

const TERMINAL_STATUSES = new Set([
  "completed",
  "halted",
  "etl_validation_failed",
  "failed_max_retries",
])

export function VendorPipelineDetailPage() {
  const { vendorId } = useParams<{ vendorId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const vendors = useAppSelector(selectVendors)
  const { runId, currentStage, status, message, streaming } = useAppSelector(selectRunFlow)
  const vendor = vendors.find((row) => row.vendor_id === vendorId)

  useEffect(() => {
    dispatch(fetchVendors())
  }, [dispatch])

  useEffect(() => {
    if (!vendorId) return

    async function trigger() {
      const result = await dispatch(triggerVendor(vendorId!))
      if (triggerVendor.fulfilled.match(result)) {
        const { run_id, action, name } = result.payload
        if (run_id) dispatch(fetchActiveRun(run_id))
        dispatch(
          pushToast(
            action === "already_active"
              ? `${name}'s pipeline is already running.`
              : action === "resumed"
                ? `${name}'s pipeline resumed.`
                : `${name}'s pipeline started.`,
            "success"
          )
        )
      } else {
        dispatch(pushToast((result.payload as string) ?? "Failed to trigger vendor.", "warn"))
      }
    }

    trigger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId])

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => navigate(ROUTES.pipeline)}
        >
          <ArrowLeftIcon />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {vendor?.name ?? "Vendor"} Pipeline
          </h1>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            Live status for this vendor's Smart ETL agent run
          </p>
        </div>
      </div>
      {runId ? (
        <>
          <PipelineRunFlow sourceVendorId={vendorId ?? null} />
          <PipelineActionItems runId={runId} runStatus={status} runMessage={message} />
          <VendorDataQuality runId={runId} currentStage={currentStage} runStatus={status} />
          <RunOutputSection runId={runId} currentStage={currentStage} runStatus={status} />
        </>
      ) : (
        <EmptyState message="Starting the pipeline run..." />
      )}
    </div>
  )
}
