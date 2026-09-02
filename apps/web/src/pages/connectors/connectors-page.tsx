import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { StatusChip } from "@/components/status-chip"
import { CONNECTORS, type Connector, type ConnectorTint } from "@/pages/connectors/connectors-data"
import { GithubConnectorPanel } from "@/pages/connectors/github-connector-panel"
import { useAppDispatch } from "@/store/hooks"
import { pushToast } from "@/store/ui-slice"

const TINT_CLASS: Record<ConnectorTint, string> = {
  primary: "border-primary/30 bg-primary/10 text-primary",
  standard: "border-standard/30 bg-standard/10 text-standard",
  accent: "border-accent/30 bg-accent/10 text-accent",
}

function ConnectorBadge({ connector, size }: { connector: Connector; size: "sm" | "lg" }) {
  const boxSize = size === "sm" ? "size-11" : "size-12"
  const iconSize = size === "sm" ? "size-5" : "size-6"

  if (connector.logo) {
    return (
      <span className={cn("shrink-0 overflow-hidden rounded-lg", boxSize)}>
        <img src={connector.logo} alt={`${connector.name} logo`} className="size-full object-cover" />
      </span>
    )
  }

  const Icon = connector.icon
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border",
        boxSize,
        TINT_CLASS[connector.tint]
      )}
    >
      {Icon ? <Icon className={iconSize} /> : null}
    </span>
  )
}

function ConnectorCard({
  connector,
  index,
  onSelect,
}: {
  connector: Connector
  index: number
  onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="group flex w-full flex-col gap-3 rounded-xl border border-border p-4 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <ConnectorBadge connector={connector} size="sm" />
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <div>
        <p className="text-[13px] font-bold text-foreground">{connector.name}</p>
        <p className="text-[10.5px] font-semibold tracking-wide text-muted-foreground uppercase">
          {connector.category}
        </p>
      </div>
      <p className="text-[11.5px] text-muted-foreground">{connector.description}</p>
      <StatusChip
        variant={connector.status === "Connected" ? "ok" : "neutral"}
        className="w-fit"
      >
        {connector.status}
      </StatusChip>
    </motion.button>
  )
}

function ConnectorDetail({
  connector,
  onBack,
}: {
  connector: Connector
  onBack: () => void
}) {
  const dispatch = useAppDispatch()
  const isConnected = connector.status === "Connected"

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="rounded-xl border border-border shadow-sm"
    >
      <button
        type="button"
        onClick={onBack}
        className="flex w-full items-center gap-2 border-b border-border px-4 py-3 text-left text-[11.5px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        Back to Connectors
      </button>
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <ConnectorBadge connector={connector} size="lg" />
            <div>
              <h2 className="text-sm font-bold text-foreground">{connector.name}</h2>
              <p className="text-[11px] text-muted-foreground">{connector.category}</p>
            </div>
          </div>
          <StatusChip variant={isConnected ? "ok" : "neutral"}>
            {connector.status}
          </StatusChip>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          {connector.detail}
        </p>

        {connector.id === "github" ? (
          <GithubConnectorPanel />
        ) : (
          <>
            <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-2">
              <div className="border border-border p-3">
                <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Owner
                </p>
                <p className="mt-0.5 text-[12px] font-semibold text-foreground">
                  {connector.owner}
                </p>
              </div>
              <div className="border border-border p-3">
                <p className="text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Last Sync
                </p>
                <p className="mt-0.5 text-[12px] font-semibold text-foreground">
                  {connector.lastSync}
                </p>
              </div>
            </div>

            <Button
              variant={isConnected ? "outline" : "default"}
              size="sm"
              onClick={() =>
                dispatch(
                  pushToast(
                    isConnected
                      ? `Disconnected from ${connector.name}.`
                      : `Connected to ${connector.name}.`,
                    "success"
                  )
                )
              }
            >
              {isConnected ? "Disconnect" : "Connect"}
            </Button>
          </>
        )}
      </div>
    </motion.div>
  )
}

export function ConnectorsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = CONNECTORS.find((connector) => connector.id === selectedId) ?? null

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Connectors</h1>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          External systems integrated with the DataOps agents
        </p>
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {selected ? (
            <ConnectorDetail
              key={selected.id}
              connector={selected}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {CONNECTORS.map((connector, index) => (
                <ConnectorCard
                  key={connector.id}
                  connector={connector}
                  index={index}
                  onSelect={() => setSelectedId(connector.id)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
