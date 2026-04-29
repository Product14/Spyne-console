import type {
  LotVehicle,
  MediaStatus,
  MerchandisingVehicle,
  PublishStatus,
} from "@/services/max-2/max-2.types"
import { demoVehicleThumbnailByKey } from "@/lib/demo-vehicle-hero-images"

/**
 * Builds a {@link MerchandisingVehicle} row from lot mock data so embedded
 * {@link VehicleMediaTable} matches the Studio inventory listing columns (including Issue).
 */
export function lotVehicleToMerchandising(lv: LotVehicle): MerchandisingVehicle {
  const mediaStatus: MediaStatus =
    lv.photoCount === 0 ? "no-photos" : lv.hasRealPhotos ? "real-photos" : "stock-photos"

  const publishStatus: PublishStatus =
    lv.lotStatus === "sold-pending"
      ? "not-published"
      : lv.vdpViews > 0
        ? "live"
        : "pending"

  const bodyStyleFromSegment = (segment: string | undefined): string | undefined => {
    if (!segment) return undefined
    const t = segment.trim()
    if (!t) return undefined
    return t.split(/\s+/)[0]
  }

  return {
    vin: lv.vin,
    year: lv.year,
    make: lv.make,
    model: lv.model,
    trim: lv.trim,
    stockNumber: lv.stockNumber,
    thumbnailUrl: demoVehicleThumbnailByKey(lv.vin),
    mediaStatus,
    photoCount: lv.photoCount,
    has360: lv.hasSpin360 !== false,
    hasVideo: false,
    publishStatus,
    lastPublishedAt: undefined,
    listingScore: Math.min(100, Math.max(0, Math.round(40 + lv.photoCount * 1.5))),
    daysInStock: lv.daysInStock,
    vdpViews: lv.vdpViews,
    price: lv.listPrice,
    odometer: lv.mileage,
    hasDescription: lv.photoCount > 0,
    isNew: false,
    daysToFrontline: 0,
    wrongHeroAngle: !lv.hasRealPhotos && lv.photoCount >= 4,
    incompletePhotoSet: lv.photoCount > 0 && lv.photoCount < 8,
    hasSunGlare: false,
    missingWalkaroundVideo: false,
    bodyStyle: bodyStyleFromSegment(lv.segment),
    exteriorColor: lv.color,
    fuelType: "Gasoline",
    estimatedFrontGross: lv.estimatedFrontGross,
    combinedMpg: undefined,
  }
}
