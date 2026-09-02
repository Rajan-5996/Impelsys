import { useNavigate } from "react-router-dom"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { Pagination } from "@/components/pagination"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { supplierDetailPath } from "@/constants/routes"
import { getVisibleSuppliers } from "@/pages/suppliers/supplier-filtering"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  selectSupplierFilters,
  selectSuppliersList,
  setSupplierPage,
  setSupplierSort,
  type Supplier,
  type SupplierSortKey,
} from "@/store/suppliers-slice"

const TIER_VARIANT: Record<Supplier["tier"], StatusChipVariant> = {
  Preferred: "preferred",
  Approved: "approved",
  Monitor: "monitor",
  "At Risk": "atrisk",
}

const HEALTH_STATUS_VARIANT: Record<string, StatusChipVariant> = {
  Healthy: "ok",
  "Volume Anomaly": "critical",
  "Missing Feed": "critical",
  "Under Investigation": "medium",
  "Schema Change": "medium",
}

export function SupplierTable() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const filters = useAppSelector(selectSupplierFilters)
  const suppliers = useAppSelector(selectSuppliersList)

  const sorted = getVisibleSuppliers(suppliers, filters)
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
    { key: "region", header: "Region", sortable: true, render: (row) => row.region },
    { key: "deliveryMethod", header: "Method", render: (row) => row.deliveryMethod },
    {
      key: "tier",
      header: "Tier",
      sortable: true,
      render: (row) => (
        <StatusChip variant={TIER_VARIANT[row.tier]}>{row.tier}</StatusChip>
      ),
    },
    {
      key: "score",
      header: "Score",
      sortable: true,
      align: "right",
      render: (row) => <span className="font-mono text-[11px]">{row.score}</span>,
    },
    {
      key: "healthStatus",
      header: "Health",
      render: (row) => (
        <StatusChip variant={HEALTH_STATUS_VARIANT[row.healthStatus] ?? "medium"}>
          {row.healthStatus}
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
        total={sorted.length}
        onPageChange={(page) => dispatch(setSupplierPage(page))}
      />
    </div>
  )
}
