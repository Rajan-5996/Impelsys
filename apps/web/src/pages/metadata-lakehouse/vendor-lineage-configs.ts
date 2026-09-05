import databricksLogo from "@/assets/databricks.png"
import domoLogo from "@/assets/domo.png"
import snowflakeLogo from "@/assets/snowflake.png"

import { sourceSystemsForVendor } from "@/lib/vendor-source-labels"

export interface VendorSourceNodeConfig {
  id: string
  title: string
  subtitle: string
  badgeCode: string
  logoSrc: string
  description: string
}

export interface VendorEtlStageConfig {
  id: string
  badgeCode: string
  stageNumber: number
  title: string
  subtitle: string
  description: string
  columnDependencies: string[]
  columnsOutput: string[]
}

export interface VendorLineageConfig {
  id: string
  name: string
  sourceNodes: VendorSourceNodeConfig[]
  pipelineCode: string
  pipelineTitle: string
  etlStages: VendorEtlStageConfig[]
}

const SOURCE_FLAVOR: Record<string, { subtitle: string; badgeCode: string; description: string }> = {
  Snowflake: { subtitle: "Cloud Data Warehouse", badgeCode: "SNOW", description: "Enterprise Snowflake staging schema landing structured order and billing data." },
  Databricks: { subtitle: "Delta Lakehouse Feed", badgeCode: "DBX", description: "Databricks Unity Catalog Delta table streaming curated operational records." },
  DOMO: { subtitle: "Cloud Stream Ingestion", badgeCode: "DOMO", description: "Real-time DOMO webhook stream delivering transactional feed records." },
}

const LOGO_BY_SYSTEM: Record<string, string> = {
  Snowflake: snowflakeLogo,
  Databricks: databricksLogo,
  DOMO: domoLogo,
}

/** Real per-vendor connector fan-in, sourced from the same lib the pipeline
 * dashboard's ConnectorsFeed uses -- source count/identity/logos are genuine,
 * not scripted, for every vendor. */
export function buildSourceNodesForVendor(vendorId: string): VendorSourceNodeConfig[] {
  return sourceSystemsForVendor(vendorId).map((system, index) => {
    const flavor = SOURCE_FLAVOR[system.name] ?? SOURCE_FLAVOR.DOMO!
    return {
      id: `src-${index + 1}`,
      title: `${system.name} Feed`,
      subtitle: flavor.subtitle,
      badgeCode: flavor.badgeCode,
      logoSrc: LOGO_BY_SYSTEM[system.name] ?? system.logo,
      description: flavor.description,
    }
  })
}

const FULL_COLUMNS = ["order_id", "customer_id", "product_code", "sales_amount", "discount_pct", "tax_rate", "region", "order_date", "currency", "customer_segment"]
const MID_COLUMNS = ["order_id", "customer_id", "product_code", "sales_amount", "region", "customer_segment"]

function stages(pipelineCode: string, rows: Array<[string, string, string, string[]]>) {
  return {
    pipelineCode,
    etlStages: rows.map(([title, subtitle, description, columnDependencies], i) => ({
      id: `etl-s${i + 1}`, badgeCode: `S${i + 1}`, stageNumber: i + 1,
      title, subtitle, description, columnDependencies,
      columnsOutput: i === 0 ? FULL_COLUMNS : MID_COLUMNS,
    })),
  }
}

/** ETL stage flavor text per real vendor id (VEND-01..08) -- the interactive
 * simulator's DAG/breakage engine stays generic, but the story each vendor's
 * pipeline tells is vendor-specific and kept from the original design. */
