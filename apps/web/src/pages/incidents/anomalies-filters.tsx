import { SearchIcon } from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { ANOMALY_TYPE_LABEL } from "@/lib/anomaly-labels"

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

const TYPE_OPTIONS = Object.entries(ANOMALY_TYPE_LABEL).map(([value, label]) => ({
  value,
  label,
}))

export type AnomaliesFilterState = {
  runId: string
  status: string
  type: string
}

export function AnomaliesFilters({
  filters,
  onChange,
}: {
  filters: AnomaliesFilterState
  onChange: (next: AnomaliesFilterState) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
      <div className="flex min-w-[180px] flex-1 items-center gap-2 border border-border bg-muted/30 px-2.5 py-1.5">
        <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
        <Input
          value={filters.runId}
          onChange={(event) => onChange({ ...filters, runId: event.target.value })}
          placeholder="Filter by run ID..."
          className="border-b-0"
        />
      </div>
      <Select
        value={filters.status}
        onValueChange={(value) => onChange({ ...filters, status: value ?? "all" })}
      >
        <SelectTrigger size="sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.type}
        onValueChange={(value) => onChange({ ...filters, type: value ?? "all" })}
      >
        <SelectTrigger size="sm">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
