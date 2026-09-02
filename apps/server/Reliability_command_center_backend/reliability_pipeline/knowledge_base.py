"""Static precedent used as LLM context -- mirrors the 91%/84%/78% historical-match
pattern shown in the command-center.html prototype's ETL_INCIDENT. This is reference
data fed into the prompt, not the generated evidence text itself.
"""

SIMILAR_INCIDENTS = [
    {
        "incident_id": "INC-2025-0417",
        "summary": "DataSphere feed dropped CUSTOMER_ID on 1,102 records after a "
        "supplier-side schema migration; root cause was a null-default column "
        "added upstream. Resolved via quarantine-and-continue under DQ-POL-017.",
        "similarity": 0.91,
    },
    {
        "incident_id": "INC-2025-0289",
        "summary": "NorthStar Data batch export truncated the customer join key for "
        "orders placed via the legacy POS terminal path. Resolved via quarantine-and-continue, "
        "supplier notified to patch the terminal export job.",
        "similarity": 0.84,
    },
    {
        "incident_id": "INC-2024-1163",
        "summary": "DataSphere JSON Lines feed emitted empty-string CUSTOMER_ID for "
        "guest-checkout orders that predate the loyalty-ID requirement. Resolved via "
        "quarantine-and-continue; guest-checkout orders permanently excluded from CUSTOMER_ID rule.",
        "similarity": 0.78,
    },
]
