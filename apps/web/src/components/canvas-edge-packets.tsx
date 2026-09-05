import { motion } from "framer-motion"

export type Point = { x: number; y: number }

function seededUnit(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function cubicBezierPoint(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const mt = 1 - t
  const a = mt * mt * mt
  const b = 3 * mt * mt * t
  const c = 3 * mt * t * t
  const d = t * t * t
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  }
}

const PACKETS_PER_EDGE = 3

export function EdgePackets({ from, to, seedBase }: { from: Point; to: Point; seedBase: number }) {
  const midY = from.y + (to.y - from.y) * 0.5
  const control1 = { x: from.x, y: midY }
  const control2 = { x: to.x, y: midY }
  const samples = [0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => cubicBezierPoint(t, from, control1, control2, to))
  const cx = samples.map((p) => p.x)
  const cy = samples.map((p) => p.y)

  return (
    <>
      {Array.from({ length: PACKETS_PER_EDGE }).map((_, packet) => {
        const seed = seedBase * 17 + packet * 5
        const delay = seededUnit(seed + 1) * 1.8
        const duration = 2 + seededUnit(seed + 2) * 1
        return (
          <motion.circle
            key={packet}
            r={3}
            fill="var(--color-primary)"
            style={{ filter: "drop-shadow(0 0 3px var(--color-primary))" }}
            initial={{ opacity: 0 }}
            animate={{ cx, cy, opacity: [0, 1, 1, 1, 1, 0] }}
            transition={{ repeat: Infinity, duration, delay, ease: "linear" }}
          />
        )
      })}
    </>
  )
}
