import Link from "next/link"
import { max2Classes } from "@/lib/design-system/max-2"

export default function VehicleDisplayNotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className={max2Classes.pageTitle}>Vehicle not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">That VIN is not in Active Inventory.</p>
      <Link href="/max-2/studio/inventory" className="mt-4 inline-block text-sm font-semibold text-spyne-primary hover:underline">
        Back to Active Inventory
      </Link>
    </div>
  )
}
