import { motion } from "framer-motion"
import { FileIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { apiFileUrl } from "@/lib/axios-instance"
import { FLOW_GAP_WIDTH, NODE_STYLE } from "@/lib/stage-visual"
import type { VendorSourceSystem } from "@/lib/vendor-source-labels"
import type { RunFile } from "@/store/runs-slice"

export const CONNECTOR_BOX_HEIGHT = 64
export const CONNECTOR_GAP = 20
export const CONNECTOR_FUNNEL_WIDTH = FLOW_GAP_WIDTH
const PACKETS_PER_CONNECTOR = 3

function seededUnit(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function cubicBezierPoint(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
) {
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

function DataPackets({
  from,
  control1,
  control2,
  to,
  seedBase,
}: {
  from: { x: number; y: number }
  control1: { x: number; y: number }
  control2: { x: number; y: number }
  to: { x: number; y: number }
  seedBase: number
}) {
  const samples = [0, 0.2, 0.4, 0.6, 0.8, 1].map((t) =>
    cubicBezierPoint(t, from, control1, control2, to)
  )
  const cx = samples.map((point) => point.x)
  const cy = samples.map((point) => point.y)

  return (
    <>
      {Array.from({ length: PACKETS_PER_CONNECTOR }).map((_, packet) => {
        const seed = seedBase * 17 + packet * 5
        const delay = seededUnit(seed + 1) * 1.8
        const duration = 2 + seededUnit(seed + 2) * 1
        return (
          <motion.circle
            key={packet}
            r={2.5}
            fill="var(--color-primary)"
            style={{ filter: "drop-shadow(0 0 3px var(--color-primary))" }}
            initial={{ opacity: 0 }}
            animate={{ cx, cy, opacity: [0, 1, 1, 1, 1, 0] }}
            transition={{
              repeat: Infinity,
              duration,
              delay,
              ease: "linear",
            }}
          />
        )
      })}
    </>
  )
}

export function ConnectorsFeed({
  sources,
  stretch = false,
}: {
  sources: VendorSourceSystem[]
  stretch?: boolean
}) {
  if (sources.length === 0) return null
  const totalHeight =
    sources.length * CONNECTOR_BOX_HEIGHT + (sources.length - 1) * CONNECTOR_GAP
  const centerY = totalHeight / 2

  return (
    <div className="flex items-center" style={{ flexGrow: stretch ? 1 : 0, flexShrink: 0 }}>
      <div className="flex shrink-0 flex-col" style={{ gap: CONNECTOR_GAP }}>
        {sources.map((source) => (
          <div
            key={source.name}
            className="flex shrink-0 items-center gap-2.5 rounded-xl border border-border bg-muted/20 px-3.5"
            style={{ height: CONNECTOR_BOX_HEIGHT }}
          >
            <img src={source.logo} alt="" className="size-7 object-contain" />
            <span className="text-[11px] font-semibold text-foreground">{source.name}</span>
          </div>
        ))}
      </div>
      <svg
        width="100%"
        height={totalHeight}
        viewBox={`0 0 ${CONNECTOR_FUNNEL_WIDTH} ${totalHeight}`}
        preserveAspectRatio="none"
        className="block overflow-visible"
        style={{ flex: `1 1 ${CONNECTOR_FUNNEL_WIDTH}px`, minWidth: CONNECTOR_FUNNEL_WIDTH }}
        aria-hidden
      >
        {sources.map((source, index) => {
          const fromY = index * (CONNECTOR_BOX_HEIGHT + CONNECTOR_GAP) + CONNECTOR_BOX_HEIGHT / 2
          const midX = CONNECTOR_FUNNEL_WIDTH * 0.5
          const from = { x: 0, y: fromY }
          const control1 = { x: midX, y: fromY }
          const control2 = { x: midX, y: centerY }
          const to = { x: CONNECTOR_FUNNEL_WIDTH, y: centerY }
          return (
            <g key={source.name}>
              <path
                d={`M ${from.x} ${from.y} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${to.x} ${to.y}`}
                fill="none"
                stroke="var(--color-border)"
                strokeDasharray="3 4"
                strokeWidth={1.5}
              />
              <DataPackets
                from={from}
                control1={control1}
                control2={control2}
                to={to}
                seedBase={index + 1}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

const OUTPUT_NODE_SIZE = 56
const OUTPUT_NODE_GAP = 20
const OUTPUT_BRANCH_WIDTH = FLOW_GAP_WIDTH

/** The mirror image of ConnectorsFeed at the other end of the pipeline row --
 * once a run's output files exist, this replaces the plain "Done" node with
 * the files themselves, fanned out and downloadable, exactly like the
 * connectors fan into the flow at the start. */
export function PipelineOutputBranch({ runId, files }: { runId: string; files: RunFile[] }) {
  if (files.length === 0) return null
  const blockHeight = OUTPUT_NODE_SIZE + 22
  const totalHeight = files.length * blockHeight + (files.length - 1) * OUTPUT_NODE_GAP
  const fromY = totalHeight / 2
  const midX = OUTPUT_BRANCH_WIDTH * 0.5

  return (
    <div className="flex items-center" style={{ flexGrow: 1, flexShrink: 0 }}>
      <svg
        width="100%"
        height={totalHeight}
        viewBox={`0 0 ${OUTPUT_BRANCH_WIDTH} ${totalHeight}`}
        preserveAspectRatio="none"
        className="block overflow-visible"
        style={{ flex: `1 1 ${OUTPUT_BRANCH_WIDTH}px`, minWidth: OUTPUT_BRANCH_WIDTH }}
        aria-hidden
      >
        {files.map((file, index) => {
          const toY = index * (blockHeight + OUTPUT_NODE_GAP) + OUTPUT_NODE_SIZE / 2
          return (
            <path
              key={file.filename}
              d={`M 0 ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${OUTPUT_BRANCH_WIDTH} ${toY}`}
              fill="none"
              stroke="var(--color-border)"
              strokeDasharray="3 4"
              strokeWidth={1.5}
            />
          )
        })}
      </svg>
      <div className="flex shrink-0 flex-col" style={{ gap: OUTPUT_NODE_GAP }}>
        {files.map((file) => (
          <a
            key={file.filename}
            href={apiFileUrl(`/smart-etl/runs/${runId}/files/${file.filename}`)}
            download={file.filename}
            className="relative flex shrink-0"
            style={{ width: OUTPUT_NODE_SIZE, height: OUTPUT_NODE_SIZE }}
          >
            <span
              className={cn(
                "flex items-center justify-center rounded-full border-2 shadow-sm",
                NODE_STYLE.done
              )}
              style={{ width: OUTPUT_NODE_SIZE, height: OUTPUT_NODE_SIZE }}
            >
              <FileIcon className="size-6" />
            </span>
            <span className="absolute top-full left-1/2 mt-1.5 w-max max-w-24 -translate-x-1/2 text-center text-[9.5px] font-semibold whitespace-nowrap text-foreground">
              {file.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
