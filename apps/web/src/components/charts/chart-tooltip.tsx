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
    <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-[11px] shadow-md">
      {label ? <p className="mb-1 font-semibold text-foreground">{label}</p> : null}
      <div className="flex flex-col gap-0.5">
        {payload.map((entry, index) => (
          <p key={index} className="flex items-center gap-1.5 text-muted-foreground">
            {entry.color ? (
              <span
                className="inline-block size-2 rounded-full"
                style={{ background: entry.color }}
              />
            ) : null}
            <span className="font-semibold text-foreground">
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
