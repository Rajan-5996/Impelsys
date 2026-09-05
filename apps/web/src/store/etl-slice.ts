import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"

type AsyncStatus = "idle" | "uploading" | "retrying" | "succeeded" | "failed"
type FetchStatus = "idle" | "loading" | "succeeded" | "failed"
type Fetchable<T> = { data: T; status: FetchStatus; error: string | null }

export type EtlStageLogEntry = {
  stage: string
  status: string
  row_count: number
}

export type EtlAttempt = {
  attempt_id: string
  attempt_number: number
  script_path: string
  engine: string
  status: string
  stage_log: EtlStageLogEntry[]
  error_message: string | null
  output_row_count: number | null
  validation: { passed: boolean; issues: string[] } | null
  created_at: string
}

export type EtlRootCause = {
  summary: string
  failing_stage: string | null
  failing_column: string | null
  expected_column: string | null
  investigation_trail: string | null
}

export type EtlFailureAnalysis = {
  analysis_id: string
  attempt_id: string
  source: string
  error_message: string | null
  root_cause: EtlRootCause
  corrected_script: string | null
  original_script: string | null
  confidence: string
  created_at: string
}

type EtlState = {
  status: AsyncStatus
  error: string | null
  attempts: Record<string, Fetchable<EtlAttempt[]>>
  failureAnalysis: Record<string, Fetchable<EtlFailureAnalysis | null>>
}

const initialState: EtlState = {
  status: "idle",
  error: null,
  attempts: {},
  failureAnalysis: {},
}

function extractErrorDetail(error: unknown): string | undefined {
  const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
  return typeof detail === "string" ? detail : undefined
}

export const uploadEtlScript = createAsyncThunk(
  "etl/uploadEtlScript",
  async ({ runId, file }: { runId: string; file: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append("script", file)
      const response = await axiosInstance.post(
        `/smart-etl/runs/${runId}/etl/upload-script`,
        formData,
        { headers: { "Content-Type": undefined } }
      )
      return response.data
    } catch (error) {
      const detail = extractErrorDetail(error)
      if (detail) return rejectWithValue(detail)
      throw error
    }
  }
)

export const retryEtl = createAsyncThunk(
  "etl/retryEtl",
  async ({ runId, actor }: { runId: string; actor: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<{ run_id: string; status: string }>(
        `/smart-etl/runs/${runId}/etl/retry`,
        { actor }
      )
      return response.data
    } catch (error) {
      const detail = extractErrorDetail(error)
      if (detail) return rejectWithValue(detail)
      throw error
    }
  }
)

export const fetchEtlAttempts = createAsyncThunk(
  "etl/fetchEtlAttempts",
  async (runId: string) => {
    const response = await axiosInstance.get<EtlAttempt[]>(
      `/smart-etl/runs/${runId}/etl/attempts`
    )
    return { runId, attempts: response.data }
  }
)

export const fetchEtlFailureAnalysis = createAsyncThunk(
  "etl/fetchEtlFailureAnalysis",
  async (runId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<EtlFailureAnalysis>(
        `/smart-etl/runs/${runId}/etl/failure-analysis`
      )
      return { runId, analysis: response.data }
    } catch (error) {
      const detail = extractErrorDetail(error)
      return rejectWithValue({
        runId,
        detail: detail ?? "No failure analysis is available for this run yet.",
      })
    }
  }
)

const etlSlice = createSlice({
  name: "etl",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadEtlScript.pending, (state) => {
        state.status = "uploading"
        state.error = null
      })
      .addCase(uploadEtlScript.rejected, (state, action) => {
        state.status = "failed"
        state.error = (action.payload as string) ?? "Failed to upload script"
      })
      .addCase(retryEtl.pending, (state) => {
        state.status = "retrying"
        state.error = null
      })
      .addCase(retryEtl.fulfilled, (state) => {
        state.status = "succeeded"
      })
      .addCase(retryEtl.rejected, (state, action) => {
        state.status = "failed"
        state.error = (action.payload as string) ?? "Failed to trigger retry"
      })
      .addCase(fetchEtlAttempts.pending, (state, action) => {
        state.attempts[action.meta.arg] = {
          data: state.attempts[action.meta.arg]?.data ?? [],
          status: "loading",
          error: null,
        }
      })
      .addCase(fetchEtlAttempts.fulfilled, (state, action) => {
        state.attempts[action.payload.runId] = {
          data: action.payload.attempts,
          status: "succeeded",
          error: null,
        }
      })
      .addCase(fetchEtlAttempts.rejected, (state, action) => {
        state.attempts[action.meta.arg] = {
          data: [],
          status: "failed",
          error: action.error.message ?? "Failed to load ETL attempts",
        }
      })
      .addCase(fetchEtlFailureAnalysis.pending, (state, action) => {
        state.failureAnalysis[action.meta.arg] = {
          data: state.failureAnalysis[action.meta.arg]?.data ?? null,
          status: "loading",
          error: null,
        }
      })
      .addCase(fetchEtlFailureAnalysis.fulfilled, (state, action) => {
        state.failureAnalysis[action.payload.runId] = {
          data: action.payload.analysis,
          status: "succeeded",
          error: null,
        }
      })
      .addCase(fetchEtlFailureAnalysis.rejected, (state, action) => {
        const payload = action.payload as { runId: string; detail: string } | undefined
        const runId = payload?.runId ?? action.meta.arg
        state.failureAnalysis[runId] = {
          data: null,
          status: "failed",
          error: payload?.detail ?? "Failed to load failure analysis",
        }
      })
  },
})

export const selectEtl = (state: RootState) => state.etl
export const selectEtlAttempts = (runId: string) => (state: RootState) =>
  state.etl.attempts[runId]
export const selectEtlFailureAnalysis = (runId: string) => (state: RootState) =>
  state.etl.failureAnalysis[runId]
export const etlReducer = etlSlice.reducer
