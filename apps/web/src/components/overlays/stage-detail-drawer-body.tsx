import { useNavigate } from "react-router-dom"

import {
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"

import { StatusChip } from "@/components/status-chip"
import { incidentPath } from "@/constants/routes"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { selectPipelineStages } from "@/store/pipeline-slice"
import { closeDrawer } from "@/store/ui-slice"

const STATUS_VARIANT = {
  done: "ok",
  fail: "failed",
  blocked: "neutral",
  running: "medium",
} as const

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border py-2.5 last:border-b-0">
      <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-[12.5px] font-semibold text-foreground">
        {value}
      </p>
    </div>
  )
}

export function StageDetailDrawerBody({ stageIndex }: { stageIndex: number }) {
  const stages = useAppSelector(selectPipelineStages)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const stage = stages[stageIndex]

  if (!stage) return null

  const isFailedValidation =
    stage.name === "Customer Validation" && stage.errors > 0

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>{stage.name}</SheetTitle>
      </SheetHeader>
      <div className="flex flex-col gap-1 px-8 pb-8">
        <div className="mb-3 flex items-center gap-2">
          <StatusChip variant={STATUS_VARIANT[stage.status]}>
            {stage.status}
          </StatusChip>
        </div>
        <Field label="Records In" value={stage.recordsIn.toLocaleString()} />
        <Field label="Records Out" value={stage.recordsOut.toLocaleString()} />
        <Field label="Duration" value={stage.duration} />
        <Field label="Errors" value={String(stage.errors)} />
        <Field label="Updated" value={stage.updated} />
        {isFailedValidation ? (
          <button
            type="button"
            onClick={() => {
              dispatch(closeDrawer())
              navigate(incidentPath("etl"))
            }}
            className="mt-4 border border-border bg-muted/30 px-3 py-2 text-left text-[11.5px] font-semibold text-primary hover:bg-muted/50"
          >
            View related incident: INC-2026-0901-02
          </button>
        ) : null}
      </div>
    </SheetContent>
  )
}
