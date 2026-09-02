import type { AuditLogEntry } from "@/data/audit"

export type AuditFilterState = {
  search: string
  agent: string
  action: string
  supplier: string
  decision: string
  mode: string
}

export function filterAuditLog(
  log: AuditLogEntry[],
  filters: AuditFilterState
): AuditLogEntry[] {
  const query = filters.search.trim().toLowerCase()

  return log.filter((entry) => {
    if (filters.agent !== "all" && entry.agent !== filters.agent) return false
    if (filters.action !== "all" && entry.action !== filters.action) return false
    if (filters.supplier !== "all" && entry.supplier !== filters.supplier) {
      return false
    }
    if (filters.decision !== "all" && entry.decision !== filters.decision) {
      return false
    }
    if (filters.mode !== "all" && entry.mode !== filters.mode) return false

    if (!query) return true

    return (
      entry.agent.toLowerCase().includes(query) ||
      entry.action.toLowerCase().includes(query) ||
      entry.supplier.toLowerCase().includes(query) ||
      entry.incident.toLowerCase().includes(query)
    )
  })
}
