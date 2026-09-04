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
]
