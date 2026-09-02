import { AnimatePresence, motion } from "framer-motion"
import { ChevronDownIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

export function CollapsibleCard({
  title,
  open,
  onOpenChange,
  headerExtra,
  children,
}: {
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  headerExtra?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader
        role="button"
        tabIndex={0}
        onClick={() => onOpenChange(!open)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onOpenChange(!open)
        }}
        className="cursor-pointer select-none"
      >
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">
          {headerExtra}
          <ChevronDownIcon
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </div>
      </CardHeader>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <CardContent>{children}</CardContent>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  )
}
