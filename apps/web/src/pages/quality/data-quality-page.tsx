import { useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { KpiCard, type AccentKey } from "@/components/kpi-card"
import { StatusText, type StatusChipVariant } from "@/components/status-chip"
import { formatTimestamp, humanizeSnake } from "@/lib/format-labels"
import {
  fetchRunQualityCheck,
  selectRunQualityChecks,
  type QualityCheckResult,
} from "@/store/run-flow-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchRuns, selectRuns, selectRunsStatus, type Run } from "@/store/runs-slice"
import { openDrawer } from "@/store/ui-slice"

const TIER_VARIANT: Record<string, StatusChipVariant> = {
  Preferred: "preferred",
  Approved: "approved",
  Monitor: "monitor",
  "At Risk": "atrisk",
}

const DECISION_STATUS_VARIANT: Record<string, StatusChipVariant> = {
  approved: "ok",
  pending: "medium",
  rejected: "critical",
}

function scoreVariant(score: number): StatusChipVariant {
  if (score >= 90) return "ok"
  if (score >= 75) return "medium"
  return "critical"
}


function weakDimensionCount(quality: QualityCheckResult) {
  return Object.values(quality.dimension_scores).filter((score) => score < 75).length
}

type QualityRow = {
  run: Run
  quality: QualityCheckResult | null
  loading: boolean
}

export function DataQualityPage() {
  const dispatch = useAppDispatch()
  const runs = useAppSelector(selectRuns)
  const runsStatus = useAppSelector(selectRunsStatus)
  const qualityChecks = useAppSelector(selectRunQualityChecks)

  useEffect(() => {
    dispatch(fetchRuns())
  }, [dispatch])

  useEffect(() => {
    runs.forEach((run) => {
      if (!qualityChecks[run.run_id]) dispatch(fetchRunQualityCheck(run.run_id))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, runs])

  const rows: QualityRow[] = runs.map((run) => ({
    run,
    quality: qualityChecks[run.run_id]?.data ?? null,
    loading: qualityChecks[run.run_id]?.status === "loading" || !qualityChecks[run.run_id],
  }))

  const scored = rows.filter((row): row is QualityRow & { quality: QualityCheckResult } => row.quality !== null)
  const avgScore = scored.length
    ? Math.round(
        (scored.reduce((sum, row) => sum + row.quality.overall_score, 0) / scored.length) * 10
      ) / 10
    : 0
  const belowThreshold = scored.filter((row) => row.quality.overall_score < 75).length
  const totalWeakDimensions = scored.reduce((sum, row) => sum + weakDimensionCount(row.quality), 0)

  const kpis: { label: string; value: string; accent: AccentKey }[] = [
    { label: "Runs Monitored", value: String(runs.length), accent: "info" },
    { label: "Runs Scored", value: String(scored.length), accent: "info" },
    {
      label: "Avg Quality Score",
      value: scored.length ? `${avgScore}` : "—",
      accent: avgScore >= 90 ? "up" : avgScore >= 75 ? "flat" : "down",
    },
    {
      label: "Runs Below Threshold",
      value: String(belowThreshold),
      accent: belowThreshold > 0 ? "down" : "up",
    },
    {
      label: "Weak Dimensions Flagged",
      value: String(totalWeakDimensions),
      accent: totalWeakDimensions > 0 ? "down" : "up",
    },
  ]

  const columns: DataTableColumn<QualityRow>[] = [
    {
      key: "run_id",
      header: "Run ID",
      render: (row) => <span className="font-semibold text-foreground">{row.run.run_id}</span>,
    },
    {
      key: "tier",
      header: "Tier",
      render: (row) =>
        row.quality ? (
          <StatusText variant={TIER_VARIANT[row.quality.tier] ?? "neutral"}>
            {row.quality.tier}
          </StatusText>
        ) : (
          <span className="text-muted-foreground">{row.loading ? "Loading…" : "—"}</span>
        ),
    },
    {
      key: "status",
      header: "Approval",
      render: (row) =>
        row.quality ? (
          <StatusText variant={DECISION_STATUS_VARIANT[row.quality.status] ?? "medium"}>
            {humanizeSnake(row.quality.status)}
          </StatusText>
        ) : (
          <span className="text-muted-foreground">
            {row.loading ? "Loading…" : "No result yet"}
          </span>
        ),
    },
    {
      key: "score",
      header: "Overall Score",
      align: "right",
      render: (row) =>
        row.quality ? (
          <StatusText variant={scoreVariant(row.quality.overall_score)}>
            {row.quality.overall_score}
          </StatusText>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "weak",
      header: "Weak Dimensions",
      align: "right",
      render: (row) => {
        if (!row.quality) return <span className="text-muted-foreground">—</span>
        const weak = weakDimensionCount(row.quality)
        return weak > 0 ? (
          <StatusText variant="critical">{weak}</StatusText>
        ) : (
          <span className="text-muted-foreground">None</span>
        )
      },
    },
    {
      key: "created_at",
      header: "Created",
      render: (row) => formatTimestamp(row.quality?.created_at ?? row.run.created_at),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Data Quality</h1>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          Quality check results across every Smart ETL run
        </p>
      </div>

      {runsStatus === "loading" || runsStatus === "idle" ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-[76px] animate-pulse rounded-xl bg-muted/40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map((kpi, index) => (
            <KpiCard
              key={kpi.label}
              index={index}
              kpi={{ label: kpi.label, value: kpi.value, sub: "", delta: null, accent: kpi.accent }}
            />
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Runs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {runsStatus === "failed" ? (
            <EmptyState message="Failed to load Smart ETL runs." />
          ) : runsStatus === "loading" || runsStatus === "idle" ? (
            <div className="h-64 animate-pulse rounded-md bg-muted/40" />
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              rowKey={(row) => row.run.run_id}
              onRowClick={(row) =>
                dispatch(openDrawer({ type: "quality-check", runId: row.run.run_id }))
              }
              emptyMessage="No Smart ETL runs recorded yet."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
