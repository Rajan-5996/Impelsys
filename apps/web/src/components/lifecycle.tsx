import { matchPath, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { PipelineParticleField } from "@/components/pipeline-particle-field"
import { LIFECYCLE_STEPS, ROUTE_LIFECYCLE_STEP, ROUTES } from "@/constants/routes"
import type { LifecycleFlowStep } from "@/store/command-center-slice"

function useCurrentLifecycleStep() {
  const location = useLocation()
  const matchedPath = Object.values(ROUTES).find((path) =>
    matchPath(path, location.pathname)
  )
  if (!matchedPath) return null
  return ROUTE_LIFECYCLE_STEP[matchedPath] ?? null
}

export function LifecycleStepper() {
  const currentStep = useCurrentLifecycleStep()
  if (!currentStep) return null

  const currentIndex = LIFECYCLE_STEPS.indexOf(currentStep)

  return (
    <div className="flex items-center gap-0 border-b border-border/60 px-5 py-1.5">
      <span className="mr-3.5 border-r border-border pr-3.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
        Core Journey
      </span>
      {LIFECYCLE_STEPS.map((step, index) => {
        const isDone = index < currentIndex
        const isActive = index === currentIndex
        return (
          <span key={step} className="flex items-center">
            <span
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] font-bold tracking-wide uppercase",
                isActive && "text-primary",
                isDone && "text-status-good-ink",
                !isActive && !isDone && "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full bg-muted text-[9.5px] font-bold text-muted-foreground",
                  isActive && "bg-primary text-primary-foreground",
                  isDone && "bg-status-good text-status-good-foreground"
                )}
              >
                {isDone ? <CheckIcon className="size-2.5" /> : index + 1}
              </span>
              {step}
            </span>
            {index < LIFECYCLE_STEPS.length - 1 ? (
              <span className="mx-0.5 text-border">&rarr;</span>
            ) : null}
          </span>
        )
      })}
    </div>
  )
}

type LifecycleFlowDiagramProps = {
  steps: LifecycleFlowStep[]
}

const SIZE = 100
const CENTER = SIZE / 2
const NODE_RADIUS = 40
const NODE_SIZE_PCT = 18
const ARROW_TRIM = NODE_SIZE_PCT / 2 + 1.8
const ARROW_TRIM_DEG = (ARROW_TRIM / NODE_RADIUS) * (180 / Math.PI)

function pointOnCircle(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  }
}

function seededUnit(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function ScatteredParticles({
  from,
  to,
  seedBase,
}: {
  from: { x: number; y: number }
  to: { x: number; y: number }
  seedBase: number
}) {
  const dx = to.x - from.x
  const dy = to.y - from.y

  return (
    <>
      {[0, 1, 2].map((p) => {
        const seed = seedBase * 17 + p * 5
        const delay = seededUnit(seed + 1) * 2.4
        const duration = 2.2 + seededUnit(seed + 2) * 1.2

        return (
          <motion.circle
            key={p}
            r={0.5}
            fill="var(--color-primary)"
            initial={{ cx: from.x, cy: from.y, opacity: 0 }}
            animate={{
              cx: [from.x, from.x + dx * 0.15, from.x + dx * 0.85, to.x],
              cy: [from.y, from.y + dy * 0.15, from.y + dy * 0.85, to.y],
              opacity: [0, 0.9, 0.9, 0],
            }}
            transition={{
              repeat: Infinity,
              duration,
              delay,
              ease: "linear",
              times: [0, 0.15, 0.85, 1],
            }}
          />
        )
      })}
    </>
  )
}

export function LifecycleFlowDiagram({ steps }: LifecycleFlowDiagramProps) {
  const angleStep = 360 / steps.length
  const positions = steps.map((_, index) => pointOnCircle(-90 + index * angleStep, NODE_RADIUS))

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px]">
      <PipelineParticleField density={30} />
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <marker
            id="lifecycle-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="4.5"
            markerHeight="4.5"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="var(--color-primary)" />
          </marker>
        </defs>
        {steps.map((step, index) => {
          const from = positions[index]!
          const endAngle = -90 + (index + 1) * angleStep - ARROW_TRIM_DEG
          const to = pointOnCircle(endAngle, NODE_RADIUS)
          const d = `M ${from.x} ${from.y} A ${NODE_RADIUS} ${NODE_RADIUS} 0 0 1 ${to.x} ${to.y}`
          return (
            <g key={`${step.stage}-connector`}>
              <path
                d={d}
                fill="none"
                stroke="var(--color-primary)"
                strokeOpacity={0.7}
                strokeWidth={0.3}
                strokeDasharray="0.6 0.6"
                strokeLinecap="round"
                markerEnd="url(#lifecycle-arrow)"
                style={{ animation: "lifecycle-flow-dash 18s linear infinite" }}
              />
              <ScatteredParticles from={from} to={to} seedBase={index + 1} />
            </g>
          )
        })}
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center rounded-full"
        style={{
          left: "50%",
          top: "50%",
          width: "68%",
          height: "68%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, var(--color-standard) 0%, color-mix(in oklab, var(--color-standard) 88%, var(--color-accent) 12%) 10%, color-mix(in oklab, var(--color-standard) 62%, var(--color-accent) 38%) 19%, color-mix(in oklab, var(--color-accent) 75%, transparent) 29%, color-mix(in oklab, var(--color-accent) 46%, transparent) 38%, color-mix(in oklab, var(--color-accent) 22%, transparent) 48%, color-mix(in oklab, var(--color-accent) 8%, transparent) 58%, transparent 68%)",
          border: "none",
        }}
      >
        <p className="text-center text-[11px] font-bold tracking-wide text-white uppercase">
          Data
          <br />
          Lifecycle
        </p>
      </div>
      {steps.map((step, index) => {
        const { x, y } = positions[index]!
        return (
          <div
            key={step.stage}
            className="absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${NODE_SIZE_PCT}%`,
              height: `${NODE_SIZE_PCT}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              title={step.stage}
              className="relative flex size-full flex-col items-center justify-center rounded-full p-1.5 text-center shadow-sm transition-transform duration-200 hover:scale-110"
              style={{
                backgroundColor: "color-mix(in oklab, var(--color-primary) 10%, var(--color-card))",
                border: "1px solid color-mix(in oklab, var(--color-primary) 25%, var(--color-border))",
              }}
            >
              <span
                className="pointer-events-none absolute inset-[4%] rounded-full border"
                style={{ borderColor: "color-mix(in oklab, var(--color-primary) 30%, var(--color-border))" }}
              />
              <p className="w-full text-[10px] leading-none font-bold text-foreground">{step.count}</p>
              <p className="mt-0.5 w-full px-0.5 text-[6.5px] leading-[1.05] font-semibold break-words text-foreground">
                {step.stage}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
