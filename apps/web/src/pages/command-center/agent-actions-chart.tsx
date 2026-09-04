import { useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { RadarMetricChart } from "@/components/charts/radar-metric-chart"
import { EmptyState } from "@/components/empty-state"
import { AGENT_CHART_COLORS } from "@/lib/status-bar-colors"
import { fetchAgents, selectAgents, selectAgentsError, selectAgentsStatus } from "@/store/agents-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const AGENT_SHORT_LABEL: Record<string, string> = {
  "AGENT-INTAKE": "Source Validation",
  "AGENT-DQ": "Data Quality",
  "AGENT-ETL": "ETL Resolution",
}

const AGENT_ORDER = ["AGENT-INTAKE", "AGENT-DQ", "AGENT-ETL"]

export function AgentActionsChart() {
  const dispatch = useAppDispatch()
  const agents = useAppSelector(selectAgents)
  const status = useAppSelector(selectAgentsStatus)
  const error = useAppSelector(selectAgentsError)

  useEffect(() => {
    dispatch(fetchAgents())
  }, [dispatch])

  const orderedAgents = [...agents].sort(
    (a, b) => AGENT_ORDER.indexOf(a.id) - AGENT_ORDER.indexOf(b.id)
  )

  const data = orderedAgents.map((agent) => ({
    key: agent.id,
    label: AGENT_SHORT_LABEL[agent.id] ?? agent.name,
    value: agent.actionsToday,
  }))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Agent Actions Today</CardTitle>
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
            <RadarMetricChart data={data} size={168} />
            <div className="flex flex-col gap-1.5 border-t border-dashed border-border pt-3">
              {data.map((row, index) => (
                <div key={row.key} className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: AGENT_CHART_COLORS[index % AGENT_CHART_COLORS.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{row.label}</span>
                  <span className="shrink-0 font-semibold text-foreground">{row.value} actions</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
