import { useEffect } from "react"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import {
  fetchSupplierQuality,
  selectSupplierQuality,
  type SupplierQualityRule,
} from "@/store/supplier-detail-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const STATUS_VARIANT: Record<string, StatusChipVariant> = {
  Passed: "passed",
  Failed: "failed",
}

export function QualityTab({ supplierId }: { supplierId: string }) {
  const dispatch = useAppDispatch()
  const { data: quality, status, error } = useAppSelector(selectSupplierQuality)

  useEffect(() => {
    dispatch(fetchSupplierQuality(supplierId))
  }, [dispatch, supplierId])

  if (status === "failed") {
    return <EmptyState message={error ?? "Failed to load quality rules."} />
  }

  if (status === "loading" || status === "idle") {
    return <div className="h-40 animate-pulse rounded-md bg-muted/40" />
  }

  if (quality.rules.length === 0) {
    return <EmptyState message="No quality rules mapped to this supplier yet." />
  }

  const columns: DataTableColumn<SupplierQualityRule>[] = [
    { key: "ruleCode", header: "Rule ID", render: (row) => row.ruleCode },
    { key: "description", header: "Rule", render: (row) => row.description },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusChip variant={STATUS_VARIANT[row.status] ?? "neutral"}>
          {row.status}
        </StatusChip>
      ),
    },
    { key: "affectedCount", header: "Affected", align: "right", render: (row) => String(row.affectedCount) },
    { key: "checkedCount", header: "Checked", align: "right", render: (row) => String(row.checkedCount) },
  ]

  return (
    <div className="border border-border">
      <DataTable columns={columns} rows={quality.rules} rowKey={(row) => row.ruleCode} />
    </div>
  )
}
