import { useEffect } from "react"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { Sparkline } from "@/components/metrics"
import { fetchSupplierHistory, selectSupplierHistory } from "@/store/supplier-detail-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

type HistoryRow = {
  point: number
  score: number
}

export function HistoryTab({ supplierId }: { supplierId: string }) {
  const dispatch = useAppDispatch()
  const { data: history, status, error } = useAppSelector(selectSupplierHistory)

  useEffect(() => {
    dispatch(fetchSupplierHistory(supplierId))
  }, [dispatch, supplierId])

  if (status === "failed") {
    return <EmptyState message={error ?? "Failed to load history."} />
  }

  if (status === "loading" || status === "idle") {
    return <div className="h-40 animate-pulse rounded-md bg-muted/40" />
  }

  if (history.trend.length === 0) {
    return <EmptyState message="No score history recorded yet." />
  }

  const rows: HistoryRow[] = history.trend.map((score, index) => ({
    point: index + 1,
    score,
  }))

  const columns: DataTableColumn<HistoryRow>[] = [
    { key: "point", header: "Snapshot", render: (row) => `#${row.point}` },
    { key: "score", header: "Score", align: "right", render: (row) => String(row.score) },
  ]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {history.isReal ? "Real score history" : "Estimated from current score"}
      </p>
      <Sparkline values={history.trend} width={320} height={56} />
      <div className="border border-border">
        <DataTable columns={columns} rows={rows} rowKey={(row) => String(row.point)} />
      </div>
    </div>
  )
}
