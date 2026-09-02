import { useEffect, useMemo } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { AreaTrendChart } from "@/components/charts/area-trend-chart"
import { EmptyState } from "@/components/empty-state"
import {
  fetchAnomalies,
  selectAnomalies,
  selectAnomaliesError,
  selectAnomaliesStatus,
} from "@/store/anomalies-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

function dayKey(rawTimestamp: string) {
  const normalized = rawTimestamp.includes("T") ? rawTimestamp : rawTimestamp.replace(" ", "T")
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export function AnomalyTrendSection() {
  const dispatch = useAppDispatch()
  const anomalies = useAppSelector(selectAnomalies)
  const status = useAppSelector(selectAnomaliesStatus)
  const error = useAppSelector(selectAnomaliesError)

  useEffect(() => {
    dispatch(fetchAnomalies())
  }, [dispatch])

  const trend = useMemo(() => {
    const counts = new Map<string, { date: Date; count: number }>()
    for (const anomaly of anomalies) {
      const date = dayKey(anomaly.created_at)
      if (!date) continue
      const key = date.toDateString()
      const existing = counts.get(key)
      if (existing) {
        existing.count += 1
      } else {
        counts.set(key, { date, count: 1 })
      }
    }
    return Array.from(counts.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(({ date, count }) => ({
        key: date.toISOString(),
        label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        value: count,
      }))
  }, [anomalies])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anomalies Detected Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {status === "failed" ? (
          <EmptyState message={error ?? "Failed to load anomalies."} />
        ) : status === "loading" || status === "idle" ? (
          <div className="h-[168px] animate-pulse rounded-md bg-muted/40" />
        ) : trend.length === 0 ? (
          <EmptyState message="No anomalies detected yet." />
        ) : (
          <AreaTrendChart data={trend} />
        )}
      </CardContent>
    </Card>
  )
}
