import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { LifecycleFlowDiagram } from "@/components/lifecycle"
import { LIFECYCLE_FLOW } from "@/data/command-center"

export function LifecycleSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Lifecycle</CardTitle>
      </CardHeader>
      <CardContent>
        <LifecycleFlowDiagram steps={LIFECYCLE_FLOW} />
      </CardContent>
    </Card>
  )
}
