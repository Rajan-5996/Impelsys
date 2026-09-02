import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"

export type Anomaly = {
  anomaly_id: string
  run_id: string
  anomaly_type: string
  details: Record<string, unknown>
  has_precedent: boolean
  status: string
  decided_by: string | null
  decision_note: string | null
  created_at: string
  decided_at: string | null
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"

type AnomaliesState = {
  list: Anomaly[]
  status: AsyncStatus
  error: string | null
}

const initialState: AnomaliesState = {
  list: [],
  status: "idle",
  error: null,
}

export const fetchAnomalies = createAsyncThunk("anomalies/fetchAnomalies", async () => {
  const response = await axiosInstance.get<Anomaly[]>("/api/smart-etl/anomalies")
  return response.data
})

export type DecideAnomalyPayload = {
  anomalyId: string
  approve: boolean
  actor: string
  note: string
}

export const decideAnomaly = createAsyncThunk(
  "anomalies/decideAnomaly",
  async ({ anomalyId, approve, actor, note }: DecideAnomalyPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<{ run_id: string; status: string }>(
        `/api/smart-etl/anomalies/${anomalyId}/decide`,
        { approve, actor, note }
      )
      return response.data
    } catch (error) {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data
        ?.detail
      if (typeof detail === "string") {
        return rejectWithValue(detail)
      }
      throw error
    }
  }
)

const anomaliesSlice = createSlice({
  name: "anomalies",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnomalies.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchAnomalies.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.list = action.payload
      })
      .addCase(fetchAnomalies.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message ?? "Failed to load anomalies"
      })
  },
})

export const selectAnomalies = (state: RootState) => state.anomalies.list
export const selectAnomaliesStatus = (state: RootState) => state.anomalies.status
export const selectAnomaliesError = (state: RootState) => state.anomalies.error
export const anomaliesReducer = anomaliesSlice.reducer
