import { useState } from "react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { StatusChip, type StatusChipVariant } from "@/components/status-chip"
import { formatTimestamp } from "@/lib/format-labels"
import { QaFileSourcePanel, type FileSourceRequest } from "@/pages/connectors/qa-file-source-panel"
import type { QaAnalysisResult } from "@/store/qa-agent-events"

const RISK_VARIANT: Record<string, StatusChipVariant> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
}

export function QaAnalysisResults({ result }: { result: QaAnalysisResult }) {
  const [fileRequest, setFileRequest] = useState<FileSourceRequest>(null)

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-xs leading-relaxed text-muted-foreground">{result.summary}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] text-muted-foreground">
            <span>{result.owner}/{result.repository}@{result.branch}</span>
            <span>&middot;</span>
            <span>{result.testing_type}</span>
            <span>&middot;</span>
            <span>{result.llm_provider}/{result.llm_model}</span>
            {result.llm_execution?.latency_ms ? (
              <>
                <span>&middot;</span>
                <span>{result.llm_execution.latency_ms}ms</span>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Files ({result.recommended_file_count})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          {result.recommendations.map((rec, index) => (
            <div key={`${rec.file_path}-${index}`} className="border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[12px] font-semibold text-foreground">
                  {rec.file_path}
                </span>
                <div className="flex items-center gap-2">
                  <StatusChip variant={RISK_VARIANT[rec.risk_level] ?? "medium"}>
                    {rec.risk_level}
                  </StatusChip>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFileRequest({ analysisId: result.analysis_id, filePath: rec.file_path })
                    }
                  >
                    View Source
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-[11.5px] text-muted-foreground">{rec.reason}</p>
              {rec.test_suggestions && rec.test_suggestions.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-muted-foreground">
                  {rec.test_suggestions.map((suggestion, i) => (
                    <li key={i}>{suggestion}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analyzed Commits</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {result.commits.map((commit) => (
            <div
              key={commit.commit_id}
              className="flex items-center justify-between border-b border-dashed border-border py-2 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-foreground">{commit.commit_name}</p>
                <p className="text-[10.5px] text-muted-foreground">
                  {commit.author} &middot; {formatTimestamp(commit.date ?? "")}
                </p>
              </div>
              <span className="font-mono text-[10.5px] text-muted-foreground">
                {commit.commit_id.slice(0, 8)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <QaFileSourcePanel request={fileRequest} onClose={() => setFileRequest(null)} />
    </div>
  )
}
