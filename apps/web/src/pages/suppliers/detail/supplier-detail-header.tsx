import { useEffect } from "react"

import { KpiCard } from "@/components/kpi-card"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { fetchSupplierSla, selectSupplierSla } from "@/store/supplier-detail-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import type { Supplier, SupplierTier } from "@/store/suppliers-slice"

const HEALTH_STATUS_VARIANT: Record<string, StatusChipVariant> = {
  Healthy: "ok",
  "Volume Anomaly": "critical",
  "Missing Feed": "critical",
  "Under Investigation": "medium",
  "Schema Change": "medium",
}

const TIER_VARIANT: Record<SupplierTier, StatusChipVariant> = {
  Preferred: "preferred",
  Approved: "approved",
  Monitor: "monitor",
  "At Risk": "atrisk",
}

export function SupplierDetailHeader({ supplier }: { supplier: Supplier }) {
  const dispatch = useAppDispatch()
  const sla = useAppSelector(selectSupplierSla)

  useEffect(() => {
    dispatch(fetchSupplierSla(supplier.id))
  }, [dispatch, supplier.id])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-foreground">{supplier.name}</h1>
            <StatusChip variant={HEALTH_STATUS_VARIANT[supplier.healthStatus] ?? "medium"}>
              {supplier.healthStatus}
            </StatusChip>
            <StatusChip variant={TIER_VARIANT[supplier.tier]}>
              {supplier.tier}
            </StatusChip>
          </div>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            {supplier.feed} &middot; {supplier.region} &middot; {supplier.deliveryMethod} &middot;{" "}
            {supplier.owner}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <KpiCard
          index={0}
          kpi={{
            label: "Score",
            value: supplier.score,
            sub: "out of 100",
            delta: null,
            accent: supplier.score >= 90 ? "up" : supplier.score >= 75 ? "flat" : "down",
          }}
        />
        <KpiCard
          index={1}
          kpi={{ label: "Active Feeds", value: 1, sub: supplier.feed, delta: null, accent: "info" }}
        />
        <KpiCard
          index={2}
          kpi={{
            label: "SLA",
            value: sla.data?.slaState === "breach" ? "Breach" : sla.data ? "OK" : "—",
            sub: sla.data?.sla ?? "current status",
            delta: null,
            accent: sla.data?.slaState === "breach" ? "down" : "up",
          }}
        />
      </div>
    </div>
  )
}
