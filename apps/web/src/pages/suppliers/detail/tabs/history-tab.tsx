import { DataTable, type DataTableColumn } from "@/components/data-table"
import { Sparkline } from "@/components/metrics"
import type { Supplier } from "@/data/suppliers"

type HistoryRow = {
  day: number
  score: number
}

export function HistoryTab({ supplier }: { supplier: Supplier }) {
  const rows: HistoryRow[] = supplier.trendHist.map((score, index) => ({
    day: index + 1,
    score,
  }))

  const columns: DataTableColumn<HistoryRow>[] = [
    { key: "day", header: "Day", render: (row) => `Day ${row.day}` },
    { key: "score", header: "Score", align: "right", render: (row) => String(row.score) },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Sparkline values={supplier.trendHist} width={320} height={56} />
      <div className="border border-border">
        <DataTable columns={columns} rows={rows} rowKey={(row) => String(row.day)} />
      </div>
    </div>
  )
}
