export const ROUTES = {
  commandCenter: "/",
  suppliers: "/suppliers",
  supplierDetail: "/suppliers/:supplierId",
  pipeline: "/pipeline",
  incident: "/incidents/:incidentId",
  quality: "/quality",
  datasetDetail: "/quality/datasets/:datasetId",
  scorecards: "/scorecards",
  agents: "/agents",
  knowledge: "/knowledge",
  audit: "/audit",
  settings: "/settings",
} as const

export function supplierDetailPath(supplierId: string) {
  return `/suppliers/${supplierId}`
}

export function incidentPath(incidentId: string) {
  return `/incidents/${incidentId}`
}

export function datasetDetailPath(datasetId: string) {
  return `/quality/datasets/${datasetId}`
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
  [ROUTES.incident]: "Diagnose",
  [ROUTES.quality]: "Validate",
  [ROUTES.datasetDetail]: "Validate",
  [ROUTES.scorecards]: "Score",
  [ROUTES.agents]: null,
  [ROUTES.knowledge]: null,
  [ROUTES.audit]: null,
  [ROUTES.settings]: null,
}
