import { DataTable, type DataTableColumn } from "@/components/data-table"
import type { AuditLogEntry } from "@/data/audit"
import type { Supplier } from "@/data/suppliers"
import { useAppSelector } from "@/store/hooks"
import { selectAuditLog } from "@/store/audit-slice"

export function IncidentsTab({ supplier }: { supplier: Supplier }) {
  const auditLog = useAppSelector(selectAuditLog)
  const rows = auditLog.filter((entry) => entry.supplier === supplier.name)

  const columns: DataTableColumn<AuditLogEntry>[] = [
    { key: "ts", header: "Timestamp", render: (row) => row.ts },
    { key: "agent", header: "Agent", render: (row) => row.agent },
    { key: "action", header: "Action", render: (row) => row.action },
    { key: "decision", header: "Decision", render: (row) => row.decision },
    { key: "result", header: "Result", render: (row) => row.result },
  ]

  return (
    <div className="border border-border">
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        emptyMessage="No incidents recorded for this supplier."
      />
    </div>
  )
}
