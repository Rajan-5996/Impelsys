import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { EmptyState } from "@/components/empty-state"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { SUPPLIERS, type Supplier, type SupplierTier } from "@/data/suppliers"

const TIER_VARIANT: Record<SupplierTier, StatusChipVariant> = {
  Preferred: "preferred",
  Approved: "approved",
  Monitor: "monitor",
  "At Risk": "atrisk",
}

function WatchlistRow({ supplier }: { supplier: Supplier }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-[12px] last:border-b-0">
      <span className="font-semibold text-foreground">{supplier.name}</span>
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-muted-foreground">
          {supplier.score}
        </span>
        <StatusChip variant={TIER_VARIANT[supplier.tier]}>
          {supplier.tier}
        </StatusChip>
      </div>
    </div>
  )
}

export function TierWatchlist() {
  const promotionCandidates = SUPPLIERS.filter(
    (supplier) => supplier.tier !== "Preferred" && supplier.score >= 85
  )
  const downgradeWatch = SUPPLIERS.filter(
    (supplier) => supplier.tier === "Monitor" || supplier.tier === "At Risk"
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tier Movement Watchlist</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[10.5px] font-semibold tracking-wide text-muted-foreground uppercase">
            Promotion Candidates
          </p>
          {promotionCandidates.length === 0 ? (
            <EmptyState message="No promotion candidates." />
          ) : (
            promotionCandidates.map((supplier) => (
              <WatchlistRow key={supplier.id} supplier={supplier} />
            ))
          )}
        </div>
        <div>
          <p className="mb-1.5 text-[10.5px] font-semibold tracking-wide text-muted-foreground uppercase">
            Downgrade Watch
          </p>
          {downgradeWatch.length === 0 ? (
            <EmptyState message="No suppliers on downgrade watch." />
          ) : (
            downgradeWatch.map((supplier) => (
              <WatchlistRow key={supplier.id} supplier={supplier} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
