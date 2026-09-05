import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { AnomalyBreakdown } from "@/components/anomaly-breakdown"
import type { PieMetricDatum } from "@/components/charts/pie-metric-chart"
import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { StatusText, type StatusChipVariant } from "@/components/status-chip"
import { ROUTES, pipelineVendorDetailPath, runDetailPath } from "@/constants/routes"
import { ANOMALY_TYPE_LABEL } from "@/lib/anomaly-labels"
import { formatDetailEntries, formatTimestamp } from "@/lib/format-labels"
import { CATEGORICAL_CHART_COLORS } from "@/lib/status-bar-colors"
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
import { fetchRuns, selectRuns } from "@/store/runs-slice"
import { fetchVendors, selectVendors } from "@/store/vendors-slice"

const STATUS_VARIANT: Record<string, StatusChipVariant> = {
  pending: "medium",
  approved: "ok",
  rejected: "critical",
}

export function IncidentsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const anomalies = useAppSelector(selectAnomalies)
  const status = useAppSelector(selectAnomaliesStatus)
  const error = useAppSelector(selectAnomaliesError)
  const runs = useAppSelector(selectRuns)
  const vendors = useAppSelector(selectVendors)
  const [activeAnomaly, setActiveAnomaly] = useState<Anomaly | null>(null)
  const [vendorFilter, setVendorFilter] = useState("all")
  const [filters, setFilters] = useState<AnomaliesFilterState>({
    runId: "",
    status: "all",
    type: "all",
  })

  useEffect(() => {
    dispatch(fetchAnomalies())
    dispatch(fetchRuns())
    dispatch(fetchVendors())
  }, [dispatch])

  const runVendorId = useMemo(
    () => Object.fromEntries(runs.map((run) => [run.run_id, run.vendor_id])),
    [runs]
  )
  const vendorNameById = useMemo(
    () => Object.fromEntries(vendors.map((vendor) => [vendor.vendor_id, vendor.name])),
    [vendors]
  )

  function vendorIdForAnomaly(anomaly: Anomaly) {
    return runVendorId[anomaly.run_id] ?? null
  }

  const vendorFilteredAnomalies = anomalies.filter((anomaly) => {
    if (vendorFilter === "all") return true
    return vendorIdForAnomaly(anomaly) === vendorFilter
  })

  const filteredAnomalies = vendorFilteredAnomalies.filter((anomaly) => {
    if (filters.status !== "all" && anomaly.status !== filters.status) return false
    if (filters.type !== "all" && anomaly.anomaly_type !== filters.type) return false
    if (filters.runId && !anomaly.run_id.toLowerCase().includes(filters.runId.toLowerCase())) {
      return false
    }
    return true
  })

  const vendorBreakdown = useMemo(() => {
    const counts = new Map<string, number>()
    for (const anomaly of vendorFilteredAnomalies) {
      const vendorId = vendorIdForAnomaly(anomaly)
      if (!vendorId) continue
      counts.set(vendorId, (counts.get(vendorId) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([vendorId, count], index): PieMetricDatum => ({
        key: vendorId,
        label: vendorNameById[vendorId] ?? vendorId,
        value: count,
        color: CATEGORICAL_CHART_COLORS[index % CATEGORICAL_CHART_COLORS.length]!,
      }))
      .sort((a, b) => b.value - a.value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorFilteredAnomalies, vendorNameById])

  const columns: DataTableColumn<Anomaly>[] = useMemo(
    () => [
      { key: "anomaly_id", header: "Anomaly ID", render: (row) => row.anomaly_id },
      { key: "run_id", header: "Run ID", render: (row) => row.run_id },
      {
        key: "vendor",
        header: "Vendor",
        render: (row) => {
          const vendorId = runVendorId[row.run_id]
          if (!vendorId) return "—"
          return (
            <Link
              to={pipelineVendorDetailPath(vendorId)}
              onClick={(event) => event.stopPropagation()}
              className="font-semibold text-status-info underline underline-offset-2 hover:text-status-info/80"
            >
              {vendorNameById[vendorId] ?? vendorId}
            </Link>
          )
        },
      },
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
    ],
    [runVendorId, vendorNameById]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Incidents</h1>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            Every anomaly detected across all smart ETL runs
          </p>
        </div>
        <Select value={vendorFilter} onValueChange={(value) => setVendorFilter(value ?? "all")}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Vendor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            {vendors.map((vendor) => (
              <SelectItem key={vendor.vendor_id} value={vendor.vendor_id}>
                {vendor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              <AnomalyBreakdown anomalies={vendorFilteredAnomalies} vendorBreakdown={vendorBreakdown} />
            </CardContent>
          </Card>

          <RunsTable vendorFilter={vendorFilter} vendors={vendors} />

          <Card>
            <CardHeader>
              <CardTitle>Anomalies</CardTitle>
            </CardHeader>
            <AnomaliesFilters filters={filters} onChange={setFilters} />
            <CardContent className="p-0">
              <DataTable
                columns={columns}
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
