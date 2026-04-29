import type { LotStatus, LotVehicle, MerchandisingVehicle } from "@/services/max-2/max-2.types"
import { getEffectiveStudioHoldingCostPerDayClient } from "@/lib/holding-cost-config"

/** Default when no persisted rate (SSR or before setup). */
export const STUDIO_HOLDING_COST_PER_DAY = 38

function studioHoldingRatePerDay(): number {
  return getEffectiveStudioHoldingCostPerDayClient(STUDIO_HOLDING_COST_PER_DAY)
}

export type InventoryIssueTone = "neutral" | "warning" | "danger"

export interface InventoryIssueDisplay {
  label: string
  tone: InventoryIssueTone
}

/**
 * When set, the Issue column matches the active Studio overview / inventory media-issue cohort
 * (incomplete set: interior vs exterior only; no 360: always "No 360 spin").
 */
export type MerchandisingOverviewIssueContext =
  | "default"
  // Merchandising filter contexts
  | "incomplete-photo-set"
  | "no-360"
  | "hero"
  | "under8"
  | "glare"
  // Lot view filter contexts
  | "lot-aged"
  | "lot-smart-campaign"
  | "lot-reprice"
  | "lot-liquidate"
  | "lot-exit-now"
  | "lot-high-holding"

const INTERIOR_EXTERIOR_ISSUES = ["Less interior photos", "Less exterior photos"] as const

/** Stable split so the same VIN always maps to the same incomplete-set issue. */
export function incompletePhotoSetInteriorExteriorIssue(vin: string): InventoryIssueDisplay {
  let s = 0
  for (let i = 0; i < vin.length; i++) s += vin.charCodeAt(i) * (i + 1)
  const label = s % 2 === 0 ? INTERIOR_EXTERIOR_ISSUES[0] : INTERIOR_EXTERIOR_ISSUES[1]
  return { label, tone: "warning" }
}

function estimatedFrontGrossFromPrice(price: number, explicit?: number | null): number {
  if (explicit != null && explicit > 0) return explicit
  return Math.max(600, Math.round(price * 0.088))
}

/**
 * Primary operational issue for Studio merchandising rows, aligned with
 * `merchandisingHoldingResolutions` in the vehicle media table.
 */
export function issueLabelForMerchandising(v: MerchandisingVehicle): InventoryIssueDisplay {
  const days = v.daysInStock
  const holdingAccum = days * studioHoldingRatePerDay()
  const estGross = estimatedFrontGrossFromPrice(v.price, v.estimatedFrontGross)
  const pctOfGross = estGross > 0 ? (holdingAccum / estGross) * 100 : 0
  const live = v.publishStatus === "live"

  if (days > 60) return { label: "Exit now", tone: "danger" }
  if (days >= 46) return { label: "Liquidate", tone: "danger" }
  if (days >= 45) return { label: "Aged 45+ days", tone: "warning" }
  if (days >= 31 && days <= 44 && live) return { label: "Reprice", tone: "warning" }
  if (live && days >= 10 && v.vdpViews < 45) return { label: "Smart campaign", tone: "warning" }
  if (holdingAccum >= 1500 || pctOfGross >= 12) return { label: "High holding cost", tone: "warning" }

  return { label: "On track", tone: "neutral" }
}

/**
 * Primary operational issue for lot inventory rows (Media Lot / lot views).
 * Mirrors lot issue bucket priorities where applicable.
 */
export function issueLabelForLotVehicle(v: LotVehicle): InventoryIssueDisplay {
  if (v.lotStatus === "sold-pending") return { label: "Sold pending", tone: "neutral" }

  const days = v.daysInStock
  const estGross = estimatedFrontGrossFromPrice(v.listPrice, v.estimatedFrontGross)
  const pctOfGross = estGross > 0 ? (v.totalHoldingCost / estGross) * 100 : 0
  const frontline = v.lotStatus === "frontline"

  if (days > 60) return { label: "Exit now", tone: "danger" }
  if (days >= 46) return { label: "Liquidate", tone: "danger" }
  if (days >= 45) return { label: "Aged 45+ days", tone: "warning" }
  if (days >= 31 && days <= 44 && frontline) return { label: "Reprice", tone: "warning" }
  if (frontline && v.leads === 0 && days >= 10) return { label: "Smart campaign", tone: "warning" }
  if (v.totalHoldingCost >= 1500 || pctOfGross >= 12) return { label: "High holding cost", tone: "warning" }

  return { label: "On track", tone: "neutral" }
}

/**
 * Maps a Studio inventory row to lot fields so {@link issueLabelForLotVehicle} matches
 * the Media Lot / lot overview table when only merchandising-shaped data is available.
 */
