import { useEffect } from "react"
import { motion } from "framer-motion"

import { cn } from "@workspace/ui/lib/utils"

import { EmptyState } from "@/components/empty-state"
import { StageFlow } from "@/components/stage-flow"
import { StatusText, type StatusChipVariant } from "@/components/status-chip"
import { runStatusLabel } from "@/lib/format-labels"
import {
  DISPLAY_STAGE_LABELS,
  DISPLAY_STAGE_ORDER,
  displayActiveIndex,
  displayStageState,
} from "@/lib/stage-visual"
import { chartColorForVariant } from "@/lib/status-bar-colors"
import { sourceSystemsForVendor } from "@/lib/vendor-source-labels"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { normalizeStage } from "@/store/run-flow-events"
import { selectRunFlow, STAGE_ORDER } from "@/store/run-flow-slice"
import {
  fetchVendors,
  selectVendors,
  selectVendorsError,
  selectVendorsStatus,
} from "@/store/vendors-slice"

const STATUS_VARIANT: Record<string, StatusChipVariant> = {
  no_runs_yet: "neutral",
  running: "low",
  awaiting_anomaly_approval: "medium",
  awaiting_dq_approval: "medium",
  awaiting_advisory_approval: "medium",
  awaiting_retry: "medium",
  paused: "medium",
  completed: "ok",
  halted: "critical",
  etl_validation_failed: "critical",
  failed_max_retries: "critical",
  cancelled: "critical",
}

export function VendorFleetGrid({
  onVendorSelected,
}: {
  onVendorSelected?: (vendorId: string) => void
}) {
  const dispatch = useAppDispatch()
  const vendors = useAppSelector(selectVendors)
  const status = useAppSelector(selectVendorsStatus)
  const error = useAppSelector(selectVendorsError)
  const { runId: activeRunId } = useAppSelector(selectRunFlow)

  useEffect(() => {
    dispatch(fetchVendors())
  }, [dispatch])

  return (
    <>
      {status === "failed" ? (
        <EmptyState message={error ?? "Failed to load vendors."} />
      ) : status === "loading" || status === "idle" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-[168px] animate-pulse rounded-xl border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {vendors.map((vendor, index) => {
            const sources = sourceSystemsForVendor(vendor.vendor_id)
            const isActive = !!vendor.run_id && vendor.run_id === activeRunId
            const stageIndex = STAGE_ORDER.indexOf(normalizeStage(vendor.current_stage))

            return (
              <motion.button
                key={vendor.vendor_id}
                type="button"
                onClick={() => onVendorSelected?.(vendor.vendor_id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.03,
                  ease: "easeOut",
                }}
                whileHover={{ y: -2 }}
                className={cn(
                  "flex flex-col gap-3 rounded-xl bg-gradient-to-br from-primary/[0.04] via-card to-card p-4 text-left shadow-sm transition-shadow duration-200 hover:shadow-md",
                  isActive && "ring-1 ring-primary/30"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {vendor.name}
                  </p>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ background: chartColorForVariant(STATUS_VARIANT[vendor.status] ?? "neutral") }}
                    />
                    <StatusText variant={STATUS_VARIANT[vendor.status] ?? "neutral"} className="whitespace-nowrap">
                      {runStatusLabel(vendor.status)}
                    </StatusText>
                  </span>
                </div>
                <p className="line-clamp-2 min-h-[2.5em] text-[11px] text-muted-foreground">
                  {vendor.ai_summary}
                </p>
                <div className="flex flex-col gap-1.5 border-t border-dashed border-border pt-2.5">
                  <span className="text-[9px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
                    Connectors
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {sources.map((source) => (
                      <span
                        key={source.name}
                        className="flex items-center gap-1.5 rounded-md border border-border bg-muted/30 py-1 pr-2 pl-1.5"
                      >
                        <img src={source.logo} alt="" className="size-4 shrink-0 object-contain" />
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {source.name}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
                {vendor.run_id ? (
                  <div className="border-t border-dashed border-border pt-2.5">
                    <StageFlow
                      stages={DISPLAY_STAGE_ORDER}
                      labels={DISPLAY_STAGE_LABELS}
                      activeIndex={displayActiveIndex(stageIndex, vendor.status)}
                      settled
                      showLabels={false}
                      nodeState={(stageKey) => displayStageState(stageKey, stageIndex, vendor.status, false)}
                    />
                  </div>
                ) : null}
              </motion.button>
            )
          })}
        </div>
      )}
    </>
  )
}
