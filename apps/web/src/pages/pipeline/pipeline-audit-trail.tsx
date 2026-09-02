import { useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import type { ActivityFeedEntry } from "@/store/command-center-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchPipelineAuditTrail, selectPipelineAuditTrail } from "@/store/pipeline-slice"

const AUDIT_COLUMNS: DataTableColumn<ActivityFeedEntry>[] = [
  { key: "ts", header: "Timestamp", render: (row) => row.ts },
  { key: "agent", header: "Agent", render: (row) => row.agent },
  { key: "action", header: "Action", render: (row) => row.action },
  { key: "decision", header: "Decision", render: (row) => row.decision ?? "—" },
]

export function PipelineAuditTrail() {
  const dispatch = useAppDispatch()
  const auditTrail = useAppSelector(selectPipelineAuditTrail)

  useEffect(() => {
    dispatch(fetchPipelineAuditTrail("SALES_DAILY_ETL"))
  }, [dispatch])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Audit Trail</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {auditTrail.status === "failed" ? (
          <EmptyState message={auditTrail.error ?? "Failed to load the audit trail."} />
        ) : auditTrail.status === "loading" || auditTrail.status === "idle" ? (
          <div className="h-20 animate-pulse rounded-md bg-muted/40" />
        ) : (
          <DataTable
            columns={AUDIT_COLUMNS}
            rows={auditTrail.data.entries}
            rowKey={(row) => `${row.ts}-${row.action}`}
            emptyMessage="No audit trail entries for this pipeline."
          />
        )}
      </CardContent>
    </Card>
  )
}
