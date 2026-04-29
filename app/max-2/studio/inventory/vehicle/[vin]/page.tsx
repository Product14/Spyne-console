import { notFound } from "next/navigation"
import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import { VehicleDisplayPage } from "@/components/max-2/studio/vehicle-display-page"

export default async function StudioVehicleDisplayRoute({
  params,
}: {
  params: Promise<{ vin: string }>
}) {
  const { vin: raw } = await params
  const vin = decodeURIComponent(raw)
  const vehicle = mockMerchandisingVehicles.find((v) => v.vin === vin)
  if (!vehicle) notFound()
  return <VehicleDisplayPage vehicle={vehicle} />
}
