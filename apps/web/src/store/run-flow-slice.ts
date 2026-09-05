import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import { streamSsePost } from "@/lib/sse"
import {
  describeEvent,
  isTerminalEvent,
  normalizeStage,
  messageForRunStatus,
  type RunFlowEvent,
  type StageKey,
} from "@/store/run-flow-events"
import type { RootState } from "@/store/store"

export type { RunFlowEvent, StageKey } from "@/store/run-flow-events"
export { STAGE_ORDER } from "@/store/run-flow-events"

type RunDetailResponse = {
  run_id: string
  status: string
  current_stage: string
}

type RunFlowState = {
  runId: string | null
  currentStage: StageKey | null
  status: string | null
  message: string | null
  streaming: boolean
  error: string | null
}

function extractErrorDetail(error: unknown): string | undefined {
  const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
  return typeof detail === "string" ? detail : undefined
}

const ACTIVE_RUN_KEY = "smart-etl-active-run-id"

function readPersistedRunId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_RUN_KEY)
  } catch {
    return null
  }
}

function persistRunId(runId: string) {
  try {
    localStorage.setItem(ACTIVE_RUN_KEY, runId)
  } catch {
    // storage unavailable (private browsing, disabled) -- non-fatal
  }
}

const initialState: RunFlowState = {
  runId: readPersistedRunId(),
  currentStage: null,
  status: null,
  message: null,
  streaming: false,
  error: null,
}

export const triggerRunStream = createAsyncThunk(
  "runFlow/triggerRunStream",
  async (args: { onEvent?: (event: RunFlowEvent) => void } | undefined, { dispatch, rejectWithValue }) => {
    try {
      await streamSsePost(axiosInstance, "/smart-etl/runs", {}, (parsed) => {
        dispatch(runEventReceived(parsed as RunFlowEvent))
        args?.onEvent?.(parsed as RunFlowEvent)
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to stream run."
      dispatch(runEventReceived({ event: "error", detail: message }))
      return rejectWithValue(message)
    }
  }
)

export const fetchActiveRun = createAsyncThunk("runFlow/fetchActiveRun", async (runId: string) => {
  const response = await axiosInstance.get<RunDetailResponse>(`/smart-etl/runs/${runId}`)
  return response.data
})

type RunActionResponse = { run_id: string; status: string }

export const cancelRun = createAsyncThunk(
  "runFlow/cancelRun",
  async ({ runId, actor = "operator" }: { runId: string; actor?: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<RunActionResponse>(
        `/smart-etl/runs/${runId}/cancel`,
        { actor }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(extractErrorDetail(error) ?? "Failed to cancel the run.")
    }
  }
)

export const pauseRun = createAsyncThunk(
  "runFlow/pauseRun",
  async ({ runId, actor = "operator" }: { runId: string; actor?: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<RunActionResponse>(
        `/smart-etl/runs/${runId}/pause`,
        { actor }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(extractErrorDetail(error) ?? "Failed to pause the run.")
    }
  }
)

export const resumeRun = createAsyncThunk(
  "runFlow/resumeRun",
  async ({ runId, actor = "operator" }: { runId: string; actor?: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<RunActionResponse>(
        `/smart-etl/runs/${runId}/resume`,
        { actor }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(extractErrorDetail(error) ?? "Failed to resume the run.")
    }
  }
)

const runFlowSlice = createSlice({
  name: "runFlow",
  initialState,
  reducers: {
    runEventReceived: (state, action: PayloadAction<RunFlowEvent>) => {
      const event = action.payload
      if (event.run_id) {
        state.runId = event.run_id
        persistRunId(event.run_id)
      }
      const described = describeEvent(event)
      if (described.stage) state.currentStage = described.stage
      if (described.status) state.status = described.status
      state.message = described.message
      state.error = event.event === "error" ? described.message : null
      state.streaming = !isTerminalEvent(event)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(triggerRunStream.pending, (state) => {
        state.streaming = true
        state.error = null
      })
      .addCase(triggerRunStream.rejected, (state, action) => {
        state.streaming = false
        state.error = (action.payload as string) ?? "Failed to stream run."
      })
      .addCase(triggerRunStream.fulfilled, (state) => {
        state.streaming = false
      })
      .addCase(cancelRun.fulfilled, (state, action) => {
        state.status = action.payload.status
      })
      .addCase(pauseRun.fulfilled, (state, action) => {
        state.status = action.payload.status
      })
      .addCase(resumeRun.fulfilled, (state, action) => {
        state.status = action.payload.status
      })
      .addCase(fetchActiveRun.fulfilled, (state, action) => {
        state.runId = action.payload.run_id
        state.currentStage = normalizeStage(action.payload.current_stage)
        state.status = action.payload.status
        state.message = messageForRunStatus(action.payload.status)
        persistRunId(action.payload.run_id)
      })
  },
})

export const { runEventReceived } = runFlowSlice.actions
export const selectRunFlow = (state: RootState) => state.runFlow
export const runFlowReducer = runFlowSlice.reducer
