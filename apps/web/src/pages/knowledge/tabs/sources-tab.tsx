import { Card } from "@workspace/ui/components/card"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { StatusChip } from "@/components/status-chip"
import { SOURCES, type ConnectedSource } from "@/data/knowledge"

const columns: DataTableColumn<ConnectedSource>[] = [
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
  { key: "indexed", header: "Indexed", render: (row) => row.indexed },
  { key: "sync", header: "Last Sync", render: (row) => row.sync },
  { key: "owner", header: "Owner", render: (row) => row.owner },
]

export function SourcesTab() {
  return (
    <Card>
      <DataTable columns={columns} rows={SOURCES} rowKey={(row) => row.name} />
    </Card>
  )
}
