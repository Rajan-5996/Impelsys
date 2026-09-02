import { useEffect } from "react"
import { useParams } from "react-router-dom"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { KpiCard } from "@/components/kpi-card"
import { StatusChip } from "@/components/status-chip"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchDatasetRules,
  fetchMockDatasetSummary,
  fetchRealDatasetDetail,
  selectDatasetRules,
  selectMockDatasetSummary,
  selectRealDatasetDetail,
  type DatasetRule,
} from "@/store/quality-detail-slice"
import { openModal } from "@/store/ui-slice"

export function DatasetDetailPage() {
  const { datasetId } = useParams<{ datasetId: string }>()
  const dispatch = useAppDispatch()
  const isReal = datasetId === "daily_sales_curated"
  const real = useAppSelector(selectRealDatasetDetail)
  const mock = useAppSelector(selectMockDatasetSummary)
  const rules = useAppSelector(selectDatasetRules)

  useEffect(() => {
    if (!datasetId) return
    if (isReal) {
      dispatch(fetchRealDatasetDetail())
    } else {
      dispatch(fetchMockDatasetSummary(datasetId))
    }
    dispatch(fetchDatasetRules(datasetId))
  }, [dispatch, datasetId, isReal])

  const summaryStatus = isReal ? real.status : mock.status
  const summaryError = isReal ? real.error : mock.error
  const name = isReal ? real.data?.dataset : mock.data?.name

  if (summaryStatus === "loading" || summaryStatus === "idle") {
    return <div className="h-64 animate-pulse rounded-md bg-muted/40" />
  }

  if (summaryStatus === "failed" || !name) {
    return <EmptyState message={summaryError ?? "Dataset not found."} />
  }

  const score = isReal
    ? Math.round(
        (real.data!.dimensions.reduce((sum, d) => sum + d.score, 0) /
          (real.data!.dimensions.length || 1)) *
          10
      ) / 10
    : mock.data!.score
  const recordCount = isReal ? real.data!.recordCount : mock.data!.recordCount
  const rulesTotal = isReal ? real.data!.rules.length : mock.data!.rulesTotal
  const passed = isReal
    ? real.data!.rules.filter((r) => r.status === "Passed").length
    : mock.data!.passed
  const failed = isReal
    ? real.data!.rules.filter((r) => r.status === "Failed").length
    : mock.data!.failed

  const columns: DataTableColumn<DatasetRule>[] = [
    { key: "ruleCode", header: "Rule ID", render: (row) => row.ruleCode },
    { key: "description", header: "Rule", render: (row) => row.description },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusChip variant={row.status === "Passed" ? "passed" : "failed"}>
          {row.status}
        </StatusChip>
      ),
    },
    {
      key: "affectedCount",
      header: "Affected",
      align: "right",
      render: (row) => row.affectedCount.toLocaleString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              dispatch(openModal({ type: "affected-records", ruleCode: row.ruleCode }))
            }
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            View Affected Records
          </button>
          <button
            type="button"
            onClick={() => dispatch(openModal({ type: "lineage", datasetId: datasetId! }))}
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            View Lineage
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <KpiCard
          index={0}
          kpi={{
            label: "Overall Score",
            value: score ?? "—",
            sub: "",
            delta: null,
            accent: score !== null && score >= 90 ? "up" : score !== null && score >= 75 ? "flat" : "down",
          }}
        />
        <KpiCard
          index={1}
          kpi={{ label: "Records", value: recordCount?.toLocaleString() ?? "—", sub: "", delta: null, accent: "info" }}
        />
        <KpiCard
          index={2}
          kpi={{ label: "Rules Passed", value: `${passed}/${rulesTotal}`, sub: "", delta: null, accent: "up" }}
        />
        <KpiCard
          index={3}
          kpi={{ label: "Failed", value: failed, sub: "", delta: null, accent: failed > 0 ? "down" : "up" }}
        />
      </div>

      {rules.status === "loading" || rules.status === "idle" ? (
        <div className="h-32 animate-pulse rounded-md bg-muted/40" />
      ) : rules.data.rules.length === 0 ? (
        <EmptyState message={rules.data.note ?? "No rule results recorded for this dataset."} />
      ) : (
        <DataTable columns={columns} rows={rules.data.rules} rowKey={(row) => row.ruleCode} />
      )}
    </div>
  )
}
