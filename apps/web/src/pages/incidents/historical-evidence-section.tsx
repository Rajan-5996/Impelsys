import { KbItem } from "@/components/knowledge-cards"
import { KB_ARTICLES } from "@/data/knowledge"
import { ETL_INCIDENT } from "@/data/incidents"
import { useAppDispatch } from "@/store/hooks"
import { openModal } from "@/store/ui-slice"

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <section
      id="historical-evidence"
      className="scroll-mt-28 border border-border p-4"
    >
      <h2 className="mb-3 text-xs font-bold tracking-wide text-foreground uppercase">
        Historical Evidence
      </h2>
      {children}
    </section>
  )
}

const NORTHSTAR_RELATED_IDS = ["RCA-2026-0218", "SOP-DATAINTAKE-004"]

export function NorthstarHistoricalEvidence() {
  const dispatch = useAppDispatch()
  const articles = KB_ARTICLES.filter((article) =>
    NORTHSTAR_RELATED_IDS.includes(article.id)
  )

  return (
    <Wrapper>
      {articles.map((article) => (
        <KbItem
          key={article.id}
          article={article}
          onClick={() =>
            dispatch(openModal({ type: "kb-article", articleId: article.id }))
          }
        />
      ))}
    </Wrapper>
  )
}

export function EtlHistoricalEvidence() {
  const dispatch = useAppDispatch()

  return (
    <Wrapper>
      {ETL_INCIDENT.similar.map((similar) => (
        <div key={similar.id} className="mb-2.5 border border-border p-3.5 last:mb-0">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[12.5px] font-bold text-primary">
              {similar.id}
            </span>
            <span className="text-[13px] font-extrabold text-foreground">
              {similar.pct}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {similar.date} &middot; {similar.supplier} &middot; {similar.pipeline}
          </p>
          <p className="mt-2 text-[11.5px] text-foreground">{similar.failure}</p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Root cause: </span>
            {similar.rootCause}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Resolution: </span>
            {similar.resolution}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Outcome: </span>
            {similar.outcome}
          </p>
          <button
            type="button"
            onClick={() =>
              dispatch(
                openModal({ type: "compare-resolution", similarId: similar.id })
              )
            }
            className="mt-2.5 bg-primary/10 px-2.5 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/20"
          >
            Compare Resolution
          </button>
        </div>
      ))}
    </Wrapper>
  )
}
