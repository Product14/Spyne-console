import type { MerchandisingVehicle, StudioMediaAssetStage } from "@/services/max-2/max-2.types"

export type ResolvedStudioMediaPipeline = {
  images: StudioMediaAssetStage
  spin360: StudioMediaAssetStage
  video: StudioMediaAssetStage
}

function deriveImages(v: MerchandisingVehicle): StudioMediaAssetStage {
  if (v.photoCount === 0) return "draft"
  if (v.publishStatus === "pending") return "review"
  if (v.mediaStatus === "clone-photos" || v.mediaStatus === "stock-photos") return "review"
  if (v.incompletePhotoSet || v.wrongHeroAngle || v.hasSunGlare) return "review"
  return "ready"
}

function deriveSpin360(v: MerchandisingVehicle): StudioMediaAssetStage {
  if (v.has360) return "ready"
  if (v.publishStatus === "pending") return "review"
  return "draft"
}

function deriveVideo(v: MerchandisingVehicle): StudioMediaAssetStage {
  if (v.hasVideo) return "ready"
  if (v.publishStatus === "pending") return "review"
  if (v.missingWalkaroundVideo && v.publishStatus === "live") return "draft"
  return "draft"
}

/**
 * Resolves Draft / Review / Processing / Ready for Images, 360°, and Video for inventory Media column.
 * Uses `mediaPipeline` when provided; otherwise derives from existing merchandising flags.
 * Vehicles with no photos always resolve to Draft for all asset rows (grey chips in the Media column).
 */
export function resolveStudioMediaPipeline(v: MerchandisingVehicle): ResolvedStudioMediaPipeline {
  if (v.photoCount === 0 || v.mediaStatus === "no-photos") {
    return { images: "draft", spin360: "draft", video: "draft" }
  }
  const o = v.mediaPipeline
  return {
    images: o?.images ?? deriveImages(v),
    spin360: o?.spin360 ?? deriveSpin360(v),
    video: o?.video ?? deriveVideo(v),
  }
}
