import { DownloadIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { Breadcrumbs } from "@/components/breadcrumbs"
import { AuditFilters } from "@/pages/audit/audit-filters"
import { AuditTable } from "@/pages/audit/audit-table"
import { filterAuditLog } from "@/pages/audit/filter-audit-log"
import { useAppSelector } from "@/store/hooks"
import { selectAuditFilters, selectAuditLog } from "@/store/audit-slice"

function exportAuditCsv(rows: ReturnType<typeof filterAuditLog>) {
  const header = [
    "Timestamp",
    "Agent",
    "Action",
    "Incident",
    "Supplier",
    "Policy",
    "Mode",
    "Approver",
    "Decision",
    "Result",
  ]
  const body = rows.map((row) => [
    row.ts,
    row.agent,
    row.action,
    row.incident,
    row.supplier,
    row.policy,
    row.mode,
    row.approver,
    row.decision,
    row.result,
  ])

  const csv = [header, ...body]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "audit-log.csv"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function AuditGovernancePage() {
  const log = useAppSelector(selectAuditLog)
  const filters = useAppSelector(selectAuditFilters)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Breadcrumbs trail={[{ label: "Audit & Governance" }]} />
          <h1 className="mt-1 text-lg font-semibold text-foreground">
            Audit & Governance
          </h1>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            Full record of autonomous and human-approved agent decisions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportAuditCsv(filterAuditLog(log, filters))}
        >
          <DownloadIcon /> Export CSV
        </Button>
      </div>

      <AuditFilters />
      <AuditTable />
    </div>
  )
}
