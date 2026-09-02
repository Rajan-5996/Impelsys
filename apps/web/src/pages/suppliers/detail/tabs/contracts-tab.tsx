import { useEffect } from "react"

import { EmptyState } from "@/components/empty-state"
import { PolicyCard } from "@/components/knowledge-cards"
import { fetchSupplierContracts, selectSupplierContracts } from "@/store/supplier-detail-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

export function ContractsTab({ supplierId }: { supplierId: string }) {
  const dispatch = useAppDispatch()
  const { data: policies, status, error } = useAppSelector(selectSupplierContracts)

  useEffect(() => {
    dispatch(fetchSupplierContracts(supplierId))
  }, [dispatch, supplierId])

  if (status === "failed") {
    return <EmptyState message={error ?? "Failed to load contracts."} />
  }

  if (status === "loading" || status === "idle") {
    return <div className="h-40 animate-pulse rounded-md bg-muted/40" />
  }

  if (policies.length === 0) {
    return <EmptyState message="No governance policies reference this supplier's pipeline." />
  }

  return (
    <div>
      {policies.map((policy) => (
        <PolicyCard key={policy.id} policy={policy} />
      ))}
    </div>
  )
}
