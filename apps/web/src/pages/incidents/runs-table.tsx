import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

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
import { runDetailPath } from "@/constants/routes"
import { formatTimestamp, humanizeSnake } from "@/lib/format-labels"
import { fetchRuns, selectRuns, selectRunsError, selectRunsStatus, type Run } from "@/store/runs-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

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

const COLUMNS: DataTableColumn<Run>[] = [
  { key: "run_id", header: "Run ID", render: (row) => row.run_id },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <StatusText variant={STATUS_VARIANT[row.status] ?? "medium"}>
        {humanizeSnake(row.status)}
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
]

export function RunsTable() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const runs = useAppSelector(selectRuns)
  const status = useAppSelector(selectRunsStatus)
  const error = useAppSelector(selectRunsError)
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    dispatch(fetchRuns())
  }, [dispatch])

  const filteredRuns =
    statusFilter === "all" ? runs : runs.filter((run) => run.status === statusFilter)

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
            columns={COLUMNS}
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
