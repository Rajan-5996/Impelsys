import { Breadcrumbs } from "@/components/breadcrumbs"
import { SlaPill } from "@/components/sla-pill"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"

type IncidentHeaderField = {
  label: string
  value: string
}

type IncidentHeaderProps = {
  crumbLabel: string
  id: string
  title: string
  subtitle: string
  severityVariant: StatusChipVariant
  severityLabel: string
  statusVariant: StatusChipVariant
  statusLabel: string
  slaDeadline: number
  slaResolvedAt: number | null
  slaResolvedLabel: string
  fields: IncidentHeaderField[]
  businessImpact: string
}

export function IncidentHeader({
  crumbLabel,
  id,
  title,
  subtitle,
  severityVariant,
  severityLabel,
  statusVariant,
  statusLabel,
  slaDeadline,
  slaResolvedAt,
  slaResolvedLabel,
  fields,
  businessImpact,
}: IncidentHeaderProps) {
  return (
    <div className="mb-5">
      <Breadcrumbs
        trail={[
          { label: "Pipeline Operations", path: "/pipeline" },
          { label: crumbLabel },
        ]}
      />
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold text-foreground">{id}</h1>
            <StatusChip variant={severityVariant}>{severityLabel}</StatusChip>
            <StatusChip variant={statusVariant}>{statusLabel}</StatusChip>
          </div>
          <p className="mt-1 text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <SlaPill
          deadline={slaDeadline}
          resolvedAt={slaResolvedAt}
          resolvedLabel={slaResolvedLabel}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 border border-border p-3.5 sm:grid-cols-4">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
              {field.label}
            </p>
            <p className="mt-0.5 text-[12px] font-semibold text-foreground">
              {field.value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 border border-warning/40 bg-warning/10 p-3 text-xs leading-relaxed text-warning-foreground">
        <span className="font-bold">Business Impact: </span>
        {businessImpact}
      </div>
    </div>
  )
}
