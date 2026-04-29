import type { MerchandisingVehicle } from "@/services/max-2/max-2.types"
import {
  issueLabelForStudioInventoryMerchandisingOverview,
  type MerchandisingOverviewIssueContext,
} from "@/lib/inventory-issue-label"

export type MerchandisingInventoryActionKind =
  | "add-media"
  | "replace-media"
  | "generate-360"
  | "view-more-text"
  | "view-more-button"

/**
 * Single source of truth for Active Inventory–style merchandising row actions
 * (Add Media, Replace Media, Generate 360, View More as text vs button).
 */
export function merchandisingInventoryActionKind(
  v: MerchandisingVehicle,
  issueContext: MerchandisingOverviewIssueContext = "default"
): MerchandisingInventoryActionKind {
  if (v.mediaStatus === "no-photos") return "add-media"
  if (issueContext === "no-360" && !v.has360) return "generate-360"
  if (v.mediaStatus === "clone-photos") return "replace-media"
  const issue = issueLabelForStudioInventoryMerchandisingOverview(v, issueContext)
  if (issue.label === "Less than 8 photos") return "add-media"
  if (issue.label === "Less interior photos" || issue.label === "Less exterior photos") return "add-media"
  if (issue.label === "No 360 spin") return "generate-360"
  if (issue.tone === "neutral" && issue.label === "On track") return "view-more-text"
  return "view-more-button"
}

export function merchandisingInventoryDetailHref(vin: string): string {
  return `/max-2/studio/inventory/vehicle/${encodeURIComponent(vin)}`
}

/** True when the primary row CTA is already “View More” (text or button); hide duplicate “View more” under it. */
export function merchandisingInventoryPrimaryIsViewMore(
  v: MerchandisingVehicle,
  issueContext: MerchandisingOverviewIssueContext = "default"
): boolean {
  const k = merchandisingInventoryActionKind(v, issueContext)
  return k === "view-more-text" || k === "view-more-button"
}
