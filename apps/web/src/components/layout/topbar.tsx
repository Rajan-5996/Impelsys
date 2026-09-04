import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Maximize2Icon, MessageCircleIcon, Minimize2Icon, RefreshCwIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"

import { LifecycleStepper } from "@/components/lifecycle"
import { GlobalSearch } from "@/components/layout/global-search"
import { NotificationBell } from "@/components/layout/notification-bell"
import { useAppDispatch } from "@/store/hooks"
import { openAsk, pushToast } from "@/store/ui-slice"

export function Topbar({ scrolled = true }: { scrolled?: boolean }) {
  const dispatch = useAppDispatch()
  const [updatedAt, setUpdatedAt] = useState(() => new Date())
  const [spinning, setSpinning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  function handleRefresh() {
    setUpdatedAt(new Date())
    setSpinning(true)
    window.setTimeout(() => setSpinning(false), 500)
    dispatch(pushToast("Data refreshed", "info"))
  }

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement !== null)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }

  return (
    <div
      className={cn(
        "sticky top-0 z-30 flex flex-col border-b transition-colors duration-200",
        !scrolled
          ? "border-border bg-white shadow-sm"
          : "glass-panel border-border/60"
      )}
    >
      <div className="flex h-14 items-center gap-3 px-4">
        <SidebarTrigger className="shrink-0 border border-border bg-card text-foreground shadow-sm hover:border-primary/40 hover:bg-primary/10 hover:text-primary" />
        <GlobalSearch />
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[10.5px] text-muted-foreground">
            Updated {updatedAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCwIcon className={spinning ? "animate-spin" : ""} /> Refresh
          </Button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => dispatch(openAsk())}
            className="flex size-8 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
          >
            <MessageCircleIcon className="size-3.5" />
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit full screen" : "Enter full screen"}
            className="flex size-8 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
          >
            {isFullscreen ? (
              <Minimize2Icon className="size-3.5" />
            ) : (
              <Maximize2Icon className="size-3.5" />
            )}
          </motion.button>
          <NotificationBell />
        </div>
      </div>
      <LifecycleStepper />
    </div>
  )
}
