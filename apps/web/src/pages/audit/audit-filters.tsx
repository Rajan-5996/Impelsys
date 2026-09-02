import { SearchIcon } from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { selectAuditFilters, selectAuditLog, setAuditFilter } from "@/store/audit-slice"
import type { AuditFilterState } from "@/pages/audit/filter-audit-log"

function distinctValues(values: string[]): string[] {
  return Array.from(new Set(values)).sort()
}

type FilterKey = Exclude<keyof AuditFilterState, "search">

function FilterSelect({
  filterKey,
  label,
  options,
}: {
  filterKey: FilterKey
  label: string
  options: string[]
}) {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(selectAuditFilters)

  return (
    <Select
      value={filters[filterKey]}
      onValueChange={(value) =>
        dispatch(setAuditFilter({ key: filterKey, value: value as string }))
      }
    >
      <SelectTrigger size="sm">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function AuditFilters() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(selectAuditFilters)
  const log = useAppSelector(selectAuditLog)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex min-w-[220px] flex-1 items-center gap-2 border border-border bg-muted/30 px-2.5 py-1.5">
        <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) =>
            dispatch(setAuditFilter({ key: "search", value: event.target.value }))
          }
          placeholder="Search agent, action, supplier, incident..."
          className="border-b-0"
        />
      </div>
      <FilterSelect
        filterKey="agent"
        label="Agents"
        options={distinctValues(log.map((entry) => entry.agent))}
      />
      <FilterSelect
        filterKey="action"
        label="Actions"
        options={distinctValues(log.map((entry) => entry.action))}
      />
      <FilterSelect
        filterKey="supplier"
        label="Suppliers"
        options={distinctValues(log.map((entry) => entry.supplier))}
      />
      <FilterSelect
        filterKey="decision"
        label="Decisions"
        options={distinctValues(log.map((entry) => entry.decision))}
      />
      <FilterSelect
        filterKey="mode"
        label="Modes"
        options={distinctValues(log.map((entry) => entry.mode))}
      />
    </div>
  )
}
