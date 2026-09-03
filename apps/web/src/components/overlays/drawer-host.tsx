import { Sheet } from "@workspace/ui/components/sheet"

import { AgentActivityDrawerBody } from "@/components/overlays/agent-activity-drawer-body"
import { EtlFailureAnalysisDrawerBody } from "@/components/overlays/etl-failure-analysis-drawer-body"
import { QualityCheckDrawerBody } from "@/components/overlays/quality-check-drawer-body"
import { ScorecardDrawerBody } from "@/components/overlays/scorecard-drawer-body"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeDrawer, selectDrawer } from "@/store/ui-slice"

export function DrawerHost() {
  const dispatch = useAppDispatch()
  const drawer = useAppSelector(selectDrawer)

  return (
    <Sheet
      open={drawer !== null}
      onOpenChange={(open) => {
        if (!open) dispatch(closeDrawer())
      }}
    >
      {drawer?.type === "scorecard" ? (
        <ScorecardDrawerBody supplierId={drawer.supplierId} />
      ) : null}
      {drawer?.type === "agent-activity" ? (
        <AgentActivityDrawerBody agentId={drawer.agentId} />
      ) : null}
      {drawer?.type === "etl-failure-analysis" ? (
        <EtlFailureAnalysisDrawerBody runId={drawer.runId} />
      ) : null}
      {drawer?.type === "quality-check" ? (
        <QualityCheckDrawerBody runId={drawer.runId} />
      ) : null}
    </Sheet>
  )
}