const VENDOR_ETL_FLAVOR: Record<string, { pipelineCode: string; pipelineTitle: string; etlStages: VendorEtlStageConfig[] }> = {
  "VEND-01": {
    pipelineTitle: "NorthStar Retail Omnichannel Stream",
    ...stages("NORTHSTAR_RETAIL_ETL", [
      ["Parse & Cleanse DOMO Payload", "DOMO Ingestion Sanitizer", "Parses inbound DOMO JSON stream, drops corrupted payloads, and casts primitive retail schemas.", ["order_id", "customer_id", "sales_amount"]],
      ["Retail Normalization & FX", "Multi-Currency USD Converter", "Standardizes retail store timestamps and converts regional currencies into base USD.", ["order_id", "customer_id", "currency", "sales_amount"]],
      ["Store Margin & Tax Rules", "Omnichannel Profit Engine", "Applies retail markdowns, promotional coupon discounts, and jurisdictional sales tax rates.", ["sales_amount", "discount_pct", "tax_rate"]],
      ["Curate & Export to Delta", "Retail Lakehouse Sync", "Partitions records by store region and writes to curated Delta tables for executive BI.", ["order_id", "customer_id", "product_code", "sales_amount", "region", "customer_segment"]],
    ]),
  },
  "VEND-02": {
    pipelineTitle: "Acme Supply Chain Fulfillment Engine",
    ...stages("ACME_SUPPLY_CHAIN_ETL", [
      ["Inventory Batch Ingestion", "Warehouse Snapshot Extractor", "Extracts daily warehouse pallet batches and validates inventory SKU records.", ["order_id", "customer_id"]],
      ["SKU Harmonization & Cleansing", "Global Parts Catalog Matcher", "Matches supplier catalog numbers to internal master catalog and reconciles units of measure.", ["order_id", "customer_id", "product_code"]],
      ["Volume Discount Rules", "Wholesale Tier Pricing Engine", "Calculates wholesale tier price breaks, bulk shipment surcharges, and partner rebates.", ["sales_amount", "discount_pct"]],
      ["Logistics Manifest Export", "Delta Lake Sync", "Exports validated supply manifest tables to the lakehouse for carrier dispatch optimization.", ["order_id", "customer_id", "product_code", "sales_amount", "region"]],
    ]),
  },
  "VEND-03": {
    pipelineTitle: "GlobalFeeds Telemetry & Billing Pipeline",
    ...stages("GLOBALFEEDS_STREAM_ETL", [
      ["Real-Time Feed Filter", "Micro-Batch Stream Deduplicator", "Filters redundant broadcasts and verifies micro-batch sequence headers.", ["order_id", "customer_id"]],
      ["Geo-Coordinate Standardizer", "Global GPS Alignment Engine", "Enriches sensor coordinates with international shipping region metadata and customs codes.", ["order_id", "customer_id", "region"]],
      ["Dynamic Surge Pricing Rules", "Tariff & Surcharge Engine", "Computes bandwidth utilization rates, peak transmission tariffs, and tiered billing quotas.", ["sales_amount", "discount_pct"]],
      ["Telemetry Lakehouse Export", "Gold Layer Billing Warehouse", "Publishes enriched telemetric billing datasets directly to executive reporting models.", ["order_id", "customer_id", "product_code", "sales_amount", "customer_segment"]],
    ]),
  },
  "VEND-04": {
    pipelineTitle: "Pacific Cross-Border Logistics Engine",
    ...stages("PACIFIC_LOGISTICS_ETL", [
      ["Partner EDI Ingestion", "EDIFACT & CSV Parser", "Translates standard EDI partner documents into structured relational frames.", ["order_id", "customer_id"]],
      ["Tariff & Customs Cleansing", "HS Code Verification Engine", "Verifies international Harmonized System commodity codes and scrubs duty records.", ["order_id", "customer_id", "product_code"]],
      ["Freight & Route Cost Rules", "Distance Matrix Cost Engine", "Applies ocean carrier bunker fuel surcharges and container demurrage allowances.", ["sales_amount", "discount_pct", "tax_rate"]],
      ["Carrier Manifest Export", "Logistics Analytics Store", "Consolidates shipment routing tables into high-performance lakehouse storage.", ["order_id", "customer_id", "product_code", "sales_amount", "region"]],
    ]),
  },
  "VEND-05": {
    pipelineTitle: "Summit High-Volume B2B Sales Flow",
    ...stages("SUMMIT_B2B_SALES_ETL", [
      ["Bulk Order Sanitizer", "High-Volume Row Validator", "Ingests large-volume B2B purchase orders, strips duplicate billing lines, checks tax IDs.", ["order_id", "customer_id"]],
      ["Account Credit Scoring", "Risk & Terms Engine", "Computes buyer net-payment term limits, risk grading, and early settlement discounts.", ["order_id", "customer_id", "sales_amount"]],
      ["Contract Rebate Engine", "Annual Volume Incentive Rules", "Calculates cumulative purchase incentives, tiered cash rebates, and marketing funds.", ["sales_amount", "discount_pct"]],
      ["Ledger Warehouse Write", "ERP Financial Staging Table", "Writes verified revenue lines to the financial ledger for GL synchronization.", ["order_id", "customer_id", "product_code", "sales_amount", "region"]],
    ]),
  },
  "VEND-06": {
    pipelineTitle: "BlueRiver Telematics & Cargo Pipeline",
    ...stages("BLUERIVER_SHIPMENT_ETL", [
      ["Cold-Chain Telemetry Ingest", "Sensor Ping Validator", "Ingests continuous refrigerated cargo temperature streams and flags excursions.", ["order_id", "customer_id"]],
      ["Route Efficiency Standardizer", "Transit Delay Estimator", "Compares live truck GPS telemetry against planned lanes and estimates arrival time.", ["order_id", "region"]],
      ["SLA Penalty Calculations", "Contract Demurrage Engine", "Computes carrier SLA penalties for delayed shipments and detention charges.", ["sales_amount", "discount_pct"]],
      ["Dispatch Metric Store Sync", "Carrier Operations Lake", "Exports verified transit and cold-chain compliance matrices for executive BI.", ["order_id", "customer_id", "product_code", "sales_amount", "region"]],
    ]),
  },
  "VEND-07": {
    pipelineTitle: "Cascade Commodity Clearing Stream",
    ...stages("CASCADE_COMMODITIES_ETL", [
      ["Trade Order Ingestion", "Tick Stream Normalizer", "Parses trading floor ticket numbers, validates counterparty codes, standardizes trade time.", ["order_id", "customer_id"]],
      ["Spot Price Reconciler", "Market Index FX Harmonizer", "Reconciles execution prices against global exchange benchmark indices.", ["order_id", "currency", "sales_amount"]],
      ["Broker Commission Rules", "Clearing Margin Engine", "Applies exchange transaction fees, clearing margins, and tiered brokerage commissions.", ["sales_amount", "tax_rate"]],
      ["Settlement Ledger Export", "Institutional Lakehouse Store", "Exports audit-ready trade blotters to the financial risk warehouse for reporting.", ["order_id", "customer_id", "product_code", "sales_amount", "region"]],
    ]),
  },
  "VEND-08": {
    pipelineTitle: "Ironclad Omni-Channel Commerce Pipeline",
    ...stages("IRONCLAD_COMMERCE_ETL", [
      ["Multi-Source Feed Ingest", "Hybrid Lakehouse Combiner", "Blends webshop orders, storefront receipts, and wholesale requests into one frame.", ["order_id", "customer_id"]],
      ["Omni-Channel Normalization", "Global Basket Currency Engine", "Standardizes product identifiers and translates shopping cart values into USD.", ["order_id", "product_code", "currency"]],
      ["Loyalty & Promo Valuation", "Customer Rewards Calculation", "Calculates reward point redemption, multi-buy bundles, and tiered loyalty rebates.", ["sales_amount", "discount_pct"]],
      ["Enterprise Gold Sync", "Centralized Lakehouse Gold", "Publishes unified omnichannel customer performance tables to the analytics lake.", ["order_id", "customer_id", "product_code", "sales_amount", "region", "customer_segment"]],
    ]),
  },
}

const DEFAULT_FLAVOR = VENDOR_ETL_FLAVOR["VEND-01"]!

export function getVendorLineageConfig(vendorId: string, vendorName: string): VendorLineageConfig {
  const flavor = VENDOR_ETL_FLAVOR[vendorId] ?? DEFAULT_FLAVOR
  return {
    id: vendorId,
    name: vendorName,
    sourceNodes: buildSourceNodesForVendor(vendorId),
    pipelineCode: flavor.pipelineCode,
    pipelineTitle: flavor.pipelineTitle,
    etlStages: flavor.etlStages,
  }
}
