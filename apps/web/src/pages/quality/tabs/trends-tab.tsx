import { Card, CardContent } from "@workspace/ui/components/card"

import { Sparkline } from "@/components/metrics"
import { DQ_OVERALL, DQ_TREND } from "@/data/quality"

export function TrendsTab() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-6">
        <p className="text-3xl font-extrabold tracking-tight text-foreground">
          {DQ_OVERALL}
          <small className="ml-1 text-sm font-semibold text-muted-foreground">
            %
          </small>
        </p>
        <p className="text-[10.5px] text-muted-foreground">
          Enterprise data quality, 14-day trend
        </p>
        <Sparkline values={DQ_TREND} width={480} height={120} className="mt-2" />
      </CardContent>
    </Card>
  )
}
