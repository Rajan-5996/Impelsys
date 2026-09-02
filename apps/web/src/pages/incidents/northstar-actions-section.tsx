import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { selectNorthstarState } from "@/store/incidents-slice"
import { openModal, pushToast } from "@/store/ui-slice"

export function NorthstarActionsSection() {
  const dispatch = useAppDispatch()
  const northstar = useAppSelector(selectNorthstarState)

  return (
    <section id="actions" className="scroll-mt-28 border border-border p-4">
      <h2 className="mb-3 text-xs font-bold tracking-wide text-foreground uppercase">
        Actions
      </h2>
      {northstar.status === "open" ? (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              dispatch(
                openModal({ type: "confirm", action: "acknowledge-northstar" })
              )
            }
          >
            Acknowledge &amp; Notify Vendor
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              dispatch(
                pushToast("Escalated to Supplier Data Operations lead.", "info")
              )
            }
          >
            Escalate
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              dispatch(
                openModal({ type: "confirm", action: "reject-northstar" })
              )
            }
          >
            Reject
          </Button>
        </div>
      ) : (
        <p
          className={cn(
            "border px-3.5 py-2.5 text-[12px] font-semibold",
            northstar.status === "acknowledged"
              ? "border-status-good/30 bg-status-good/10 text-status-good-ink"
              : "border-status-critical/30 bg-status-critical/10 text-status-critical-ink"
          )}
        >
          {northstar.status === "acknowledged"
            ? "NorthStar Data has been notified and a re-delivery has been requested."
            : "This recommendation was rejected. No vendor notification was sent."}
        </p>
      )}
    </section>
  )
}
