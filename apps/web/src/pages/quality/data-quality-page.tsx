import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

import { Breadcrumbs } from "@/components/breadcrumbs"
import { QualityDimensionGrid } from "@/pages/quality/quality-dimension-grid"
import { QualityKpiRow } from "@/pages/quality/quality-kpi-row"
import { DatasetTab } from "@/pages/quality/tabs/dataset-tab"
import { DeteriorationsTab } from "@/pages/quality/tabs/deteriorations-tab"
import { RulesTab } from "@/pages/quality/tabs/rules-tab"
import { SupplierTab } from "@/pages/quality/tabs/supplier-tab"
import { TrendsTab } from "@/pages/quality/tabs/trends-tab"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { selectQualityActiveTab, setQualityTab, type QualityTab } from "@/store/quality-slice"

const TAB_LABELS: Record<QualityTab, string> = {
  dataset: "Dataset",
  supplier: "Supplier",
  rules: "Rules",
  deteriorations: "Deteriorations",
  trends: "Trends",
}

export function DataQualityPage() {
  const dispatch = useAppDispatch()
  const activeTab = useAppSelector(selectQualityActiveTab)

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs trail={[{ label: "Data Quality" }]} />
      <div>
        <h1 className="text-lg font-semibold text-foreground">Data Quality</h1>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          Enterprise data quality across all monitored datasets
        </p>
      </div>

      <QualityKpiRow />
      <QualityDimensionGrid />

      <Tabs
        value={activeTab}
        onValueChange={(value) => dispatch(setQualityTab(value as QualityTab))}
      >
        <TabsList>
          {(Object.keys(TAB_LABELS) as QualityTab[]).map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {TAB_LABELS[tab]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {activeTab === "dataset" ? <DatasetTab /> : null}
      {activeTab === "supplier" ? <SupplierTab /> : null}
      {activeTab === "rules" ? <RulesTab /> : null}
      {activeTab === "deteriorations" ? <DeteriorationsTab /> : null}
      {activeTab === "trends" ? <TrendsTab /> : null}
    </div>
  )
}