function merchandisingVehicleForLotIssueRow(v: MerchandisingVehicle): LotVehicle {
  const totalHoldingCost = v.daysInStock * studioHoldingRatePerDay()
  const lotStatus: LotStatus =
    v.publishStatus === "not-published" && v.photoCount === 0
      ? "in-recon"
      : v.daysInStock >= 45
        ? "wholesale-candidate"
        : "frontline"
  const leads = v.vdpViews >= 45 ? 1 : 0

  return {
    vin: v.vin,
    stockNumber: v.stockNumber ?? v.vin,
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim,
    color: v.exteriorColor ?? "",
    mileage: v.odometer,
    listPrice: v.price,
    marketPrice: v.price,
    acv: Math.round(v.price * 0.88),
    pricingPosition: "at-market",
    costToMarketPct: 98,
    daysInStock: v.daysInStock,
    lotStatus,
    photoCount: v.photoCount,
    hasRealPhotos: v.mediaStatus === "real-photos",
    isNew: v.isNew,
    vdpViews: v.vdpViews,
    leads,
    lastLeadDate: null,
    recentPriceChange: null,
    holdingCostPerDay: studioHoldingRatePerDay(),
    totalHoldingCost,
    estimatedFrontGross: estimatedFrontGrossFromPrice(v.price, v.estimatedFrontGross),
    segment: v.bodyStyle ?? "",
    location: "",
  }
}

/**
 * Lot View on Active Inventory: same **media** issue wording as the Merchandising tab when anything
 * is wrong with photos, 360, hero, etc. Lot-only issues (age, holding, campaigns) apply only when
 * the merchandising default is "On track", so rows with no photos never show "On track".
 */
export function issueLabelForStudioInventoryLotView(
  v: MerchandisingVehicle,
  context: MerchandisingOverviewIssueContext = "default",
): InventoryIssueDisplay {
  const mediaPrimary = issueLabelForStudioInventoryMerchandisingOverview(v, "default")
  if (mediaPrimary.label !== "On track") {
    return mediaPrimary
  }

  switch (context) {
    case "incomplete-photo-set":
      return issueLabelForStudioInventoryMerchandisingOverview(v, "incomplete-photo-set")
    case "no-360":
      return issueLabelForStudioInventoryMerchandisingOverview(v, "no-360")
    case "hero":
      return issueLabelForStudioInventoryMerchandisingOverview(v, "hero")
    case "under8":
      return issueLabelForStudioInventoryMerchandisingOverview(v, "under8")
    case "glare":
      return issueLabelForStudioInventoryMerchandisingOverview(v, "glare")
    case "lot-aged":
      return { label: "Aged 45+ days", tone: "warning" }
    case "lot-smart-campaign":
      return { label: "Smart campaign", tone: "warning" }
    case "lot-reprice":
      return { label: "Reprice", tone: "warning" }
    case "lot-liquidate":
      return { label: "Liquidate", tone: "danger" }
    case "lot-exit-now":
      return { label: "Exit now", tone: "danger" }
    case "lot-high-holding":
      return { label: "High holding cost", tone: "warning" }
    default:
      return issueLabelForLotVehicle(merchandisingVehicleForLotIssueRow(v))
  }
}

/**
 * Merchandising toggle: primary media issue, priority-aligned with Studio overview
 * merchandising tabs (no photos, Instant media, photo count, hero, 360, incomplete, sun glare, etc.).
 */
export function issueLabelForStudioInventoryMerchandisingOverview(
  v: MerchandisingVehicle,
  context: MerchandisingOverviewIssueContext = "default"
): InventoryIssueDisplay {
  if (context === "incomplete-photo-set") {
    return incompletePhotoSetInteriorExteriorIssue(v.vin)
  }
  if (context === "no-360") {
    return { label: "No 360 spin", tone: "warning" }
  }
  if (context === "hero") {
    return { label: "Missing hero angle", tone: "warning" }
  }
  if (context === "under8") {
    return { label: "Less than 8 photos", tone: "warning" }
  }
  if (context === "glare") {
    return { label: "Sun glare", tone: "warning" }
  }
  if (v.mediaStatus === "no-photos") return { label: "No photos", tone: "danger" }
  if (v.mediaStatus === "clone-photos") return { label: "Instant media", tone: "warning" }
  if (v.photoCount > 0 && v.photoCount < 8) return { label: "Less than 8 photos", tone: "warning" }
  if (v.wrongHeroAngle) return { label: "Missing hero angle", tone: "warning" }
  if (!v.has360) return { label: "No 360 spin", tone: "warning" }
  if (v.incompletePhotoSet) return { label: "Incomplete photo set", tone: "warning" }
  if (v.hasSunGlare) return { label: "Sun glare", tone: "warning" }
  return { label: "On track", tone: "neutral" }
}

/**
 * Returns ALL applicable media issues for a vehicle (not just the highest-priority one).
 * Used to render multiple issue chips in the Issues column of the inventory table.
 */
export function allIssueLabelsForMerchandisingOverview(
  v: MerchandisingVehicle,
): InventoryIssueDisplay[] {
  if (v.mediaStatus === "no-photos") return [{ label: "No photos", tone: "danger" }]

  const issues: InventoryIssueDisplay[] = []
  if (v.mediaStatus === "clone-photos") issues.push({ label: "Instant media", tone: "warning" })
  if (v.photoCount > 0 && v.photoCount < 8) issues.push({ label: "Less than 8 photos", tone: "warning" })
  if (v.hasSunGlare) issues.push({ label: "Unclear images", tone: "warning" })
  if (v.wrongHeroAngle) issues.push({ label: "Wrong hero angle", tone: "warning" })
  if (!v.has360) issues.push({ label: "No 360 spin", tone: "warning" })
  if (v.incompletePhotoSet) issues.push({ label: "Incomplete set", tone: "warning" })
  if (issues.length === 0) return [{ label: "On track", tone: "neutral" }]
  return issues
}
