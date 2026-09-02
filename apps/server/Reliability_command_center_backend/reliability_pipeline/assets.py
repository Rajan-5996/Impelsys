"""The 7 SALES_DAILY_ETL software-defined assets. Every stage is deterministic
DuckDB SQL -- the only LLM call in the whole pipeline lives in checks.py, inside
the asset check on customer_validation_asset.
"""
import datetime

from dagster import AssetExecutionContext, MaterializeResult, MetadataValue, asset

from .db import (
    CURATED_PARQUET,
    DATASPHERE_JSONL,
    NORTHSTAR_CSV,
    CURATED_DIR,
    ensure_history_tables,
    get_connection,
)
from . import governance
from .scoring import tier_for_score
from .seed_data import EXPECTED_SCHEMA, PRODUCT_MASTER


@asset(compute_kind="duckdb")
def landing_asset(context: AssetExecutionContext) -> MaterializeResult:
    """Load NorthStar (pipe CSV) + DataSphere (JSONL) into landing_daily_sales,
    tagged with source_supplier + landed_at. Also (re)seeds the static reference
    tables expected_schema and product_master used by downstream stages.
    """
    with get_connection() as conn:
        conn.execute(
            f"""
            CREATE OR REPLACE TABLE landing_daily_sales AS
            SELECT
                ORDER_ID,
                CAST(ORDER_DATE AS DATE) AS ORDER_DATE,
                NULLIF(CUSTOMER_ID, '') AS CUSTOMER_ID,
                PRODUCT_CODE,
                QUANTITY,
                UNIT_PRICE,
                SALES_AMOUNT,
                CURRENCY,
                REGION,
                [{{'LINE_NO': 1, 'QUANTITY': QUANTITY, 'UNIT_PRICE': UNIT_PRICE,
                   'SALES_AMOUNT': SALES_AMOUNT, 'PRODUCT_CODE': PRODUCT_CODE}}] AS LINE_ITEMS,
                'NorthStar Data' AS source_supplier,
                current_timestamp AS landed_at
            FROM read_csv('{NORTHSTAR_CSV}', delim='|', header=true, quote='')

            UNION ALL BY NAME

            SELECT
                order_id AS ORDER_ID,
                CAST(order_date AS DATE) AS ORDER_DATE,
                customer_id AS CUSTOMER_ID,
                line_items[1].product_code AS PRODUCT_CODE,
                CAST(list_sum(list_transform(line_items, x -> x.quantity)) AS INTEGER) AS QUANTITY,
                round(list_sum(list_transform(line_items, x -> x.unit_price * x.quantity))
                      / list_sum(list_transform(line_items, x -> x.quantity)), 2) AS UNIT_PRICE,
                round(list_sum(list_transform(line_items, x -> x.sales_amount)), 2) AS SALES_AMOUNT,
                currency AS CURRENCY,
                region AS REGION,
                list_transform(
                    line_items,
                    x -> {{'LINE_NO': x.line_no, 'QUANTITY': x.quantity, 'UNIT_PRICE': x.unit_price,
                           'SALES_AMOUNT': x.sales_amount, 'PRODUCT_CODE': x.product_code}}
                ) AS LINE_ITEMS,
                'DataSphere' AS source_supplier,
                current_timestamp AS landed_at
            FROM read_json('{DATASPHERE_JSONL}', format='newline_delimited')
            """
        )
        row_count = conn.execute("SELECT count(*) FROM landing_daily_sales").fetchone()[0]

        # -- static reference tables, reseeded fresh each landing run --
        conn.execute("CREATE OR REPLACE TABLE expected_schema (column_name VARCHAR, data_type VARCHAR)")
        conn.executemany(
            "INSERT INTO expected_schema VALUES (?, ?)", EXPECTED_SCHEMA
        )

        conn.execute(
            "CREATE OR REPLACE TABLE product_master (PRODUCT_CODE VARCHAR, PRODUCT_NAME VARCHAR, CATEGORY VARCHAR)"
        )
        conn.executemany(
            "INSERT INTO product_master VALUES (?, ?, ?)",
            [(p["PRODUCT_CODE"], p["PRODUCT_NAME"], p["CATEGORY"]) for p in PRODUCT_MASTER],
        )

    return MaterializeResult(
        metadata={
            "row_count": MetadataValue.int(row_count),
            "sources": MetadataValue.text("NorthStar Data (CSV), DataSphere (JSONL)"),
        }
    )


