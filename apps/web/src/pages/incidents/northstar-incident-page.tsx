import { IncidentHeader } from "@/pages/incidents/incident-header"
import { IncidentSectionNav } from "@/pages/incidents/incident-section-nav"
import { NorthstarActionsSection } from "@/pages/incidents/northstar-actions-section"
import { NorthstarHistoricalEvidence } from "@/pages/incidents/historical-evidence-section"
import { NorthstarInvestigation } from "@/pages/incidents/northstar-investigation"
import { NorthstarPipelineContext } from "@/pages/incidents/pipeline-context-section"
import { AuditTrailSection } from "@/pages/incidents/audit-trail-section"
import { RecommendationSection } from "@/pages/incidents/recommendation-section"
import { SummarySection } from "@/pages/incidents/summary-section"
import { NORTHSTAR_INCIDENT } from "@/data/incidents"
import { useAppSelector } from "@/store/hooks"
import { selectNorthstarState } from "@/store/incidents-slice"

const STATUS_LABEL = {
  open: "Open",
  acknowledged: "Acknowledged",
  rejected: "Rejected",
}

export function NorthstarIncidentPage() {
  const northstar = useAppSelector(selectNorthstarState)

  return (
    <div className="flex flex-col gap-4">
      <IncidentHeader
        crumbLabel={NORTHSTAR_INCIDENT.id}
        id={NORTHSTAR_INCIDENT.id}
        title={`${NORTHSTAR_INCIDENT.supplier} — ${NORTHSTAR_INCIDENT.feed}`}
        subtitle={`Pipeline: ${NORTHSTAR_INCIDENT.pipeline} · Detected ${NORTHSTAR_INCIDENT.detected}`}
        severityVariant="critical"
        severityLabel={NORTHSTAR_INCIDENT.severity}
        statusVariant={northstar.status === "open" ? "medium" : "ok"}
        statusLabel={STATUS_LABEL[northstar.status]}
        slaDeadline={northstar.slaDeadline}
        slaResolvedAt={northstar.slaResolvedAt}
        slaResolvedLabel={
          northstar.status === "rejected" ? "Rejected" : "Acknowledged"
        }
        fields={[
          { label: "Assigned Team", value: NORTHSTAR_INCIDENT.assignedTeam },
          { label: "Owner", value: NORTHSTAR_INCIDENT.owner },
          { label: "Agent", value: NORTHSTAR_INCIDENT.agentFull },
          { label: "Governance Mode", value: NORTHSTAR_INCIDENT.govMode },
        ]}
        businessImpact={NORTHSTAR_INCIDENT.businessImpact}
      />
      <IncidentSectionNav />
      <div className="flex flex-col gap-4">
        <SummarySection
          title={`${NORTHSTAR_INCIDENT.supplier} volume anomaly`}
          body={NORTHSTAR_INCIDENT.conclusion}
        />
        <NorthstarInvestigation />
        <NorthstarPipelineContext />
        <NorthstarHistoricalEvidence />
        <RecommendationSection
          body={NORTHSTAR_INCIDENT.action}
          fields={[
            { label: "Confidence", value: `${NORTHSTAR_INCIDENT.confidence}%` },
            { label: "Governance Mode", value: NORTHSTAR_INCIDENT.govMode },
            {
              label: "Similar Events",
              value: String(NORTHSTAR_INCIDENT.similarEventCount),
            },
          ]}
        />
        <NorthstarActionsSection />
        <AuditTrailSection
          filter={(entry) => entry.supplier === NORTHSTAR_INCIDENT.supplier}
        />
      </div>
    </div>
  )
}
