import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import { EmptyState } from "@/components/empty-state"

export type DataTableColumn<T> = {
  key: string
  header: string
  sortable?: boolean
  align?: "left" | "right"
  className?: string
  render: (row: T) => React.ReactNode
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  sortKey?: string | null
  sortDir?: 1 | -1
  onSort?: (key: string) => void
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  sortKey,
  sortDir = 1,
  onSort,
  emptyMessage = "No matching records.",
}: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((column) => {
            const isSorted = sortKey === column.key
            return (
              <TableHead
                key={column.key}
                className={cn(
                  column.align === "right" && "text-right",
                  column.sortable && "cursor-pointer select-none",
                  isSorted && "text-foreground"
                )}
                onClick={
                  column.sortable && onSort
                    ? () => onSort(column.key)
                    : undefined
                }
              >
                <span className="inline-flex items-center gap-1">
                  {column.header}
                  {column.sortable ? (
                    isSorted ? (
                      sortDir === 1 ? (
                        <ChevronUpIcon className="size-3" />
                      ) : (
                        <ChevronDownIcon className="size-3" />
                      )
                    ) : (
                      <ChevronUpIcon className="size-3 opacity-25" />
                    )
                  ) : null}
                </span>
              </TableHead>
            )
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columns.length}>
              <EmptyState message={emptyMessage} />
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(onRowClick && "cursor-pointer")}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(
                    column.align === "right" && "text-right",
                    column.className
                  )}
                >
                  {column.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
