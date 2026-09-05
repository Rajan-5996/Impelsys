import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"

export type SearchResults = {
  suppliers: { id: string; name: string }[]
  pipelines: { id: string; name: string; isReal: boolean; supplierCount: number }[]
  datasets: { id: string; name: string }[]
  policies: { id: string; title: string }[]
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"

type SearchState = {
  results: SearchResults
  status: AsyncStatus
  error: string | null
}

const emptyResults: SearchResults = {
  suppliers: [],
  pipelines: [],
  datasets: [],
  policies: [],
}

const initialState: SearchState = {
  results: emptyResults,
  status: "idle",
  error: null,
}

export const fetchSearchResults = createAsyncThunk(
  "search/fetchSearchResults",
  async (query: string) => {
    if (!query.trim()) return emptyResults
    const response = await axiosInstance.get<SearchResults>("/search", {
      params: { q: query },
    })
    return response.data
  }
)

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.results = action.payload
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message ?? "Search failed"
      })
  },
})

export const selectSearchResults = (state: RootState) => state.search.results
export const selectSearchStatus = (state: RootState) => state.search.status
export const searchReducer = searchSlice.reducer
