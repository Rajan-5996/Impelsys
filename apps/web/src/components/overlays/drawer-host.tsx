import { Dialog } from "@workspace/ui/components/dialog"
import { Sheet } from "@workspace/ui/components/sheet"

import { AgentActivityDrawerBody } from "@/components/overlays/agent-activity-drawer-body"
import { AnomalyStatusListDrawerBody } from "@/components/overlays/anomaly-status-list-drawer-body"
import { EtlAdvisoryDialogBody } from "@/components/overlays/etl-advisory-drawer-body"
import { EtlFailureAnalysisDialogBody } from "@/components/overlays/etl-failure-analysis-drawer-body"
import { EtlRetryDialogBody } from "@/components/overlays/etl-retry-drawer-body"
import { QualityCheckDialogBody } from "@/components/overlays/quality-check-drawer-body"
import { ScorecardDrawerBody } from "@/components/overlays/scorecard-drawer-body"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeDrawer, selectDrawer } from "@/store/ui-slice"

const DIALOG_TYPES = new Set(["etl-retry", "etl-failure-analysis", "etl-advisory", "quality-check"])

export function DrawerHost() {
  const dispatch = useAppDispatch()
  const drawer = useAppSelector(selectDrawer)
  const isDialog = !!drawer && DIALOG_TYPES.has(drawer.type)

  function handleOpenChange(open: boolean) {
    if (!open) dispatch(closeDrawer())
  }

  return (
    <>
      <Sheet open={drawer !== null && !isDialog} onOpenChange={handleOpenChange}>
        {drawer?.type === "scorecard" ? (
          <ScorecardDrawerBody supplierId={drawer.supplierId} />
        ) : null}
        {drawer?.type === "agent-activity" ? (
          <AgentActivityDrawerBody agentId={drawer.agentId} />
        ) : null}
        {drawer?.type === "anomaly-status-list" ? (
          <AnomalyStatusListDrawerBody status={drawer.status} />
        ) : null}
      </Sheet>

      <Dialog open={isDialog} onOpenChange={handleOpenChange}>
        {drawer?.type === "etl-retry" ? <EtlRetryDialogBody runId={drawer.runId} /> : null}
        {drawer?.type === "etl-failure-analysis" ? (
          <EtlFailureAnalysisDialogBody runId={drawer.runId} />
        ) : null}
        {drawer?.type === "etl-advisory" ? <EtlAdvisoryDialogBody runId={drawer.runId} /> : null}
        {drawer?.type === "quality-check" ? <QualityCheckDialogBody runId={drawer.runId} /> : null}
      </Dialog>
    </>
  )
}
