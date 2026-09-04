type ChartTooltipEntry = {
  value?: number | string
  name?: string
  color?: string
}

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean
  payload?: ChartTooltipEntry[]
  label?: string
  valueFormatter?: (value: number | string) => string
}) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="animate-in fade-in zoom-in-95 rounded-lg border border-primary/40 bg-primary px-2.5 py-1.5 text-[11px] shadow-lg duration-150">
      {label ? <p className="mb-1 font-semibold text-primary-foreground">{label}</p> : null}
      <div className="flex flex-col gap-0.5">
        {payload.map((entry, index) => (
          <p key={index} className="flex items-center gap-1.5 text-primary-foreground/80">
            {entry.color ? (
              <span
                className="inline-block size-2 rounded-full"
                style={{ background: entry.color }}
              />
            ) : null}
            <span className="font-semibold text-primary-foreground">
              {entry.value !== undefined
                ? valueFormatter
                  ? valueFormatter(entry.value)
                  : entry.value
                : ""}
            </span>
            {entry.name ? <span>{entry.name}</span> : null}
          </p>
        ))}
      </div>
    </div>
  )
}
