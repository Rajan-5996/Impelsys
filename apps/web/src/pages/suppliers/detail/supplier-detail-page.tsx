import { Link, useParams } from "react-router-dom"

import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"

import { EmptyState } from "@/components/empty-state"
import { findSupplier } from "@/data/suppliers"
import { ContractsTab } from "@/pages/suppliers/detail/tabs/contracts-tab"
import { FeedsTab } from "@/pages/suppliers/detail/tabs/feeds-tab"
import { HistoryTab } from "@/pages/suppliers/detail/tabs/history-tab"
import { IncidentsTab } from "@/pages/suppliers/detail/tabs/incidents-tab"
import { OverviewTab } from "@/pages/suppliers/detail/tabs/overview-tab"
import { QualityTab } from "@/pages/suppliers/detail/tabs/quality-tab"
import { SlaTab } from "@/pages/suppliers/detail/tabs/sla-tab"
import { SupplierDetailHeader } from "@/pages/suppliers/detail/supplier-detail-header"

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "feeds", label: "Feeds" },
  { value: "quality", label: "Quality" },
  { value: "incidents", label: "Incidents" },
  { value: "sla", label: "SLA" },
  { value: "history", label: "History" },
  { value: "contracts", label: "Contracts" },
]

export function SupplierDetailPage() {
  const { supplierId } = useParams<{ supplierId: string }>()
  const supplier = supplierId ? findSupplier(supplierId) : undefined

  if (!supplier) {
    return (
      <div className="flex flex-col gap-3">
        <EmptyState message="Supplier not found." />
        <Link to="/suppliers" className="text-xs font-semibold text-primary">
          Back to Supplier Monitor
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SupplierDetailHeader supplier={supplier} />
      <Tabs defaultValue="overview">
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
          <TabsIndicator />
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab supplier={supplier} />
        </TabsContent>
        <TabsContent value="feeds">
          <FeedsTab supplier={supplier} />
        </TabsContent>
        <TabsContent value="quality">
          <QualityTab supplier={supplier} />
        </TabsContent>
        <TabsContent value="incidents">
          <IncidentsTab supplier={supplier} />
        </TabsContent>
        <TabsContent value="sla">
          <SlaTab supplier={supplier} />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab supplier={supplier} />
        </TabsContent>
        <TabsContent value="contracts">
          <ContractsTab supplier={supplier} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
