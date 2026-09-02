"""Shared DuckDB connection + path constants.

Single persistent file, opened fresh and closed per asset/function call so that
Dagster's multiprocess executor (each asset can run in its own process) never
collides on DuckDB's single-writer file lock.
"""
import contextlib
import os

import duckdb

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT_DIR, "sales_pipeline.duckdb")
SAMPLES_DIR = os.path.join(ROOT_DIR, "data", "samples")
CURATED_DIR = os.path.join(ROOT_DIR, "data", "curated")

NORTHSTAR_CSV = os.path.join(SAMPLES_DIR, "northstar_sales.csv")
DATASPHERE_JSONL = os.path.join(SAMPLES_DIR, "datasphere_sales.jsonl")
CURATED_PARQUET = os.path.join(CURATED_DIR, "daily_sales_curated.parquet")


@contextlib.contextmanager
def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = duckdb.connect(DB_PATH)
    try:
        yield conn
    finally:
        conn.close()


def ensure_governance_tables(conn):
    """approvals / audit_log persist across runs -- INSERT only, never CREATE OR REPLACE."""
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS approvals (
            incident_id TEXT,
            pipeline TEXT,
            stage TEXT,
            status TEXT DEFAULT 'pending',
            approver TEXT,
            decided_at TIMESTAMP
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS audit_log (
            ts TIMESTAMP,
            agent TEXT,
            action TEXT,
            incident_id TEXT,
            supplier TEXT,
            policy TEXT,
            mode TEXT,
            approver TEXT,
            decision TEXT,
            result TEXT,
            evidence TEXT,
            env TEXT
        )
        """
    )


def ensure_history_tables(conn):
    """quality_dimensions / dataset_rules persist across runs -- INSERT only."""
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS quality_dimensions (
            run_id TEXT,
            ts TIMESTAMP,
            dataset TEXT,
            dimension TEXT,
            score DOUBLE
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS dataset_rules (
            run_id TEXT,
            ts TIMESTAMP,
            dataset TEXT,
            rule_code TEXT,
            rule_description TEXT,
            status TEXT,
            affected_count BIGINT,
            checked_count BIGINT
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS supplier_scores (
            run_id TEXT,
            ts TIMESTAMP,
            supplier TEXT,
            completeness DOUBLE,
            referential_integrity DOUBLE,
            score DOUBLE,
            tier TEXT
        )
        """
    )
