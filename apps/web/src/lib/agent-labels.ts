export const AGENT_SHORT_LABEL: Record<string, string> = {
  "AGENT-INTAKE": "AnomaliX Agent",
  "AGENT-DQ": "DataGuard Agent",
  "AGENT-ETL": "FlowFix Agent",
}

export const AGENT_ORDER = ["AGENT-INTAKE", "AGENT-DQ", "AGENT-ETL"]

// The audit trail (reliability_pipeline backend) stores the agent on each row
// as one of these literal names -- filtering/matching must keep using them
// as-is, only the label shown to the user is rebranded here.
export const AUDIT_AGENT_DISPLAY_LABEL: Record<string, string> = {
  "ETL Resolution Agent": "FlowFix Agent",
  "Data Intake Agent": "AnomaliX Agent",
  "Data Quality Agent": "DataGuard Agent",
}
