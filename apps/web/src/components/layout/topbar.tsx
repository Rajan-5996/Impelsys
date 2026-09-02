import { MessageCircleIcon } from "lucide-react"

import { SidebarTrigger } from "@workspace/ui/components/sidebar"

import { LifecycleStepper } from "@/components/lifecycle"
import { GlobalSearch } from "@/components/layout/global-search"
import { NotificationBell } from "@/components/layout/notification-bell"
import { useAppDispatch } from "@/store/hooks"
import { openAsk } from "@/store/ui-slice"

export function Topbar() {
  const dispatch = useAppDispatch()

  return (
    <div className="sticky top-0 z-30 flex flex-col bg-card">
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <SidebarTrigger />
        <GlobalSearch />
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch(openAsk())}
            className="flex size-8 items-center justify-center border border-border bg-card text-foreground hover:bg-muted/40"
          >
            <MessageCircleIcon className="size-3.5" />
          </button>
          <NotificationBell />
        </div>
      </div>
      <LifecycleStepper />
    </div>
  )
}
