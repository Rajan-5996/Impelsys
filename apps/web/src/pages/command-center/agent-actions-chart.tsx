import { useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { PolarAreaChart } from "@/components/charts/polar-area-chart"
import { EmptyState } from "@/components/empty-state"
import { AGENT_CHART_COLORS } from "@/lib/status-bar-colors"
import { fetchAgents, selectAgents, selectAgentsError, selectAgentsStatus } from "@/store/agents-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const AGENT_SHORT_LABEL: Record<string, string> = {
  "AGENT-INTAKE": "Data Intake",
  "AGENT-ETL": "ETL Resolution",
  "AGENT-DQ": "Data Quality",
}

export function AgentActionsChart() {
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
    value: agent.actionsToday,
    color: AGENT_CHART_COLORS[index % AGENT_CHART_COLORS.length]!,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Actions Today</CardTitle>
      </CardHeader>
      <CardContent>
        {status === "failed" ? (
          <EmptyState message={error ?? "Failed to load agents."} />
        ) : status === "loading" || status === "idle" ? (
          <div className="h-[168px] animate-pulse rounded-md bg-muted/40" />
        ) : agents.length === 0 ? (
          <EmptyState message="No agents active right now." />
        ) : (
          <div className="flex justify-center">
            <PolarAreaChart data={data} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
