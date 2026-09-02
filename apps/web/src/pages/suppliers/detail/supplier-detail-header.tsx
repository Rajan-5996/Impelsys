import { Breadcrumbs } from "@/components/breadcrumbs"
import { KpiCard } from "@/components/kpi-card"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import type { Supplier, SupplierTier } from "@/data/suppliers"
import { useAppSelector } from "@/store/hooks"
import { selectAuditLog } from "@/store/audit-slice"

const STATUS_VARIANT: Record<Supplier["statusToday"], StatusChipVariant> = {
  healthy: "ok",
  critical: "critical",
  investigating: "medium",
  delayed: "medium",
  missing: "critical",
}

const TIER_VARIANT: Record<SupplierTier, StatusChipVariant> = {
  Preferred: "preferred",
  Approved: "approved",
  Monitor: "monitor",
  "At Risk": "atrisk",
}

export function SupplierDetailHeader({ supplier }: { supplier: Supplier }) {
  const auditLog = useAppSelector(selectAuditLog)
  const openIncidents = auditLog.filter(
    (entry) => entry.supplier === supplier.name && entry.decision === "Pending"
  ).length

  return (
    <div className="flex flex-col gap-3">
      <Breadcrumbs
        trail={[{ label: "Supplier Monitor", path: "/suppliers" }, { label: supplier.name }]}
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-foreground">{supplier.name}</h1>
            <StatusChip variant={STATUS_VARIANT[supplier.statusToday]}>
              {supplier.statusToday}
            </StatusChip>
            <StatusChip variant={TIER_VARIANT[supplier.tier]}>
              {supplier.tier}
            </StatusChip>
          </div>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            {supplier.feed} &middot; {supplier.region} &middot; {supplier.method} &middot;{" "}
            {supplier.owner}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <KpiCard
          index={0}
          kpi={{
            label: "Score",
            value: String(supplier.score),
            sub: "out of 100",
            delta: null,
            accent: supplier.score >= 90 ? "up" : supplier.score >= 75 ? "flat" : "down",
          }}
        />
        <KpiCard
          index={1}
          kpi={{ label: "Active Feeds", value: "1", sub: supplier.feed, delta: null, accent: "info" }}
        />
        <KpiCard
          index={2}
          kpi={{
            label: "Open Incidents",
            value: String(openIncidents),
            sub: "pending decision",
            delta: null,
            accent: openIncidents > 0 ? "down" : "up",
          }}
        />
        <KpiCard
          index={3}
          kpi={{
            label: "SLA",
            value: String(supplier.breakdown.sla),
            suffix: "%",
            sub: "trailing 30 days",
            delta: null,
            accent: supplier.breakdown.sla >= 90 ? "up" : "flat",
          }}
        />
      </div>
    </div>
  )
}
