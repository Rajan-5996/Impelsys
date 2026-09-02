export type PipelineStageStatus = "done" | "fail" | "blocked" | "running"

export type PipelineStage = {
  name: string
  status: PipelineStageStatus
  recordsIn: number
  recordsOut: number
  duration: string
  errors: number
  updated: string
}

export const PIPELINE_STAGE_NAMES = [
  "Landing",
  "Schema Validation",
  "Customer Validation",
  "Product Mapping",
  "Transformation",
  "Business Rules",
  "Warehouse Load",
]

export const PIPELINE_STAGES_INIT: PipelineStage[] = [
  { name: "Landing", status: "done", recordsIn: 1021443, recordsOut: 1021443, duration: "0m 42s", errors: 0, updated: "07:02:10" },
  { name: "Schema Validation", status: "done", recordsIn: 1021443, recordsOut: 1021443, duration: "0m 18s", errors: 0, updated: "07:02:52" },
  { name: "Customer Validation", status: "fail", recordsIn: 1021443, recordsOut: 1020195, duration: "0m 51s", errors: 1248, updated: "07:03:41" },
  { name: "Product Mapping", status: "blocked", recordsIn: 0, recordsOut: 0, duration: "Not started", errors: 0, updated: "Not started" },
  { name: "Transformation", status: "blocked", recordsIn: 0, recordsOut: 0, duration: "Not started", errors: 0, updated: "Not started" },
  { name: "Business Rules", status: "blocked", recordsIn: 0, recordsOut: 0, duration: "Not started", errors: 0, updated: "Not started" },
  { name: "Warehouse Load", status: "blocked", recordsIn: 0, recordsOut: 0, duration: "Not started", errors: 0, updated: "Not started" },
]

export type IncidentTimelineStep = {
  label: string
  state: "pass" | "fail" | "pending"
  result: string
}

export type NorthstarIncident = {
  id: string
  agent: string
  agentFull: string
  supplier: string
  feed: string
  pipeline: string
  severity: "Critical"
  status: string
  detected: string
  assignedTeam: string
  owner: string
  businessImpact: string
  slaMinutes: number
  expectedArrival: string
  expectedVolume: string
  normalRange: string
  received: string
  actual: string
  deviation: string
  similarEventCount: number
  timeline: IncidentTimelineStep[]
  conclusion: string
  confidence: number
  action: string
  checks: string[]
  systems: string[]
  govMode: string
  humanDecision: string
}

export const NORTHSTAR_INCIDENT: NorthstarIncident = {
  id: "INC-2026-0901-01", agent: "Data Intake Agent", agentFull: "Data Intake and Anomaly Detection Agent", supplier: "NorthStar Data", feed: "Daily Sales Feed", pipeline: "SALES_DAILY_ETL",
  severity: "Critical", status: "Investigation Completed", detected: "06:18 IST", assignedTeam: "Supplier Data Operations", owner: "Supplier Data Operations",
  businessImpact: "Sales reporting may be incomplete for 2026-09-01 until the feed is re-delivered and reprocessed.",
  slaMinutes: 42,
  expectedArrival: "06:15", expectedVolume: "1,020,000", normalRange: "950,000 to 1,100,000", received: "06:12", actual: "218,431", deviation: "-78.6%", similarEventCount: 2,
  timeline: [
    { label: "File Received", state: "pass", result: "Passed, 06:12 IST" },
    { label: "SFTP Transfer", state: "pass", result: "Passed, transfer verified" },
    { label: "File Integrity", state: "pass", result: "Passed, checksum matched manifest" },
    { label: "Schema Validation", state: "pass", result: "Passed, 42 of 42 expected columns" },
    { label: "Landing", state: "pass", result: "Passed, file landed to raw zone" },
    { label: "Record Volume", state: "fail", result: "Failed, 218,431 vs 1.02M expected" },
    { label: "ETL", state: "pending", result: "Not started, held by policy gate" },
  ],
  conclusion: "Source file contains significantly fewer records than expected. Likely source is supplier-side incomplete extraction.",
  confidence: 94, action: "Request supplier re-delivery. Contact NorthStar Data and request validation and re-delivery of the Daily Sales Feed for 2026-09-01.",
  checks: [
    "Compared arrival timestamp against the 90-day learned delivery window of 06:15, plus or minus 8 minutes",
    "Verified the SFTP transfer log: 0 retries, 0 byte loss",
    "Recomputed the file checksum against the supplier manifest: match confirmed",
    "Diffed schema against registered contract v14: 42 of 42 columns present, 0 drift",
    "Compared record count against the 90-day volume model, mean 1.02M, standard deviation 42K: 19.1 standard deviations below mean",
    "Checked for duplicate or partial delivery flags on the SFTP session: none found",
  ],
  systems: ["SFTP Gateway audit log", "Landing zone metadata catalog", "Schema Registry, contract v14", "Historical volume model, 90-day rolling", "ServiceNow, no open ticket found for NorthStar"],
  govMode: "Human Approval Required", humanDecision: "Pending",
}

export type SimilarIncident = {
  id: string
  pct: number
  date: string
  supplier: string
  pipeline: string
  failure: string
  rootCause: string
  resolution: string
  outcome: string
}

