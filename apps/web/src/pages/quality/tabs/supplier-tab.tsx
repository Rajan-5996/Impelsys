import { useEffect } from "react"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { StatusChip } from "@/components/status-chip"
import { fetchQualityBySupplier, selectQualityBySupplier, type SupplierQualityRow } from "@/store/quality-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const columns: DataTableColumn<SupplierQualityRow>[] = [
  { key: "name", header: "Supplier", render: (row) => row.name },
  {
    key: "score",
    header: "Quality Score",
    align: "right",
    render: (row) => <span className="font-semibold text-foreground">{row.score}</span>,
  },
  {
    key: "completeness",
    header: "Completeness",
    align: "right",
    render: (row) => (row.completeness === null ? "—" : `${row.completeness}%`),
  },
  {
    key: "referentialIntegrity",
    header: "Referential Integrity",
    align: "right",
    render: (row) => (row.referentialIntegrity === null ? "—" : `${row.referentialIntegrity}%`),
  },
  {
    key: "isReal",
    header: "Source",
    render: (row) => (
      <StatusChip variant={row.isReal ? "ok" : "neutral"}>
        {row.isReal ? "Live" : "Mock"}
      </StatusChip>
    ),
  },
]

export function SupplierTab() {
  const dispatch = useAppDispatch()
  const { data: suppliers, status, error } = useAppSelector(selectQualityBySupplier)

  useEffect(() => {
    dispatch(fetchQualityBySupplier())
  }, [dispatch])

  if (status === "failed") {
    return <EmptyState message={error ?? "Failed to load supplier quality."} />
  }

  if (status === "loading" || status === "idle") {
    return <div className="h-40 animate-pulse rounded-md bg-muted/40" />
  }

  return <DataTable columns={columns} rows={suppliers} rowKey={(row) => row.supplierId} />
}
