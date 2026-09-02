import { Link } from "react-router-dom"

import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { useAppSelector } from "@/store/hooks"
import { selectPipelineStages } from "@/store/pipeline-slice"

const STATUS_VARIANT: Record<string, StatusChipVariant> = {
  done: "ok",
  fail: "failed",
  blocked: "neutral",
  running: "medium",
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <section
      id="pipeline-context"
      className="scroll-mt-28 border border-border p-4"
    >
      <h2 className="mb-3 text-xs font-bold tracking-wide text-foreground uppercase">
        Pipeline Context
      </h2>
      {children}
    </section>
  )
}

export function NorthstarPipelineContext() {
  return (
    <Wrapper>
      <p className="mb-2.5 text-xs text-muted-foreground">
        NorthStar Data feeds directly into SALES_DAILY_ETL. Downstream stages
        remain held until the source file is re-delivered and reprocessed.
      </p>
      <Link
        to="/pipeline"
        className="inline-block bg-primary/10 px-3 py-1.5 text-[11.5px] font-semibold text-primary hover:bg-primary/20"
      >
        View SALES_DAILY_ETL pipeline
      </Link>
    </Wrapper>
  )
}

export function EtlPipelineContext() {
  const stages = useAppSelector(selectPipelineStages)

  return (
    <Wrapper>
      <div className="mb-3 flex flex-wrap gap-2">
        {stages.map((stage) => (
          <div
            key={stage.name}
            className="flex items-center gap-1.5 border border-border px-2.5 py-1.5"
          >
            <span className="text-[11px] font-semibold text-foreground">
              {stage.name}
            </span>
            <StatusChip variant={STATUS_VARIANT[stage.status]}>
              {stage.status}
            </StatusChip>
          </div>
        ))}
      </div>
      <Link
        to="/pipeline"
        className="inline-block bg-primary/10 px-3 py-1.5 text-[11.5px] font-semibold text-primary hover:bg-primary/20"
      >
        View full pipeline detail
      </Link>
    </Wrapper>
  )
}
