import { configureStore } from "@reduxjs/toolkit"

import { agentsReducer } from "@/store/agents-slice"
import { anomaliesReducer } from "@/store/anomalies-slice"
import { askReducer } from "@/store/ask-slice"
import { auditReducer } from "@/store/audit-slice"
import { commandCenterReducer } from "@/store/command-center-slice"
import { dqGateReducer } from "@/store/dq-gate-slice"
import { etlReducer } from "@/store/etl-slice"
import { etlAdvisoryReducer } from "@/store/etl-advisory-slice"
import { githubConnectorReducer } from "@/store/github-connector-slice"
import { knowledgeReducer } from "@/store/knowledge-slice"
import { metadataLakehouseReducer } from "@/store/metadata-lakehouse-slice"
import { notificationsReducer } from "@/store/notifications-slice"
import { qaAgentReducer } from "@/store/qa-agent-slice"
import { qaHistoryReducer } from "@/store/qa-history-slice"
import { qualityDetailReducer } from "@/store/quality-detail-slice"
import { runFlowReducer } from "@/store/run-flow-slice"
import { runsReducer } from "@/store/runs-slice"
import { scorecardsReducer } from "@/store/scorecards-slice"
import { searchReducer } from "@/store/search-slice"
import { supplierDetailReducer } from "@/store/supplier-detail-slice"
import { suppliersReducer } from "@/store/suppliers-slice"
import { systemReducer } from "@/store/system-slice"
import { uiReducer } from "@/store/ui-slice"
import { vendorsReducer } from "@/store/vendors-slice"

export const store = configureStore({
  reducer: {
    commandCenter: commandCenterReducer,
    agents: agentsReducer,
    anomalies: anomaliesReducer,
    suppliers: suppliersReducer,
    supplierDetail: supplierDetailReducer,
    etl: etlReducer,
    etlAdvisory: etlAdvisoryReducer,
    dqGate: dqGateReducer,
    githubConnector: githubConnectorReducer,
    qaAgent: qaAgentReducer,
    qaHistory: qaHistoryReducer,
    qualityDetail: qualityDetailReducer,
    runs: runsReducer,
    runFlow: runFlowReducer,
    scorecards: scorecardsReducer,
    search: searchReducer,
    knowledge: knowledgeReducer,
    metadataLakehouse: metadataLakehouseReducer,
    notifications: notificationsReducer,
    system: systemReducer,
    audit: auditReducer,
    ask: askReducer,
    ui: uiReducer,
    vendors: vendorsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
