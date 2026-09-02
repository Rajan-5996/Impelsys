import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"

export type QualityTab = "dataset" | "supplier" | "rules" | "deteriorations" | "trends"

export type QualityDimensionScore = { dimension: string; score: number }

export type SupplierQualityRow = {
  supplierId: string
  name: string
  score: number
  completeness: number | null
  referentialIntegrity: number | null
  isReal: boolean
}

export type QualityDeterioration = {
  entity: string
  metric: string
  from: number
  to: number
  when: string
  cause: string
}

export type QualityTrendPoint = { ts: string; value: number }

export type DatasetSummaryRow = {
  id: string
  name: string
  score: number | null
  recordCount: number | null
  rulesTotal: number
  passed: number
  warning: number
  failed: number
  isReal: boolean
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"
type Fetchable<T> = { data: T; status: AsyncStatus; error: string | null }

type QualityState = {
  activeTab: QualityTab
  summaryDimensions: Fetchable<QualityDimensionScore[]>
  dimensionNames: Fetchable<string[]>
  suppliers: Fetchable<SupplierQualityRow[]>
  deteriorations: Fetchable<QualityDeterioration[]>
  trends: Fetchable<QualityTrendPoint[]>
  datasets: Fetchable<DatasetSummaryRow[]>
}

const initialState: QualityState = {
  activeTab: "dataset",
  summaryDimensions: { data: [], status: "idle", error: null },
  dimensionNames: { data: [], status: "idle", error: null },
  suppliers: { data: [], status: "idle", error: null },
  deteriorations: { data: [], status: "idle", error: null },
  trends: { data: [], status: "idle", error: null },
  datasets: { data: [], status: "idle", error: null },
}

export const fetchQualitySummary = createAsyncThunk(
  "quality/fetchQualitySummary",
  async () => {
    const response = await axiosInstance.get<{ dimensions: QualityDimensionScore[] }>(
      "/api/data-quality/summary"
    )
    return response.data.dimensions
  }
)

export const fetchDimensionNames = createAsyncThunk(
  "quality/fetchDimensionNames",
  async () => {
    const response = await axiosInstance.get<{ dimensions: string[] }>(
      "/api/data-quality/dimensions"
    )
    return response.data.dimensions
  }
)

export const fetchQualityBySupplier = createAsyncThunk(
  "quality/fetchQualityBySupplier",
  async () => {
    const response = await axiosInstance.get<{ suppliers: SupplierQualityRow[] }>(
      "/api/data-quality/suppliers"
    )
    return response.data.suppliers
  }
)

export const fetchQualityDeteriorations = createAsyncThunk(
  "quality/fetchQualityDeteriorations",
  async () => {
    const response = await axiosInstance.get<{ deteriorations: QualityDeterioration[] }>(
      "/api/data-quality/deteriorations"
    )
    return response.data.deteriorations
  }
)

export const fetchQualityTrends = createAsyncThunk(
  "quality/fetchQualityTrends",
  async (limit: number = 14) => {
    const response = await axiosInstance.get<{ trend: QualityTrendPoint[] }>(
      "/api/data-quality/trends",
      { params: { limit } }
    )
    return response.data.trend
  }
)

export const fetchQualityDatasets = createAsyncThunk(
  "quality/fetchQualityDatasets",
  async () => {
    const response = await axiosInstance.get<{ datasets: DatasetSummaryRow[] }>(
      "/api/data-quality/datasets"
    )
    return response.data.datasets
  }
)

const qualitySlice = createSlice({
  name: "quality",
  initialState,
  reducers: {
    setQualityTab: (state, action: PayloadAction<QualityTab>) => {
      state.activeTab = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQualitySummary.pending, (state) => {
        state.summaryDimensions.status = "loading"
      })
      .addCase(fetchQualitySummary.fulfilled, (state, action) => {
        state.summaryDimensions.status = "succeeded"
        state.summaryDimensions.data = action.payload
      })
      .addCase(fetchQualitySummary.rejected, (state, action) => {
        state.summaryDimensions.status = "failed"
        state.summaryDimensions.error = action.error.message ?? "Failed to load quality summary"
      })
      .addCase(fetchDimensionNames.pending, (state) => {
        state.dimensionNames.status = "loading"
      })
      .addCase(fetchDimensionNames.fulfilled, (state, action) => {
        state.dimensionNames.status = "succeeded"
        state.dimensionNames.data = action.payload
      })
      .addCase(fetchDimensionNames.rejected, (state, action) => {
        state.dimensionNames.status = "failed"
        state.dimensionNames.error = action.error.message ?? "Failed to load dimension names"
      })
      .addCase(fetchQualityBySupplier.pending, (state) => {
        state.suppliers.status = "loading"
      })
      .addCase(fetchQualityBySupplier.fulfilled, (state, action) => {
        state.suppliers.status = "succeeded"
        state.suppliers.data = action.payload
      })
      .addCase(fetchQualityBySupplier.rejected, (state, action) => {
        state.suppliers.status = "failed"
        state.suppliers.error = action.error.message ?? "Failed to load supplier quality"
      })
      .addCase(fetchQualityDeteriorations.pending, (state) => {
        state.deteriorations.status = "loading"
      })
      .addCase(fetchQualityDeteriorations.fulfilled, (state, action) => {
        state.deteriorations.status = "succeeded"
        state.deteriorations.data = action.payload
      })
      .addCase(fetchQualityDeteriorations.rejected, (state, action) => {
        state.deteriorations.status = "failed"
        state.deteriorations.error = action.error.message ?? "Failed to load deteriorations"
      })
      .addCase(fetchQualityTrends.pending, (state) => {
        state.trends.status = "loading"
      })
      .addCase(fetchQualityTrends.fulfilled, (state, action) => {
        state.trends.status = "succeeded"
        state.trends.data = action.payload
      })
      .addCase(fetchQualityTrends.rejected, (state, action) => {
        state.trends.status = "failed"
        state.trends.error = action.error.message ?? "Failed to load trends"
      })
      .addCase(fetchQualityDatasets.pending, (state) => {
        state.datasets.status = "loading"
      })
      .addCase(fetchQualityDatasets.fulfilled, (state, action) => {
        state.datasets.status = "succeeded"
        state.datasets.data = action.payload
      })
      .addCase(fetchQualityDatasets.rejected, (state, action) => {
        state.datasets.status = "failed"
        state.datasets.error = action.error.message ?? "Failed to load datasets"
      })
  },
})

export const { setQualityTab } = qualitySlice.actions
export const selectQualityActiveTab = (state: RootState) => state.quality.activeTab
export const selectQualitySummaryDimensions = (state: RootState) =>
  state.quality.summaryDimensions
export const selectDimensionNames = (state: RootState) => state.quality.dimensionNames
export const selectQualityBySupplier = (state: RootState) => state.quality.suppliers
export const selectQualityDeteriorations = (state: RootState) => state.quality.deteriorations
export const selectQualityTrends = (state: RootState) => state.quality.trends
export const selectQualityDatasets = (state: RootState) => state.quality.datasets
export const qualityReducer = qualitySlice.reducer
