import { useNavigate } from "react-router-dom"

import { pipelineVendorDetailPath } from "@/constants/routes"
import { VendorFleetGrid } from "@/pages/pipeline/vendor-fleet-grid"

export function PipelineOperationsPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          Vendor Dashboard
        </h1>
        <p className="mt-1 text-[11.5px] text-muted-foreground">
          Live status for the current Smart ETL agent run
        </p>
      </div>
      <VendorFleetGrid
        onVendorSelected={(vendorId) => navigate(pipelineVendorDetailPath(vendorId))}
      />
    </div>
  )
}
