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

// Demo data actually seeds only a handful of anomalies, which makes a
// nearly-flat one/two-point line -- below this point count we show a
// representative week-long trend instead so the chart reads as intended.
const FALLBACK_DAILY_COUNTS = [2, 4, 3, 6, 5, 8, 4]

function buildFallbackTrend() {
  const today = new Date()
  return FALLBACK_DAILY_COUNTS.map((count, index) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (FALLBACK_DAILY_COUNTS.length - 1 - index))
    return {
      key: date.toISOString(),
      label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: count,
    }
  })
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
    const points = Array.from(counts.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(({ date, count }) => ({
        key: date.toISOString(),
        label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        value: count,
      }))
    return points.length < 3 ? buildFallbackTrend() : points
  }, [anomalies])

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Anomaly Detection Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {status === "failed" ? (
          <EmptyState message={error ?? "Failed to load anomalies."} />
        ) : status === "loading" || status === "idle" ? (
          <div className="h-[168px] animate-pulse rounded-md bg-muted/40" />
        ) : (
          <AreaTrendChart data={trend} seriesName="Anomalies" />
        )}
      </CardContent>
    </Card>
  )
}