@asset(deps=[landing_asset], compute_kind="duckdb")
def schema_validation_asset(context: AssetExecutionContext) -> MaterializeResult:
    """Compare landing_daily_sales's actual columns against expected_schema.
    Fails the asset if any expected column is missing; non-breaking additions pass through.
    """
    with get_connection() as conn:
        actual = {
            row[0]
            for row in conn.execute(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name = 'landing_daily_sales'"
            ).fetchall()
        }
        expected = {row[0] for row in conn.execute("SELECT column_name FROM expected_schema").fetchall()}

        missing = sorted(expected - actual)
        additional = sorted(actual - expected)

    if missing:
        raise Exception(
            f"schema_validation_asset failed: landing_daily_sales is missing expected columns {missing}"
        )

    return MaterializeResult(
        metadata={
            "missing_columns": MetadataValue.text(str(missing)),
            "additional_columns": MetadataValue.text(str(additional)),
        }
    )


@asset(deps=[schema_validation_asset], compute_kind="duckdb")
def customer_validation_asset(context: AssetExecutionContext) -> MaterializeResult:
    """Splits landing_daily_sales into customer_validation_pass / _exception on
    CUSTOMER_ID IS NOT NULL. The asset check in checks.py fails (blocking) when
    _exception has any rows -- that failure is the trigger for the governance gate.
    """
    with get_connection() as conn:
        conn.execute(
            "CREATE OR REPLACE TABLE customer_validation_pass AS "
            "SELECT * FROM landing_daily_sales WHERE CUSTOMER_ID IS NOT NULL"
        )
        conn.execute(
            "CREATE OR REPLACE TABLE customer_validation_exception AS "
            "SELECT *, current_timestamp AS quarantined_at, 'DQ-001: CUSTOMER_ID NOT NULL' AS reason "
            "FROM landing_daily_sales WHERE CUSTOMER_ID IS NULL"
        )
        pass_count = conn.execute("SELECT count(*) FROM customer_validation_pass").fetchone()[0]
        exception_count = conn.execute("SELECT count(*) FROM customer_validation_exception").fetchone()[0]

    return MaterializeResult(
        metadata={
            "pass_count": MetadataValue.int(pass_count),
            "exception_count": MetadataValue.int(exception_count),
        }
    )


@asset(deps=[customer_validation_asset], compute_kind="duckdb")
def product_mapping_asset(context: AssetExecutionContext) -> MaterializeResult:
    """Join customer_validation_pass against product_master on PRODUCT_CODE.
    Rows pass through regardless of match (left join); unmatched count is logged
    for the Referential Integrity quality dimension.
    """
    with get_connection() as conn:
        conn.execute(
            """
            CREATE OR REPLACE TABLE product_mapping_pass AS
            SELECT c.*, p.PRODUCT_NAME, p.CATEGORY
            FROM customer_validation_pass c
            LEFT JOIN product_master p ON c.PRODUCT_CODE = p.PRODUCT_CODE
            """
        )
        unmatched = conn.execute(
            "SELECT count(*) FROM product_mapping_pass WHERE PRODUCT_NAME IS NULL"
        ).fetchone()[0]
        total = conn.execute("SELECT count(*) FROM product_mapping_pass").fetchone()[0]

    context.log.info(f"product_mapping_asset: {unmatched}/{total} rows have an unmatched PRODUCT_CODE")

    return MaterializeResult(
        metadata={
            "unmatched_product_code_count": MetadataValue.int(unmatched),
            "total_rows": MetadataValue.int(total),
        }
    )


