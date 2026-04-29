import type { MerchandisingVehicle, MediaStatus, PublishStatus } from "@/services/max-2/max-2.types"

/** Mirrors `InventoryVehicleType` from `inventory-list-header` (avoid circular imports). */
export type MerchInventoryVehicleType = "all" | "new" | "used"

export type MerchAgeBucket = "0-30" | "31-89" | "90+"
export type MerchPriceBucket = "u20" | "20-30" | "30-40" | "40+"
export type MerchScoreBucket = "low" | "mid" | "high"

/**
 * Lot overview deep links (`?focus=`) map to the same cohorts as `LotIssueBuckets` / lot actions,
 * applied on {@link MerchandisingVehicle} (VDP views proxy "leads", $46/day proxy for holding cost).
 */
export type MerchLotFocus =
  | "aged-45"
  | "no-leads"
  | "smart-campaign"
  | "reprice"
  | "liquidate"
  | "exit-now"
  | "high-holding"

export const MERCH_LOT_FOCUS_LABELS: Record<MerchLotFocus, string> = {
  "aged-45": "Aged 45+ days",
  "no-leads": "No leads (5+ days)",
  "smart-campaign": "Smart campaign",
  reprice: "Reprice (31–45d)",
  liquidate: "Liquidate (46–60d)",
  "exit-now": "Exit now (60+d)",
  "high-holding": "High holding cost",
}

const validMerchFocus = new Set<MerchLotFocus>([
  "aged-45",
  "no-leads",
  "smart-campaign",
  "reprice",
  "liquidate",
  "exit-now",
  "high-holding",
])

export function parseMerchLotFocusFromSearchParams(params: URLSearchParams): MerchLotFocus | null {
  const raw = params.get("focus")
  if (raw && validMerchFocus.has(raw as MerchLotFocus)) return raw as MerchLotFocus
  return null
}

/** Same segment map as lot body analysis (model → body class). */
export const MERCH_MODEL_TO_BODY: Record<string, string> = {
  "F-150": "Truck",
  Silverado: "Truck",
  RAV4: "SUV",
  Q5: "SUV",
  "CX-5": "SUV",
  Equinox: "SUV",
  Sportage: "SUV",
  Tucson: "SUV",
  Forester: "SUV",
  "3 Series": "Sedan",
  Altima: "Sedan",
  Sonata: "Sedan",
  Corolla: "Sedan",
  Civic: "Sedan",
  Camry: "Sedan",
}

function merchVehicleBody(v: MerchandisingVehicle): string | null {
  return MERCH_MODEL_TO_BODY[v.model] ?? null
}

/** Lot inventory price keys; matches `matchesLotPriceRangeKey` below. */
export function matchesLotPriceRangeKey(price: number, key: string): boolean {
  if (key === "under-15k") return price < 15000
  if (key === "15k-25k") return price >= 15000 && price < 25000
  if (key === "25k-35k") return price >= 25000 && price < 35000
  if (key === "35k-50k") return price >= 35000 && price < 50000
  if (key === "50k+") return price >= 50000
  return false
}

const HOLDING_COST_PER_DAY = 46

function merchFocusPredicate(focus: MerchLotFocus): (v: MerchandisingVehicle) => boolean {
  switch (focus) {
    case "aged-45":
      return (v) => v.daysInStock >= 45
    case "no-leads":
      return (v) =>
        v.publishStatus === "live" && v.vdpViews === 0 && v.daysInStock > 5
    case "smart-campaign":
      return (v) =>
        v.publishStatus === "live" && v.vdpViews === 0 && v.daysInStock >= 10
    case "reprice":
      return (v) =>
        v.publishStatus === "live" &&
        v.daysInStock >= 31 &&
        v.daysInStock <= 45
    case "liquidate":
      return (v) => v.daysInStock >= 46 && v.daysInStock <= 60
    case "exit-now":
      return (v) => v.daysInStock > 60
    case "high-holding":
      return (v) => v.daysInStock * HOLDING_COST_PER_DAY >= 1500
    default:
      return () => true
  }
}

/** Studio insight presets; matches `issue` query on `/max-2/studio/inventory`. */
export type MerchMediaIssue = "glare" | "no360" | "incomplete" | "under8" | "hero"

export const MERCH_MEDIA_ISSUE_LABELS: Record<MerchMediaIssue, string> = {
  glare: "Sun glare",
  no360: "Missing 360 walk-around video",
  incomplete: "10–15 photos",
  under8: "Fewer than 8 exterior images",
  hero: "Missing hero angle",
}

const validMediaIssues = new Set<MerchMediaIssue>(["glare", "no360", "incomplete", "under8", "hero"])

