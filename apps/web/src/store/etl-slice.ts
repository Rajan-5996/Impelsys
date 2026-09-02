import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"

type AsyncStatus = "idle" | "uploading" | "retrying" | "succeeded" | "failed"

type EtlState = {
  status: AsyncStatus
  error: string | null
}

const initialState: EtlState = {
  status: "idle",
  error: null,
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
        `/api/smart-etl/runs/${runId}/etl/upload-script`,
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
        `/api/smart-etl/runs/${runId}/etl/retry`,
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
  },
})

export const selectEtl = (state: RootState) => state.etl
export const etlReducer = etlSlice.reducer
