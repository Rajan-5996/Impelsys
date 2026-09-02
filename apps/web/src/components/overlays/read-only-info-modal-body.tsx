import { useEffect } from "react"

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { EmptyState } from "@/components/empty-state"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchKbArticleById, selectCurrentKbArticle } from "@/store/knowledge-slice"
import type { ModalDescriptor } from "@/store/ui-slice"

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border py-2 text-[12px] last:border-b-0">
      <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-foreground">{value}</p>
    </div>
  )
}

type ReadOnlyDescriptor = Extract<
  ModalDescriptor,
  { type: "audit-detail" | "kb-article" | "help" }
>

export function ReadOnlyInfoModalBody({
  descriptor,
}: {
  descriptor: ReadOnlyDescriptor
}) {
  const dispatch = useAppDispatch()
  const currentArticle = useAppSelector(selectCurrentKbArticle)

  useEffect(() => {
    if (descriptor.type === "kb-article") {
      dispatch(fetchKbArticleById(descriptor.articleId))
    }
  }, [dispatch, descriptor])

  if (descriptor.type === "help") {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Help &amp; Documentation</DialogTitle>
        </DialogHeader>
        <div className="p-5 text-xs leading-relaxed text-muted-foreground">
          <p>
            The Command Center surfaces supplier feed health, pipeline
            status, and data quality signals in one place. Use the sidebar
            to move between operational areas, and the Ask DataOps Agent panel
            for natural-language questions about any supplier or pipeline.
          </p>
        </div>
      </DialogContent>
    )
  }

  if (descriptor.type === "kb-article") {
    const article = currentArticle.data
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{descriptor.articleId}</DialogTitle>
        </DialogHeader>
        <div className="p-5">
          {currentArticle.status === "loading" || currentArticle.status === "idle" ? (
            <div className="h-24 animate-pulse rounded-md bg-muted/40" />
          ) : currentArticle.status === "failed" || !article ? (
            <EmptyState message={currentArticle.error ?? "Article not found."} />
          ) : (
            <>
              <InfoRow label="Title" value={article.title} />
              <InfoRow label="Type" value={article.type} />
              <InfoRow label="Summary" value={article.summary} />
            </>
          )}
        </div>
      </DialogContent>
    )
  }

  if (descriptor.type === "audit-detail") {
    const entry = descriptor.entry
    return (
      <DialogContent size="wide">
        <DialogHeader>
          <DialogTitle>Audit Entry Detail</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-x-6 p-5 sm:grid-cols-2">
          <InfoRow label="Timestamp" value={entry.ts} />
          <InfoRow label="Agent" value={entry.agent} />
          <InfoRow label="Action" value={entry.action} />
          <InfoRow label="Supplier" value={entry.supplier ?? "—"} />
          <InfoRow label="Policy" value={entry.policy ?? "—"} />
          <InfoRow label="Governance Mode" value={entry.mode ?? "—"} />
          <InfoRow label="Approver" value={entry.approver ?? "—"} />
          <InfoRow label="Human Decision" value={entry.decision ?? "—"} />
          <InfoRow label="System Action / Evidence" value={entry.evidence ?? "—"} />
          <InfoRow label="Outcome" value={entry.result ?? "—"} />
          <InfoRow label="Environment" value={entry.env ?? "—"} />
        </div>
      </DialogContent>
    )
  }

  return null
}
