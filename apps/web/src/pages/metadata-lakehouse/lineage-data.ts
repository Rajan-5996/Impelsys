import type { LineageEdge, LineageNode, PowerBiVisualSpec, RawSalesRecord } from "./lineage-types"

export const COOKED_RAW_RECORDS: RawSalesRecord[] = [
  { order_id: "ORD-901", customer_id: "CUST-101", product_code: "PROD-A", sales_amount: 1250.0, discount_pct: 0.1, tax_rate: 0.08, region: "North America", order_date: "2026-09-01", currency: "USD", customer_segment: "Enterprise" },
  { order_id: "ORD-902", customer_id: "CUST-102", product_code: "PROD-B", sales_amount: 850.5, discount_pct: 0.05, tax_rate: 0.08, region: "EMEA", order_date: "2026-09-01", currency: "EUR", customer_segment: "Mid-Market" },
  { order_id: "ORD-903", customer_id: "CUST-103", product_code: "PROD-C", sales_amount: 3400.0, discount_pct: 0.15, tax_rate: 0.05, region: "APAC", order_date: "2026-09-02", currency: "USD", customer_segment: "Enterprise" },
  { order_id: "ORD-904", customer_id: "CUST-104", product_code: "PROD-A", sales_amount: 420.0, discount_pct: 0.0, tax_rate: 0.08, region: "North America", order_date: "2026-09-02", currency: "USD", customer_segment: "SMB" },
  { order_id: "ORD-905", customer_id: "CUST-105", product_code: "PROD-D", sales_amount: 2100.0, discount_pct: 0.2, tax_rate: 0.1, region: "LATAM", order_date: "2026-09-03", currency: "USD", customer_segment: "Mid-Market" },
  { order_id: "ORD-906", customer_id: "CUST-106", product_code: "PROD-B", sales_amount: 1950.0, discount_pct: 0.08, tax_rate: 0.08, region: "EMEA", order_date: "2026-09-03", currency: "EUR", customer_segment: "Enterprise" },
  { order_id: "ORD-907", customer_id: "CUST-107", product_code: "PROD-C", sales_amount: 670.0, discount_pct: 0.0, tax_rate: 0.05, region: "APAC", order_date: "2026-09-04", currency: "USD", customer_segment: "SMB" },
  { order_id: "ORD-908", customer_id: "CUST-108", product_code: "PROD-A", sales_amount: 5120.0, discount_pct: 0.25, tax_rate: 0.08, region: "North America", order_date: "2026-09-04", currency: "USD", customer_segment: "Enterprise" },
]

