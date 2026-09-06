import type { LineageEdge, LineageNode, MetadataLakehouseState, NeighborHighlightMap } from "@/pages/metadata-lakehouse/lineage-types"

import {
  calculateNeighborMap,
  detectDroppedColumn,
  EXECUTION_TIER_GROUPS,
  getDownstreamNodeIds,
  initialDiagnostic,
  initialNeighborMap,
} from "./lineage-reducer-logic"
import { SIMULATION_RULES } from "./lineage-simulation-rules"

export function buildIncidentNeighborMap(
  triggerNodeId: string,
  nodes: Record<string, LineageNode>,
  edges: LineageEdge[]
): NeighborHighlightMap {
  const rule = SIMULATION_RULES[triggerNodeId]
  if (!rule) return calculateNeighborMap(triggerNodeId, nodes, edges)

  const highlightedNodeIds = [triggerNodeId, ...Object.keys(rule.affectedNodes)]
  const highlightedEdgeIds = edges
    .filter((e) => highlightedNodeIds.includes(e.sourceNodeId) && highlightedNodeIds.includes(e.targetNodeId))
    .map((e) => e.id)
  return {
    activeNodeId: triggerNodeId, highlightedNodeIds, highlightedEdgeIds,
    dimmedNodeIds: Object.keys(nodes).filter((id) => !highlightedNodeIds.includes(id)),
    dimmedEdgeIds: edges.filter((e) => !highlightedEdgeIds.includes(e.id)).map((e) => e.id),
  }
}

export function applyAnomalyToggle(state: MetadataLakehouseState, triggerNodeId: string) {
  if (state.activeSimulatedAnomalyNodeId === triggerNodeId) {
    state.activeSimulatedAnomalyNodeId = null
    for (const id of Object.keys(state.nodes)) {
      state.nodes[id]!.status = "success"
      delete state.nodes[id]!.errorMessage
    }
    state.diagnosticSummary = initialDiagnostic
    state.activeHoverNeighborMap = initialNeighborMap
    return
  }

  state.activeSimulatedAnomalyNodeId = triggerNodeId
  const triggerNode = state.nodes[triggerNodeId]
  const triggerTitle = triggerNode?.title ?? "Pipeline Node"
  const rule = SIMULATION_RULES[triggerNodeId]

  if (rule) {
    if (state.nodes[triggerNodeId]) {
      state.nodes[triggerNodeId]!.status = rule.triggerStatus
      state.nodes[triggerNodeId]!.errorMessage = rule.triggerMessage
    }
    for (const [nodeId, node] of Object.entries(state.nodes)) {
      if (nodeId === triggerNodeId) continue
      const effect = rule.affectedNodes[nodeId]
      if (effect) {
        node.status = effect.status
        node.errorMessage = effect.errorMessage
      } else {
        node.status = "success"
        delete node.errorMessage
      }
    }
    state.diagnosticSummary = {
      hasBreakage: true, rootCauseNodeId: triggerNodeId, culpritColumn: rule.culpritEntity,
      impactedEtlStages: rule.impactedEtlStages, brokenPbiVisuals: rule.brokenPbiVisuals,
      technicalRemediation: rule.technicalRemediation, recoveryTimestamp: new Date().toLocaleTimeString(),
    }
    state.activeHoverNeighborMap = buildIncidentNeighborMap(triggerNodeId, state.nodes, state.edges)
  } else {
    const downstreamIds = getDownstreamNodeIds(triggerNodeId, state.edges)
    state.nodes[triggerNodeId]!.status = "error"
    state.nodes[triggerNodeId]!.errorMessage = `I've stopped ${triggerTitle} — it failed to run.`

    const impactedEtl: string[] = []
    const brokenPbis: string[] = []
    if (triggerNode?.category === "etl") impactedEtl.push(triggerTitle)

    for (const [nodeId, node] of Object.entries(state.nodes)) {
      if (nodeId === triggerNodeId) continue
      if (downstreamIds.has(nodeId)) {
        node.status = "error"
        node.errorMessage = `Waiting on ${triggerTitle} to recover — it's currently failing.`
        if (node.category === "etl") impactedEtl.push(node.title)
        if (node.category === "powerbi") brokenPbis.push(node.title)
      } else {
        node.status = "success"
        delete node.errorMessage
      }
    }

    state.diagnosticSummary = {
      hasBreakage: true, rootCauseNodeId: triggerNodeId, culpritColumn: "pipeline_stage",
      impactedEtlStages: impactedEtl, brokenPbiVisuals: brokenPbis,
      technicalRemediation: `I stopped the pipeline at '${triggerTitle}'. Everything downstream is paused until this is resolved — click '${triggerTitle}' again, or use Clear Issue, to restore it.`,
      recoveryTimestamp: new Date().toLocaleTimeString(),
    }
    state.activeHoverNeighborMap = calculateNeighborMap(triggerNodeId, state.nodes, state.edges)
  }
}

