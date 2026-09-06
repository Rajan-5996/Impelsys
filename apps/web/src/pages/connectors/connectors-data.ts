import { type LucideIcon } from "lucide-react"

import domoLogo from "@/assets/domo.png"
import githubLogo from "@/assets/github.png"
import jiraLogo from "@/assets/jira.png";
import gitlab from "@/assets/gitlab.png"
import bitbucket from "@/assets/bitbucket.png"
import amazonS3Logo from "@/assets/s3.png"
import azureLogo from "@/assets/azure.png"
import gcpLogo from "@/assets/gcp.png"
import databricksLogo from "@/assets/databricks.png"
import snowflakeLogo from "@/assets/snowflake.png"
import dbtLogo from "@/assets/DBT.png"
import salesforceLogo from "@/assets/salesforce.png"
import ibmDb2Logo from "@/assets/IBM.png"
import airflowLogo from "@/assets/air-flow.png"
import redshiftLogo from "@/assets/redshift.png"
import postgresLogo from "@/assets/postgres.png"
import treasureDataLogo from "@/assets/treasure.png"

export type ConnectorTint = "primary" | "standard" | "accent"

export type Connector = {
  id: string
  name: string
  category: string
  description: string
  detail: string
  status: "Connected" | "Not Connected"
  owner: string
  lastSync: string
  logo?: string
  icon?: LucideIcon
  tint: ConnectorTint
}

