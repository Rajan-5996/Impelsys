import type { StatusChipVariant } from "@/components/status-chip"

const VARIANT_CHART_COLOR: Record<StatusChipVariant, string> = {
  critical: "var(--color-status-critical)",
  high: "var(--color-status-serious)",
  medium: "var(--color-status-warning)",
  low: "var(--color-status-info)",
  ok: "var(--color-status-good)",
  passed: "var(--color-status-good)",
  warning: "var(--color-status-warning)",
  failed: "var(--color-status-critical)",
  neutral: "var(--color-muted-foreground)",
  preferred: "var(--color-status-good)",
  approved: "var(--color-status-info)",
  monitor: "var(--color-status-warning)",
  atrisk: "var(--color-status-critical)",
}

export function chartColorForVariant(variant: StatusChipVariant) {
  return VARIANT_CHART_COLOR[variant]
}

export const AGENT_CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-standard)",
  "var(--color-accent)",
]

export const CATEGORICAL_CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-standard)",
  "var(--color-accent)",
  "var(--color-status-info)",
  "var(--color-status-warning)",
]
