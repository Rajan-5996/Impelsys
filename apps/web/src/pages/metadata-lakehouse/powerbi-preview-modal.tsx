import { AlertOctagonIcon, InfoIcon, LayoutDashboardIcon, RotateCcwIcon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@workspace/ui/components/dialog"

import { POWERBI_VISUAL_SPECS } from "./lineage-data"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closePowerBiModal, recomputeImpact, resetStageCode, selectMetadataLakehouse } from "@/store/metadata-lakehouse-slice"
import { pushToast } from "@/store/ui-slice"

const MOCK_BAR_DATA = [
  { name: "Electronics", value: 6850, fill: "#7030B1" },
  { name: "Software", value: 4920, fill: "#B56DD3" },
  { name: "Cloud Subs", value: 8340, fill: "#6F2B8B" },
  { name: "Hardware", value: 3100, fill: "#8F4BC0" },
]

export function PowerBiPreviewModal() {
  const dispatch = useAppDispatch()
  const { isPowerBiModalOpen: isOpen, inspectingPowerBiNodeId: nodeId, nodes, diagnosticSummary: diagnostic } =
    useAppSelector(selectMetadataLakehouse)

  if (!isOpen || !nodeId) return null

  const node = nodes[nodeId]
  const spec = POWERBI_VISUAL_SPECS[nodeId]
  const isBroken = node?.status === "error"

  function handleAutoRemediate() {
    if (diagnostic.rootCauseNodeId) dispatch(resetStageCode(diagnostic.rootCauseNodeId))
    dispatch(recomputeImpact())
    dispatch(pushToast("Restored upstream schema and refreshed Power BI visual.", "success"))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && dispatch(closePowerBiModal())}>
      <DialogContent className="max-w-2xl flex flex-col p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="p-5 pb-3 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <LayoutDashboardIcon className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">Power BI Visual Inspector</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">DirectLake Connection &middot; Workspace: GWC Executive Lakehouse</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/10">
            <div>
              <h4 className="text-xs font-bold text-foreground">{spec?.title ?? node?.title}</h4>
              <p className="text-[11px] text-muted-foreground">Aggregation: <span className="font-mono text-foreground">{spec?.aggregationMetric}</span></p>
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${isBroken ? "bg-status-critical/10 text-status-critical border-status-critical/20" : "bg-status-good/10 text-status-good border-status-good/20"}`}>
              {isBroken ? "Visual Render Failed" : "Visual Healthy (DirectLake)"}
            </span>
          </div>

          {isBroken ? (
            <div className="rounded-xl border border-status-critical/40 bg-status-critical/5 p-5 text-left space-y-3">
              <div className="flex items-center gap-2.5 text-status-critical">
                <AlertOctagonIcon className="size-5" />
                <h5 className="text-sm font-bold">Can&apos;t display the visual</h5>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                One or more fields required to compute this visual are missing, renamed, or incompatible in the upstream curated semantic model.
              </p>
              <div className="rounded-lg bg-card/80 p-3 border border-border space-y-1.5 font-mono text-[11px]">
                <p className="text-status-critical">Error: Missing upstream dependency column [{node?.columnDependencies.join(", ")}]</p>
                <p className="text-muted-foreground text-[10px]">Root Cause: Dropped in upstream stage [{node?.errorStageOrigin ?? "ETL Pipeline"}]</p>
                <p className="text-muted-foreground text-[10px]">DirectLake Status: Query terminated before materialization</p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10.5px] text-muted-foreground">Fix the upstream ETL script to restore visual rendering.</span>
                <Button size="xs" variant="outline" onClick={handleAutoRemediate}>
                  <RotateCcwIcon className="size-3" /> Auto-Remediate Upstream
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">DirectLake Live Query Output</span>
                <span className="text-[10.5px] text-muted-foreground">Refreshed: Just now</span>
              </div>

              {nodeId === "pbi-kpi" ? (
                <div className="grid grid-cols-2 gap-3 py-4">
                  <div className="p-4 rounded-xl bg-muted/20 border border-border text-center">
                    <span className="text-[11px] text-muted-foreground">Gross Revenue</span>
                    <p className="text-2xl font-bold text-foreground mt-1">$15,760.50</p>
                    <span className="text-[10px] text-status-good">+12.4% vs last cycle</span>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/20 border border-border text-center">
                    <span className="text-[11px] text-muted-foreground">Net Margin Total</span>
                    <p className="text-2xl font-bold text-primary mt-1">$14,320.80</p>
                    <span className="text-[10px] text-status-good">Healthy margin</span>
                  </div>
                </div>
              ) : (
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_BAR_DATA}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" fontSize={11} stroke="#888888" />
                      <YAxis fontSize={11} stroke="#888888" />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {MOCK_BAR_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t border-border bg-muted/20 flex items-center justify-between sm:justify-between">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <InfoIcon className="size-3.5" /> <span>Power BI Gateway: Operational</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => dispatch(closePowerBiModal())}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
