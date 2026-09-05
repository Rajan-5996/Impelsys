import { createLineageEdgesForSources } from "@/pages/metadata-lakehouse/lineage-data"
import { getVendorLineageConfig } from "@/pages/metadata-lakehouse/vendor-lineage-configs"
import type {
  ImpactDiagnosticSummary,
  LineageEdge,
  LineageNode,
  MetadataLakehouseState,
  NeighborHighlightMap,
} from "@/pages/metadata-lakehouse/lineage-types"

export const EXECUTION_TIER_GROUPS: string[][] = [
  ["src-1", "src-2", "src-3"],
  ["anom-vol", "anom-schema", "anom-null", "anom-dup"],
  ["dq-fresh", "dq-complete", "dq-valid", "dq-ref"],
  ["etl-s1"],
  ["etl-s2"],
  ["etl-s3"],
  ["etl-s4"],
  ["pbi-kpi", "pbi-region", "pbi-cat", "pbi-churn"],
]

export const initialNeighborMap: NeighborHighlightMap = {
  activeNodeId: null, highlightedNodeIds: [], highlightedEdgeIds: [], dimmedNodeIds: [], dimmedEdgeIds: [],
}

export const initialDiagnostic: ImpactDiagnosticSummary = {
  hasBreakage: false, rootCauseNodeId: null, culpritColumn: null,
  impactedEtlStages: [], brokenPbiVisuals: [],
  technicalRemediation: "Pipeline executing within nominal parameters. Zero schema drifts or integrity failures.",
  recoveryTimestamp: "Normal Operation",
}

export function applyVendorToNodes(
  vendorId: string,
  vendorName: string,
  baseNodes: Record<string, LineageNode>
): { nodes: Record<string, LineageNode>; edges: LineageEdge[] } {
  const cfg = getVendorLineageConfig(vendorId, vendorName)
  const updatedNodes: Record<string, LineageNode> = {}

  for (const [key, node] of Object.entries(baseNodes)) {
    if (node.category !== "source") {
      updatedNodes[key] = { ...node, status: "success" }
      delete updatedNodes[key].errorMessage
    }
  }

  cfg.sourceNodes.forEach((src) => {
    updatedNodes[src.id] = {
      id: src.id, tierId: "tier-source", category: "source",
      badgeCode: src.badgeCode, logoSrc: src.logoSrc,
      title: src.title, subtitle: src.subtitle, description: src.description,
      status: "success", inputPorts: [],
      outputPorts: [{ id: `out-${src.id}`, label: "Raw Records", dataType: "DataFrame" }],
      columnDependencies: [], columnsOutput: [],
    }
  })

  cfg.etlStages.forEach((stage) => {
    if (updatedNodes[stage.id]) {
      updatedNodes[stage.id] = {
        ...updatedNodes[stage.id],
        title: stage.title, subtitle: stage.subtitle, description: stage.description,
        columnDependencies: [...stage.columnDependencies], columnsOutput: [...stage.columnsOutput],
        status: "success",
      }
      delete updatedNodes[stage.id].errorMessage
    }
  })

  const edges = createLineageEdgesForSources(cfg.sourceNodes.map((s) => s.id))
  return { nodes: updatedNodes, edges }
}

export function calculateNeighborMap(
  activeNodeId: string | null,
  nodes: Record<string, LineageNode>,
  edges: LineageEdge[]
): NeighborHighlightMap {
  if (!activeNodeId) return initialNeighborMap
  const highlightedNodeIds = new Set<string>([activeNodeId])
  const highlightedEdgeIds = new Set<string>()

  let frontier = [activeNodeId]
  while (frontier.length > 0) {
    const nextFrontier: string[] = []
    for (const curr of frontier) {
      for (const e of edges) {
        if (e.sourceNodeId === curr && !highlightedNodeIds.has(e.targetNodeId)) {
          highlightedEdgeIds.add(e.id)
          highlightedNodeIds.add(e.targetNodeId)
          nextFrontier.push(e.targetNodeId)
        }
      }
    }
    frontier = nextFrontier
  }

  frontier = [activeNodeId]
  while (frontier.length > 0) {
    const nextFrontier: string[] = []
    for (const curr of frontier) {
      for (const e of edges) {
        if (e.targetNodeId === curr && !highlightedNodeIds.has(e.sourceNodeId)) {
          highlightedEdgeIds.add(e.id)
          highlightedNodeIds.add(e.sourceNodeId)
          nextFrontier.push(e.sourceNodeId)
        }
      }
    }
    frontier = nextFrontier
  }

  const dimmedNodeIds = Object.keys(nodes).filter((id) => !highlightedNodeIds.has(id))
  const dimmedEdgeIds = edges.filter((e) => !highlightedEdgeIds.has(e.id)).map((e) => e.id)

  return {
    activeNodeId,
    highlightedNodeIds: Array.from(highlightedNodeIds),
    highlightedEdgeIds: Array.from(highlightedEdgeIds),
    dimmedNodeIds, dimmedEdgeIds,
  }
}

export function detectDroppedColumn(
  state: MetadataLakehouseState
): { droppedCol: string | null; rootNode: string | null } {
  const firstRecord = state.rawDatasetRecords[0]
  if (firstRecord) {
    if (firstRecord.order_id === "" || firstRecord.order_id === undefined) return { droppedCol: "order_id", rootNode: "etl-s1" }
    if (firstRecord.product_code === "" || firstRecord.product_code === undefined) return { droppedCol: "product_code", rootNode: "etl-s1" }
    if (firstRecord.sales_amount === undefined || isNaN(Number(firstRecord.sales_amount))) return { droppedCol: "sales_amount", rootNode: "etl-s1" }
  }

  for (const [nodeId, def] of Object.entries(state.codeOverrides)) {
    if (def.droppedColumns && def.droppedColumns.length > 0) return { droppedCol: def.droppedColumns[0]!, rootNode: nodeId }
    const dropMatch = def.pySparkCode.match(/\.drop\(["']([a-zA-Z0-9_]+)["']\)/)
    if (dropMatch) return { droppedCol: dropMatch[1]!, rootNode: nodeId }
  }
  return { droppedCol: null, rootNode: null }
}

export function getDownstreamNodeIds(startNodeId: string, edges: LineageEdge[]): Set<string> {
  const downstream = new Set<string>()
  let frontier = [startNodeId]
  while (frontier.length > 0) {
    const nextFrontier: string[] = []
    for (const curr of frontier) {
      for (const edge of edges) {
        if (edge.sourceNodeId === curr && !downstream.has(edge.targetNodeId)) {
          downstream.add(edge.targetNodeId)
          nextFrontier.push(edge.targetNodeId)
        }
      }
    }
    frontier = nextFrontier
  }
  return downstream
}
