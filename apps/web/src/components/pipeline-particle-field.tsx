import { useEffect, useRef } from "react"

import { cn } from "@workspace/ui/lib/utils"

type Particle = {
  x: number
  y: number
  r: number
  speed: number
  drift: number
  phase: number
  hue: "primary" | "accent"
}

function hexToRgb(hex: string) {
  const clean = hex.trim().replace("#", "")
  const num = parseInt(clean, 16)
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`
}

function readThemeColors() {
  const style = getComputedStyle(document.documentElement)
  return {
    primary: hexToRgb(style.getPropertyValue("--primary") || "#7030B1"),
    accent: hexToRgb(style.getPropertyValue("--accent") || "#B56DD3"),
  }
}

function makeParticle(width: number, height: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.6 + 0.6,
    speed: Math.random() * 0.35 + 0.12,
    drift: Math.random() * 0.6 - 0.3,
    phase: Math.random() * Math.PI * 2,
    hue: Math.random() > 0.6 ? "accent" : "primary",
  }
}

type PipelineParticleFieldProps = {
  active?: boolean
  density?: number
  className?: string
}

export function PipelineParticleField({
  active = false,
  density = 46,
  className,
}: PipelineParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion) return

    let width = 0
    let height = 0
    let particles: Particle[] = []
    let frame = 0
    const colors = readThemeColors()

    function resize() {
      const rect = canvas!.parentElement!.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas!.width = width * dpr
      canvas!.height = height * dpr
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = Array.from({ length: density }, () => makeParticle(width, height))
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas.parentElement!)
    resize()

    function tick() {
      const speedMul = activeRef.current ? 2.6 : 1
      const opacityMul = activeRef.current ? 1 : 0.55
      ctx!.clearRect(0, 0, width, height)
      for (const p of particles) {
        p.y -= p.speed * speedMul
        p.x += Math.sin(p.phase + frame * 0.01) * p.drift * 0.15
        if (p.y < -4) {
          p.y = height + 4
          p.x = Math.random() * width
        }
        const twinkle = 0.55 + 0.45 * Math.sin(p.phase + frame * 0.04)
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${colors[p.hue]}, ${twinkle * 0.5 * opacityMul})`
        ctx!.fill()
      }
      frame += 1
      raf = requestAnimationFrame(tick)
    }

    let raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [density])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
    />
  )
}
