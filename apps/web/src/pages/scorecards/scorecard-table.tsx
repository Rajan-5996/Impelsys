import { useMemo } from "react"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { Sparkline } from "@/components/metrics"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { SUPPLIERS, type Supplier, type SupplierTier } from "@/data/suppliers"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { selectScorecardSort, setScorecardSort } from "@/store/scorecards-slice"
import { openDrawer } from "@/store/ui-slice"

const TIER_VARIANT: Record<SupplierTier, StatusChipVariant> = {
  Preferred: "preferred",
  Approved: "approved",
  Monitor: "monitor",
  "At Risk": "atrisk",
}

type Row = Supplier & { rank: number }

export function ScorecardTable() {
  const dispatch = useAppDispatch()
  const { sortKey, sortDir } = useAppSelector(selectScorecardSort)

  const rows = useMemo<Row[]>(() => {
    const sorted = [...SUPPLIERS].sort((a, b) => {
      if (sortKey === "name") {
        return a.name.localeCompare(b.name) * sortDir
      }
      const key = sortKey ?? "score"
      return (a[key] - b[key]) * sortDir
    })
    return sorted.map((supplier, index) => ({ ...supplier, rank: index + 1 }))
  }, [sortKey, sortDir])

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
      render: (row) => (
        <div>
          <p className="font-semibold text-foreground">{row.name}</p>
          <p className="text-[10.5px] text-muted-foreground">{row.feed}</p>
        </div>
      ),
    },
    {
      key: "score",
      header: "Score",
      sortable: true,
      align: "right",
      render: (row) => (
        <span className="font-mono font-semibold">{row.score}</span>
      ),
    },
    {
      key: "tier",
      header: "Tier",
      render: (row) => (
        <StatusChip variant={TIER_VARIANT[row.tier]}>{row.tier}</StatusChip>
      ),
    },
    {
      key: "delivery",
      header: "Delivery",
      align: "right",
      render: (row) => row.breakdown.delivery,
    },
    {
      key: "sla",
      header: "SLA",
      align: "right",
      render: (row) => row.breakdown.sla,
    },
    {
      key: "quality",
      header: "Quality",
      align: "right",
      render: (row) => row.breakdown.quality,
    },
    {
      key: "incidents",
      header: "Incidents",
      align: "right",
      render: (row) => row.breakdown.incidents,
    },
    {
      key: "trend",
      header: "Trend",
      align: "right",
      render: (row) => (
        <div className="flex justify-end">
          <Sparkline values={row.trendHist} />
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(row) => row.id}
      sortKey={sortKey}
      sortDir={sortDir}
      onSort={(key) => dispatch(setScorecardSort(key as "name" | "score"))}
      onRowClick={(row) =>
        dispatch(openDrawer({ type: "scorecard", supplierId: row.id }))
      }
    />
  )
}
