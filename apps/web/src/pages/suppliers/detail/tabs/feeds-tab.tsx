import { DataTable, type DataTableColumn } from "@/components/data-table"
import type { Supplier } from "@/data/suppliers"

export function FeedsTab({ supplier }: { supplier: Supplier }) {
  const columns: DataTableColumn<Supplier>[] = [
    { key: "feed", header: "Feed", render: (row) => row.feed },
    { key: "freq", header: "Frequency", render: (row) => row.freq },
    { key: "expectedTime", header: "Expected Time", render: (row) => row.expectedTime },
    { key: "sla", header: "SLA", render: (row) => row.sla },
    { key: "format", header: "Format", render: (row) => row.format },
    { key: "fileSize", header: "File Size", render: (row) => row.fileSize },
  ]

  return (
    <div className="border border-border">
      <DataTable columns={columns} rows={[supplier]} rowKey={(row) => row.id} />
    </div>
  )
}
