export function SegmentedPills({
  filled,
  total,
  color,
}: {
  filled: number
  total: number
  color: string
}) {
  const count = Math.max(total, 1)
  return (
    <div className="flex h-6 items-center gap-1">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className="h-2.5 flex-1 rounded-full"
          style={{
            background: index < filled ? color : "var(--color-muted)",
          }}
        />
      ))}
    </div>
  )
}

export function DotCluster({
  count,
  max = 5,
  color,
}: {
  count: number
  max?: number
  color: string
}) {
  const total = Math.max(max, count, 1)
  return (
    <div className="flex h-6 items-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className="size-2.5 shrink-0 rounded-full transition-colors"
          style={{
            background: index < count ? color : "var(--color-muted)",
          }}
        />
      ))}
    </div>
  )
}

export function MiniBar({ pct, color }: { pct: number; color: string }) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div className="flex h-6 flex-col justify-center gap-1">
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${clamped}%`, background: color }} />
      </div>
      <div className="flex justify-between">
        {[0, 25, 50, 75, 100].map((tick) => (
          <span key={tick} className="h-1 w-px bg-border" />
        ))}
      </div>
    </div>
  )
}

function seededUnit(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function hashSeed(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return hash
}

export function MiniColumnChart({
  seed,
  color,
  count = 8,
}: {
  seed: string
  color: string
  count?: number
}) {
  const hash = hashSeed(seed)
  const heights = Array.from({ length: count }, (_, index) => 0.3 + seededUnit(hash + index * 13 + 1) * 0.65)
  const highlightIndex = count - 1

  return (
    <div className="flex h-7 items-end justify-between gap-1">
      {heights.map((height, index) => (
        <span
          key={index}
          className="w-1.5 shrink-0 rounded-full"
          style={{
            height: `${Math.round(height * 100)}%`,
            background:
              index === highlightIndex
                ? color
                : `color-mix(in oklab, ${color} 32%, transparent)`,
          }}
        />
      ))}
    </div>
  )
}

export function parseTotalFromSub(sub: string): number | null {
  const match = sub.match(/of\s+(\d+)/i)
  return match ? Number(match[1]) : null
}
