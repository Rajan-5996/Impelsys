import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { DATASETS, DATASET_RULES, type DatasetRule } from "@/data/quality"
import type { Supplier } from "@/data/suppliers"

const STATUS_VARIANT: Record<DatasetRule["status"], StatusChipVariant> = {
  Passed: "passed",
  Warning: "warning",
  Failed: "failed",
}

export function QualityTab({ supplier }: { supplier: Supplier }) {
  const dataset = DATASETS.find((item) => item.supplierSource.includes(supplier.name))
  const rules = dataset ? (DATASET_RULES[dataset.id] ?? []) : []

  if (!dataset || rules.length === 0) {
    return <EmptyState message="No quality rules mapped to this supplier yet." />
  }

  const columns: DataTableColumn<DatasetRule>[] = [
    { key: "id", header: "Rule ID", render: (row) => row.id },
    { key: "rule", header: "Rule", render: (row) => row.rule },
    { key: "dim", header: "Dimension", render: (row) => row.dim },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusChip variant={STATUS_VARIANT[row.status]}>{row.status}</StatusChip>,
    },
    { key: "affected", header: "Affected", align: "right", render: (row) => String(row.affected) },
    { key: "note", header: "Note", render: (row) => row.note },
  ]

  return (
    <div className="border border-border">
      <DataTable columns={columns} rows={rules} rowKey={(row) => row.id} />
    </div>
  )
}
