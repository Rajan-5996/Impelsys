import { motion } from "framer-motion"
import { FileIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { apiFileUrl } from "@/lib/axios-instance"
import { NODE_STYLE } from "@/lib/stage-visual"
import type { VendorSourceSystem } from "@/lib/vendor-source-labels"
import type { RunFile } from "@/store/runs-slice"

export const CONNECTOR_BOX_WIDTH = 124
export const CONNECTOR_GAP = 24
export const CONNECTOR_FUNNEL_HEIGHT = 76
// Matches the fixed w-24 (96px) stage-node column width in StageFlow's "lg"
// size, so this funnel's line lands exactly on the Ingestion node's center.
export const INGESTION_NODE_X = 48
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

export function ConnectorsFeed({ sources }: { sources: VendorSourceSystem[] }) {
  if (sources.length === 0) return null
  const totalWidth =
    sources.length * CONNECTOR_BOX_WIDTH + (sources.length - 1) * CONNECTOR_GAP

  return (
    <div className="flex flex-col overflow-x-auto">
      <div style={{ width: totalWidth }}>
        <div className="flex flex-nowrap items-start" style={{ gap: CONNECTOR_GAP }}>
          {sources.map((source) => (
            <div
              key={source.name}
              className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl border border-border bg-muted/20 px-3 py-3.5"
              style={{ width: CONNECTOR_BOX_WIDTH }}
            >
              <img src={source.logo} alt="" className="size-8 object-contain" />
              <span className="text-[11px] font-semibold text-foreground">{source.name}</span>
            </div>
          ))}
        </div>
        <svg
          width={totalWidth}
          height={CONNECTOR_FUNNEL_HEIGHT}
          viewBox={`0 0 ${totalWidth} ${CONNECTOR_FUNNEL_HEIGHT}`}
          className="overflow-visible"
          aria-hidden
        >
          {sources.map((source, index) => {
            const fromX = index * (CONNECTOR_BOX_WIDTH + CONNECTOR_GAP) + CONNECTOR_BOX_WIDTH / 2
            const midY = CONNECTOR_FUNNEL_HEIGHT * 0.6
            const from = { x: fromX, y: 0 }
            const control1 = { x: fromX, y: midY }
            const control2 = { x: INGESTION_NODE_X, y: midY }
            const to = { x: INGESTION_NODE_X, y: CONNECTOR_FUNNEL_HEIGHT }
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
    </div>
  )
}

const OUTPUT_NODE_SIZE = 56
const OUTPUT_NODE_GAP = 20
const OUTPUT_BRANCH_WIDTH = 72

/** The mirror image of ConnectorsFeed at the other end of the pipeline row --
 * once a run's output files exist, this replaces the plain "Done" node with
 * the files themselves, fanned out and downloadable, exactly like the
 * connectors fan into Ingestion at the start. */
export function PipelineOutputBranch({ runId, files }: { runId: string; files: RunFile[] }) {
  if (files.length === 0) return null
  const blockHeight = OUTPUT_NODE_SIZE + 22
  const totalHeight = files.length * blockHeight + (files.length - 1) * OUTPUT_NODE_GAP
  const fromY = totalHeight / 2
  const midX = OUTPUT_BRANCH_WIDTH * 0.5

  return (
    <div className="flex flex-1 items-center">
      <div className="h-px min-w-9 flex-1 bg-border" />
      <svg
        width={OUTPUT_BRANCH_WIDTH}
        height={totalHeight}
        className="shrink-0 overflow-visible"
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
            className="flex flex-col items-center gap-1.5"
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
            <span className="max-w-24 text-center text-[9.5px] font-semibold whitespace-nowrap text-foreground">
              {file.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
