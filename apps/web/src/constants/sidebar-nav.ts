import {
  Archive,
  Briefcase,
  ChartPie,
  FileText,
  GitBranch,
  Layers,
  LayoutGrid,
  PlugZap,
  Settings,
  ShieldCheck,
  Siren,
} from "lucide-react"

import { ROUTES } from "@/constants/routes"

export type NavItem = {
  title: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: "Operate",
    items: [
      { title: "Dashboard", path: ROUTES.commandCenter, icon: LayoutGrid },
      { title: "Pipeline Operations", path: ROUTES.pipeline, icon: GitBranch },
      { title: "Connectors", path: ROUTES.connectors, icon: PlugZap },
      { title: "Data Quality", path: ROUTES.quality, icon: ShieldCheck },
    ],
  },
  {
    label: "Insight",
    items: [
      // { title: "Supplier Scorecards", path: ROUTES.scorecards, icon: Star },
      { title: "Incidents", path: ROUTES.incidents, icon: Siren },
      { title: "Agent Workspace", path: ROUTES.agents, icon: Briefcase },
      { title: "Data Analyst Agent", path: ROUTES.dataAnalystAgent, icon: ChartPie },
      { title: "Metadata Lakehouse", path: ROUTES.metadataLakehouse, icon: Layers },
    ],
  },
  {
    label: "Governance",
    items: [
      { title: "Knowledge & Policies", path: ROUTES.knowledge, icon: FileText },
      { title: "Audit & Governance", path: ROUTES.audit, icon: Archive },
    ],
  },
  {
    label: "Admin",
    items: [{ title: "Settings", path: ROUTES.settings, icon: Settings }],
  },
]

export type GovernanceSnapshotRow = {
  label: string
  value: string
  dot: string
}

export const governanceSnapshot: GovernanceSnapshotRow[] = [
  { label: "Observe Only", value: "1 agent", dot: "bg-sidebar-foreground/40" },
  { label: "Approval Required", value: "2 agents", dot: "bg-warning" },
  { label: "Policy-Controlled", value: "0 agents", dot: "bg-standard" },
]
