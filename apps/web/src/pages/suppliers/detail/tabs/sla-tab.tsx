import { useEffect } from "react"

import { EmptyState } from "@/components/empty-state"
import { StatusChip } from "@/components/status-chip"
import { fetchSupplierSla, selectSupplierSla } from "@/store/supplier-detail-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

export function SlaTab({ supplierId }: { supplierId: string }) {
  const dispatch = useAppDispatch()
  const { data: sla, status, error } = useAppSelector(selectSupplierSla)

  useEffect(() => {
    dispatch(fetchSupplierSla(supplierId))
  }, [dispatch, supplierId])

  if (status === "failed") {
    return <EmptyState message={error ?? "Failed to load SLA details."} />
  }

  if (status === "loading" || status === "idle" || !sla) {
    return <div className="h-24 animate-pulse rounded-md bg-muted/40" />
  }

  const fields = [
    { label: "Expected Time", value: sla.expectedTime ?? "—" },
    { label: "SLA", value: sla.sla ?? "—" },
    { label: "Last Landed", value: sla.lastLandedAt ?? "Not yet landed" },
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fields.map((field) => (
          <div key={field.label} className="border border-border p-3">
            <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
              {field.label}
            </p>
            <p className="mt-1 text-[12.5px] font-semibold text-foreground">
              {field.value}
            </p>
          </div>
        ))}
      </div>
      <StatusChip variant={sla.slaState === "breach" ? "critical" : "ok"}>
        {sla.slaState === "breach" ? "SLA breached" : "Within SLA"}
      </StatusChip>
    </div>
  )
}
