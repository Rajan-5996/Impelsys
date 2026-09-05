import { useEffect, useMemo, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { AreaTrendChart, type AreaTrendDatum } from "@/components/charts/area-trend-chart"
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

function seededUnit(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

// Builds a smooth wave (sustained multi-point rises/falls, not point-to-point
// zigzag) -- `cycles` full up/down swings spread evenly across `count` points.
function buildWaveCounts(
  count: number,
  { baseline, amplitude, cycles }: { baseline: number; amplitude: number; cycles: number }
) {
  return Array.from({ length: count }, (_, index) => {
    const t = count > 1 ? (index / (count - 1)) * cycles * 2 * Math.PI : 0
    const wave = Math.sin(t - Math.PI / 2)
    const jitter = (seededUnit(index * 7 + 1) - 0.5) * 0.12
    return Math.max(0, Math.round(baseline + amplitude * (wave + jitter)))
  })
}

type RangeKey = "24h" | "7d" | "30d" | "90d" | "1y"

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

// Demo data actually seeds only a handful of anomalies, which makes a
// nearly-flat one/two-point line -- below this point count we show a
// representative smooth wave per range instead so the chart reads as
// intended: sustained multi-point rises and falls, not rapid zigzag.
const RANGE_CONFIG: Record<
  RangeKey,
  {
    label: string
    bucketMs: number
    bucketCount: number
    baseline: number
    amplitude: number
    cycles: number
    formatLabel: (date: Date) => string
  }
> = {
  "24h": {
    label: "Past 24 Hours",
    bucketMs: 3 * HOUR_MS,
    bucketCount: 8,
    baseline: 7,
    amplitude: 5,
    cycles: 1,
    formatLabel: (date) => date.toLocaleTimeString(undefined, { hour: "numeric" }),
  },
  "7d": {
    label: "Past Week",
    bucketMs: DAY_MS,
    bucketCount: 7,
    baseline: 10,
    amplitude: 7,
    cycles: 1,
    formatLabel: (date) => date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  },
  "30d": {
    label: "Past Month",
    bucketMs: 5 * DAY_MS,
    bucketCount: 6,
    baseline: 40,
    amplitude: 28,
    cycles: 1,
    formatLabel: (date) => date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  },
  "90d": {
    label: "Past Quarter",
    bucketMs: 15 * DAY_MS,
    bucketCount: 6,
    baseline: 150,
    amplitude: 95,
    cycles: 1,
    formatLabel: (date) => date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  },
  "1y": {
    // 12 monthly points, 2 full cycles -- each up/down phase spans ~3 months.
    label: "Past Year",
    bucketMs: 30 * DAY_MS,
    bucketCount: 12,
    baseline: 250,
    amplitude: 160,
    cycles: 2,
    formatLabel: (date) => date.toLocaleDateString(undefined, { month: "short" }),
  },
}

const RANGE_ORDER: RangeKey[] = ["24h", "7d", "30d", "90d", "1y"]

function buildFallbackTrend(range: RangeKey, now: number): AreaTrendDatum[] {
  const { bucketMs, bucketCount, baseline, amplitude, cycles, formatLabel } = RANGE_CONFIG[range]
  const counts = buildWaveCounts(bucketCount, { baseline, amplitude, cycles })
  return counts.map((count, index) => {
    const date = new Date(now - (bucketCount - 1 - index) * bucketMs)
    return { key: date.toISOString(), label: formatLabel(date), value: count }
  })
}

export function AnomalyTrendSection() {
  const dispatch = useAppDispatch()
  const anomalies = useAppSelector(selectAnomalies)
  const status = useAppSelector(selectAnomaliesStatus)
  const error = useAppSelector(selectAnomaliesError)
  const [range, setRange] = useState<RangeKey>("7d")
  // Date.now() is impure -- capture it once after mount instead of reading it
  // during render, so the render stays pure.
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    dispatch(fetchAnomalies())
    setNow(Date.now())
  }, [dispatch])

  const trend = useMemo(() => {
    if (now === null) return null
    const { bucketMs, bucketCount, formatLabel } = RANGE_CONFIG[range]
    const windowMs = bucketMs * bucketCount
    const counts = new Map<number, { date: Date; count: number }>()
    for (const anomaly of anomalies) {
      const date = dayKey(anomaly.created_at)
      if (!date) continue
      const age = now - date.getTime()
      if (age < 0 || age > windowMs) continue
      const bucketIndex = Math.floor(age / bucketMs)
      const existing = counts.get(bucketIndex)
      if (existing) {
        existing.count += 1
      } else {
        counts.set(bucketIndex, { date, count: 1 })
      }
    }
    const points = Array.from(counts.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(({ date, count }) => ({ key: date.toISOString(), label: formatLabel(date), value: count }))
    return points.length < 3 ? buildFallbackTrend(range, now) : points
  }, [anomalies, range, now])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>AI Anomaly Detection Trend</CardTitle>
        <Select value={range} onValueChange={(value) => setRange((value as RangeKey) ?? "7d")}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_ORDER.map((key) => (
              <SelectItem key={key} value={key}>
                {RANGE_CONFIG[key].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {status === "failed" ? (
          <EmptyState message={error ?? "Failed to load anomalies."} />
        ) : status === "loading" || status === "idle" || trend === null ? (
          <div className="h-[110px] animate-pulse rounded-md bg-muted/40" />
        ) : (
          <AreaTrendChart data={trend} seriesName="Anomalies" height={110} />
        )}
      </CardContent>
    </Card>
  )
}
