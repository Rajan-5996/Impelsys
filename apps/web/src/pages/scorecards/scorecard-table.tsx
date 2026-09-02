import { useEffect, useMemo } from "react"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { Sparkline } from "@/components/metrics"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchScorecards,
  selectScorecardSort,
  selectScorecardsList,
  setScorecardSort,
  type ScorecardRow,
} from "@/store/scorecards-slice"
import type { SupplierTier } from "@/store/suppliers-slice"
import { openDrawer } from "@/store/ui-slice"

const TIER_VARIANT: Record<SupplierTier, StatusChipVariant> = {
  Preferred: "preferred",
  Approved: "approved",
  Monitor: "monitor",
  "At Risk": "atrisk",
}

type Row = ScorecardRow & { rank: number }

export function ScorecardTable() {
  const dispatch = useAppDispatch()
  const { sortKey, sortDir } = useAppSelector(selectScorecardSort)
  const { data: scorecards, status, error } = useAppSelector(selectScorecardsList)

  useEffect(() => {
    dispatch(fetchScorecards())
  }, [dispatch])

  const rows = useMemo<Row[]>(() => {
    const sorted = [...scorecards].sort((a, b) => {
      if (sortKey === "name") {
        return a.name.localeCompare(b.name) * sortDir
      }
      const key = sortKey ?? "score"
      return (a[key] - b[key]) * sortDir
    })
    return sorted.map((supplier, index) => ({ ...supplier, rank: index + 1 }))
  }, [scorecards, sortKey, sortDir])

  if (status === "failed") {
    return <EmptyState message={error ?? "Failed to load scorecards."} />
  }

  if (status === "loading" || status === "idle") {
    return <div className="h-64 animate-pulse rounded-md bg-muted/40" />
  }

  const columns: DataTableColumn<Row>[] = [
    {
      key: "rank",
      header: "Rank",
      render: (row) => <span className="font-mono">{row.rank}</span>,
    },
    {
      key: "name",
      header: "Supplier",
      sortable: true,
      render: (row) => <p className="font-semibold text-foreground">{row.name}</p>,
    },
    {
      key: "score",
      header: "Score",
      sortable: true,
      align: "right",
      render: (row) => <span className="font-mono font-semibold">{row.score}</span>,
    },
    {
      key: "tier",
      header: "Tier",
      render: (row) => <StatusChip variant={TIER_VARIANT[row.tier]}>{row.tier}</StatusChip>,
    },
    {
      key: "timeliness",
      header: "Timeliness",
      align: "right",
      render: (row) => row.breakdown.Timeliness,
    },
    {
      key: "volumeAccuracy",
      header: "Volume Accuracy",
      align: "right",
      render: (row) => row.breakdown["Volume Accuracy"],
    },
    {
      key: "schemaStability",
      header: "Schema Stability",
      align: "right",
      render: (row) => row.breakdown["Schema Stability"],
    },
    {
      key: "dataQuality",
      header: "Data Quality",
      align: "right",
      render: (row) => row.breakdown["Data Quality"],
    },
    {
      key: "slaCompliance",
      header: "SLA Compliance",
      align: "right",
      render: (row) => row.breakdown["SLA Compliance"],
    },
    {
      key: "trend",
      header: "Trend",
      align: "right",
      render: (row) => (
        <div className="flex justify-end">
          <Sparkline values={row.trend} />
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(row) => row.supplierId}
      sortKey={sortKey}
      sortDir={sortDir}
      onSort={(key) => dispatch(setScorecardSort(key as "name" | "score"))}
      onRowClick={(row) =>
        dispatch(openDrawer({ type: "scorecard", supplierId: row.supplierId }))
      }
    />
  )
}
