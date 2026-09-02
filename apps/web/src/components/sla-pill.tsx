import { cn } from "@workspace/ui/lib/utils"

import { useSlaCountdown } from "@/hooks/use-sla-countdown"

type SlaPillProps = {
  deadline: number
  resolvedAt: number | null
  resolvedLabel?: string
  className?: string
}

const VARIANT_CLASS = {
  ok: "bg-status-good/10 text-status-good-ink",
  warn: "bg-status-warning/20 text-status-warning-foreground",
  breach: "bg-status-critical/10 text-status-critical-ink",
}

export function SlaPill({
  deadline,
  resolvedAt,
  resolvedLabel = "Resolved",
  className,
}: SlaPillProps) {
  const { remainingMinutes, isBreached, isResolved } = useSlaCountdown(
    deadline,
    resolvedAt
  )

  if (isResolved) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-none px-2 py-1 text-[11px] font-semibold",
          VARIANT_CLASS.ok,
          className
        )}
      >
        {resolvedLabel}
      </span>
    )
  }

  const variant = isBreached
    ? "breach"
    : remainingMinutes <= 10
      ? "warn"
      : "ok"
  const label = isBreached
    ? `${Math.abs(remainingMinutes)}m overdue`
    : `${remainingMinutes}m remaining`

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-none px-2 py-1 text-[11px] font-semibold",
        VARIANT_CLASS[variant],
        className
      )}
    >
      {label}
    </span>
  )
}
