import databricksLogo from "@/assets/databricks.png"
import domoLogo from "@/assets/domo.png"
import snowflakeLogo from "@/assets/snowflake.png"

export type VendorSourceSystem = {
  name: string
  logo: string
}

const SNOWFLAKE: VendorSourceSystem = { name: "Snowflake", logo: snowflakeLogo }
const DATABRICKS: VendorSourceSystem = { name: "Databricks", logo: databricksLogo }
const DOMO: VendorSourceSystem = { name: "DOMO", logo: domoLogo }

const SOURCE_SYSTEMS = [SNOWFLAKE, DATABRICKS, DOMO]

// Blended pipelines -- these 4 vendors land feeds from more than one upstream
// system, everyone else ingests from a single source (below).
const MULTI_SOURCE_VENDORS: Record<string, VendorSourceSystem[]> = {
  "VEND-02": [SNOWFLAKE, DATABRICKS],
  "VEND-04": [DOMO, SNOWFLAKE],
  "VEND-06": [DATABRICKS, DOMO],
  "VEND-08": [SNOWFLAKE, DATABRICKS, DOMO],
}

export function sourceSystemsForVendor(vendorId: string): VendorSourceSystem[] {
  const multi = MULTI_SOURCE_VENDORS[vendorId]
  if (multi) return multi

  let hash = 0
  for (let i = 0; i < vendorId.length; i++) hash = (hash * 31 + vendorId.charCodeAt(i)) >>> 0
  return [SOURCE_SYSTEMS[hash % SOURCE_SYSTEMS.length]!]
}

export function sourceSystemForVendor(vendorId: string): VendorSourceSystem {
  return sourceSystemsForVendor(vendorId)[0]!
}
