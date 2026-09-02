import { CheckIcon, XIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { NORTHSTAR_INCIDENT } from "@/data/incidents"

const DOT_CLASS = {
  pass: "bg-status-good",
  fail: "bg-status-critical",
  pending: "bg-muted-foreground/40",
}

export function NorthstarInvestigation() {
  return (
    <section
      id="investigation"
      className="scroll-mt-28 border border-border p-4"
    >
      <h2 className="mb-3 text-xs font-bold tracking-wide text-foreground uppercase">
        Investigation
      </h2>
      <div className="relative mb-4 pl-6">
        <div className="absolute top-1.5 bottom-1.5 left-2 w-px bg-border" />
        {NORTHSTAR_INCIDENT.timeline.map((step) => (
          <div key={step.label} className="relative pb-3.5 last:pb-0">
            <span
              className={cn(
                "absolute -left-6 flex size-4 items-center justify-center rounded-full border-2 border-background",
                DOT_CLASS[step.state]
              )}
            >
              {step.state === "pass" ? (
                <CheckIcon className="size-2.5 text-white" />
              ) : null}
              {step.state === "fail" ? (
                <XIcon className="size-2.5 text-white" />
              ) : null}
            </span>
            <p className="text-[12px] font-semibold text-foreground">
              {step.label}
            </p>
            <p className="text-[11px] text-muted-foreground">{step.result}</p>
          </div>
        ))}
      </div>
      <div className="border border-accent/30 bg-accent/10 p-3.5">
        <p className="mb-2 text-[11px] font-bold text-accent uppercase">
          Root Cause Assessment &middot; {NORTHSTAR_INCIDENT.confidence}% confidence
        </p>
        <div className="mb-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <Field label="Expected Volume" value={NORTHSTAR_INCIDENT.expectedVolume} />
          <Field label="Normal Range" value={NORTHSTAR_INCIDENT.normalRange} />
          <Field label="Received" value={NORTHSTAR_INCIDENT.received} />
          <Field label="Actual" value={NORTHSTAR_INCIDENT.actual} />
          <Field label="Deviation" value={NORTHSTAR_INCIDENT.deviation} />
        </div>
        <p className="text-xs leading-relaxed text-foreground">
          {NORTHSTAR_INCIDENT.conclusion}
        </p>
      </div>
    </section>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-[11.5px] font-semibold text-foreground">{value}</p>
    </div>
  )
}
