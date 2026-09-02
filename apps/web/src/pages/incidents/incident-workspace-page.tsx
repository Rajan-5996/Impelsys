import { useParams } from "react-router-dom"

import { Breadcrumbs } from "@/components/breadcrumbs"
import { EmptyState } from "@/components/empty-state"
import { EtlIncidentPage } from "@/pages/incidents/etl-incident-page"
import { NorthstarIncidentPage } from "@/pages/incidents/northstar-incident-page"

export function IncidentWorkspacePage() {
  const { incidentId } = useParams<{ incidentId: string }>()

  if (incidentId === "northstar") {
    return <NorthstarIncidentPage />
  }

  if (incidentId === "etl") {
    return <EtlIncidentPage />
  }

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs
        trail={[
          { label: "Pipeline Operations", path: "/pipeline" },
          { label: "Not found" },
        ]}
      />
      <EmptyState message="Incident not found." />
    </div>
  )
}
