import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { KB_ARTICLES } from "@/data/knowledge"
import { QUALITY_RULES } from "@/data/quality"
import { useAppSelector } from "@/store/hooks"
import { selectAuditLog } from "@/store/audit-slice"
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
  { type: "affected-records" | "lineage" | "audit-detail" | "kb-article" | "help" }
>

export function ReadOnlyInfoModalBody({
  descriptor,
}: {
  descriptor: ReadOnlyDescriptor
}) {
  const auditLog = useAppSelector(selectAuditLog)

  if (descriptor.type === "help") {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Help &amp; Documentation</DialogTitle>
        </DialogHeader>
        <div className="p-5 text-xs leading-relaxed text-muted-foreground">
          <p>
            The Command Center surfaces supplier feed health, pipeline
            incidents, and data quality signals in one place. Use the sidebar
            to move between operational areas, and the Ask DataOps Agent panel
            for natural-language questions about any incident or supplier.
          </p>
        </div>
      </DialogContent>
    )
  }

  if (descriptor.type === "kb-article") {
    const article = KB_ARTICLES.find((item) => item.id === descriptor.articleId)
    if (!article) return null
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{article.id}</DialogTitle>
        </DialogHeader>
        <div className="p-5">
          <InfoRow label="Title" value={article.title} />
          <InfoRow label="Type" value={article.type} />
          <InfoRow label="Date" value={article.when} />
          <InfoRow label="Status" value={article.tag} />
        </div>
      </DialogContent>
    )
  }

  if (descriptor.type === "audit-detail") {
    const entry = auditLog.find((row) => row.id === descriptor.entryId)
    if (!entry) return null
    return (
      <DialogContent size="wide">
        <DialogHeader>
          <DialogTitle>Audit Entry Detail</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-x-6 p-5 sm:grid-cols-2">
          <InfoRow label="Timestamp" value={entry.ts} />
          <InfoRow label="Agent" value={entry.agent} />
          <InfoRow label="Action" value={entry.action} />
          <InfoRow label="Incident" value={entry.incident} />
          <InfoRow label="Supplier" value={entry.supplier} />
          <InfoRow label="Policy" value={entry.policy} />
          <InfoRow label="Governance Mode" value={entry.mode} />
          <InfoRow label="Approver" value={entry.approver} />
          <InfoRow label="Human Decision" value={entry.decision} />
          <InfoRow label="System Action / Evidence" value={entry.evidence} />
          <InfoRow label="Recommendation" value={entry.reco} />
          <InfoRow label="Outcome" value={entry.result} />
        </div>
      </DialogContent>
    )
  }

  const rule = QUALITY_RULES.find((item) => item.rule === descriptor.ruleId)
  if (!rule) return null

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {descriptor.type === "lineage" ? "Data Lineage" : "Affected Records"}
        </DialogTitle>
      </DialogHeader>
      <div className="p-5">
        <InfoRow label="Rule" value={rule.rule} />
        <InfoRow label="Dataset" value={rule.dataset} />
        <InfoRow label="Pipeline" value={rule.pipeline} />
        {descriptor.type === "affected-records" ? (
          <InfoRow label="Violations" value={`${rule.violations} of ${rule.checked} checked`} />
        ) : (
          <InfoRow
            label="Upstream Source"
            value={`${rule.dataset} is sourced from ${rule.pipeline} and validated against ${rule.dim}`}
          />
        )}
        <InfoRow label="Note" value={rule.note} />
      </div>
    </DialogContent>
  )
}