export function parseMerchMediaIssueFromSearchParams(params: URLSearchParams): MerchMediaIssue | null {
  const issue = params.get("issue")
  if (issue && validMediaIssues.has(issue as MerchMediaIssue)) return issue as MerchMediaIssue
  if (params.get("photos") === "low") return "under8"
  return null
}

/** Updates or strips `issue` / legacy `photos` query keys; leaves other params untouched. */
export function applyMerchMediaIssueToSearchParams(
  params: URLSearchParams,
  mediaIssue: MerchMediaIssue | null
): URLSearchParams {
  const next = new URLSearchParams(params.toString())
  next.delete("issue")
  next.delete("photos")
  if (mediaIssue) next.set("issue", mediaIssue)
  return next
}

export interface MerchandisingInventoryFilters {
  search: string
  vehicleType: MerchInventoryVehicleType
  makes: string[]
  models: string[]
  years: number[]
  trims: string[]
  transmissions: ("manual" | "automatic")[]
  ageBuckets: MerchAgeBucket[]
  mediaStatuses: MediaStatus[]
  publishStatuses: PublishStatus[]
  priceBuckets: MerchPriceBucket[]
  scoreBuckets: MerchScoreBucket[]
  ageMin: number | null
  ageMax: number | null
  priceMin: number | null
  priceMax: number | null
  scoreMin: number | null
  /** Optional capture-quality slice from Studio insights (`?issue=`). */
  mediaIssue: MerchMediaIssue | null
  /** Quick chip: units with no odometer reading (0 in mock DMS). */
  missingOdometerOnly: boolean
  /** Quick chip: units with no list price (0 in mock DMS). */
  missingPriceOnly: boolean
  /** Overview deep link `?media=needs-real`: not real photos (stock, CGI, or none). */
  needsRealPhotosOnly: boolean
  /** Overview deep link `?desc=missing`. */
  missingDescriptionOnly: boolean
  /** Lot overview `?focus=` presets (aged units, campaigns, etc.). */
  merchFocus: MerchLotFocus | null
  /** Lot body analysis `?bodyType=` (maps model → body). */
  merchBodyType: string | null
  /** Lot price row `?priceRange=` (under-15k, 15k-25k, …). */
  lotPriceRangeKey: string | null
}

export const merchandisingDefaultFilters: MerchandisingInventoryFilters = {
  search: "",
  vehicleType: "all",
  makes: [],
  models: [],
  years: [],
  trims: [],
  transmissions: [],
  ageBuckets: [],
  mediaStatuses: [],
  publishStatuses: [],
  priceBuckets: [],
  scoreBuckets: [],
  ageMin: null,
  ageMax: null,
  priceMin: null,
  priceMax: null,
  scoreMin: null,
  mediaIssue: null,
  missingOdometerOnly: false,
  missingPriceOnly: false,
  needsRealPhotosOnly: false,
  missingDescriptionOnly: false,
  merchFocus: null,
  merchBodyType: null,
  lotPriceRangeKey: null,
}

export function merchandisingTransmissionFromVin(vin: string): "manual" | "automatic" {
  let h = 0
  for (let i = 0; i < vin.length; i++) {
    h = (h + vin.charCodeAt(i) * (i + 1)) % 101
  }
  return h < 26 ? "manual" : "automatic"
}

export function inMerchAgeBucket(days: number, b: MerchAgeBucket): boolean {
  if (b === "0-30") return days >= 0 && days <= 30
  if (b === "31-89") return days >= 31 && days <= 89
  return days >= 90
}

function inMerchPriceBucket(price: number, b: MerchPriceBucket): boolean {
  if (b === "u20") return price < 20000
  if (b === "20-30") return price >= 20000 && price < 30000
  if (b === "30-40") return price >= 30000 && price < 40000
  return price >= 40000
}

function inMerchScoreBucket(score: number, b: MerchScoreBucket): boolean {
  if (b === "low") return score < 50
  if (b === "mid") return score >= 50 && score < 80
  return score >= 80
}

