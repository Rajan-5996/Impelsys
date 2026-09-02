import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"

export type AskLink = { screen: string; id: string }
export type AskResponse = { answer: string; link: AskLink | null; grounded: boolean }

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"

type AskState = {
  suggestions: string[]
  suggestionsStatus: AsyncStatus
  answerStatus: AsyncStatus
}

const initialState: AskState = {
  suggestions: [],
  suggestionsStatus: "idle",
  answerStatus: "idle",
}

export const fetchAskSuggestions = createAsyncThunk(
  "ask/fetchAskSuggestions",
  async () => {
    const response = await axiosInstance.get<{ suggestions: string[] }>(
      "/api/ask/suggestions"
    )
    return response.data.suggestions
  }
)

export const askQuestion = createAsyncThunk(
  "ask/askQuestion",
  async (question: string) => {
    const response = await axiosInstance.post<AskResponse>("/api/ask", { question })
    return response.data
  }
)

const askSlice = createSlice({
  name: "ask",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAskSuggestions.pending, (state) => {
        state.suggestionsStatus = "loading"
      })
      .addCase(fetchAskSuggestions.fulfilled, (state, action) => {
        state.suggestionsStatus = "succeeded"
        state.suggestions = action.payload
      })
      .addCase(fetchAskSuggestions.rejected, (state) => {
        state.suggestionsStatus = "failed"
      })
      .addCase(askQuestion.pending, (state) => {
        state.answerStatus = "loading"
      })
      .addCase(askQuestion.fulfilled, (state) => {
        state.answerStatus = "succeeded"
      })
      .addCase(askQuestion.rejected, (state) => {
        state.answerStatus = "failed"
      })
  },
})

export const selectAskSuggestions = (state: RootState) => state.ask.suggestions
export const selectAskSuggestionsStatus = (state: RootState) => state.ask.suggestionsStatus
export const selectAskAnswerStatus = (state: RootState) => state.ask.answerStatus
export const askReducer = askSlice.reducer
