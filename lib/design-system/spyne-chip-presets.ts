/**
 * Canonical label + tone pairs for domain enums → `SpyneChip` / semantic chip components.
 * Use these on new screens instead of duplicating maps in page files.
 */
import type { SpyneChipTone } from "./max-2"
import type {
  LotStatus,
  MediaStatus,
  PricingPosition,
  PublishStatus,
} from "@/services/max-2/max-2.types"

export type SpyneDomainChipPreset = {
  label: string
  tone: SpyneChipTone
}

export const spyneLotStatusChipPreset: Record<LotStatus, SpyneDomainChipPreset> = {
  frontline: { label: "Frontline", tone: "success" },
  "in-recon": { label: "In Recon", tone: "warning" },
  arriving: { label: "Arriving", tone: "info" },
  "wholesale-candidate": { label: "Wholesale", tone: "error" },
  "sold-pending": { label: "Sold Pending", tone: "neutral" },
}

export const spyneMediaStatusChipPreset: Record<MediaStatus, SpyneDomainChipPreset> = {
  "real-photos": { label: "Real", tone: "success" },
  "clone-photos": { label: "Clone", tone: "warning" },
  "stock-photos": { label: "Stock", tone: "error" },
  "no-photos": { label: "Draft", tone: "neutral" },
}

export const spynePublishStatusChipPreset: Record<PublishStatus, SpyneDomainChipPreset> = {
  live: { label: "Live", tone: "success" },
  pending: { label: "Pending", tone: "warning" },
  "not-published": { label: "Not published", tone: "neutral" },
}

/** Labels for pricing chips / filter facets */
export const spynePricingPositionChipPreset: Record<PricingPosition, SpyneDomainChipPreset> = {
  "below-market": { label: "Below market", tone: "success" },
  "at-market": { label: "At market", tone: "neutral" },
  "above-market": { label: "Above market", tone: "error" },
}

export const spyneLotStatusOrder: LotStatus[] = [
  "frontline",
  "in-recon",
  "arriving",
  "wholesale-candidate",
  "sold-pending",
]

export const spynePricingPositionOrder: PricingPosition[] = [
  "below-market",
  "at-market",
  "above-market",
]
