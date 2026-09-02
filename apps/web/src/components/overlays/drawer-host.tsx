import { Sheet } from "@workspace/ui/components/sheet"

import { AgentActivityDrawerBody } from "@/components/overlays/agent-activity-drawer-body"
import { ScorecardDrawerBody } from "@/components/overlays/scorecard-drawer-body"
import { StageDetailDrawerBody } from "@/components/overlays/stage-detail-drawer-body"
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
      {drawer?.type === "stage-detail" ? (
        <StageDetailDrawerBody stageIndex={drawer.stageIndex} />
      ) : null}
      {drawer?.type === "scorecard" ? (
        <ScorecardDrawerBody supplierId={drawer.supplierId} />
      ) : null}
      {drawer?.type === "agent-activity" ? (
        <AgentActivityDrawerBody agentId={drawer.agentId} />
      ) : null}
    </Sheet>
  )
}
