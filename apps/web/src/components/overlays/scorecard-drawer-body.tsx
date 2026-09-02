import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import {
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"

import { EmptyState } from "@/components/empty-state"
import { Gauge, MetricBar } from "@/components/metrics"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { supplierDetailPath } from "@/constants/routes"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchScorecardById, selectCurrentScorecard } from "@/store/scorecards-slice"
import type { SupplierTier } from "@/store/suppliers-slice"
import { closeDrawer } from "@/store/ui-slice"

const TIER_VARIANT: Record<SupplierTier, StatusChipVariant> = {
  Preferred: "preferred",
  Approved: "approved",
  Monitor: "monitor",
  "At Risk": "atrisk",
}

export function ScorecardDrawerBody({ supplierId }: { supplierId: string }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { data: supplier, status, error } = useAppSelector(selectCurrentScorecard)

  useEffect(() => {
    dispatch(fetchScorecardById(supplierId))
  }, [dispatch, supplierId])

  if (status === "loading" || status === "idle") {
    return (
      <SheetContent>
        <div className="h-64 animate-pulse rounded-md bg-muted/40" />
      </SheetContent>
    )
  }

  if (status === "failed" || !supplier) {
    return (
      <SheetContent>
        <EmptyState message={error ?? "Scorecard not found."} />
      </SheetContent>
    )
  }

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
          <MetricBar label="Timeliness" value={supplier.breakdown.Timeliness} />
          <MetricBar label="Volume Accuracy" value={supplier.breakdown["Volume Accuracy"]} />
          <MetricBar label="Schema Stability" value={supplier.breakdown["Schema Stability"]} />
          <MetricBar label="Data Quality" value={supplier.breakdown["Data Quality"]} />
          <MetricBar label="SLA Compliance" value={supplier.breakdown["SLA Compliance"]} />
        </div>
        <button
          type="button"
          onClick={() => {
            dispatch(closeDrawer())
            navigate(supplierDetailPath(supplier.supplierId))
          }}
          className="border border-border bg-muted/30 px-3 py-2 text-left text-[11.5px] font-semibold text-primary hover:bg-muted/50"
        >
          View full supplier detail
        </button>
      </div>
    </SheetContent>
  )
}
