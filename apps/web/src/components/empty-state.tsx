import { InboxIcon } from "lucide-react"

type EmptyStateProps = {
  message?: string
}

export function EmptyState({ message = "Nothing to show." }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
      <InboxIcon className="size-5 opacity-50" />
      <p className="text-xs">{message}</p>
    </div>
  )
}
