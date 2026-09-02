import { EmptyState } from "@/components/empty-state"
import type { Supplier } from "@/store/suppliers-slice"

export function OverviewTab({ supplier }: { supplier: Supplier }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_260px]">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Region" value={supplier.region} />
        <Field label="Delivery Method" value={supplier.deliveryMethod} />
        <Field label="Owner" value={supplier.owner} />
        <Field label="Pipeline" value={supplier.pipeline} />
        <Field label="Frequency" value={supplier.frequency} />
        <Field label="Volume Baseline" value={supplier.volumeBaseline.toLocaleString()} />
        <Field label="Format" value={supplier.format} />
        <Field label="File Size" value={supplier.fileSize} />
        <Field label="SLA" value={supplier.sla} />
      </div>
      <div className="flex flex-col gap-3">
        <p className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Live Feed Stats
        </p>
        {supplier.liveFeedStats ? (
          <>
            <Field
              label="Record Count"
              value={supplier.liveFeedStats.recordCount.toLocaleString()}
            />
            <Field
              label="Null Customer IDs"
              value={String(supplier.liveFeedStats.nullCustomerIdCount)}
            />
            <Field
              label="Last Landed"
              value={supplier.liveFeedStats.lastLandedAt}
            />
          </>
        ) : (
          <EmptyState message="No live feed data landed yet." />
        )}
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
