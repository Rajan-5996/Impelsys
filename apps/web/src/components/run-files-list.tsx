import { useEffect } from "react"
import { DownloadIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { apiFileUrl } from "@/lib/axios-instance"
import { fetchRunFiles, selectRunFiles } from "@/store/runs-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function RunFilesList({ runId }: { runId: string }) {
  const dispatch = useAppDispatch()
  const files = useAppSelector(selectRunFiles(runId))

  useEffect(() => {
    dispatch(fetchRunFiles(runId))
  }, [dispatch, runId])

  if (!files || files.status === "loading" || files.status === "idle") {
    return <div className="h-16 animate-pulse rounded-md bg-muted/40" />
  }

  if (files.status === "failed") {
    return <EmptyState message={files.error ?? "Failed to load run files."} />
  }

  if (files.data.length === 0) {
    return (
      <EmptyState message="No output files yet -- available once the ETL stage completes successfully." />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {files.data.map((file) => (
        <a
          key={file.filename}
          href={apiFileUrl(`/api/smart-etl/runs/${runId}/files/${file.filename}`)}
          download={file.filename}
          className="flex flex-wrap items-center justify-between gap-2 border border-border px-3 py-2 text-[11.5px] hover:bg-muted/30"
        >
          <span className="font-medium text-foreground">{file.label}</span>
          <span className="text-muted-foreground">{file.filename}</span>
          <span className="flex items-center gap-1 font-semibold text-primary">
            <DownloadIcon className="size-3.5" />
            {formatFileSize(file.size_bytes)}
          </span>
        </a>
      ))}
    </div>
  )
}
