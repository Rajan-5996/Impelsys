import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { SUPPLIERS, type SupplierTier } from "@/data/suppliers"

const TIERS: SupplierTier[] = ["Preferred", "Approved", "Monitor", "At Risk"]

export function PortfolioSummarySection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2.5">
          {TIERS.map((tier) => {
            const count = SUPPLIERS.filter(
              (supplier) => supplier.tier === tier
            ).length
            return (
              <div key={tier} className="border border-border p-2.5">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {tier}
                </p>
                <p className="mt-0.5 text-lg font-semibold text-foreground">
                  {count}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
