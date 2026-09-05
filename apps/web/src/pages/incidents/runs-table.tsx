import { useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { StatusText } from "@/components/status-chip"
import { pipelineVendorDetailPath, runDetailPath } from "@/constants/routes"
import { humanizeSnake, runStatusLabel, RUN_STATUS_VARIANT } from "@/lib/format-labels"
import { fetchRuns, selectRuns, selectRunsError, selectRunsStatus, type Run } from "@/store/runs-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import type { Vendor } from "@/store/vendors-slice"

export function RunsTable({
  vendorFilter = "all",
  statusFilter = "all",
  vendors = [],
  search = "",
  anomalyRunIds = null,
}: {
  vendorFilter?: string
  statusFilter?: string
  vendors?: Vendor[]
  search?: string
  anomalyRunIds?: Set<string> | null
}) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const runs = useAppSelector(selectRuns)
  const status = useAppSelector(selectRunsStatus)
  const error = useAppSelector(selectRunsError)

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
          <StatusText variant={RUN_STATUS_VARIANT[row.status] ?? "medium"}>
            {runStatusLabel(row.status)}
          </StatusText>
        ),
      },
      {
        key: "current_stage",
        header: "Current Stage",
        render: (row) => humanizeSnake(row.current_stage),
      },
    ],
    [vendorNameById]
  )

  const filteredRuns = runs.filter((run) => {
    if (statusFilter !== "all" && run.status !== statusFilter) return false
    if (vendorFilter !== "all" && run.vendor_id !== vendorFilter) return false
    if (anomalyRunIds && !anomalyRunIds.has(run.run_id)) return false
    if (search) {
      const needle = search.trim().toLowerCase()
      const haystack = [
        run.run_id,
        (run.vendor_id && vendorNameById[run.vendor_id]) || "",
        runStatusLabel(run.status),
        humanizeSnake(run.current_stage),
        run.source_file,
      ]
        .join(" ")
        .toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Runs</CardTitle>
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
