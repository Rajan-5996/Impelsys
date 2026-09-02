import { KpiCard, type AccentKey } from "@/components/kpi-card"
import { DQ_KPI_DEFS } from "@/data/quality"

const ACCENT: AccentKey[] = ["up", "info", "info", "down", "flat"]

export function QualityKpiRow() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
      {DQ_KPI_DEFS.map((kpi, index) => (
        <KpiCard
          key={kpi.label}
          index={index}
          kpi={{
            label: kpi.label,
            value: kpi.value,
            sub: "",
            delta: null,
            accent: ACCENT[index] ?? "info",
          }}
        />
      ))}
    </div>
  )
}
