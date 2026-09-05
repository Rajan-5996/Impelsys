import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"

export type QualityCheckResult = {
  dimension_scores: Record<string, number>
  overall_score: number
  tier: string
  issues: string[]
  status: string
  decided_by: string | null
  decision_note: string | null
  created_at: string
  decided_at: string | null
}

type FetchStatus = "idle" | "loading" | "succeeded" | "failed"
type Fetchable<T> = { data: T; status: FetchStatus; error: string | null }

type DqGateState = {
  results: Record<string, Fetchable<QualityCheckResult | null>>
  deciding: boolean
}

const initialState: DqGateState = {
  results: {},
  deciding: false,
}

function extractErrorDetail(error: unknown): string | undefined {
  const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
  return typeof detail === "string" ? detail : undefined
}

export const fetchRunQualityCheck = createAsyncThunk(
  "dqGate/fetchRunQualityCheck",
  async (runId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<QualityCheckResult>(`/smart-etl/runs/${runId}/quality`)
      return { runId, result: response.data }
    } catch (error) {
      const detail = extractErrorDetail(error)
      return rejectWithValue({
        runId,
        detail: detail ?? "No quality check result is available for this run yet.",
      })
    }
  }
)

export const decideQuality = createAsyncThunk(
  "dqGate/decideQuality",
  async (
    { runId, approve, actor = "operator", note = "" }: {
      runId: string
      approve: boolean
      actor?: string
      note?: string
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post<{ run_id: string; status: string }>(
        `/smart-etl/runs/${runId}/quality/decide`,
        { approve, actor, note }
      )
      dispatch(fetchRunQualityCheck(runId))
      return response.data
    } catch (error) {
      return rejectWithValue(extractErrorDetail(error) ?? "Failed to submit the quality decision.")
    }
  }
)

const dqGateSlice = createSlice({
  name: "dqGate",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRunQualityCheck.pending, (state, action) => {
        state.results[action.meta.arg] = {
          data: state.results[action.meta.arg]?.data ?? null,
          status: "loading",
          error: null,
        }
      })
      .addCase(fetchRunQualityCheck.fulfilled, (state, action) => {
        state.results[action.payload.runId] = {
          data: action.payload.result,
          status: "succeeded",
          error: null,
        }
      })
      .addCase(fetchRunQualityCheck.rejected, (state, action) => {
        const payload = action.payload as { runId: string; detail: string } | undefined
        const runId = payload?.runId ?? action.meta.arg
        state.results[runId] = {
          data: null,
          status: "failed",
          error: payload?.detail ?? "Failed to load quality check result",
        }
      })
      .addCase(decideQuality.pending, (state) => {
        state.deciding = true
      })
      .addCase(decideQuality.fulfilled, (state) => {
        state.deciding = false
      })
      .addCase(decideQuality.rejected, (state) => {
        state.deciding = false
      })
  },
})

export const selectRunQualityCheck = (runId: string) => (state: RootState) =>
  state.dqGate.results[runId]
export const selectRunQualityChecks = (state: RootState) => state.dqGate.results
export const selectDqGateDeciding = (state: RootState) => state.dqGate.deciding
export const dqGateReducer = dqGateSlice.reducer
