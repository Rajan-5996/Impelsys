import { useMemo, useRef } from "react"
import { motion } from "framer-motion"
import { MinusIcon, PlusIcon, RotateCcwIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { LineageEdgeLayer } from "./lineage-edge-layer"
import { LineageNodeComponent } from "./lineage-node"
import type { LineageNode } from "./lineage-types"
import { getVendorLineageConfig } from "./vendor-lineage-configs"
import { selectVendors } from "@/store/vendors-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  openPowerBiModal,
  resetCanvasTransform,
  selectMetadataLakehouse,
  setCanvasTransform,
  setHoveredNode,
  toggleAnomalySimulation,
} from "@/store/metadata-lakehouse-slice"

const NODE_WIDTH = 238
const ROW_SPACING = 92
const START_Y = 70

export function LineageCanvas() {
  const dispatch = useAppDispatch()
  const { nodes, edges, activeHoverNeighborMap: neighborMap, canvasTransform: transform, selectedNodeId, selectedVendorId } =
    useAppSelector(selectMetadataLakehouse)
  const vendors = useAppSelector(selectVendors)
  const vendorName = vendors.find((v) => v.vendor_id === selectedVendorId)?.name ?? selectedVendorId
  const vendorConfig = useMemo(() => getVendorLineageConfig(selectedVendorId, vendorName), [selectedVendorId, vendorName])

  const canvasRef = useRef<HTMLDivElement>(null)
  const sourceNodeIds = useMemo(
    () => Object.values(nodes).filter((n) => n.category === "source").map((n) => n.id).sort(),
    [nodes]
  )

  const nodePositions = useMemo(() => {
    const pos: Record<string, { x: number; y: number; width: number; height: number }> = {}
    const box = (x: number, y: number) => ({ x, y, width: NODE_WIDTH, height: 76 })

    if (sourceNodeIds.length === 1) pos[sourceNodeIds[0]!] = box(36, START_Y + 1.5 * ROW_SPACING)
    else if (sourceNodeIds.length === 2) {
      pos[sourceNodeIds[0]!] = box(36, START_Y + 0.6 * ROW_SPACING)
      pos[sourceNodeIds[1]!] = box(36, START_Y + 2.4 * ROW_SPACING)
    } else if (sourceNodeIds.length >= 3) {
      pos[sourceNodeIds[0]!] = box(36, START_Y + 0.2 * ROW_SPACING)
      pos[sourceNodeIds[1]!] = box(36, START_Y + 1.5 * ROW_SPACING)
      pos[sourceNodeIds[2]!] = box(36, START_Y + 2.8 * ROW_SPACING)
    }

    ;["anom-vol", "anom-schema", "anom-null", "anom-dup"].forEach((id, idx) => {
      pos[id] = box(340, START_Y + idx * ROW_SPACING)
    })
    ;["dq-fresh", "dq-complete", "dq-valid", "dq-ref"].forEach((id, idx) => {
      pos[id] = box(644, START_Y + idx * ROW_SPACING)
    })

    const queueStartX = 948
    const queueGap = 60
    ;["etl-s1", "etl-s2", "etl-s3", "etl-s4"].forEach((id, idx) => {
      pos[id] = box(queueStartX + idx * (NODE_WIDTH + queueGap), START_Y + 1.5 * ROW_SPACING)
    })

    const pbiStartX = queueStartX + 3 * (NODE_WIDTH + queueGap) + NODE_WIDTH + 70
    ;["pbi-kpi", "pbi-region", "pbi-cat", "pbi-churn"].forEach((id, idx) => {
      pos[id] = box(pbiStartX, START_Y + idx * ROW_SPACING)
    })

    return pos
  }, [sourceNodeIds])

  function handleNodeClick(node: LineageNode) {
    if (node.category === "anomaly" || node.category === "etl" || node.category === "quality" || node.category === "source") {
      dispatch(toggleAnomalySimulation(node.id))
    } else if (node.category === "powerbi") {
      dispatch(openPowerBiModal(node.id))
    }
  }

  function handleZoomIn() {
    dispatch(setCanvasTransform({ ...transform, scale: Math.min(transform.scale + 0.1, 1.4) }))
  }
  function handleZoomOut() {
    dispatch(setCanvasTransform({ ...transform, scale: Math.max(transform.scale - 0.1, 0.6) }))
  }

  return (
    <div
      ref={canvasRef}
      className="relative flex-1 w-full overflow-auto rounded-2xl border border-border bg-card/40 backdrop-blur-xs shadow-inner select-none"
      style={{ backgroundImage: "radial-gradient(circle, rgba(112, 48, 177, 0.12) 1.2px, transparent 1.2px)", backgroundSize: "22px 22px" }}
    >
      <div className="sticky top-4 right-4 z-20 float-right mr-4 flex items-center gap-1.5 rounded-xl border border-border bg-card/90 p-1.5 shadow-md backdrop-blur-md">
        <Button size="xs" variant="ghost" onClick={handleZoomIn} title="Zoom In"><PlusIcon className="size-3.5" /></Button>
        <Button size="xs" variant="ghost" onClick={handleZoomOut} title="Zoom Out"><MinusIcon className="size-3.5" /></Button>
        <span className="px-1 text-[11px] font-mono text-muted-foreground">{Math.round(transform.scale * 100)}%</span>
        <Button size="xs" variant="ghost" onClick={() => dispatch(resetCanvasTransform())} title="Reset View"><RotateCcwIcon className="size-3" /></Button>
      </div>

      <motion.div
        className="relative min-w-[2520px] min-h-[620px] p-8"
        style={{ transform: `scale(${transform.scale}) translate(${transform.offsetX}px, ${transform.offsetY}px)`, transformOrigin: "top left", transition: "transform 0.15s ease-out" }}
      >
        <div className="absolute top-4 left-0 right-0 h-14 pointer-events-none">
          <div style={{ left: "36px", width: "238px" }} className="absolute top-0 flex items-center justify-between px-3 py-2 rounded-xl border border-border/80 bg-muted/40 backdrop-blur-xs shadow-xs pointer-events-auto">
            <div className="min-w-0 mr-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">LEVEL 1: DATA SOURCES</span>
              <p className="text-xs font-bold text-foreground truncate">{vendorConfig.name} Feeds</p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
              {sourceNodeIds.length} Source{sourceNodeIds.length === 1 ? "" : "s"}
            </span>
          </div>

          <div style={{ left: "340px", width: "238px" }} className="absolute top-0 flex items-center justify-between px-3 py-2 rounded-xl border border-border/80 bg-muted/40 backdrop-blur-xs shadow-xs pointer-events-auto">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">LEVEL 2: ANOMALY AGENT</span>
              <p className="text-xs font-bold text-foreground">Pre-ETL Anomaly Gate</p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">4 Detectors</span>
          </div>

          <div style={{ left: "644px", width: "238px" }} className="absolute top-0 flex items-center justify-between px-3 py-2 rounded-xl border border-border/80 bg-muted/40 backdrop-blur-xs shadow-xs pointer-events-auto">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">LEVEL 3: QUALITY AGENT</span>
              <p className="text-xs font-bold text-foreground">Integrity Rules Gate</p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">4 Dimensions</span>
          </div>

          <div style={{ left: "948px", width: "1132px" }} className="absolute top-0 flex items-center justify-between px-4 py-2 rounded-xl border border-primary/40 bg-primary/5 backdrop-blur-xs shadow-xs pointer-events-auto">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">LEVEL 4: ETL PIPELINE (HORIZONTAL QUEUE)</span>
                <p className="text-xs font-bold text-foreground">{vendorConfig.pipelineTitle}</p>
              </div>
              <span className="text-muted-foreground/40">|</span>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                {(["etl-s1", "etl-s2", "etl-s3", "etl-s4"] as const).map((id, i) => (
                  <span key={id} className="flex items-center gap-1.5">
                    {i > 0 && <span>&rarr;</span>}
                    <span className="px-1.5 py-0.5 rounded bg-card border border-border text-foreground font-semibold">
                      S{i + 1}: {nodes[id]?.title ?? "..."}
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">{vendorConfig.pipelineCode}</span>
          </div>

          <div style={{ left: "2150px", width: "238px" }} className="absolute top-0 flex items-center justify-between px-3 py-2 rounded-xl border border-border/80 bg-muted/40 backdrop-blur-xs shadow-xs pointer-events-auto">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">LEVEL 5: POWER BI</span>
              <p className="text-xs font-bold text-foreground">Executive Dashboards</p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">4 Visuals</span>
          </div>
        </div>

        <LineageEdgeLayer
          edges={edges} nodes={nodes} nodePositions={nodePositions}
          highlightedEdgeIds={neighborMap.highlightedEdgeIds} dimmedEdgeIds={neighborMap.dimmedEdgeIds}
        />

        <div className="relative z-10">
          {Object.values(nodes).map((node) => {
            const pos = nodePositions[node.id]
            if (!pos) return null
            return (
              <div key={node.id} style={{ position: "absolute", left: `${pos.x}px`, top: `${pos.y}px` }}>
                <LineageNodeComponent
                  node={node}
                  isHighlighted={neighborMap.highlightedNodeIds.includes(node.id)}
                  isDimmed={neighborMap.dimmedNodeIds.includes(node.id)}
                  isSelected={selectedNodeId === node.id}
                  onSelectNode={handleNodeClick}
                  onHoverStart={(id) => dispatch(setHoveredNode(id))}
                  onHoverEnd={() => dispatch(setHoveredNode(null))}
                />
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
