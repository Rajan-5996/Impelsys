import { incidentPath, supplierDetailPath } from "@/constants/routes"
import { SUPPLIERS } from "@/data/suppliers"
import type { AskMessageLink } from "@/store/ui-slice"

export type AskAnswer = {
  text: string
  link?: AskMessageLink
}

export const ASK_SUGGESTIONS = [
  "Why is NorthStar Data flagged critical?",
  "What's happening with the ETL Customer Validation failure?",
  "Which supplier's reliability is declining?",
]

export function answerAskQuestion(question: string): AskAnswer {
  const q = question.toLowerCase()

  if (q.includes("northstar")) {
    return {
      text: "NorthStar Data's Daily Sales Feed arrived with 218,431 records against an expected 1,020,000, a -78.6% deviation. The Data Intake Agent has completed its investigation and recommends requesting a supplier re-delivery.",
      link: { label: "Open incident INC-2026-0901-01", path: incidentPath("northstar") },
    }
  }

  if (
    q.includes("datasphere") ||
    q.includes("customer validation") ||
    q.includes("etl")
  ) {
    return {
      text: "SALES_DAILY_ETL failed Customer Validation on 1,248 records with a NULL CUSTOMER_ID, sourced from DataSphere. The ETL Resolution Agent recommends quarantining the invalid records and continuing processing for the remaining 1,020,195 valid records.",
      link: { label: "Open incident INC-2026-0901-02", path: incidentPath("etl") },
    }
  }

  if (q.includes("globalfeeds") || q.includes("declin")) {
    return {
      text: "GlobalFeeds' reliability has declined over the last 30 days, driven by 7 late or missed SLA deliveries and a rise in PRODUCT_CODE validation failures from 0.4% to 2.0%. A formal supplier review is recommended.",
      link: { label: "Open GlobalFeeds scorecard", path: "/scorecards" },
    }
  }

  const matchedSupplier = SUPPLIERS.find((supplier) =>
    q.includes(supplier.name.toLowerCase())
  )
  if (matchedSupplier) {
    return {
      text: `${matchedSupplier.name} currently has a reliability score of ${matchedSupplier.score} and is in the ${matchedSupplier.tier} tier. ${matchedSupplier.insight}`,
      link: {
        label: `Open ${matchedSupplier.name} detail`,
        path: supplierDetailPath(matchedSupplier.id),
      },
    }
  }

  return {
    text: "I can help with supplier feed status, open incidents, pipeline health, or data quality questions. Try asking about a specific supplier or incident.",
  }
}
