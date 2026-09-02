import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { PIPELINE_STAGES_INIT, type PipelineStage } from "@/data/incidents"
import type { RootState } from "@/store/store"

type PipelineState = {
  stages: PipelineStage[]
}

const initialState: PipelineState = {
  stages: PIPELINE_STAGES_INIT.map((stage) => ({ ...stage })),
}

const pipelineSlice = createSlice({
  name: "pipeline",
  initialState,
  reducers: {
    patchStage: (
      state,
      action: PayloadAction<{ index: number; changes: Partial<PipelineStage> }>
    ) => {
      const stage = state.stages[action.payload.index]
      if (stage) {
        Object.assign(stage, action.payload.changes)
      }
    },
    resolveDownstreamStages: (state) => {
      state.stages[2] = {
        ...state.stages[2],
        status: "done",
        recordsOut: state.stages[2].recordsIn - 1248,
        errors: 0,
        updated: "07:04:12",
      }
      state.stages[3] = { ...state.stages[3], status: "running", updated: "07:04:15" }
      state.stages[4] = { ...state.stages[4], status: "running" }
      state.stages[5] = { ...state.stages[5], status: "running" }
    },
  },
})

export const { patchStage, resolveDownstreamStages } = pipelineSlice.actions
export const selectPipelineStages = (state: RootState) => state.pipeline.stages
export const pipelineReducer = pipelineSlice.reducer
