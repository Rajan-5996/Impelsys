import { defineStage } from "./stage-code-templates-etl"
import type { StageCodeDefinition } from "./lineage-types"

export const STAGE_CODE_CHECKS: Record<string, StageCodeDefinition> = {
  "anom-vol": defineStage(
    "anom-vol", 0, "Anomaly Detection: Volume Shift", "Volume Shift Detector",
    ["order_id"], ["order_id"],
    "Compares current batch row count against rolling baseline. Flags ±20% deviations.",
    `# AD-01: Volume Shift Detector
# Threshold: VOLUME_CHANGE_THRESHOLD_PCT = 20%

def detect_volume_shift(con, run_id, ingestion_result, baseline_key="vendor_feed"):
    """Compares current batch row count against historical baseline."""
    row = con.execute(
        "SELECT row_count FROM baseline_stats WHERE key = ?", [baseline_key]
    ).fetchone()
    baseline_row_count = row[0] if row else None
    current_row_count = ingestion_result["row_count"]

    if baseline_row_count:
        pct_change = ((current_row_count - baseline_row_count) / baseline_row_count) * 100
        if abs(pct_change) > VOLUME_CHANGE_THRESHOLD_PCT:
            return {
                "anomaly_type": "volume_change",
                "details": {
                    "baseline_row_count": baseline_row_count,
                    "current_row_count": current_row_count,
                    "pct_change": round(pct_change, 1),
                },
            }
    return None
`
  ),
  "anom-schema": defineStage(
    "anom-schema", 0, "Anomaly Detection: Schema Drift", "Schema Drift Detector",
    ["product_code", "customer_id"], ["product_code", "customer_id"],
    "Detects missing or newly added columns versus the registered baseline schema.",
    `# AD-02: Schema Drift Detector
# Compares current schema columns against baseline_stats.columns_json

def detect_schema_drift(con, ingestion_result, baseline_key="vendor_feed"):
    """Detects missing or added columns compared to baseline schema."""
    row = con.execute(
        "SELECT columns_json FROM baseline_stats WHERE key = ?", [baseline_key]
    ).fetchone()
    baseline_columns = json.loads(row[0]) if row else []
    current_columns = list(ingestion_result["schema"].keys())

    missing = [c for c in baseline_columns if c not in current_columns]
    added = [c for c in current_columns if c not in baseline_columns]

    anomalies = []
    if missing:
        anomalies.append({"anomaly_type": "schema_missing_columns", "details": {"missing_columns": missing}})
    if added:
        anomalies.append({"anomaly_type": "schema_added_columns", "details": {"added_columns": added}})
    return anomalies
`
  ),
  "anom-null": defineStage(
    "anom-null", 0, "Anomaly Detection: Null Spike", "Null Spike Detector",
    ["customer_id"], ["customer_id"],
    "Evaluates null distribution on CUSTOMER_ID. Triggers when null rate exceeds 5%.",
    `# AD-03: Null Spike Detector
# Threshold: NULL_SPIKE_THRESHOLD_PCT = 5.0%

def detect_null_spike(df):
    """Evaluates null percentage on critical join key CUSTOMER_ID."""
    NULL_SPIKE_THRESHOLD_PCT = 5.0

    if "CUSTOMER_ID" in df.columns:
        null_pct = float((df["CUSTOMER_ID"].isna().sum() / len(df)) * 100)
        if null_pct > NULL_SPIKE_THRESHOLD_PCT:
            return {"anomaly_type": "null_spike", "details": {"column": "CUSTOMER_ID", "null_pct": round(null_pct, 1)}}
    return None
`
  ),
  "anom-dup": defineStage(
    "anom-dup", 0, "Anomaly Detection: Duplicate Spike", "Duplicate Record Detector",
    ["order_id"], ["order_id"],
    "Scans ORDER_ID for duplicate record spikes exceeding 2% threshold.",
    `# AD-04: Duplicate Record Detector
# Threshold: DUPLICATE_SPIKE_THRESHOLD_PCT = 2.0%

def detect_duplicate_spike(df):
    """Scans natural key ORDER_ID for duplicate record spikes."""
    DUPLICATE_SPIKE_THRESHOLD_PCT = 2.0

    if "ORDER_ID" in df.columns:
        dup_pct = float((df["ORDER_ID"].duplicated().sum() / len(df)) * 100)
        if dup_pct > DUPLICATE_SPIKE_THRESHOLD_PCT:
            return {"anomaly_type": "duplicate_spike", "details": {"column": "ORDER_ID", "duplicate_pct": round(dup_pct, 1)}}
    return None
`
  ),
  "dq-fresh": defineStage(
    "dq-fresh", 0, "Data Quality: Freshness", "Freshness Validator",
    ["order_date"], ["order_date"],
    "Validates ORDER_DATE falls within the last 30 days and is not future-dated.",
    `# DQ-01: Freshness Validator
# Weight: 10% | Window: 30 days

def check_freshness(df):
    """Orders should be within the last 30 days, not future-dated."""
    dates = pd.to_datetime(df["ORDER_DATE"], errors="coerce")
    today = pd.Timestamp(date.today())
    stale_or_future = ((dates > today) | (dates < today - pd.Timedelta(days=30))).sum()

    score = round(((len(df) - stale_or_future) / len(df)) * 100, 1)
    issues = []
    if stale_or_future:
        issues.append(f"{stale_or_future} rows outside the 30-day freshness window")

    return {"dimension": "freshness", "score": score, "weight": 0.10, "issues": issues}
`
  ),
  "dq-complete": defineStage(
    "dq-complete", 0, "Data Quality: Completeness", "Completeness Gate",
    ["customer_id", "product_code", "order_date", "sales_amount"],
    ["customer_id", "product_code", "order_date", "sales_amount"],
    "Ensures 100% non-null presence for CUSTOMER_ID, PRODUCT_CODE, ORDER_DATE, SALES_AMOUNT.",
    `# DQ-02: Completeness Gate
# Weight: 15% | Required fields must be non-null

def check_completeness(df):
    """Required fields non-null: CUSTOMER_ID, PRODUCT_CODE, ORDER_DATE, SALES_AMOUNT."""
    required = ["CUSTOMER_ID", "PRODUCT_CODE", "ORDER_DATE", "SALES_AMOUNT"]
    n = len(df)
    incomplete = df[required].isna().any(axis=1).sum()

    score = round(((n - incomplete) / n) * 100, 1) if n else 100.0
    issues = []
    if incomplete:
        issues.append(f"{incomplete} rows missing a required field")

    return {"dimension": "completeness", "score": score, "weight": 0.15, "issues": issues}
`
  ),
  "dq-valid": defineStage(
    "dq-valid", 0, "Data Quality: Validity & Accuracy", "Validity & Accuracy Engine",
    ["sales_amount", "discount_pct"], ["sales_amount", "discount_pct"],
    "Validates email format, non-negative sales, and SALES_AMOUNT = QUANTITY × UNIT_PRICE.",
    `# DQ-03: Validity & Accuracy Engine
# Weight: 15% + 15% = 30% combined

import re
EMAIL_RE = re.compile(r"^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")

def check_validity_and_accuracy(df):
    """Validates email format, non-negative sales, and cross-field accuracy."""
    n = len(df)
    issues = []

    invalid_email = (~df["CUSTOMER_EMAIL"].astype(str).str.match(EMAIL_RE)).sum()
    negative_amount = (df["SALES_AMOUNT"] < 0).sum()
    validity_score = round(((n - invalid_email - negative_amount) / n) * 100, 1)

    if invalid_email:
        issues.append(f"{invalid_email} rows with malformed email")
    if negative_amount:
        issues.append(f"{negative_amount} rows with negative SALES_AMOUNT")

    expected = df["QUANTITY"] * df["UNIT_PRICE"]
    inaccurate = (~pd.Series.round(df["SALES_AMOUNT"] - expected, 2).eq(0)).sum()
    accuracy_score = round(((n - inaccurate) / n) * 100, 1)

    if inaccurate:
        issues.append(f"{inaccurate} rows where SALES_AMOUNT != QUANTITY * UNIT_PRICE")

    return {
        "validity": {"score": validity_score, "weight": 0.15},
        "accuracy": {"score": accuracy_score, "weight": 0.15},
        "issues": issues,
    }
`
  ),
  "dq-ref": defineStage(
    "dq-ref", 0, "Data Quality: Referential Integrity & Uniqueness", "Referential Integrity Gate",
    ["product_code", "order_id"], ["product_code", "order_id"],
    "Validates PRODUCT_CODE exists in product master and ORDER_ID uniqueness.",
    `# DQ-04: Referential Integrity & Uniqueness Gate
# Weight: 15% + 15% = 30% combined

def check_referential_and_uniqueness(df, product_master_keys):
    """Validates foreign key integrity and natural key uniqueness."""
    n = len(df)
    issues = []

    unmatched = (~df["PRODUCT_CODE"].isin(product_master_keys)).sum()
    ref_score = round(((n - unmatched) / n) * 100, 1) if n else 100.0
    if unmatched:
        issues.append(f"{unmatched} rows with PRODUCT_CODE not in product master")

    dup = df["ORDER_ID"].duplicated().sum()
    uniq_score = round(((n - dup) / n) * 100, 1) if n else 100.0
    if dup:
        issues.append(f"{dup} duplicate ORDER_ID rows")

    return {
        "referential_integrity": {"score": ref_score, "weight": 0.15},
        "uniqueness": {"score": uniq_score, "weight": 0.15},
        "issues": issues,
    }
`
  ),
}
