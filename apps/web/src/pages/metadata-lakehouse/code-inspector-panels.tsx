import { ActivityIcon, BarChart3Icon, GaugeIcon, RotateCcwIcon, ShieldAlertIcon, ZapIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { ANOMALY_INFO, QUALITY_INFO } from "./inspector-info"

export function AnomalyInfoPanel({ nodeId }: { nodeId: string }) {
  const info = ANOMALY_INFO[nodeId]
  if (!info) return null
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlertIcon className="size-4 text-amber-500" />
          <span className="text-xs font-bold text-foreground">Statistical Anomaly Gate Specification</span>
          <span className={cn("ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold border", info.severity === "high" ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30")}>
            {info.severity.toUpperCase()} SEVERITY
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded bg-card/60 border border-border/50">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Rule ID</span>
            <p className="font-mono font-bold text-amber-400 mt-0.5">{info.ruleId}</p>
          </div>
          <div className="p-2 rounded bg-card/60 border border-border/50">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Detection Type</span>
            <p className="font-medium text-foreground mt-0.5">{info.ruleType}</p>
          </div>
          <div className="p-2 rounded bg-card/60 border border-border/50">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Threshold Limit</span>
            <p className="font-semibold text-foreground mt-0.5">{info.threshold}</p>
          </div>
          <div className="p-2 rounded bg-card/60 border border-border/50">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Monitored Grain</span>
            <p className="font-mono text-foreground mt-0.5">{info.monitoredColumn}</p>
          </div>
        </div>
      </div>
      <div className="p-3.5 rounded-xl border border-border/70 bg-muted/15 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ActivityIcon className="size-3.5 text-primary" />
            <span className="text-xs font-bold text-foreground">Live Telemetry &amp; Evaluation</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-status-good/15 text-status-good font-semibold">CLEAR &middot; PASSED</span>
        </div>
        <div className="pt-1 text-[11px] text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Precedent Action:</span> {info.gateAction}
        </div>
      </div>
    </div>
  )
}

export function QualityInfoPanel({ nodeId }: { nodeId: string }) {
  const info = QUALITY_INFO[nodeId]
  if (!info) return null
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl border border-purple-500/25 bg-purple-500/5">
        <div className="flex items-center gap-2 mb-3">
          <GaugeIcon className="size-4 text-purple-400" />
          <span className="text-xs font-bold text-foreground">Quality Gate Dimension Rules</span>
          <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">{info.dimensionId}</span>
        </div>
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-muted/30 border-b border-border/60">
                <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground text-[10px] uppercase">Dimension</th>
                <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground text-[10px] uppercase">Weight</th>
                <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground text-[10px] uppercase">Rule Description</th>
              </tr>
            </thead>
            <tbody>
              {info.dimensions.map((dim) => (
                <tr key={dim.name} className="border-b border-border/30 last:border-b-0">
                  <td className="px-3 py-2 font-semibold text-foreground">{dim.name}</td>
                  <td className="px-3 py-2"><span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold text-[10px]">{dim.weight}</span></td>
                  <td className="px-3 py-2 text-muted-foreground leading-relaxed">{dim.rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="p-3.5 rounded-xl border border-border/60 bg-muted/10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BarChart3Icon className="size-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Quality Tier Compliance</span>
          </div>
          <span className="text-[10.5px] font-bold text-status-good">Current: 100.0% (Preferred)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {info.scoringTiers.map((t) => (
            <div key={t.tier} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/60 bg-card">
              <span className={cn("text-[11px] font-bold", t.color)}>{t.tier}</span>
              <span className="text-[10px] text-muted-foreground">{t.range}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground pt-1 leading-relaxed">
          <span className="font-semibold text-foreground">Enforcement Policy:</span> {info.failurePolicy}
        </p>
      </div>
    </div>
  )
}

export function EtlBreakagePanel({
  isStage1, onDropOrderId, onDropProductCode, onDropSalesAmount, onReset,
}: {
  isStage1: boolean
  onDropOrderId: () => void
  onDropProductCode: () => void
  onDropSalesAmount: () => void
  onReset: () => void
}) {
  return (
    <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ZapIcon className="size-4 text-amber-500" />
          <span className="text-xs font-bold text-foreground">{isStage1 ? "Simulate Primary Column Removal" : "Simulate Stage Breakage"}</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Downstream Failure Test</span>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {isStage1
          ? "Dropping the primary column ('order_id') in Stage 1 will immediately propagate failures across all subsequent ETL stages (S2, S3, S4) and Power BI dashboards."
          : "Simulate dropping intermediate transformed columns to evaluate immediate downstream impact."}
      </p>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {isStage1 && (
          <Button size="xs" variant="outline" className="text-red-400 border-red-500/40 hover:bg-red-500/15 font-bold" onClick={onDropOrderId}>
            Drop Primary Column ('order_id')
          </Button>
        )}
        <Button size="xs" variant="outline" className="text-amber-500 border-amber-500/30 hover:bg-amber-500/10 font-semibold" onClick={onDropProductCode}>
          Drop 'product_code'
        </Button>
        <Button size="xs" variant="outline" className="text-amber-500 border-amber-500/30 hover:bg-amber-500/10 font-semibold" onClick={onDropSalesAmount}>
          Drop 'sales_amount'
        </Button>
        <Button size="xs" variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={onReset}>
          <RotateCcwIcon className="size-3 mr-1" /> Reset Code
        </Button>
      </div>
    </div>
  )
}
