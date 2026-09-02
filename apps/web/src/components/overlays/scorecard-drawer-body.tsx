import { useNavigate } from "react-router-dom"

import {
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"

import { Gauge, MetricBar } from "@/components/metrics"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { supplierDetailPath } from "@/constants/routes"
import { findSupplier, type SupplierTier } from "@/data/suppliers"
import { useAppDispatch } from "@/store/hooks"
import { closeDrawer } from "@/store/ui-slice"

const TIER_VARIANT: Record<SupplierTier, StatusChipVariant> = {
  Preferred: "preferred",
  Approved: "approved",
  Monitor: "monitor",
  "At Risk": "atrisk",
}

export function ScorecardDrawerBody({ supplierId }: { supplierId: string }) {
  const supplier = findSupplier(supplierId)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  if (!supplier) return null

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>{supplier.name}</SheetTitle>
      </SheetHeader>
      <div className="flex flex-col gap-4 px-8 pb-8">
        <div className="flex items-center justify-between">
          <StatusChip variant={TIER_VARIANT[supplier.tier]}>
            {supplier.tier}
          </StatusChip>
          <Gauge score={supplier.score} size={80} />
        </div>
        <div>
          <MetricBar label="Delivery" value={supplier.breakdown.delivery} />
          <MetricBar label="SLA" value={supplier.breakdown.sla} />
          <MetricBar label="Quality" value={supplier.breakdown.quality} />
          <MetricBar label="Incidents" value={supplier.breakdown.incidents} />
          <MetricBar label="Rejected Rate" value={supplier.breakdown.rejected} />
        </div>
        {supplier.drivers ? (
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
            <DriverField label="Late Feeds" value={supplier.drivers.lateFeeds} />
            <DriverField
              label="Schema Issues"
              value={supplier.drivers.schemaIssues}
            />
            <DriverField
              label="Product Code Failures"
              value={supplier.drivers.productCodeFailures}
            />
            <DriverField
              label="SLA Compliance"
              value={`${supplier.drivers.slaCompliance}%`}
            />
          </div>
        ) : null}
        <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
          {supplier.insight}
        </p>
        <button
          type="button"
          onClick={() => {
            dispatch(closeDrawer())
            navigate(supplierDetailPath(supplier.id))
          }}
          className="border border-border bg-muted/30 px-3 py-2 text-left text-[11.5px] font-semibold text-primary hover:bg-muted/50"
        >
          View full supplier detail
        </button>
      </div>
    </SheetContent>
  )
}

function DriverField({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div>
      <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-[12.5px] font-semibold text-foreground">
        {value}
      </p>
    </div>
  )
}
