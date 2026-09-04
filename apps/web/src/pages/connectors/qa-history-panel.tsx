import { useEffect, useState } from "react"

import { CollapsibleCard } from "@/components/collapsible-card"
import { EmptyState } from "@/components/empty-state"
import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { formatTimestamp } from "@/lib/format-labels"
import { QaAnalysisResults } from "@/pages/connectors/qa-analysis-results"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchQaHistory,
  fetchQaHistoryDetail,
  selectQaHistoryDetail,
  selectQaHistoryList,
} from "@/store/qa-history-slice"

const STATUS_VARIANT: Record<string, StatusChipVariant> = {
  completed: "ok",
  failed: "critical",
}

export function QaHistoryPanel() {
  const dispatch = useAppDispatch()
  const history = useAppSelector(selectQaHistoryList)
  const [open, setOpen] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const detail = useAppSelector(selectQaHistoryDetail(expandedId ?? ""))

  useEffect(() => {
    dispatch(fetchQaHistory())
  }, [dispatch])

  function toggleExpand(analysisId: string) {
    if (expandedId === analysisId) {
      setExpandedId(null)
      return
    }
    setExpandedId(analysisId)
    dispatch(fetchQaHistoryDetail(analysisId))
  }

  return (
    <CollapsibleCard title="Analysis History" open={open} onOpenChange={setOpen}>
      {history.status === "failed" ? (
        <EmptyState message={history.error ?? "Failed to load history."} />
      ) : history.status === "loading" || history.status === "idle" ? (
        <div className="h-24 animate-pulse rounded-md bg-muted/40" />
      ) : history.data.length === 0 ? (
        <EmptyState message="No QA analyses run yet." />
      ) : (
        <div className="flex flex-col gap-2">
          {history.data.map((item) => (
            <div key={item.analysis_id} className="border border-border">
              <button
                type="button"
                onClick={() => toggleExpand(item.analysis_id)}
                className="flex w-full items-center justify-between gap-2 p-3 text-left hover:bg-muted/30"
              >
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-foreground">
                    {item.owner}/{item.repository}@{item.branch}
                  </p>
                  <p className="text-[10.5px] text-muted-foreground">
                    {item.testing_type} &middot; {formatTimestamp(item.analyzed_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[10.5px] text-muted-foreground">
                    {item.recommended_file_count} files
                  </span>
                  <StatusChip variant={STATUS_VARIANT[item.status] ?? "medium"}>
                    {item.status}
                  </StatusChip>
                </div>
              </button>
              {expandedId === item.analysis_id ? (
                <div className="border-t border-dashed border-border p-3">
                  {!detail || detail.status === "loading" ? (
                    <div className="h-24 animate-pulse rounded-md bg-muted/40" />
                  ) : detail.status === "failed" ? (
                    <EmptyState message={detail.error ?? "Failed to load analysis detail."} />
                  ) : (
                    <QaAnalysisResults result={detail.data} />
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </CollapsibleCard>
  )
}
