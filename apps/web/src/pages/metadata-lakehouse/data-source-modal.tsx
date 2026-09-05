import { useRef, useState, type ChangeEvent, type DragEvent } from "react"
import Papa from "papaparse"
import { CheckCircle2Icon, DatabaseIcon, FileSpreadsheetIcon, PlayIcon, SparklesIcon, UploadCloudIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@workspace/ui/components/dialog"

import type { RawSalesRecord } from "./lineage-types"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeDataSourceModal, selectMetadataLakehouse, setCustomRawRecords, startSequentialExecution } from "@/store/metadata-lakehouse-slice"
import { pushToast } from "@/store/ui-slice"

export function DataSourceModal() {
  const dispatch = useAppDispatch()
  const { isDataSourceModalOpen: isOpen, rawDatasetRecords: records } = useAppSelector(selectMetadataLakehouse)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState("raw_sales_feed.csv")
  const [isDragOver, setIsDragOver] = useState(false)

  if (!isOpen) return null

  function handleParseFile(file: File) {
    setIsUploading(true)
    Papa.parse<RawSalesRecord>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsUploading(false)
        if (results.data && results.data.length > 0) {
          setUploadedFileName(file.name)
          dispatch(setCustomRawRecords(results.data))
          dispatch(pushToast(`Loaded ${results.data.length} records from ${file.name}`, "success"))
        } else {
          dispatch(pushToast("Parsed file was empty or invalid.", "warn"))
        }
      },
      error: (err) => {
        setIsUploading(false)
        dispatch(pushToast(`Failed to parse CSV: ${err.message}`, "warn"))
      },
    })
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleParseFile(file)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.name.endsWith(".csv")) handleParseFile(file)
    else dispatch(pushToast("Please upload a valid .csv file.", "warn"))
  }

  function handleStartPipeline() {
    dispatch(closeDataSourceModal())
    dispatch(startSequentialExecution())
    dispatch(pushToast("Initiated step-by-step pipeline execution.", "success"))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && dispatch(closeDataSourceModal())}>
      <DialogContent className="max-w-xl flex flex-col p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="p-5 pb-3 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <DatabaseIcon className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">Data Source &amp; Ingestion Manager</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Upload raw batch dataset to initiate the 5-stage ETL and Power BI pipeline.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 text-center ${
              isDragOver ? "border-primary bg-primary/10 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/10 bg-muted/5"
            }`}
          >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-3 shadow-sm">
              <UploadCloudIcon className="size-7" />
            </span>
            <p className="text-sm font-bold text-foreground">{isUploading ? "Parsing Inbound CSV..." : "Click or Drag & Drop Raw CSV Dataset"}</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Upload your raw vendor sales data feed containing transactional order columns.
            </p>
            <Button size="sm" variant="outline" className="mt-4 pointer-events-none" disabled={isUploading}>
              <FileSpreadsheetIcon className="size-3.5 mr-1.5" /> Browse CSV Files
            </Button>
          </div>

          {records.length > 0 && (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-status-good/30 bg-status-good/10">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-status-good/20 text-status-good">
                  <CheckCircle2Icon className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-foreground font-mono">{uploadedFileName}</p>
                  <p className="text-[11px] text-muted-foreground">{records.length} records parsed &middot; ready for ingestion</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-status-good/20 text-status-good border border-status-good/30">Ready to Process</span>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/10 text-[11px] text-muted-foreground">
            <SparklesIcon className="size-3.5 text-primary shrink-0" />
            <span>Clicking <strong>Start Pipeline Execution</strong> will trigger step-by-step node execution across Anomaly, Quality, ETL, and Power BI.</span>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-border bg-muted/20 flex items-center justify-between sm:justify-between">
          <Button variant="ghost" size="sm" onClick={() => dispatch(closeDataSourceModal())}>Close</Button>
          <Button size="sm" onClick={handleStartPipeline} disabled={records.length === 0 || isUploading} className="bg-primary text-primary-foreground font-semibold shadow-sm">
            <PlayIcon className="size-3.5 fill-current mr-1.5" /> Start Pipeline Execution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
