import { Dialog } from "@workspace/ui/components/dialog"

import { CompareResolutionModalBody } from "@/components/overlays/compare-resolution-modal-body"
import { ConfirmDialogBody } from "@/components/overlays/confirm-dialog-body"
import { ModifyActionModalBody } from "@/components/overlays/modify-action-modal-body"
import { ReadOnlyInfoModalBody } from "@/components/overlays/read-only-info-modal-body"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeModal, selectModal } from "@/store/ui-slice"

export function ModalHost() {
  const dispatch = useAppDispatch()
  const modal = useAppSelector(selectModal)

  return (
    <Dialog
      open={modal !== null}
      onOpenChange={(open) => {
        if (!open) dispatch(closeModal())
      }}
    >
      {modal?.type === "confirm" ? (
        <ConfirmDialogBody action={modal.action} />
      ) : null}
      {modal?.type === "modify-action" ? <ModifyActionModalBody /> : null}
      {modal?.type === "compare-resolution" ? (
        <CompareResolutionModalBody similarId={modal.similarId} />
      ) : null}
      {modal &&
      (modal.type === "affected-records" ||
        modal.type === "lineage" ||
        modal.type === "audit-detail" ||
        modal.type === "kb-article" ||
        modal.type === "help") ? (
        <ReadOnlyInfoModalBody descriptor={modal} />
      ) : null}
    </Dialog>
  )
}
