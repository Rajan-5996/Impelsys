import { Card } from "@workspace/ui/components/card"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { Pagination } from "@/components/pagination"
import type { ActivityFeedEntry } from "@/store/command-center-slice"
import {
  selectAuditEntries,
  selectAuditError,
  selectAuditPage,
  selectAuditStatus,
  selectAuditTotal,
  setAuditPage,
} from "@/store/audit-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { openModal } from "@/store/ui-slice"

const columns: DataTableColumn<ActivityFeedEntry>[] = [
  { key: "ts", header: "Timestamp", render: (row) => row.ts },
  { key: "agent", header: "Agent", render: (row) => row.agent },
  { key: "action", header: "Action", render: (row) => row.action },
  { key: "supplier", header: "Supplier", render: (row) => row.supplier ?? "—" },
  { key: "mode", header: "Mode", render: (row) => row.mode ?? "—" },
  { key: "decision", header: "Decision", render: (row) => row.decision ?? "—" },
  { key: "result", header: "Result", render: (row) => row.result ?? "—" },
]

export function AuditTable() {
  const dispatch = useAppDispatch()
  const entries = useAppSelector(selectAuditEntries)
  const total = useAppSelector(selectAuditTotal)
  const status = useAppSelector(selectAuditStatus)
  const error = useAppSelector(selectAuditError)
  const { page, pageSize } = useAppSelector(selectAuditPage)

  if (status === "failed") {
    return <EmptyState message={error ?? "Failed to load the audit log."} />
  }

  return (
    <Card>
      {status === "loading" || status === "idle" ? (
        <div className="h-64 animate-pulse rounded-md bg-muted/40" />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={entries}
            rowKey={(row) => `${row.ts}-${row.action}-${row.supplier ?? row.agent}`}
            onRowClick={(row) => dispatch(openModal({ type: "audit-detail", entry: row }))}
            emptyMessage="No audit entries match your filters."
          />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={(nextPage) => dispatch(setAuditPage(nextPage))}
          />
        </>
      )}
    </Card>
  )
}
