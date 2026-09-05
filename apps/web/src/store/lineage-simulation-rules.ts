export type SimulationRule = {
  triggerStatus: "warning" | "error"
  triggerMessage: string
  culpritEntity: string
  impactedEtlStages: string[]
  brokenPbiVisuals: string[]
  technicalRemediation: string
  affectedNodes: Record<string, { status: "error" | "warning"; errorMessage: string }>
}

/** Realistic, defensible data-engineering failure-propagation trees, keyed by
 * the node id a user clicked to simulate a breakage at. Kept as pure data
 * (unmodified from the original interactive simulator) so every failure
 * scenario the feature ever supported still works exactly the same. */
export const SIMULATION_RULES: Record<string, SimulationRule> = {
  "anom-schema": {
    triggerStatus: "warning",
    triggerMessage: "Schema Drift Alert: Inbound vendor feed dropped required dimension column 'product_code'",
    culpritEntity: "product_code (Schema Drift)",
    impactedEtlStages: ["Curate & Export (Stage 4)"],
    brokenPbiVisuals: ["Product Category Revenue Split"],
    technicalRemediation: "Schema Drift Detected on dimension key 'product_code'. Fine-grained column lineage isolates impact to Referential Integrity (dq-ref), Completeness (dq-complete), Stage 4 Product Catalog Join (etl-s4), and Product Category visual (pbi-cat). Unaffected stages (S1, S2, S3) and Executive Revenue KPI / Regional Heatmap remain fully operational.",
    affectedNodes: {
      "dq-ref": { status: "error", errorMessage: "Foreign Key Check Failed: Cannot resolve product master lookup without 'product_code'" },
      "dq-complete": { status: "error", errorMessage: "Nullity Alert: Mandatory attribute 'product_code' missing in 100% of batch rows" },
      "etl-s4": { status: "error", errorMessage: "AnalysisException: Column 'product_code' not resolved during Dim_Product catalog join" },
      "pbi-cat": { status: "error", errorMessage: "Hierarchy Failure: 'product_category' dimension unavailable due to S4 catalog join failure" },
    },
  },
  "anom-null": {
    triggerStatus: "warning",
    triggerMessage: "Null Spike Alert: 'customer_id' null rate reached 18.2% (exceeding 3.0% SLA threshold)",
    culpritEntity: "customer_id (Null Spike)",
    impactedEtlStages: ["Parse & Cleanse (Stage 1)", "Business Rules & Margin (Stage 3)"],
    brokenPbiVisuals: ["Customer Segment Distribution"],
    technicalRemediation: "Null Spike on 'customer_id' breached Completeness Gate (dq-complete) and blocked Stage 1 Ingestion (etl-s1) and Stage 3 Account Tiering (etl-s3). Impacts Customer Segment visual (pbi-churn). Financial revenue and product category dashboards remain healthy.",
    affectedNodes: {
      "dq-complete": { status: "error", errorMessage: "Completeness SLA Breached: Mandatory customer identifier contains 18.2% null records" },
      "etl-s1": { status: "error", errorMessage: "Null Rejection Barrier: Failed customer_id not-null assertion on raw payload ingest" },
      "etl-s3": { status: "error", errorMessage: "Account Tiering Failure: Unable to calculate customer loyalty discount without customer_id" },
      "pbi-churn": { status: "error", errorMessage: "Segmentation Distortion: 18.2% unassigned null customer IDs skew cohort retention matrix" },
    },
  },
  "anom-vol": {
    triggerStatus: "warning",
    triggerMessage: "Volume Shift Alert: Batch throughput dropped -81.4% below rolling 30-day baseline",
    culpritEntity: "throughput_volume (Volume Drop)",
    impactedEtlStages: [],
    brokenPbiVisuals: ["Total Net Revenue (USD)", "Regional Sales Performance"],
    technicalRemediation: "Volume Shift (-81.4%) indicates upstream feed delay. Freshness Gate (dq-fresh) flagged starvation, and Revenue KPI (pbi-kpi) and Regional Heatmap (pbi-region) alert on abnormal variances. Data structure and ETL pipeline remain structurally sound.",
    affectedNodes: {
      "dq-fresh": { status: "error", errorMessage: "Stream Starvation: Upstream ingestion delay indicates vendor source throttling or outage" },
      "pbi-kpi": { status: "error", errorMessage: "Statistically Abnormal Revenue: Revenue KPI dropped -81.4% below executive threshold" },
      "pbi-region": { status: "error", errorMessage: "Low Sample Size: Regional sales counts fell below minimum confidence interval" },
    },
  },
  "anom-dup": {
    triggerStatus: "warning",
    triggerMessage: "Duplicate Alert: Duplicate primary key 'order_id' detected at 4.6% (threshold: 1.0%)",
    culpritEntity: "order_id (Duplicate Keys)",
    impactedEtlStages: ["Parse & Cleanse (Stage 1)"],
    brokenPbiVisuals: ["Total Net Revenue (USD)"],
    technicalRemediation: "Duplicate natural key 'order_id' triggered Validity Gate (dq-valid) and halted Stage 1 Ingestion (etl-s1) to protect Executive Revenue KPI (pbi-kpi) from fraudulent double-counting.",
    affectedNodes: {
      "dq-valid": { status: "error", errorMessage: "Primary Key Uniqueness Violation: 4.6% repeated natural keys detected in transaction batch" },
      "etl-s1": { status: "error", errorMessage: "Deduplication Quorum: Quarantined duplicate orders into dead-letter queue" },
      "pbi-kpi": { status: "error", errorMessage: "Financial Risk: Revenue numbers distorted by double-counted orders" },
    },
  },
  "dq-fresh": {
    triggerStatus: "error",
    triggerMessage: "Freshness SLA Failure: Stream latency > 4 hours without new checkpoint commit",
    culpritEntity: "order_date (Freshness SLA)",
    impactedEtlStages: [],
    brokenPbiVisuals: ["Total Net Revenue (USD)"],
    technicalRemediation: "Freshness SLA Breached. Upstream feed is stale. Correlated with Volume Shift Detector (anom-vol) and Executive Revenue KPI (pbi-kpi) reflecting frozen real-time financial figures.",
    affectedNodes: {
      "anom-vol": { status: "warning", errorMessage: "Ingestion Starvation: No heartbeat received from upstream broker in 4 hours" },
      "pbi-kpi": { status: "error", errorMessage: "Stale Metric: Revenue KPI frozen on stale data snapshot" },
    },
  },
  "dq-complete": {
    triggerStatus: "error",
    triggerMessage: "Completeness Failure: Critical mandatory attributes missing across batch",
    culpritEntity: "mandatory_attributes (Completeness)",
    impactedEtlStages: ["Parse & Cleanse (Stage 1)"],
    brokenPbiVisuals: ["Total Net Revenue (USD)", "Customer Segment Distribution"],
    technicalRemediation: "Completeness Gate failed due to missing required attributes in incoming stream. Stage 1 Ingestion halted at the perimeter. Power BI Revenue and Segment visuals flagged as incomplete.",
    affectedNodes: {
      "etl-s1": { status: "error", errorMessage: "Ingestion Barrier: Rejected batch with missing mandatory schema fields" },
      "pbi-kpi": { status: "error", errorMessage: "Missing Metrics: Revenue calculation incomplete due to missing row attributes" },
      "pbi-churn": { status: "error", errorMessage: "Missing Identifiers: Customer segment metrics missing required keys" },
    },
  },
  "dq-valid": {
    triggerStatus: "error",
    triggerMessage: "Validity Failure: Numerical domain check failed (negative prices or discount > 100%)",
    culpritEntity: "sales_amount / discount_pct (Domain Violation)",
    impactedEtlStages: ["Retail Normalization & FX (Stage 2)", "Store Margin & Tax Rules (Stage 3)"],
    brokenPbiVisuals: ["Total Net Revenue (USD)"],
    technicalRemediation: "Numerical Domain Integrity check failed. Negative sales amounts and illegal discounts broke Stage 2 FX math and Stage 3 Tax rules. Executive Revenue KPI halted to prevent financial reporting distortion.",
    affectedNodes: {
      "etl-s2": { status: "error", errorMessage: "FX Math Exception: Negative sales amount rejected by currency engine" },
      "etl-s3": { status: "error", errorMessage: "Tax Rule Exception: Calculation failure on invalid discount rate" },
      "pbi-kpi": { status: "error", errorMessage: "Corrupted Aggregate: Negative sales skewing total revenue" },
    },
  },
  "dq-ref": {
    triggerStatus: "error",
    triggerMessage: "Referential Integrity Failure: Orphan foreign keys not found in master catalogs",
    culpritEntity: "product_code / customer_id (Foreign Key Mismatch)",
    impactedEtlStages: ["Curate & Export to S3 Delta (Stage 4)"],
    brokenPbiVisuals: ["Product Category Revenue Split"],
    technicalRemediation: "Referential Integrity Gate rejected batch due to orphan product codes missing from Dim_Product catalog. Stage 4 Delta Lakehouse Join aborted, breaking Product Category Revenue breakdown visual.",
    affectedNodes: {
      "etl-s4": { status: "error", errorMessage: "Delta Join Failure: Foreign keys missing in Dim_Product master catalog" },
      "pbi-cat": { status: "error", errorMessage: "Hierarchy Failure: Orphaned product codes cannot be categorized in Power BI" },
    },
  },
  "etl-s1": {
    triggerStatus: "error",
    triggerMessage: "Stage 1 Parse Error: Malformed JSON payload deserialization crash",
    culpritEntity: "stage_1_parse (Ingestion Crash)",
    impactedEtlStages: ["Stage 2 (Normalize & FX)", "Stage 3 (Business Rules)", "Stage 4 (Curate & Export)"],
    brokenPbiVisuals: ["Total Net Revenue (USD)", "Regional Sales Performance", "Product Category Revenue Split", "Customer Segment Distribution"],
    technicalRemediation: "Stage 1 Parse & Cleanse failed. Because ETL is a sequential horizontal queue (S1 -> S2 -> S3 -> S4), downstream stages S2, S3, and S4 are blocked, and Power BI cannot receive a new Delta Lake table. Level 1 Sources and Level 2/3 Quality gates remain healthy.",
    affectedNodes: {
      "etl-s2": { status: "error", errorMessage: "Pipeline Blocked: Awaiting Stage 1 sanitized DataFrame" },
      "etl-s3": { status: "error", errorMessage: "Pipeline Blocked: Upstream Stage 1 failed" },
      "etl-s4": { status: "error", errorMessage: "Pipeline Blocked: Upstream Stage 1 failed" },
      "pbi-kpi": { status: "error", errorMessage: "Lakehouse Offline: Snappy Parquet generation aborted at Stage 1" },
      "pbi-region": { status: "error", errorMessage: "Lakehouse Offline: No geographic data published" },
      "pbi-cat": { status: "error", errorMessage: "Lakehouse Offline: No product catalog data published" },
      "pbi-churn": { status: "error", errorMessage: "Lakehouse Offline: No customer segment data published" },
    },
  },
  "etl-s2": {
    triggerStatus: "error",
    triggerMessage: "Stage 2 FX Error: Multi-currency FX conversion lookup timed out for EUR/GBP/JPY",
    culpritEntity: "stage_2_fx (Currency Normalization)",
    impactedEtlStages: ["Stage 3 (Business Rules)", "Stage 4 (Curate & Export)"],
    brokenPbiVisuals: ["Total Net Revenue (USD)", "Regional Sales Performance", "Product Category Revenue Split", "Customer Segment Distribution"],
    technicalRemediation: "Stage 2 Normalization & FX failed. Stage 1 (Parse & Cleanse) succeeded cleanly. Downstream stages S3 and S4 are blocked, preventing Delta Lakehouse export. Level 1-3 upstream gates remain green.",
    affectedNodes: {
      "etl-s3": { status: "error", errorMessage: "Pipeline Blocked: Awaiting Stage 2 base USD currency normalization" },
      "etl-s4": { status: "error", errorMessage: "Pipeline Blocked: Upstream Stage 2 failed" },
      "pbi-kpi": { status: "error", errorMessage: "Lakehouse Offline: Multi-currency normalization incomplete" },
      "pbi-region": { status: "error", errorMessage: "Lakehouse Offline: Currency conversion aborted" },
      "pbi-cat": { status: "error", errorMessage: "Lakehouse Offline: Product pricing not normalized" },
      "pbi-churn": { status: "error", errorMessage: "Lakehouse Offline: Spend percentiles not normalized" },
    },
  },
  "etl-s3": {
    triggerStatus: "error",
    triggerMessage: "Stage 3 Tax Error: Divide-by-zero on promo coupon markdown rate calculation",
    culpritEntity: "stage_3_tax (Tax & Margin Engine)",
    impactedEtlStages: ["Stage 4 (Curate & Export)"],
    brokenPbiVisuals: ["Total Net Revenue (USD)", "Regional Sales Performance", "Product Category Revenue Split", "Customer Segment Distribution"],
    technicalRemediation: "Stage 3 Business Rules failed. Stages S1 and S2 completed successfully. Stage 4 Delta Export is blocked, impacting all Power BI executive visuals.",
    affectedNodes: {
      "etl-s4": { status: "error", errorMessage: "Pipeline Blocked: Awaiting Stage 3 tax and margin table" },
      "pbi-kpi": { status: "error", errorMessage: "Lakehouse Offline: Net revenue margin calculation incomplete" },
      "pbi-region": { status: "error", errorMessage: "Lakehouse Offline: Regional tax allocation incomplete" },
      "pbi-cat": { status: "error", errorMessage: "Lakehouse Offline: Category discount calculation incomplete" },
      "pbi-churn": { status: "error", errorMessage: "Lakehouse Offline: Loyalty tier scoring incomplete" },
    },
  },
  "etl-s4": {
    triggerStatus: "error",
    triggerMessage: "Stage 4 Export Error: Snappy Parquet write conflict to Delta Lake partition",
    culpritEntity: "stage_4_lakehouse (Delta Write Conflict)",
    impactedEtlStages: [],
    brokenPbiVisuals: ["Total Net Revenue (USD)", "Regional Sales Performance", "Product Category Revenue Split", "Customer Segment Distribution"],
    technicalRemediation: "Stage 4 Delta Lakehouse Export failed during partition write. Transformations in S1, S2, and S3 all completed successfully. Power BI executive visuals cannot refresh.",
    affectedNodes: {
      "pbi-kpi": { status: "error", errorMessage: "Delta Sync Failure: Direct query target missing updated revenue partition" },
      "pbi-region": { status: "error", errorMessage: "Delta Sync Failure: Regional partition write aborted" },
      "pbi-cat": { status: "error", errorMessage: "Delta Sync Failure: Product fact table partition write aborted" },
      "pbi-churn": { status: "error", errorMessage: "Delta Sync Failure: Customer dimension write aborted" },
    },
  },
  "src-1": {
    triggerStatus: "error",
    triggerMessage: "Primary Source Outage: Real-time socket stream connection timed out",
    culpritEntity: "primary_source_feed (Connection Lost)",
    impactedEtlStages: ["Stage 1", "Stage 2", "Stage 3", "Stage 4"],
    brokenPbiVisuals: ["Total Net Revenue (USD)", "Regional Sales Performance", "Product Category Revenue Split", "Customer Segment Distribution"],
    technicalRemediation: "Primary Data Source (src-1) disconnected. Volume shift and freshness SLAs triggered immediately, and the downstream pipeline halted at the ingestion perimeter.",
    affectedNodes: {
      "anom-vol": { status: "warning", errorMessage: "Zero Ingestion Throughput: Inbound stream socket disconnected" },
      "dq-fresh": { status: "error", errorMessage: "Ingestion Timeout: No heartbeats received in 30 minutes" },
      "etl-s1": { status: "error", errorMessage: "Pipeline Halted: Primary source feed offline" },
      "etl-s2": { status: "error", errorMessage: "Pipeline Halted: No data from Stage 1" },
      "etl-s3": { status: "error", errorMessage: "Pipeline Halted: No data from Stage 2" },
      "etl-s4": { status: "error", errorMessage: "Pipeline Halted: No data from Stage 3" },
      "pbi-kpi": { status: "error", errorMessage: "Data Stale: Primary ingestion pipeline severed at source" },
      "pbi-region": { status: "error", errorMessage: "Data Stale: No regional records ingested" },
      "pbi-cat": { status: "error", errorMessage: "Data Stale: No product records ingested" },
      "pbi-churn": { status: "error", errorMessage: "Data Stale: No customer records ingested" },
    },
  },
  "src-2": {
    triggerStatus: "error",
    triggerMessage: "Auxiliary Storage Offline: source bucket access denied on catalog partition",
    culpritEntity: "product_catalog_partition (Access Denied)",
    impactedEtlStages: ["Curate & Export (Stage 4)"],
    brokenPbiVisuals: ["Product Category Revenue Split"],
    technicalRemediation: "Secondary Source encountered an access failure. Core transaction stream (src-1) and Stages S1-S3 remain operational, but Stage 4 product catalog join and Product Category visual are impacted.",
    affectedNodes: {
      "anom-schema": { status: "warning", errorMessage: "Catalog Schema Missing: secondary source catalog partition inaccessible" },
      "dq-ref": { status: "error", errorMessage: "Foreign Key Check Failed: Product master catalog not found in secondary source" },
      "etl-s4": { status: "error", errorMessage: "Delta Join Aborted: Missing secondary-source product dimension catalog" },
      "pbi-cat": { status: "error", errorMessage: "Visual Broken: Product category hierarchy missing from secondary source" },
    },
  },
  "src-3": {
    triggerStatus: "error",
    triggerMessage: "Retail Gateway Offline: POS webhook listener unreachable",
    culpritEntity: "customer_card_data (Webhook Outage)",
    impactedEtlStages: [],
    brokenPbiVisuals: ["Customer Segment Distribution"],
    technicalRemediation: "Third source connector unreachable. Anomaly duplicate check and Customer Segment matrix are alerted, while the rest of the pipeline continues running.",
    affectedNodes: {
      "anom-dup": { status: "warning", errorMessage: "Replay Reconciliation Lost: Unable to cross-check retail card keys" },
      "pbi-churn": { status: "error", errorMessage: "Segmentation Matrix Offline: Missing retail cardholder segments" },
    },
  },
}
