"use client"

import * as React from "react"
import type { LotStatus, MediaStatus, PricingPosition, PublishStatus } from "@/services/max-2/max-2.types"
import {
  spyneLotStatusChipPreset,
  spyneMediaStatusChipPreset,
  spynePricingPositionChipPreset,
  spynePublishStatusChipPreset,
} from "@/lib/design-system/spyne-chip-presets"
import type { SpyneChipVariant } from "@/lib/design-system/max-2"
import { SpyneChip } from "./core"

type ChipExtra = {
  compact?: boolean
  className?: string
  variant?: SpyneChipVariant
}

/** Lot vehicle row status (Frontline, In Recon, …). */
export function SpyneLotStatusChip({
  status,
  compact = false,
  className,
  variant = "outline",
}: { status: LotStatus } & ChipExtra) {
  const p = spyneLotStatusChipPreset[status]
  return (
    <SpyneChip variant={variant} tone={p.tone} compact={compact} className={className}>
      {p.label}
    </SpyneChip>
  )
}

/** Studio AI / media table — photo source quality. */
export function SpyneMediaStatusChip({
  mediaStatus,
  compact = false,
  className,
  variant = "outline",
}: { mediaStatus: MediaStatus } & ChipExtra) {
  const p = spyneMediaStatusChipPreset[mediaStatus]
  return (
    <SpyneChip variant={variant} tone={p.tone} compact={compact} className={className}>
      {p.label}
    </SpyneChip>
  )
}

/** Below / at / above market (pricing position). */
export function SpynePricingPositionChip({
  pricingPosition,
  compact = false,
  className,
  variant = "outline",
}: { pricingPosition: PricingPosition } & ChipExtra) {
  const p = spynePricingPositionChipPreset[pricingPosition]
  return (
    <SpyneChip variant={variant} tone={p.tone} compact={compact} className={className}>
      {p.label}
    </SpyneChip>
  )
}

/** Live / Pending / Not published state. */
export function SpynePublishStatusChip({
  publishStatus,
  compact = false,
  className,
  variant = "outline",
}: { publishStatus: PublishStatus } & ChipExtra) {
  const p = spynePublishStatusChipPreset[publishStatus]
  return (
    <SpyneChip variant={variant} tone={p.tone} compact={compact} className={className}>
      {p.label}
    </SpyneChip>
  )
}

export type SpyneSeverityLevel = "error" | "warning"

/** Issue / alert row tags (e.g. aged vehicle hints). */
export function SpyneSeverityChip({
  severity,
  children,
  compact = false,
  className,
}: {
  severity: SpyneSeverityLevel
  children: React.ReactNode
  compact?: boolean
  className?: string
}) {
  return (
    <SpyneChip
      variant="outline"
      tone={severity === "error" ? "error" : "warning"}
      compact={compact}
      className={className}
    >
      {children}
    </SpyneChip>
  )
}
