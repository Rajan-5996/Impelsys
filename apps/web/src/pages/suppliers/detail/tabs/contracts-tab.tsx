import { EmptyState } from "@/components/empty-state"
import { PolicyCard } from "@/components/knowledge-cards"
import { POLICIES } from "@/data/knowledge"
import type { Supplier } from "@/data/suppliers"

export function ContractsTab({ supplier }: { supplier: Supplier }) {
  const policies = POLICIES.filter((policy) => policy.pipelines.includes(supplier.pipeline))

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
