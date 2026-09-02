import {
  ActivityIcon,
  ArchiveIcon,
  BellIcon,
  GlobeIcon,
  PlugZapIcon,
  ShieldIcon,
  UserCogIcon,
  type LucideIcon,
} from "lucide-react"

export type SectionKey =
  | "governance"
  | "systems"
  | "notifications"
  | "environment"
  | "retention"
  | "permissions"
  | "status"

export type IconTint = "primary" | "info" | "good" | "warning" | "serious"

export type Section = {
  key: SectionKey
  label: string
  icon: LucideIcon
  tint: IconTint
  description: string
}

export const SECTIONS: Section[] = [
  { key: "governance", label: "Governance Defaults", icon: ShieldIcon, tint: "primary", description: "How much autonomy each agent mode is granted" },
  { key: "systems", label: "Connected Systems", icon: PlugZapIcon, tint: "good", description: "Knowledge sources feeding the agents" },
  { key: "notifications", label: "Notification Preferences", icon: BellIcon, tint: "warning", description: "How and when you're alerted" },
  { key: "environment", label: "Environment Configuration", icon: GlobeIcon, tint: "info", description: "Production, Pre-Production, or QA" },
  { key: "retention", label: "Data Retention", icon: ArchiveIcon, tint: "serious", description: "How long records are kept" },
  { key: "permissions", label: "User Permissions", icon: UserCogIcon, tint: "primary", description: "What your role can approve" },
  { key: "status", label: "System Status", icon: ActivityIcon, tint: "good", description: "Live backend health and dependency checks" },
]
