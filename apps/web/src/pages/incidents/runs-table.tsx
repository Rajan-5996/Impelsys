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

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { StatusText, type StatusChipVariant } from "@/components/status-chip"
import { pipelineVendorDetailPath, runDetailPath } from "@/constants/routes"
import { formatTimestamp, humanizeSnake, runStatusLabel } from "@/lib/format-labels"
import { fetchRuns, selectRuns, selectRunsError, selectRunsStatus, type Run } from "@/store/runs-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import type { Vendor } from "@/store/vendors-slice"

const STATUS_VARIANT: Record<string, StatusChipVariant> = {
  running: "low",
  awaiting_anomaly_approval: "medium",
  awaiting_dq_approval: "medium",
  awaiting_retry: "medium",
  completed: "ok",
  halted: "critical",
  etl_validation_failed: "critical",
  failed_max_retries: "critical",
  failed: "critical",
  cancelled: "critical",
  cancel_requested: "medium",
  paused: "medium",
  pause_requested: "medium",
}

export function RunsTable({
  vendorFilter = "all",
  vendors = [],
}: {
  vendorFilter?: string
  vendors?: Vendor[]
}) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const runs = useAppSelector(selectRuns)
  const status = useAppSelector(selectRunsStatus)
  const error = useAppSelector(selectRunsError)
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    dispatch(fetchRuns())
  }, [dispatch])

  const vendorNameById = useMemo(
    () => Object.fromEntries(vendors.map((vendor) => [vendor.vendor_id, vendor.name])),
    [vendors]
  )

  const columns: DataTableColumn<Run>[] = useMemo(
    () => [
      { key: "run_id", header: "Run ID", render: (row) => row.run_id },
      {
        key: "vendor_id",
        header: "Vendor",
        render: (row) =>
          row.vendor_id ? (
            <Link
              to={pipelineVendorDetailPath(row.vendor_id)}
              onClick={(event) => event.stopPropagation()}
              className="font-semibold text-status-info underline underline-offset-2 hover:text-status-info/80"
            >
              {vendorNameById[row.vendor_id] ?? row.vendor_id}
            </Link>
          ) : (
            "—"
          ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <StatusText variant={STATUS_VARIANT[row.status] ?? "medium"}>
            {runStatusLabel(row.status)}
          </StatusText>
        ),
      },
      {
        key: "current_stage",
        header: "Current Stage",
        render: (row) => humanizeSnake(row.current_stage),
      },
      { key: "created_at", header: "Created At", render: (row) => formatTimestamp(row.created_at) },
      { key: "updated_at", header: "Updated At", render: (row) => formatTimestamp(row.updated_at) },
    ],
    [vendorNameById]
  )

  const filteredRuns = runs.filter((run) => {
    if (statusFilter !== "all" && run.status !== statusFilter) return false
    if (vendorFilter !== "all" && run.vendor_id !== vendorFilter) return false
    return true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Runs</CardTitle>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.keys(STATUS_VARIANT).map((value) => (
              <SelectItem key={value} value={value}>
                {humanizeSnake(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        {status === "failed" ? (
          <EmptyState message={error ?? "Failed to load runs."} />
        ) : status === "loading" || status === "idle" ? (
          <div className="h-64 animate-pulse rounded-md bg-muted/40" />
        ) : (
          <DataTable
            columns={columns}
            rows={filteredRuns}
            rowKey={(row) => row.run_id}
            onRowClick={(row) => navigate(runDetailPath(row.run_id))}
            emptyMessage="No runs match your filter."
          />
        )}
      </CardContent>
    </Card>
  )
}
