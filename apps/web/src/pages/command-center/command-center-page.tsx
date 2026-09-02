import { useState } from "react"
import { RefreshCwIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { ActivityFeedSection } from "@/pages/command-center/activity-feed-section"
import { AgentMiniListSection } from "@/pages/command-center/agent-mini-list-section"
import { AttentionSection } from "@/pages/command-center/attention-section"
import { FeedsTodaySection } from "@/pages/command-center/feeds-today-section"
import { KpiSection } from "@/pages/command-center/kpi-section"
import { LifecycleSection } from "@/pages/command-center/lifecycle-section"
import { PortfolioSummarySection } from "@/pages/command-center/portfolio-summary-section"
import { useAppDispatch } from "@/store/hooks"
import { pushToast } from "@/store/ui-slice"

export function CommandCenterPage() {
  const dispatch = useAppDispatch()
  const [updatedAt, setUpdatedAt] = useState(() => new Date())

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Command Center
          </h1>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            184 datasets monitored across 27 supplier feeds
          </p>
        </div>
        <div className="flex items-center gap-2.5 text-[10.5px] text-muted-foreground">
          <span>
            Updated {updatedAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setUpdatedAt(new Date())
              dispatch(pushToast("Command Center refreshed", "info"))
            }}
          >
            <RefreshCwIcon /> Refresh
          </Button>
        </div>
      </div>

      <KpiSection />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-4">
          <AttentionSection />
          <LifecycleSection />
          <ActivityFeedSection />
        </div>
        <div className="flex flex-col gap-4">
          <AgentMiniListSection />
          <PortfolioSummarySection />
          <FeedsTodaySection />
        </div>
      </div>
    </div>
  )
}
