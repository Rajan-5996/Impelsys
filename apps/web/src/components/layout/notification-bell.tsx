import { useNavigate } from "react-router-dom"
import { BellIcon } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

import { EmptyState } from "@/components/empty-state"
import { NOTIFICATIONS } from "@/data/knowledge"
import { useAppSelector } from "@/store/hooks"
import { selectEtlState, selectNorthstarState } from "@/store/incidents-slice"

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-status-critical",
  high: "bg-status-serious",
  medium: "bg-status-warning",
}

export function NotificationBell() {
  const navigate = useNavigate()
  const northstar = useAppSelector(selectNorthstarState)
  const etl = useAppSelector(selectEtlState)

  const active = NOTIFICATIONS.filter((notification) => {
    if (notification.id === "notif-northstar") return northstar.status === "open"
    if (notification.id === "notif-etl") return etl.status === "open"
    return true
  })

  return (
    <Popover>
      <PopoverTrigger className="relative flex size-8 items-center justify-center border border-border bg-card text-foreground outline-none hover:bg-muted/40">
        <BellIcon className="size-3.5" />
        {active.length > 0 ? (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-status-critical text-[9px] font-bold text-status-critical-foreground">
            {active.length}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-3.5 py-2.5 text-xs font-bold text-foreground">
          Notifications
        </div>
        <div className="max-h-80 overflow-y-auto">
          {active.length === 0 ? (
            <EmptyState message="No active notifications." />
          ) : (
            active.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => navigate(notification.path)}
                className="flex w-full gap-2.5 border-b border-border px-3.5 py-2.5 text-left last:border-b-0 hover:bg-muted/40"
              >
                <span
                  className={cn(
                    "mt-1 size-1.5 shrink-0 rounded-full",
                    SEVERITY_DOT[notification.sev]
                  )}
                />
                <span className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">
                    {notification.title}
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                    {notification.meta}
                  </p>
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
