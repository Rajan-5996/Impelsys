import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Building2Icon, CheckIcon, ChevronDownIcon, DatabaseIcon,
  Loader2Icon, PlayIcon, RotateCcwIcon, ShieldAlertIcon, WorkflowIcon, XCircleIcon,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { CodeInspectorDrawer } from "./code-inspector-drawer"
import { DataSourceModal } from "./data-source-modal"
import { LineageCanvas } from "./lineage-canvas"
import { PowerBiPreviewModal } from "./powerbi-preview-modal"
import { getVendorLineageConfig } from "./vendor-lineage-configs"
import { VendorLiveStatusStrip } from "./vendor-live-status-strip"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  advanceSimulationStep, fetchVendorLineage, openDataSourceModal, recomputeImpact,
  resetStageCode, selectMetadataLakehouse, selectVendor, startSequentialExecution,
  toggleAnomalySimulation,
} from "@/store/metadata-lakehouse-slice"
import { fetchVendors, selectVendors } from "@/store/vendors-slice"
import { pushToast } from "@/store/ui-slice"

export function MetadataLakehousePage() {
  const dispatch = useAppDispatch()
  const { diagnosticSummary: diagnostic, nodes, simulationState, selectedVendorId, activeSimulatedAnomalyNodeId } =
    useAppSelector(selectMetadataLakehouse)
  const vendors = useAppSelector(selectVendors)

  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false)
  const vendorDropdownRef = useRef<HTMLDivElement>(null)

  const currentVendorName = vendors.find((v) => v.vendor_id === selectedVendorId)?.name ?? selectedVendorId
  const currentVendor = getVendorLineageConfig(selectedVendorId, currentVendorName)

  useEffect(() => {
    dispatch(fetchVendors())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchVendorLineage(selectedVendorId))
  }, [dispatch, selectedVendorId])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (vendorDropdownRef.current && !vendorDropdownRef.current.contains(event.target as Node)) setIsVendorDropdownOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsVendorDropdownOpen(false)
    }
    if (isVendorDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isVendorDropdownOpen])

  useEffect(() => {
    if (!simulationState.isRunning) return
    const interval = setInterval(() => dispatch(advanceSimulationStep()), 750)
    return () => clearInterval(interval)
  }, [dispatch, simulationState.isRunning, simulationState.currentExecutionIndex])

  const errorCount = Object.values(nodes).filter((n) => n.status === "error").length
  const healthyCount = Object.values(nodes).filter((n) => n.status === "success").length
  const runningCount = Object.values(nodes).filter((n) => n.status === "running").length

  function handleResetAll() {
    if (diagnostic.rootCauseNodeId) dispatch(resetStageCode(diagnostic.rootCauseNodeId))
    dispatch(recomputeImpact())
    dispatch(pushToast("Reset all transformations and re-established schema continuity.", "info"))
  }

  function handleStartExecution() {
    dispatch(startSequentialExecution())
    dispatch(pushToast("Started step-by-step pipeline execution across 5 tiers.", "info"))
  }

  function handleVendorChange(vendorId: string, vendorName: string) {
    dispatch(selectVendor({ vendorId, vendorName }))
    dispatch(pushToast(`Loaded ${vendorName}'s schema & pipeline.`, "info"))
  }

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-140px)] min-h-[700px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <WorkflowIcon className="size-4" />
            </span>
            <h1 className="text-lg font-bold text-foreground">Metadata Lakehouse — Lineage &amp; Impact Simulator</h1>
          </div>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            5-tier interactive DAG tracing schema propagation: Data Source &rarr; Anomaly Agent &rarr; Quality Agent &rarr; 4-Stage ETL &rarr; Power BI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div ref={vendorDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsVendorDropdownOpen((prev) => !prev)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium shadow-xs transition-all duration-150 cursor-pointer outline-none select-none",
                isVendorDropdownOpen ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-md" : "border-primary/40 bg-primary/5 hover:border-primary hover:bg-primary/10"
              )}
            >
              <Building2Icon className="size-3.5 text-primary shrink-0" />
              <span className="text-[11px] font-bold text-foreground">Vendor:</span>
              <span className="font-semibold text-primary">{currentVendor.name}</span>
              <ChevronDownIcon className={cn("size-3.5 text-primary transition-transform duration-200 ml-0.5", isVendorDropdownOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isVendorDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 z-50 w-[360px] max-h-[480px] overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-2xl backdrop-blur-md"
                >
                  <div className="px-3 py-2 border-b border-border/60 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select Vendor Pipeline</p>
                    <p className="text-xs font-semibold text-foreground">{vendors.length} Real Registered Vendors</p>
                  </div>
                  <div className="space-y-1">
                    {vendors.map((vendor) => {
                      const isSelected = vendor.vendor_id === selectedVendorId
                      return (
                        <button
                          key={vendor.vendor_id}
                          type="button"
                          onClick={() => { handleVendorChange(vendor.vendor_id, vendor.name); setIsVendorDropdownOpen(false) }}
                          className={cn(
                            "w-full flex items-center justify-between gap-2.5 rounded-lg p-2.5 text-left transition-all duration-150 cursor-pointer",
                            isSelected ? "bg-primary/15 border border-primary/40 shadow-xs" : "hover:bg-muted/70 border border-transparent"
                          )}
                        >
                          <div className="min-w-0">
                            <span className={cn("text-xs font-bold", isSelected ? "text-primary" : "text-foreground")}>{vendor.name}</span>
                            <p className="text-[10px] text-muted-foreground/80 line-clamp-1">{vendor.vendor_id} &middot; {vendor.status}</p>
                          </div>
                          {isSelected && (
                            <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                              <CheckIcon className="size-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button size="sm" variant="outline" onClick={() => dispatch(openDataSourceModal())} className="border-border text-xs">
            <DatabaseIcon className="size-3.5 text-primary" /> Upload Dataset
          </Button>
          <Button size="sm" variant="outline" onClick={handleResetAll} className="border-border text-xs">
            <RotateCcwIcon className="size-3.5" /> Reset Schema
          </Button>
          <Button size="sm" disabled={simulationState.isRunning} onClick={handleStartExecution} className="bg-primary text-primary-foreground font-semibold text-xs shadow-sm">
            {simulationState.isRunning ? <Loader2Icon className="size-3.5 animate-spin mr-1.5" /> : <PlayIcon className="size-3.5 fill-current mr-1.5" />}
            {simulationState.isRunning ? "Processing Steps..." : "Run Step-by-Step"}
          </Button>
        </div>
      </div>

      <VendorLiveStatusStrip vendorId={selectedVendorId} pipelineCode={currentVendor.pipelineCode} runningCount={runningCount} healthyCount={healthyCount} errorCount={errorCount} />

      {diagnostic.hasBreakage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-status-critical/40 bg-status-critical/10 p-3 text-xs flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-status-critical/20 text-status-critical">
              <ShieldAlertIcon className="size-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-status-critical">
                  {activeSimulatedAnomalyNodeId ? `Active Incident Analysis: ${nodes[activeSimulatedAnomalyNodeId]?.title ?? "Root Cause"}` : `Schema Breakage Detected: Dropped column '${diagnostic.culpritColumn}'`}
                </p>
                {diagnostic.culpritColumn && (
                  <span className="rounded bg-status-critical/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-status-critical border border-status-critical/30">
                    Root Culprit: {diagnostic.culpritColumn}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Impacted ETL Stages: <span className="font-semibold text-foreground">{diagnostic.impactedEtlStages.join(", ") || "None (Fully Isolated)"}</span> &middot; Broken Power BI Dashboards: <span className="font-semibold text-status-critical">{diagnostic.brokenPbiVisuals.join(", ") || "None (Healthy)"}</span>
              </p>
              <p className="text-[11px] text-status-critical/95 font-medium mt-1 leading-relaxed max-w-5xl">{diagnostic.technicalRemediation}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeSimulatedAnomalyNodeId ? (
              <Button size="xs" variant="outline" className="border-status-critical/40 text-status-critical hover:bg-status-critical/10" onClick={() => dispatch(toggleAnomalySimulation(activeSimulatedAnomalyNodeId))}>
                <XCircleIcon className="size-3.5 mr-1" /> Clear Anomaly
              </Button>
            ) : (
              <Button size="xs" variant="outline" className="shrink-0" onClick={handleResetAll}>Restore Column &amp; Re-run</Button>
            )}
          </div>
        </motion.div>
      )}

      <LineageCanvas />

      <DataSourceModal />
      <CodeInspectorDrawer />
      <PowerBiPreviewModal />
    </div>
  )
}
