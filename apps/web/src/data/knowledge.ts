export type KbArticle = {
  id: string
  type: string
  title: string
  when: string
  tag: string
}

export const KB_ARTICLES: KbArticle[] = [
  { id: "INC-10482", type: "ServiceNow Incident", title: "SALES_DAILY_ETL, Customer Validation failure, CUSTOMER_ID NULL, DataSphere", when: "2026-07-31", tag: "Resolved" },
  { id: "INC-09821", type: "ServiceNow Incident", title: "SALES_DAILY_ETL, Customer Validation failure, CUSTOMER_ID NULL, Apex Data", when: "2026-07-16", tag: "Resolved" },
  { id: "INC-08741", type: "Jira Ticket", title: "Standardize the quarantine-and-continue pattern for NULL natural-key violations", when: "2026-05-02", tag: "Done" },
  { id: "RB-CustValidation-07", type: "Runbook", title: "Runbook: Customer Validation stage NULL and referential failures", when: "v3, 2026-06-11", tag: "Active" },
  { id: "RB-VolumeAnomaly-03", type: "Runbook", title: "Runbook: Abnormal source volume deviation, ETL hold procedure", when: "v2, 2026-04-22", tag: "Active" },
  { id: "SOP-DATAINTAKE-004", type: "SOP", title: "SOP: Supplier missing or late feed escalation process", when: "v5, 2026-03-09", tag: "Active" },
  { id: "RCA-2026-0512", type: "RCA Document", title: "RCA: GlobalFeeds late delivery pattern, second quarter 2026", when: "2026-05-12", tag: "Closed" },
  { id: "RCA-2026-0218", type: "RCA Document", title: "RCA: NorthStar partial extraction incident, February 2026", when: "2026-02-18", tag: "Closed" },
  { id: "LOG-AF-4471", type: "Pipeline Log", title: "Airflow run log, SALES_DAILY_ETL run 4471, 2026-09-01", when: "Today", tag: "Live" },
  { id: "LOG-AF-4102", type: "Pipeline Log", title: "Airflow run log, SALES_DAILY_ETL run 4102, INC-10482", when: "2026-07-31", tag: "Archived" },
]

export type Policy = {
  id: string
  title: string
  version: string
  owner: string
  effective: string
  approval: string
  pipelines: string
  body: string
}

export const POLICIES: Policy[] = [
  { id: "DQ-POL-017", title: "Customer Validation quarantine and continue policy", version: "v2.1", owner: "Data Governance Council", effective: "2026-06-01", approval: "Human Approval Required per execution", pipelines: "SALES_DAILY_ETL, CUSTOMER_MASTER_ETL",
    body: "If rejected records are below 0.5 percent of the total batch and the failure is caused by missing optional customer attributes, records may be quarantined into the pipeline exception table and processing may continue after human approval." },
  { id: "DQ-POL-004", title: "Supplier missing or late feed escalation policy", version: "v3.0", owner: "Supplier Management", effective: "2026-03-09", approval: "Human Approval Required for vendor communication", pipelines: "All supplier intake pipelines",
    body: "When a feed is not received within its SLA window, the Data Intake Agent may issue a monitoring flag automatically. Formal vendor escalation and communication requires human approval and is logged with the exact message sent." },
  { id: "DQ-POL-011", title: "Non-breaking schema drift acceptance policy", version: "v1.4", owner: "Data Governance Council", effective: "2026-04-22", approval: "Policy-Controlled Autonomous for additive changes only", pipelines: "All managed pipelines",
    body: "Additive, non-breaking schema changes such as new optional columns may be accepted automatically and logged. Any change that removes, renames or retypes an existing column requires human approval before acceptance." },
]

export type ConnectedSource = {
  name: string
  status: string
  indexed: string
  sync: string
  owner: string
}

export const SOURCES: ConnectedSource[] = [
  { name: "ServiceNow", status: "Connected", indexed: "4,812 incidents", sync: "06:58 IST", owner: "Production Support" },
  { name: "Jira", status: "Connected", indexed: "1,340 tickets", sync: "06:58 IST", owner: "Data Engineering" },
  { name: "Confluence", status: "Connected", indexed: "286 pages", sync: "05:30 IST", owner: "Data Governance Council" },
  { name: "Runbooks", status: "Connected", indexed: "42 runbooks", sync: "05:30 IST", owner: "Production Support" },
  { name: "SOPs", status: "Connected", indexed: "18 documents", sync: "05:30 IST", owner: "Data Governance Council" },
  { name: "RCA Repository", status: "Connected", indexed: "96 reports", sync: "05:30 IST", owner: "Data Governance Council" },
  { name: "Pipeline Documentation", status: "Connected", indexed: "71 pipelines", sync: "06:58 IST", owner: "Data Engineering" },
  { name: "Data Quality Rules", status: "Connected", indexed: "3,842 rules", sync: "07:41 IST", owner: "Data Governance Council" },
  { name: "Supplier SLAs", status: "Connected", indexed: "27 agreements", sync: "05:30 IST", owner: "Supplier Management" },
]

export type AppNotification = {
  id: string
  sev: "critical" | "high" | "medium"
  title: string
  meta: string
  path: string
}

export const NOTIFICATIONS: AppNotification[] = [
  { id: "notif-northstar", sev: "critical", title: "NorthStar Data, critical volume anomaly", meta: "Detected 06:18 IST", path: "/incidents/northstar" },
  { id: "notif-etl", sev: "high", title: "SALES_DAILY_ETL, Customer Validation failure awaiting approval", meta: "Detected 07:02 IST", path: "/incidents/etl" },
  { id: "notif-globalfeeds", sev: "medium", title: "GlobalFeeds reliability score declining", meta: "Rolling 30-day analysis", path: "/scorecards?open=globalfeeds" },
]
