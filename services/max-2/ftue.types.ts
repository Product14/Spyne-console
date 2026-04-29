/**
 * Types for the first-time inventory-fetch FTUE.
 * Lives outside `max-2.types.ts` so the FTUE feature can be lifted later
 * without entangling the merchandising domain types.
 */

export type FtueImsProvider = "vauto" | "winq" | "homenet" | "dealer-dotcom"

export type FtuePhase = "syncing" | "scanning" | "insights"

/** IMS-side fetch summary. The sync animation runs once and reveals this static snapshot. */
export interface FtueSyncState {
  fetched: number
  total: number
  /** 0–100, derived but cached so animations don't tear. */
  pct: number
  complete: boolean
  /** ISO timestamp of when this sync ran — surfaced as static "Synced on …" copy. */
  syncedAt: string
}

/** Bucket counts returned after the IMS scan completes. */
export interface FtueInventoryBreakdown {
  totalVehicles: number
  noPhotos: number
  stockPhotos: number
  rawPhotos: number
}

/** Live counters for the auto-process pipeline kicked off for raw photos. */
export interface FtueProcessingState {
  processed: number
  total: number
  inReview: number
  issued: number
}

/** Single source of truth shared by `FtueModal` and `MerchandisingBanner`. */
export interface FtueState {
  phase: FtuePhase
  ims: FtueImsProvider
  sync: FtueSyncState
  /** Inventory health score, 0–100. Methodology TBD — see open question #1. */
  score: number
  breakdown: FtueInventoryBreakdown
  processing: FtueProcessingState
  smartMatchApplied: boolean
  /** True until the user has dismissed the modal at least once. */
  isFirstRun: boolean
}

export interface FtueController {
  state: FtueState
  /** Open the modal — used by the banner click target. */
  openModal: () => void
  /** Close the modal. Processing continues in the background. */
  closeModal: () => void
  isModalOpen: boolean
  applySmartMatch: () => void
  /** Move on from sync → scanning (driven by the “Start analysis” CTA). */
  startAnalysis: () => void
  /** Demo-only: reset the entire FTUE flow back to syncing. */
  resetFtue: () => void
  processingComplete: boolean
}
