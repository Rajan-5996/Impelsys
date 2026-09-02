import { DownloadIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"

import { Breadcrumbs } from "@/components/breadcrumbs"
import { ScorecardTable } from "@/pages/scorecards/scorecard-table"
import { TierWatchlist } from "@/pages/scorecards/tier-watchlist"
import { SUPPLIERS } from "@/data/suppliers"

function exportScorecardsCsv() {
  const header = ["Supplier", "Score", "Tier", "Delivery", "SLA", "Quality", "Incidents"]
  const rows = [...SUPPLIERS]
    .sort((a, b) => b.score - a.score)
    .map((supplier) => [
      supplier.name,
      String(supplier.score),
      supplier.tier,
      String(supplier.breakdown.delivery),
      String(supplier.breakdown.sla),
      String(supplier.breakdown.quality),
      String(supplier.breakdown.incidents),
    ])

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "supplier-scorecards.csv"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function ScorecardsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Breadcrumbs trail={[{ label: "Supplier Scorecards" }]} />
          <h1 className="mt-1 text-lg font-semibold text-foreground">
            Supplier Scorecards
          </h1>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            Composite reliability scoring across {SUPPLIERS.length} suppliers
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportScorecardsCsv}>
          <DownloadIcon /> Export CSV
        </Button>
      </div>

      <Card>
        <ScorecardTable />
      </Card>

      <TierWatchlist />
    </div>
  )
}
