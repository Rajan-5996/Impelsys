import { DataTable, type DataTableColumn } from "@/components/data-table"
import type { AuditLogEntry } from "@/data/audit"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { selectAuditLog } from "@/store/audit-slice"
import { openModal } from "@/store/ui-slice"

const COLUMNS: DataTableColumn<AuditLogEntry>[] = [
  { key: "ts", header: "Timestamp", render: (row) => row.ts },
  { key: "agent", header: "Agent", render: (row) => row.agent },
  { key: "action", header: "Action", render: (row) => row.action },
  { key: "mode", header: "Governance Mode", render: (row) => row.mode },
  { key: "decision", header: "Decision", render: (row) => row.decision },
  { key: "result", header: "Result", render: (row) => row.result },
]

type AuditTrailSectionProps = {
  filter: (entry: AuditLogEntry) => boolean
}

export function AuditTrailSection({ filter }: AuditTrailSectionProps) {
  const dispatch = useAppDispatch()
  const log = useAppSelector(selectAuditLog)
  const rows = log.filter(filter)

  return (
    <section id="audit-trail" className="scroll-mt-28 border border-border p-4">
      <h2 className="mb-3 text-xs font-bold tracking-wide text-foreground uppercase">
        Audit Trail
      </h2>
      <DataTable
        columns={COLUMNS}
        rows={rows}
        rowKey={(row) => row.id}
        onRowClick={(row) =>
          dispatch(openModal({ type: "audit-detail", entryId: row.id }))
        }
        emptyMessage="No audit entries yet."
      />
    </section>
  )
}
