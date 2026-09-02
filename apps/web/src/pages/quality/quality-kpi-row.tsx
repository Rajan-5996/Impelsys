import { useEffect } from "react"

import { KpiCard, type AccentKey } from "@/components/kpi-card"
import { fetchQualityDatasets, selectQualityDatasets } from "@/store/quality-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

export function QualityKpiRow() {
  const dispatch = useAppDispatch()
  const { data: datasets, status } = useAppSelector(selectQualityDatasets)

  useEffect(() => {
    dispatch(fetchQualityDatasets())
  }, [dispatch])

  if (status === "loading" || status === "idle") {
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-[76px] animate-pulse rounded-xl bg-muted/40" />
        ))}
      </div>
    )
  }

  const scored = datasets.filter((dataset) => dataset.score !== null)
  const overallScore = scored.length
    ? Math.round((scored.reduce((sum, d) => sum + (d.score ?? 0), 0) / scored.length) * 10) / 10
    : 0
  const rulesTotal = datasets.reduce((sum, d) => sum + d.rulesTotal, 0)
  const failedTotal = datasets.reduce((sum, d) => sum + d.failed, 0)
  const issuesOpen = datasets.reduce((sum, d) => sum + d.failed + d.warning, 0)

  const kpis: { label: string; value: string; accent: AccentKey }[] = [
    { label: "Enterprise Data Quality Score", value: `${overallScore}%`, accent: "up" },
    { label: "Datasets Monitored", value: String(datasets.length), accent: "info" },
    { label: "Rules Evaluated", value: rulesTotal.toLocaleString(), accent: "info" },
    { label: "Critical Rule Failures", value: String(failedTotal), accent: failedTotal > 0 ? "down" : "up" },
    { label: "Quality Issues Open", value: String(issuesOpen), accent: issuesOpen > 0 ? "down" : "up" },
  ]

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
      {kpis.map((kpi, index) => (
        <KpiCard
          key={kpi.label}
          index={index}
          kpi={{ label: kpi.label, value: kpi.value, sub: "", delta: null, accent: kpi.accent }}
        />
      ))}
    </div>
  )
}
