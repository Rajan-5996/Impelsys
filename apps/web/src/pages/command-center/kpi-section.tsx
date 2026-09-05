import { useEffect } from "react"

import { KpiCard } from "@/components/kpi-card"
import { EmptyState } from "@/components/empty-state"
import { DotCluster, MiniBar, MiniColumnChart, SegmentedPills, parseTotalFromSub } from "@/components/kpi-visuals"
import { fetchKpis, selectKpis, type KpiDef } from "@/store/command-center-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const KPI_DISPLAY_LABEL: Record<string, string> = {
  "Data Feeds Today": "Vendor Feeds Ingested",
  "Healthy Feeds": "Agent-Verified Feeds",
  "Active Anomalies": "Agent-Flagged Anomalies",
  "Enterprise Data Quality": "AI Confidence Score",
  "Suppliers Within SLA": "Suppliers Within SLA",
}

function visualFor(kpi: KpiDef) {
  const value = Number(kpi.value)
  const total = parseTotalFromSub(kpi.sub)

  switch (kpi.label) {
    case "Data Feeds Today":
      return (color: string) => <SegmentedPills filled={value} total={total ?? value} color={color} />
    case "Active Anomalies":
      return (color: string) => <MiniColumnChart seed={kpi.label} color={color} />
    case "Enterprise Data Quality":
      return (color: string) => <DotCluster count={Math.round(value / 20)} max={5} color={color} />
    case "Suppliers Within SLA":
      return (color: string) => <MiniBar pct={value} color={color} />
    default:
      return undefined
  }
}

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
        <KpiCard
          key={kpi.label}
          kpi={kpi}
          index={index}
          displayLabel={KPI_DISPLAY_LABEL[kpi.label]}
          visual={visualFor(kpi)}
        />
      ))}
    </div>
  )
}
