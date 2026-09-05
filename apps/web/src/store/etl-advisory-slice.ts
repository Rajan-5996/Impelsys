import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"

export type EtlAdvisory =
  | { exists: false; run_id: string }
  | {
      exists: true
      run_id: string
      attempt_number: number
      warnings: string[]
      status: string
      decided_by: string | null
      decision_note: string | null
      created_at: string
      decided_at: string | null
    }

type FetchStatus = "idle" | "loading" | "succeeded" | "failed"
type Fetchable<T> = { data: T; status: FetchStatus; error: string | null }

type EtlAdvisoryState = {
  results: Record<string, Fetchable<EtlAdvisory | null>>
  deciding: boolean
}

const initialState: EtlAdvisoryState = {
  results: {},
  deciding: false,
}

function extractErrorDetail(error: unknown): string | undefined {
  const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
  return typeof detail === "string" ? detail : undefined
}

export const fetchEtlAdvisory = createAsyncThunk(
  "etlAdvisory/fetchEtlAdvisory",
  async (runId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<EtlAdvisory>(`/smart-etl/runs/${runId}/etl/advisory`)
      return { runId, result: response.data }
    } catch (error) {
      return rejectWithValue({
        runId,
        detail: extractErrorDetail(error) ?? "Failed to load advisory review for this run.",
      })
    }
  }
)

export const decideAdvisory = createAsyncThunk(
  "etlAdvisory/decideAdvisory",
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
        `/smart-etl/runs/${runId}/etl/advisory/decide`,
        { approve, actor, note }
      )
      dispatch(fetchEtlAdvisory(runId))
      return response.data
    } catch (error) {
      return rejectWithValue(extractErrorDetail(error) ?? "Failed to submit the advisory decision.")
    }
  }
)

const etlAdvisorySlice = createSlice({
  name: "etlAdvisory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEtlAdvisory.pending, (state, action) => {
        state.results[action.meta.arg] = {
          data: state.results[action.meta.arg]?.data ?? null,
          status: "loading",
          error: null,
        }
      })
      .addCase(fetchEtlAdvisory.fulfilled, (state, action) => {
        state.results[action.payload.runId] = {
          data: action.payload.result,
          status: "succeeded",
          error: null,
        }
      })
      .addCase(fetchEtlAdvisory.rejected, (state, action) => {
        const payload = action.payload as { runId: string; detail: string } | undefined
        const runId = payload?.runId ?? action.meta.arg
        state.results[runId] = {
          data: null,
          status: "failed",
          error: payload?.detail ?? "Failed to load advisory review",
        }
      })
      .addCase(decideAdvisory.pending, (state) => {
        state.deciding = true
      })
      .addCase(decideAdvisory.fulfilled, (state) => {
        state.deciding = false
      })
      .addCase(decideAdvisory.rejected, (state) => {
        state.deciding = false
      })
  },
})

export const selectEtlAdvisory = (runId: string) => (state: RootState) =>
  state.etlAdvisory.results[runId]
export const selectEtlAdvisoryDeciding = (state: RootState) => state.etlAdvisory.deciding
export const etlAdvisoryReducer = etlAdvisorySlice.reducer
