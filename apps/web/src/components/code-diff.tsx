import { useState } from "react"
import { diffLines } from "diff"
import { CheckIcon, CopyIcon, SparklesIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type DiffRow = {
  left: string | null
  right: string | null
  changed: boolean
}

function splitLines(value: string): string[] {
  const lines = value.split("\n")
  if (lines[lines.length - 1] === "") lines.pop()
  return lines
}

function buildSideBySideRows(before: string, after: string): DiffRow[] {
  const parts = diffLines(before, after)
  const rows: DiffRow[] = []
  let i = 0

  while (i < parts.length) {
    const part = parts[i]!
    if (!part.added && !part.removed) {
      for (const line of splitLines(part.value)) rows.push({ left: line, right: line, changed: false })
      i++
      continue
    }

    let removedLines: string[] = []
    let addedLines: string[] = []
    if (part.removed) {
      removedLines = splitLines(part.value)
      i++
    }
    const next = parts[i]
    if (next?.added) {
      addedLines = splitLines(next.value)
      i++
    }

    const max = Math.max(removedLines.length, addedLines.length)
    for (let k = 0; k < max; k++) {
      rows.push({ left: removedLines[k] ?? null, right: addedLines[k] ?? null, changed: true })
    }
  }

  return rows
}

/** A GitHub-style split (side-by-side) script diff -- existing script on the
 * left, the agent's corrected script on the right, changed lines highlighted.
 * Clicking a changed line reveals why the agent changed it. */
export function ScriptDiff({
  before,
  after,
  reason,
}: {
  before: string
  after: string
  reason?: string | null
}) {
  const rows = buildSideBySideRows(before, after)
  const [openRow, setOpenRow] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(after)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable -- non-fatal, the script is still selectable/readable
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="grid grid-cols-2 gap-x-2 bg-white">
        <div className="flex items-center gap-1.5 rounded-t-md border border-b-0 border-border bg-muted/30 px-3 py-2">
          <p className="text-[11px] font-semibold text-foreground">Existing Script</p>
        </div>
        <div className="flex items-center justify-between gap-1.5 rounded-t-md border border-b-0 border-primary/30 bg-primary/10 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <SparklesIcon className="size-3.5 text-primary" />
            <p className="text-[11px] font-bold tracking-wide text-primary uppercase">
              AI Self-Healing Fix
            </p>
          </div>
          <Button variant="ghost" size="xs" onClick={handleCopy}>
            {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
      <div className="max-h-96 overflow-auto bg-white font-mono text-[10.5px] leading-relaxed">
        {rows.map((row, index) => {
          const isLast = index === rows.length - 1
          return (
          <div key={index} className="flex flex-col gap-x-2">
            <div className="grid grid-cols-2 gap-x-2">
              <button
                type="button"
                disabled={!row.changed || !reason}
                onClick={() => setOpenRow((current) => (current === index ? null : index))}
                className={cn(
                  "flex min-w-0 items-start gap-1.5 overflow-x-auto border-x border-border px-2.5 py-0.5 text-left whitespace-pre text-foreground",
                  isLast && "rounded-b-md border-b",
                  row.changed ? "bg-status-critical/35" : "bg-card",
                  row.changed && reason && "cursor-pointer hover:bg-status-critical/45"
                )}
              >
                <span className="w-2.5 shrink-0 font-bold text-status-critical-ink select-none">
                  {row.changed && row.left !== null ? "-" : ""}
                </span>
                <span>{row.left ?? " "}</span>
              </button>
              <button
                type="button"
                disabled={!row.changed || !reason}
                onClick={() => setOpenRow((current) => (current === index ? null : index))}
                className={cn(
                  "flex min-w-0 items-start gap-1.5 overflow-x-auto border-x border-primary/30 px-2.5 py-0.5 text-left whitespace-pre text-foreground",
                  isLast && "rounded-b-md border-b",
                  row.changed ? "bg-status-good/25" : "bg-card",
                  row.changed && reason && "cursor-pointer hover:bg-status-good/35"
                )}
              >
                <span className="w-2.5 shrink-0 font-bold text-status-good-ink select-none">
                  {row.changed && row.right !== null ? "+" : ""}
                </span>
                <span>{row.right ?? " "}</span>
              </button>
            </div>
            {openRow === index && reason ? (
              <div className="flex items-start gap-1.5 border-t border-b border-primary/25 bg-primary/10 px-3 py-2">
                <SparklesIcon className="mt-0.5 size-3 shrink-0 text-primary" />
                <p className="text-[11px] leading-relaxed text-foreground">{reason}</p>
              </div>
            ) : null}
          </div>
          )
        })}
      </div>
    </div>
  )
}
