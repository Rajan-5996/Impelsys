import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { SearchIcon } from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

import { pipelineVendorDetailPath } from "@/constants/routes"
import { useAppSelector } from "@/store/hooks"
import { selectVendors } from "@/store/vendors-slice"

export function VendorSearch() {
  const navigate = useNavigate()
  const vendors = useAppSelector(selectVendors)
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)

  const trimmed = query.trim().toLowerCase()
  const results = useMemo(
    () =>
      trimmed
        ? vendors.filter(
            (vendor) =>
              vendor.name.toLowerCase().includes(trimmed) ||
              vendor.vendor_id.toLowerCase().includes(trimmed)
          )
        : [],
    [vendors, trimmed]
  )

  const showDropdown = focused && trimmed.length > 0

  return (
    <div className="relative">
      <div className="flex h-8 min-w-[240px] items-center gap-2 border border-border bg-muted/30 px-2.5">
        <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search vendors..."
          className="h-8 border-b-transparent px-0"
        />
      </div>
      {showDropdown ? (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-full min-w-[260px] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md">
          {results.length === 0 ? (
            <p className="px-3 py-2.5 text-[12px] text-muted-foreground">
              No vendors match &quot;{query}&quot;
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto p-1.5">
              {results.map((vendor) => (
                <li key={vendor.vendor_id}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setQuery("")
                      setFocused(false)
                      navigate(pipelineVendorDetailPath(vendor.vendor_id))
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left outline-none",
                      "hover:bg-sidebar-accent/20 focus-visible:bg-sidebar-accent/20"
                    )}
                  >
                    <span className="truncate text-[12.5px] font-medium text-foreground">
                      {vendor.name}
                    </span>
                    <span className="shrink-0 font-mono text-[10.5px] text-muted-foreground">
                      {vendor.vendor_id}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}