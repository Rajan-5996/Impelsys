import { useEffect, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { EdgePackets, type Point } from "@/components/canvas-edge-packets"
import { NodeIcon, type StageNodeState } from "@/components/stage-flow"
import { NODE_STYLE } from "@/lib/stage-visual"

export type CanvasNode = {
  id: string
  kind: "connector" | "stage" | "output"
  label: string
  logo?: string
  icon?: LucideIcon
  state?: StageNodeState
  clickable?: boolean
  onClick?: () => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

const CONNECTOR_NODE_WIDTH = 132
const STAGE_NODE_SIZE = 64

/** An interactive node canvas for the Smart ETL run flow -- a dotted infinite-
 * canvas background, draggable connector/stage nodes, and edges (with
 * flowing data-packet animation) that stay attached and redraw live as nodes
 * move. Positions are laid out neatly on first render, then only overridden
 * for nodes the user has actually dragged. */
export function PipelineCanvas({
  connectors,
  stages,
  outputs = [],
}: {
  connectors: CanvasNode[]
  stages: CanvasNode[]
  outputs?: CanvasNode[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [positions, setPositions] = useState<Record<string, Point>>({})

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const connectorIds = connectors.map((c) => c.id).join(",")
  const stageIds = stages.map((s) => s.id).join(",")
  const outputIds = outputs.map((o) => o.id).join(",")

  useEffect(() => {
    if (size.width === 0 || size.height === 0) return
    setPositions((prev) => {
      const next = { ...prev }
      let changed = false
      const marginX = Math.min(120, size.width * 0.12)
      const usableW = Math.max(size.width - marginX * 2, 1)

      connectors.forEach((node, index) => {
        if (next[node.id]) return
        const x =
          connectors.length === 1
            ? size.width / 2
            : marginX + (usableW * index) / (connectors.length - 1)
        next[node.id] = { x, y: size.height * 0.22 }
        changed = true
      })
      stages.forEach((node, index) => {
        if (next[node.id]) return
        const x = marginX + (usableW * index) / Math.max(stages.length - 1, 1)
        next[node.id] = { x, y: size.height * 0.72 }
        changed = true
      })
      outputs.forEach((node, index) => {
        if (next[node.id]) return
        const x = size.width - marginX * 0.6
        const spread = Math.min(size.height * 0.42, 60 * Math.max(outputs.length - 1, 1))
        const baseY = size.height * 0.72
        const y =
          outputs.length === 1
            ? baseY
            : baseY - spread / 2 + (spread * index) / (outputs.length - 1)
        next[node.id] = { x, y }
        changed = true
      })

      return changed ? next : prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height, connectorIds, stageIds, outputIds])

  function handlePointerDown(nodeId: string, event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault()
    const container = containerRef.current
    const pos = positions[nodeId]
    if (!container || !pos) return
    const rect = container.getBoundingClientRect()
    const offsetX = event.clientX - rect.left - pos.x
    const offsetY = event.clientY - rect.top - pos.y

    function onMove(moveEvent: PointerEvent) {
      const r = container!.getBoundingClientRect()
      const x = clamp(moveEvent.clientX - r.left - offsetX, 32, r.width - 32)
      const y = clamp(moveEvent.clientY - r.top - offsetY, 32, r.height - 32)
      setPositions((prev) => ({ ...prev, [nodeId]: { x, y } }))
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  const edges: { from: string; to: string }[] = []
  if (stages.length > 0) {
    for (const connector of connectors) edges.push({ from: connector.id, to: stages[0]!.id })
    for (let i = 0; i < stages.length - 1; i++) {
      edges.push({ from: stages[i]!.id, to: stages[i + 1]!.id })
    }
    const lastStage = stages[stages.length - 1]!
    for (const output of outputs) edges.push({ from: lastStage.id, to: output.id })
  }

  // Only the edge feeding whichever stage is actually being worked on right
  // now should show flowing particles -- edges into a done/paused/failed/
  // pending stage represent data that already arrived or isn't moving yet.
  const stageStateById: Record<string, StageNodeState> = {}
  for (const node of stages) stageStateById[node.id] = node.state ?? "pending"
  for (const node of outputs) stageStateById[node.id] = "done"

  function edgeIsFlowing(toId: string) {
    const state = stageStateById[toId]
    return state === "active" || state === "in-progress"
  }

  function renderNode(node: CanvasNode) {
    const pos = positions[node.id]
    if (!pos) return null
    const isConnector = node.kind === "connector"
    const isOutput = node.kind === "output"
    const width = isConnector ? CONNECTOR_NODE_WIDTH : STAGE_NODE_SIZE

    return (
      <div
        key={node.id}
        onPointerDown={(event) => handlePointerDown(node.id, event)}
        className="absolute flex cursor-grab touch-none flex-col items-center gap-1.5 active:cursor-grabbing"
        style={{ left: pos.x, top: pos.y, width, transform: "translate(-50%, -50%)" }}
      >
        {isConnector ? (
          <div className="flex w-full flex-col items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-3.5 shadow-sm select-none">
            <img src={node.logo} alt="" className="size-8 object-contain" draggable={false} />
            <span className="text-[11px] font-semibold text-foreground">{node.label}</span>
          </div>
        ) : (
          <>
            <button
              type="button"
              disabled={!node.clickable}
              onClick={node.onClick}
              className={cn(
                "flex items-center justify-center rounded-full border-2 shadow-sm select-none",
                NODE_STYLE[isOutput ? "done" : (node.state ?? "pending")],
                node.clickable && "cursor-pointer hover:brightness-95"
              )}
              style={{ width: STAGE_NODE_SIZE, height: STAGE_NODE_SIZE }}
            >
              <NodeIcon
                state={isOutput ? "done" : (node.state ?? "pending")}
                stageKey={node.id}
                overrideIcon={node.icon}
                size="lg"
              />
            </button>
            <span className="max-w-28 text-center text-[10.5px] font-semibold break-words text-foreground">
              {node.label}
            </span>
          </>
        )}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-[420px] w-full overflow-hidden rounded-lg border border-border bg-card"
      style={{
        backgroundImage: "radial-gradient(circle, var(--color-border) 1.5px, transparent 1.5px)",
        backgroundSize: "24px 24px",
      }}
    >
      <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
        {edges.map((edge) => {
          const from = positions[edge.from]
          const to = positions[edge.to]
          if (!from || !to) return null
          const midY = from.y + (to.y - from.y) * 0.5
          const d = `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <path d={d} fill="none" stroke="var(--color-border)" strokeDasharray="3 4" strokeWidth={1.5} />
              {edgeIsFlowing(edge.to) ? (
                <EdgePackets from={from} to={to} seedBase={edge.from.length + edge.to.length} />
              ) : null}
            </g>
          )
        })}
      </svg>
      {connectors.map(renderNode)}
      {stages.map(renderNode)}
      {outputs.map(renderNode)}
    </div>
  )
}
