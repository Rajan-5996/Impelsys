import { useEffect } from "react"
import { Link, useParams } from "react-router-dom"

import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"

import { EmptyState } from "@/components/empty-state"
import { ContractsTab } from "@/pages/suppliers/detail/tabs/contracts-tab"
import { FeedsTab } from "@/pages/suppliers/detail/tabs/feeds-tab"
import { HistoryTab } from "@/pages/suppliers/detail/tabs/history-tab"
import { OverviewTab } from "@/pages/suppliers/detail/tabs/overview-tab"
import { QualityTab } from "@/pages/suppliers/detail/tabs/quality-tab"
import { SlaTab } from "@/pages/suppliers/detail/tabs/sla-tab"
import { SupplierDetailHeader } from "@/pages/suppliers/detail/supplier-detail-header"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchSupplierById, selectCurrentSupplier } from "@/store/suppliers-slice"

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "feeds", label: "Feeds" },
  { value: "quality", label: "Quality" },
  { value: "sla", label: "SLA" },
  { value: "history", label: "History" },
  { value: "contracts", label: "Contracts" },
]

export function SupplierDetailPage() {
  const { supplierId } = useParams<{ supplierId: string }>()
  const dispatch = useAppDispatch()
  const { data: supplier, status, error } = useAppSelector(selectCurrentSupplier)

  useEffect(() => {
    if (supplierId) dispatch(fetchSupplierById(supplierId))
  }, [dispatch, supplierId])

  if (status === "loading" || status === "idle") {
    return <div className="h-[320px] animate-pulse rounded-md bg-muted/40" />
  }

  if (status === "failed" || !supplier) {
    return (
      <div className="flex flex-col gap-3">
        <EmptyState message={error ?? "Supplier not found."} />
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
          <FeedsTab supplierId={supplier.id} />
        </TabsContent>
        <TabsContent value="quality">
          <QualityTab supplierId={supplier.id} />
        </TabsContent>
        <TabsContent value="sla">
          <SlaTab supplierId={supplier.id} />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab supplierId={supplier.id} />
        </TabsContent>
        <TabsContent value="contracts">
          <ContractsTab supplierId={supplier.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
