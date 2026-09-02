export type KpiDelta = {
  dir: "up" | "down" | "flat"
  text: string
}

export type KpiDef = {
  label: string
  value: string
  suffix?: string
  sub: string
  delta: KpiDelta | null
  accent?: "up" | "down" | "flat" | "info"
}

export const KPI_DEFS: KpiDef[] = [
  { label: "Data Feeds Today", value: "24", sub: "of 27 expected", delta: null },
  { label: "Healthy Feeds", value: "21", sub: "of 24 received", delta: { dir: "flat", text: "Same as yesterday" } },
  { label: "Active Anomalies", value: "3", sub: "across 2 suppliers", delta: { dir: "down", text: "+1 vs yesterday" } },
  { label: "Open Incidents", value: "2", sub: "1 awaiting approval", delta: { dir: "down", text: "Unchanged" } },
  { label: "Enterprise Data Quality", value: "94.2", suffix: "%", sub: "184 datasets monitored", delta: { dir: "down", text: "-0.6 pts vs yesterday" } },
  { label: "Suppliers Within SLA", value: "91", suffix: "%", sub: "11 of 12 suppliers", delta: { dir: "flat", text: "Same as yesterday" } },
]

export type LifecycleFlowStep = {
  label: string
  count: number
  unit: string
}

export const LIFECYCLE_FLOW: LifecycleFlowStep[] = [
  { label: "Vendor", count: 27, unit: "feeds scheduled" },
  { label: "SFTP / API", count: 24, unit: "delivered" },
  { label: "Landing", count: 24, unit: "landed" },
  { label: "ETL", count: 23, unit: "triggered" },
  { label: "Validation", count: 22, unit: "passed" },
  { label: "Transformation", count: 21, unit: "completed" },
  { label: "Warehouse", count: 21, unit: "loaded" },
  { label: "BI", count: 21, unit: "published" },
]
