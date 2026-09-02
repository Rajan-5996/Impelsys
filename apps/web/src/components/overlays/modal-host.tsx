import { Dialog } from "@workspace/ui/components/dialog"

import { QualityInfoModalBody } from "@/components/overlays/quality-info-modal-body"
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
      {modal?.type === "affected-records" || modal?.type === "lineage" ? (
        <QualityInfoModalBody descriptor={modal} />
      ) : null}
      {modal &&
      (modal.type === "audit-detail" ||
        modal.type === "kb-article" ||
        modal.type === "help") ? (
        <ReadOnlyInfoModalBody descriptor={modal} />
      ) : null}
    </Dialog>
  )
}
