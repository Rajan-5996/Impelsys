"""Generates the two local sample supplier files (NorthStar CSV, DataSphere JSONL)
and defines the static reference data (expected_schema, product_master) seeded
into DuckDB by landing_asset / product_mapping_asset.

Run once via `python -m reliability_pipeline.seed_data` to (re)write the sample
files under data/samples/. The files are static fixtures checked into the repo,
not regenerated on every pipeline run.
"""
import datetime
import json
import os
import random

from .db import DATASPHERE_JSONL, NORTHSTAR_CSV, SAMPLES_DIR

random.seed(42)

REGIONS = ["NA", "EMEA", "APAC", "LATAM"]
CURRENCIES = {"NA": "USD", "EMEA": "EUR", "APAC": "USD", "LATAM": "USD"}

PRODUCT_MASTER = [
    {"PRODUCT_CODE": f"PC-{1000 + i}", "PRODUCT_NAME": name, "CATEGORY": category}
    for i, (name, category) in enumerate(
        [
            ("Wireless Mouse", "Peripherals"),
            ("Mechanical Keyboard", "Peripherals"),
            ("27in Monitor", "Displays"),
            ("USB-C Dock", "Accessories"),
            ("Laptop Stand", "Accessories"),
            ("Noise Cancelling Headset", "Audio"),
            ("Webcam 1080p", "Peripherals"),
            ("Desk Lamp", "Office"),
            ("Ergonomic Chair", "Furniture"),
            ("Standing Desk", "Furniture"),
            ("External SSD 1TB", "Storage"),
            ("Portable Charger", "Accessories"),
            ("HDMI Cable 2m", "Accessories"),
            ("Bluetooth Speaker", "Audio"),
            ("Cable Organizer Kit", "Accessories"),
        ]
    )
]
VALID_PRODUCT_CODES = [p["PRODUCT_CODE"] for p in PRODUCT_MASTER]
UNMATCHED_PRODUCT_CODES = ["PC-9001", "PC-9002", "PC-9003"]

# The columns landing_daily_sales is expected to have -- schema_validation_asset
# compares this against information_schema.columns each run.
EXPECTED_SCHEMA = [
    ("ORDER_ID", "VARCHAR"),
    ("ORDER_DATE", "DATE"),
    ("CUSTOMER_ID", "VARCHAR"),
    ("PRODUCT_CODE", "VARCHAR"),
    ("QUANTITY", "INTEGER"),
    ("UNIT_PRICE", "DOUBLE"),
    ("SALES_AMOUNT", "DOUBLE"),
    ("CURRENCY", "VARCHAR"),
    ("REGION", "VARCHAR"),
    ("LINE_ITEMS", "LIST"),
    ("source_supplier", "VARCHAR"),
    ("landed_at", "TIMESTAMP"),
]

TODAY = datetime.date.today()


def _order_date(offset_days: int) -> str:
    return (TODAY + datetime.timedelta(days=offset_days)).isoformat()


def _product_code(unmatched: bool) -> str:
    return random.choice(UNMATCHED_PRODUCT_CODES) if unmatched else random.choice(VALID_PRODUCT_CODES)


def generate_northstar_csv(path: str, n_orders: int = 150):
    """Pipe-delimited CSV, one line item per order (flat grain)."""
    rows = []
    duplicate_id = None
    for i in range(n_orders):
        order_id = f"NS-{100000 + i}"

        null_customer = i < 40  # first 40 orders: missing CUSTOMER_ID
        future_dated = 40 <= i < 42
        negative_amount = 42 <= i < 44
        unmatched_product = 44 <= i < 49
        force_duplicate = 49 <= i < 51

        if force_duplicate:
            if duplicate_id is None:
                duplicate_id = order_id
            else:
                order_id = duplicate_id  # reuse previous order_id -> uniqueness violation

        region = random.choice(REGIONS)
        quantity = random.randint(1, 5)
        unit_price = round(random.uniform(9.99, 249.99), 2)
        sales_amount = round(quantity * unit_price, 2)
        if negative_amount:
            sales_amount = -abs(sales_amount)

        rows.append(
            "|".join(
                [
                    order_id,
                    _order_date(random.randint(-30, 0) if not future_dated else random.randint(3, 7)),
                    "" if null_customer else f"CUST-{2000 + i}",
                    _product_code(unmatched_product),
                    str(quantity),
                    f"{unit_price:.2f}",
                    f"{sales_amount:.2f}",
                    CURRENCIES[region],
                    region,
                ]
            )
        )

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write("ORDER_ID|ORDER_DATE|CUSTOMER_ID|PRODUCT_CODE|QUANTITY|UNIT_PRICE|SALES_AMOUNT|CURRENCY|REGION\n")
        f.write("\n".join(rows) + "\n")


def generate_datasphere_jsonl(path: str, n_orders: int = 150):
    """JSON Lines, each order carries a nested line_items array (grain expansion later)."""
    lines = []
    duplicate_id = None
    for i in range(n_orders):
        order_id = f"DS-{200000 + i}"

        null_customer = i < 40
        future_dated = 40 <= i < 42
        negative_amount = 42 <= i < 44
        unmatched_product = 44 <= i < 49
        force_duplicate = 49 <= i < 51

        if force_duplicate:
            if duplicate_id is None:
                duplicate_id = order_id
            else:
                order_id = duplicate_id

        region = random.choice(REGIONS)
        n_lines = random.choices([1, 2, 3], weights=[0.45, 0.35, 0.20])[0]

        line_items = []
        for line_no in range(1, n_lines + 1):
            quantity = random.randint(1, 4)
            unit_price = round(random.uniform(9.99, 249.99), 2)
            sales_amount = round(quantity * unit_price, 2)
            if negative_amount and line_no == 1:
                sales_amount = -abs(sales_amount)
            line_items.append(
                {
                    "line_no": line_no,
                    "product_code": _product_code(unmatched_product and line_no == 1),
                    "quantity": quantity,
                    "unit_price": unit_price,
                    "sales_amount": sales_amount,
                }
            )

        record = {
            "order_id": order_id,
            "order_date": _order_date(random.randint(-30, 0) if not future_dated else random.randint(3, 7)),
            "customer_id": None if null_customer else f"CUST-{5000 + i}",
            "currency": CURRENCIES[region],
            "region": region,
            "line_items": line_items,
        }
        lines.append(json.dumps(record))

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")


def write_sample_files():
    os.makedirs(SAMPLES_DIR, exist_ok=True)
    generate_northstar_csv(NORTHSTAR_CSV)
    generate_datasphere_jsonl(DATASPHERE_JSONL)


if __name__ == "__main__":
    write_sample_files()
    print(f"Wrote {NORTHSTAR_CSV}")
    print(f"Wrote {DATASPHERE_JSONL}")
