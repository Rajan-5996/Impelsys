import { AuditTrailSection } from "@/pages/incidents/audit-trail-section"
import { EtlActionsSection } from "@/pages/incidents/etl-actions-section"
import { EtlHistoricalEvidence } from "@/pages/incidents/historical-evidence-section"
import { EtlInvestigation } from "@/pages/incidents/etl-investigation"
import { EtlPipelineContext } from "@/pages/incidents/pipeline-context-section"
import { IncidentHeader } from "@/pages/incidents/incident-header"
import { IncidentSectionNav } from "@/pages/incidents/incident-section-nav"
import { RecommendationSection } from "@/pages/incidents/recommendation-section"
import { SummarySection } from "@/pages/incidents/summary-section"
import { ETL_INCIDENT } from "@/data/incidents"
import { useAppSelector } from "@/store/hooks"
import { selectEtlState } from "@/store/incidents-slice"

const STATUS_LABEL = {
  open: "Open",
  approved: "Approved",
  rejected: "Rejected",
  resolved: "Resolved",
}

export function EtlIncidentPage() {
  const etl = useAppSelector(selectEtlState)

  return (
    <div className="flex flex-col gap-4">
      <IncidentHeader
        crumbLabel={ETL_INCIDENT.id}
        id={ETL_INCIDENT.id}
        title={`${ETL_INCIDENT.supplier} — ${ETL_INCIDENT.pipeline}`}
        subtitle={`Stage: ${ETL_INCIDENT.stage} · Detected ${ETL_INCIDENT.detected}`}
        severityVariant="high"
        severityLabel={ETL_INCIDENT.severity}
        statusVariant={etl.status === "open" ? "medium" : "ok"}
        statusLabel={STATUS_LABEL[etl.status]}
        slaDeadline={etl.slaDeadline}
        slaResolvedAt={etl.slaResolvedAt}
        slaResolvedLabel={etl.status === "rejected" ? "Rejected" : "Resolved"}
        fields={[
          { label: "Assigned Team", value: ETL_INCIDENT.assignedTeam },
          { label: "Owner", value: ETL_INCIDENT.owner },
          { label: "Agent", value: ETL_INCIDENT.agentFull },
          { label: "Governance Mode", value: ETL_INCIDENT.govMode },
        ]}
        businessImpact={ETL_INCIDENT.businessImpact}
      />
      <IncidentSectionNav />
      <div className="flex flex-col gap-4">
        <SummarySection
          title={`${ETL_INCIDENT.stage} failure on ${ETL_INCIDENT.pipeline}`}
          body={ETL_INCIDENT.note}
        />
        <EtlInvestigation />
        <EtlPipelineContext />
        <EtlHistoricalEvidence />
        <RecommendationSection
          body={ETL_INCIDENT.recommendation}
          fields={[
            { label: "Confidence", value: `${ETL_INCIDENT.confidence}%` },
            { label: "Risk", value: ETL_INCIDENT.risk },
            { label: "Policy", value: ETL_INCIDENT.policy },
            {
              label: "Historical Success Rate",
              value: `${ETL_INCIDENT.historicalSuccessRate}%`,
            },
          ]}
        />
        <EtlActionsSection />
        <AuditTrailSection
          filter={(entry) => entry.incident === ETL_INCIDENT.id}
        />
      </div>
    </div>
  )
}
