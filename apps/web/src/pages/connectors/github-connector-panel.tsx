import { useAppSelector } from "@/store/hooks"
import { QaAnalysisFlow } from "@/pages/connectors/qa-analysis-flow"
import { QaAnalysisForm } from "@/pages/connectors/qa-analysis-form"
import { QaAnalysisResults } from "@/pages/connectors/qa-analysis-results"
import { QaHistoryPanel } from "@/pages/connectors/qa-history-panel"
import { selectQaAgent } from "@/store/qa-agent-slice"

export function GithubConnectorPanel() {
  const { stage, streaming, result, error } = useAppSelector(selectQaAgent)
  const showFlow = streaming || stage !== null

  return (
    <div className="flex w-full flex-col gap-3">
      <QaAnalysisForm />
      {showFlow ? <QaAnalysisFlow /> : null}
      {error ? <p className="text-[11.5px] text-status-critical-ink">{error}</p> : null}
      {result ? <QaAnalysisResults result={result} /> : null}
      <QaHistoryPanel />
    </div>
  )
}