@asset(deps=[product_mapping_asset], compute_kind="duckdb")
def transformation_asset(context: AssetExecutionContext) -> MaterializeResult:
    """Normalize grain: UNNEST each order's LINE_ITEMS so order headers become line items."""
    with get_connection() as conn:
        conn.execute(
            """
            CREATE OR REPLACE TABLE daily_sales_lines AS
            SELECT
                m.ORDER_ID,
                m.ORDER_DATE,
                m.CUSTOMER_ID,
                li.PRODUCT_CODE,
                m.PRODUCT_NAME,
                m.CATEGORY,
                li.LINE_NO,
                li.QUANTITY,
                li.UNIT_PRICE,
                li.SALES_AMOUNT,
                m.CURRENCY,
                m.REGION,
                m.source_supplier,
                m.landed_at
            FROM product_mapping_pass m, UNNEST(m.LINE_ITEMS) AS t(li)
            """
        )
        header_count = conn.execute("SELECT count(*) FROM product_mapping_pass").fetchone()[0]
        line_count = conn.execute("SELECT count(*) FROM daily_sales_lines").fetchone()[0]

    return MaterializeResult(
        metadata={
            "order_header_count": MetadataValue.int(header_count),
            "line_item_count": MetadataValue.int(line_count),
            "expansion_ratio": MetadataValue.float(round(line_count / header_count, 3) if header_count else 0),
        }
    )


@asset(deps=[transformation_asset], compute_kind="duckdb")
def business_rules_asset(context: AssetExecutionContext) -> MaterializeResult:
    """Three deterministic checks. All rows still pass through to the curated
    dataset -- this stage records pass/fail counts, it doesn't quarantine.
    """
    with get_connection() as conn:
        conn.execute("CREATE OR REPLACE TABLE business_rules_validated AS SELECT * FROM daily_sales_lines")

        total_lines = conn.execute("SELECT count(*) FROM business_rules_validated").fetchone()[0]

        future_dated = conn.execute(
            "SELECT count(*) FROM business_rules_validated WHERE ORDER_DATE > current_date"
        ).fetchone()[0]

        negative_amount = conn.execute(
            "SELECT count(*) FROM business_rules_validated WHERE SALES_AMOUNT < 0"
        ).fetchone()[0]

        # ORDER_ID uniqueness is a header-grain rule; checked against the pre-UNNEST table
        # so multi-line-item orders don't trip a false positive.
        header_total = conn.execute("SELECT count(*) FROM product_mapping_pass").fetchone()[0]
        duplicate_order_ids = conn.execute(
            """
            SELECT count(*) FROM (
                SELECT ORDER_ID, count(*) AS c FROM product_mapping_pass
                GROUP BY ORDER_ID HAVING count(*) > 1
            )
            """
        ).fetchone()[0]

        conn.execute("CREATE OR REPLACE TABLE business_rules_results "
                      "(rule_code VARCHAR, description VARCHAR, checked_count BIGINT, "
                      "failed_count BIGINT, passed_count BIGINT)")
        results = [
            ("DQ-002", "No future-dated transactions", total_lines, future_dated, total_lines - future_dated),
            ("DQ-003", "SALES_AMOUNT >= 0", total_lines, negative_amount, total_lines - negative_amount),
            ("DQ-004", "ORDER_ID uniqueness", header_total, duplicate_order_ids, header_total - duplicate_order_ids),
        ]
        conn.executemany("INSERT INTO business_rules_results VALUES (?, ?, ?, ?, ?)", results)

        # -- Governance Gate, the other two branches: these rule violations don't block the
        # pipeline (business rules never quarantine), but under real policies they still get
        # governed and logged -- DQ-003 autonomously, DQ-002 by observation only.
        if negative_amount > 0:
            by_supplier = dict(conn.execute(
                "SELECT source_supplier, count(*) FROM business_rules_validated "
                "WHERE SALES_AMOUNT < 0 GROUP BY source_supplier"
            ).fetchall())
            governance.record_autonomous_action(
                event_id=governance.new_incident_id(context.run_id, prefix="AUTO"),
                policy_id="DQ-POL-018",
                supplier=", ".join(by_supplier) or None,
                evidence=f"{negative_amount} of {total_lines} line items have SALES_AMOUNT < 0 "
                f"(by supplier: {by_supplier}), consistent with refund/adjustment edge cases. "
                f"Accepted automatically within DQ-POL-018 policy bounds -- no pipeline impact.",
            )

        if future_dated > 0:
            by_supplier = dict(conn.execute(
                "SELECT source_supplier, count(*) FROM business_rules_validated "
                "WHERE ORDER_DATE > current_date GROUP BY source_supplier"
            ).fetchall())
            governance.record_observation(
                event_id=governance.new_incident_id(context.run_id, prefix="OBS"),
                policy_id="DQ-POL-019",
                supplier=", ".join(by_supplier) or None,
                evidence=f"{future_dated} of {total_lines} line items have a future-dated ORDER_DATE "
                f"(by supplier: {by_supplier}). Flagged for monitoring under DQ-POL-019; "
                f"no automatic remediation applied.",
            )

    return MaterializeResult(
        metadata={
            "future_dated_failures": MetadataValue.int(future_dated),
            "negative_amount_failures": MetadataValue.int(negative_amount),
            "duplicate_order_id_failures": MetadataValue.int(duplicate_order_ids),
        }
    )


