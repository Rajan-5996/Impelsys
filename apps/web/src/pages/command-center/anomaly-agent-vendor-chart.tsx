import { useEffect, useMemo } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { DonutMetricChart } from "@/components/charts/donut-metric-chart"
import { EmptyState } from "@/components/empty-state"
import { ANOMALY_TYPE_LABEL } from "@/lib/anomaly-labels"
import { CATEGORICAL_CHART_COLORS } from "@/lib/status-bar-colors"
import {
  fetchAnomalies,
  selectAnomalies,
  selectAnomaliesError,
  selectAnomaliesStatus,
} from "@/store/anomalies-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchRuns, selectRuns } from "@/store/runs-slice"
import { fetchVendors, selectVendors } from "@/store/vendors-slice"

export function AnomalyAgentVendorChart() {
  const dispatch = useAppDispatch()
  const anomalies = useAppSelector(selectAnomalies)
  const status = useAppSelector(selectAnomaliesStatus)
  const error = useAppSelector(selectAnomaliesError)
  const runs = useAppSelector(selectRuns)
  const vendors = useAppSelector(selectVendors)

  useEffect(() => {
    dispatch(fetchAnomalies())
    dispatch(fetchRuns())
    dispatch(fetchVendors())
  }, [dispatch])

  const byType = useMemo(() => {
    const counts = new Map<string, number>()
    for (const anomaly of anomalies) {
      counts.set(anomaly.anomaly_type, (counts.get(anomaly.anomaly_type) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([type, count], index) => ({
        key: type,
        label: ANOMALY_TYPE_LABEL[type] ?? type,
        value: count,
        color: CATEGORICAL_CHART_COLORS[index % CATEGORICAL_CHART_COLORS.length]!,
      }))
      .sort((a, b) => b.value - a.value)
  }, [anomalies])

  const byVendor = useMemo(() => {
    const runVendor = new Map(runs.map((run) => [run.run_id, run.vendor_id]))
    const vendorName = new Map(vendors.map((vendor) => [vendor.vendor_id, vendor.name]))
    const counts = new Map<string, number>()
    for (const anomaly of anomalies) {
      const vendorId = runVendor.get(anomaly.run_id) ?? null
      const key = vendorId ?? "unassigned"
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([key, count]) => ({
        key,
        label: key === "unassigned" ? "Unassigned" : (vendorName.get(key) ?? key),
        value: count,
      }))
      .sort((a, b) => b.value - a.value)
  }, [anomalies, runs, vendors])

  const vendorMax = Math.max(1, ...byVendor.map((row) => row.value))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Agent-Detected Anomalies (By Detection Type)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden">
        {status === "failed" ? (
          <EmptyState message={error ?? "Failed to load anomalies."} />
        ) : status === "loading" || status === "idle" ? (
          <div className="h-[128px] animate-pulse rounded-md bg-muted/40" />
        ) : anomalies.length === 0 ? (
          <EmptyState message="No anomalies detected yet." />
        ) : (
          <div className="flex flex-1 flex-col gap-2">
            <div>
              <DonutMetricChart data={byType} size={124} centerLabel="Detected" />
            </div>
            <div className="flex flex-col gap-1.5 border-t border-dashed border-border pt-2">
              <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
                By Vendor
              </p>
              {byVendor.map((row, index) => (
                <div key={row.key} className="flex items-center gap-2 text-[11px]">
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{row.label}</span>
                  <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-muted/40">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${(row.value / vendorMax) * 100}%`,
                        background: CATEGORICAL_CHART_COLORS[index % CATEGORICAL_CHART_COLORS.length],
                      }}
                    />
                  </span>
                  <span className="w-4 shrink-0 text-right font-semibold text-foreground">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
