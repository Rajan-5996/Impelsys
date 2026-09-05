import type { StageCodeDefinition } from "./lineage-types"

export function defineStage(
  nodeId: string,
  stageNumber: number,
  stageName: string,
  subNodeName: string,
  requiredInputs: string[],
  producedOutputs: string[],
  codeDescription: string,
  code: string
): StageCodeDefinition {
  return {
    nodeId, stageNumber, stageName, subNodeName, requiredInputs, producedOutputs,
    droppedColumns: [], codeDescription, isCustomModified: false,
    originalCode: code, pySparkCode: code,
  }
}

export const STAGE_CODE_ETL: Record<string, StageCodeDefinition> = {
  "etl-s1": defineStage(
    "etl-s1", 1, "Stage 1: Ingestion & Schema Sanitizer", "Parse & Cleanse",
    ["order_id", "customer_id", "product_code", "sales_amount", "order_date"],
    ["order_id", "customer_id", "product_code", "sales_amount", "discount_pct", "tax_rate", "region", "order_date", "currency", "customer_segment"],
    "Casts raw inbound string columns to typed schema, trims whitespace, verifies primary key order_id.",
    `# Stage 1: Parse & Cleanse (Ingestion Sanitizer)
# Ingress: order_id (Primary Key), customer_id, product_code, sales_amount, order_date, region
from pyspark.sql import functions as F
from pyspark.sql.types import DecimalType, DateType

def stage1_parse_and_cleanse(df):
    """Casts raw string columns to strongly typed schema and sanitizes whitespace."""
    return df \\
        .withColumn("order_id", F.trim(F.col("order_id"))) \\
        .withColumn("product_code", F.trim(F.upper(F.col("product_code")))) \\
        .withColumn("sales_amount", F.col("sales_amount").cast(DecimalType(12, 2))) \\
        .withColumn("discount_pct", F.col("discount_pct").cast(DecimalType(5, 4))) \\
        .withColumn("tax_rate", F.col("tax_rate").cast(DecimalType(5, 4))) \\
        .withColumn("order_date", F.to_date(F.col("order_date"), "yyyy-MM-dd"))
`
  ),
  "etl-s2": defineStage(
    "etl-s2", 2, "Stage 2: Transformation & Normalization", "Transform & Normalize",
    ["order_id", "currency", "sales_amount", "discount_pct"],
    ["order_id", "sales_amount_usd", "fx_rate", "net_sales_amount", "discount_amount"],
    "Converts transaction currencies into standardized base USD and computes net receivable after discount.",
    `# Stage 2: Transform & Normalize (FX & Discount Engine)
# Ingress: order_id (Primary Key), currency, sales_amount, discount_pct
from pyspark.sql import functions as F

def stage2_transform_and_normalize(df):
    """Converts transaction currencies into USD and computes net receivable after discount."""
    return df \\
        .withColumn("sales_amount_usd",
            F.when(F.col("currency") == "EUR", F.col("sales_amount") * 1.08)
             .when(F.col("currency") == "GBP", F.col("sales_amount") * 1.27)
             .otherwise(F.col("sales_amount"))
        ) \\
        .withColumn("discount_amount", F.col("sales_amount") * F.col("discount_pct")) \\
        .withColumn("net_sales_amount", F.col("sales_amount") - F.col("discount_amount"))
`
  ),
  "etl-s3": defineStage(
    "etl-s3", 3, "Stage 3: Business Logic & Rules", "Business Rules & Tax",
    ["order_id", "region", "tax_rate", "customer_id", "customer_segment"],
    ["order_id", "tax_amount", "gross_amount", "account_tier", "priority_flag"],
    "Applies regional tax fiscal policies, computes gross receivables, and classifies customer account tiers.",
    `# Stage 3: Business Rules & Tax (Regional Policies & Segmentation)
# Ingress: order_id (Primary Key), region, tax_rate, customer_id, customer_segment
from pyspark.sql import functions as F

def stage3_business_rules(df):
    """Applies regional tax calculations, gross receivables, and customer tier flags."""
    return df \\
        .withColumn("tax_amount", F.col("net_sales_amount") * F.col("tax_rate")) \\
        .withColumn("gross_amount", F.col("net_sales_amount") + F.col("tax_amount")) \\
        .withColumn("account_tier",
            F.when(F.col("customer_segment") == "Enterprise", F.lit("Tier-1 VIP"))
             .otherwise(F.lit("Standard"))
        )
`
  ),
  "etl-s4": defineStage(
    "etl-s4", 4, "Stage 4: Enrich & Export", "Enrich & Warehouse Export",
    ["order_id", "product_code", "sales_amount", "region"],
    ["order_id", "product_name", "product_category", "fact_sales_id", "total_net_usd", "lakehouse_snapshot_id"],
    "Joins product master catalog, builds fact table keyed by order_id grain, exports Snappy Parquet to Delta Lakehouse.",
    `# Stage 4: Enrich & Export (Join Product Master & Parquet Lakehouse Write)
# Ingress: order_id (Primary Key), product_code, sales_amount, region
from pyspark.sql import functions as F

def stage4_enrich_and_export(df, product_master_df, lakehouse_path="s3://lakehouse/curated/sales"):
    """Joins catalog dimension, builds fact table by order_id grain, writes Parquet delta."""
    joined_df = df.join(product_master_df, on="product_code", how="inner") \\
                  .withColumn("fact_sales_id", F.concat(F.lit("FACT-"), F.col("order_id")))

    joined_df.write.format("delta").mode("overwrite").partitionBy("region").save(lakehouse_path)
    return joined_df
`
  ),
}
