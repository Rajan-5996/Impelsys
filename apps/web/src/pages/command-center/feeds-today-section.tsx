import { useNavigate } from "react-router-dom"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { EmptyState } from "@/components/empty-state"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { supplierDetailPath } from "@/constants/routes"
import { SUPPLIERS, type SupplierStatus } from "@/data/suppliers"

const STATUS_VARIANT: Record<SupplierStatus, StatusChipVariant> = {
  healthy: "ok",
  critical: "critical",
  investigating: "medium",
  delayed: "medium",
  missing: "critical",
}

export function FeedsTodaySection() {
  const navigate = useNavigate()
  const nonHealthy = SUPPLIERS.filter(
    (supplier) => supplier.statusToday !== "healthy"
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feeds Received Today</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {nonHealthy.length === 0 ? (
          <EmptyState message="All feeds healthy today." />
        ) : (
          nonHealthy.map((supplier) => (
            <button
              key={supplier.id}
              type="button"
              onClick={() => navigate(supplierDetailPath(supplier.id))}
              className="flex w-full items-center justify-between gap-2 border-b border-border px-4 py-2.5 text-left last:border-b-0 hover:bg-muted/40"
            >
              <span className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-foreground">
                  {supplier.name}
                </p>
                <p className="truncate text-[10.5px] text-muted-foreground">
                  {supplier.feed}
                </p>
              </span>
              <StatusChip variant={STATUS_VARIANT[supplier.statusToday]}>
                {supplier.statusToday}
              </StatusChip>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  )
}
