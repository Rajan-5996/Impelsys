export type QualityDimension = {
  key: string
  label: string
  score: number
  prev: number
  affected: number
}

export const QUALITY_DIMS: QualityDimension[] = [
  { key: "completeness", label: "Completeness", score: 97, prev: 96, affected: 2 },
  { key: "validity", label: "Validity", score: 93, prev: 95, affected: 4 },
  { key: "uniqueness", label: "Uniqueness", score: 99, prev: 99, affected: 0 },
  { key: "consistency", label: "Consistency", score: 91, prev: 93, affected: 3 },
  { key: "freshness", label: "Freshness", score: 100, prev: 100, affected: 0 },
  { key: "referential", label: "Referential Integrity", score: 92, prev: 94, affected: 2 },
]

export const DQ_OVERALL = 94.2
export const DQ_TREND = [91, 92, 91, 93, 92, 94, 93, 95, 94, 93, 94, 95, 94, 94]

export type DqKpiDef = {
  label: string
  value: string
}

export const DQ_KPI_DEFS: DqKpiDef[] = [
  { label: "Enterprise Data Quality Score", value: "94.2" },
  { label: "Datasets Monitored", value: "184" },
  { label: "Rules Evaluated Today", value: "3,842" },
  { label: "Critical Rule Failures", value: "4" },
  { label: "Quality Issues Open", value: "17" },
]

export type Dataset = {
  id: string
  name: string
  pipeline: string
  owner: string
  overall: number
  records: number
  rulesTotal: number
  passed: number
  warnings: number
  failed: number
  supplierSource: string
  lastAssessed: string
}

export const DATASETS: Dataset[] = [
  { id: "daily-sales-curated", name: "Daily Sales Curated Dataset", pipeline: "SALES_DAILY_ETL", owner: "Sales Analytics Engineering", overall: 94, records: 1021443, rulesTotal: 127, passed: 123, warnings: 3, failed: 1, supplierSource: "DataSphere, NorthStar Data, Apex Data, Orion Commerce", lastAssessed: "07:41 IST" },
  { id: "inventory-snapshot-curated", name: "Inventory Snapshot Curated Dataset", pipeline: "INVENTORY_SYNC_ETL", owner: "Supply Chain Analytics Engineering", overall: 96, records: 508110, rulesTotal: 64, passed: 63, warnings: 1, failed: 0, supplierSource: "Vertex Supply Co", lastAssessed: "01:40 IST" },
  { id: "customer-master-golden", name: "Customer Master Golden Record", pipeline: "CUSTOMER_MASTER_ETL", owner: "Customer Data Governance", overall: 91, records: 2214880, rulesTotal: 88, passed: 83, warnings: 4, failed: 1, supplierSource: "Cross-pipeline", lastAssessed: "05:12 IST" },
  { id: "clickstream-sessions-curated", name: "Clickstream Sessions Curated Dataset", pipeline: "CLICKSTREAM_ETL", owner: "Digital Analytics Engineering", overall: 89, records: 2142880, rulesTotal: 52, passed: 48, warnings: 3, failed: 1, supplierSource: "Redwood Analytics", lastAssessed: "04:20 IST" },
  { id: "globalfeeds-product-curated", name: "GlobalFeeds Product Curated Dataset", pipeline: "GLOBALFEEDS_INTAKE_ETL", owner: "Merchandising Data Engineering", overall: 80, records: 398210, rulesTotal: 46, passed: 38, warnings: 4, failed: 4, supplierSource: "GlobalFeeds", lastAssessed: "06:05 IST" },
]

export type DatasetRuleStatus = "Passed" | "Warning" | "Failed"

export type DatasetRule = {
  id: string
  rule: string
  dim: string
  status: DatasetRuleStatus
  affected: number
  note: string
}

