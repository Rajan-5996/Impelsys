import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { selectPipelineStages } from "@/store/pipeline-slice"
import { openDrawer } from "@/store/ui-slice"

const STATUS_VARIANT: Record<string, StatusChipVariant> = {
  done: "ok",
  fail: "failed",
  blocked: "neutral",
  running: "medium",
}

export function PipelineStageGrid() {
  const dispatch = useAppDispatch()
  const stages = useAppSelector(selectPipelineStages)

  return (
    <Card>
      <CardHeader>
        <CardTitle>SALES_DAILY_ETL Stage Detail</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {stages.map((stage, index) => (
          <button
            key={stage.name}
            type="button"
            onClick={() => dispatch(openDrawer({ type: "stage-detail", stageIndex: index }))}
            className="flex flex-col gap-2 border border-border p-3 text-left hover:border-foreground/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-semibold text-muted-foreground">
                Stage {index + 1}
              </span>
              <StatusChip variant={STATUS_VARIANT[stage.status]}>
                {stage.status}
              </StatusChip>
            </div>
            <p className="text-[12.5px] font-bold text-foreground">
              {stage.name}
            </p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 border-t border-dashed border-border pt-2 text-[10.5px] text-muted-foreground">
              <span>
                In: <b className="text-foreground">{stage.recordsIn.toLocaleString()}</b>
              </span>
              <span>
                Out: <b className="text-foreground">{stage.recordsOut.toLocaleString()}</b>
              </span>
              <span>
                Duration: <b className="text-foreground">{stage.duration}</b>
              </span>
              <span>
                Errors: <b className="text-foreground">{stage.errors}</b>
              </span>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
