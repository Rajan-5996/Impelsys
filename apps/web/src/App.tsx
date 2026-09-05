import { useEffect, useState } from "react"
import { useLocation, Route, Routes } from "react-router-dom"
import { motion } from "framer-motion"

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar"

import { AskAgentPanel } from "@/components/ask-agent/ask-agent-panel"
import { AuroraBackground } from "@/components/aurora-background"
import { DrawerHost } from "@/components/overlays/drawer-host"
import { ModalHost } from "@/components/overlays/modal-host"
import { Topbar } from "@/components/layout/topbar"
import { ToastStack } from "@/components/layout/toast-stack"
import { ROUTES } from "@/constants/routes"
import { readStoredSidebarOpen, writeStoredSidebarOpen } from "@/lib/sidebar-storage"
import { AgentWorkspacePage } from "@/pages/agents/agent-workspace-page"
import { AuditGovernancePage } from "@/pages/audit/audit-governance-page"
import { CommandCenterPage } from "@/pages/command-center/command-center-page"
import { ConnectorsPage } from "@/pages/connectors/connectors-page"
import { DataAnalystAgentPage } from "@/pages/data-analyst-agent/data-analyst-agent-page"
import { MetadataLakehousePage } from "@/pages/metadata-lakehouse/metadata-lakehouse-page"
import { IncidentsPage } from "@/pages/incidents/incidents-page"
import { RunDetailPage } from "@/pages/incidents/run-detail-page"
import { KnowledgePoliciesPage } from "@/pages/knowledge/knowledge-policies-page"
import { PipelineOperationsPage } from "@/pages/pipeline/pipeline-operations-page"
import { VendorPipelineDetailPage } from "@/pages/pipeline/vendor-pipeline-detail-page"
import { DatasetDetailPage } from "@/pages/quality/dataset-detail/dataset-detail-page"
import { ScorecardsPage } from "@/pages/scorecards/scorecards-page"
import { SettingsPage } from "@/pages/settings/settings-page"
import { SupplierDetailPage } from "@/pages/suppliers/detail/supplier-detail-page"

export function App() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(readStoredSidebarOpen)

  function handleSidebarOpenChange(open: boolean) {
    setSidebarOpen(open)
    writeStoredSidebarOpen(open)
  }

  useEffect(() => {
    const mainEl = document.querySelector("main")
    const scrollTarget: Window | Element = mainEl ?? window
    function handleScroll() {
      const top = mainEl ? mainEl.scrollTop : window.scrollY
      setScrolled(top > 4)
    }
    scrollTarget.addEventListener("scroll", handleScroll)
    window.addEventListener("scroll", handleScroll)
    return () => {
      scrollTarget.removeEventListener("scroll", handleScroll)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={handleSidebarOpenChange}>
      <AuroraBackground />
      <AppSidebar />
      <SidebarInset className="min-w-0 bg-transparent">
        <Topbar scrolled={scrolled} />
        <main
          className="flex-1 overflow-y-auto p-6"
          onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 4)}
        >
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <Routes>
              <Route path={ROUTES.commandCenter} element={<CommandCenterPage />} />
              <Route
                path={ROUTES.supplierDetail}
                element={<SupplierDetailPage />}
              />
              <Route path={ROUTES.pipeline} element={<PipelineOperationsPage />} />
              <Route
                path={ROUTES.pipelineVendorDetail}
                element={<VendorPipelineDetailPage />}
              />
              <Route path={ROUTES.connectors} element={<ConnectorsPage />} />
              <Route path={ROUTES.dataAnalystAgent} element={<DataAnalystAgentPage />} />
              <Route path={ROUTES.metadataLakehouse} element={<MetadataLakehousePage />} />
              <Route path={ROUTES.incidents} element={<IncidentsPage />} />
              <Route path={ROUTES.runDetail} element={<RunDetailPage />} />
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
          </motion.div>
        </main>
      </SidebarInset>
      <AskAgentPanel />
      <ModalHost />
      <DrawerHost />
      <ToastStack />
    </SidebarProvider>
  )
}
