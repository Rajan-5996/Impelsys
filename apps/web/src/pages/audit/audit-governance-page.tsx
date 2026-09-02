import { useEffect } from "react"
import { DownloadIcon } from "lucide-react"
import { shallowEqual } from "react-redux"

import { Button } from "@workspace/ui/components/button"

import { AuditFilters } from "@/pages/audit/audit-filters"
import { AuditTable } from "@/pages/audit/audit-table"
import { auditQueryFrom, fetchAuditLog, selectAuditEntries } from "@/store/audit-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import type { ActivityFeedEntry } from "@/store/command-center-slice"

function exportAuditCsv(rows: ActivityFeedEntry[]) {
  const header = [
    "Timestamp",
    "Agent",
    "Action",
    "Supplier",
    "Policy",
    "Mode",
    "Approver",
    "Decision",
    "Result",
    "Environment",
  ]
  const body = rows.map((row) => [
    row.ts,
    row.agent,
    row.action,
    row.supplier ?? "",
    row.policy ?? "",
    row.mode ?? "",
    row.approver ?? "",
    row.decision ?? "",
    row.result ?? "",
    row.env ?? "",
  ])

  const csv = [header, ...body]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "audit-log.csv"
  link.click()
  URL.revokeObjectURL(url)
}

export function AuditGovernancePage() {
  const dispatch = useAppDispatch()
  const query = useAppSelector(auditQueryFrom, shallowEqual)
  const entries = useAppSelector(selectAuditEntries)

  useEffect(() => {
    dispatch(fetchAuditLog(query))
  }, [dispatch, query])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
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
          disabled={entries.length === 0}
          onClick={() => exportAuditCsv(entries)}
        >
          <DownloadIcon /> Export CSV
        </Button>
      </div>

      <AuditFilters />
      <AuditTable />
    </div>
  )
}
