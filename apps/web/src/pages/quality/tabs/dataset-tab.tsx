import { useNavigate } from "react-router-dom"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { datasetDetailPath } from "@/constants/routes"
import { DATASETS, type Dataset } from "@/data/quality"

const columns: DataTableColumn<Dataset>[] = [
  { key: "name", header: "Dataset", render: (row) => row.name },
  { key: "pipeline", header: "Pipeline", render: (row) => row.pipeline },
  { key: "owner", header: "Owner", render: (row) => row.owner },
  {
    key: "overall",
    header: "Score",
    align: "right",
    render: (row) => (
      <span className="font-semibold text-foreground">{row.overall}</span>
    ),
  },
  {
    key: "records",
    header: "Records",
    align: "right",
    render: (row) => row.records.toLocaleString(),
  },
  {
    key: "rules",
    header: "Rules",
    align: "right",
    render: (row) =>
      `${row.passed}/${row.rulesTotal} passed, ${row.warnings} warn, ${row.failed} failed`,
  },
  { key: "lastAssessed", header: "Last Assessed", render: (row) => row.lastAssessed },
]

export function DatasetTab() {
  const navigate = useNavigate()

  return (
    <DataTable
      columns={columns}
      rows={DATASETS}
      rowKey={(row) => row.id}
      onRowClick={(row) => navigate(datasetDetailPath(row.id))}
    />
  )
}