export const INITIAL_NODES: Record<string, LineageNode> = {
  "anom-vol": {
    id: "anom-vol", tierId: "tier-anomaly", category: "anomaly", badgeCode: "AD-01",
    title: "Volume Shift Detector", subtitle: "Threshold: ±20% vs Baseline",
    description: "Compares current batch row count against historical baseline. Flags runs with >20% volume deviation for human-in-the-loop review.",
    status: "success",
    inputPorts: [{ id: "in-raw", label: "Raw Stream", dataType: "DataFrame" }],
    outputPorts: [{ id: "out-vol", label: "Vol Checked", dataType: "DataFrame" }],
    columnDependencies: ["order_id"], columnsOutput: ["order_id"],
  },
  "anom-schema": {
    id: "anom-schema", tierId: "tier-anomaly", category: "anomaly", badgeCode: "AD-02",
    title: "Schema Drift Detector", subtitle: "Baseline Column Diff",
    description: "Detects missing or newly added columns compared to the registered baseline schema. Prevents silent schema breakage from upstream vendor feeds.",
    status: "success",
    inputPorts: [{ id: "in-raw", label: "Raw Stream", dataType: "DataFrame" }],
    outputPorts: [{ id: "out-schema", label: "Schema Checked", dataType: "DataFrame" }],
    columnDependencies: ["product_code", "customer_id"], columnsOutput: ["product_code", "customer_id"],
  },
  "anom-null": {
    id: "anom-null", tierId: "tier-anomaly", category: "anomaly", badgeCode: "AD-03",
    title: "Null Spike Detector", subtitle: "Threshold: >5% Null Rate",
    description: "Evaluates null distribution on critical join key CUSTOMER_ID. Triggers anomaly gate when null percentage exceeds 5% threshold.",
    status: "success",
    inputPorts: [{ id: "in-raw", label: "Raw Stream", dataType: "DataFrame" }],
    outputPorts: [{ id: "out-null", label: "Null Checked", dataType: "DataFrame" }],
    columnDependencies: ["customer_id"], columnsOutput: ["customer_id"],
  },
  "anom-dup": {
    id: "anom-dup", tierId: "tier-anomaly", category: "anomaly", badgeCode: "AD-04",
    title: "Duplicate Record Detector", subtitle: "Threshold: >2% Duplicate Rate",
    description: "Scans natural key ORDER_ID for duplicate record spikes. Flags batches exceeding 2% duplication rate for dedup review.",
    status: "success",
    inputPorts: [{ id: "in-raw", label: "Raw Stream", dataType: "DataFrame" }],
    outputPorts: [{ id: "out-dup", label: "Dedup Checked", dataType: "DataFrame" }],
    columnDependencies: ["order_id"], columnsOutput: ["order_id"],
  },
  "dq-fresh": {
    id: "dq-fresh", tierId: "tier-quality", category: "quality", badgeCode: "DQ-01",
    title: "Freshness Validator", subtitle: "Weight: 10% · 30-Day Window",
    description: "Validates ORDER_DATE falls within the last 30 days and is not future-dated. Ensures temporal integrity of incoming batch data.",
    status: "success",
    inputPorts: [{ id: "in-anom", label: "Anomaly Stream", dataType: "DataFrame" }],
    outputPorts: [{ id: "out-fresh", label: "Fresh DF", dataType: "DataFrame" }],
    columnDependencies: ["order_date"], columnsOutput: ["order_date"],
  },
  "dq-complete": {
    id: "dq-complete", tierId: "tier-quality", category: "quality", badgeCode: "DQ-02",
    title: "Completeness Gate", subtitle: "Weight: 15% · Non-Null Constraint",
    description: "Gating rule requiring 100% presence for CUSTOMER_ID, PRODUCT_CODE, ORDER_DATE, and SALES_AMOUNT. Scores 0 if any required column is missing.",
    status: "success",
    inputPorts: [{ id: "in-anom", label: "Anomaly Stream", dataType: "DataFrame" }],
    outputPorts: [{ id: "out-complete", label: "Complete DF", dataType: "DataFrame" }],
    columnDependencies: ["customer_id", "product_code", "order_date", "sales_amount"],
    columnsOutput: ["customer_id", "product_code", "order_date", "sales_amount"],
  },
  "dq-valid": {
    id: "dq-valid", tierId: "tier-quality", category: "quality", badgeCode: "DQ-03",
    title: "Validity & Accuracy Engine", subtitle: "Weight: 30% · Format + Calc Check",
    description: "Validates email format, enforces SALES_AMOUNT ≥ 0, and verifies SALES_AMOUNT = QUANTITY × UNIT_PRICE cross-field accuracy.",
    status: "success",
    inputPorts: [{ id: "in-anom", label: "Anomaly Stream", dataType: "DataFrame" }],
    outputPorts: [{ id: "out-valid", label: "Valid DF", dataType: "DataFrame" }],
    columnDependencies: ["sales_amount", "discount_pct"], columnsOutput: ["sales_amount", "discount_pct"],
  },
  "dq-ref": {
    id: "dq-ref", tierId: "tier-quality", category: "quality", badgeCode: "DQ-04",
    title: "Referential Integrity Gate", subtitle: "Weight: 30% · Master Lookup + Uniqueness",
    description: "Validates PRODUCT_CODE exists in product master catalog and enforces ORDER_ID uniqueness. Combined referential + uniqueness dimension.",
    status: "success",
    inputPorts: [{ id: "in-anom", label: "Anomaly Stream", dataType: "DataFrame" }],
    outputPorts: [{ id: "out-ref", label: "Ref Checked DF", dataType: "DataFrame" }],
    columnDependencies: ["product_code", "order_id"], columnsOutput: ["product_code", "order_id"],
  },
  "etl-s1": {
    id: "etl-s1", tierId: "tier-etl", category: "etl", stageNumber: 1, badgeCode: "S1",
    title: "Parse & Cleanse", subtitle: "Stage 1: Ingestion Sanitizer",
    description: "Casts raw string columns to typed schema (Decimal, Date) and trims whitespace, sanitizes column cases",
    status: "success",
    inputPorts: [{ id: "in-dq", label: "Validated DF", dataType: "DataFrame" }],
    outputPorts: [{ id: "out-s1", label: "Clean DF", dataType: "DataFrame" }],
    columnDependencies: ["order_id", "sales_amount", "order_date", "product_code", "region"],
    columnsOutput: ["order_id", "customer_id", "product_code", "sales_amount", "discount_pct", "tax_rate", "region", "order_date", "currency", "customer_segment"],
  },
  "etl-s2": {
    id: "etl-s2", tierId: "tier-etl", category: "etl", stageNumber: 2, badgeCode: "S2",
    title: "Transform & Normalize", subtitle: "Stage 2: FX & Discount Engine",
    description: "Converts multi-currency amounts to base USD and calculates net_sales_amount after discount application",
    status: "success",
    inputPorts: [{ id: "in-s1", label: "Clean DF", dataType: "DataFrame" }],
    outputPorts: [{ id: "out-s2", label: "Normalized DF", dataType: "DataFrame" }],
    columnDependencies: ["order_id", "currency", "sales_amount", "discount_pct"],
    columnsOutput: ["order_id", "sales_amount_usd", "fx_rate", "net_sales_amount", "discount_amount"],
  },
  "etl-s3": {
    id: "etl-s3", tierId: "tier-etl", category: "etl", stageNumber: 3, badgeCode: "S3",
    title: "Business Rules", subtitle: "Stage 3: Tax & Segmentation",
    description: "Applies regional tax fiscal policies, computes gross_amount, and classifies customer segments into account tiers",
    status: "success",
    inputPorts: [{ id: "in-s2", label: "Normalized DF", dataType: "DataFrame" }],
    outputPorts: [{ id: "out-s3", label: "Tiered DF", dataType: "DataFrame" }],
    columnDependencies: ["order_id", "region", "tax_rate", "customer_id", "customer_segment"],
    columnsOutput: ["order_id", "tax_amount", "gross_amount", "account_tier", "priority_flag"],
  },
  "etl-s4": {
    id: "etl-s4", tierId: "tier-etl", category: "etl", stageNumber: 4, badgeCode: "S4",
    title: "Enrich & Export", subtitle: "Stage 4: Join & Warehouse",
    description: "Joins product master catalog, builds curated star-schema fact table, and writes Snappy Parquet to Delta Lakehouse",
    status: "success",
    inputPorts: [{ id: "in-s3", label: "Tiered DF", dataType: "DataFrame" }],
    outputPorts: [{ id: "out-s4", label: "Lakehouse Table", dataType: "DeltaTable" }],
    columnDependencies: ["order_id", "product_code", "sales_amount", "region"],
    columnsOutput: ["order_id", "product_name", "product_category", "fact_sales_id", "total_net_usd", "lakehouse_snapshot_id"],
  },
  "pbi-kpi": {
    id: "pbi-kpi", tierId: "tier-powerbi", category: "powerbi", badgeCode: "PBI",
    title: "Executive Revenue KPI", subtitle: "Card Visual: Total Sales",
    description: "Primary revenue KPI card displaying aggregate net revenue",
    status: "success",
    inputPorts: [{ id: "in-pbi", label: "Curated Table", dataType: "DeltaTable" }], outputPorts: [],
    columnDependencies: ["order_id", "sales_amount"], columnsOutput: [],
  },
  "pbi-region": {
    id: "pbi-region", tierId: "tier-powerbi", category: "powerbi", badgeCode: "PBI",
    title: "Regional Sales Heatmap", subtitle: "Geo Matrix Visual",
    description: "Geographic performance matrix breakdown across global sales territories",
    status: "success",
    inputPorts: [{ id: "in-pbi", label: "Curated Table", dataType: "DeltaTable" }], outputPorts: [],
    columnDependencies: ["order_id", "region", "sales_amount"], columnsOutput: [],
  },
  "pbi-cat": {
    id: "pbi-cat", tierId: "tier-powerbi", category: "powerbi", badgeCode: "PBI",
    title: "Product Category Revenue Split", subtitle: "Donut & Bar Visual",
    description: "Product category distribution chart powered by joined product master",
    status: "success",
    inputPorts: [{ id: "in-pbi", label: "Curated Table", dataType: "DeltaTable" }], outputPorts: [],
    columnDependencies: ["order_id", "product_code", "product_category"], columnsOutput: [],
  },
  "pbi-churn": {
    id: "pbi-churn", tierId: "tier-powerbi", category: "powerbi", badgeCode: "PBI",
    title: "Segment Account Matrix", subtitle: "Customer Drilldown",
    description: "Enterprise vs SMB account retention and segment performance visual",
    status: "success",
    inputPorts: [{ id: "in-pbi", label: "Curated Table", dataType: "DeltaTable" }], outputPorts: [],
    columnDependencies: ["order_id", "customer_id", "customer_segment"], columnsOutput: [],
  },
}

