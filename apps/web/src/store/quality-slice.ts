import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { RootState } from "@/store/store"

export type QualityTab =
  | "dataset"
  | "supplier"
  | "rules"
  | "deteriorations"
  | "trends"

type QualityState = {
  activeTab: QualityTab
}

const initialState: QualityState = {
  activeTab: "dataset",
}

const qualitySlice = createSlice({
  name: "quality",
  initialState,
  reducers: {
    setQualityTab: (state, action: PayloadAction<QualityTab>) => {
      state.activeTab = action.payload
    },
  },
})

export const { setQualityTab } = qualitySlice.actions
export const selectQualityActiveTab = (state: RootState) =>
  state.quality.activeTab
export const qualityReducer = qualitySlice.reducer
