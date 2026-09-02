import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { EmptyState } from "@/components/empty-state"
import { SettingsSectionDetail } from "@/pages/settings/settings-section-detail"
import { SECTIONS, type IconTint, type SectionKey } from "@/pages/settings/settings-sections"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchSettings, selectSettings, selectSettingsError, selectSettingsStatus } from "@/store/system-slice"

const TINT_CLASS: Record<IconTint, string> = {
  primary: "bg-primary/10 text-primary",
  info: "bg-status-info/10 text-status-info",
  good: "bg-status-good/10 text-status-good-ink",
  warning: "bg-status-warning/15 text-status-warning-foreground",
  serious: "bg-status-serious/15 text-status-serious-foreground",
}

export function SettingsPage() {
  const dispatch = useAppDispatch()
  const [active, setActive] = useState<SectionKey | null>(null)
  const settings = useAppSelector(selectSettings)
  const status = useAppSelector(selectSettingsStatus)
  const error = useAppSelector(selectSettingsError)
  const activeSection = SECTIONS.find((section) => section.key === active) ?? null

  useEffect(() => {
    dispatch(fetchSettings())
  }, [dispatch])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          Governance, environment, and platform configuration
        </p>
      </div>

      {status === "failed" ? (
        <EmptyState message={error ?? "Failed to load settings."} />
      ) : status === "loading" || status === "idle" || !settings ? (
        <div className="h-96 animate-pulse rounded-md bg-muted/40" />
      ) : (
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {activeSection ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="flex w-full items-center gap-2 border-b border-border px-4 py-3 text-left text-[11.5px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeftIcon className="size-3.5" />
                  Back to Settings
                </button>
                <div className="p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl",
                        TINT_CLASS[activeSection.tint]
                      )}
                    >
                      <activeSection.icon className="size-5" />
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-foreground">{activeSection.label}</h2>
                      <p className="text-[11px] text-muted-foreground">{activeSection.description}</p>
                    </div>
                  </div>
                  <SettingsSectionDetail section={activeSection} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {SECTIONS.map((section) => (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => setActive(section.key)}
                    className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-muted/40"
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl",
                        TINT_CLASS[section.tint]
                      )}
                    >
                      <section.icon className="size-4.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-bold text-foreground">
                        {section.label}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {section.description}
                      </span>
                    </span>
                    <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
