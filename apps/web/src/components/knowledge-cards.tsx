import type { KbArticle, Policy } from "@/data/knowledge"

type KbItemProps = {
  article: KbArticle
  onClick?: () => void
}

export function KbItem({ article, onClick }: KbItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-2 block w-full border border-border bg-card px-3.5 py-2.5 text-left transition-colors last:mb-0 hover:border-foreground/30"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-primary">
          {article.id}
        </span>
        <span className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
          {article.tag}
        </span>
      </div>
      <p className="mt-1 text-[12.5px] font-medium text-foreground">
        {article.title}
      </p>
      <p className="mt-1 text-[10.5px] text-muted-foreground">
        {article.type} &middot; {article.when}
      </p>
    </button>
  )
}

type PolicyCardProps = {
  policy: Policy
}

export function PolicyCard({ policy }: PolicyCardProps) {
  return (
    <div className="mb-2.5 border border-border p-3.5 last:mb-0">
      <div className="flex items-start justify-between gap-2.5">
        <span className="font-mono text-[12.5px] font-semibold text-primary">
          {policy.id}
        </span>
        <span className="shrink-0 rounded-none bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {policy.version}
        </span>
      </div>
      <p className="mt-1 text-[12.5px] font-semibold text-foreground">
        {policy.title}
      </p>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
        {policy.body}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2.5 border-t border-border pt-2.5 sm:grid-cols-4">
        <PolicyMeta label="Owner" value={policy.owner} />
        <PolicyMeta label="Effective" value={policy.effective} />
        <PolicyMeta label="Approval" value={policy.approval} />
        <PolicyMeta label="Pipelines" value={policy.pipelines} />
      </div>
    </div>
  )
}

function PolicyMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-[11.5px] font-semibold text-foreground">
        {value}
      </p>
    </div>
  )
}
