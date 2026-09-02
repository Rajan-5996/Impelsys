import { useEffect } from "react"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { TrendBadge } from "@/components/metrics"
import {
  fetchQualityDeteriorations,
  selectQualityDeteriorations,
  type QualityDeterioration,
} from "@/store/quality-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const columns: DataTableColumn<QualityDeterioration>[] = [
  { key: "entity", header: "Entity", render: (row) => row.entity },
  { key: "metric", header: "Metric", render: (row) => row.metric },
  {
    key: "change",
    header: "Change",
    render: (row) => (
      <span className="flex items-center gap-2">
        <span className="font-semibold text-foreground">
          {row.from} &rarr; {row.to}
        </span>
        <TrendBadge dir="down" />
      </span>
    ),
  },
  { key: "when", header: "When", render: (row) => row.when },
  { key: "cause", header: "Cause", render: (row) => row.cause },
]

export function DeteriorationsTab() {
  const dispatch = useAppDispatch()
  const { data: rows, status, error } = useAppSelector(selectQualityDeteriorations)

  useEffect(() => {
    dispatch(fetchQualityDeteriorations())
  }, [dispatch])

  if (status === "failed") {
    return <EmptyState message={error ?? "Failed to load deteriorations."} />
  }

  if (status === "loading" || status === "idle") {
    return <div className="h-40 animate-pulse rounded-md bg-muted/40" />
  }

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(row) => `${row.entity}-${row.metric}`}
      emptyMessage="No deteriorations detected."
    />
  )
}
