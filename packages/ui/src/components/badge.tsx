import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@workspace/ui/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider whitespace-nowrap uppercase [&_svg]:pointer-events-none [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        primary: "border-primary/30 bg-primary/10 text-primary",
        secondary: "border-secondary/40 bg-secondary/60 text-secondary-foreground",
        outline: "border-border bg-transparent text-foreground",
        standard: "border-standard/30 bg-standard/10 text-standard",
        warning: "border-warning/40 bg-warning/15 text-warning-foreground",
        accent: "border-accent/30 bg-accent/10 text-accent",
        muted: "border-border bg-muted text-muted-foreground",
        "status-critical":
          "border-transparent bg-status-critical text-status-critical-foreground",
        "status-serious":
          "border-transparent bg-status-serious text-status-serious-foreground",
        "status-warning":
          "border-transparent bg-status-warning text-status-warning-foreground",
        "status-good":
          "border-transparent bg-status-good text-status-good-foreground",
        "status-info":
          "border-transparent bg-status-info text-status-info-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  render = <span />,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    state: {
      slot: "badge",
    },
  })
}

export { Badge, badgeVariants }