export const CONNECTORS: Connector[] = [
  {
    id: "github",
    name: "GitHub",
    category: "Source Control",
    description: "Pipeline and policy config changes tracked via pull requests.",
    detail:
      "Every change to a pipeline definition or governance policy is opened as a pull request here, giving agents and reviewers a full history of what changed, when, and why before it reaches production.",
    status: "Connected",
    owner: "DataOps Engineering",
    lastSync: "12 minutes ago",
    logo: githubLogo,
    tint: "primary",
  },
  {
    id: "jira",
    name: "Jira",
    category: "Issue Tracking",
    description: "Escalations and remediation follow-ups synced as tickets.",
    detail:
      "When an agent escalates a decision for human review, a linked ticket is opened here automatically so the follow-up work is tracked alongside the rest of the team's backlog.",
    status: "Connected",
    owner: "Supplier Operations",
    lastSync: "1 hour ago",
    logo: jiraLogo,
    tint: "standard",
  },
  {
    id: "domo",
    name: "Domo",
    category: "Analytics",
    description: "Supplier scorecards and quality trends pushed to dashboards.",
    detail:
      "Rolled-up scorecard and data-quality metrics are exported here on a daily cadence, powering the leadership dashboards used outside of this app.",
    status: "Not Connected",
    owner: "Data Governance",
    lastSync: "Never",
    logo: domoLogo,
    tint: "accent",
  },
  {
    id: "gitlab",
    name: "Git Lab",
    category: "Source Control",
    description: "Pipeline and policy config changes tracked via pull requests.",
    detail:
      "Every change to a pipeline definition or governance policy is opened as a pull request here, giving agents and reviewers a full history of what changed, when, and why before it reaches production.",
    status: "Not Connected",
    owner: "DataOps Engineering",
    lastSync: "12 minutes ago",
    logo: gitlab,
    tint: "primary",
  },
  {
    id: "bitbucket",
    name: "Bitbucket",
    category: "Source Control",
    description: "Pipeline and policy config changes tracked via pull requests.",
    detail:
      "Every change to a pipeline definition or governance policy is opened as a pull request here, giving agents and reviewers a full history of what changed, when, and why before it reaches production.",
    status: "Not Connected",
    owner: "DataOps Engineering",
    lastSync: "12 minutes ago",
    logo: bitbucket,
    tint: "primary",
  },
  {
    id: "amazon-s3",
    name: "Amazon S3",
    category: "Cloud Storage",
    description: "Raw supplier files ingested from AWS object storage buckets.",
    detail:
      "Vendor drops and raw source files land in S3 buckets first, where the intake agent picks them up for validation before they enter the ETL pipeline.",
    status: "Not Connected",
    owner: "DataOps Engineering",
    lastSync: "Never",
    logo: amazonS3Logo,
    tint: "accent",
  },
  {
    id: "azure-blob-storage",
    name: "Azure Blob Storage",
    category: "Cloud Storage",
    description: "Raw supplier files ingested from Azure object storage containers.",
    detail:
      "Vendor drops and raw source files land in Blob Storage containers first, where the intake agent picks them up for validation before they enter the ETL pipeline.",
    status: "Not Connected",
    owner: "DataOps Engineering",
    lastSync: "Never",
    logo: azureLogo,
    tint: "standard",
  },
  {
    id: "google-cloud-storage",
    name: "Google Cloud Storage",
    category: "Cloud Storage",
    description: "Raw supplier files ingested from GCP object storage buckets.",
    detail:
      "Vendor drops and raw source files land in GCS buckets first, where the intake agent picks them up for validation before they enter the ETL pipeline.",
    status: "Not Connected",
    owner: "DataOps Engineering",
    lastSync: "Never",
    logo: gcpLogo,
    tint: "primary",
  },
  {
    id: "databricks",
    name: "Databricks",
    category: "Data Platform",
    description: "Lakehouse tables read and written by the ETL resolution agent.",
    detail:
      "Curated and resolved datasets are written to Databricks lakehouse tables, giving downstream consumers a single, query-ready source of truth after ETL retries succeed.",
    status: "Not Connected",
    owner: "DataOps Engineering",
    lastSync: "Never",
    logo: databricksLogo,
    tint: "accent",
  },
  {
    id: "snowflake",
    name: "Snowflake",
    category: "Data Warehouse",
    description: "Cleaned supplier data warehoused for reporting and analytics.",
    detail:
      "Once data passes quality checks, it is loaded into Snowflake so analysts and downstream BI tools can query a governed, trustworthy warehouse.",
    status: "Not Connected",
    owner: "Data Governance",
    lastSync: "Never",
    logo: snowflakeLogo,
    tint: "standard",
  },
  {
    id: "dbt",
    name: "dbt",
    category: "Data Transformation",
    description: "Transformation models and tests version-controlled for the ETL pipeline.",
    detail:
      "dbt models define how curated tables are built and tested downstream of ingestion, giving the ETL resolution agent a documented, version-controlled transformation layer to reason about when a run fails.",
    status: "Not Connected",
    owner: "DataOps Engineering",
    lastSync: "Never",
    logo: dbtLogo,
    tint: "accent",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    category: "CRM",
    description: "Customer and account records synced for supplier relationship context.",
    detail:
      "Account, contact, and opportunity records from Salesforce would give agents customer-side context to correlate against supplier data quality issues, once connected.",
    status: "Not Connected",
    owner: "Supplier Operations",
    lastSync: "Never",
    logo: salesforceLogo,
    tint: "primary",
  },
  {
    id: "db2",
    name: "IBM Db2",
    category: "Database",
    description: "Legacy transactional data synced into the pipeline for migration and validation.",
    detail:
      "Db2 remains the system of record for several core transactional tables. The intake agent reads change-data-capture feeds from here so the as-is data stays in lockstep with what's already curated downstream during the modernization journey.",
    status: "Not Connected",
    owner: "DataOps Engineering",
    lastSync: "Never",
    logo: ibmDb2Logo,
    tint: "primary",
  },
  {
    id: "airflow",
    name: "Apache Airflow",
    category: "Orchestration",
    description: "Existing DAG schedules and run history correlated with agent-triggered jobs.",
    detail:
      "Airflow's DAG run history and scheduling metadata are read here so the ETL Resolution Agent can correlate a legacy-orchestrated job failure with the same incident it already tracks, instead of treating Airflow and agent-driven pipelines as two disconnected systems.",
    status: "Not Connected",
    owner: "DataOps Engineering",
    lastSync: "Never",
    logo: airflowLogo,
    tint: "standard",
  },
  {
    id: "redshift",
    name: "Amazon Redshift",
    category: "Data Warehouse",
    description: "Curated tables loaded into the existing enterprise warehouse.",
    detail:
      "Once data clears quality and governance checks, curated tables are loaded into Redshift so existing BI tools and analysts keep querying the same warehouse they already trust, with no disruption during the transformation journey.",
    status: "Not Connected",
    owner: "Data Governance",
    lastSync: "Never",
    logo: redshiftLogo,
    tint: "accent",
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "Database",
    description: "Operational and reference data read for enrichment and validation.",
    detail:
      "Reference and operational tables in PostgreSQL are read here to enrich incoming supplier records and validate them against established master data before curated output moves downstream.",
    status: "Not Connected",
    owner: "DataOps Engineering",
    lastSync: "Never",
    logo: postgresLogo,
    tint: "standard",
  },
  {
    id: "treasure-data",
    name: "Treasure Data",
    category: "Customer Data Platform",
    description: "Audience and event data synced for cross-system data quality checks.",
    detail:
      "Audience, visitor, and exhibitor event data managed in Treasure Data is brought in here so the Data Quality Agent can extend its checks and supplier scoring to the customer data platform side of the business, not just the ETL pipelines.",
    status: "Not Connected",
    owner: "Data Governance",
    lastSync: "Never",
    logo: treasureDataLogo,
    tint: "primary",
  },
]
