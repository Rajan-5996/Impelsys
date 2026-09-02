import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"
import type { SupplierTier } from "@/store/suppliers-slice"

export type ScorecardBreakdown = {
  Timeliness: number
  "Volume Accuracy": number
  "Schema Stability": number
  "Data Quality": number
  "SLA Compliance": number
}

export type ScorecardRow = {
  supplierId: string
  name: string
  score: number
  tier: SupplierTier
  breakdown: ScorecardBreakdown
  trend: number[]
  isReal: boolean
}

export type ScorecardWatchlist = {
  preferredCandidates: ScorecardRow[]
  downgradeWatch: ScorecardRow[]
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"
type Fetchable<T> = { data: T; status: AsyncStatus; error: string | null }

type ScorecardsState = {
  sortKey: "name" | "score" | null
  sortDir: 1 | -1
  list: Fetchable<ScorecardRow[]>
  current: Fetchable<ScorecardRow | null>
  watchlist: Fetchable<ScorecardWatchlist>
}

const initialState: ScorecardsState = {
  sortKey: null,
  sortDir: -1,
  list: { data: [], status: "idle", error: null },
  current: { data: null, status: "idle", error: null },
  watchlist: { data: { preferredCandidates: [], downgradeWatch: [] }, status: "idle", error: null },
}

export const fetchScorecards = createAsyncThunk("scorecards/fetchScorecards", async () => {
  const response = await axiosInstance.get<{ scorecards: ScorecardRow[] }>("/api/scorecards")
  return response.data.scorecards
})

export const fetchScorecardById = createAsyncThunk(
  "scorecards/fetchScorecardById",
  async (supplierId: string) => {
    const response = await axiosInstance.get<ScorecardRow>(`/api/scorecards/${supplierId}`)
    return response.data
  }
)

export const fetchScorecardWatchlist = createAsyncThunk(
  "scorecards/fetchScorecardWatchlist",
  async () => {
    const response = await axiosInstance.get<ScorecardWatchlist>("/api/scorecards/watchlist")
    return response.data
  }
)

export const fetchScorecardsCsv = createAsyncThunk(
  "scorecards/fetchScorecardsCsv",
  async () => {
    const response = await axiosInstance.get<string>("/api/scorecards/export/csv", {
      responseType: "text",
    })
    return response.data
  }
)

const scorecardsSlice = createSlice({
  name: "scorecards",
  initialState,
  reducers: {
    setScorecardSort: (state, action: PayloadAction<"name" | "score">) => {
      if (state.sortKey === action.payload) {
        state.sortDir = state.sortDir === 1 ? -1 : 1
      } else {
        state.sortKey = action.payload
        state.sortDir = action.payload === "score" ? -1 : 1
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchScorecards.pending, (state) => {
        state.list.status = "loading"
      })
      .addCase(fetchScorecards.fulfilled, (state, action) => {
        state.list.status = "succeeded"
        state.list.data = action.payload
      })
      .addCase(fetchScorecards.rejected, (state, action) => {
        state.list.status = "failed"
        state.list.error = action.error.message ?? "Failed to load scorecards"
      })
      .addCase(fetchScorecardById.pending, (state) => {
        state.current.status = "loading"
      })
      .addCase(fetchScorecardById.fulfilled, (state, action) => {
        state.current.status = "succeeded"
        state.current.data = action.payload
      })
      .addCase(fetchScorecardById.rejected, (state, action) => {
        state.current.status = "failed"
        state.current.error = action.error.message ?? "Failed to load scorecard"
      })
      .addCase(fetchScorecardWatchlist.pending, (state) => {
        state.watchlist.status = "loading"
      })
      .addCase(fetchScorecardWatchlist.fulfilled, (state, action) => {
        state.watchlist.status = "succeeded"
        state.watchlist.data = action.payload
      })
      .addCase(fetchScorecardWatchlist.rejected, (state, action) => {
        state.watchlist.status = "failed"
        state.watchlist.error = action.error.message ?? "Failed to load watchlist"
      })
  },
})

export const { setScorecardSort } = scorecardsSlice.actions
export const selectScorecardSort = (state: RootState) => ({
  sortKey: state.scorecards.sortKey,
  sortDir: state.scorecards.sortDir,
})
export const selectScorecardsList = (state: RootState) => state.scorecards.list
export const selectCurrentScorecard = (state: RootState) => state.scorecards.current
export const selectScorecardWatchlist = (state: RootState) => state.scorecards.watchlist
export const scorecardsReducer = scorecardsSlice.reducer
