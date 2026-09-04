import { useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { PieMetricChart } from "@/components/charts/pie-metric-chart"
import { EmptyState } from "@/components/empty-state"
import { BRAND_CHART_COLORS } from "@/lib/status-bar-colors"
import {
  fetchSuppliers,
  selectSuppliersList,
  selectSuppliersListError,
  selectSuppliersListStatus,
  type SupplierTier,
} from "@/store/suppliers-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const TIER_ORDER: SupplierTier[] = ["Preferred", "Approved", "Monitor", "At Risk"]

export function SupplierPortfolioChart() {
  const dispatch = useAppDispatch()
  const suppliers = useAppSelector(selectSuppliersList)
  const status = useAppSelector(selectSuppliersListStatus)
  const error = useAppSelector(selectSuppliersListError)

  useEffect(() => {
    dispatch(fetchSuppliers())
  }, [dispatch])

  const data = TIER_ORDER.map((tier, index) => ({
    key: tier,
    label: tier,
    value: suppliers.filter((supplier) => supplier.tier === tier).length,
    color: BRAND_CHART_COLORS[index % BRAND_CHART_COLORS.length]!,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Scored Supplier Tiers</CardTitle>
      </CardHeader>
      <CardContent>
        {status === "failed" ? (
          <EmptyState message={error ?? "Failed to load suppliers."} />
        ) : status === "loading" || status === "idle" ? (
          <div className="h-[168px] animate-pulse rounded-md bg-muted/40" />
        ) : suppliers.length === 0 ? (
          <EmptyState message="No suppliers onboarded yet." />
        ) : (
          <PieMetricChart data={data} />
        )}
      </CardContent>
    </Card>
  )
}
