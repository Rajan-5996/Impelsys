import { useEffect } from "react"

import { KpiCard } from "@/components/kpi-card"
import { EmptyState } from "@/components/empty-state"
import {
  BulletBar,
  CompareBars,
  GradientCapsule,
  parseAcrossFromSub,
  parseTotalFromSub,
} from "@/components/kpi-visuals"
import { fetchKpis, selectKpis, type KpiDef } from "@/store/command-center-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

// Every KPI card reads as what an AI agent did, not raw data-pipeline
// counters -- matches the AnomaliX/DataGuard/FlowFix branding used elsewhere
// (Agent Lifecycle, AI Agent Actions) instead of generic feed/supplier language.
const KPI_DISPLAY_LABEL: Record<string, string> = {
  "Data Feeds Today": "Feeds Processed by Agents",
  "Healthy Feeds": "AnomaliX Verified Feeds",
  "Active Anomalies": "AnomaliX Flagged Anomalies",
  "Open Incidents": "Agents Awaiting Approval",
  "Enterprise Data Quality": "DataGuard Quality Score",
  "Suppliers Within SLA": "Agent-Verified Suppliers",
}

// Each chart renders the KPI's own real numbers, not a decorative shape --
// a gradient capsule with tick marks for a discrete "X of Y" count, two real
// bars (headline count vs. its own sub-count) for a spread, a bullet bar
// (value vs. a real threshold) for a percentage. Open Incidents/Enterprise
// Data Quality fall through to the default line-chart Sparkline in KpiCard,
// which is biased by the KPI's own real up/down/flat delta. No dot/scatter
// markers anywhere.
function visualFor(kpi: KpiDef) {
  const value = Number(kpi.value)
  const total = parseTotalFromSub(kpi.sub)
  const across = parseAcrossFromSub(kpi.sub)

  switch (kpi.label) {
    case "Healthy Feeds":
      return (color: string) => <GradientCapsule filled={value} total={total ?? value} color={color} />
    case "Active Anomalies":
      return across === null
        ? undefined
        : (color: string) => (
            <CompareBars
              primary={value}
              primaryLabel="anomalies"
              secondary={across}
              secondaryLabel="suppliers"
              color={color}
            />
          )
    case "Enterprise Data Quality":
      // 90% is this app's real "Preferred" quality tier cutoff (see the
      // scoring tiers on the Metadata Lakehouse quality panels), not an
      // arbitrary number.
      return (color: string) => <BulletBar pct={value} target={90} color={color} />
    case "Suppliers Within SLA":
      return (color: string) => <BulletBar pct={value} color={color} />
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
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-[92px] animate-pulse rounded-xl border border-border bg-muted/40"
          />
        ))}
      </div>
    )
  }

  const visibleKpis = kpis.filter((kpi) => kpi.label !== "Data Feeds Today")

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