@asset(deps=[business_rules_asset], compute_kind="duckdb")
def warehouse_load_asset(context: AssetExecutionContext) -> MaterializeResult:
    """Writes daily_sales_curated + exports parquet, then populates the
    quality_dimensions / dataset_rules history tables and closes out the
    incident with a final 'Resolved' audit_log row.
    """
    import os

    os.makedirs(CURATED_DIR, exist_ok=True)

    with get_connection() as conn:
        ensure_history_tables(conn)

        conn.execute("CREATE OR REPLACE TABLE daily_sales_curated AS SELECT * FROM business_rules_validated")
        conn.execute(
            f"COPY daily_sales_curated TO '{CURATED_PARQUET.replace(chr(92), '/')}' (FORMAT PARQUET)"
        )
        curated_count = conn.execute("SELECT count(*) FROM daily_sales_curated").fetchone()[0]

        landed = conn.execute("SELECT count(*) FROM landing_daily_sales").fetchone()[0]
        quarantined = conn.execute("SELECT count(*) FROM customer_validation_exception").fetchone()[0]
        continued = conn.execute("SELECT count(*) FROM customer_validation_pass").fetchone()[0]
        unmatched = conn.execute(
            "SELECT count(*) FROM product_mapping_pass WHERE PRODUCT_NAME IS NULL"
        ).fetchone()[0]
        mapped_total = conn.execute("SELECT count(*) FROM product_mapping_pass").fetchone()[0]
        rule_rows = conn.execute(
            "SELECT rule_code, description, checked_count, failed_count, passed_count "
            "FROM business_rules_results"
        ).fetchall()

        run_id = context.run_id
        now = datetime.datetime.utcnow()
        dataset = "daily_sales_curated"

        completeness = round(100.0 * continued / landed, 2) if landed else 100.0
        referential_integrity = (
            round(100.0 * (mapped_total - unmatched) / mapped_total, 2) if mapped_total else 100.0
        )
        total_rule_checks = sum(r[2] for r in rule_rows) or 1
        total_rule_failures = sum(r[3] for r in rule_rows)
        validity = round(100.0 * (total_rule_checks - total_rule_failures) / total_rule_checks, 2)
        duplicate_count = next((r[3] for r in rule_rows if r[0] == "DQ-004"), 0)
        header_total = next((r[2] for r in rule_rows if r[0] == "DQ-004"), 1) or 1
        uniqueness = round(100.0 * (header_total - duplicate_count) / header_total, 2)
        consistency = round((completeness + validity) / 2, 2)
        freshness = 100.0  # landed_at is always "now" for this local-file MVP

        dims = [
            (run_id, now, dataset, "Completeness", completeness),
            (run_id, now, dataset, "Validity", validity),
            (run_id, now, dataset, "Uniqueness", uniqueness),
            (run_id, now, dataset, "Consistency", consistency),
            (run_id, now, dataset, "Freshness", freshness),
            (run_id, now, dataset, "Referential Integrity", referential_integrity),
        ]
        conn.executemany(
            "INSERT INTO quality_dimensions (run_id, ts, dataset, dimension, score) VALUES (?, ?, ?, ?, ?)",
            dims,
        )

        rule_insert_rows = [
            (
                run_id, now, dataset, "DQ-001", "CUSTOMER_ID NOT NULL",
                "Failed" if quarantined else "Passed", quarantined, landed,
            )
        ] + [
            (run_id, now, dataset, code, desc, "Failed" if failed else "Passed", failed, checked)
            for code, desc, checked, failed, _passed in rule_rows
        ] + [
            (
                run_id, now, dataset, "DQ-005", "PRODUCT_CODE referential integrity",
                "Failed" if unmatched else "Passed", unmatched, mapped_total,
            )
        ]
        conn.executemany(
            "INSERT INTO dataset_rules (run_id, ts, dataset, rule_code, rule_description, status, "
            "affected_count, checked_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            rule_insert_rows,
        )

        # -- Score: real per-supplier scorecard recalculation for NorthStar Data / DataSphere,
        # the two suppliers this pipeline actually processes. Completeness reflects every landed
        # row (quarantined or not); referential integrity is scoped to continued rows only, since
        # quarantined rows never reach product_mapping_pass.
        completeness_by_supplier = dict(
            conn.execute(
                "SELECT source_supplier, "
                "100.0 * sum(CASE WHEN CUSTOMER_ID IS NOT NULL THEN 1 ELSE 0 END) / count(*) "
                "FROM landing_daily_sales GROUP BY source_supplier"
            ).fetchall()
        )
        referential_by_supplier = dict(
            conn.execute(
                "SELECT source_supplier, "
                "100.0 * sum(CASE WHEN PRODUCT_NAME IS NOT NULL THEN 1 ELSE 0 END) / count(*) "
                "FROM product_mapping_pass GROUP BY source_supplier"
            ).fetchall()
        )

        supplier_score_rows = []
        for supplier, completeness_pct in completeness_by_supplier.items():
            referential_pct = referential_by_supplier.get(supplier, 100.0)
            supplier_score = round((completeness_pct + referential_pct) / 2, 1)
            supplier_score_rows.append((
                run_id, now, supplier, round(completeness_pct, 1), round(referential_pct, 1),
                supplier_score, tier_for_score(supplier_score),
            ))
        conn.executemany(
            "INSERT INTO supplier_scores (run_id, ts, supplier, completeness, referential_integrity, "
            "score, tier) VALUES (?, ?, ?, ?, ?, ?, ?)",
            supplier_score_rows,
        )

        incident_id = (context.dagster_run.tags or {}).get("incident_id", "unknown")
        conn.execute(
            "INSERT INTO audit_log (ts, agent, action, incident_id, supplier, policy, mode, "
            "approver, decision, result, evidence, env) VALUES "
            "(current_timestamp, 'ETL Resolution Agent', 'Resolved', ?, NULL, 'DQ-POL-017', "
            "'Human Approval Required', NULL, NULL, ?, ?, 'Production')",
            [
                incident_id,
                f"quarantined={quarantined}, continued={continued}, curated_rows={curated_count}",
                f"Pipeline resumed after approval. {quarantined} records quarantined under DQ-001, "
                f"{continued} records continued through to daily_sales_curated ({curated_count} line items "
                f"after grain normalization). Data quality dimensions, rule results, and supplier scores "
                f"recorded for this run.",
            ],
        )

    return MaterializeResult(
        metadata={
            "supplier_scores": MetadataValue.text(str({r[2]: r[5] for r in supplier_score_rows})),
            "curated_row_count": MetadataValue.int(curated_count),
            "quarantined_count": MetadataValue.int(quarantined),
            "continued_count": MetadataValue.int(continued),
            "parquet_path": MetadataValue.path(CURATED_PARQUET),
        }
    )
