import { ETL_INCIDENT } from "@/data/incidents"

export function EtlInvestigation() {
  return (
    <section
      id="investigation"
      className="scroll-mt-28 border border-border p-4"
    >
      <h2 className="mb-3 text-xs font-bold tracking-wide text-foreground uppercase">
        Investigation
      </h2>
      <div className="mb-3.5 grid grid-cols-2 gap-2.5 border border-border p-3.5 sm:grid-cols-4">
        <Field label="Stage" value={ETL_INCIDENT.stage} />
        <Field label="Error" value={ETL_INCIDENT.error} />
        <Field label="Affected" value={ETL_INCIDENT.affected.toLocaleString()} />
        <Field label="Total" value={ETL_INCIDENT.total.toLocaleString()} />
      </div>
      <p className="mb-2 text-[11px] font-bold text-foreground uppercase">
        Checks Performed
      </p>
      <ul className="flex flex-col gap-1.5">
        {ETL_INCIDENT.checks.map((check) => (
          <li
            key={check}
            className="border border-border bg-muted/20 px-3 py-2 text-[11.5px] text-foreground"
          >
            {check}
          </li>
        ))}
      </ul>
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
