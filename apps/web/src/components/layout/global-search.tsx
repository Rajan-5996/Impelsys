import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { SearchIcon } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"

import { EmptyState } from "@/components/empty-state"
import { datasetDetailPath, supplierDetailPath } from "@/constants/routes"
import { fetchSearchResults, selectSearchResults, selectSearchStatus } from "@/store/search-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

type SearchResult = {
  group: string
  label: string
  meta: string
  path: string
}

function toResults(results: ReturnType<typeof selectSearchResults>): SearchResult[] {
  return [
    ...results.suppliers.map((s) => ({
      group: "Suppliers",
      label: s.name,
      meta: s.id,
      path: supplierDetailPath(s.id),
    })),
    ...results.pipelines.map((p) => ({
      group: "Pipelines",
      label: p.name,
      meta: p.isReal ? "Live pipeline" : "Mock pipeline",
      path: "/pipeline",
    })),
    ...results.datasets.map((d) => ({
      group: "Datasets",
      label: d.name,
      meta: d.id,
      path: datasetDetailPath(d.id),
    })),
    ...results.policies.map((p) => ({
      group: "Policies",
      label: p.title,
      meta: p.id,
      path: "/knowledge",
    })),
  ]
}

export function GlobalSearch() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const results = useAppSelector(selectSearchResults)
  const status = useAppSelector(selectSearchStatus)
  const debounceRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      dispatch(fetchSearchResults(query))
    }, 250)
    return () => window.clearTimeout(debounceRef.current)
  }, [dispatch, query])

  const grouped = groupResults(toResults(results))

  return (
    <Popover open={open && query.length > 0} onOpenChange={setOpen}>
      <PopoverTrigger
        className="min-w-0 flex-1 max-w-[420px]"
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
            placeholder="Search suppliers, datasets, policies..."
            className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        initialFocus={false}
        className="w-[420px] max-h-[420px] overflow-y-auto p-0"
      >
        {status === "loading" ? (
          <div className="h-16 animate-pulse rounded-md bg-muted/40 m-2" />
        ) : grouped.length === 0 ? (
          <EmptyState message="No matches found." />
        ) : (
          grouped.map(([group, items]) => (
            <div key={group}>
              <p className="px-3.5 pt-2.5 pb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                {group}
              </p>
              {items.map((item, index) => (
                <button
                  key={`${item.group}-${item.label}-${index}`}
                  type="button"
                  onClick={() => {
                    navigate(item.path)
                    setOpen(false)
                    setQuery("")
                  }}
                  className="block w-full px-3.5 py-2 text-left hover:bg-muted/40"
                >
                  <p className="text-xs font-semibold text-foreground">{item.label}</p>
                  <p className="text-[10.5px] text-muted-foreground">{item.meta}</p>
                </button>
              ))}
            </div>
          ))
        )}
      </PopoverContent>
    </Popover>
  )
}

function groupResults(results: SearchResult[]): [string, SearchResult[]][] {
  const groups = new Map<string, SearchResult[]>()
  for (const result of results) {
    const list = groups.get(result.group) ?? []
    list.push(result)
    groups.set(result.group, list)
  }
  return Array.from(groups.entries())
}
