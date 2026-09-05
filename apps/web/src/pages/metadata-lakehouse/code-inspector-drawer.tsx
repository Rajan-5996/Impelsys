import { useState } from "react"
import {
  ActivityIcon, AlertTriangleIcon, CheckCircle2Icon, Code2Icon, InfoIcon, LayersIcon,
  PlayIcon, ShieldAlertIcon, ShieldCheckIcon,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"

import { AnomalyInfoPanel, EtlBreakagePanel, QualityInfoPanel } from "./code-inspector-panels"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeCodeDrawer, recomputeImpact, resetStageCode, selectMetadataLakehouse, updateStageCode } from "@/store/metadata-lakehouse-slice"
import { pushToast } from "@/store/ui-slice"

export function CodeInspectorDrawer() {
  const dispatch = useAppDispatch()
  const { isCodeDrawerOpen: isOpen, selectedNodeId, codeOverrides, nodes } = useAppSelector(selectMetadataLakehouse)

  const stageDef = selectedNodeId ? codeOverrides[selectedNodeId] : null
  const node = selectedNodeId ? nodes[selectedNodeId] : null

  const [codeDraft, setCodeDraft] = useState(stageDef?.pySparkCode ?? "")
  const [prevNodeId, setPrevNodeId] = useState(selectedNodeId)

  if (selectedNodeId !== prevNodeId) {
    setPrevNodeId(selectedNodeId)
    setCodeDraft(stageDef?.pySparkCode ?? "")
  }

  if (!isOpen || !stageDef || !node) return null

  const isEtlNode = node.category === "etl"
  const isAnomalyNode = node.category === "anomaly"
  const isQualityNode = node.category === "quality"

  function dropColumn(col: string) {
    if (!stageDef) return
    const droppedCode = `${stageDef.originalCode}\n# SIMULATED BREAKAGE: Dropping column '${col}'\ndf = df.drop("${col}")`
    setCodeDraft(droppedCode)
    dispatch(updateStageCode({ nodeId: stageDef.nodeId, newCode: droppedCode, droppedColumns: [col] }))
    dispatch(recomputeImpact())
    dispatch(pushToast(`Dropped column '${col}' in ${stageDef.subNodeName}. Recomputed downstream impact.`, "warn"))
  }

  function handleResetCode() {
    if (!stageDef) return
    dispatch(resetStageCode(stageDef.nodeId))
    setCodeDraft(stageDef.originalCode)
    dispatch(recomputeImpact())
    dispatch(pushToast("Restored original transformation code and recovered schema continuity.", "info"))
  }

  function handleRunFromThisStage() {
    if (!stageDef) return
    const match = codeDraft.match(/\.drop\(["']([a-zA-Z0-9_]+)["']\)/)
    dispatch(updateStageCode({ nodeId: stageDef.nodeId, newCode: codeDraft, droppedColumns: match ? [match[1]!] : [] }))
    dispatch(recomputeImpact())
    dispatch(closeCodeDrawer())
    dispatch(pushToast(`Executed pipeline from ${stageDef.subNodeName}. Recomputed downstream DAG impact.`, "success"))
  }

  const headerIcon = isAnomalyNode ? <ShieldAlertIcon className="size-4" /> : isQualityNode ? <ShieldCheckIcon className="size-4" /> : <Code2Icon className="size-4" />
  const headerBg = isAnomalyNode ? "bg-amber-500/15 text-amber-500 border-amber-500/30" : isQualityNode ? "bg-purple-500/15 text-purple-400 border-purple-500/30" : "bg-standard/15 text-standard border-standard/30"
  const levelSubtitle = isAnomalyNode
    ? "LEVEL 2: DATA ANOMALY AGENT"
    : isQualityNode
    ? "LEVEL 3: DATA QUALITY AGENT"
    : isEtlNode
    ? `LEVEL 4: ETL PIPELINE - Queue Stage ${stageDef.stageNumber} of 4`
    : "DATA PIPELINE NODE INSPECTOR"

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && dispatch(closeCodeDrawer())}>
      <SheetContent side="right" className="w-full sm:max-w-2xl h-full flex flex-col p-0 border-l border-border bg-card">
        <SheetHeader className="p-5 pb-3 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <span className={cn("flex size-8 items-center justify-center rounded-lg border", headerBg)}>{headerIcon}</span>
            <div>
              <SheetTitle className="text-sm font-bold text-foreground">{stageDef.stageName}</SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Sub-Node: <span className="font-semibold text-foreground">{stageDef.subNodeName}</span> &middot; {levelSubtitle}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border/60 bg-muted/20">
            <InfoIcon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground">{node.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{node.description}</p>
            </div>
          </div>

          {node.status === "error" && (
            <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 space-y-1">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                <AlertTriangleIcon className="size-4 shrink-0" /> <span>Upstream Failure Propagation Detected</span>
              </div>
              <p className="text-[11.5px] text-foreground/90 pl-6 leading-relaxed">
                {node.errorMessage || "This node cannot process records because an upstream primary column was dropped."}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/60 bg-muted/10">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Status:</span>
              <span className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold",
                node.status === "success" && "bg-status-good/15 text-status-good",
                node.status === "error" && "bg-status-critical/15 text-status-critical",
                node.status === "running" && "bg-primary/15 text-primary animate-pulse",
                node.status === "queued" && "bg-muted text-muted-foreground",
                node.status === "warning" && "bg-amber-500/15 text-amber-500"
              )}>
                {node.status === "success" && <CheckCircle2Icon className="size-3" />}
                {node.status === "error" && <AlertTriangleIcon className="size-3" />}
                {node.status.toUpperCase()}
              </span>
            </div>
            <span className="text-muted-foreground/30">&middot;</span>
            <span className="text-[10.5px] text-muted-foreground">Badge: <span className="font-mono font-semibold text-foreground">{node.badgeCode}</span></span>
            <span className="text-muted-foreground/30">&middot;</span>
            <span className="text-[10.5px] text-muted-foreground">Tier: <span className="font-semibold text-foreground uppercase">{node.tierId.replace("tier-", "")}</span></span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-border bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Ingress Columns</span>
                {isEtlNode && <span className="text-[9.5px] text-muted-foreground">Click x to drop</span>}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {stageDef.requiredInputs.map((col) => {
                  const isPrimary = col === "order_id"
                  return (
                    <span key={col} className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-mono", isPrimary ? "bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold" : "bg-muted text-foreground border border-border/50")}>
                      {col}
                      {isPrimary && <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">KEY</span>}
                      {isEtlNode && (
                        <button type="button" onClick={() => dropColumn(col)} title={`Simulate dropping ${col}`} className="ml-0.5 text-muted-foreground hover:text-red-400 transition-colors">
                          &times;
                        </button>
                      )}
                    </span>
                  )
                })}
              </div>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/10">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Produced Egress Columns</span>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {stageDef.producedOutputs.slice(0, 6).map((col) => (
                  <span key={col} className="px-1.5 py-0.5 rounded bg-primary/10 text-[10.5px] font-mono text-primary font-medium">{col}</span>
                ))}
                {stageDef.producedOutputs.length > 6 && (
                  <span className="text-[10px] text-muted-foreground self-center">+{stageDef.producedOutputs.length - 6} more</span>
                )}
              </div>
            </div>
          </div>

          {isAnomalyNode && <AnomalyInfoPanel nodeId={node.id} />}
          {isQualityNode && <QualityInfoPanel nodeId={node.id} />}
          {isEtlNode && (
            <EtlBreakagePanel
              isStage1={node.id === "etl-s1"}
              onDropOrderId={() => dropColumn("order_id")}
              onDropProductCode={() => dropColumn("product_code")}
              onDropSalesAmount={() => dropColumn("sales_amount")}
              onReset={handleResetCode}
            />
          )}

          <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/40 bg-muted/5">
            <div className="flex items-center gap-1.5">
              <LayersIcon className="size-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Tier:</span>
              <span className="text-[10.5px] font-semibold text-foreground">{node.tierId.replace("tier-", "").toUpperCase()}</span>
            </div>
            <span className="text-muted-foreground/30">&middot;</span>
            <div className="flex items-center gap-1.5">
              <ActivityIcon className="size-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Inputs:</span>
              <span className="text-[10.5px] font-semibold text-foreground">{node.inputPorts.length}</span>
            </div>
            <span className="text-muted-foreground/30">&middot;</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">Outputs:</span>
              <span className="text-[10.5px] font-semibold text-foreground">{node.outputPorts.length}</span>
            </div>
            {node.stageNumber !== undefined && (
              <>
                <span className="text-muted-foreground/30">&middot;</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">ETL Stage:</span>
                  <span className="text-[10.5px] font-mono font-bold text-primary">{node.stageNumber}</span>
                </div>
              </>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                {isEtlNode ? "Transformation Script (Editable PySpark / Python)" : "Detection Logic (Python Source)"}
              </label>
              {stageDef.isCustomModified && (
                <span className="text-[10.5px] font-medium text-amber-500 flex items-center gap-1">
                  <AlertTriangleIcon className="size-3" /> Modified from original
                </span>
              )}
            </div>
            <div className="rounded-lg border border-border bg-slate-950 p-1 shadow-inner">
              <textarea
                value={codeDraft}
                onChange={(e) => setCodeDraft(e.target.value)}
                readOnly={!isEtlNode}
                rows={isEtlNode ? 12 : 10}
                className={cn("w-full resize-none border-0 bg-transparent p-3 font-mono text-xs text-emerald-400 focus:outline-none focus:ring-0 leading-relaxed", !isEtlNode && "cursor-default opacity-80")}
                placeholder="Write or edit PySpark transformation logic..."
              />
            </div>
          </div>
        </div>

        <SheetFooter className="p-4 border-t border-border bg-muted/20 flex items-center justify-between flex-row">
          <Button variant="ghost" size="sm" onClick={() => dispatch(closeCodeDrawer())}>Cancel</Button>
          {isEtlNode ? (
            <Button size="sm" onClick={handleRunFromThisStage} className="bg-primary text-primary-foreground font-semibold">
              <PlayIcon className="size-3.5 fill-current" /> Run From This Stage
            </Button>
          ) : (
            <Button size="sm" onClick={() => dispatch(closeCodeDrawer())} className="bg-primary text-primary-foreground font-semibold">
              <CheckCircle2Icon className="size-3.5" /> Close Inspector
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
