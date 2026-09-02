"""The real policy store: governance.py and business_rules_asset read the
applicable governance mode from here instead of a hardcoded string, so the
Governance Gate's three modes are genuinely policy-driven rather than one
branch being the only one with code behind it.

DQ-POL-017 stays Human Approval Required by design -- that's the one real
incident this build proves out end-to-end (CUSTOMER_ID NOT NULL, quarantine-
and-continue). The other two modes get their own real, exercised policies
tied to business_rules_asset's existing checks, which previously just counted
violations without any governance action at all.
"""

POLICIES = {
    "DQ-POL-017": {
        "mode": "Human Approval Required",
        "rule_code": "DQ-001",
        "description": "CUSTOMER_ID NOT NULL -- quarantine-and-continue, human approval required per execution",
    },
    "DQ-POL-018": {
        "mode": "Policy-Controlled Autonomous",
        "rule_code": "DQ-003",
        "description": "SALES_AMOUNT >= 0 -- refund/adjustment edge cases are auto-accepted within policy bounds",
    },
    "DQ-POL-019": {
        "mode": "Observe Only",
        "rule_code": "DQ-002",
        "description": "No future-dated transactions -- flagged and monitored, no automatic remediation",
    },
}


def mode_for_policy(policy_id: str) -> str:
    return POLICIES.get(policy_id, {}).get("mode", "Human Approval Required")
