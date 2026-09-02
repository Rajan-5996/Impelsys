import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"

export type SupplierFeed = {
  feed: string | null
  pipeline: string | null
  frequency: string | null
  expectedTime: string | null
  format: string | null
  fileSize: string | null
}

export type SupplierQualityRule = {
  ruleCode: string
  description: string
  status: string
  affectedCount: number
  checkedCount: number
}

export type SupplierQuality = {
  dataset?: string
  rules: SupplierQualityRule[]
}

export type SupplierSla = {
  expectedTime: string | null
  sla: string | null
  lastLandedAt: string | null
  slaState: "ok" | "breach"
}

export type SupplierHistory = {
  trend: number[]
  isReal: boolean
}

export type SupplierPolicy = {
  id: string
  title: string
  version: string
  owner: string
  effectiveDate: string
  approvalMode: string
  applicablePipelines: string[]
  body: string
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"

type Fetchable<T> = { data: T; status: AsyncStatus; error: string | null }

type SupplierDetailState = {
  feeds: Fetchable<SupplierFeed | null>
  quality: Fetchable<SupplierQuality>
  sla: Fetchable<SupplierSla | null>
  history: Fetchable<SupplierHistory>
  contracts: Fetchable<SupplierPolicy[]>
}

const initialState: SupplierDetailState = {
  feeds: { data: null, status: "idle", error: null },
  quality: { data: { rules: [] }, status: "idle", error: null },
  sla: { data: null, status: "idle", error: null },
  history: { data: { trend: [], isReal: false }, status: "idle", error: null },
  contracts: { data: [], status: "idle", error: null },
}

export const fetchSupplierFeeds = createAsyncThunk(
  "supplierDetail/fetchFeeds",
  async (supplierId: string) => {
    const response = await axiosInstance.get<SupplierFeed>(
      `/api/suppliers/${supplierId}/feeds`
    )
    return response.data
  }
)

export const fetchSupplierQuality = createAsyncThunk(
  "supplierDetail/fetchQuality",
  async (supplierId: string) => {
    const response = await axiosInstance.get<SupplierQuality>(
      `/api/suppliers/${supplierId}/quality`
    )
    return response.data
  }
)

export const fetchSupplierSla = createAsyncThunk(
  "supplierDetail/fetchSla",
  async (supplierId: string) => {
    const response = await axiosInstance.get<SupplierSla>(
      `/api/suppliers/${supplierId}/sla`
    )
    return response.data
  }
)

export const fetchSupplierHistory = createAsyncThunk(
  "supplierDetail/fetchHistory",
  async (supplierId: string) => {
    const response = await axiosInstance.get<SupplierHistory>(
      `/api/suppliers/${supplierId}/history`
    )
    return response.data
  }
)

export const fetchSupplierContracts = createAsyncThunk(
  "supplierDetail/fetchContracts",
  async (supplierId: string) => {
    const response = await axiosInstance.get<{ policies: SupplierPolicy[] }>(
      `/api/suppliers/${supplierId}/contracts`
    )
    return response.data.policies
  }
)

const supplierDetailSlice = createSlice({
  name: "supplierDetail",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupplierFeeds.pending, (state) => {
        state.feeds.status = "loading"
        state.feeds.error = null
      })
      .addCase(fetchSupplierFeeds.fulfilled, (state, action) => {
        state.feeds.status = "succeeded"
        state.feeds.data = action.payload
      })
      .addCase(fetchSupplierFeeds.rejected, (state, action) => {
        state.feeds.status = "failed"
        state.feeds.error = action.error.message ?? "Failed to load feed details"
      })
      .addCase(fetchSupplierQuality.pending, (state) => {
        state.quality.status = "loading"
        state.quality.error = null
      })
      .addCase(fetchSupplierQuality.fulfilled, (state, action) => {
        state.quality.status = "succeeded"
        state.quality.data = action.payload
      })
      .addCase(fetchSupplierQuality.rejected, (state, action) => {
        state.quality.status = "failed"
        state.quality.error = action.error.message ?? "Failed to load quality rules"
      })
      .addCase(fetchSupplierSla.pending, (state) => {
        state.sla.status = "loading"
        state.sla.error = null
      })
      .addCase(fetchSupplierSla.fulfilled, (state, action) => {
        state.sla.status = "succeeded"
        state.sla.data = action.payload
      })
      .addCase(fetchSupplierSla.rejected, (state, action) => {
        state.sla.status = "failed"
        state.sla.error = action.error.message ?? "Failed to load SLA details"
      })
      .addCase(fetchSupplierHistory.pending, (state) => {
        state.history.status = "loading"
        state.history.error = null
      })
      .addCase(fetchSupplierHistory.fulfilled, (state, action) => {
        state.history.status = "succeeded"
        state.history.data = action.payload
      })
      .addCase(fetchSupplierHistory.rejected, (state, action) => {
        state.history.status = "failed"
        state.history.error = action.error.message ?? "Failed to load history"
      })
      .addCase(fetchSupplierContracts.pending, (state) => {
        state.contracts.status = "loading"
        state.contracts.error = null
      })
      .addCase(fetchSupplierContracts.fulfilled, (state, action) => {
        state.contracts.status = "succeeded"
        state.contracts.data = action.payload
      })
      .addCase(fetchSupplierContracts.rejected, (state, action) => {
        state.contracts.status = "failed"
        state.contracts.error = action.error.message ?? "Failed to load contracts"
      })
  },
})

export const selectSupplierFeeds = (state: RootState) => state.supplierDetail.feeds
export const selectSupplierQuality = (state: RootState) => state.supplierDetail.quality
export const selectSupplierSla = (state: RootState) => state.supplierDetail.sla
export const selectSupplierHistory = (state: RootState) => state.supplierDetail.history
export const selectSupplierContracts = (state: RootState) => state.supplierDetail.contracts
export const supplierDetailReducer = supplierDetailSlice.reducer
