import { useState } from "react"
import { WrenchIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { SheetContent, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet"

import { EtlFailureAnalysisContent } from "@/components/overlays/etl-failure-analysis-drawer-body"
import { retryEtl, selectEtl, uploadEtlScript } from "@/store/etl-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchActiveRun } from "@/store/run-flow-slice"
import { closeDrawer, pushToast } from "@/store/ui-slice"

export function EtlRetryPanel({
  runId,
  onDecided,
}: {
  runId: string
  onDecided: (result: { run_id: string; status: string }) => void
}) {
  const dispatch = useAppDispatch()
  const etl = useAppSelector(selectEtl)
  const [scriptFile, setScriptFile] = useState<File | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const etlBusy = etl.status === "uploading" || etl.status === "retrying"

  async function handleSubmit() {
    setConfirmOpen(false)
    try {
      if (scriptFile) {
        await dispatch(uploadEtlScript({ runId, file: scriptFile })).unwrap()
        dispatch(pushToast("Script uploaded -- retrying ETL.", "success"))
      }
      const result = await dispatch(retryEtl({ runId, actor: "operator" })).unwrap()
      setScriptFile(null)
      onDecided(result)
    } catch (error) {
      dispatch(pushToast(typeof error === "string" ? error : "Retry failed.", "warn"))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        Optionally upload a corrected PySpark script for this run&apos;s failing ETL
        stage -- it is analyzed automatically before the retry. You can also retry
        without uploading a script.
      </p>
      <div className="rounded-lg border border-border bg-card p-2.5">
        <Input
          type="file"
          accept=".py"
          onChange={(event) => setScriptFile(event.target.files?.[0] ?? null)}
          disabled={etlBusy}
          className="h-auto border-b-transparent focus-visible:border-b-transparent"
        />
      </div>
      <Button
        onClick={() => setConfirmOpen(true)}
        disabled={etlBusy}
        className="w-fit"
      >
        {etlBusy
          ? etl.status === "uploading"
            ? "Uploading..."
            : "Retrying..."
          : scriptFile
            ? "Upload & Retry"
            : "Approve Agent"}
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent size="narrow">
          <DialogHeader>
            <DialogTitle>{scriptFile ? "Upload & Retry ETL" : "Approve Agent & Retry ETL"}</DialogTitle>
          </DialogHeader>
          <div className="p-5">
            <p className="text-xs text-muted-foreground">
              {scriptFile
                ? `This uploads "${scriptFile.name}" as the corrected script and immediately retries the ETL stage for this run.`
                : "This approves the agent's proposed fix as-is and immediately retries the ETL stage for this run."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function EtlRetryDrawerBody({ runId }: { runId: string }) {
  const dispatch = useAppDispatch()

  function handleDecided(result: { run_id: string; status: string }) {
    dispatch(fetchActiveRun(runId))
    if (result.status !== "awaiting_retry") dispatch(closeDrawer())
  }

  return (
    <SheetContent className="data-[side=right]:sm:max-w-[50vw]">
      <SheetHeader>
        <SheetTitle>ETL Retry Review</SheetTitle>
      </SheetHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-8 pb-28">
        <div>
          <EtlFailureAnalysisContent runId={runId} />
        </div>
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-primary uppercase">
            <WrenchIcon className="size-3.5" />
            Approve or Retry
          </p>
          <EtlRetryPanel runId={runId} onDecided={handleDecided} />
        </div>
      </div>
    </SheetContent>
  )
}
