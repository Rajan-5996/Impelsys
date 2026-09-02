import { DataTable, type DataTableColumn } from "@/components/data-table"
import { Sparkline } from "@/components/metrics"
import { SUPPLIERS, type Supplier } from "@/data/suppliers"

const columns: DataTableColumn<Supplier>[] = [
  { key: "name", header: "Supplier", render: (row) => row.name },
  { key: "region", header: "Region", render: (row) => row.region },
  {
    key: "trend",
    header: "90-Day Trend",
    render: (row) => <Sparkline values={row.trendHist} />,
  },
  {
    key: "quality",
    header: "Quality Score",
    align: "right",
    render: (row) => (
      <span className="font-semibold text-foreground">
        {row.breakdown.quality}
      </span>
    ),
  },
  { key: "tier", header: "Tier", render: (row) => row.tier },
]

export function SupplierTab() {
  return <DataTable columns={columns} rows={SUPPLIERS} rowKey={(row) => row.id} />
}
