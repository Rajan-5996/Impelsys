export type SupplierStatus =
  | "healthy"
  | "critical"
  | "investigating"
  | "delayed"
  | "missing"

export type SupplierTier = "Preferred" | "Approved" | "Monitor" | "At Risk"

export type SupplierBreakdown = {
  delivery: number
  sla: number
  quality: number
  incidents: number
  rejected: number
}

export type SupplierDrivers = {
  lateFeeds: number
  schemaIssues: number
  productCodeFailures: number
  slaCompliance: number
}

export type Supplier = {
  id: string
  name: string
  feed: string
  region: string
  method: string
  owner: string
  freq: string
  expectedTime: string
  sla: string
  avgVolume: number
  normalRange: [number, number]
  fileSize: string
  format: string
  pipeline: string
  criticality: "Critical" | "High" | "Medium" | "Low"
  tier: SupplierTier
  score: number
  statusToday: SupplierStatus
  received: string
  actual: number
  deviation: number | null
  schemaStatus: string
  agentStatus: string
  breakdown: SupplierBreakdown
  trendHist: number[]
  insight: string
  drivers?: SupplierDrivers
}

export const REGIONS = [
  "North America",
  "Europe",
  "Asia Pacific",
  "Latin America",
]

export const METHODS = ["SFTP", "API", "Cloud Storage", "Database Feed"]

