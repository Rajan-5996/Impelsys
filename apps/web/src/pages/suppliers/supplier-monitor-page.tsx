import { DownloadIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { SupplierFilters } from "@/pages/suppliers/supplier-filters"
import { getVisibleSuppliers } from "@/pages/suppliers/supplier-filtering"
import { SupplierTable } from "@/pages/suppliers/supplier-table"
import { SUPPLIERS } from "@/data/suppliers"
import { useAppSelector } from "@/store/hooks"
import { selectSupplierFilters } from "@/store/suppliers-slice"

const CSV_COLUMNS: Array<[string, (row: (typeof SUPPLIERS)[number]) => string]> = [
  ["Name", (row) => row.name],
  ["Feed", (row) => row.feed],
  ["Region", (row) => row.region],
  ["Method", (row) => row.method],
  ["Criticality", (row) => row.criticality],
  ["Tier", (row) => row.tier],
  ["Score", (row) => String(row.score)],
  ["Expected Volume", (row) => String(row.avgVolume)],
  ["Actual Volume", (row) => String(row.actual)],
  ["Deviation", (row) => (row.deviation === null ? "" : String(row.deviation))],
  ["Status", (row) => row.statusToday],
]

function exportSuppliersCsv(rows: typeof SUPPLIERS) {
  const header = CSV_COLUMNS.map(([label]) => label).join(",")
  const lines = rows.map((row) =>
    CSV_COLUMNS.map(([, accessor]) => `"${accessor(row).replace(/"/g, '""')}"`).join(",")
  )
  const csv = [header, ...lines].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "supplier-monitor.csv"
  link.click()
  URL.revokeObjectURL(url)
}

export function SupplierMonitorPage() {
  const filters = useAppSelector(selectSupplierFilters)
  const visibleSuppliers = getVisibleSuppliers(filters)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">Supplier Monitor</h1>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            Track feed delivery, volume, and schema health across all suppliers.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportSuppliersCsv(visibleSuppliers)}
        >
          <DownloadIcon /> Export CSV
        </Button>
      </div>
      <SupplierFilters
        visibleCount={visibleSuppliers.length}
        totalCount={SUPPLIERS.length}
      />
      <SupplierTable />
    </div>
  )
}
