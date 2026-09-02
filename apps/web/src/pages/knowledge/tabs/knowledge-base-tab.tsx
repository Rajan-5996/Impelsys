import { useEffect } from "react"
import { SearchIcon } from "lucide-react"

import { Input } from "@workspace/ui/components/input"

import { EmptyState } from "@/components/empty-state"
import { KbItem } from "@/components/knowledge-cards"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchKbArticles, selectKbArticles, selectKbSearch, setKbSearch } from "@/store/knowledge-slice"
import { openModal } from "@/store/ui-slice"

export function KnowledgeBaseTab() {
  const dispatch = useAppDispatch()
  const search = useAppSelector(selectKbSearch)
  const { data: articles, status, error } = useAppSelector(selectKbArticles)

  useEffect(() => {
    dispatch(fetchKbArticles())
  }, [dispatch])

  const query = search.trim().toLowerCase()
  const filtered = query
    ? articles.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.id.toLowerCase().includes(query)
      )
    : articles

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 border border-border bg-muted/30 px-2.5 py-1.5">
        <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => dispatch(setKbSearch(event.target.value))}
          placeholder="Search the knowledge base..."
          className="border-b-0"
        />
      </div>
      {status === "failed" ? (
        <EmptyState message={error ?? "Failed to load knowledge base articles."} />
      ) : status === "loading" || status === "idle" ? (
        <div className="h-40 animate-pulse rounded-md bg-muted/40" />
      ) : filtered.length === 0 ? (
        <EmptyState message="No knowledge base articles match your search." />
      ) : (
        filtered.map((article) => (
          <KbItem
            key={article.id}
            article={article}
            onClick={() =>
              dispatch(openModal({ type: "kb-article", articleId: article.id }))
            }
          />
        ))
      )}
    </div>
  )
}
