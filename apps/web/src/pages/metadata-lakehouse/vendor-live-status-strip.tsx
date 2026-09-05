import { CheckCircle2Icon, DatabaseIcon, GaugeIcon, GitBranchIcon, Loader2Icon, ShieldAlertIcon } from "lucide-react"

import { useAppSelector } from "@/store/hooks"
import { selectVendorLiveStatus } from "@/store/metadata-lakehouse-slice"
import { sourceSystemsForVendor } from "@/lib/vendor-source-labels"

/** Real backend readout for the selected vendor -- their actual connector
 * fan-in, latest run status/stage, and (once a run has reached that far)
 * genuine anomaly/DQ findings from smart_etl -- shown alongside the
 * interactive click-to-break simulator below, not driving it. */
export function VendorLiveStatusStrip({
  vendorId, pipelineCode, runningCount, healthyCount, errorCount,
}: {
  vendorId: string
  pipelineCode: string
  runningCount: number
  healthyCount: number
  errorCount: number
}) {
  const live = useAppSelector(selectVendorLiveStatus(vendorId))
  const sources = sourceSystemsForVendor(vendorId)
  const pendingAnomalies = live?.anomalies.filter((a) => a.status === "pending") ?? []

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs text-xs">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <DatabaseIcon className="size-3.5 text-primary" />
          <span>Real Connectors ({sources.length}):</span>
          <div className="flex items-center gap-1">
            {sources.map((s) => (
              <span key={s.name} className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-muted/80 text-foreground border border-border">
                <img src={s.logo} alt="" className="size-3 object-contain" /> {s.name}
              </span>
            ))}
          </div>
        </div>

        <span className="text-muted-foreground/40">&bull;</span>

        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <GitBranchIcon className="size-3.5 text-muted-foreground" />
          <span>Pipeline:</span>
          <span className="font-mono text-primary font-semibold">{pipelineCode}</span>
        </div>

        <span className="text-muted-foreground/40">&bull;</span>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <GaugeIcon className="size-3.5" />
          <span>Live Run:</span>
          {live?.run_id ? (
            <span className="font-mono text-foreground font-medium">{live.status} &middot; stage: {live.current_stage ?? "n/a"}</span>
          ) : (
            <span className="font-mono text-foreground font-medium">no runs yet</span>
          )}
        </div>

        {live?.quality && (
          <>
            <span className="text-muted-foreground/40">&bull;</span>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span>DQ Score:</span>
              <span className="font-semibold text-foreground">{live.quality.overall_score.toFixed(1)} ({live.quality.tier})</span>
            </div>
          </>
        )}

        {pendingAnomalies.length > 0 && (
          <>
            <span className="text-muted-foreground/40">&bull;</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-status-warning-foreground">
              <ShieldAlertIcon className="size-3.5" /> {pendingAnomalies.length} real anomal{pendingAnomalies.length === 1 ? "y" : "ies"} pending review
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {runningCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-primary animate-pulse">
            <Loader2Icon className="size-3.5 animate-spin" /> {runningCount} Processing
          </span>
        )}
        <span className="flex items-center gap-1 text-[11px] font-semibold text-status-good">
          <CheckCircle2Icon className="size-3.5" /> {healthyCount} Completed
        </span>
        {errorCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-status-critical animate-pulse">
            <ShieldAlertIcon className="size-3.5" /> {errorCount} Affected
          </span>
        )}
      </div>
    </div>
  )
}
