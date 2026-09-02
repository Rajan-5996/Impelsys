import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { EmptyState } from "@/components/empty-state"
import { useAppSelector } from "@/store/hooks"
import { selectAuditLog } from "@/store/audit-slice"

export function ActivityFeedSection() {
  const auditLog = useAppSelector(selectAuditLog)
  const recent = auditLog.slice(0, 4)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {recent.length === 0 ? (
          <EmptyState message="No recent activity." />
        ) : (
          recent.map((entry) => (
            <div
              key={entry.id}
              className="border-b border-border px-4 py-2.5 last:border-b-0"
            >
              <p className="text-[12px] font-semibold text-foreground">
                {entry.agent} &middot; {entry.action}
              </p>
              <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                {entry.supplier} &middot; {entry.ts}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
