import type { LotStatus, LotVehicle, PricingPosition } from "@/services/max-2/max-2.types"

export type LotAgeBucket = "0-30" | "31-89" | "90+"

export type LotInventoryVehicleTab = "all" | "new" | "used"

export interface LotInventoryFilters {
  makes: string[]
  models: string[]
  years: number[]
  trims: string[]
  transmissions: ("manual" | "automatic")[]
  ageBuckets: LotAgeBucket[]
  lotStatuses: LotStatus[]
  pricingPositions: PricingPosition[]
  priceRangeKeys: string[]
  bodyTypes: string[]
  leadModes: ("has-leads" | "no-leads")[]
  photoModes: ("has-real-photos" | "no-real-photos" | "missing")[]
  recentsOnly: boolean
  agedOver40: boolean
}

export const lotInventoryDefaultFilters: LotInventoryFilters = {
  makes: [],
  models: [],
  years: [],
  trims: [],
  transmissions: [],
  ageBuckets: [],
  lotStatuses: [],
  pricingPositions: [],
  priceRangeKeys: [],
  bodyTypes: [],
  leadModes: [],
  photoModes: [],
  recentsOnly: false,
  agedOver40: false,
}

export function lotTransmissionFromVin(vin: string): "manual" | "automatic" {
  let h = 0
  for (let i = 0; i < vin.length; i++) {
    h = (h + vin.charCodeAt(i) * (i + 1)) % 101
  }
  return h < 26 ? "manual" : "automatic"
}

export function inLotAgeBucket(days: number, b: LotAgeBucket): boolean {
  if (b === "0-30") return days >= 0 && days <= 30
  if (b === "31-89") return days >= 31 && days <= 89
  return days >= 90
}

function matchesPriceRange(v: LotVehicle, key: string): boolean {
  if (key === "under-15k") return v.listPrice < 15000
  if (key === "15k-25k") return v.listPrice >= 15000 && v.listPrice < 25000
  if (key === "25k-35k") return v.listPrice >= 25000 && v.listPrice < 35000
  if (key === "35k-50k") return v.listPrice >= 35000 && v.listPrice < 50000
  if (key === "50k+") return v.listPrice >= 50000
  return false
}

function matchesPhotoMode(
  v: LotVehicle,
  mode: "has-real-photos" | "no-real-photos" | "missing"
): boolean {
  if (mode === "has-real-photos") return v.hasRealPhotos
  if (mode === "no-real-photos") return !v.hasRealPhotos
  /** “No / stock” — exclude units with a real set and photos on file */
  return !v.hasRealPhotos || v.photoCount === 0
}

export function isNewLotVehicle(v: LotVehicle, currentYear: number): boolean {
  return v.year >= currentYear - 1
}

export function applyLotInventoryFilters(
  vehicles: LotVehicle[],
  filters: LotInventoryFilters,
  modelToBody: Record<string, string>,
  vehicleTab: LotInventoryVehicleTab,
  currentYear: number
): LotVehicle[] {
  let result = [...vehicles]

  if (vehicleTab === "new") result = result.filter((v) => isNewLotVehicle(v, currentYear))
  else if (vehicleTab === "used") result = result.filter((v) => !isNewLotVehicle(v, currentYear))

  if (filters.recentsOnly) result = result.filter((v) => v.daysInStock <= 7)
  if (filters.agedOver40) result = result.filter((v) => v.daysInStock > 40)

  if (filters.makes.length > 0) result = result.filter((v) => filters.makes.includes(v.make))
  if (filters.models.length > 0) result = result.filter((v) => filters.models.includes(v.model))
  if (filters.years.length > 0) result = result.filter((v) => filters.years.includes(v.year))
  if (filters.trims.length > 0) result = result.filter((v) => filters.trims.includes(v.trim))
  if (filters.transmissions.length > 0) {
    result = result.filter((v) =>
      filters.transmissions.includes(lotTransmissionFromVin(v.vin))
    )
  }

  if (filters.ageBuckets.length > 0) {
    result = result.filter((v) =>
      filters.ageBuckets.some((b) => inLotAgeBucket(v.daysInStock, b))
    )
  }

  if (filters.lotStatuses.length > 0) {
    result = result.filter((v) => filters.lotStatuses.includes(v.lotStatus))
  }
  if (filters.pricingPositions.length > 0) {
    result = result.filter((v) => filters.pricingPositions.includes(v.pricingPosition))
  }
  if (filters.priceRangeKeys.length > 0) {
    result = result.filter((v) => filters.priceRangeKeys.some((k) => matchesPriceRange(v, k)))
  }
  if (filters.bodyTypes.length > 0) {
    result = result.filter((v) => {
      const b = modelToBody[v.model]
      return b && filters.bodyTypes.includes(b)
    })
  }
  if (filters.leadModes.length > 0) {
    result = result.filter((v) => {
      if (filters.leadModes.includes("has-leads") && v.leads > 0) return true
      if (filters.leadModes.includes("no-leads") && v.leads === 0) return true
      return false
    })
  }
  if (filters.photoModes.length > 0) {
    result = result.filter((v) => filters.photoModes.some((m) => matchesPhotoMode(v, m)))
  }

  return result
}

export function lotInventoryFiltersActive(f: LotInventoryFilters): boolean {
  return (
    f.makes.length > 0 ||
    f.models.length > 0 ||
    f.years.length > 0 ||
    f.trims.length > 0 ||
    f.transmissions.length > 0 ||
    f.ageBuckets.length > 0 ||
    f.lotStatuses.length > 0 ||
    f.pricingPositions.length > 0 ||
    f.priceRangeKeys.length > 0 ||
    f.bodyTypes.length > 0 ||
    f.leadModes.length > 0 ||
    f.photoModes.length > 0 ||
    f.recentsOnly ||
    f.agedOver40
  )
}
