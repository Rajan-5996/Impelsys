import { configureStore } from "@reduxjs/toolkit"

import { agentsReducer } from "@/store/agents-slice"
import { anomaliesReducer } from "@/store/anomalies-slice"
import { askReducer } from "@/store/ask-slice"
import { auditReducer } from "@/store/audit-slice"
import { commandCenterReducer } from "@/store/command-center-slice"
import { etlReducer } from "@/store/etl-slice"
import { githubConnectorReducer } from "@/store/github-connector-slice"
import { knowledgeReducer } from "@/store/knowledge-slice"
import { notificationsReducer } from "@/store/notifications-slice"
import { pipelineReducer } from "@/store/pipeline-slice"
import { qaAgentReducer } from "@/store/qa-agent-slice"
import { qaHistoryReducer } from "@/store/qa-history-slice"
import { qualityDetailReducer } from "@/store/quality-detail-slice"
import { qualityReducer } from "@/store/quality-slice"
import { runFlowReducer } from "@/store/run-flow-slice"
import { runsReducer } from "@/store/runs-slice"
import { scorecardsReducer } from "@/store/scorecards-slice"
import { searchReducer } from "@/store/search-slice"
import { supplierDetailReducer } from "@/store/supplier-detail-slice"
import { suppliersReducer } from "@/store/suppliers-slice"
import { systemReducer } from "@/store/system-slice"
import { uiReducer } from "@/store/ui-slice"

export const store = configureStore({
  reducer: {
    commandCenter: commandCenterReducer,
    agents: agentsReducer,
    anomalies: anomaliesReducer,
    suppliers: suppliersReducer,
    supplierDetail: supplierDetailReducer,
    pipeline: pipelineReducer,
    etl: etlReducer,
    githubConnector: githubConnectorReducer,
    qaAgent: qaAgentReducer,
    qaHistory: qaHistoryReducer,
    quality: qualityReducer,
    qualityDetail: qualityDetailReducer,
    runs: runsReducer,
    runFlow: runFlowReducer,
    scorecards: scorecardsReducer,
    search: searchReducer,
    knowledge: knowledgeReducer,
    notifications: notificationsReducer,
    system: systemReducer,
    audit: auditReducer,
    ask: askReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
