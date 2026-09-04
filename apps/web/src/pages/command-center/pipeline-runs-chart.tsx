import { useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { AreaTrendChart } from "@/components/charts/area-trend-chart"
import { EmptyState } from "@/components/empty-state"
import { humanizeSnake } from "@/lib/format-labels"
import { fetchRuns, selectRuns, selectRunsError, selectRunsStatus } from "@/store/runs-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

export function PipelineRunsChart() {
  const dispatch = useAppDispatch()
  const runs = useAppSelector(selectRuns)
  const status = useAppSelector(selectRunsStatus)
  const error = useAppSelector(selectRunsError)

  useEffect(() => {
    dispatch(fetchRuns())
  }, [dispatch])

  const counts = new Map<string, number>()
  for (const run of runs) {
    counts.set(run.status, (counts.get(run.status) ?? 0) + 1)
  }
  const data = Array.from(counts.entries())
    .map(([runStatus, count]) => ({
      key: runStatus,
      label: humanizeSnake(runStatus),
      value: count,
    }))
    .sort((a, b) => b.value - a.value)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Run Status</CardTitle>
      </CardHeader>
      <CardContent>
        {status === "failed" ? (
          <EmptyState message={error ?? "Failed to load runs."} />
        ) : status === "loading" || status === "idle" ? (
          <div className="h-[168px] animate-pulse rounded-md bg-muted/40" />
        ) : runs.length === 0 ? (
          <EmptyState message="No pipeline runs recorded yet." />
        ) : (
          <AreaTrendChart data={data} color="var(--color-standard)" seriesName="Runs" />
        )}
      </CardContent>
    </Card>
  )
}
