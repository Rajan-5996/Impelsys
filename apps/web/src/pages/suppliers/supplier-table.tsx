import { useNavigate } from "react-router-dom"

import { cn } from "@workspace/ui/lib/utils"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { Pagination } from "@/components/pagination"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { supplierDetailPath } from "@/constants/routes"
import type { Supplier } from "@/data/suppliers"
import { getVisibleSuppliers } from "@/pages/suppliers/supplier-filtering"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  selectSupplierFilters,
  setSupplierPage,
  setSupplierSort,
  type SupplierSortKey,
} from "@/store/suppliers-slice"

const CRITICALITY_VARIANT: Record<Supplier["criticality"], StatusChipVariant> = {
  Critical: "critical",
  High: "high",
  Medium: "medium",
  Low: "low",
}

const HEALTH_VARIANT: Record<Supplier["statusToday"], StatusChipVariant> = {
  healthy: "ok",
  critical: "critical",
  investigating: "medium",
  delayed: "medium",
  missing: "critical",
}

export function SupplierTable() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const filters = useAppSelector(selectSupplierFilters)

  const sorted = getVisibleSuppliers(filters)
  const filtered = sorted
  const start = (filters.page - 1) * filters.pageSize
  const pageRows = sorted.slice(start, start + filters.pageSize)

  const columns: DataTableColumn<Supplier>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (row) => <span className="font-semibold text-foreground">{row.name}</span>,
    },
    { key: "feed", header: "Feed", sortable: true, render: (row) => row.feed },
    { key: "region", header: "Region", render: (row) => row.region },
    {
      key: "criticality",
      header: "Criticality",
      sortable: true,
      render: (row) => (
        <StatusChip variant={CRITICALITY_VARIANT[row.criticality]}>
          {row.criticality}
        </StatusChip>
      ),
    },
    {
      key: "volume",
      header: "Expected / Actual Volume",
      align: "right",
      render: (row) => (
        <span className="font-mono text-[11px]">
          {row.avgVolume.toLocaleString()} / {row.actual.toLocaleString()}
        </span>
      ),
    },
    {
      key: "deviation",
      header: "Deviation",
      sortable: true,
      align: "right",
      render: (row) => (
        <span
          className={cn(
            "font-mono text-[11px] font-semibold",
            row.deviation !== null && Math.abs(row.deviation) > 20
              ? "text-status-critical-ink"
              : row.deviation !== null && Math.abs(row.deviation) > 5
                ? "text-status-warning-foreground"
                : "text-foreground"
          )}
        >
          {row.deviation === null ? "N/A" : `${row.deviation}%`}
        </span>
      ),
    },
    { key: "schema", header: "Schema Status", render: (row) => row.schemaStatus },
    { key: "agent", header: "Agent Status", render: (row) => row.agentStatus },
    {
      key: "score",
      header: "Health",
      sortable: true,
      render: (row) => (
        <StatusChip variant={HEALTH_VARIANT[row.statusToday]}>
          {row.statusToday}
        </StatusChip>
      ),
    },
  ]

  return (
    <div className="border border-border bg-card">
      <DataTable
        columns={columns}
        rows={pageRows}
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(supplierDetailPath(row.id))}
        sortKey={filters.sortKey}
        sortDir={filters.sortDir}
        onSort={(key) => dispatch(setSupplierSort(key as SupplierSortKey))}
        emptyMessage="No suppliers match these filters."
      />
      <Pagination
        page={filters.page}
        pageSize={filters.pageSize}
        total={filtered.length}
        onPageChange={(page) => dispatch(setSupplierPage(page))}
      />
    </div>
  )
}
