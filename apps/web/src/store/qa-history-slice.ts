import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { qaAgentAxiosInstance } from "@/lib/axios-instance"
import type { QaAnalysisResult, QaFileSource, QaHistorySummary } from "@/store/qa-agent-events"
import type { RootState } from "@/store/store"

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"
type Fetchable<T> = { data: T; status: AsyncStatus; error: string | null }

type QaHistoryState = {
  list: Fetchable<QaHistorySummary[]>
  detailById: Record<string, Fetchable<QaAnalysisResult>>
  fileSource: Fetchable<QaFileSource | null>
}

const initialState: QaHistoryState = {
  list: { data: [], status: "idle", error: null },
  detailById: {},
  fileSource: { data: null, status: "idle", error: null },
}

export const fetchQaHistory = createAsyncThunk("qaHistory/fetchHistory", async () => {
  const response = await qaAgentAxiosInstance.get<{ history: QaHistorySummary[] }>("/api/qa/history")
  return response.data.history
})

export const fetchQaHistoryDetail = createAsyncThunk(
  "qaHistory/fetchHistoryDetail",
  async (analysisId: string) => {
    const response = await qaAgentAxiosInstance.get<QaAnalysisResult>(`/api/qa/history/${analysisId}`)
    return { analysisId, detail: response.data }
  }
)

export const fetchQaFileSource = createAsyncThunk(
  "qaHistory/fetchFileSource",
  async ({ analysisId, filePath }: { analysisId: string; filePath: string }) => {
    const response = await qaAgentAxiosInstance.get<QaFileSource>(`/api/qa/analysis/${analysisId}/file`, {
      params: { file_path: filePath },
    })
    return response.data
  }
)

const qaHistorySlice = createSlice({
  name: "qaHistory",
  initialState,
  reducers: {
    qaFileSourceCleared: (state) => {
      state.fileSource = { data: null, status: "idle", error: null }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQaHistory.pending, (state) => {
        state.list.status = "loading"
        state.list.error = null
      })
      .addCase(fetchQaHistory.fulfilled, (state, action) => {
        state.list.status = "succeeded"
        state.list.data = action.payload
      })
      .addCase(fetchQaHistory.rejected, (state, action) => {
        state.list.status = "failed"
        state.list.error = action.error.message ?? "Failed to load QA analysis history"
      })
      .addCase(fetchQaHistoryDetail.pending, (state, action) => {
        state.detailById[action.meta.arg] = {
          data: state.detailById[action.meta.arg]?.data as QaAnalysisResult,
          status: "loading",
          error: null,
        }
      })
      .addCase(fetchQaHistoryDetail.fulfilled, (state, action) => {
        state.detailById[action.payload.analysisId] = {
          data: action.payload.detail,
          status: "succeeded",
          error: null,
        }
      })
      .addCase(fetchQaHistoryDetail.rejected, (state, action) => {
        state.detailById[action.meta.arg] = {
          data: state.detailById[action.meta.arg]?.data as QaAnalysisResult,
          status: "failed",
          error: action.error.message ?? "Failed to load analysis detail",
        }
      })
      .addCase(fetchQaFileSource.pending, (state) => {
        state.fileSource.status = "loading"
        state.fileSource.error = null
      })
      .addCase(fetchQaFileSource.fulfilled, (state, action) => {
        state.fileSource.status = "succeeded"
        state.fileSource.data = action.payload
      })
      .addCase(fetchQaFileSource.rejected, (state, action) => {
        state.fileSource.status = "failed"
        state.fileSource.error = action.error.message ?? "Failed to load file source"
      })
  },
})

export const { qaFileSourceCleared } = qaHistorySlice.actions
export const selectQaHistoryList = (state: RootState) => state.qaHistory.list
export const selectQaHistoryDetail = (analysisId: string) => (state: RootState) =>
  state.qaHistory.detailById[analysisId]
export const selectQaFileSource = (state: RootState) => state.qaHistory.fileSource
export const qaHistoryReducer = qaHistorySlice.reducer
