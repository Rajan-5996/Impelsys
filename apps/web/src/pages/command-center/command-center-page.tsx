import { AgentActionsChart } from "@/pages/command-center/agent-actions-chart"
import { AnomalyAgentVendorChart } from "@/pages/command-center/anomaly-agent-vendor-chart"
import { AnomalyTrendSection } from "@/pages/command-center/anomaly-trend-section"
import { KpiSection } from "@/pages/command-center/kpi-section"
import { LifecycleSection } from "@/pages/command-center/lifecycle-section"

export function CommandCenterPage() {
  return (
    <div className="flex flex-col gap-3">
      <KpiSection />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <AgentActionsChart />
        <LifecycleSection />
        <AnomalyAgentVendorChart />
      </div>
      <AnomalyTrendSection />
    </div>
  )
}