export const SUPPLIERS: Supplier[] = [
  {
    id: "apex", name: "Apex Data", feed: "Retail Sales Consolidated Feed", region: "North America", method: "API", owner: "Enterprise Data Engineering", freq: "Daily", expectedTime: "05:30", sla: "06:00", avgVolume: 642000, normalRange: [600000, 690000], fileSize: "118 MB", format: "Parquet", pipeline: "SALES_DAILY_ETL", criticality: "High", tier: "Preferred", score: 99, statusToday: "healthy", received: "05:24", actual: 648112, deviation: 0.9, schemaStatus: "Stable", agentStatus: "Nominal",
    breakdown: { delivery: 100, sla: 99, quality: 99, incidents: 100, rejected: 98 }, trendHist: [98, 98, 99, 99, 98, 99, 99, 99, 99, 99, 99, 99, 99, 99],
    insight: "Consistently early with zero schema drift over 90 days. Model supplier for the Preferred tier.",
  },
  {
    id: "northstar", name: "NorthStar Data", feed: "Daily Sales Feed", region: "North America", method: "SFTP", owner: "Supplier Data Operations", freq: "Daily", expectedTime: "06:15", sla: "07:00", avgVolume: 1020000, normalRange: [950000, 1100000], fileSize: "214 MB", format: "CSV (pipe-delimited)", pipeline: "SALES_DAILY_ETL", criticality: "Critical", tier: "Preferred", score: 97, statusToday: "critical", received: "06:12", actual: 218431, deviation: -78.6, schemaStatus: "Stable", agentStatus: "Investigation completed",
    breakdown: { delivery: 98, sla: 97, quality: 96, incidents: 92, rejected: 99 }, trendHist: [96, 97, 97, 98, 97, 98, 97, 97, 98, 97, 97, 98, 97, 97],
    insight: "Trailing 30-day composite remains strong at 97. Today's critical volume anomaly is under active investigation and will factor into tomorrow's recompute.",
  },
  {
    id: "datasphere", name: "DataSphere", feed: "Transaction Line Feed", region: "Europe", method: "API", owner: "Supplier Data Operations", freq: "Daily", expectedTime: "05:45", sla: "06:30", avgVolume: 847000, normalRange: [790000, 900000], fileSize: "176 MB", format: "JSON Lines", pipeline: "SALES_DAILY_ETL", criticality: "High", tier: "Approved", score: 88, statusToday: "investigating", received: "05:41", actual: 851204, deviation: 0.5, schemaStatus: "Stable", agentStatus: "Investigation in progress",
    breakdown: { delivery: 92, sla: 90, quality: 79, incidents: 82, rejected: 88 }, trendHist: [90, 90, 91, 90, 89, 89, 88, 89, 88, 88, 87, 88, 88, 88],
    insight: "6 points below the Preferred threshold of 94, driven by today's Customer Validation failure and two prior CUSTOMER_ID incidents in the last 45 days.",
  },
  {
    id: "globalfeeds", name: "GlobalFeeds", feed: "Multi-Channel Product Feed", region: "Asia Pacific", method: "Cloud Storage", owner: "Supplier Management", freq: "Daily", expectedTime: "04:30", sla: "06:00", avgVolume: 402880, normalRange: [370000, 430000], fileSize: "94 MB", format: "XML", pipeline: "GLOBALFEEDS_INTAKE_ETL", criticality: "Medium", tier: "Monitor", score: 74, statusToday: "delayed", received: "05:52", actual: 398210, deviation: -1.2, schemaStatus: "2 changes pending review", agentStatus: "Review recommended",
    breakdown: { delivery: 70, sla: 81, quality: 71, incidents: 75, rejected: 80 }, trendHist: [85, 84, 83, 82, 81, 80, 79, 79, 78, 77, 76, 75, 75, 74],
    drivers: { lateFeeds: 7, schemaIssues: 3, productCodeFailures: 5, slaCompliance: 81 },
    insight: "Reliability has declined over the last 30 days. The primary drivers are increased delivery delays and repeated PRODUCT_CODE validation failures. Supplier review is recommended.",
  },
  {
    id: "meridian", name: "Meridian Analytics", feed: "Store Traffic Feed", region: "North America", method: "Database Feed", owner: "Enterprise Data Engineering", freq: "Daily", expectedTime: "03:15", sla: "04:00", avgVolume: 210000, normalRange: [190000, 230000], fileSize: "41 MB", format: "Parquet", pipeline: "TRAFFIC_DAILY_ETL", criticality: "Medium", tier: "Preferred", score: 96, statusToday: "healthy", received: "03:09", actual: 211884, deviation: 0.9, schemaStatus: "Stable", agentStatus: "Nominal",
    breakdown: { delivery: 97, sla: 96, quality: 97, incidents: 96, rejected: 95 }, trendHist: [95, 95, 96, 96, 95, 96, 96, 96, 96, 97, 96, 96, 96, 96], insight: "Stable performer with minor SLA variance limited to weekends.",
  },
  {
    id: "blueharbor", name: "Blue Harbor Logistics", feed: "Shipment Events Feed", region: "Europe", method: "API", owner: "Enterprise Data Engineering", freq: "Intraday, 4 times daily", expectedTime: "Rolling", sla: "Within 30 min", avgVolume: 88000, normalRange: [75000, 100000], fileSize: "19 MB", format: "API (REST/JSON)", pipeline: "LOGISTICS_EVENTS_ETL", criticality: "High", tier: "Preferred", score: 95, statusToday: "healthy", received: "On schedule", actual: 91340, deviation: 3.8, schemaStatus: "Stable", agentStatus: "Nominal",
    breakdown: { delivery: 96, sla: 95, quality: 95, incidents: 94, rejected: 94 }, trendHist: [94, 94, 95, 95, 94, 95, 95, 94, 95, 95, 95, 95, 95, 95], insight: "High-frequency API feed with strong throughput consistency.",
  },
  {
    id: "falcon", name: "Falcon Retail Data", feed: "POS Transactions Feed", region: "North America", method: "SFTP", owner: "Supplier Data Operations", freq: "Daily", expectedTime: "02:00", sla: "03:00", avgVolume: 1340000, normalRange: [1250000, 1420000], fileSize: "302 MB", format: "CSV", pipeline: "POS_DAILY_ETL", criticality: "Critical", tier: "Preferred", score: 93, statusToday: "healthy", received: "01:52", actual: 1318442, deviation: -1.6, schemaStatus: "Stable", agentStatus: "Nominal",
    breakdown: { delivery: 94, sla: 92, quality: 93, incidents: 92, rejected: 92 }, trendHist: [92, 92, 93, 93, 92, 93, 93, 92, 93, 93, 93, 93, 93, 93], insight: "Largest daily volume supplier, consistently within tolerance.",
  },
  {
    id: "vertex", name: "Vertex Supply Co", feed: "Inventory Snapshot Feed", region: "North America", method: "Cloud Storage", owner: "Enterprise Data Engineering", freq: "Daily", expectedTime: "01:00", sla: "02:00", avgVolume: 512000, normalRange: [470000, 550000], fileSize: "88 MB", format: "Parquet", pipeline: "INVENTORY_SYNC_ETL", criticality: "High", tier: "Preferred", score: 92, statusToday: "healthy", received: "00:58", actual: 508110, deviation: -0.8, schemaStatus: "Stable", agentStatus: "Nominal",
    breakdown: { delivery: 93, sla: 91, quality: 92, incidents: 91, rejected: 91 }, trendHist: [91, 91, 92, 92, 91, 92, 92, 91, 92, 92, 92, 92, 92, 92], insight: "Reliable overnight batch with no incidents in 60 days.",
  },
  {
    id: "orion", name: "Orion Commerce", feed: "Order Header Feed", region: "Latin America", method: "API", owner: "Enterprise Data Engineering", freq: "Daily", expectedTime: "05:00", sla: "06:00", avgVolume: 298000, normalRange: [270000, 320000], fileSize: "54 MB", format: "JSON Lines", pipeline: "SALES_DAILY_ETL", criticality: "Medium", tier: "Preferred", score: 91, statusToday: "healthy", received: "04:51", actual: 301220, deviation: 1.1, schemaStatus: "Stable", agentStatus: "Nominal",
    breakdown: { delivery: 92, sla: 90, quality: 91, incidents: 90, rejected: 90 }, trendHist: [90, 90, 91, 91, 90, 91, 91, 90, 91, 91, 91, 91, 91, 91], insight: "Consistent mid-size feed with minor validity warnings on promotional codes.",
  },
  {
    id: "summit", name: "Summit Freight", feed: "Carrier Rate Feed", region: "North America", method: "SFTP", owner: "Enterprise Data Engineering", freq: "Weekly, Monday", expectedTime: "07:00", sla: "09:00", avgVolume: 42000, normalRange: [36000, 48000], fileSize: "9 MB", format: "CSV", pipeline: "FREIGHT_RATES_ETL", criticality: "Low", tier: "Preferred", score: 90, statusToday: "healthy", received: "06:44", actual: 43110, deviation: 2.6, schemaStatus: "Stable", agentStatus: "Nominal",
    breakdown: { delivery: 91, sla: 89, quality: 90, incidents: 90, rejected: 89 }, trendHist: [88, 89, 89, 90, 89, 90, 90, 89, 90, 90, 90, 90, 90, 90], insight: "Low criticality feed with a steady weekly delivery cadence.",
  },
  {
    id: "redwood", name: "Redwood Analytics", feed: "Web Clickstream Feed", region: "Europe", method: "Cloud Storage", owner: "Enterprise Data Engineering", freq: "Daily", expectedTime: "04:00", sla: "05:00", avgVolume: 2100000, normalRange: [1900000, 2300000], fileSize: "410 MB", format: "Parquet", pipeline: "CLICKSTREAM_ETL", criticality: "Medium", tier: "Approved", score: 85, statusToday: "healthy", received: "03:58", actual: 2142880, deviation: 2.0, schemaStatus: "Stable", agentStatus: "Nominal",
    breakdown: { delivery: 87, sla: 85, quality: 84, incidents: 83, rejected: 86 }, trendHist: [83, 83, 84, 84, 83, 84, 85, 84, 85, 85, 85, 85, 85, 85], insight: "Improving trend, two consecutive months without a schema incident.",
  },
  {
    id: "pinnacle", name: "Pinnacle Vendors", feed: "Returns and Refunds Feed", region: "Asia Pacific", method: "SFTP", owner: "Supplier Management", freq: "Daily", expectedTime: "06:30", sla: "08:00", avgVolume: 64000, normalRange: [55000, 72000], fileSize: "12 MB", format: "CSV", pipeline: "RETURNS_DAILY_ETL", criticality: "Medium", tier: "At Risk", score: 70, statusToday: "missing", received: "Not received", actual: 0, deviation: null, schemaStatus: "Not assessed", agentStatus: "Escalated to supplier management",
    breakdown: { delivery: 60, sla: 58, quality: 74, incidents: 70, rejected: 78 }, trendHist: [76, 75, 74, 73, 73, 72, 72, 71, 71, 71, 70, 70, 70, 70], insight: "Missed today's SLA window entirely, the third missed or late delivery in 14 days. Candidate for tier downgrade review.",
  },
]

export function findSupplier(id: string) {
  return SUPPLIERS.find((supplier) => supplier.id === id)
}

export function findSupplierByName(name: string) {
  return SUPPLIERS.find((supplier) => supplier.name === name)
}
