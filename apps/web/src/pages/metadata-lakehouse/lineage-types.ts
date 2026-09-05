export type TierId =
  | "tier-source"
  | "tier-anomaly"
  | "tier-quality"
  | "tier-etl"
  | "tier-powerbi"

export type NodeCategory = "source" | "anomaly" | "quality" | "etl" | "powerbi"

export type NodeExecutionStatus =
  | "idle"
  | "queued"
  | "running"
  | "success"
  | "warning"
  | "error"
  | "bypassed"

export interface RawSalesRecord {
  order_id: string
  customer_id: string
  product_code: string
  sales_amount: number
  discount_pct: number
  tax_rate: number
  region: string
  order_date: string
  currency: string
  customer_segment: string
  [key: string]: string | number | undefined
}

export interface StageCodeDefinition {
  nodeId: string
  stageNumber: number
  stageName: string
  subNodeName: string
  pySparkCode: string
  originalCode: string
  requiredInputs: string[]
  producedOutputs: string[]
  droppedColumns: string[]
  codeDescription: string
  isCustomModified: boolean
}

export interface LineagePort {
  id: string
  label: string
  dataType: string
}

export interface LineageNode {
  id: string
  tierId: TierId
  category: NodeCategory
  stageNumber?: number
  badgeCode: string
  title: string
  subtitle: string
  description: string
  status: NodeExecutionStatus
  inputPorts: LineagePort[]
  outputPorts: LineagePort[]
  columnDependencies: string[]
  columnsOutput: string[]
  errorMessage?: string
  errorStageOrigin?: string
  logoKey?: string
  logoSrc?: string
}

export interface LineageEdge {
  id: string
  sourceNodeId: string
  targetNodeId: string
  sourcePortId: string
  targetPortId: string
  status: "idle" | "active" | "highlighted" | "dimmed" | "error"
}

export interface TierColumnConfig {
  id: TierId
  levelIndex: number
  levelLabel: string
  title: string
  badgeCountLabel: string
  description: string
  accentColorClass: string
}

export interface PowerBiVisualSpec {
  nodeId: string
  visualId: string
  title: string
  chartType: "kpi" | "bar" | "line" | "heatmap"
  requiredColumns: string[]
  aggregationMetric: string
  status: "healthy" | "broken"
}

export interface ImpactDiagnosticSummary {
  hasBreakage: boolean
  rootCauseNodeId: string | null
  culpritColumn: string | null
  impactedEtlStages: string[]
  brokenPbiVisuals: string[]
  technicalRemediation: string
  recoveryTimestamp?: string
}

export interface CanvasTransform {
  scale: number
  offsetX: number
  offsetY: number
}

export interface NeighborHighlightMap {
  activeNodeId: string | null
  highlightedNodeIds: string[]
  highlightedEdgeIds: string[]
  dimmedNodeIds: string[]
  dimmedEdgeIds: string[]
}

export interface CodeModificationPayload {
  nodeId: string
  newCode: string
  droppedColumns?: string[]
}

export interface PipelineSimulationState {
  isRunning: boolean
  activeExecutingNodeId: string | null
  currentExecutionIndex: number
  totalExecutionSteps: number
}

export interface VendorLineageLiveStatus {
  vendor_id: string
  run_id: string | null
  status: string | null
  current_stage: string | null
  columns: string[]
  anomalies: Array<{
    anomaly_type: string
    status: string
    details: Record<string, unknown>
    has_precedent: boolean
  }>
  quality: {
    overall_score: number
    tier: string
    issues: string[]
    status: string
  } | null
}

export type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"

export interface MetadataLakehouseState {
  nodes: Record<string, LineageNode>
  edges: LineageEdge[]
  selectedVendorId: string
  activeSimulatedAnomalyNodeId: string | null
  selectedNodeId: string | null
  isDataSourceModalOpen: boolean
  isCodeDrawerOpen: boolean
  isPowerBiModalOpen: boolean
  inspectingPowerBiNodeId: string | null
  activeHoverNeighborMap: NeighborHighlightMap
  codeOverrides: Record<string, StageCodeDefinition>
  simulationState: PipelineSimulationState
  diagnosticSummary: ImpactDiagnosticSummary
  canvasTransform: CanvasTransform
  rawDatasetRecords: RawSalesRecord[]
  liveStatusByVendorId: Record<string, VendorLineageLiveStatus>
  liveStatusRequestStatus: AsyncStatus
}
