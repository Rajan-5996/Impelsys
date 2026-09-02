import { useEffect } from "react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"

import { EmptyState } from "@/components/empty-state"
import { FileSourceView } from "@/pages/connectors/file-source-view"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchQaFileSource, qaFileSourceCleared, selectQaFileSource } from "@/store/qa-history-slice"

export type FileSourceRequest = { analysisId: string; filePath: string } | null

export function QaFileSourcePanel({
  request,
  onClose,
}: {
  request: FileSourceRequest
  onClose: () => void
}) {
  const dispatch = useAppDispatch()
  const fileSource = useAppSelector(selectQaFileSource)

  useEffect(() => {
    if (request) dispatch(fetchQaFileSource(request))
  }, [dispatch, request])

  function closeAndReset() {
    dispatch(qaFileSourceCleared())
    onClose()
  }

  return (
    <Sheet open={request !== null} onOpenChange={(open) => !open && closeAndReset()}>
      <SheetContent className="data-[side=right]:sm:max-w-[50vw]">
        <SheetHeader>
          <SheetTitle className="truncate font-mono text-sm normal-case">
            {request?.filePath}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-auto px-8 pb-8">
          {fileSource.status === "loading" || fileSource.status === "idle" ? (
            <div className="h-48 animate-pulse rounded-md bg-muted/40" />
          ) : fileSource.status === "failed" ? (
            <EmptyState message={fileSource.error ?? "Failed to load source."} />
          ) : fileSource.data ? (
            <FileSourceView language={fileSource.data.language} sourceCode={fileSource.data.source_code} />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
