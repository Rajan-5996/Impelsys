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
