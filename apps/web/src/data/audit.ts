export type AuditDecision = "Pending" | "Approved" | "Not applicable" | "Auto-approved"

export type AuditLogEntry = {
  id: string
  ts: string
  agent: string
  action: string
  incident: string
  supplier: string
  policy: string
  mode: string
  approver: string
  decision: AuditDecision
  result: string
  evidence: string
  reco: string
  env: string
}

export const AUDIT_LOG_SEED: AuditLogEntry[] = [
  { id: "audit-2026090106240", ts: "2026-09-01 06:24:00", agent: "Data Intake Agent", action: "Vendor notification", incident: "INC-2026-0901-01", supplier: "NorthStar Data", policy: "DQ-POL-004", mode: "Human Approval Required", approver: "Pending", decision: "Pending", result: "Awaiting human approval", evidence: "Volume deviation of -78.6 percent against the 90-day model", reco: "Contact NorthStar Data and request validation and re-delivery", env: "Production" },
  { id: "audit-2026083114020", ts: "2026-08-31 14:02:00", agent: "ETL Resolution Agent", action: "Quarantine and continue", incident: "INC-10482", supplier: "DataSphere", policy: "DQ-POL-017", mode: "Human Approval Required", approver: "Siva Ram Murugan", decision: "Approved", result: "Resolved, zero downstream impact", evidence: "Schema and data profiling on 1,192 NULL CUSTOMER_ID records", reco: "Quarantine and continue", env: "Production" },
  { id: "audit-2026082906240", ts: "2026-08-29 06:24:00", agent: "Data Intake Agent", action: "Delivery tolerance check", incident: "ALERT-8290-NS", supplier: "NorthStar Data", policy: "DQ-POL-004", mode: "Observe Only", approver: "Not applicable", decision: "Not applicable", result: "No action required", evidence: "Delivery 9 minutes late against the 06:15 SLA, within learned tolerance", reco: "Monitor, no action required", env: "Production" },
  { id: "audit-2026082211100", ts: "2026-08-22 11:10:00", agent: "Data Quality Agent", action: "Supplier escalation", incident: "DQ-FLAG-0822", supplier: "GlobalFeeds", policy: "DQ-POL-004", mode: "Human Approval Required", approver: "Siva Ram Murugan", decision: "Approved", result: "Acknowledged by vendor manager", evidence: "GlobalFeeds PRODUCT_CODE failure rate rose to 1.4 percent", reco: "Escalate to Supplier Management", env: "Production" },
  { id: "audit-2026081507550", ts: "2026-08-15 07:55:00", agent: "ETL Resolution Agent", action: "Quarantine and continue", incident: "INC-09821", supplier: "Apex Data", policy: "DQ-POL-017", mode: "Human Approval Required", approver: "Siva Ram Murugan", decision: "Approved", result: "Resolved, zero downstream impact", evidence: "912 CUSTOMER_ID NULLs in the Apex Data source batch", reco: "Quarantine and continue", env: "Production" },
  { id: "audit-2026081006310", ts: "2026-08-10 06:31:00", agent: "Data Intake Agent", action: "Vendor notification", incident: "ALERT-8100-GF", supplier: "GlobalFeeds", policy: "DQ-POL-004", mode: "Human Approval Required", approver: "Siva Ram Murugan", decision: "Approved", result: "Resolved, feed landed at 07:44", evidence: "GlobalFeeds file 38 minutes late against SLA", reco: "Escalate for an SLA breach", env: "Production" },
  { id: "audit-2026080509020", ts: "2026-08-05 09:02:00", agent: "Data Quality Agent", action: "Schema drift acceptance", incident: "DQ-SCHEMA-0805", supplier: "Redwood Analytics", policy: "DQ-POL-011", mode: "Policy-Controlled Autonomous", approver: "System (Policy-Controlled)", decision: "Auto-approved", result: "No pipeline impact", evidence: "Schema drift detected, 2 new optional columns, non-breaking", reco: "Accept schema, non-breaking", env: "Production" },
  { id: "audit-2026072808140", ts: "2026-07-28 08:14:00", agent: "ETL Resolution Agent", action: "Quarantine and continue", incident: "INC-08741", supplier: "Cross-pipeline", policy: "DQ-POL-017", mode: "Human Approval Required", approver: "Siva Ram Murugan", decision: "Approved", result: "Adopted as standing policy", evidence: "Recurring NULL natural-key violation pattern across customer-linked pipelines", reco: "Formalize quarantine-and-continue pattern", env: "Production" },
]
