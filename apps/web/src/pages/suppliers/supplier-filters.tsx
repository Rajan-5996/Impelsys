import { useEffect } from "react"

import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchSupplierFilterOptions,
  selectSupplierFilterOptions,
  selectSupplierFilters,
  setSupplierFilter,
  setSupplierSearch,
} from "@/store/suppliers-slice"

const TIER_OPTIONS = ["Preferred", "Approved", "Monitor", "At Risk"]

type FilterKey = "region" | "method" | "tier"

export function SupplierFilters({
  visibleCount,
  totalCount,
}: {
  visibleCount: number
  totalCount: number
}) {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(selectSupplierFilters)
  const filterOptions = useAppSelector(selectSupplierFilterOptions)

  useEffect(() => {
    dispatch(fetchSupplierFilterOptions())
  }, [dispatch])

  function selectFor(key: FilterKey, label: string, options: string[]) {
    return (
      <Select
        value={filters[key]}
        onValueChange={(value) =>
          dispatch(setSupplierFilter({ key, value: value ?? "all" }))
        }
      >
        <SelectTrigger size="sm">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <Input
        value={filters.search}
        onChange={(event) => dispatch(setSupplierSearch(event.target.value))}
        placeholder="Search suppliers or feeds..."
        className="h-9 max-w-64 border border-border px-2.5"
      />
      {selectFor("region", "Regions", filterOptions.regions)}
      {selectFor("method", "Methods", filterOptions.deliveryMethods)}
      {selectFor("tier", "Tiers", TIER_OPTIONS)}
      <span className="ml-auto text-[11px] font-semibold text-muted-foreground">
        {visibleCount} of {totalCount} suppliers
      </span>
    </div>
  )
}