export const DOWNSTREAM_STATIC_EDGES: LineageEdge[] = [
  { id: "e-ad01-dq01", sourceNodeId: "anom-vol", targetNodeId: "dq-fresh", sourcePortId: "out-vol", targetPortId: "in-anom", status: "active" },
  { id: "e-ad02-dq02", sourceNodeId: "anom-schema", targetNodeId: "dq-complete", sourcePortId: "out-schema", targetPortId: "in-anom", status: "active" },
  { id: "e-ad03-dq03", sourceNodeId: "anom-null", targetNodeId: "dq-valid", sourcePortId: "out-null", targetPortId: "in-anom", status: "active" },
  { id: "e-ad04-dq04", sourceNodeId: "anom-dup", targetNodeId: "dq-ref", sourcePortId: "out-dup", targetPortId: "in-anom", status: "active" },
  { id: "e-dq01-s1", sourceNodeId: "dq-fresh", targetNodeId: "etl-s1", sourcePortId: "out-fresh", targetPortId: "in-dq", status: "active" },
  { id: "e-dq02-s1", sourceNodeId: "dq-complete", targetNodeId: "etl-s1", sourcePortId: "out-complete", targetPortId: "in-dq", status: "active" },
  { id: "e-dq03-s1", sourceNodeId: "dq-valid", targetNodeId: "etl-s1", sourcePortId: "out-valid", targetPortId: "in-dq", status: "active" },
  { id: "e-dq04-s1", sourceNodeId: "dq-ref", targetNodeId: "etl-s1", sourcePortId: "out-ref", targetPortId: "in-dq", status: "active" },
  { id: "e-s1-s2", sourceNodeId: "etl-s1", targetNodeId: "etl-s2", sourcePortId: "out-s1", targetPortId: "in-s1", status: "active" },
  { id: "e-s2-s3", sourceNodeId: "etl-s2", targetNodeId: "etl-s3", sourcePortId: "out-s2", targetPortId: "in-s2", status: "active" },
  { id: "e-s3-s4", sourceNodeId: "etl-s3", targetNodeId: "etl-s4", sourcePortId: "out-s3", targetPortId: "in-s3", status: "active" },
  { id: "e-s4-pbikpi", sourceNodeId: "etl-s4", targetNodeId: "pbi-kpi", sourcePortId: "out-s4", targetPortId: "in-pbi", status: "active" },
  { id: "e-s4-pbireg", sourceNodeId: "etl-s4", targetNodeId: "pbi-region", sourcePortId: "out-s4", targetPortId: "in-pbi", status: "active" },
  { id: "e-s4-pbicat", sourceNodeId: "etl-s4", targetNodeId: "pbi-cat", sourcePortId: "out-s4", targetPortId: "in-pbi", status: "active" },
  { id: "e-s4-pbichurn", sourceNodeId: "etl-s4", targetNodeId: "pbi-churn", sourcePortId: "out-s4", targetPortId: "in-pbi", status: "active" },
]

