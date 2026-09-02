import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

import { TrendBadge } from "@/components/metrics"
import { QUALITY_DIMS } from "@/data/quality"

function scoreTextColor(score: number) {
  if (score >= 90) return "text-status-good-ink"
  if (score >= 75) return "text-status-warning-foreground"
  return "text-status-critical-ink"
}

export function QualityDimensionGrid() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Dimensions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUALITY_DIMS.map((dim) => {
            const dir = dim.score > dim.prev ? "up" : dim.score < dim.prev ? "down" : "flat"
            return (
              <div key={dim.key} className="border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[11.5px] font-semibold text-foreground">
                    {dim.label}
                  </p>
                  <TrendBadge dir={dir} />
                </div>
                <p
                  className={cn(
                    "mt-1.5 text-2xl font-extrabold tracking-tight",
                    scoreTextColor(dim.score)
                  )}
                >
                  {dim.score}
                </p>
                <p className="mt-1 text-[10.5px] text-muted-foreground">
                  {dim.affected} records affected
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
