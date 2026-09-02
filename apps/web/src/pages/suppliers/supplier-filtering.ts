import type { selectSupplierFilters, Supplier, SupplierSortKey } from "@/store/suppliers-slice"

type SupplierFilters = ReturnType<typeof selectSupplierFilters>

function matchesFilters(supplier: Supplier, filters: SupplierFilters) {
  const search = filters.search.trim().toLowerCase()
  if (
    search &&
    !supplier.name.toLowerCase().includes(search) &&
    !supplier.feed.toLowerCase().includes(search)
  ) {
    return false
  }
  if (filters.region !== "all" && supplier.region !== filters.region) return false
  if (filters.method !== "all" && supplier.deliveryMethod !== filters.method)
    return false
  if (filters.tier !== "all" && supplier.tier !== filters.tier) return false
  return true
}

function sortSuppliers(
  suppliers: Supplier[],
  sortKey: SupplierSortKey | null,
  sortDir: 1 | -1
) {
  if (!sortKey) return suppliers
  return [...suppliers].sort((a, b) => {
    const va = a[sortKey]
    const vb = b[sortKey]
    if (typeof va === "number" && typeof vb === "number") {
      return (va - vb) * sortDir
    }
    return String(va).localeCompare(String(vb)) * sortDir
  })
}

export function getVisibleSuppliers(suppliers: Supplier[], filters: SupplierFilters) {
  const filtered = suppliers.filter((supplier) => matchesFilters(supplier, filters))
  return sortSuppliers(filtered, filters.sortKey, filters.sortDir)
}
