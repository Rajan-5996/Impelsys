"""Static reference data for everything command-center.html renders that is
explicitly out of scope for the real pipeline build (README section 6/9):
the other 11 suppliers, the 2 non-ETL agents, policies, knowledge base, and
the 4 non-SALES_DAILY_ETL curated datasets.

Anything about NorthStar Data, DataSphere, or SALES_DAILY_ETL / daily_sales_curated
is served from real DuckDB tables instead (see routers/*.py) -- this module only
back-fills the surrounding screens so the prototype's UI has something to bind to
everywhere, per README section 4/7.
"""

QUALITY_DIMENSIONS = [
    "Completeness",
    "Validity",
    "Uniqueness",
    "Consistency",
    "Freshness",
    "Referential Integrity",
]

# -- Suppliers (12 total: NorthStar + DataSphere are real, backed by landing_daily_sales;
#    the other 10 are static mock fixtures matching the prototype's supplier table shape) --
SUPPLIERS = [
    {
        "id": "SUP-001", "name": "NorthStar Data", "region": "NA", "deliveryMethod": "SFTP",
        "sla": "Daily 06:00 UTC", "volumeBaseline": 1450, "score": 91, "tier": "Preferred",
        "healthStatus": "Volume Anomaly", "isReal": True,
    },
    {
        "id": "SUP-002", "name": "DataSphere", "region": "EMEA", "deliveryMethod": "API",
        "sla": "Daily 04:00 UTC", "volumeBaseline": 1200, "score": 78, "tier": "Approved",
        "healthStatus": "Under Investigation", "isReal": True,
    },
    {
        "id": "SUP-003", "name": "GlobalFeeds Logistics", "region": "APAC", "deliveryMethod": "SFTP",
        "sla": "Daily 08:00 UTC", "volumeBaseline": 2100, "score": 62, "tier": "At Risk",
        "healthStatus": "Missing Feed", "isReal": False,
    },
    {
        "id": "SUP-004", "name": "Meridian Retail Systems", "region": "NA", "deliveryMethod": "API",
        "sla": "Daily 05:00 UTC", "volumeBaseline": 980, "score": 88, "tier": "Preferred",
        "healthStatus": "Healthy", "isReal": False,
    },
    {
        "id": "SUP-005", "name": "Cascadia POS Network", "region": "NA", "deliveryMethod": "SFTP",
        "sla": "Daily 07:00 UTC", "volumeBaseline": 760, "score": 84, "tier": "Approved",
        "healthStatus": "Healthy", "isReal": False,
    },
    {
        "id": "SUP-006", "name": "Ibex Clickstream", "region": "EMEA", "deliveryMethod": "API",
        "sla": "Hourly", "volumeBaseline": 45000, "score": 73, "tier": "Monitor",
        "healthStatus": "Schema Change", "isReal": False,
    },
    {
        "id": "SUP-007", "name": "Orbital Fulfillment Co", "region": "APAC", "deliveryMethod": "API",
        "sla": "Daily 09:00 UTC", "volumeBaseline": 1340, "score": 90, "tier": "Preferred",
        "healthStatus": "Healthy", "isReal": False,
    },
    {
        "id": "SUP-008", "name": "Vantage Product Catalog", "region": "NA", "deliveryMethod": "SFTP",
        "sla": "Weekly Mon 03:00 UTC", "volumeBaseline": 320, "score": 95, "tier": "Preferred",
        "healthStatus": "Healthy", "isReal": False,
    },
    {
        "id": "SUP-009", "name": "Redwood Freight Data", "region": "LATAM", "deliveryMethod": "SFTP",
        "sla": "Daily 10:00 UTC", "volumeBaseline": 540, "score": 67, "tier": "At Risk",
        "healthStatus": "Delayed", "isReal": False,
    },
    {
        "id": "SUP-010", "name": "Solstice Marketplace Feed", "region": "EMEA", "deliveryMethod": "API",
        "sla": "Daily 06:30 UTC", "volumeBaseline": 1890, "score": 81, "tier": "Approved",
        "healthStatus": "Healthy", "isReal": False,
    },
    {
        "id": "SUP-011", "name": "Ferrovia Logistics", "region": "LATAM", "deliveryMethod": "API",
        "sla": "Daily 11:00 UTC", "volumeBaseline": 610, "score": 58, "tier": "At Risk",
        "healthStatus": "Duplicate Feed", "isReal": False,
    },
    {
        "id": "SUP-012", "name": "Highline Wholesale Data", "region": "NA", "deliveryMethod": "SFTP",
        "sla": "Daily 05:30 UTC", "volumeBaseline": 1020, "score": 86, "tier": "Approved",
        "healthStatus": "Healthy", "isReal": False,
    },
]

