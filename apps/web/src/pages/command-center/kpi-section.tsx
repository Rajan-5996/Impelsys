import { KpiCard } from "@/components/kpi-card"
import { KPI_DEFS } from "@/data/command-center"

export function KpiSection() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
      {KPI_DEFS.map((kpi, index) => (
        <KpiCard key={kpi.label} kpi={kpi} index={index} />
      ))}
    </div>
  )
}
