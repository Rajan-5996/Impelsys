import { useParams } from "react-router-dom"

import { Breadcrumbs } from "@/components/breadcrumbs"
import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { KpiCard } from "@/components/kpi-card"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { DATASET_RULES, QUALITY_RULES, findDataset, type DatasetRule } from "@/data/quality"
import { useAppDispatch } from "@/store/hooks"
import { openModal } from "@/store/ui-slice"

const STATUS_VARIANT: Record<DatasetRule["status"], StatusChipVariant> = {
  Passed: "passed",
  Warning: "warning",
  Failed: "failed",
}

export function DatasetDetailPage() {
  const { datasetId } = useParams<{ datasetId: string }>()
  const dispatch = useAppDispatch()
  const dataset = datasetId ? findDataset(datasetId) : undefined

  if (!dataset) {
    return (
      <div className="flex flex-col gap-4">
        <Breadcrumbs
          trail={[{ label: "Data Quality", path: "/quality" }, { label: "Not found" }]}
        />
        <EmptyState message="Dataset not found." />
      </div>
    )
  }

  const rules = DATASET_RULES[dataset.id] ?? []
  const quotableRuleTexts = new Set(QUALITY_RULES.map((rule) => rule.rule))

  const columns: DataTableColumn<DatasetRule>[] = [
    { key: "id", header: "Rule ID", render: (row) => row.id },
    { key: "rule", header: "Rule", render: (row) => row.rule },
    { key: "dim", header: "Dimension", render: (row) => row.dim },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusChip variant={STATUS_VARIANT[row.status]}>{row.status}</StatusChip>
      ),
    },
    {
      key: "affected",
      header: "Affected",
      align: "right",
      render: (row) => row.affected.toLocaleString(),
    },
    { key: "note", header: "Note", render: (row) => row.note },
    {
      key: "actions",
      header: "Actions",
      render: (row) =>
        quotableRuleTexts.has(row.rule) ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                dispatch(openModal({ type: "affected-records", ruleId: row.rule }))
              }
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              View Affected Records
            </button>
            <button
              type="button"
              onClick={() =>
                dispatch(openModal({ type: "lineage", ruleId: row.rule }))
              }
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              View Lineage
            </button>
          </div>
        ) : null,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs
        trail={[{ label: "Data Quality", path: "/quality" }, { label: dataset.name }]}
      />
      <div>
        <h1 className="text-lg font-semibold text-foreground">{dataset.name}</h1>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          {dataset.pipeline} &middot; {dataset.owner} &middot; last assessed{" "}
          {dataset.lastAssessed}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <KpiCard
          index={0}
          kpi={{
            label: "Overall Score",
            value: String(dataset.overall),
            sub: "",
            delta: null,
            accent: dataset.overall >= 90 ? "up" : dataset.overall >= 75 ? "flat" : "down",
          }}
        />
        <KpiCard
          index={1}
          kpi={{
            label: "Records",
            value: dataset.records.toLocaleString(),
            sub: "",
            delta: null,
            accent: "info",
          }}
        />
        <KpiCard
          index={2}
          kpi={{
            label: "Rules Passed",
            value: `${dataset.passed}/${dataset.rulesTotal}`,
            sub: "",
            delta: null,
            accent: "up",
          }}
        />
        <KpiCard
          index={3}
          kpi={{
            label: "Failed",
            value: String(dataset.failed),
            sub: "",
            delta: null,
            accent: dataset.failed > 0 ? "down" : "up",
          }}
        />
      </div>

      {rules.length === 0 ? (
        <EmptyState message="No rule results recorded for this dataset." />
      ) : (
        <DataTable columns={columns} rows={rules} rowKey={(row) => row.id} />
      )}
    </div>
  )
}
