import { useEffect } from "react"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { StatusChip } from "@/components/status-chip"
import { fetchFailedRules, selectFailedRules, type FailedRule } from "@/store/quality-detail-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { openModal } from "@/store/ui-slice"

export function RulesTab() {
  const dispatch = useAppDispatch()
  const { data: rows, status, error } = useAppSelector(selectFailedRules)

  useEffect(() => {
    dispatch(fetchFailedRules())
  }, [dispatch])

  if (status === "failed") {
    return <EmptyState message={error ?? "Failed to load failed rules."} />
  }

  if (status === "loading" || status === "idle") {
    return <div className="h-40 animate-pulse rounded-md bg-muted/40" />
  }

  const columns: DataTableColumn<FailedRule>[] = [
    { key: "ruleCode", header: "Rule", render: (row) => row.ruleCode },
    { key: "description", header: "Description", render: (row) => row.description },
    { key: "dataset", header: "Dataset", render: (row) => row.dataset },
    {
      key: "checkedCount",
      header: "Checked",
      align: "right",
      render: (row) => row.checkedCount.toLocaleString(),
    },
    {
      key: "affectedCount",
      header: "Affected",
      align: "right",
      render: (row) => row.affectedCount.toLocaleString(),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusChip variant="failed">{row.status}</StatusChip>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              dispatch(openModal({ type: "affected-records", ruleCode: row.ruleCode }))
            }
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            View Affected Records
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch(openModal({ type: "lineage", datasetId: row.dataset }))
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
      rowKey={(row) => row.ruleCode}
      emptyMessage="No open quality rule violations."
    />
  )
}
