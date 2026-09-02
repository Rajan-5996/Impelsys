import type { Supplier } from "@/data/suppliers"

export function SlaTab({ supplier }: { supplier: Supplier }) {
  const fields = [
    { label: "Expected Time", value: supplier.expectedTime },
    { label: "SLA Deadline", value: supplier.sla },
    { label: "Method", value: supplier.method },
    { label: "Frequency", value: supplier.freq },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
  )
}
