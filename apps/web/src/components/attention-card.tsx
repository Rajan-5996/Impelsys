import { cn } from "@workspace/ui/lib/utils"

export type AttentionField = {
  label: string
  value: React.ReactNode
}

type AttentionCardProps = {
  severity: "critical" | "high" | "medium"
  title: string
  subtitle: string
  fields: AttentionField[]
  slaSlot?: React.ReactNode
  onClick?: () => void
}

const SEVERITY_BORDER: Record<AttentionCardProps["severity"], string> = {
  critical: "border-l-status-critical bg-status-critical/5",
  high: "border-l-status-serious bg-status-serious/5",
  medium: "border-l-status-warning bg-status-warning/10",
}

export function AttentionCard({
  severity,
  title,
  subtitle,
  fields,
  slaSlot,
  onClick,
}: AttentionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-2.5 block w-full overflow-hidden border border-border text-left transition-shadow last:mb-0 hover:shadow-md"
    >
      <div
        className={cn(
          "flex items-center gap-2.5 border-l-4 px-3.5 py-2.5",
          SEVERITY_BORDER[severity]
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-semibold text-foreground">
            {title}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {subtitle}
          </p>
        </div>
        {slaSlot}
      </div>
      <div className="grid grid-cols-2 border-t border-border sm:grid-cols-4">
        {fields.map((field, index) => (
          <div
            key={`${field.label}-${index}`}
            className="border-r border-b border-border px-3.5 py-2 last:border-r-0"
          >
            <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
              {field.label}
            </p>
            <p className="mt-0.5 text-[11.5px] font-semibold text-foreground">
              {field.value}
            </p>
          </div>
        ))}
      </div>
    </button>
  )
}
