import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { EmptyState } from "@/components/empty-state"

export function MetadataLakehousePage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Metadata Lakehouse</h1>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          Unified catalog of datasets, schemas, and lineage across the platform
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState message="Metadata Lakehouse integration is not connected yet." />
        </CardContent>
      </Card>
    </div>
  )
}
