import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"

export type Run = {
  run_id: string
  source_file: string
  status: string
  current_stage: string
  created_at: string
  updated_at: string
}

export type RunAuditEntry = {
  stage: string
  event: string
  actor: string
  details: Record<string, unknown>
  created_at: string
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"
type Fetchable<T> = { data: T; status: AsyncStatus; error: string | null }

type RunsState = {
  list: Run[]
  status: AsyncStatus
  error: string | null
  audit: Record<string, Fetchable<RunAuditEntry[]>>
}

const initialState: RunsState = {
  list: [],
  status: "idle",
  error: null,
  audit: {},
}

export const fetchRuns = createAsyncThunk("runs/fetchRuns", async () => {
  const response = await axiosInstance.get<Run[]>("/api/smart-etl/runs")
  return response.data
})

export const fetchRunAudit = createAsyncThunk(
  "runs/fetchRunAudit",
  async (runId: string) => {
    const response = await axiosInstance.get<RunAuditEntry[]>(
      `/api/smart-etl/runs/${runId}/audit`
    )
    return { runId, entries: response.data }
  }
)

const runsSlice = createSlice({
  name: "runs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRuns.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchRuns.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.list = action.payload
      })
      .addCase(fetchRuns.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message ?? "Failed to load runs"
      })
      .addCase(fetchRunAudit.pending, (state, action) => {
        state.audit[action.meta.arg] = {
          data: state.audit[action.meta.arg]?.data ?? [],
          status: "loading",
          error: null,
        }
      })
      .addCase(fetchRunAudit.fulfilled, (state, action) => {
        state.audit[action.payload.runId] = {
          data: action.payload.entries,
          status: "succeeded",
          error: null,
        }
      })
      .addCase(fetchRunAudit.rejected, (state, action) => {
        state.audit[action.meta.arg] = {
          data: [],
          status: "failed",
          error: action.error.message ?? "Failed to load run audit trail",
        }
      })
  },
})

export const selectRuns = (state: RootState) => state.runs.list
export const selectRunsStatus = (state: RootState) => state.runs.status
export const selectRunsError = (state: RootState) => state.runs.error
export const selectRunAudit = (runId: string) => (state: RootState) =>
  state.runs.audit[runId]
export const runsReducer = runsSlice.reducer
