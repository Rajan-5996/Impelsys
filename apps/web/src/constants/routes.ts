export const ROUTES = {
  commandCenter: "/",
  supplierDetail: "/suppliers/:supplierId",
  pipeline: "/pipeline",
  pipelineVendorDetail: "/pipeline/:vendorId",
  connectors: "/connectors",
  datasetDetail: "/quality/datasets/:datasetId",
  scorecards: "/scorecards",
  agents: "/agents",
  knowledge: "/knowledge",
  audit: "/audit",
  settings: "/settings",
  incidents: "/incidents",
  runDetail: "/incidents/runs/:runId",
  dataAnalystAgent: "/data-analyst-agent",
  metadataLakehouse: "/metadata-lakehouse",
} as const

export function supplierDetailPath(supplierId: string) {
  return `/suppliers/${supplierId}`
}

export function runDetailPath(runId: string) {
  return `/incidents/runs/${runId}`
}

export function pipelineVendorDetailPath(vendorId: string) {
  return `/pipeline/${vendorId}`
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
