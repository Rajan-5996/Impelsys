import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { RootState } from "@/store/store"

type ScorecardsState = {
  sortKey: "name" | "score" | null
  sortDir: 1 | -1
}

const initialState: ScorecardsState = {
  sortKey: null,
  sortDir: -1,
}

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
})

export const { setScorecardSort } = scorecardsSlice.actions
export const selectScorecardSort = (state: RootState) => state.scorecards
export const scorecardsReducer = scorecardsSlice.reducer
