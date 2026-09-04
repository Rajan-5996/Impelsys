import { useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { BarMetricChart } from "@/components/charts/bar-metric-chart"
import { EmptyState } from "@/components/empty-state"
import { AGENT_CHART_COLORS } from "@/lib/status-bar-colors"
import { fetchAgents, selectAgents, selectAgentsError, selectAgentsStatus } from "@/store/agents-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const AGENT_SHORT_LABEL: Record<string, string> = {
  "AGENT-INTAKE": "Source Validation",
  "AGENT-DQ": "Data Quality",
  "AGENT-ETL": "ETL Resolution",
}

export function AgentSuccessChart() {
  const dispatch = useAppDispatch()
  const agents = useAppSelector(selectAgents)
  const status = useAppSelector(selectAgentsStatus)
  const error = useAppSelector(selectAgentsError)

  useEffect(() => {
    dispatch(fetchAgents())
  }, [dispatch])

  const data = agents.map((agent, index) => ({
    key: agent.id,
    label: AGENT_SHORT_LABEL[agent.id] ?? agent.name,
    value: Math.round(agent.successRate * 100),
    color: AGENT_CHART_COLORS[index % AGENT_CHART_COLORS.length]!,
  }))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Agent Success Rate</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {status === "failed" ? (
          <EmptyState message={error ?? "Failed to load agents."} />
        ) : status === "loading" || status === "idle" ? (
          <div className="h-[168px] animate-pulse rounded-md bg-muted/40" />
        ) : agents.length === 0 ? (
          <EmptyState message="No agents active right now." />
        ) : (
          <div className="flex flex-1 flex-col justify-center gap-3">
            <BarMetricChart data={data} valueFormatter={(value) => `${value}%`} />
            <div className="flex flex-col gap-1.5 border-t border-dashed border-border pt-3">
              {data.map((row) => (
                <div key={row.key} className="flex items-center gap-1.5 text-[11px]">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: row.color }} />
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{row.label}</span>
                  <span className="shrink-0 font-semibold text-foreground">{row.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
