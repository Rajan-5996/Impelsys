import { useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { EmptyState } from "@/components/empty-state"
import { LifecycleFlowDiagram } from "@/components/lifecycle"
import { fetchLifecycleFlow, selectLifecycleFlow } from "@/store/command-center-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

export function LifecycleSection() {
  const dispatch = useAppDispatch()
  const { data: stages, status, error } = useAppSelector(selectLifecycleFlow)

  useEffect(() => {
    dispatch(fetchLifecycleFlow())
  }, [dispatch])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Agent Lifecycle</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center overflow-hidden">
        {status === "failed" ? (
          <EmptyState message={error ?? "Failed to load the lifecycle flow."} />
        ) : status === "loading" || status === "idle" ? (
          <div className="h-[84px] w-full animate-pulse rounded-md bg-muted/40" />
        ) : (
          <LifecycleFlowDiagram steps={stages} />
        )}
      </CardContent>
    </Card>
  )
}
