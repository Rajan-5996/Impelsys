import { useNavigate } from "react-router-dom"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { AttentionCard } from "@/components/attention-card"
import { EmptyState } from "@/components/empty-state"
import { SlaPill } from "@/components/sla-pill"
import { incidentPath } from "@/constants/routes"
import { ETL_INCIDENT, GLOBALFEEDS_ALERT, NORTHSTAR_INCIDENT } from "@/data/incidents"
import { useAppSelector } from "@/store/hooks"
import { selectEtlState, selectNorthstarState } from "@/store/incidents-slice"

export function AttentionSection() {
  const navigate = useNavigate()
  const northstar = useAppSelector(selectNorthstarState)
  const etl = useAppSelector(selectEtlState)

  const cardCount =
    (northstar.status === "open" ? 1 : 0) + (etl.status === "open" ? 1 : 0) + 1

  return (
    <Card>
      <CardHeader>
        <CardTitle>Needs Attention</CardTitle>
      </CardHeader>
      <CardContent>
        {cardCount === 0 ? (
          <EmptyState message="No open items requiring attention." />
        ) : (
          <>
            {northstar.status === "open" ? (
              <AttentionCard
                severity="critical"
                title={`${NORTHSTAR_INCIDENT.id} - ${NORTHSTAR_INCIDENT.supplier}`}
                subtitle={NORTHSTAR_INCIDENT.businessImpact}
                onClick={() => navigate(incidentPath("northstar"))}
                slaSlot={
                  <SlaPill
                    deadline={northstar.slaDeadline}
                    resolvedAt={northstar.slaResolvedAt}
                  />
                }
                fields={[
                  { label: "Supplier", value: NORTHSTAR_INCIDENT.supplier },
                  {
                    label: "Expected vs Actual",
                    value: `${NORTHSTAR_INCIDENT.expectedVolume} vs ${NORTHSTAR_INCIDENT.actual}`,
                  },
                  { label: "Deviation", value: NORTHSTAR_INCIDENT.deviation },
                  {
                    label: "Assigned Team",
                    value: NORTHSTAR_INCIDENT.assignedTeam,
                  },
                ]}
              />
            ) : null}
            {etl.status === "open" ? (
              <AttentionCard
                severity="high"
                title={`${ETL_INCIDENT.id} - ${ETL_INCIDENT.supplier}`}
                subtitle={ETL_INCIDENT.businessImpact}
                onClick={() => navigate(incidentPath("etl"))}
                slaSlot={
                  <SlaPill
                    deadline={etl.slaDeadline}
                    resolvedAt={etl.slaResolvedAt}
                  />
                }
                fields={[
                  { label: "Stage", value: ETL_INCIDENT.stage },
                  { label: "Error", value: ETL_INCIDENT.error },
                  { label: "Affected", value: String(ETL_INCIDENT.affected) },
                  { label: "Assigned Team", value: ETL_INCIDENT.assignedTeam },
                ]}
              />
            ) : null}
            <AttentionCard
              severity="medium"
              title={`${GLOBALFEEDS_ALERT.id} - ${GLOBALFEEDS_ALERT.supplier}`}
              subtitle={GLOBALFEEDS_ALERT.businessImpact}
              onClick={() => navigate("/scorecards")}
              fields={[
                { label: "Severity", value: GLOBALFEEDS_ALERT.severity },
                { label: "Governance", value: GLOBALFEEDS_ALERT.govMode },
                { label: "Owner", value: GLOBALFEEDS_ALERT.owner },
                { label: "Detected", value: GLOBALFEEDS_ALERT.detected },
              ]}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
