import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { ActivityFeedEntry } from "@/store/command-center-slice"
import type { RootState } from "@/store/store"

export type PipelineListItem = {
  id: string
  name: string
  isReal: boolean
  supplierCount: number
}

export type RealPipelineStage = {
  name: string
  status: string
  metadata: Record<string, unknown>
}

export type GenericPipelineStages = {
  pipeline: string
  stages: RealPipelineStage[]
  note?: string
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"
type Fetchable<T> = { data: T; status: AsyncStatus; error: string | null }

type PipelineState = {
  list: Fetchable<PipelineListItem[]>
  auditTrail: Fetchable<{ total: number; entries: ActivityFeedEntry[] }>
  genericStages: Record<string, Fetchable<GenericPipelineStages | null>>
}

const initialState: PipelineState = {
  list: { data: [], status: "idle", error: null },
  auditTrail: { data: { total: 0, entries: [] }, status: "idle", error: null },
  genericStages: {},
}

export const fetchPipelines = createAsyncThunk("pipeline/fetchPipelines", async () => {
  const response = await axiosInstance.get<{ pipelines: PipelineListItem[] }>(
    "/api/pipelines"
  )
  return response.data.pipelines
})

export const fetchPipelineAuditTrail = createAsyncThunk(
  "pipeline/fetchPipelineAuditTrail",
  async (pipelineId: string) => {
    const response = await axiosInstance.get<{ total: number; entries: ActivityFeedEntry[] }>(
      `/api/pipelines/${pipelineId}/audit-trail`
    )
    return response.data
  }
)

export const fetchGenericPipelineStages = createAsyncThunk(
  "pipeline/fetchGenericPipelineStages",
  async (pipelineId: string) => {
    const response = await axiosInstance.get<GenericPipelineStages>(
      `/api/pipelines/${pipelineId}/stages`
    )
    return response.data
  }
)

const pipelineSlice = createSlice({
  name: "pipeline",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPipelines.pending, (state) => {
        state.list.status = "loading"
        state.list.error = null
      })
      .addCase(fetchPipelines.fulfilled, (state, action) => {
        state.list.status = "succeeded"
        state.list.data = action.payload
      })
      .addCase(fetchPipelines.rejected, (state, action) => {
        state.list.status = "failed"
        state.list.error = action.error.message ?? "Failed to load pipelines"
      })
      .addCase(fetchPipelineAuditTrail.pending, (state) => {
        state.auditTrail.status = "loading"
        state.auditTrail.error = null
      })
      .addCase(fetchPipelineAuditTrail.fulfilled, (state, action) => {
        state.auditTrail.status = "succeeded"
        state.auditTrail.data = action.payload
      })
      .addCase(fetchPipelineAuditTrail.rejected, (state, action) => {
        state.auditTrail.status = "failed"
        state.auditTrail.error = action.error.message ?? "Failed to load audit trail"
      })
      .addCase(fetchGenericPipelineStages.pending, (state, action) => {
        state.genericStages[action.meta.arg] = {
          data: state.genericStages[action.meta.arg]?.data ?? null,
          status: "loading",
          error: null,
        }
      })
      .addCase(fetchGenericPipelineStages.fulfilled, (state, action) => {
        state.genericStages[action.meta.arg] = {
          data: action.payload,
          status: "succeeded",
          error: null,
        }
      })
      .addCase(fetchGenericPipelineStages.rejected, (state, action) => {
        state.genericStages[action.meta.arg] = {
          data: null,
          status: "failed",
          error: action.error.message ?? "Failed to load pipeline stages",
        }
      })
  },
})

export const selectPipelinesList = (state: RootState) => state.pipeline.list
export const selectPipelineAuditTrail = (state: RootState) => state.pipeline.auditTrail
export const selectGenericPipelineStages = (pipelineId: string) => (state: RootState) =>
  state.pipeline.genericStages[pipelineId]
export const pipelineReducer = pipelineSlice.reducer
