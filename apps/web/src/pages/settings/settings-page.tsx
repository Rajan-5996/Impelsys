import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArchiveIcon,
  ArrowLeftIcon,
  BellIcon,
  CheckIcon,
  ChevronRightIcon,
  GlobeIcon,
  PlugZapIcon,
  ShieldIcon,
  UserCogIcon,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

import { StatusChip } from "@/components/status-chip"
import { SOURCES } from "@/data/knowledge"
import { useAppSelector } from "@/store/hooks"
import { selectEnvironment } from "@/store/ui-slice"

const GOVERNANCE_MODES = [
  {
    name: "Observe Only",
    body: "Agents monitor and flag issues without taking action.",
  },
  {
    name: "Human Approval Required",
    body: "Agents draft a recommended action but require a reviewer to approve, reject, or modify it before execution.",
  },
  {
    name: "Policy-Controlled Autonomous",
    body: "Agents may execute automatically when an action matches a pre-approved policy such as an additive schema change.",
  },
]

const PERMISSIONS = [
  "Approve agent recommendations",
  "Reject agent recommendations",
  "Escalate to Supplier Management",
  "Modify recommended remediation actions before approval",
]

type SectionKey =
  | "governance"
  | "systems"
  | "notifications"
  | "environment"
  | "retention"
  | "permissions"

type IconTint = "primary" | "info" | "good" | "warning" | "serious"

const TINT_CLASS: Record<IconTint, string> = {
  primary: "bg-primary/10 text-primary",
  info: "bg-status-info/10 text-status-info",
  good: "bg-status-good/10 text-status-good-ink",
  warning: "bg-status-warning/15 text-status-warning-foreground",
  serious: "bg-status-serious/15 text-status-serious-foreground",
}

type Section = {
  key: SectionKey
  label: string
  icon: LucideIcon
  tint: IconTint
  description: string
}

const SECTIONS: Section[] = [
  {
    key: "governance",
    label: "Governance Defaults",
    icon: ShieldIcon,
    tint: "primary",
    description: "How much autonomy each agent mode is granted",
  },
  {
    key: "systems",
    label: "Connected Systems",
    icon: PlugZapIcon,
    tint: "good",
    description: "Knowledge sources feeding the agents",
  },
  {
    key: "notifications",
    label: "Notification Preferences",
    icon: BellIcon,
    tint: "warning",
    description: "How and when you're alerted",
  },
  {
    key: "environment",
    label: "Environment Configuration",
    icon: GlobeIcon,
    tint: "info",
    description: "Production, Pre-Production, or QA",
  },
  {
    key: "retention",
    label: "Data Retention",
    icon: ArchiveIcon,
    tint: "serious",
    description: "How long records are kept",
  },
  {
    key: "permissions",
    label: "User Permissions",
    icon: UserCogIcon,
    tint: "primary",
    description: "What your role can approve",
  },
]

function SectionDetail({ section }: { section: Section }) {
  const environment = useAppSelector(selectEnvironment)

  switch (section.key) {
    case "governance":
      return (
        <div className="flex flex-col gap-3">
          {GOVERNANCE_MODES.map((mode) => (
            <div
              key={mode.name}
              className="border border-border p-3 text-xs leading-relaxed text-muted-foreground"
            >
              <p className="mb-1 text-[12px] font-bold text-foreground">
                {mode.name}
              </p>
              {mode.body}
            </div>
          ))}
        </div>
      )
    case "systems":
      return (
        <div className="flex flex-col gap-2">
          {SOURCES.slice(0, 5).map((source) => (
            <div
              key={source.name}
              className="flex items-center justify-between border border-border px-3 py-2"
            >
              <span className="text-xs font-medium text-foreground">
                {source.name}
              </span>
              <StatusChip variant="ok">{source.status}</StatusChip>
            </div>
          ))}
        </div>
      )
    case "notifications":
      return (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Critical and high severity incidents trigger both an in-app
          notification and an email to the assigned team immediately. Medium
          and low severity signals are batched into a daily digest unless a
          supplier crosses a tier-downgrade threshold.
        </p>
      )
    case "environment":
      return (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Currently viewing <Badge variant="status-info">{environment}</Badge>.
          Switch environments from the selector in the top bar to preview
          Pre-Production or QA data without affecting Production agents.
        </p>
      )
    case "retention":
      return (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Audit log entries are retained for 7 years to satisfy compliance
          review requirements. Knowledge base articles and resolved incident
          records are retained indefinitely to improve future agent
          recommendations.
        </p>
      )
    case "permissions":
      return (
        <div className="text-xs leading-relaxed text-muted-foreground">
          <p className="mb-2.5">
            Signed in as{" "}
            <span className="font-semibold text-foreground">
              Siva Ram Murugan
            </span>{" "}
            (Data Governance Lead).
          </p>
          <ul className="flex flex-col gap-1.5">
            {PERMISSIONS.map((permission) => (
              <li key={permission} className="flex items-center gap-1.5">
                <CheckIcon className="size-3 shrink-0 text-status-good-ink" />
                {permission}
              </li>
            ))}
          </ul>
        </div>
      )
    default:
      return null
  }
}

export function SettingsPage() {
  const [active, setActive] = useState<SectionKey | null>(null)
  const activeSection = SECTIONS.find((section) => section.key === active) ?? null

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          Governance, environment, and platform configuration
        </p>
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {activeSection ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => setActive(null)}
                className="flex w-full items-center gap-2 border-b border-border px-4 py-3 text-left text-[11.5px] font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeftIcon className="size-3.5" />
                Back to Settings
              </button>
              <div className="p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      TINT_CLASS[activeSection.tint]
                    )}
                  >
                    <activeSection.icon className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">
                      {activeSection.label}
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      {activeSection.description}
                    </p>
                  </div>
                </div>
                <SectionDetail section={activeSection} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {SECTIONS.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActive(section.key)}
                  className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-muted/40"
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      TINT_CLASS[section.tint]
                    )}
                  >
                    <section.icon className="size-4.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-bold text-foreground">
                      {section.label}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {section.description}
                    </span>
                  </span>
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
