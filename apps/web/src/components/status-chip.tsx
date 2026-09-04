import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

export type StatusChipVariant =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "ok"
  | "passed"
  | "warning"
  | "failed"
  | "neutral"
  | "preferred"
  | "approved"
  | "monitor"
  | "atrisk"

const VARIANT_MAP: Record<
  StatusChipVariant,
  | "status-critical"
  | "status-serious"
  | "status-warning"
  | "status-good"
  | "status-info"
  | "muted"
> = {
  critical: "status-critical",
  high: "status-serious",
  medium: "status-warning",
  low: "status-info",
  ok: "status-good",
  passed: "status-good",
  warning: "status-warning",
  failed: "status-critical",
  neutral: "muted",
  preferred: "status-good",
  approved: "status-info",
  monitor: "status-warning",
  atrisk: "status-critical",
}

type StatusChipProps = {
  variant: StatusChipVariant
  children: React.ReactNode
  className?: string
}

export function StatusChip({ variant, children, className }: StatusChipProps) {
  return (
    <Badge variant={VARIANT_MAP[variant]} className={cn(className)}>
      {children}
    </Badge>
  )
}

const TEXT_VARIANT_MAP: Record<StatusChipVariant, string> = {
  critical: "text-status-critical-ink",
  high: "text-status-serious",
  medium: "text-status-warning",
  low: "text-status-info",
  ok: "text-status-good-ink",
  passed: "text-status-good-ink",
  warning: "text-status-warning-foreground",
  failed: "text-status-critical-ink",
  neutral: "text-muted-foreground",
  preferred: "text-status-good-ink",
  approved: "text-status-info",
  monitor: "text-status-warning-foreground",
  atrisk: "text-status-critical-ink",
}

/** Same status color-coding as StatusChip, but as plain colored text with no
 * pill background -- for places a solid badge reads as too heavy. */
export function StatusText({ variant, children, className }: StatusChipProps) {
  return (
    <span className={cn("text-[11.5px] font-bold tracking-wide", TEXT_VARIANT_MAP[variant], className)}>
      {children}
    </span>
  )
}
