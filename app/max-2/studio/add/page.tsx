"use client"

import { AddVehiclePage } from "@/components/max-2/studio/add-vehicle-page"
import { max2Layout } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

export default function AddVehicleRoute() {
  return (
    <div className={cn(max2Layout.pageStack)}>
      <h1 className="sr-only">Add Vehicle</h1>
      <AddVehiclePage />
    </div>
  )
}
