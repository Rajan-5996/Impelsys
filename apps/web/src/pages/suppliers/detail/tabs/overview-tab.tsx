import { Sparkline, MetricBar } from "@/components/metrics"
import type { Supplier } from "@/data/suppliers"

export function OverviewTab({ supplier }: { supplier: Supplier }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_260px]">
      <div>
        <MetricBar label="Delivery" value={supplier.breakdown.delivery} />
        <MetricBar label="SLA" value={supplier.breakdown.sla} />
        <MetricBar label="Quality" value={supplier.breakdown.quality} />
        <MetricBar label="Incidents" value={supplier.breakdown.incidents} />
        <MetricBar label="Rejected Rate" value={supplier.breakdown.rejected} />
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          {supplier.insight}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <div>
          <p className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            90-Day Trend
          </p>
          <Sparkline values={supplier.trendHist} width={240} height={48} />
        </div>
        <Field
          label="Normal Range"
          value={`${supplier.normalRange[0].toLocaleString()} - ${supplier.normalRange[1].toLocaleString()}`}
        />
        <Field label="Schema Status" value={supplier.schemaStatus} />
        <Field label="Agent Status" value={supplier.agentStatus} />
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border pb-2">
      <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-[12px] font-semibold text-foreground">{value}</p>
    </div>
  )
}
