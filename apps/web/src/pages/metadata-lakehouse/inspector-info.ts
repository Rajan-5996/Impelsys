export interface AnomalyInfo {
  ruleId: string
  ruleType: string
  threshold: string
  monitoredColumn: string
  severity: "high" | "medium" | "low"
  gateAction: string
}

export const ANOMALY_INFO: Record<string, AnomalyInfo> = {
  "anom-vol": {
    ruleId: "ANM-VOL-001", ruleType: "Volume Change Detection", threshold: "±20% vs Baseline Row Count",
    monitoredColumn: "ORDER_ID (row count)", severity: "high",
    gateAction: "Pipeline pauses at anomaly gate. Requires human approval to proceed or reject.",
  },
  "anom-schema": {
    ruleId: "ANM-SCH-002", ruleType: "Schema Drift Detection", threshold: "Any Missing or Added Column",
    monitoredColumn: "All Columns (baseline diff)", severity: "high",
    gateAction: "Pipeline halts. Missing columns can break downstream joins and aggregations.",
  },
  "anom-null": {
    ruleId: "ANM-NUL-003", ruleType: "Null Spike Detection", threshold: ">5% Null Rate on CUSTOMER_ID",
    monitoredColumn: "CUSTOMER_ID", severity: "medium",
    gateAction: "Pipeline pauses for review. High null rates on join keys cause downstream data loss.",
  },
  "anom-dup": {
    ruleId: "ANM-DUP-004", ruleType: "Duplicate Spike Detection", threshold: ">2% Duplicate Rate on ORDER_ID",
    monitoredColumn: "ORDER_ID", severity: "medium",
    gateAction: "Pipeline pauses. Duplicates inflate aggregations and break uniqueness constraints downstream.",
  },
}

export interface QualityInfo {
  dimensionId: string
  dimensions: Array<{ name: string; weight: string; rule: string }>
  scoringTiers: Array<{ tier: string; range: string; color: string }>
  failurePolicy: string
}

const TIERS = [
  { tier: "Preferred", range: "≥90%", color: "text-emerald-500" },
  { tier: "Approved", range: "75-89%", color: "text-blue-400" },
  { tier: "Monitor", range: "60-74%", color: "text-amber-400" },
  { tier: "At Risk", range: "<60%", color: "text-red-400" },
]

export const QUALITY_INFO: Record<string, QualityInfo> = {
  "dq-fresh": {
    dimensionId: "DQ-FRESH-001",
    dimensions: [{ name: "Freshness", weight: "10%", rule: "ORDER_DATE within last 30 days, not future-dated" }],
    scoringTiers: TIERS,
    failurePolicy: "Stale or future-dated rows degrade score. Dimension scores 0 if ORDER_DATE column is missing entirely.",
  },
  "dq-complete": {
    dimensionId: "DQ-COMP-002",
    dimensions: [{ name: "Completeness", weight: "15%", rule: "CUSTOMER_ID, PRODUCT_CODE, ORDER_DATE, SALES_AMOUNT must be non-null" }],
    scoringTiers: TIERS,
    failurePolicy: "Any row missing a required field counts as incomplete. Missing columns score the dimension at 0.",
  },
  "dq-valid": {
    dimensionId: "DQ-VAL-003",
    dimensions: [
      { name: "Validity", weight: "15%", rule: "Email format valid (regex) + SALES_AMOUNT ≥ 0" },
      { name: "Accuracy", weight: "15%", rule: "SALES_AMOUNT = QUANTITY × UNIT_PRICE" },
    ],
    scoringTiers: TIERS,
    failurePolicy: "Malformed emails and negative amounts reduce validity. Cross-field mismatches reduce accuracy score.",
  },
  "dq-ref": {
    dimensionId: "DQ-REF-004",
    dimensions: [
      { name: "Referential Integrity", weight: "15%", rule: "PRODUCT_CODE must exist in product master catalog" },
      { name: "Uniqueness", weight: "15%", rule: "ORDER_ID must be unique across batch" },
    ],
    scoringTiers: TIERS,
    failurePolicy: "Unmatched product codes and duplicate order IDs reduce their respective dimension scores.",
  },
}
