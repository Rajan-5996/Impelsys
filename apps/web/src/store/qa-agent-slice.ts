import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { qaAgentAxiosInstance } from "@/lib/axios-instance"
import { streamSsePost } from "@/lib/sse"
import {
  describeQaEvent,
  isTerminalQaEvent,
  type QaAnalysisEvent,
  type QaAnalysisResult,
  type QaStageKey,
  type QaTestingType,
} from "@/store/qa-agent-events"
import type { RootState } from "@/store/store"

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"
type Fetchable<T> = { data: T; status: AsyncStatus; error: string | null }

export type QaAnalyzePayload = {
  owner: string
  repository: string
  branch: string
  testing_type: string
}

type QaAgentState = {
  testingTypes: Fetchable<QaTestingType[]>
  stage: QaStageKey | null
  status: string | null
  message: string | null
  streaming: boolean
  error: string | null
  result: QaAnalysisResult | null
}

const initialState: QaAgentState = {
  testingTypes: { data: [], status: "idle", error: null },
  stage: null,
  status: null,
  message: null,
  streaming: false,
  error: null,
  result: null,
}

export const fetchTestingTypes = createAsyncThunk("qaAgent/fetchTestingTypes", async () => {
  const response = await qaAgentAxiosInstance.get<{ testing_types: QaTestingType[] }>("/api/testing/types")
  return response.data.testing_types
})

export const runQaAnalysis = createAsyncThunk(
  "qaAgent/runQaAnalysis",
  async (payload: QaAnalyzePayload, { dispatch, rejectWithValue }) => {
    try {
      await streamSsePost(qaAgentAxiosInstance, "/api/qa/analyze", payload, (parsed) => {
        dispatch(qaEventReceived(parsed as QaAnalysisEvent))
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to stream analysis."
      dispatch(qaEventReceived({ event: "error", detail: message }))
      return rejectWithValue(message)
    }
  }
)

const qaAgentSlice = createSlice({
  name: "qaAgent",
  initialState,
  reducers: {
    qaEventReceived: (state, action: PayloadAction<QaAnalysisEvent>) => {
      const event = action.payload
      const described = describeQaEvent(event)
      if (described.stage) state.stage = described.stage
      if (described.status) state.status = described.status
      state.message = described.message
      state.error = event.event === "error" ? described.message : null
      state.streaming = !isTerminalQaEvent(event)
      if (event.event === "analysis_completed") {
        const rest: Record<string, unknown> = { ...event }
        delete rest.event
        state.result = rest as unknown as QaAnalysisResult
      }
    },
    qaAnalysisReset: (state) => {
      state.stage = null
      state.status = null
      state.message = null
      state.streaming = false
      state.error = null
      state.result = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTestingTypes.pending, (state) => {
        state.testingTypes.status = "loading"
        state.testingTypes.error = null
      })
      .addCase(fetchTestingTypes.fulfilled, (state, action) => {
        state.testingTypes.status = "succeeded"
        state.testingTypes.data = action.payload
      })
      .addCase(fetchTestingTypes.rejected, (state, action) => {
        state.testingTypes.status = "failed"
        state.testingTypes.error = action.error.message ?? "Failed to load testing types"
      })
      .addCase(runQaAnalysis.pending, (state) => {
        state.streaming = true
        state.error = null
        state.result = null
      })
      .addCase(runQaAnalysis.rejected, (state, action) => {
        state.streaming = false
        state.error = (action.payload as string) ?? "Failed to stream analysis."
      })
      .addCase(runQaAnalysis.fulfilled, (state) => {
        state.streaming = false
      })
  },
})

export const { qaEventReceived, qaAnalysisReset } = qaAgentSlice.actions
export const selectQaAgent = (state: RootState) => state.qaAgent
export const qaAgentReducer = qaAgentSlice.reducer
