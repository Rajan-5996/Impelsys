import type { LineageEdge, LineageNode } from "./lineage-types"
import { LINEAGE_NODE_HEIGHT } from "./lineage-ports"

interface LineageEdgeLayerProps {
  edges: LineageEdge[]
  nodes: Record<string, LineageNode>
  nodePositions: Record<string, { x: number; y: number; width: number; height: number }>
  highlightedEdgeIds: string[]
  dimmedEdgeIds: string[]
}

function getPortCoordinates(
  sourcePos: { x: number; y: number; width: number; height: number },
  targetPos: { x: number; y: number; width: number; height: number }
): { startX: number; startY: number; endX: number; endY: number } {
  return {
    startX: sourcePos.x + sourcePos.width,
    startY: sourcePos.y + LINEAGE_NODE_HEIGHT / 2,
    endX: targetPos.x,
    endY: targetPos.y + LINEAGE_NODE_HEIGHT / 2,
  }
}

// A cubic bezier with horizontal tangents at both ends: the curve leaves the
// source port and arrives at the target port moving purely horizontally, so
// every line reads as anchored to its node instead of angling off at a
// diagonal. Multiple edges sharing one source port naturally fan out from
// that single point into a smooth trumpet shape (matching a hand-drawn
// org-chart connector) rather than the rigid elbow this used to draw.
function calculatePath(startX: number, startY: number, endX: number, endY: number): string {
  const dx = endX - startX
  const controlOffset = Math.max(Math.abs(dx) * 0.5, 40)
  return `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`
}

export function LineageEdgeLayer({ edges, nodes, nodePositions, highlightedEdgeIds, dimmedEdgeIds }: LineageEdgeLayerProps) {
  const highlightedSet = new Set(highlightedEdgeIds)
  const dimmedSet = new Set(dimmedEdgeIds)

  return (
    <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" style={{ zIndex: 1 }}>
      <defs>
        <filter id="edge-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {(["purple", "highlight", "error", "dimmed"] as const).map((kind) => (
          <marker key={kind} id={`marker-arrow-${kind}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path
              d="M 0 1.5 L 8 5 L 0 8.5 z"
              fill={kind === "purple" ? "#8B5CF6" : kind === "highlight" ? "#7030B1" : kind === "error" ? "#EF4444" : "#C4B5FD"}
            />
          </marker>
        ))}
      </defs>

      {edges.map((edge) => {
        const sourcePos = nodePositions[edge.sourceNodeId]
        const targetPos = nodePositions[edge.targetNodeId]
        if (!sourcePos || !targetPos) return null

        const sourceNode = nodes[edge.sourceNodeId]
        const targetNode = nodes[edge.targetNodeId]
        const { startX, startY, endX, endY } = getPortCoordinates(sourcePos, targetPos)
        const pathD = calculatePath(startX, startY, endX, endY)

        const isHighlighted = highlightedSet.has(edge.id)
        const isDimmed = dimmedSet.has(edge.id)
        const isTargetError = targetNode?.status === "error"
        const isSourceTroubled = sourceNode?.status === "error" || sourceNode?.status === "warning"
        const isErrorFlow = isTargetError && (isSourceTroubled || isHighlighted)

        const strokeColor = isErrorFlow ? "#EF4444" : isHighlighted ? "#7030B1" : isDimmed ? "#C4B5FD" : "#8B5CF6"
        const strokeWidth = isHighlighted ? 2.5 : isErrorFlow ? 2.5 : isDimmed ? 1.5 : 2
        const strokeOpacity = isHighlighted ? 1.0 : isErrorFlow ? 0.95 : isDimmed ? 0.5 : 0.85
        const markerId = isErrorFlow
          ? "url(#marker-arrow-error)"
          : isHighlighted
          ? "url(#marker-arrow-highlight)"
          : isDimmed
          ? "url(#marker-arrow-dimmed)"
          : "url(#marker-arrow-purple)"

        return (
          <g key={edge.id} className="transition-opacity duration-200">
            {isHighlighted && (
              <path d={pathD} fill="none" stroke="#7030B1" strokeWidth={7} strokeOpacity={0.3} filter="url(#edge-glow)" />
            )}
            <path
              d={pathD} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeOpacity={strokeOpacity}
              strokeDasharray={isErrorFlow ? "5,4" : isDimmed ? "4,3" : undefined} markerEnd={markerId}
            />
            {!isDimmed && (
              <circle
                r={isHighlighted ? 4 : isErrorFlow ? 3.5 : 3}
                fill={isErrorFlow ? "#EF4444" : isHighlighted ? "#FFFFFF" : "#C084FC"}
                stroke={isHighlighted ? "#7030B1" : undefined} strokeWidth={isHighlighted ? 1.5 : 0} opacity={0.95}
              >
                <animateMotion dur={isHighlighted ? "2.5s" : "3.5s"} repeatCount="indefinite" path={pathD} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
              </circle>
            )}
            {isHighlighted && !isErrorFlow && (
              <circle r={2.5} fill="#7030B1" opacity={0.8}>
                <animateMotion dur="2.5s" begin="-1.25s" repeatCount="indefinite" path={pathD} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
              </circle>
            )}
          </g>
        )
      })}
    </svg>
  )
}