import { useEffect } from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { EmptyState } from "@/components/empty-state"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchScorecardWatchlist,
  selectScorecardWatchlist,
  type ScorecardRow,
} from "@/store/scorecards-slice"
import type { SupplierTier } from "@/store/suppliers-slice"

const TIER_VARIANT: Record<SupplierTier, StatusChipVariant> = {
  Preferred: "preferred",
  Approved: "approved",
  Monitor: "monitor",
  "At Risk": "atrisk",
}

function WatchlistRow({ supplier }: { supplier: ScorecardRow }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-[12px] last:border-b-0">
      <span className="font-semibold text-foreground">{supplier.name}</span>
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-muted-foreground">{supplier.score}</span>
        <StatusChip variant={TIER_VARIANT[supplier.tier]}>{supplier.tier}</StatusChip>
      </div>
    </div>
  )
}

export function TierWatchlist() {
  const dispatch = useAppDispatch()
  const { data: watchlist, status, error } = useAppSelector(selectScorecardWatchlist)

  useEffect(() => {
    dispatch(fetchScorecardWatchlist())
  }, [dispatch])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tier Movement Watchlist</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {status === "failed" ? (
          <EmptyState message={error ?? "Failed to load the watchlist."} />
        ) : status === "loading" || status === "idle" ? (
          <div className="h-32 animate-pulse rounded-md bg-muted/40 sm:col-span-2" />
        ) : (
          <>
            <div>
              <p className="mb-1.5 text-[10.5px] font-semibold tracking-wide text-muted-foreground uppercase">
                Promotion Candidates
              </p>
              {watchlist.preferredCandidates.length === 0 ? (
                <EmptyState message="No promotion candidates." />
              ) : (
                watchlist.preferredCandidates.map((supplier) => (
                  <WatchlistRow key={supplier.supplierId} supplier={supplier} />
                ))
              )}
            </div>
            <div>
              <p className="mb-1.5 text-[10.5px] font-semibold tracking-wide text-muted-foreground uppercase">
                Downgrade Watch
              </p>
              {watchlist.downgradeWatch.length === 0 ? (
                <EmptyState message="No suppliers on downgrade watch." />
              ) : (
                watchlist.downgradeWatch.map((supplier) => (
                  <WatchlistRow key={supplier.supplierId} supplier={supplier} />
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
