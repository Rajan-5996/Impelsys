import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { ETL_INCIDENT } from "@/data/incidents"

function CompareRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-dashed border-border py-1.5 text-[11.5px] last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">{value}</span>
    </div>
  )
}

export function CompareResolutionModalBody({
  similarId,
}: {
  similarId: string
}) {
  const similar = ETL_INCIDENT.similar.find((item) => item.id === similarId)

  if (!similar) return null

  return (
    <DialogContent size="wide">
      <DialogHeader>
        <DialogTitle>Compare Resolution</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <div className="border border-border p-3.5">
          <h4 className="mb-2 text-[11.5px] font-bold text-foreground">
            Current: {ETL_INCIDENT.id}
          </h4>
          <CompareRow label="Supplier" value={ETL_INCIDENT.supplier} />
          <CompareRow label="Stage" value={ETL_INCIDENT.stage} />
          <CompareRow label="Error" value={ETL_INCIDENT.error} />
          <CompareRow label="Affected" value={String(ETL_INCIDENT.affected)} />
          <CompareRow label="Recommendation" value={ETL_INCIDENT.recommendation} />
        </div>
        <div className="border border-border p-3.5">
          <h4 className="mb-2 text-[11.5px] font-bold text-foreground">
            Historical: {similar.id} ({similar.pct}% match)
          </h4>
          <CompareRow label="Supplier" value={similar.supplier} />
          <CompareRow label="Date" value={similar.date} />
          <CompareRow label="Failure" value={similar.failure} />
          <CompareRow label="Root Cause" value={similar.rootCause} />
          <CompareRow label="Resolution" value={similar.resolution} />
          <CompareRow label="Outcome" value={similar.outcome} />
        </div>
      </div>
    </DialogContent>
  )
}
