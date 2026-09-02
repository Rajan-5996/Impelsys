import Papa from "papaparse"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@workspace/ui/lib/utils"

const RAINBOW_HEADER_CLASSES = [
  "bg-primary/15 text-primary",
  "bg-standard/15 text-standard",
  "bg-accent/20 text-accent-foreground",
  "bg-status-good/15 text-status-good-ink",
  "bg-status-info/15 text-status-info-foreground",
  "bg-status-warning/20 text-status-warning-foreground",
  "bg-status-critical/15 text-status-critical-ink",
  "bg-status-serious/20 text-status-serious-foreground",
]

const MARKDOWN_COMPONENTS: Components = {
  h1: (props) => <h1 className="mt-4 mb-2 text-lg font-bold text-foreground first:mt-0" {...props} />,
  h2: (props) => <h2 className="mt-4 mb-2 text-base font-bold text-foreground first:mt-0" {...props} />,
  h3: (props) => <h3 className="mt-3 mb-1.5 text-sm font-bold text-foreground" {...props} />,
  p: (props) => <p className="mb-3 text-[12.5px] leading-relaxed text-muted-foreground" {...props} />,
  a: (props) => (
    <a className="text-primary underline hover:no-underline" target="_blank" rel="noreferrer" {...props} />
  ),
  ul: (props) => <ul className="mb-3 list-disc space-y-1 pl-5 text-[12.5px] text-muted-foreground" {...props} />,
  ol: (props) => <ol className="mb-3 list-decimal space-y-1 pl-5 text-[12.5px] text-muted-foreground" {...props} />,
  code: (props) => (
    <code className="rounded bg-muted/50 px-1 py-0.5 font-mono text-[11px] text-foreground" {...props} />
  ),
  pre: (props) => (
    <pre
      className="mb-3 overflow-x-auto rounded-md bg-muted/30 p-3 text-[11px] [&_code]:bg-transparent [&_code]:p-0"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote className="mb-3 border-l-2 border-border pl-3 text-[12.5px] text-muted-foreground italic" {...props} />
  ),
  table: (props) => <table className="mb-3 w-full border-collapse text-[11.5px]" {...props} />,
  th: (props) => (
    <th className="border border-border bg-muted/40 px-2 py-1 text-left font-semibold text-foreground" {...props} />
  ),
  td: (props) => <td className="border border-border px-2 py-1 text-muted-foreground" {...props} />,
  hr: (props) => <hr className="my-4 border-border" {...props} />,
}

function MarkdownView({ source }: { source: string }) {
  return (
    <div className="max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
        {source}
      </ReactMarkdown>
    </div>
  )
}

function PdfView({ base64 }: { base64: string }) {
  return (
    <embed
      src={`data:application/pdf;base64,${base64}`}
      type="application/pdf"
      className="h-[75vh] w-full rounded-md border border-border"
    />
  )
}

function CsvView({ source }: { source: string }) {
  const parsed = Papa.parse<string[]>(source.trim(), { skipEmptyLines: true })
  const rows = parsed.data
  if (rows.length === 0) {
    return <p className="text-[11px] text-muted-foreground">Empty CSV file.</p>
  }
  const [header, ...body] = rows

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr>
            {header.map((cell, index) => (
              <th
                key={index}
                className={cn(
                  "border-b border-border px-2.5 py-1.5 text-left font-semibold whitespace-nowrap",
                  RAINBOW_HEADER_CLASSES[index % RAINBOW_HEADER_CLASSES.length]
                )}
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border last:border-b-0 hover:bg-muted/30">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-2.5 py-1.5 whitespace-nowrap text-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CodeView({ source }: { source: string }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-muted/30 p-3 font-mono text-[11px] leading-relaxed">
      <code>{source}</code>
    </pre>
  )
}

export function FileSourceView({ language, sourceCode }: { language: string; sourceCode: string }) {
  if (language === "markdown") return <MarkdownView source={sourceCode} />
  if (language === "pdf") return <PdfView base64={sourceCode} />
  if (language === "csv") return <CsvView source={sourceCode} />
  return <CodeView source={sourceCode} />
}
