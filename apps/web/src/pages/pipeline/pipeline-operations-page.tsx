import { Breadcrumbs } from "@/components/breadcrumbs"
import { PipelineIncidentList } from "@/pages/pipeline/pipeline-incident-list"
import { PipelineStageGrid } from "@/pages/pipeline/pipeline-stage-grid"

export function PipelineOperationsPage() {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs trail={[{ label: "Pipeline Operations" }]} />
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          Pipeline Operations
        </h1>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          Stage-level execution detail for SALES_DAILY_ETL
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <PipelineStageGrid />
        <PipelineIncidentList />
      </div>
    </div>
  )
}