export function applyMerchandisingFilters(
  vehicles: MerchandisingVehicle[],
  filters: MerchandisingInventoryFilters
): MerchandisingVehicle[] {
  let result = [...vehicles]

  if (filters.vehicleType === "new") result = result.filter((v) => v.isNew)
  else if (filters.vehicleType === "used") result = result.filter((v) => !v.isNew)

  if (filters.makes.length > 0) result = result.filter((v) => filters.makes.includes(v.make))
  if (filters.models.length > 0) result = result.filter((v) => filters.models.includes(v.model))
  if (filters.years.length > 0) result = result.filter((v) => filters.years.includes(v.year))
  if (filters.trims.length > 0) result = result.filter((v) => filters.trims.includes(v.trim))
  if (filters.transmissions.length > 0) {
    result = result.filter((v) =>
      filters.transmissions.includes(merchandisingTransmissionFromVin(v.vin))
    )
  }

  if (filters.ageBuckets.length > 0) {
    result = result.filter((v) =>
      filters.ageBuckets.some((b) => inMerchAgeBucket(v.daysInStock, b))
    )
  } else {
    if (filters.ageMin !== null) result = result.filter((v) => v.daysInStock >= filters.ageMin!)
    if (filters.ageMax !== null) result = result.filter((v) => v.daysInStock <= filters.ageMax!)
  }

  if (filters.needsRealPhotosOnly) {
    result = result.filter((v) => v.mediaStatus !== "real-photos")
  }
  if (filters.mediaStatuses.length > 0) {
    result = result.filter((v) => filters.mediaStatuses.includes(v.mediaStatus))
  }
  if (filters.publishStatuses.length > 0) {
    result = result.filter((v) => filters.publishStatuses.includes(v.publishStatus))
  }

  if (filters.priceBuckets.length > 0) {
    result = result.filter((v) =>
      filters.priceBuckets.some((b) => inMerchPriceBucket(v.price, b))
    )
  } else {
    if (filters.priceMin !== null) result = result.filter((v) => v.price >= filters.priceMin!)
    if (filters.priceMax !== null) result = result.filter((v) => v.price <= filters.priceMax!)
  }

  if (filters.scoreBuckets.length > 0) {
    result = result.filter((v) =>
      filters.scoreBuckets.some((b) => inMerchScoreBucket(v.listingScore, b))
    )
  } else if (filters.scoreMin !== null) {
    result = result.filter((v) => v.listingScore >= filters.scoreMin!)
  }

  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (v) =>
        v.vin.toLowerCase().includes(q) ||
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.trim.toLowerCase().includes(q)
    )
  }

  if (filters.mediaIssue) {
    const mi = filters.mediaIssue
    result = result.filter((v) => {
      if (mi === "glare") return v.hasSunGlare
      if (mi === "no360") return !v.has360
      if (mi === "incomplete") return v.photoCount >= 1 && v.photoCount <= 15
      if (mi === "hero") return v.wrongHeroAngle
      return v.photoCount > 0 && v.photoCount < 8
    })
  }

  if (filters.missingOdometerOnly) {
    result = result.filter((v) => v.odometer <= 0)
  }
  if (filters.missingPriceOnly) {
    result = result.filter((v) => v.price <= 0)
  }
  if (filters.missingDescriptionOnly) {
    result = result.filter((v) => !v.hasDescription)
  }

  if (filters.merchFocus) {
    const pred = merchFocusPredicate(filters.merchFocus)
    result = result.filter(pred)
  }

  if (filters.merchBodyType) {
    const bt = filters.merchBodyType
    result = result.filter((v) => merchVehicleBody(v) === bt)
  }

  if (filters.lotPriceRangeKey) {
    const key = filters.lotPriceRangeKey
    result = result.filter((v) => matchesLotPriceRangeKey(v.price, key))
  }

  return result
}

/**
 * True when any filter is set that should show the removable chip row and "Clear all".
 * Excludes {@link MerchandisingInventoryFilters.vehicleType} (All / New / Pre-owned tabs),
 * so tab-only selection does not show that row.
 */
export function merchandisingRemovableFilterRowVisible(
  f: MerchandisingInventoryFilters
): boolean {
  return merchandisingFiltersActive({ ...f, vehicleType: "all" })
}

export function merchandisingFiltersActive(f: MerchandisingInventoryFilters): boolean {
  return (
    f.search.trim() !== "" ||
    f.vehicleType !== "all" ||
    f.makes.length > 0 ||
    f.models.length > 0 ||
    f.years.length > 0 ||
    f.trims.length > 0 ||
    f.transmissions.length > 0 ||
    f.ageBuckets.length > 0 ||
    f.mediaStatuses.length > 0 ||
    f.publishStatuses.length > 0 ||
    f.priceBuckets.length > 0 ||
    f.scoreBuckets.length > 0 ||
    f.ageMin !== null ||
    f.ageMax !== null ||
    f.priceMin !== null ||
    f.priceMax !== null ||
    f.scoreMin !== null ||
    f.mediaIssue !== null ||
    f.missingOdometerOnly ||
    f.missingPriceOnly ||
    f.needsRealPhotosOnly ||
    f.missingDescriptionOnly ||
    f.merchFocus !== null ||
    f.merchBodyType !== null ||
    f.lotPriceRangeKey !== null
  )
}
