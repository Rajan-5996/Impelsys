import { useEffect } from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

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
    <Card>
      <CardHeader>
        <CardTitle>Data Lifecycle</CardTitle>
      </CardHeader>
      <CardContent>
        {status === "failed" ? (
          <EmptyState message={error ?? "Failed to load the lifecycle flow."} />
        ) : status === "loading" || status === "idle" ? (
          <div className="h-[84px] animate-pulse rounded-md bg-muted/40" />
        ) : (
          <LifecycleFlowDiagram steps={stages} />
        )}
      </CardContent>
    </Card>
  )
}