# -- Mock incident: NorthStar volume anomaly. Real supplier connectors/SLA monitoring are
#    out of scope, so this stays a static fixture (unlike the ETL incident, which is real). --
NORTHSTAR_INCIDENT = {
    "id": "INC-NORTHSTAR-VOL-001",
    "title": "NorthStar Data volume anomaly",
    "supplier": "NorthStar Data",
    "pipeline": None,
    "stage": None,
    "severity": "High",
    "status": "Awaiting Approval",
    "governanceMode": "Human Approval Required",
    "policy": "DQ-POL-004",
    "confidence": 0.83,
    "riskRating": "MEDIUM",
    "evidence": (
        "Today's feed arrived on time (05:58 UTC) but carried 310 records against a "
        "90-day baseline of 1,450 (-78.6%). No schema drift detected. Pattern matches a "
        "partial-file delivery rather than a full outage."
    ),
    "recommendation": "Request supplier re-delivery of the full batch before downstream processing.",
    "historicalMatches": [
        {"incidentId": "INC-2025-0201", "similarity": 0.87, "summary": "NorthStar partial SFTP upload truncated by a connection timeout; resolved via re-delivery."},
        {"incidentId": "INC-2024-0876", "similarity": 0.71, "summary": "NorthStar batch job failure emitted a partial file with a success marker; resolved via re-delivery + monitoring alert added."},
    ],
}

GLOBALFEEDS_ALERT = {
    "id": "INC-GLOBALFEEDS-MISS-001",
    "title": "GlobalFeeds Logistics missing feed",
    "supplier": "GlobalFeeds Logistics",
    "pipeline": None,
    "stage": None,
    "severity": "Medium",
    "status": "Observed",
    "governanceMode": "Observe Only",
    "policy": "DQ-POL-011",
    "confidence": 0.95,
    "riskRating": "LOW",
    "evidence": "No feed received by SLA cutoff (08:00 UTC). Supplier notified automatically; no downstream data quality impact yet.",
    "recommendation": "Monitor for late delivery within the 4-hour grace window before escalating.",
    "historicalMatches": [],
}

AGENTS = [
    {
        "id": "AGENT-INTAKE", "name": "Data Intake & Anomaly Detection Agent",
        "scope": "Monitors scheduled supplier feeds against a learned 90-day baseline",
        "governanceMode": "Human Approval Required", "status": "Active",
        "currentTask": "Evaluating NorthStar Data volume anomaly",
        "actionsToday": 14, "successRate": 0.96, "avgResolutionTimeMinutes": 22,
    },
    {
        "id": "AGENT-ETL", "name": "ETL Resolution Agent",
        "scope": "Diagnoses pipeline stage failures, correlates against past incidents, proposes remediation",
        "governanceMode": "Human Approval Required", "status": "Active",
        "currentTask": "SALES_DAILY_ETL customer_validation_asset remediation",
        "actionsToday": 6, "successRate": 0.99, "avgResolutionTimeMinutes": 4,
    },
    {
        "id": "AGENT-DQ", "name": "Data Quality & Supplier Intelligence Agent",
        "scope": "Post-ETL quality scoring and supplier scorecard maintenance",
        "governanceMode": "Observe Only", "status": "Active",
        "currentTask": "Recalculating supplier scorecards",
        "actionsToday": 31, "successRate": 1.0, "avgResolutionTimeMinutes": 1,
    },
]

