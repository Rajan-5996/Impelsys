import { motion } from "framer-motion"

/** A single gradient capsule bar with tick dividers marking each discrete
 * unit -- for an "X of Y" count (e.g. feeds verified out of feeds received). */
export function GradientCapsule({
  filled,
  total,
  color,
}: {
  filled: number
  total: number
  color: string
}) {
  const count = Math.max(total, 1)
  const pct = Math.min(100, (filled / count) * 100)
  return (
    <div className="flex h-6 flex-col justify-center gap-1">
      <div className="relative h-3 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            background: `linear-gradient(90deg, color-mix(in oklab, ${color} 55%, transparent), ${color})`,
            boxShadow: `0 0 8px 0 color-mix(in oklab, ${color} 55%, transparent)`,
          }}
        />
        {Array.from({ length: count - 1 }).map((_, index) => (
          <span
            key={index}
            className="absolute inset-y-0 w-px bg-[var(--color-card)]"
            style={{ left: `${((index + 1) / count) * 100}%` }}
          />
        ))}
      </div>
    </div>
  )
}

/** A bar showing the current value against a target threshold marker -- the
 * classic bullet-graph pattern for "how close to target" percentages. */
export function BulletBar({
  pct,
  target = 90,
  color,
}: {
  pct: number
  target?: number
  color: string
}) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div className="flex h-6 flex-col justify-center gap-1">
      <div className="relative h-2.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            background: `linear-gradient(90deg, color-mix(in oklab, ${color} 60%, transparent), ${color})`,
          }}
        />
        <span
          className="absolute top-1/2 h-3 w-[2px] -translate-y-1/2 rounded-full bg-foreground/70"
          style={{ left: `${target}%` }}
        />
      </div>
      <span className="text-[9px] leading-none text-muted-foreground">Target {target}%</span>
    </div>
  )
}

/** Two real bars -- the KPI's own headline count next to the number parsed
 * from its own sub-text (e.g. anomalies flagged vs. suppliers they span) --
 * instead of a decorative shape unrelated to what the card actually says. */
export function CompareBars({
  primary,
  primaryLabel,
  secondary,
  secondaryLabel,
  color,
}: {
  primary: number
  primaryLabel: string
  secondary: number
  secondaryLabel: string
  color: string
}) {
  const max = Math.max(primary, secondary, 1)
  const bars = [
    { value: primary, label: primaryLabel, tone: color },
    { value: secondary, label: secondaryLabel, tone: `color-mix(in oklab, ${color} 45%, transparent)` },
  ]
  return (
    <div className="flex h-7 items-end gap-2.5">
      {bars.map((bar) => (
        <div key={bar.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
          <motion.div
            className="w-full rounded-t-md"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: Math.max(bar.value / max, 0.08) }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ height: "100%", transformOrigin: "bottom", background: bar.tone }}
          />
          <span className="text-[8px] leading-none whitespace-nowrap text-muted-foreground">
            {bar.value} {bar.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export function parseTotalFromSub(sub: string): number | null {
  const match = sub.match(/of\s+(\d+)/i)
  return match ? Number(match[1]) : null
}

/** Pulls the count out of an "across N suppliers"-style sub string. */
export function parseAcrossFromSub(sub: string): number | null {
  const match = sub.match(/across\s+(\d+)/i)
  return match ? Number(match[1]) : null
}
