export type SimulationRule = {
  triggerStatus: "warning" | "error"
  triggerMessage: string
  culpritEntity: string
  impactedEtlStages: string[]
  brokenPbiVisuals: string[]
  technicalRemediation: string
  affectedNodes: Record<string, { status: "error" | "warning"; errorMessage: string }>
}

/** Realistic, defensible data-engineering failure-propagation trees, keyed by
 * the node id a user clicked to simulate a breakage at. Kept as pure data
 * (unmodified from the original interactive simulator) so every failure
 * scenario the feature ever supported still works exactly the same. */
export const SIMULATION_RULES: Record<string, SimulationRule> = {
  "anom-schema": {
    triggerStatus: "warning",
    triggerMessage: "The incoming feed is missing its product code column, which I need to categorize products.",
    culpritEntity: "A missing product code column",
    impactedEtlStages: ["Curate & Export (Stage 4)"],
    brokenPbiVisuals: ["Product Category Revenue Split"],
    technicalRemediation: "I noticed the incoming data is missing its product code column. Without it I can't match products to their categories, so the product-catalog checks failed and the final export step couldn't finish building the catalog. That's why the Product Category dashboard is unavailable right now. Everything else — revenue, regions, and the first three pipeline steps — is still healthy.",
    affectedNodes: {
      "dq-ref": { status: "error", errorMessage: "Can't verify these products against the master catalog without a product code." },
      "dq-complete": { status: "error", errorMessage: "Every row in this batch is missing its product code." },
      "etl-s4": { status: "error", errorMessage: "Couldn't join the product catalog — no product code to match on." },
      "pbi-cat": { status: "error", errorMessage: "Product category breakdown unavailable — the catalog join upstream failed." },
    },
  },
  "anom-null": {
    triggerStatus: "warning",
    triggerMessage: "18.2% of records are missing a customer ID — more than I'll accept.",
    culpritEntity: "Too many missing customer IDs",
    impactedEtlStages: ["Parse & Cleanse (Stage 1)", "Business Rules & Margin (Stage 3)"],
    brokenPbiVisuals: ["Customer Segment Distribution"],
    technicalRemediation: "About 18 in every 100 records came in without a customer ID — far more than I'd expect. That broke the completeness check and stopped two pipeline steps that need a customer ID to run, so the Customer Segment dashboard isn't showing right now. Revenue and product numbers are unaffected.",
    affectedNodes: {
      "dq-complete": { status: "error", errorMessage: "18.2% of records are missing a customer ID — that's above what I'll accept." },
      "etl-s1": { status: "error", errorMessage: "Rejected incoming records that had no customer ID." },
      "etl-s3": { status: "error", errorMessage: "Can't calculate customer loyalty discounts without a customer ID." },
      "pbi-churn": { status: "error", errorMessage: "Customer segment breakdown is skewed — too many records have no assigned customer." },
    },
  },
  "anom-vol": {
    triggerStatus: "warning",
    triggerMessage: "Incoming data volume just dropped 81.4% below what I'd normally expect.",
    culpritEntity: "A sudden drop in incoming data",
    impactedEtlStages: [],
    brokenPbiVisuals: ["Total Net Revenue (USD)", "Regional Sales Performance"],
    technicalRemediation: "The amount of data coming in just dropped by more than 80% compared to what I'd normally expect. That usually means the upstream feed has slowed down or stalled. I've flagged the Revenue and Regional dashboards as unreliable until volume returns to normal — the pipeline itself isn't broken.",
    affectedNodes: {
      "dq-fresh": { status: "error", errorMessage: "Haven't heard from the upstream feed in a while — it may be delayed or paused." },
      "pbi-kpi": { status: "error", errorMessage: "Revenue dropped abnormally alongside the volume shift — treating this number as unreliable." },
      "pbi-region": { status: "error", errorMessage: "Too few records to trust a regional breakdown right now." },
    },
  },
  "anom-dup": {
    triggerStatus: "warning",
    triggerMessage: "4.6% of orders are duplicates of another order in the same batch.",
    culpritEntity: "Duplicate order records",
    impactedEtlStages: ["Parse & Cleanse (Stage 1)"],
    brokenPbiVisuals: ["Total Net Revenue (USD)"],
    technicalRemediation: "I found the same order appearing more than once — about 5 in every 100 records. Left alone, that would count the same sale twice, so I paused the first pipeline step and the Revenue dashboard until the duplicates are cleaned up.",
    affectedNodes: {
      "dq-valid": { status: "error", errorMessage: "4.6% of orders are duplicates — well above what I'll allow through." },
      "etl-s1": { status: "error", errorMessage: "Set aside the duplicate orders instead of processing them." },
      "pbi-kpi": { status: "error", errorMessage: "Revenue total is unreliable while duplicate orders are still in the batch." },
    },
  },
  "dq-fresh": {
    triggerStatus: "error",
    triggerMessage: "This data hasn't been refreshed in over 4 hours.",
    culpritEntity: "Data that's too old to trust",
    impactedEtlStages: [],
    brokenPbiVisuals: ["Total Net Revenue (USD)"],
    technicalRemediation: "This data hasn't been refreshed in over 4 hours, which is longer than I'd trust for a live dashboard. I've flagged the Revenue dashboard as stale until a fresh batch comes through — this also lines up with the volume drop I flagged earlier.",
    affectedNodes: {
      "anom-vol": { status: "warning", errorMessage: "No new data has arrived in a while — this may be why freshness failed too." },
      "pbi-kpi": { status: "error", errorMessage: "Showing numbers from a stale snapshot — not current." },
    },
  },
  "dq-complete": {
    triggerStatus: "error",
    triggerMessage: "This batch is missing information I need, like customer ID or order date.",
    culpritEntity: "Missing required information",
    impactedEtlStages: ["Parse & Cleanse (Stage 1)"],
    brokenPbiVisuals: ["Total Net Revenue (USD)", "Customer Segment Distribution"],
    technicalRemediation: "This batch is missing information I need to process it safely — fields like customer ID, product code, or order date. I've paused the first pipeline step at the door, so the Revenue and Customer Segment dashboards won't update until the missing fields are filled in.",
    affectedNodes: {
      "etl-s1": { status: "error", errorMessage: "Rejected this batch — required fields are missing." },
      "pbi-kpi": { status: "error", errorMessage: "Can't total revenue accurately with rows missing key fields." },
      "pbi-churn": { status: "error", errorMessage: "Can't group customers into segments without their identifiers." },
    },
  },
  "dq-valid": {
    triggerStatus: "error",
    triggerMessage: "I found negative sales amounts and discounts over 100%, which shouldn't be possible.",
    culpritEntity: "Invalid sales and discount values",
    impactedEtlStages: ["Retail Normalization & FX (Stage 2)", "Store Margin & Tax Rules (Stage 3)"],
    brokenPbiVisuals: ["Total Net Revenue (USD)"],
    technicalRemediation: "I found sales and discount values that don't make sense — negative amounts and discounts that shouldn't be possible. Rather than risk showing incorrect numbers, I stopped the currency conversion and tax steps and paused the Revenue dashboard until this is cleaned up.",
    affectedNodes: {
      "etl-s2": { status: "error", errorMessage: "Can't convert currency on a negative sales amount." },
      "etl-s3": { status: "error", errorMessage: "Can't apply tax rules with an invalid discount rate." },
      "pbi-kpi": { status: "error", errorMessage: "Revenue total would be skewed by these negative values." },
    },
  },
  "dq-ref": {
    triggerStatus: "error",
    triggerMessage: "Some products and customers in this batch don't match anything in the master catalogs.",
    culpritEntity: "Records that don't match any known product or customer",
    impactedEtlStages: ["Curate & Export to S3 Delta (Stage 4)"],
    brokenPbiVisuals: ["Product Category Revenue Split"],
    technicalRemediation: "Some products in this batch don't match anything in the product catalog. Because of that, the final export step couldn't finish building the catalog join, so the Product Category dashboard is unavailable right now.",
    affectedNodes: {
      "etl-s4": { status: "error", errorMessage: "Couldn't finish the product catalog join — some product codes don't exist in the catalog." },
      "pbi-cat": { status: "error", errorMessage: "Can't categorize products that aren't in the master catalog." },
    },
  },
  "etl-s1": {
    triggerStatus: "error",
    triggerMessage: "I couldn't read the incoming file — it looks badly formatted.",
    culpritEntity: "A failure while reading the incoming data",
    impactedEtlStages: ["Stage 2 (Normalize & FX)", "Stage 3 (Business Rules)", "Stage 4 (Curate & Export)"],
    brokenPbiVisuals: ["Total Net Revenue (USD)", "Regional Sales Performance", "Product Category Revenue Split", "Customer Segment Distribution"],
    technicalRemediation: "The very first pipeline step — reading and cleaning the incoming data — failed, likely because of a badly formatted file. Since every step after this one depends on it, the rest of the pipeline is paused and none of the dashboards can refresh. The data sources and quality checks upstream are still healthy.",
    affectedNodes: {
      "etl-s2": { status: "error", errorMessage: "Waiting on Stage 1 to produce clean data — it hasn't." },
      "etl-s3": { status: "error", errorMessage: "Blocked because Stage 1 failed." },
      "etl-s4": { status: "error", errorMessage: "Blocked because Stage 1 failed." },
      "pbi-kpi": { status: "error", errorMessage: "No fresh data reached the warehouse — Stage 1 didn't complete." },
      "pbi-region": { status: "error", errorMessage: "No regional data was published this run." },
      "pbi-cat": { status: "error", errorMessage: "No product catalog data was published this run." },
      "pbi-churn": { status: "error", errorMessage: "No customer segment data was published this run." },
    },
  },
  "etl-s2": {
    triggerStatus: "error",
    triggerMessage: "I couldn't get exchange rates in time to convert some currencies.",
    culpritEntity: "A failure converting currencies",
    impactedEtlStages: ["Stage 3 (Business Rules)", "Stage 4 (Curate & Export)"],
    brokenPbiVisuals: ["Total Net Revenue (USD)", "Regional Sales Performance", "Product Category Revenue Split", "Customer Segment Distribution"],
    technicalRemediation: "The currency conversion step failed — I couldn't get exchange rates for some currencies in time. Stage 1 completed cleanly, but the steps after this one are blocked, so none of the dashboards can refresh with new numbers.",
    affectedNodes: {
      "etl-s3": { status: "error", errorMessage: "Waiting on currency conversion to finish — it hasn't." },
      "etl-s4": { status: "error", errorMessage: "Blocked because Stage 2 failed." },
      "pbi-kpi": { status: "error", errorMessage: "No fresh data reached the warehouse — currency conversion didn't complete." },
      "pbi-region": { status: "error", errorMessage: "No fresh data reached the warehouse this run." },
      "pbi-cat": { status: "error", errorMessage: "Pricing wasn't finalized for this batch." },
      "pbi-churn": { status: "error", errorMessage: "Spend figures weren't finalized for this batch." },
    },
  },
  "etl-s3": {
    triggerStatus: "error",
    triggerMessage: "I hit a calculation error applying a promo discount rate.",
    culpritEntity: "A failure applying tax and pricing rules",
    impactedEtlStages: ["Stage 4 (Curate & Export)"],
    brokenPbiVisuals: ["Total Net Revenue (USD)", "Regional Sales Performance", "Product Category Revenue Split", "Customer Segment Distribution"],
    technicalRemediation: "The step that applies tax and pricing rules failed. Stages 1 and 2 completed successfully, but the final export step is blocked, so none of the dashboards have fresh data this run.",
    affectedNodes: {
      "etl-s4": { status: "error", errorMessage: "Waiting on tax and pricing rules to finish — they haven't." },
      "pbi-kpi": { status: "error", errorMessage: "Net revenue wasn't finalized for this batch." },
      "pbi-region": { status: "error", errorMessage: "Regional totals weren't finalized for this batch." },
      "pbi-cat": { status: "error", errorMessage: "Category discounts weren't finalized for this batch." },
      "pbi-churn": { status: "error", errorMessage: "Loyalty tiers weren't finalized for this batch." },
    },
  },
  "etl-s4": {
    triggerStatus: "error",
    triggerMessage: "I ran into a conflict trying to save the finished data to the warehouse.",
    culpritEntity: "A failure saving the finished data",
    impactedEtlStages: [],
    brokenPbiVisuals: ["Total Net Revenue (USD)", "Regional Sales Performance", "Product Category Revenue Split", "Customer Segment Distribution"],
    technicalRemediation: "The final step — saving the finished data to the warehouse — ran into a conflict and couldn't complete. Every earlier step succeeded, but because this one failed, none of the dashboards can refresh.",
    affectedNodes: {
      "pbi-kpi": { status: "error", errorMessage: "Warehouse write didn't complete — revenue partition wasn't updated." },
      "pbi-region": { status: "error", errorMessage: "Warehouse write didn't complete — regional partition wasn't updated." },
      "pbi-cat": { status: "error", errorMessage: "Warehouse write didn't complete — product partition wasn't updated." },
      "pbi-churn": { status: "error", errorMessage: "Warehouse write didn't complete — customer partition wasn't updated." },
    },
  },
  "src-1": {
    triggerStatus: "error",
    triggerMessage: "The connection to the main data source timed out — it's gone offline.",
    culpritEntity: "The main data source went offline",
    impactedEtlStages: ["Stage 1", "Stage 2", "Stage 3", "Stage 4"],
    brokenPbiVisuals: ["Total Net Revenue (USD)", "Regional Sales Performance", "Product Category Revenue Split", "Customer Segment Distribution"],
    technicalRemediation: "The main data source has gone offline — I'm not receiving any new records. That's why volume and freshness checks triggered immediately, and the whole pipeline has paused at the very first step.",
    affectedNodes: {
      "anom-vol": { status: "warning", errorMessage: "No data is coming in at all right now." },
      "dq-fresh": { status: "error", errorMessage: "Nothing has arrived from this source in 30 minutes." },
      "etl-s1": { status: "error", errorMessage: "Paused — the primary source is offline." },
      "etl-s2": { status: "error", errorMessage: "No data from Stage 1 to work with." },
      "etl-s3": { status: "error", errorMessage: "No data from Stage 2 to work with." },
      "etl-s4": { status: "error", errorMessage: "No data from Stage 3 to work with." },
      "pbi-kpi": { status: "error", errorMessage: "No new data since the source went offline." },
      "pbi-region": { status: "error", errorMessage: "No regional records have come in." },
      "pbi-cat": { status: "error", errorMessage: "No product records have come in." },
      "pbi-churn": { status: "error", errorMessage: "No customer records have come in." },
    },
  },
  "src-2": {
    triggerStatus: "error",
    triggerMessage: "I lost access to the secondary source that holds the product catalog.",
    culpritEntity: "A secondary data source became unreachable",
    impactedEtlStages: ["Curate & Export (Stage 4)"],
    brokenPbiVisuals: ["Product Category Revenue Split"],
    technicalRemediation: "A secondary data source has become unreachable, so I can't confirm product catalog details for this batch. The main order pipeline is still healthy, but the final export step and the Product Category dashboard are affected.",
    affectedNodes: {
      "anom-schema": { status: "warning", errorMessage: "Can't reach the product catalog on this secondary source." },
      "dq-ref": { status: "error", errorMessage: "Can't verify products — the catalog source is unreachable." },
      "etl-s4": { status: "error", errorMessage: "Couldn't finish the catalog join — the source is unreachable." },
      "pbi-cat": { status: "error", errorMessage: "Product category breakdown is missing its catalog source." },
    },
  },
  "src-3": {
    triggerStatus: "error",
    triggerMessage: "A third source that feeds customer data has stopped responding.",
    culpritEntity: "A third data source stopped responding",
    impactedEtlStages: [],
    brokenPbiVisuals: ["Customer Segment Distribution"],
    technicalRemediation: "A third data source has stopped responding, so I'm missing some customer information from it. Most of the pipeline is unaffected, but the Customer Segment dashboard can't be fully trusted until this source comes back.",
    affectedNodes: {
      "anom-dup": { status: "warning", errorMessage: "Can't cross-check these records against the offline source." },
      "pbi-churn": { status: "error", errorMessage: "Missing customer segments that normally come from this source." },
    },
  },
}
