import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { datasetDetailPath } from "@/constants/routes"
import { fetchQualityDatasets, selectQualityDatasets, type DatasetSummaryRow } from "@/store/quality-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const columns: DataTableColumn<DatasetSummaryRow>[] = [
  { key: "name", header: "Dataset", render: (row) => row.name },
  {
    key: "score",
    header: "Score",
    align: "right",
    render: (row) => (
      <span className="font-semibold text-foreground">{row.score ?? "—"}</span>
    ),
  },
  {
    key: "records",
    header: "Records",
    align: "right",
    render: (row) => row.recordCount?.toLocaleString() ?? "—",
  },
  {
    key: "rules",
    header: "Rules",
    align: "right",
    render: (row) =>
      `${row.passed}/${row.rulesTotal} passed, ${row.warning} warn, ${row.failed} failed`,
  },
]

export function DatasetTab() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: datasets, status, error } = useAppSelector(selectQualityDatasets)

  useEffect(() => {
    dispatch(fetchQualityDatasets())
  }, [dispatch])

  if (status === "failed") {
    return <EmptyState message={error ?? "Failed to load datasets."} />
  }

  if (status === "loading" || status === "idle") {
    return <div className="h-40 animate-pulse rounded-md bg-muted/40" />
  }

  return (
    <DataTable
      columns={columns}
      rows={datasets}
      rowKey={(row) => row.id}
      onRowClick={(row) => navigate(datasetDetailPath(row.id))}
    />
  )
}