export type EtlIncident = {
  id: string
  agent: string
  agentFull: string
  pipeline: string
  supplier: string
  stage: string
  error: string
  affected: number
  total: number
  valid: number
  severity: "High"
  status: string
  detected: string
  assignedTeam: string
  owner: string
  businessImpact: string
  slaMinutes: number
  note: string
  policy: string
  historicalSuccessRate: number
  similar: SimilarIncident[]
  recommendation: string
  confidence: number
  risk: string
  checks: string[]
  systems: string[]
  govMode: string
  humanDecision: string
}

export const ETL_INCIDENT: EtlIncident = {
  id: "INC-2026-0901-02", agent: "ETL Resolution Agent", agentFull: "ETL Incident Resolution Agent", pipeline: "SALES_DAILY_ETL", supplier: "DataSphere",
  stage: "Customer Validation", error: "CUSTOMER_ID cannot be NULL", affected: 1248, total: 1021443, valid: 1020195,
  severity: "High", status: "Open", detected: "07:02 IST", assignedTeam: "Data Engineering, Production Support", owner: "Data Engineering, Production Support",
  businessImpact: "Downstream sales reporting for the affected batch is delayed until Customer Validation clears.",
  slaMinutes: 15,
  note: "SALES_DAILY_ETL consolidates DataSphere's approximately 847,000 order header records into 1,021,443 line item grain transaction rows during normalization. The failure count below is measured at line item grain.",
  policy: "DQ-POL-017", historicalSuccessRate: 98.4,
  similar: [
    { id: "INC-10482", pct: 91, date: "2026-07-31", supplier: "DataSphere", pipeline: "SALES_DAILY_ETL", failure: "CUSTOMER_ID cannot be NULL, 1,192 records", rootCause: "Upstream extract omitted the customer key for a subset of orders during the DataSphere batch export.", resolution: "Quarantined 1,192 records into CUSTOMER_VALIDATION_EXCEPTION and continued processing.", outcome: "Resolved in 11 minutes, zero downstream impact." },
    { id: "INC-09821", pct: 84, date: "2026-07-16", supplier: "Apex Data", pipeline: "SALES_DAILY_ETL", failure: "CUSTOMER_ID cannot be NULL, 912 records", rootCause: "Test records without a customer assignment were included in the production extract.", resolution: "Quarantined 912 records using runbook RB-CustValidation-07 and continued processing.", outcome: "Resolved in 9 minutes, zero downstream impact." },
    { id: "INC-08741", pct: 78, date: "2026-05-02", supplier: "Cross-pipeline", pipeline: "CUSTOMER_MASTER_ETL", failure: "NULL natural-key violation on customer linkage", rootCause: "Recurring pattern across customer-linked pipelines when an upstream source omits the natural key.", resolution: "Quarantine-and-continue pattern formalized as policy DQ-POL-017.", outcome: "Adopted as the standing policy for all customer-linked pipelines." },
  ],
  recommendation: "Quarantine 1,248 invalid records into CUSTOMER_VALIDATION_EXCEPTION and continue processing 1,020,195 valid records.",
  confidence: 96, risk: "Low",
  checks: [
    "Parsed the pipeline failure log for SALES_DAILY_ETL run 4471",
    "Isolated 1,248 records failing the NOT NULL constraint on CUSTOMER_ID",
    "Confirmed all 1,248 records originate from a single DataSphere batch, batch ID 20260901-07",
    "Verified downstream Product Mapping, Transformation and Business Rules stages have zero dependency on the affected records",
    "Searched the enterprise knowledge base: ServiceNow, Jira, runbooks, SOPs, prior RCAs and pipeline logs",
    "Simulated quarantine-and-continue against a staging replica: 0 referential integrity errors introduced",
  ],
  systems: ["ServiceNow Incident Management, 3 matches", "Jira, DATA project", "Runbook library, RB-CustValidation-07", "Pipeline orchestration logs, Airflow", "Data warehouse staging replica"],
  govMode: "Human Approval Required", humanDecision: "Pending",
}

export type GlobalfeedsAlert = {
  id: string
  agent: string
  agentFull: string
  supplier: string
  severity: "Medium"
  detected: string
  owner: string
  businessImpact: string
  insight: string
  detail: string
  checks: string[]
  govMode: string
  humanDecision: string
}

export const GLOBALFEEDS_ALERT: GlobalfeedsAlert = {
  id: "ALERT-2026-0901-03", agent: "Data Quality Agent", agentFull: "Data Quality and Supplier Intelligence Agent", supplier: "GlobalFeeds", severity: "Medium",
  detected: "Rolling 30-day analysis, last recomputed 06:05 IST", owner: "Supplier Management",
  businessImpact: "Continued decline risks a formal tier downgrade at the next scheduled scorecard review.",
  insight: "GlobalFeeds reliability has declined over the last 30 days. The primary drivers are increased delivery delays and repeated PRODUCT_CODE validation failures. Supplier review is recommended.",
  detail: "Delivery reliability fell as 7 feeds arrived late or were missed against SLA in the last 30 days, 3 of those in the last week alone. PRODUCT_CODE validation failures against Product Master rose from roughly 0.4 percent to 2.0 percent of records, pulling down Validity and Referential Integrity. The Data Quality Agent recommends a formal supplier review before the next tier reassessment.",
  checks: [
    "Compared 30-day delivery timestamps against the SLA window of 06:00",
    "Recomputed the PRODUCT_CODE match rate against Product Master across the last 30 runs",
    "Correlated the timing pattern with GlobalFeeds' upstream ERP migration, self-reported on 2026-08-04",
  ],
  govMode: "Observe Only", humanDecision: "Not applicable",
}
