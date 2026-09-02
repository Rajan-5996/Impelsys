import { useEffect } from "react"
import { CheckIcon } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { StatusChip } from "@/components/status-chip"
import type { Section } from "@/pages/settings/settings-sections"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchHealth,
  fetchSystemStatus,
  selectHealth,
  selectSettings,
  selectSystemStatus,
  switchEnvironment,
} from "@/store/system-slice"
import { pushToast } from "@/store/ui-slice"

const PERMISSIONS = [
  "Approve agent recommendations",
  "Reject agent recommendations",
  "Escalate to Supplier Management",
  "Modify recommended remediation actions before approval",
]

const ENVIRONMENTS = ["Production", "Pre-Production", "QA"]

export function SettingsSectionDetail({ section }: { section: Section }) {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)
  const health = useAppSelector(selectHealth)
  const systemStatus = useAppSelector(selectSystemStatus)

  useEffect(() => {
    if (section.key === "status") {
      dispatch(fetchHealth())
      dispatch(fetchSystemStatus())
    }
  }, [dispatch, section.key])

  if (section.key === "status") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border border-border px-3 py-2">
          <span className="text-xs font-medium text-foreground">API liveness (/health)</span>
          <StatusChip variant={health.data?.status === "ok" ? "ok" : "neutral"}>
            {health.status === "loading" ? "Checking…" : (health.data?.status ?? "Unknown")}
          </StatusChip>
        </div>
        <div className="flex items-center justify-between border border-border px-3 py-2">
          <span className="text-xs font-medium text-foreground">
            Overall status (/api/system/status)
          </span>
          <StatusChip variant={systemStatus.data?.status === "operational" ? "ok" : "critical"}>
            {systemStatus.status === "loading" ? "Checking…" : (systemStatus.data?.status ?? "Unknown")}
          </StatusChip>
        </div>
        {systemStatus.data
          ? Object.entries(systemStatus.data.checks).map(([check, result]) => (
              <div key={check} className="flex items-center justify-between border border-border px-3 py-2">
                <span className="text-xs font-medium text-foreground capitalize">{check}</span>
                <StatusChip variant={result === "ok" ? "ok" : "critical"}>{result}</StatusChip>
              </div>
            ))
          : null}
      </div>
    )
  }

  if (!settings) return null

  switch (section.key) {
    case "governance":
      return (
        <div className="flex flex-col gap-3">
          {Object.entries(settings.governanceDefaults).map(([agent, mode]) => (
            <div key={agent} className="border border-border p-3 text-xs leading-relaxed text-muted-foreground">
              <p className="mb-1 text-[12px] font-bold text-foreground">{agent}</p>
              {mode}
            </div>
          ))}
        </div>
      )
    case "systems":
      return (
        <div className="flex flex-col gap-2">
          {settings.connectedSystems.map((system) => (
            <div key={system} className="flex items-center justify-between border border-border px-3 py-2">
              <span className="text-xs font-medium text-foreground">{system}</span>
              <StatusChip variant="ok">Connected</StatusChip>
            </div>
          ))}
        </div>
      )
    case "notifications":
      return (
        <div className="flex flex-col gap-2">
          {Object.entries(settings.notificationPreferences).map(([channel, enabled]) => (
            <div key={channel} className="flex items-center justify-between border border-border px-3 py-2">
              <span className="text-xs font-medium text-foreground capitalize">{channel}</span>
              <StatusChip variant={enabled ? "ok" : "neutral"}>
                {enabled ? "Enabled" : "Disabled"}
              </StatusChip>
            </div>
          ))}
        </div>
      )
    case "environment":
      return (
        <div className="flex flex-col gap-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Currently set to <span className="font-semibold text-foreground">{settings.environment}</span>.
            This is a client-state-only switch in this build — there is no separate
            server-side environment to persist against.
          </p>
          <Select
            value={settings.environment}
            onValueChange={async (value) => {
              if (!value) return
              try {
                await dispatch(switchEnvironment(value)).unwrap()
                dispatch(pushToast(`Environment switched to ${value}`, "success"))
              } catch {
                dispatch(pushToast("Failed to switch environment", "warn"))
              }
            }}
          >
            <SelectTrigger size="sm" className="max-w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENVIRONMENTS.map((env) => (
                <SelectItem key={env} value={env}>
                  {env}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    case "retention":
      return (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Audit log entries are retained for {settings.dataRetention.logsMonths} months.
          Knowledge base articles and resolved incident records are retained{" "}
          {settings.dataRetention.auditRetention.toLowerCase()}.
        </p>
      )
    case "permissions":
      return (
        <div className="text-xs leading-relaxed text-muted-foreground">
          <p className="mb-2.5">
            Signed in as <span className="font-semibold text-foreground">Siva Ram Murugan</span>{" "}
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
