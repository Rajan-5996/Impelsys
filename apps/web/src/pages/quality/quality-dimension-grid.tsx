import { useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

import { EmptyState } from "@/components/empty-state"
import {
  fetchDimensionNames,
  fetchQualitySummary,
  selectDimensionNames,
  selectQualitySummaryDimensions,
} from "@/store/quality-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

function scoreTextColor(score: number) {
  if (score >= 90) return "text-status-good-ink"
  if (score >= 75) return "text-status-warning-foreground"
  return "text-status-critical-ink"
}

export function QualityDimensionGrid() {
  const dispatch = useAppDispatch()
  const { data: dimensions, status, error } = useAppSelector(selectQualitySummaryDimensions)
  const { data: dimensionNames, status: namesStatus } = useAppSelector(selectDimensionNames)

  useEffect(() => {
    dispatch(fetchQualitySummary())
  }, [dispatch])

  useEffect(() => {
    if (status === "succeeded" && dimensions.length === 0) {
      dispatch(fetchDimensionNames())
    }
  }, [dispatch, status, dimensions.length])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Dimensions</CardTitle>
      </CardHeader>
      <CardContent>
        {status === "failed" ? (
          <EmptyState message={error ?? "Failed to load quality dimensions."} />
        ) : status === "loading" || status === "idle" ? (
          <div className="h-24 animate-pulse rounded-md bg-muted/40" />
        ) : dimensions.length === 0 ? (
          namesStatus === "succeeded" && dimensionNames.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {dimensionNames.map((name) => (
                <div key={name} className="border border-dashed border-border p-3">
                  <p className="truncate text-[11.5px] font-semibold text-foreground">{name}</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">Not yet scored</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No quality dimensions computed yet — daily_sales_curated hasn't run." />
          )
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {dimensions.map((dim) => (
              <div key={dim.dimension} className="border border-border p-3">
                <p className="truncate text-[11.5px] font-semibold text-foreground">
                  {dim.dimension}
                </p>
                <p className={cn("mt-1.5 text-2xl font-extrabold tracking-tight", scoreTextColor(dim.score))}>
                  {dim.score}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
