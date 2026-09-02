import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { QualityDimensionScore } from "@/store/quality-slice"
import type { RootState } from "@/store/store"

export type DatasetRule = {
  ruleCode: string
  description: string
  status: string
  affectedCount: number
  checkedCount: number
}

export type RealDatasetDetail = {
  dataset: string
  recordCount: number | null
  dimensions: QualityDimensionScore[]
  rules: DatasetRule[]
}

export type MockDatasetSummary = {
  id: string
  name: string
  score: number | null
  recordCount: number | null
  rulesTotal: number
  passed: number
  warning: number
  failed: number
}

export type FailedRule = DatasetRule & { dataset: string }

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"
type Fetchable<T> = { data: T; status: AsyncStatus; error: string | null }

type QualityDetailState = {
  realDataset: Fetchable<RealDatasetDetail | null>
  mockDataset: Fetchable<MockDatasetSummary | null>
  rules: Fetchable<{ rules: DatasetRule[]; note?: string }>
  lineage: Fetchable<string | null>
  affectedRecords: Fetchable<{ ruleCode: string; records: Record<string, unknown>[]; note?: string } | null>
  failedRules: Fetchable<FailedRule[]>
}

const initialState: QualityDetailState = {
  realDataset: { data: null, status: "idle", error: null },
  mockDataset: { data: null, status: "idle", error: null },
  rules: { data: { rules: [] }, status: "idle", error: null },
  lineage: { data: null, status: "idle", error: null },
  affectedRecords: { data: null, status: "idle", error: null },
  failedRules: { data: [], status: "idle", error: null },
}

export const fetchRealDatasetDetail = createAsyncThunk(
  "qualityDetail/fetchRealDatasetDetail",
  async () => {
    const response = await axiosInstance.get<RealDatasetDetail>(
      "/api/data-quality/datasets/daily_sales_curated"
    )
    return response.data
  }
)

export const fetchMockDatasetSummary = createAsyncThunk(
  "qualityDetail/fetchMockDatasetSummary",
  async (datasetId: string) => {
    const response = await axiosInstance.get<MockDatasetSummary>(
      `/api/data-quality/datasets/${datasetId}`
    )
    return response.data
  }
)

export const fetchDatasetRules = createAsyncThunk(
  "qualityDetail/fetchDatasetRules",
  async (datasetId: string) => {
    const response = await axiosInstance.get<{ rules: DatasetRule[]; note?: string }>(
      `/api/data-quality/datasets/${datasetId}/rules`
    )
    return response.data
  }
)

export const fetchDatasetLineage = createAsyncThunk(
  "qualityDetail/fetchDatasetLineage",
  async (datasetId: string) => {
    const response = await axiosInstance.get<{ lineage: string }>(
      `/api/data-quality/datasets/${datasetId}/lineage`
    )
    return response.data.lineage
  }
)

export const fetchAffectedRecords = createAsyncThunk(
  "qualityDetail/fetchAffectedRecords",
  async (ruleCode: string) => {
    const response = await axiosInstance.get<{
      ruleCode: string
      records: Record<string, unknown>[]
      note?: string
    }>(`/api/data-quality/affected-records/${ruleCode}`)
    return response.data
  }
)

export const fetchFailedRules = createAsyncThunk(
  "qualityDetail/fetchFailedRules",
  async () => {
    const response = await axiosInstance.get<{ failedRules: FailedRule[] }>(
      "/api/data-quality/failed-rules"
    )
    return response.data.failedRules
  }
)

const qualityDetailSlice = createSlice({
  name: "qualityDetail",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRealDatasetDetail.pending, (state) => {
        state.realDataset.status = "loading"
      })
      .addCase(fetchRealDatasetDetail.fulfilled, (state, action) => {
        state.realDataset.status = "succeeded"
        state.realDataset.data = action.payload
      })
      .addCase(fetchRealDatasetDetail.rejected, (state, action) => {
        state.realDataset.status = "failed"
        state.realDataset.error = action.error.message ?? "Failed to load dataset"
      })
      .addCase(fetchMockDatasetSummary.pending, (state) => {
        state.mockDataset.status = "loading"
      })
      .addCase(fetchMockDatasetSummary.fulfilled, (state, action) => {
        state.mockDataset.status = "succeeded"
        state.mockDataset.data = action.payload
      })
      .addCase(fetchMockDatasetSummary.rejected, (state, action) => {
        state.mockDataset.status = "failed"
        state.mockDataset.error = action.error.message ?? "Failed to load dataset"
      })
      .addCase(fetchDatasetRules.pending, (state) => {
        state.rules.status = "loading"
      })
      .addCase(fetchDatasetRules.fulfilled, (state, action) => {
        state.rules.status = "succeeded"
        state.rules.data = action.payload
      })
      .addCase(fetchDatasetRules.rejected, (state, action) => {
        state.rules.status = "failed"
        state.rules.error = action.error.message ?? "Failed to load rules"
      })
      .addCase(fetchDatasetLineage.pending, (state) => {
        state.lineage.status = "loading"
      })
      .addCase(fetchDatasetLineage.fulfilled, (state, action) => {
        state.lineage.status = "succeeded"
        state.lineage.data = action.payload
      })
      .addCase(fetchDatasetLineage.rejected, (state, action) => {
        state.lineage.status = "failed"
        state.lineage.error = action.error.message ?? "Failed to load lineage"
      })
      .addCase(fetchAffectedRecords.pending, (state) => {
        state.affectedRecords.status = "loading"
      })
      .addCase(fetchAffectedRecords.fulfilled, (state, action) => {
        state.affectedRecords.status = "succeeded"
        state.affectedRecords.data = action.payload
      })
      .addCase(fetchAffectedRecords.rejected, (state, action) => {
        state.affectedRecords.status = "failed"
        state.affectedRecords.error = action.error.message ?? "Failed to load affected records"
      })
      .addCase(fetchFailedRules.pending, (state) => {
        state.failedRules.status = "loading"
      })
      .addCase(fetchFailedRules.fulfilled, (state, action) => {
        state.failedRules.status = "succeeded"
        state.failedRules.data = action.payload
      })
      .addCase(fetchFailedRules.rejected, (state, action) => {
        state.failedRules.status = "failed"
        state.failedRules.error = action.error.message ?? "Failed to load failed rules"
      })
  },
})

export const selectRealDatasetDetail = (state: RootState) => state.qualityDetail.realDataset
export const selectMockDatasetSummary = (state: RootState) => state.qualityDetail.mockDataset
export const selectDatasetRules = (state: RootState) => state.qualityDetail.rules
export const selectDatasetLineage = (state: RootState) => state.qualityDetail.lineage
export const selectAffectedRecords = (state: RootState) => state.qualityDetail.affectedRecords
export const selectFailedRules = (state: RootState) => state.qualityDetail.failedRules
export const qualityDetailReducer = qualityDetailSlice.reducer
