export function SummarySection({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <section id="summary" className="scroll-mt-28 border border-border p-4">
      <h2 className="mb-2 text-xs font-bold tracking-wide text-foreground uppercase">
        Summary
      </h2>
      <p className="mb-1 text-sm font-semibold text-foreground">{title}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
    </section>
  )
}
