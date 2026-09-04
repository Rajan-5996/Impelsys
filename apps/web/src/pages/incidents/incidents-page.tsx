import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { AnomalyBreakdown } from "@/components/anomaly-breakdown"
import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { StatusText, type StatusChipVariant } from "@/components/status-chip"
import { ROUTES, runDetailPath } from "@/constants/routes"
import { ANOMALY_TYPE_LABEL } from "@/lib/anomaly-labels"
import { formatDetailEntries, formatTimestamp } from "@/lib/format-labels"
import { AnomalyActionDialog } from "@/pages/incidents/anomaly-action-dialog"
import { AnomaliesFilters, type AnomaliesFilterState } from "@/pages/incidents/anomalies-filters"
import { RunsTable } from "@/pages/incidents/runs-table"
import type { Anomaly } from "@/store/anomalies-slice"
import {
  fetchAnomalies,
  selectAnomalies,
  selectAnomaliesError,
  selectAnomaliesStatus,
} from "@/store/anomalies-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchActiveRun } from "@/store/run-flow-slice"

const STATUS_VARIANT: Record<string, StatusChipVariant> = {
  pending: "medium",
  approved: "ok",
  rejected: "critical",
}

const COLUMNS: DataTableColumn<Anomaly>[] = [
  { key: "anomaly_id", header: "Anomaly ID", render: (row) => row.anomaly_id },
  { key: "run_id", header: "Run ID", render: (row) => row.run_id },
  {
    key: "anomaly_type",
    header: "Type",
    render: (row) => ANOMALY_TYPE_LABEL[row.anomaly_type] ?? row.anomaly_type,
  },
  { key: "details", header: "Details", render: (row) => formatDetailEntries(row.details) },
  {
    key: "has_precedent",
    header: "Precedent",
    render: (row) => (row.has_precedent ? "Yes" : "No"),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <StatusText variant={STATUS_VARIANT[row.status] ?? "medium"}>
        {row.status}
      </StatusText>
    ),
  },
  { key: "decided_by", header: "Decided By", render: (row) => row.decided_by ?? "—" },
  { key: "created_at", header: "Created At", render: (row) => formatTimestamp(row.created_at) },
]

export function IncidentsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const anomalies = useAppSelector(selectAnomalies)
  const status = useAppSelector(selectAnomaliesStatus)
  const error = useAppSelector(selectAnomaliesError)
  const [activeAnomaly, setActiveAnomaly] = useState<Anomaly | null>(null)
  const [filters, setFilters] = useState<AnomaliesFilterState>({
    runId: "",
    status: "all",
    type: "all",
  })

  useEffect(() => {
    dispatch(fetchAnomalies())
  }, [dispatch])

  const filteredAnomalies = anomalies.filter((anomaly) => {
    if (filters.status !== "all" && anomaly.status !== filters.status) return false
    if (filters.type !== "all" && anomaly.anomaly_type !== filters.type) return false
    if (filters.runId && !anomaly.run_id.toLowerCase().includes(filters.runId.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Incidents</h1>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          Every anomaly detected across all smart ETL runs
        </p>
      </div>

      {status === "failed" ? (
        <EmptyState message={error ?? "Failed to load anomalies."} />
      ) : status === "loading" || status === "idle" ? (
        <div className="h-64 animate-pulse rounded-md bg-muted/40" />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Anomaly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <AnomalyBreakdown anomalies={anomalies} />
            </CardContent>
          </Card>

          <RunsTable />

          <Card>
            <CardHeader>
              <CardTitle>Anomalies</CardTitle>
            </CardHeader>
            <AnomaliesFilters filters={filters} onChange={setFilters} />
            <CardContent className="p-0">
              <DataTable
                columns={COLUMNS}
                rows={filteredAnomalies}
                rowKey={(row) => row.anomaly_id}
                onRowClick={(row) => setActiveAnomaly(row)}
                emptyMessage="No anomalies match your filters."
              />
            </CardContent>
          </Card>
        </>
      )}

      <AnomalyActionDialog
        anomaly={activeAnomaly}
        onClose={() => setActiveAnomaly(null)}
        onDecided={(result) => {
          dispatch(fetchAnomalies())
          if (activeAnomaly) dispatch(fetchActiveRun(activeAnomaly.run_id))
          if (result.status === "awaiting_anomaly_approval" || result.status === "awaiting_retry") {
            if (activeAnomaly) {
              const runId = activeAnomaly.run_id
              setTimeout(() => navigate(runDetailPath(runId)), 1500)
            }
            return
          }
          setTimeout(() => navigate(ROUTES.pipeline), 1500)
        }}
      />
    </div>
  )
}
