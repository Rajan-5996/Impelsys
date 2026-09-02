import { useNavigate } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { AttentionCard } from "@/components/attention-card"
import { AuditTrailSection } from "@/pages/incidents/audit-trail-section"
import { incidentPath } from "@/constants/routes"
import { ETL_INCIDENT } from "@/data/incidents"
import { useAppSelector } from "@/store/hooks"
import { selectEtlState } from "@/store/incidents-slice"

export function PipelineIncidentList() {
  const navigate = useNavigate()
  const etl = useAppSelector(selectEtlState)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Open Pipeline Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          {etl.status === "open" ? (
            <AttentionCard
              severity="high"
              title={`${ETL_INCIDENT.id} — ${ETL_INCIDENT.stage} failure`}
              subtitle={`${ETL_INCIDENT.supplier} · ${ETL_INCIDENT.pipeline}`}
              onClick={() => navigate(incidentPath("etl"))}
              fields={[
                { label: "Stage", value: ETL_INCIDENT.stage },
                { label: "Error", value: ETL_INCIDENT.error },
                {
                  label: "Affected",
                  value: ETL_INCIDENT.affected.toLocaleString(),
                },
                { label: "SLA", value: `${ETL_INCIDENT.slaMinutes}m target` },
              ]}
            />
          ) : (
            <p className="text-xs text-muted-foreground">
              No open pipeline incidents.
            </p>
          )}
        </CardContent>
      </Card>
      <div className="border border-border">
        <AuditTrailSection filter={(entry) => entry.incident === ETL_INCIDENT.id} />
      </div>
    </div>
  )
}
