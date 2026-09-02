import { useEffect } from "react"
import { DownloadIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { EmptyState } from "@/components/empty-state"
import { SupplierFilters } from "@/pages/suppliers/supplier-filters"
import { getVisibleSuppliers } from "@/pages/suppliers/supplier-filtering"
import { SupplierTable } from "@/pages/suppliers/supplier-table"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { pushToast } from "@/store/ui-slice"
import {
  fetchSuppliers,
  fetchSuppliersCsv,
  selectSupplierFilters,
  selectSuppliersList,
  selectSuppliersListError,
  selectSuppliersListStatus,
} from "@/store/suppliers-slice"

function downloadCsv(csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "supplier-monitor.csv"
  link.click()
  URL.revokeObjectURL(url)
}

export function SupplierMonitorPage() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(selectSupplierFilters)
  const suppliers = useAppSelector(selectSuppliersList)
  const status = useAppSelector(selectSuppliersListStatus)
  const error = useAppSelector(selectSuppliersListError)

  useEffect(() => {
    dispatch(fetchSuppliers())
  }, [dispatch])

  const visibleSuppliers = getVisibleSuppliers(suppliers, filters)

  async function handleExport() {
    try {
      const csv = await dispatch(fetchSuppliersCsv()).unwrap()
      downloadCsv(csv)
    } catch {
      dispatch(pushToast("Failed to export suppliers CSV", "warn"))
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">Supplier Monitor</h1>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            Track feed delivery, volume, and schema health across all suppliers.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <DownloadIcon /> Export CSV
        </Button>
      </div>
      {status === "failed" ? (
        <EmptyState message={error ?? "Failed to load suppliers."} />
      ) : status === "loading" || status === "idle" ? (
        <div className="h-[320px] animate-pulse rounded-md bg-muted/40" />
      ) : (
        <>
          <SupplierFilters
            visibleCount={visibleSuppliers.length}
            totalCount={suppliers.length}
          />
          <SupplierTable />
        </>
      )}
    </div>
  )
}