POLICIES = [
    {
        "id": "DQ-POL-017", "title": "Quarantine-and-continue on CUSTOMER_ID violations",
        "version": "1.3", "owner": "DataOps Governance", "effectiveDate": "2025-11-01",
        "approvalMode": "Human Approval Required",
        "applicablePipelines": ["SALES_DAILY_ETL"],
        "body": "When CUSTOMER_ID NOT NULL (DQ-001) fails on a batch, quarantine the "
        "affected records and continue processing the remainder, subject to human approval.",
    },
    {
        "id": "DQ-POL-004", "title": "Supplier volume anomaly re-delivery request",
        "version": "1.1", "owner": "Supplier Operations", "effectiveDate": "2025-08-15",
        "approvalMode": "Human Approval Required",
        "applicablePipelines": ["SALES_DAILY_ETL", "INVENTORY_DAILY_ETL"],
        "body": "When a feed's volume deviates more than 40% from its 90-day baseline with no "
        "schema drift, request supplier re-delivery before processing.",
    },
    {
        "id": "DQ-POL-011", "title": "Missing feed observation window",
        "version": "1.0", "owner": "Supplier Operations", "effectiveDate": "2025-06-01",
        "approvalMode": "Observe Only",
        "applicablePipelines": ["ALL"],
        "body": "Feeds not received within a 4-hour grace window past SLA are logged and "
        "the supplier notified automatically; no pipeline action is taken.",
    },
    {
        # Real -- reliability_pipeline/policies.py is the code-driving copy business_rules_asset
        # actually reads from; this entry mirrors it for API/UI display.
        "id": "DQ-POL-018", "title": "Auto-accept SALES_AMOUNT refund/adjustment edge cases",
        "version": "1.0", "owner": "DataOps Governance", "effectiveDate": "2026-01-01",
        "approvalMode": "Policy-Controlled Autonomous",
        "applicablePipelines": ["SALES_DAILY_ETL"],
        "body": "When SALES_AMOUNT < 0 (DQ-003) violations are within policy bounds, accept them "
        "automatically as refund/adjustment edge cases -- no human approval required, no pipeline impact.",
    },
    {
        # Real -- see reliability_pipeline/policies.py.
        "id": "DQ-POL-019", "title": "Future-dated transaction observation",
        "version": "1.0", "owner": "DataOps Governance", "effectiveDate": "2026-01-01",
        "approvalMode": "Observe Only",
        "applicablePipelines": ["SALES_DAILY_ETL"],
        "body": "When TRANSACTION_DATE / ORDER_DATE is future-dated (DQ-002), flag and monitor -- "
        "no automatic remediation, no human approval needed.",
    },
]

KNOWLEDGE_SOURCES = [
    {"id": "KS-1", "name": "ServiceNow", "status": "Connected", "documentsIndexed": 482, "lastSync": "2026-09-01T06:00:00Z", "owner": "IT Ops"},
    {"id": "KS-2", "name": "Jira", "status": "Connected", "documentsIndexed": 219, "lastSync": "2026-09-01T06:00:00Z", "owner": "DataOps"},
    {"id": "KS-3", "name": "Runbook Library", "status": "Connected", "documentsIndexed": 37, "lastSync": "2026-08-31T22:00:00Z", "owner": "DataOps Governance"},
]

KNOWLEDGE_BASE_ARTICLES = [
    {"id": "KB-1", "title": "DQ-001 CUSTOMER_ID NOT NULL -- runbook", "type": "Runbook",
     "summary": "Standard triage and quarantine-and-continue remediation steps for CUSTOMER_ID violations across supplier feeds."},
    {"id": "KB-2", "title": "NorthStar Data vendor communication log", "type": "Vendor Log",
     "summary": "History of delivery incidents and remediation communications with NorthStar Data."},
    {"id": "KB-3", "title": "DataSphere schema migration history", "type": "Vendor Log",
     "summary": "Timeline of DataSphere's upstream schema changes and their downstream data quality impact."},
]

# -- The 4 non-SALES_DAILY_ETL curated datasets (mock -- those pipelines are out of scope).
#    daily_sales_curated is real and served from dataset_rules/quality_dimensions instead. --
OTHER_DATASETS = [
    {"id": "inventory_daily_curated", "name": "Inventory Daily Curated", "score": 94, "recordCount": 182000, "rulesTotal": 5, "passed": 5, "warning": 0, "failed": 0},
    {"id": "logistics_events_curated", "name": "Logistics Events Curated", "score": 88, "recordCount": 96000, "rulesTotal": 4, "passed": 3, "warning": 1, "failed": 0},
    {"id": "clickstream_sessions_curated", "name": "Clickstream Sessions Curated", "score": 76, "recordCount": 5400000, "rulesTotal": 6, "passed": 4, "warning": 1, "failed": 1},
    {"id": "pos_transactions_curated", "name": "POS Transactions Curated", "score": 91, "recordCount": 410000, "rulesTotal": 5, "passed": 5, "warning": 0, "failed": 0},
]

KPI_DEFS = [
    {"id": "kpi-active-incidents", "label": "Active Incidents"},
    {"id": "kpi-pending-approvals", "label": "Pending Approvals"},
    {"id": "kpi-suppliers-at-risk", "label": "Suppliers At Risk"},
    {"id": "kpi-avg-quality-score", "label": "Avg Data Quality Score"},
]

SETTINGS = {
    "governanceDefaults": {
        "Data Intake & Anomaly Detection Agent": "Human Approval Required",
        "ETL Resolution Agent": "Human Approval Required",
        "Data Quality & Supplier Intelligence Agent": "Observe Only",
    },
    "connectedSystems": [s["name"] for s in KNOWLEDGE_SOURCES],
    "notificationPreferences": {"email": True, "slack": False, "servicenow": False},
    "environment": "Production",
    "dataRetention": {"logsMonths": 13, "auditRetention": "Indefinite"},
}
