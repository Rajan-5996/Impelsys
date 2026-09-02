import { Route, Routes } from "react-router-dom"

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar"

import { AskAgentPanel } from "@/components/ask-agent/ask-agent-panel"
import { DrawerHost } from "@/components/overlays/drawer-host"
import { ModalHost } from "@/components/overlays/modal-host"
import { Topbar } from "@/components/layout/topbar"
import { ToastStack } from "@/components/layout/toast-stack"
import { ROUTES } from "@/constants/routes"
import { AgentWorkspacePage } from "@/pages/agents/agent-workspace-page"
import { AuditGovernancePage } from "@/pages/audit/audit-governance-page"
import { CommandCenterPage } from "@/pages/command-center/command-center-page"
import { ConnectorsPage } from "@/pages/connectors/connectors-page"
import { IncidentsPage } from "@/pages/incidents/incidents-page"
import { RunDetailPage } from "@/pages/incidents/run-detail-page"
import { KnowledgePoliciesPage } from "@/pages/knowledge/knowledge-policies-page"
import { PipelineOperationsPage } from "@/pages/pipeline/pipeline-operations-page"
import { DatasetDetailPage } from "@/pages/quality/dataset-detail/dataset-detail-page"
import { DataQualityPage } from "@/pages/quality/data-quality-page"
import { ScorecardsPage } from "@/pages/scorecards/scorecards-page"
import { SettingsPage } from "@/pages/settings/settings-page"
import { SupplierDetailPage } from "@/pages/suppliers/detail/supplier-detail-page"
import { SupplierMonitorPage } from "@/pages/suppliers/supplier-monitor-page"

export function App() {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path={ROUTES.commandCenter} element={<CommandCenterPage />} />
            <Route path={ROUTES.suppliers} element={<SupplierMonitorPage />} />
            <Route
              path={ROUTES.supplierDetail}
              element={<SupplierDetailPage />}
            />
            <Route path={ROUTES.pipeline} element={<PipelineOperationsPage />} />
            <Route path={ROUTES.connectors} element={<ConnectorsPage />} />
            <Route path={ROUTES.incidents} element={<IncidentsPage />} />
            <Route path={ROUTES.runDetail} element={<RunDetailPage />} />
            <Route path={ROUTES.quality} element={<DataQualityPage />} />
            <Route
              path={ROUTES.datasetDetail}
              element={<DatasetDetailPage />}
            />
            <Route path={ROUTES.scorecards} element={<ScorecardsPage />} />
            <Route path={ROUTES.agents} element={<AgentWorkspacePage />} />
            <Route path={ROUTES.knowledge} element={<KnowledgePoliciesPage />} />
            <Route path={ROUTES.audit} element={<AuditGovernancePage />} />
            <Route path={ROUTES.settings} element={<SettingsPage />} />
          </Routes>
        </main>
      </SidebarInset>
      <AskAgentPanel />
      <ModalHost />
      <DrawerHost />
      <ToastStack />
    </SidebarProvider>
  )
}
