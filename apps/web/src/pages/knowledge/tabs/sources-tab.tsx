import { useEffect } from "react"

import { Card } from "@workspace/ui/components/card"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { StatusChip } from "@/components/status-chip"
import { fetchKnowledgeSources, selectKnowledgeSources, type KnowledgeSource } from "@/store/knowledge-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const columns: DataTableColumn<KnowledgeSource>[] = [
  { key: "name", header: "Source", render: (row) => row.name },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <StatusChip variant={row.status === "Connected" ? "ok" : "neutral"}>
        {row.status}
      </StatusChip>
    ),
  },
  {
    key: "documentsIndexed",
    header: "Indexed",
    align: "right",
    render: (row) => row.documentsIndexed.toLocaleString(),
  },
  { key: "lastSync", header: "Last Sync", render: (row) => row.lastSync },
  { key: "owner", header: "Owner", render: (row) => row.owner },
]

export function SourcesTab() {
  const dispatch = useAppDispatch()
  const { data: sources, status, error } = useAppSelector(selectKnowledgeSources)

  useEffect(() => {
    dispatch(fetchKnowledgeSources())
  }, [dispatch])

  if (status === "failed") {
    return <EmptyState message={error ?? "Failed to load sources."} />
  }

  if (status === "loading" || status === "idle") {
    return <div className="h-40 animate-pulse rounded-md bg-muted/40" />
  }

  return (
    <Card>
      <DataTable columns={columns} rows={sources} rowKey={(row) => row.id} />
    </Card>
  )
}
