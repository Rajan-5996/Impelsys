import type { MetadataLakehouseState } from "@/pages/metadata-lakehouse/lineage-types"

import {
  calculateNeighborMap,
  detectDroppedColumn,
  EXECUTION_TIER_GROUPS,
  getDownstreamNodeIds,
  initialDiagnostic,
  initialNeighborMap,
} from "./lineage-reducer-logic"
import { SIMULATION_RULES } from "./lineage-simulation-rules"

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
    const highlightedNodeIds = [triggerNodeId, ...Object.keys(rule.affectedNodes)]
    const highlightedEdgeIds = state.edges
      .filter((e) => highlightedNodeIds.includes(e.sourceNodeId) && highlightedNodeIds.includes(e.targetNodeId))
      .map((e) => e.id)
    state.activeHoverNeighborMap = {
      activeNodeId: triggerNodeId, highlightedNodeIds, highlightedEdgeIds,
      dimmedNodeIds: Object.keys(state.nodes).filter((id) => !highlightedNodeIds.includes(id)),
      dimmedEdgeIds: state.edges.filter((e) => !highlightedEdgeIds.includes(e.id)).map((e) => e.id),
    }
  } else {
    const downstreamIds = getDownstreamNodeIds(triggerNodeId, state.edges)
    state.nodes[triggerNodeId]!.status = "error"
    state.nodes[triggerNodeId]!.errorMessage = `${triggerTitle} Failure: Stage execution halted`

    const impactedEtl: string[] = []
    const brokenPbis: string[] = []
    if (triggerNode?.category === "etl") impactedEtl.push(triggerTitle)

    for (const [nodeId, node] of Object.entries(state.nodes)) {
      if (nodeId === triggerNodeId) continue
      if (downstreamIds.has(nodeId)) {
        node.status = "error"
        node.errorMessage = `Blocked: Upstream node '${triggerTitle}' failed`
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
      technicalRemediation: `Execution halted at '${triggerTitle}'. All downstream nodes in the DAG are halted in RED. Click '${triggerTitle}' again or Clear Anomaly to restore.`,
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
      node.errorMessage = `Missing column '${droppedCol}' in ${node.title}`
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
      technicalRemediation: `Pipeline queue halted at step ${stepIdx + 1}. Column '${droppedCol}' was removed in ${rootNodeTitle}. Future ETL stages and Power BI broken.`,
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
        ? `Primary Key '${droppedCol}' was dropped in ${rootTitle}. Future stage processing aborted.`
        : `Required column '${droppedCol}' missing (dropped in ${rootTitle})`
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
    state.nodes[rootNode]!.errorMessage = `Column '${droppedCol}' removed in transformation script`
  }

  state.diagnosticSummary = {
    hasBreakage: true, rootCauseNodeId: rootNode, culpritColumn: droppedCol,
    impactedEtlStages: impactedStages,
    brokenPbiVisuals: brokenPbis.length > 0 ? brokenPbis : ["Total Net Revenue (USD)", "Product Category Revenue Split"],
    technicalRemediation: droppedCol === "order_id"
      ? `Primary column 'order_id' was dropped in ${rootTitle}. All future ETL stages (${impactedStages.join(" -> ")}) and Power BI visuals failed due to lack of row grain key.`
      : `Column '${droppedCol}' was removed in ${rootTitle}. Subsequent ETL stages and Power BI visuals failed.`,
    recoveryTimestamp: new Date().toLocaleTimeString(),
  }
}
