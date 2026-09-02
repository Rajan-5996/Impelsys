import { DataTable, type DataTableColumn } from "@/components/data-table"
import { TrendBadge } from "@/components/metrics"
import { DETERIORATIONS, type Deterioration } from "@/data/quality"

const columns: DataTableColumn<Deterioration>[] = [
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
  return (
    <DataTable
      columns={columns}
      rows={DETERIORATIONS}
      rowKey={(row) => `${row.entity}-${row.metric}`}
      emptyMessage="No deteriorations detected."
    />
  )
}
