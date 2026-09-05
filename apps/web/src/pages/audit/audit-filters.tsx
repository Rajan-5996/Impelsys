import { SearchIcon } from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { AUDIT_AGENT_DISPLAY_LABEL } from "@/lib/agent-labels"
import { selectAuditFilters, setAuditFilter, type AuditFilters } from "@/store/audit-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const ACTIONS = [
  "Detected",
  "Approved",
  "Rejected",
  "Escalated",
  "Vendor Notified",
  "Observed",
  "Auto-Accepted",
]
const AGENTS = ["ETL Resolution Agent", "Data Intake Agent", "Data Quality Agent"]
const MODES = ["Human Approval Required", "Observe Only", "Policy-Controlled Autonomous"]
const ENVS = ["Production", "Pre-Production", "QA"]

type SelectFilterKey = Extract<keyof AuditFilters, "action" | "agent" | "mode" | "env">

function FilterSelect({
  filterKey,
  label,
  options,
  labelFor = (option) => option,
}: {
  filterKey: SelectFilterKey
  label: string
  options: string[]
  labelFor?: (option: string) => string
}) {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(selectAuditFilters)

  return (
    <Select
      value={filters[filterKey]}
      onValueChange={(value) =>
        dispatch(setAuditFilter({ key: filterKey, value: value ?? "all" }))
      }
    >
      <SelectTrigger size="sm">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {labelFor(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function AuditFilters() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(selectAuditFilters)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex min-w-[200px] flex-1 items-center gap-2 border border-border bg-muted/30 px-2.5 py-1.5">
        <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
        <Input
          value={filters.supplier}
          onChange={(event) =>
            dispatch(setAuditFilter({ key: "supplier", value: event.target.value }))
          }
          placeholder="Filter by supplier..."
          className="border-b-0"
        />
      </div>
      <FilterSelect
        filterKey="agent"
        label="Agents"
        options={AGENTS}
        labelFor={(option) => AUDIT_AGENT_DISPLAY_LABEL[option] ?? option}
      />
      <FilterSelect filterKey="action" label="Actions" options={ACTIONS} />
      <FilterSelect filterKey="mode" label="Modes" options={MODES} />
      <FilterSelect filterKey="env" label="Environments" options={ENVS} />
    </div>
  )
}
