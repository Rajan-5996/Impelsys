import { configureStore } from "@reduxjs/toolkit"

import { auditReducer } from "@/store/audit-slice"
import { incidentsReducer } from "@/store/incidents-slice"
import { knowledgeReducer } from "@/store/knowledge-slice"
import { pipelineReducer } from "@/store/pipeline-slice"
import { qualityReducer } from "@/store/quality-slice"
import { scorecardsReducer } from "@/store/scorecards-slice"
import { suppliersReducer } from "@/store/suppliers-slice"
import { uiReducer } from "@/store/ui-slice"

export const store = configureStore({
  reducer: {
    suppliers: suppliersReducer,
    pipeline: pipelineReducer,
    incidents: incidentsReducer,
    quality: qualityReducer,
    scorecards: scorecardsReducer,
    knowledge: knowledgeReducer,
    audit: auditReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
