import { DataTable, type DataTableColumn } from "@/components/data-table"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { QUALITY_RULES, type QualityRule } from "@/data/quality"
import { useAppDispatch } from "@/store/hooks"
import { openModal } from "@/store/ui-slice"

const STATUS_VARIANT: Record<QualityRule["status"], StatusChipVariant> = {
  Passed: "passed",
  Warning: "warning",
  Failed: "failed",
}

const rows = QUALITY_RULES.filter((rule) => rule.status !== "Passed")

export function RulesTab() {
  const dispatch = useAppDispatch()

  const columns: DataTableColumn<QualityRule>[] = [
    { key: "rule", header: "Rule", render: (row) => row.rule },
    { key: "dim", header: "Dimension", render: (row) => row.dim },
    { key: "dataset", header: "Dataset", render: (row) => row.dataset },
    { key: "pipeline", header: "Pipeline", render: (row) => row.pipeline },
    {
      key: "checked",
      header: "Checked",
      align: "right",
      render: (row) => row.checked.toLocaleString(),
    },
    {
      key: "violations",
      header: "Violations",
      align: "right",
      render: (row) => row.violations.toLocaleString(),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusChip variant={STATUS_VARIANT[row.status]}>{row.status}</StatusChip>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              dispatch(openModal({ type: "affected-records", ruleId: row.rule }))
            }
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            View Affected Records
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch(openModal({ type: "lineage", ruleId: row.rule }))
            }
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            View Lineage
          </button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(row) => row.rule}
      emptyMessage="No open quality rule violations."
    />
  )
}
