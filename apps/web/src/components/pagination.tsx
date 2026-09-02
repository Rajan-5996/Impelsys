import { Button } from "@workspace/ui/components/button"

type PaginationProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(total, page * pageSize)

  return (
    <div className="flex items-center justify-between border-t border-border px-3 py-2.5 text-[11px] text-muted-foreground">
      <span>
        Showing {start} to {end} of {total}
      </span>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon-xs"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {"<"}
        </Button>
        <span className="px-2 font-semibold text-foreground">
          {page} / {pageCount}
        </span>
        <Button
          variant="outline"
          size="icon-xs"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          {">"}
        </Button>
      </div>
    </div>
  )
}