export function createLineageEdgesForSources(sourceNodeIds: string[]): LineageEdge[] {
  const sourceEdges: LineageEdge[] = []
  const anomalyNodeIds = ["anom-vol", "anom-schema", "anom-null", "anom-dup"]

  for (const sId of sourceNodeIds) {
    for (const anomId of anomalyNodeIds) {
      sourceEdges.push({
        id: `e-${sId}-${anomId}`, sourceNodeId: sId, targetNodeId: anomId,
        sourcePortId: `out-${sId}-${anomId}`, targetPortId: `in-${anomId}-${sId}`, status: "active",
      })
    }
  }

  return [...sourceEdges, ...DOWNSTREAM_STATIC_EDGES]
}

export const POWERBI_VISUAL_SPECS: Record<string, PowerBiVisualSpec> = {
  "pbi-kpi": {
    nodeId: "pbi-kpi", visualId: "vis-revenue-kpi", title: "Total Net Revenue (USD)", chartType: "kpi",
    requiredColumns: ["sales_amount"], aggregationMetric: "SUM(sales_amount)", status: "healthy",
  },
  "pbi-region": {
    nodeId: "pbi-region", visualId: "vis-regional-heatmap", title: "Regional Sales Performance", chartType: "bar",
    requiredColumns: ["region", "sales_amount"], aggregationMetric: "SUM(sales_amount) BY region", status: "healthy",
  },
  "pbi-cat": {
    nodeId: "pbi-cat", visualId: "vis-cat-donut", title: "Product Category Revenue Split", chartType: "bar",
    requiredColumns: ["product_code", "product_category"], aggregationMetric: "SUM(sales_amount) BY product_category", status: "healthy",
  },
  "pbi-churn": {
    nodeId: "pbi-churn", visualId: "vis-segment-matrix", title: "Customer Segment Distribution", chartType: "bar",
    requiredColumns: ["customer_id", "customer_segment"], aggregationMetric: "COUNT(customer_id) BY customer_segment", status: "healthy",
  },
}
