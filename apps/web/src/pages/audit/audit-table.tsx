import { Card } from "@workspace/ui/components/card"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { Pagination } from "@/components/pagination"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import type { AuditDecision, AuditLogEntry } from "@/data/audit"
import { filterAuditLog } from "@/pages/audit/filter-audit-log"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  selectAuditFilters,
  selectAuditLog,
  selectAuditPage,
  setAuditPage,
} from "@/store/audit-slice"
import { openModal } from "@/store/ui-slice"

const DECISION_VARIANT: Record<AuditDecision, StatusChipVariant> = {
  Pending: "medium",
  Approved: "ok",
  "Not applicable": "neutral",
  "Auto-approved": "ok",
}

const PAGE_SIZE = 8

const columns: DataTableColumn<AuditLogEntry>[] = [
  { key: "ts", header: "Timestamp", render: (row) => row.ts },
  { key: "agent", header: "Agent", render: (row) => row.agent },
  { key: "action", header: "Action", render: (row) => row.action },
  { key: "incident", header: "Incident", render: (row) => row.incident },
  { key: "supplier", header: "Supplier", render: (row) => row.supplier },
  { key: "policy", header: "Policy", render: (row) => row.policy },
  { key: "mode", header: "Mode", render: (row) => row.mode },
  {
    key: "decision",
    header: "Decision",
    render: (row) => (
      <StatusChip variant={DECISION_VARIANT[row.decision]}>
        {row.decision}
      </StatusChip>
    ),
  },
  { key: "result", header: "Result", render: (row) => row.result },
]

export function AuditTable() {
  const dispatch = useAppDispatch()
  const log = useAppSelector(selectAuditLog)
  const filters = useAppSelector(selectAuditFilters)
  const page = useAppSelector(selectAuditPage)

  const filtered = filterAuditLog(log, filters)
  const start = (page - 1) * PAGE_SIZE
  const pageRows = filtered.slice(start, start + PAGE_SIZE)

  return (
    <Card>
      <DataTable
        columns={columns}
        rows={pageRows}
        rowKey={(row) => row.id}
        onRowClick={(row) =>
          dispatch(openModal({ type: "audit-detail", entryId: row.id }))
        }
        emptyMessage="No audit entries match your filters."
      />
      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={filtered.length}
        onPageChange={(nextPage) => dispatch(setAuditPage(nextPage))}
      />
    </Card>
  )
}
