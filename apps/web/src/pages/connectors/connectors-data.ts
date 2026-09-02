import { type LucideIcon } from "lucide-react"

import domoLogo from "@/assets/domo.png"
import githubLogo from "@/assets/github.png"
import jiraLogo from "@/assets/jira.png";
import gitlab from "@/assets/gitlab.png"
import bitbucket from "@/assets/bitbucket.png"

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
  }
]
