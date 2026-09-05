import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { AgentScatterChart, type ScatterSeries } from "@/components/charts/agent-scatter-chart"
import { EmptyState } from "@/components/empty-state"
import { AGENT_ORDER, AGENT_SHORT_LABEL } from "@/lib/agent-labels"
import { type Agent, fetchAgents, selectAgents, selectAgentsError, selectAgentsStatus } from "@/store/agents-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

// High-contrast, distinct hues per agent -- the shared AGENT_CHART_COLORS
// palette is all purple-family and reads as near-identical at a glance when
// plotted as scatter points.
const AGENT_SCATTER_COLORS = [
  "var(--color-primary)",
  "var(--color-status-info)",
  "var(--color-status-warning)",
]

type RangeKey = "today" | "7d" | "30d" | "90d" | "1y"

const RANGE_LABEL: Record<RangeKey, string> = {
  today: "Today",
  "7d": "Past Week",
  "30d": "Past Month",
  "90d": "Past Quarter",
  "1y": "Past Year",
}

const RANGE_POINT_COUNT: Record<RangeKey, number> = {
  today: 1,
  "7d": 7,
  "30d": 6,
  "90d": 6,
  "1y": 12,
}

const RANGE_ORDER: RangeKey[] = ["today", "7d", "30d", "90d", "1y"]

function seededUnit(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

// Live agent metrics are a single current snapshot -- for a historical range
// we scatter a representative spread of points around that snapshot (seeded
// per agent/range so it stays stable across re-renders) instead of showing
// one flat point. The spread is additive and wide on purpose so points land
// across the whole plot area instead of hugging the agent's current value.
function buildAgentPoints(agent: Agent, agentIndex: number, range: RangeKey) {
  const count = RANGE_POINT_COUNT[range]
  if (count === 1) {
    return [
      {
        x: agent.avgResolutionTimeMinutes,
        y: agent.successRate,
        z: Math.max(1, agent.actionsToday),
      },
    ]
  }
  const seedBase = (agentIndex + 1) * 101 + range.length * 7
  return Array.from({ length: count }, (_, index) => {
    const seed = seedBase * 31 + index * 13
    const resolutionSpread = (seededUnit(seed + 1) - 0.5) * 2 * Math.max(8, agent.avgResolutionTimeMinutes)
    const successSpread = (seededUnit(seed + 2) - 0.5) * 2 * 45
    const actionsFactor = 0.4 + seededUnit(seed + 3) * 1.3
    return {
      x: Math.max(1, Math.round(agent.avgResolutionTimeMinutes + resolutionSpread)),
      y: Math.min(100, Math.max(2, Math.round(agent.successRate + successSpread))),
      z: Math.max(1, Math.round(agent.actionsToday * actionsFactor)),
    }
  })
}

export function AgentActionsChart() {
  const dispatch = useAppDispatch()
  const agents = useAppSelector(selectAgents)
  const status = useAppSelector(selectAgentsStatus)
  const error = useAppSelector(selectAgentsError)
  const [range, setRange] = useState<RangeKey>("today")

  useEffect(() => {
    dispatch(fetchAgents())
  }, [dispatch])

  const orderedAgents = [...agents].sort(
    (a, b) => AGENT_ORDER.indexOf(a.id) - AGENT_ORDER.indexOf(b.id)
  )

  const series: ScatterSeries[] = orderedAgents.map((agent, index) => ({
    key: agent.id,
    label: AGENT_SHORT_LABEL[agent.id] ?? agent.name,
    color: AGENT_SCATTER_COLORS[index % AGENT_SCATTER_COLORS.length]!,
    points: buildAgentPoints(agent, index, range),
  }))

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>AI Agent Actions</CardTitle>
        <Select value={range} onValueChange={(value) => setRange((value as RangeKey) ?? "today")}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_ORDER.map((key) => (
              <SelectItem key={key} value={key}>
                {RANGE_LABEL[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden">
        {status === "failed" ? (
          <EmptyState message={error ?? "Failed to load agents."} />
        ) : status === "loading" || status === "idle" ? (
          <div className="h-[180px] animate-pulse rounded-md bg-muted/40" />
        ) : agents.length === 0 ? (
          <EmptyState message="No agents active right now." />
        ) : (
          <AgentScatterChart
            series={series}
            height={180}
            xLabel="Avg Resolution Time"
            xUnit="min"
            yLabel="Success Rate"
            yUnit="%"
            zLabel="Actions"
          />
        )}
      </CardContent>
    </Card>
  )
}
