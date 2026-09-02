import { useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { AnomalyBreakdown } from "@/components/anomaly-breakdown"
import { EmptyState } from "@/components/empty-state"
import {
  fetchAnomalies,
  selectAnomalies,
  selectAnomaliesError,
  selectAnomaliesStatus,
} from "@/store/anomalies-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

export function AnomaliesOverviewSection() {
  const dispatch = useAppDispatch()
  const anomalies = useAppSelector(selectAnomalies)
  const status = useAppSelector(selectAnomaliesStatus)
  const error = useAppSelector(selectAnomaliesError)

  useEffect(() => {
    dispatch(fetchAnomalies())
  }, [dispatch])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart ETL Anomalies</CardTitle>
      </CardHeader>
      <CardContent>
        {status === "failed" ? (
          <EmptyState message={error ?? "Failed to load anomalies."} />
        ) : status === "loading" || status === "idle" ? (
          <div className="h-[160px] animate-pulse rounded-md bg-muted/40" />
        ) : (
          <AnomalyBreakdown anomalies={anomalies} />
        )}
      </CardContent>
    </Card>
  )
}
