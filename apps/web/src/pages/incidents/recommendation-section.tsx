type RecommendationField = {
  label: string
  value: string
}

type RecommendationSectionProps = {
  body: string
  fields: RecommendationField[]
}

export function RecommendationSection({
  body,
  fields,
}: RecommendationSectionProps) {
  return (
    <section
      id="recommendation"
      className="scroll-mt-28 border border-border p-4"
    >
      <h2 className="mb-3 text-xs font-bold tracking-wide text-foreground uppercase">
        Agent Recommendation
      </h2>
      <p className="mb-3 text-xs leading-relaxed text-foreground">{body}</p>
      <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 sm:grid-cols-4">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
              {field.label}
            </p>
            <p className="mt-0.5 text-[11.5px] font-semibold text-foreground">
              {field.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
