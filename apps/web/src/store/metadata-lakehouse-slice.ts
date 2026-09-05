import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import { COOKED_RAW_RECORDS, INITIAL_NODES } from "@/pages/metadata-lakehouse/lineage-data"
import { STAGE_CODE_CHECKS } from "@/pages/metadata-lakehouse/stage-code-templates"
import { STAGE_CODE_ETL } from "@/pages/metadata-lakehouse/stage-code-templates-etl"
import type {
  CanvasTransform,
  CodeModificationPayload,
  MetadataLakehouseState,
  RawSalesRecord,
  VendorLineageLiveStatus,
} from "@/pages/metadata-lakehouse/lineage-types"
import type { RootState } from "@/store/store"

import {
  applyVendorToNodes,
  calculateNeighborMap,
  EXECUTION_TIER_GROUPS,
  initialDiagnostic,
  initialNeighborMap,
} from "./lineage-reducer-logic"
import { applyAdvanceStep, applyAnomalyToggle, applyRecomputeImpact } from "./lineage-simulation-reducers"

export const DEFAULT_VENDOR_ID = "VEND-01"
export const DEFAULT_VENDOR_NAME = "NorthStar Retail"

export const fetchVendorLineage = createAsyncThunk(
  "metadataLakehouse/fetchVendorLineage",
  async (vendorId: string) => {
    const response = await axiosInstance.get<VendorLineageLiveStatus>(`/smart-etl/vendors/${vendorId}/lineage`)
    return response.data
  }
)

const initialLineage = applyVendorToNodes(DEFAULT_VENDOR_ID, DEFAULT_VENDOR_NAME, INITIAL_NODES)

const initialState: MetadataLakehouseState = {
  nodes: initialLineage.nodes,
  edges: initialLineage.edges,
  selectedVendorId: DEFAULT_VENDOR_ID,
  activeSimulatedAnomalyNodeId: null,
  selectedNodeId: null,
  isDataSourceModalOpen: false,
  isCodeDrawerOpen: false,
  isPowerBiModalOpen: false,
  inspectingPowerBiNodeId: null,
  activeHoverNeighborMap: initialNeighborMap,
  codeOverrides: { ...STAGE_CODE_CHECKS, ...STAGE_CODE_ETL },
  simulationState: {
    isRunning: false, activeExecutingNodeId: null,
    currentExecutionIndex: 0, totalExecutionSteps: EXECUTION_TIER_GROUPS.length,
  },
  diagnosticSummary: initialDiagnostic,
  canvasTransform: { scale: 1, offsetX: 0, offsetY: 0 },
  rawDatasetRecords: COOKED_RAW_RECORDS,
  liveStatusByVendorId: {},
  liveStatusRequestStatus: "idle",
}

const metadataLakehouseSlice = createSlice({
  name: "metadataLakehouse",
  initialState,
  reducers: {
    selectVendor: (state, action: PayloadAction<{ vendorId: string; vendorName: string }>) => {
      const { vendorId, vendorName } = action.payload
      state.selectedVendorId = vendorId
      state.activeSimulatedAnomalyNodeId = null
      const { nodes, edges } = applyVendorToNodes(vendorId, vendorName, state.nodes)
      state.nodes = nodes
      state.edges = edges
      state.diagnosticSummary = initialDiagnostic
      state.activeHoverNeighborMap = initialNeighborMap
    },
    toggleAnomalySimulation: (state, action: PayloadAction<string>) => applyAnomalyToggle(state, action.payload),
    setHoveredNode: (state, action: PayloadAction<string | null>) => {
      state.activeHoverNeighborMap = calculateNeighborMap(action.payload, state.nodes, state.edges)
    },
    openDataSourceModal: (state) => { state.isDataSourceModalOpen = true },
    closeDataSourceModal: (state) => { state.isDataSourceModalOpen = false },
    openCodeDrawer: (state, action: PayloadAction<string>) => {
      state.selectedNodeId = action.payload
      state.isCodeDrawerOpen = true
    },
    closeCodeDrawer: (state) => { state.isCodeDrawerOpen = false },
    openPowerBiModal: (state, action: PayloadAction<string>) => {
      state.inspectingPowerBiNodeId = action.payload
      state.isPowerBiModalOpen = true
    },
    closePowerBiModal: (state) => { state.isPowerBiModalOpen = false },
    setCanvasTransform: (state, action: PayloadAction<CanvasTransform>) => { state.canvasTransform = action.payload },
    resetCanvasTransform: (state) => { state.canvasTransform = { scale: 1, offsetX: 0, offsetY: 0 } },
    updateStageCode: (state, action: PayloadAction<CodeModificationPayload>) => {
      const { nodeId, newCode, droppedColumns } = action.payload
      if (state.codeOverrides[nodeId]) {
        state.codeOverrides[nodeId]!.pySparkCode = newCode
        state.codeOverrides[nodeId]!.droppedColumns = droppedColumns ?? []
        state.codeOverrides[nodeId]!.isCustomModified = true
      }
    },
    resetStageCode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload
      if (state.codeOverrides[nodeId]) {
        state.codeOverrides[nodeId]!.pySparkCode = state.codeOverrides[nodeId]!.originalCode
        state.codeOverrides[nodeId]!.droppedColumns = []
        state.codeOverrides[nodeId]!.isCustomModified = false
      }
    },
    setCustomRawRecords: (state, action: PayloadAction<RawSalesRecord[]>) => {
      state.rawDatasetRecords = action.payload
    },
    startSequentialExecution: (state) => {
      state.simulationState.isRunning = true
      state.simulationState.currentExecutionIndex = 0
      state.simulationState.activeExecutingNodeId = "src-1"
      for (const id of Object.keys(state.nodes)) {
        state.nodes[id]!.status = "queued"
        delete state.nodes[id]!.errorMessage
      }
    },
    advanceSimulationStep: (state) => applyAdvanceStep(state),
    recomputeImpact: (state) => applyRecomputeImpact(state),
    stopSimulation: (state) => { state.simulationState.isRunning = false },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorLineage.pending, (state) => {
        state.liveStatusRequestStatus = "loading"
      })
      .addCase(fetchVendorLineage.fulfilled, (state, action) => {
        state.liveStatusRequestStatus = "succeeded"
        state.liveStatusByVendorId[action.payload.vendor_id] = action.payload
      })
      .addCase(fetchVendorLineage.rejected, (state) => {
        state.liveStatusRequestStatus = "failed"
      })
  },
})

export const {
  selectVendor,
  toggleAnomalySimulation,
  setHoveredNode,
  openDataSourceModal,
  closeDataSourceModal,
  openCodeDrawer,
  closeCodeDrawer,
  openPowerBiModal,
  closePowerBiModal,
  setCanvasTransform,
  resetCanvasTransform,
  updateStageCode,
  resetStageCode,
  setCustomRawRecords,
  startSequentialExecution,
  advanceSimulationStep,
  recomputeImpact,
  stopSimulation,
} = metadataLakehouseSlice.actions

export const selectMetadataLakehouse = (state: RootState) => state.metadataLakehouse
export const selectVendorLiveStatus = (vendorId: string) => (state: RootState) =>
  state.metadataLakehouse.liveStatusByVendorId[vendorId] ?? null

export const metadataLakehouseReducer = metadataLakehouseSlice.reducer
