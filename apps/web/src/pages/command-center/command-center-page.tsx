import { AgentActionsChart } from "@/pages/command-center/agent-actions-chart"
import { AgentSuccessChart } from "@/pages/command-center/agent-success-chart"
import { AgentWorkloadChart } from "@/pages/command-center/agent-workload-chart"
import { AnomaliesOverviewSection } from "@/pages/command-center/anomalies-overview-section"
import { AnomalyTrendSection } from "@/pages/command-center/anomaly-trend-section"
import { KpiSection } from "@/pages/command-center/kpi-section"
import { LifecycleSection } from "@/pages/command-center/lifecycle-section"
import { PipelineRunsChart } from "@/pages/command-center/pipeline-runs-chart"
import { SupplierPortfolioChart } from "@/pages/command-center/supplier-portfolio-chart"

export function CommandCenterPage() {
  return (
    <div className="flex flex-col gap-4">
      <KpiSection />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AgentActionsChart />
        <AgentSuccessChart />
        <AgentWorkloadChart />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SupplierPortfolioChart />
        <PipelineRunsChart />
      </div>
      <AnomaliesOverviewSection />
      <AnomalyTrendSection />
      <LifecycleSection />
    </div>
  )
}
