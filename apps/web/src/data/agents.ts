export type AgentIcon = "server" | "cpu" | "eye"

export type Agent = {
  id: string
  name: string
  short: string
  status: string
  scope: string
  task: string
  lastAction: string
  actionsToday: number
  successRate: number
  avgResolution: string
  handled30d: number
  confidence: number
  awaiting: number
  govMode: string
  icon: AgentIcon
}

export const AGENTS: Agent[] = [
  { id: "intake", name: "Data Intake and Anomaly Detection Agent", short: "Data Intake Agent", status: "Active", scope: "Supplier feed intake monitoring across 27 scheduled feeds", task: "Investigating NorthStar Daily Sales Feed volume anomaly, INC-2026-0901-01", lastAction: "Completed investigation, flagged critical volume deviation of -78.6 percent at 06:18 IST", actionsToday: 9, successRate: 96, avgResolution: "6 min", handled30d: 47, confidence: 94, awaiting: 1, govMode: "Human Approval Required", icon: "server" },
  { id: "etl", name: "ETL Incident Resolution Agent", short: "ETL Resolution Agent", status: "Active", scope: "Stage-level failure diagnosis and remediation for all managed ETL pipelines", task: "Investigating SALES_DAILY_ETL, Customer Validation failure, INC-2026-0901-02", lastAction: "Correlated 3 similar historical incidents, top match INC-10482 at 91 percent", actionsToday: 14, successRate: 97, avgResolution: "9 min", handled30d: 132, confidence: 96, awaiting: 1, govMode: "Human Approval Required", icon: "cpu" },
  { id: "dq", name: "Data Quality and Supplier Intelligence Agent", short: "Data Quality Agent", status: "Active", scope: "Post-ETL quality assessment and supplier scorecard maintenance across 184 datasets", task: "Running the post-ETL quality assessment for SALES_DAILY_ETL and recalculating the GlobalFeeds scorecard", lastAction: "Published the quality report for SALES_DAILY_ETL, overall score 94.2", actionsToday: 22, successRate: 99, avgResolution: "2 min", handled30d: 19, confidence: 91, awaiting: 0, govMode: "Observe Only", icon: "eye" },
]

export const AGENT_ACTIVITY_STEPS = [
  "Detected",
  "Investigated",
  "Evidence collected",
  "Knowledge searched",
  "Recommendation produced",
  "Approval requested",
  "Action executed",
  "Outcome validated",
]
