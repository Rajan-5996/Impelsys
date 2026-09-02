import { PolicyCard } from "@/components/knowledge-cards"
import { POLICIES } from "@/data/knowledge"

export function PoliciesTab() {
  return (
    <div className="flex flex-col">
      {POLICIES.map((policy) => (
        <PolicyCard key={policy.id} policy={policy} />
      ))}
    </div>
  )
}
