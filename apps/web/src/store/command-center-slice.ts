import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"

export type KpiDelta = {
  dir: "up" | "down" | "flat"
  text: string
}

export type KpiDef = {
  label: string
  value: number | string
  suffix?: string | null
  sub: string
  delta: KpiDelta | null
  accent?: "up" | "down" | "flat" | "info"
}

export type LifecycleFlowStep = {
  stage: string
  count: number
  unit: string
  realCount?: number
}

export type AttentionQueueItem = {
  id: string
  title: string
  supplier: string | null
  pipeline: string | null
  stage: string | null
  severity: string
  status: string
  governanceMode: string
  policy: string
  confidence: number
  riskRating: string
  evidence: string
  recommendation?: string
}

export type ActivityFeedEntry = {
  ts: string
  agent: string
  action: string
  supplier: string | null
  policy: string | null
  mode: string | null
  approver: string | null
  decision: string | null
  result: string | null
  evidence: string | null
  env: string | null
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"

type Fetchable<T> = {
  data: T
  status: AsyncStatus
  error: string | null
}

type CommandCenterState = {
  kpis: Fetchable<KpiDef[]>
  attentionQueue: Fetchable<AttentionQueueItem[]>
  lifecycleFlow: Fetchable<LifecycleFlowStep[]>
}

const initialState: CommandCenterState = {
  kpis: { data: [], status: "idle", error: null },
  attentionQueue: { data: [], status: "idle", error: null },
  lifecycleFlow: { data: [], status: "idle", error: null },
}

export const fetchKpis = createAsyncThunk(
  "commandCenter/fetchKpis",
  async () => {
    const response = await axiosInstance.get<{ kpis: KpiDef[] }>(
      "/api/command-center/kpis"
    )
    return response.data.kpis
  }
)

export const fetchAttentionQueue = createAsyncThunk(
  "commandCenter/fetchAttentionQueue",
  async () => {
    const response = await axiosInstance.get<{ items: AttentionQueueItem[] }>(
      "/api/command-center/attention-queue"
    )
    return response.data.items
  }
)

export const fetchLifecycleFlow = createAsyncThunk(
  "commandCenter/fetchLifecycleFlow",
  async () => {
    const response = await axiosInstance.get<{ stages: LifecycleFlowStep[] }>(
      "/api/command-center/lifecycle-flow"
    )
    return response.data.stages
  }
)

const commandCenterSlice = createSlice({
  name: "commandCenter",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKpis.pending, (state) => {
        state.kpis.status = "loading"
        state.kpis.error = null
      })
      .addCase(fetchKpis.fulfilled, (state, action) => {
        state.kpis.status = "succeeded"
        state.kpis.data = action.payload
      })
      .addCase(fetchKpis.rejected, (state, action) => {
        state.kpis.status = "failed"
        state.kpis.error = action.error.message ?? "Failed to load KPIs"
      })
      .addCase(fetchAttentionQueue.pending, (state) => {
        state.attentionQueue.status = "loading"
        state.attentionQueue.error = null
      })
      .addCase(fetchAttentionQueue.fulfilled, (state, action) => {
        state.attentionQueue.status = "succeeded"
        state.attentionQueue.data = action.payload
      })
      .addCase(fetchAttentionQueue.rejected, (state, action) => {
        state.attentionQueue.status = "failed"
        state.attentionQueue.error =
          action.error.message ?? "Failed to load the attention queue"
      })
      .addCase(fetchLifecycleFlow.pending, (state) => {
        state.lifecycleFlow.status = "loading"
        state.lifecycleFlow.error = null
      })
      .addCase(fetchLifecycleFlow.fulfilled, (state, action) => {
        state.lifecycleFlow.status = "succeeded"
        state.lifecycleFlow.data = action.payload
      })
      .addCase(fetchLifecycleFlow.rejected, (state, action) => {
        state.lifecycleFlow.status = "failed"
        state.lifecycleFlow.error =
          action.error.message ?? "Failed to load the lifecycle flow"
      })
  },
})

export const selectKpis = (state: RootState) => state.commandCenter.kpis
export const selectAttentionQueue = (state: RootState) =>
  state.commandCenter.attentionQueue
export const selectLifecycleFlow = (state: RootState) =>
  state.commandCenter.lifecycleFlow
export const commandCenterReducer = commandCenterSlice.reducer
