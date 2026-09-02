import { useEffect } from "react"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { fetchSupplierFeeds, selectSupplierFeeds, type SupplierFeed } from "@/store/supplier-detail-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

export function FeedsTab({ supplierId }: { supplierId: string }) {
  const dispatch = useAppDispatch()
  const { data: feed, status, error } = useAppSelector(selectSupplierFeeds)

  useEffect(() => {
    dispatch(fetchSupplierFeeds(supplierId))
  }, [dispatch, supplierId])

  if (status === "failed") {
    return <EmptyState message={error ?? "Failed to load feed details."} />
  }

  if (status === "loading" || status === "idle" || !feed) {
    return <div className="h-40 animate-pulse rounded-md bg-muted/40" />
  }

  const columns: DataTableColumn<SupplierFeed>[] = [
    { key: "feed", header: "Feed", render: (row) => row.feed ?? "—" },
    { key: "frequency", header: "Frequency", render: (row) => row.frequency ?? "—" },
    { key: "expectedTime", header: "Expected Time", render: (row) => row.expectedTime ?? "—" },
    { key: "format", header: "Format", render: (row) => row.format ?? "—" },
    { key: "fileSize", header: "File Size", render: (row) => row.fileSize ?? "—" },
  ]

  return (
    <div className="border border-border">
      <DataTable columns={columns} rows={[feed]} rowKey={() => supplierId} />
    </div>
  )
}
