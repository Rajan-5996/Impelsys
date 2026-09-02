import { useEffect } from "react"

import { Card, CardContent } from "@workspace/ui/components/card"

import { EmptyState } from "@/components/empty-state"
import { Sparkline } from "@/components/metrics"
import { fetchQualityTrends, selectQualityTrends } from "@/store/quality-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

export function TrendsTab() {
  const dispatch = useAppDispatch()
  const { data: trend, status, error } = useAppSelector(selectQualityTrends)

  useEffect(() => {
    dispatch(fetchQualityTrends(14))
  }, [dispatch])

  if (status === "failed") {
    return <EmptyState message={error ?? "Failed to load trends."} />
  }

  if (status === "loading" || status === "idle") {
    return <div className="h-40 animate-pulse rounded-md bg-muted/40" />
  }

  if (trend.length === 0) {
    return <EmptyState message="No quality trend recorded yet." />
  }

  const latest = trend[trend.length - 1].value

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-6">
        <p className="text-3xl font-extrabold tracking-tight text-foreground">
          {latest}
          <small className="ml-1 text-sm font-semibold text-muted-foreground">%</small>
        </p>
        <p className="text-[10.5px] text-muted-foreground">
          Enterprise data quality, last {trend.length} checks
        </p>
        <Sparkline
          values={trend.map((point) => point.value)}
          width={480}
          height={120}
          className="mt-2"
        />
      </CardContent>
    </Card>
  )
}
