import { useEffect } from "react"

import { KpiCard } from "@/components/kpi-card"
import { EmptyState } from "@/components/empty-state"
import { fetchKpis, selectKpis } from "@/store/command-center-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

export function KpiSection() {
  const dispatch = useAppDispatch()
  const { data: kpis, status, error } = useAppSelector(selectKpis)

  useEffect(() => {
    dispatch(fetchKpis())
  }, [dispatch])

  if (status === "failed") {
    return <EmptyState message={error ?? "Failed to load KPIs."} />
  }

  if (status === "loading" || status === "idle") {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-[92px] animate-pulse rounded-xl border border-border bg-muted/40"
          />
        ))}
      </div>
    )
  }

  const visibleKpis = kpis.filter((kpi) => kpi.label !== "Open Incidents")

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
      {visibleKpis.map((kpi, index) => (
        <KpiCard key={kpi.label} kpi={kpi} index={index} />
      ))}
    </div>
  )
}
