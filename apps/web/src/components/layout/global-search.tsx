import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { SearchIcon } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"

import { EmptyState } from "@/components/empty-state"
import { datasetDetailPath, incidentPath, supplierDetailPath } from "@/constants/routes"
import { DATASETS } from "@/data/quality"
import { POLICIES } from "@/data/knowledge"
import { QUALITY_RULES } from "@/data/quality"
import { SUPPLIERS } from "@/data/suppliers"

type SearchResult = {
  group: string
  label: string
  meta: string
  path: string
}

function buildResults(query: string): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const results: SearchResult[] = []

  for (const supplier of SUPPLIERS) {
    if (supplier.name.toLowerCase().includes(q)) {
      results.push({
        group: "Suppliers",
        label: supplier.name,
        meta: supplier.feed,
        path: supplierDetailPath(supplier.id),
      })
    }
  }

  if ("northstar data".includes(q) || "inc-2026-0901-01".includes(q)) {
    results.push({
      group: "Incidents",
      label: "INC-2026-0901-01 - NorthStar Data",
      meta: "Critical volume anomaly",
      path: incidentPath("northstar"),
    })
  }
  if ("datasphere".includes(q) || "inc-2026-0901-02".includes(q) || "customer validation".includes(q)) {
    results.push({
      group: "Incidents",
      label: "INC-2026-0901-02 - DataSphere",
      meta: "Customer Validation failure",
      path: incidentPath("etl"),
    })
  }

  for (const dataset of DATASETS) {
    if (dataset.name.toLowerCase().includes(q)) {
      results.push({
        group: "Datasets",
        label: dataset.name,
        meta: dataset.pipeline,
        path: datasetDetailPath(dataset.id),
      })
    }
  }

  for (const rule of QUALITY_RULES) {
    if (rule.rule.toLowerCase().includes(q)) {
      results.push({
        group: "Quality Rules",
        label: rule.rule,
        meta: rule.dataset,
        path: "/quality",
      })
    }
  }

  for (const policy of POLICIES) {
    if (policy.title.toLowerCase().includes(q)) {
      results.push({
        group: "Policies",
        label: policy.title,
        meta: policy.id,
        path: "/knowledge",
      })
    }
  }

  return results.slice(0, 12)
}

export function GlobalSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const results = useMemo(() => buildResults(query), [query])
  const grouped = useMemo(() => {
    const groups = new Map<string, SearchResult[]>()
    for (const result of results) {
      const list = groups.get(result.group) ?? []
      list.push(result)
      groups.set(result.group, list)
    }
    return Array.from(groups.entries())
  }, [results])

  return (
    <Popover open={open && query.length > 0} onOpenChange={setOpen}>
      <PopoverTrigger
        className="w-full max-w-[420px]"
        render={<div />}
        nativeButton={false}
      >
        <div className="flex items-center gap-2 border border-border bg-muted/30 px-2.5 py-1.5">
          <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search suppliers, incidents, datasets, policies..."
            className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[420px] max-h-[420px] overflow-y-auto p-0">
        {results.length === 0 ? (
          <EmptyState message="No matches found." />
        ) : (
          grouped.map(([group, items]) => (
            <div key={group}>
              <p className="px-3.5 pt-2.5 pb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                {group}
              </p>
              {items.map((item) => (
                <button
                  key={`${item.group}-${item.label}`}
                  type="button"
                  onClick={() => {
                    navigate(item.path)
                    setOpen(false)
                    setQuery("")
                  }}
                  className="block w-full px-3.5 py-2 text-left hover:bg-muted/40"
                >
                  <p className="text-xs font-semibold text-foreground">
                    {item.label}
                  </p>
                  <p className="text-[10.5px] text-muted-foreground">
                    {item.meta}
                  </p>
                </button>
              ))}
            </div>
          ))
        )}
      </PopoverContent>
    </Popover>
  )
}
