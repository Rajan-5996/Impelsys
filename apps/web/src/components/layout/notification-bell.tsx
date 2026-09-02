import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { BellIcon } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

import { EmptyState } from "@/components/empty-state"
import { pathForScreenLink } from "@/constants/routes"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchNotifications,
  selectNotifications,
  selectNotificationsStatus,
} from "@/store/notifications-slice"

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-status-critical",
  high: "bg-status-serious",
  medium: "bg-status-warning",
}

export function NotificationBell() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectNotifications)
  const status = useAppSelector(selectNotificationsStatus)

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  return (
    <Popover>
      <PopoverTrigger className="relative flex size-8 items-center justify-center border border-border bg-card text-foreground outline-none hover:bg-muted/40">
        <BellIcon className="size-3.5" />
        {notifications.length > 0 ? (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-status-critical text-[9px] font-bold text-status-critical-foreground">
            {notifications.length}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-3.5 py-2.5 text-xs font-bold text-foreground">
          Notifications
        </div>
        <div className="max-h-80 overflow-y-auto">
          {status === "failed" ? (
            <EmptyState message="Failed to load notifications." />
          ) : status === "loading" || status === "idle" ? (
            <div className="h-16 animate-pulse rounded-md bg-muted/40" />
          ) : notifications.length === 0 ? (
            <EmptyState message="No active notifications." />
          ) : (
            notifications.map((notification) => (
              <button
                key={`${notification.link.screen}-${notification.link.id}`}
                type="button"
                onClick={() =>
                  navigate(pathForScreenLink(notification.link.screen, notification.link.id))
                }
                className="flex w-full gap-2.5 border-b border-border px-3.5 py-2.5 text-left last:border-b-0 hover:bg-muted/40"
              >
                <span
                  className={cn(
                    "mt-1 size-1.5 shrink-0 rounded-full",
                    SEVERITY_DOT[notification.severity] ?? "bg-muted-foreground"
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
