import { DownloadIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"

import { ScorecardTable } from "@/pages/scorecards/scorecard-table"
import { TierWatchlist } from "@/pages/scorecards/tier-watchlist"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchScorecardsCsv, selectScorecardsList } from "@/store/scorecards-slice"
import { pushToast } from "@/store/ui-slice"

function downloadCsv(csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "supplier-scorecards.csv"
  link.click()
  URL.revokeObjectURL(url)
}

export function ScorecardsPage() {
  const dispatch = useAppDispatch()
  const { data: scorecards } = useAppSelector(selectScorecardsList)

  async function handleExport() {
    try {
      const csv = await dispatch(fetchScorecardsCsv()).unwrap()
      downloadCsv(csv)
    } catch {
      dispatch(pushToast("Failed to export scorecards CSV", "warn"))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="mt-1 text-lg font-semibold text-foreground">
            Supplier Scorecards
          </h1>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            Composite reliability scoring across{" "}
            {scorecards.length > 0 ? `${scorecards.length} suppliers` : "all suppliers"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
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