export function applyAdvanceStep(state: MetadataLakehouseState) {
  const stepIdx = state.simulationState.currentExecutionIndex
  const { droppedCol, rootNode } = detectDroppedColumn(state)

  for (let i = 0; i < stepIdx; i++) {
    const group = EXECUTION_TIER_GROUPS[i]
    if (!group) continue
    for (const nodeId of group) {
      if (state.nodes[nodeId] && state.nodes[nodeId]!.status !== "error") state.nodes[nodeId]!.status = "success"
    }
  }

  if (stepIdx >= EXECUTION_TIER_GROUPS.length) {
    state.simulationState.isRunning = false
    state.simulationState.activeExecutingNodeId = null
    return
  }

  const currentGroup = EXECUTION_TIER_GROUPS[stepIdx]
  if (!currentGroup) return
  let hasBreakageInCurrentGroup = false

  for (const nodeId of currentGroup) {
    const node = state.nodes[nodeId]
    if (!node) continue
    if (droppedCol && node.columnDependencies.includes(droppedCol)) {
      node.status = "error"
      node.errorMessage = `The '${droppedCol}' column is missing by the time it reaches ${node.title}.`
      node.errorStageOrigin = rootNode ?? "upstream"
      hasBreakageInCurrentGroup = true
    } else {
      node.status = "running"
    }
  }

  state.simulationState.activeExecutingNodeId = currentGroup[0] ?? null

  if (hasBreakageInCurrentGroup) {
    state.simulationState.isRunning = false
    const rootNodeTitle = (rootNode && state.nodes[rootNode]?.title) || rootNode || "Stage 1"
    state.diagnosticSummary = {
      hasBreakage: true, rootCauseNodeId: rootNode, culpritColumn: droppedCol,
      impactedEtlStages: currentGroup.filter((id) => state.nodes[id]?.category === "etl").map((id) => state.nodes[id]!.title),
      brokenPbiVisuals: ["Total Net Revenue (USD)", "Regional Sales Performance", "Product Category Revenue Split", "Customer Segment Distribution"],
      technicalRemediation: `I had to pause the pipeline at step ${stepIdx + 1}. It looks like the '${droppedCol}' column was removed back in ${rootNodeTitle}, so I can't safely continue — the dashboards further downstream won't be accurate until it's restored.`,
      recoveryTimestamp: new Date().toLocaleTimeString(),
    }
  } else {
    state.simulationState.currentExecutionIndex += 1
  }
}

export function applyRecomputeImpact(state: MetadataLakehouseState) {
  const { droppedCol, rootNode } = detectDroppedColumn(state)
  if (!droppedCol) {
    for (const nodeId of Object.keys(state.nodes)) {
      state.nodes[nodeId]!.status = "success"
      delete state.nodes[nodeId]!.errorMessage
    }
    state.diagnosticSummary = initialDiagnostic
    return
  }

  const impactedStages: string[] = []
  const brokenPbis: string[] = []
  const rootTitle = (rootNode && state.nodes[rootNode]?.title) || rootNode || "Stage 1"

  for (const [nodeId, node] of Object.entries(state.nodes)) {
    if (node.columnDependencies.includes(droppedCol) && nodeId !== rootNode) {
      node.status = "error"
      node.errorMessage = droppedCol === "order_id"
        ? `The '${droppedCol}' column — which uniquely identifies each record — was removed in ${rootTitle}, so I can't safely process this further.`
        : `Missing the '${droppedCol}' column, which was removed back in ${rootTitle}.`
      node.errorStageOrigin = rootNode ?? "upstream"
      if (node.category === "etl") impactedStages.push(node.title)
      if (node.category === "powerbi") brokenPbis.push(node.title)
    } else {
      node.status = "success"
      delete node.errorMessage
    }
  }

  if (rootNode && state.nodes[rootNode] && state.nodes[rootNode]!.category === "etl") {
    state.nodes[rootNode]!.status = "warning"
    state.nodes[rootNode]!.errorMessage = `I removed the '${droppedCol}' column in this step.`
  }

  state.diagnosticSummary = {
    hasBreakage: true, rootCauseNodeId: rootNode, culpritColumn: droppedCol,
    impactedEtlStages: impactedStages,
    brokenPbiVisuals: brokenPbis.length > 0 ? brokenPbis : ["Total Net Revenue (USD)", "Product Category Revenue Split"],
    technicalRemediation: droppedCol === "order_id"
      ? `The '${droppedCol}' column — which I use to uniquely identify every record — was removed in ${rootTitle}. Without it I can't reliably process the steps that follow (${impactedStages.join(" → ")}), so those dashboards are affected too.`
      : `The '${droppedCol}' column was removed in ${rootTitle}. I can't complete the steps that depend on it, so the affected dashboards aren't showing current data.`,
    recoveryTimestamp: new Date().toLocaleTimeString(),
  }
}
