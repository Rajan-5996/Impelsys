export const ROUTES = {
  commandCenter: "/",
  suppliers: "/suppliers",
  supplierDetail: "/suppliers/:supplierId",
  pipeline: "/pipeline",
  connectors: "/connectors",
  quality: "/quality",
  datasetDetail: "/quality/datasets/:datasetId",
  scorecards: "/scorecards",
  agents: "/agents",
  knowledge: "/knowledge",
  audit: "/audit",
  settings: "/settings",
  incidents: "/incidents",
  runDetail: "/incidents/runs/:runId",
} as const

export function supplierDetailPath(supplierId: string) {
  return `/suppliers/${supplierId}`
}

export function runDetailPath(runId: string) {
  return `/incidents/runs/${runId}`
}

export function datasetDetailPath(datasetId: string) {
  return `/quality/datasets/${datasetId}`
}

export function pathForScreenLink(screen: string, id: string) {
  if (screen === "supplier") return supplierDetailPath(id)
  if (screen === "dataset") return datasetDetailPath(id)
  if (screen === "scorecard") return "/scorecards"
  return "/"
}

export type LifecycleStep = "Detect" | "Diagnose" | "Resolve" | "Validate" | "Score"

export const LIFECYCLE_STEPS: LifecycleStep[] = [
  "Detect",
  "Diagnose",
  "Resolve",
  "Validate",
  "Score",
]

export const ROUTE_LIFECYCLE_STEP: Record<string, LifecycleStep | null> = {
  [ROUTES.commandCenter]: null,
  [ROUTES.suppliers]: "Detect",
  [ROUTES.supplierDetail]: "Detect",
  [ROUTES.pipeline]: "Diagnose",
  [ROUTES.connectors]: null,
  [ROUTES.quality]: "Validate",
  [ROUTES.datasetDetail]: "Validate",
  [ROUTES.scorecards]: "Score",
  [ROUTES.agents]: null,
  [ROUTES.knowledge]: null,
  [ROUTES.audit]: null,
  [ROUTES.settings]: null,
  [ROUTES.incidents]: null,
  [ROUTES.runDetail]: null,
}
