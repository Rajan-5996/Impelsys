import { useEffect } from "react"
import { CheckIcon, InfoIcon, TriangleAlertIcon, XIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { dismissToast, selectToasts, type Toast } from "@/store/ui-slice"

const VARIANT_ICON: Record<Toast["variant"], typeof CheckIcon> = {
  success: CheckIcon,
  info: InfoIcon,
  warn: TriangleAlertIcon,
}

const VARIANT_DOT: Record<Toast["variant"], string> = {
  success: "bg-status-good text-status-good-foreground",
  info: "bg-status-info text-status-info-foreground",
  warn: "bg-status-warning text-status-warning-foreground",
}

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch()
  const Icon = VARIANT_ICON[toast.variant]

  useEffect(() => {
    const id = window.setTimeout(() => {
      dispatch(dismissToast(toast.id))
    }, 4200)
    return () => window.clearTimeout(id)
  }, [dispatch, toast.id])

  return (
    <div className="flex max-w-90 items-center gap-2.5 bg-foreground px-3.5 py-2.5 text-xs font-semibold text-background shadow-lg">
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full",
          VARIANT_DOT[toast.variant]
        )}
      >
        <Icon className="size-2.5 text-white" />
      </span>
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => dispatch(dismissToast(toast.id))}
        className="shrink-0 opacity-70 hover:opacity-100"
      >
        <XIcon className="size-3" />
      </button>
    </div>
  )
}

export function ToastStack() {
  const toasts = useAppSelector(selectToasts)

  if (toasts.length === 0) return null

  return (
    <div className="fixed right-5 bottom-5 z-[300] flex flex-col items-end gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
