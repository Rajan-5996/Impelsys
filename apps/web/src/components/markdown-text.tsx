import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

const MARKDOWN_COMPONENTS: Components = {
  p: (props) => <p className="[&:not(:last-child)]:mb-2" {...props} />,
  a: (props) => <a className="underline hover:no-underline" target="_blank" rel="noreferrer" {...props} />,
  ul: (props) => <ul className="list-disc space-y-0.5 pl-4 [&:not(:last-child)]:mb-2" {...props} />,
  ol: (props) => <ol className="list-decimal space-y-0.5 pl-4 [&:not(:last-child)]:mb-2" {...props} />,
  code: (props) => <code className="rounded bg-black/10 px-1 py-0.5 font-mono text-[0.92em]" {...props} />,
}

/** Renders short, LLM-generated prose (root-cause summaries, investigation
 * trails, etc.) that may contain markdown -- bold/italic/lists/inline code --
 * with compact styling that inherits the caller's text size/color. */
export function MarkdownText({ children, className }: { children: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
