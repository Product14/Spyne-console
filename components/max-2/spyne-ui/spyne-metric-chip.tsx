"use client"

import * as React from "react"
import { spyneDsChipMetricClass } from "@/lib/design-system/max-2"
import { SpyneChip } from "./core"

export interface SpyneMetricChipProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
  disabled?: boolean
  className?: string
}

/**
 * Toggle chip with trailing count disc — inventory shortcuts (Certified, Wholesale, Recents, etc.).
 */
export function SpyneMetricChip({
  label,
  count,
  active,
  onClick,
  disabled,
  className,
}: SpyneMetricChipProps) {
  return (
    <SpyneChip
      as="button"
      type="button"
      variant={active ? "soft" : "outline"}
      tone={active ? "primary" : "neutral"}
      disabled={disabled}
      onClick={onClick}
      className={className}
      trailing={<span className={spyneDsChipMetricClass} aria-hidden>{count}</span>}
    >
      {label}
    </SpyneChip>
  )
}
