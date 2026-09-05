import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { SearchIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { AnomalyBreakdown } from "@/components/anomaly-breakdown"
import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { StatusText, type StatusChipVariant } from "@/components/status-chip"
import { ROUTES, pipelineVendorDetailPath, runDetailPath } from "@/constants/routes"
import { ANOMALY_TYPE_LABEL } from "@/lib/anomaly-labels"
import { formatDetailEntries, humanizeSnake, RUN_STATUS_VARIANT } from "@/lib/format-labels"
import { AnomalyActionDialog } from "@/pages/incidents/anomaly-action-dialog"
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

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

const TYPE_OPTIONS = Object.entries(ANOMALY_TYPE_LABEL).map(([value, label]) => ({
  value,
  label,
}))

type AnomaliesFilterState = {
  search: string
  status: string
  type: string
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
  const [runStatusFilter, setRunStatusFilter] = useState("all")
  const [filters, setFilters] = useState<AnomaliesFilterState>({
    search: "",
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
  const runStatusByRunId = useMemo(
    () => Object.fromEntries(runs.map((run) => [run.run_id, run.status])),
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
    if (runStatusFilter !== "all" && runStatusByRunId[anomaly.run_id] !== runStatusFilter) {
      return false
    }
    if (filters.status !== "all" && anomaly.status !== filters.status) return false
    if (filters.type !== "all" && anomaly.anomaly_type !== filters.type) return false
    if (filters.search) {
      const needle = filters.search.trim().toLowerCase()
      const vendorId = runVendorId[anomaly.run_id]
      const haystack = [
        anomaly.anomaly_id,
        anomaly.run_id,
        (vendorId && vendorNameById[vendorId]) || "",
        ANOMALY_TYPE_LABEL[anomaly.anomaly_type] ?? anomaly.anomaly_type,
        anomaly.status,
        humanizeSnake(runStatusByRunId[anomaly.run_id] ?? ""),
        formatDetailEntries(anomaly.details),
        anomaly.decided_by ?? "",
      ]
        .join(" ")
        .toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  })

  const hasAnomalyFilters = filters.status !== "all" || filters.type !== "all"
  const anomalyRunIds = hasAnomalyFilters
    ? new Set(filteredAnomalies.map((anomaly) => anomaly.run_id))
    : null

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
        <div className="flex flex-wrap items-end gap-3 md:gap-5">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="anomaly-search"
              className="text-[10.5px] font-semibold tracking-wide text-muted-foreground"
            >
              Search
            </label>
            <div className="flex h-8 min-w-[240px] items-center gap-2 border border-border bg-muted/30 px-2.5">
              <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <Input
                id="anomaly-search"
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                placeholder="Search anomalies..."
                className="h-8 border-b-transparent px-0"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10.5px] font-semibold tracking-wide text-muted-foreground">
              Vendor
            </label>
            <Select value={vendorFilter} onValueChange={(value) => setVendorFilter(value ?? "all")}>
              <SelectTrigger size="sm">
                <SelectValue>
                  {(value) =>
                    value && value !== "all" ? (vendorNameById[value] ?? value) : "All Vendors"
                  }
                </SelectValue>
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
          <div className="flex flex-col gap-1">
            <label className="text-[10.5px] font-semibold tracking-wide text-muted-foreground">
              Run Status
            </label>
            <Select
              value={runStatusFilter}
              onValueChange={(value) => setRunStatusFilter(value ?? "all")}
            >
              <SelectTrigger size="sm">
                <SelectValue>
                  {(value) =>
                    value && value !== "all" ? humanizeSnake(String(value)) : "All Run Statuses"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Run Statuses</SelectItem>
                {Object.keys(RUN_STATUS_VARIANT).map((value) => (
                  <SelectItem key={value} value={value}>
                    {humanizeSnake(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10.5px] font-semibold tracking-wide text-muted-foreground">
              Status
            </label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value ?? "all" })}
            >
              <SelectTrigger size="sm">
                <SelectValue>
                  {(value) =>
                    value && value !== "all"
                      ? (STATUS_OPTIONS.find((o) => o.value === value)?.label ?? String(value))
                      : "All Statuses"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10.5px] font-semibold tracking-wide text-muted-foreground">
              Type
            </label>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value ?? "all" })}
            >
              <SelectTrigger size="sm">
                <SelectValue>
                  {(value) =>
                    value && value !== "all"
                      ? (ANOMALY_TYPE_LABEL[String(value)] ?? String(value))
                      : "All Types"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
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
              <AnomalyBreakdown anomalies={filteredAnomalies} />
            </CardContent>
          </Card>

          <RunsTable
            vendorFilter={vendorFilter}
            statusFilter={runStatusFilter}
            vendors={vendors}
            search={filters.search}
            anomalyRunIds={anomalyRunIds}
          />

          <Card>
            <CardHeader>
              <CardTitle>Anomalies</CardTitle>
            </CardHeader>
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
