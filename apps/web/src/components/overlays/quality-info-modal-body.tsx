import { useEffect } from "react"

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchAffectedRecords,
  fetchDatasetLineage,
  selectAffectedRecords,
  selectDatasetLineage,
} from "@/store/quality-detail-slice"
import type { ModalDescriptor } from "@/store/ui-slice"

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border py-2 text-[12px] last:border-b-0">
      <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-foreground">{value}</p>
    </div>
  )
}

type QualityDescriptor = Extract<
  ModalDescriptor,
  { type: "affected-records" | "lineage" }
>

function AffectedRecordsBody({ ruleCode }: { ruleCode: string }) {
  const dispatch = useAppDispatch()
  const { data, status, error } = useAppSelector(selectAffectedRecords)

  useEffect(() => {
    dispatch(fetchAffectedRecords(ruleCode))
  }, [dispatch, ruleCode])

  if (status === "failed") return <EmptyState message={error ?? "Failed to load."} />
  if (status === "loading" || status === "idle" || !data) {
    return <div className="h-32 animate-pulse rounded-md bg-muted/40" />
  }
  if (data.records.length === 0) {
    return <EmptyState message={data.note ?? "No affected records for this rule."} />
  }

  const columns: DataTableColumn<Record<string, unknown>>[] = Object.keys(
    data.records[0]
  ).map((key) => ({ key, header: key, render: (row) => String(row[key] ?? "—") }))

  return (
    <DataTable
      columns={columns}
      rows={data.records}
      rowKey={(row) => JSON.stringify(row)}
    />
  )
}

function LineageBody({ datasetId }: { datasetId: string }) {
  const dispatch = useAppDispatch()
  const { data: lineage, status, error } = useAppSelector(selectDatasetLineage)

  useEffect(() => {
    dispatch(fetchDatasetLineage(datasetId))
  }, [dispatch, datasetId])

  if (status === "failed") return <EmptyState message={error ?? "Failed to load lineage."} />
  if (status === "loading" || status === "idle" || !lineage) {
    return <div className="h-16 animate-pulse rounded-md bg-muted/40" />
  }

  return <InfoRow label="Lineage" value={lineage} />
}

export function QualityInfoModalBody({ descriptor }: { descriptor: QualityDescriptor }) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {descriptor.type === "lineage" ? "Data Lineage" : "Affected Records"}
        </DialogTitle>
      </DialogHeader>
      <div className="p-5">
        {descriptor.type === "affected-records" ? (
          <AffectedRecordsBody ruleCode={descriptor.ruleCode} />
        ) : (
          <LineageBody datasetId={descriptor.datasetId} />
        )}
      </div>
    </DialogContent>
  )
}