export const DATASET_RULES: Record<string, DatasetRule[]> = {
  "daily-sales-curated": [
    { id: "DQ-001", rule: "CUSTOMER_ID must not be NULL", dim: "Completeness", status: "Failed", affected: 1248, note: "Quarantined to CUSTOMER_VALIDATION_EXCEPTION, see INC-2026-0901-02" },
    { id: "DQ-002", rule: "PRODUCT_CODE must exist in Product Master", dim: "Referential Integrity", status: "Passed", affected: 0, note: "Match rate 99.67 percent, within tolerance" },
    { id: "DQ-003", rule: "TRANSACTION_DATE cannot be future dated", dim: "Validity", status: "Passed", affected: 0, note: "No violations detected" },
    { id: "DQ-004", rule: "SALES_AMOUNT must be greater than or equal to 0", dim: "Validity", status: "Warning", affected: 12, note: "Negligible, refund adjustment edge cases" },
    { id: "DQ-005", rule: "ORDER_ID must be unique", dim: "Uniqueness", status: "Passed", affected: 214, note: "0.02 percent duplicate rate, below the 0.1 percent threshold" },
  ],
  "globalfeeds-product-curated": [
    { id: "DQ-101", rule: "PRODUCT_CODE mapping validation", dim: "Validity", status: "Failed", affected: 8214, note: "2.0 percent mismatch rate, see GlobalFeeds supplier alert" },
    { id: "DQ-102", rule: "SUPPLIER_FEED_TIMESTAMP within SLA window", dim: "Freshness", status: "Failed", affected: 1, note: "Feed landed 82 minutes after the 04:30 expected arrival" },
    { id: "DQ-103", rule: "CATEGORY_CODE must exist in Category Master", dim: "Referential Integrity", status: "Warning", affected: 640, note: "0.16 percent mismatch rate, trending upward" },
    { id: "DQ-104", rule: "PRICE must be greater than 0", dim: "Validity", status: "Passed", affected: 0, note: "No violations detected" },
  ],
}

export type QualityRule = {
  rule: string
  dim: string
  dataset: string
  pipeline: string
  checked: number
  violations: number
  status: DatasetRuleStatus
  note: string
}

export const QUALITY_RULES: QualityRule[] = [
  { rule: "CUSTOMER_ID must not be NULL", dim: "Completeness", dataset: "daily-sales-curated", pipeline: "SALES_DAILY_ETL", checked: 1021443, violations: 1248, status: "Warning", note: "Quarantined to CUSTOMER_VALIDATION_EXCEPTION, see INC-2026-0901-02" },
  { rule: "PRODUCT_CODE must exist in Product Master", dim: "Referential Integrity", dataset: "daily-sales-curated", pipeline: "SALES_DAILY_ETL", checked: 1021443, violations: 3344, status: "Warning", note: "0.33 percent mismatch rate, within tolerance, trending upward" },
  { rule: "TRANSACTION_DATE cannot be future dated", dim: "Validity", dataset: "daily-sales-curated", pipeline: "SALES_DAILY_ETL", checked: 1021443, violations: 0, status: "Passed", note: "No violations detected" },
  { rule: "SALES_AMOUNT must be greater than or equal to 0", dim: "Validity", dataset: "daily-sales-curated", pipeline: "SALES_DAILY_ETL", checked: 1021443, violations: 12, status: "Passed", note: "Negligible, refund adjustment edge cases" },
  { rule: "ORDER_ID must be unique", dim: "Uniqueness", dataset: "daily-sales-curated", pipeline: "SALES_DAILY_ETL", checked: 1021443, violations: 214, status: "Passed", note: "0.02 percent duplicate rate, below the 0.1 percent threshold" },
  { rule: "Daily Sales Feed record count within normal range, 950K to 1.1M", dim: "Completeness", dataset: "daily-sales-curated", pipeline: "DAILY_SALES_FEED_INTAKE", checked: 1, violations: 1, status: "Failed", note: "218,431 records received, see INC-2026-0901-01" },
  { rule: "SUPPLIER_FEED_TIMESTAMP must arrive within SLA window", dim: "Freshness", dataset: "daily-sales-curated", pipeline: "ALL_PIPELINES", checked: 27, violations: 0, status: "Passed", note: "All landed feeds met the SLA window today" },
  { rule: "PRODUCT_CODE mapping validation", dim: "Validity", dataset: "globalfeeds-product-curated", pipeline: "GLOBALFEEDS_INTAKE_ETL", checked: 402880, violations: 8214, status: "Failed", note: "2.0 percent mismatch rate, see GlobalFeeds supplier alert" },
]

export type Deterioration = {
  entity: string
  metric: string
  from: number
  to: number
  when: string
  cause: string
}

export const DETERIORATIONS: Deterioration[] = [
  { entity: "GlobalFeeds", metric: "Delivery Reliability", from: 89, to: 70, when: "Last 30 days", cause: "7 late or missed SLA events, 3 in the last week" },
  { entity: "GlobalFeeds", metric: "Validity", from: 82, to: 71, when: "Last 30 days", cause: "PRODUCT_CODE validation failures rose from 0.4 percent to 2.0 percent" },
  { entity: "DataSphere", metric: "Referential Integrity", from: 88, to: 79, when: "Last 45 days", cause: "Two prior CUSTOMER_ID incidents plus today's Customer Validation failure" },
  { entity: "Clickstream Sessions Curated Dataset", metric: "Consistency", from: 93, to: 87, when: "Last 14 days", cause: "Session de-duplication logic change introduced minor drift" },
]

export function findDataset(id: string) {
  return DATASETS.find((dataset) => dataset.id === id)
}
