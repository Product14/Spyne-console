"use client"

import { MaterialSymbol } from "@/components/max-2/material-symbol"

/**
 * Placed to the right of a sortable column title. Inactive: swap_vert; active: arrow up/down.
 * Parent controls a 3-step cycle: ascending → descending → reset to table default (`active` false).
 */
export function StudioInventorySortIcon({
  active,
  direction,
}: {
  active: boolean
  direction: "asc" | "desc"
}) {
  if (!active) {
    return (
      <MaterialSymbol
        name="swap_vert"
        size={14}
        className="shrink-0 opacity-45 text-muted-foreground"
        aria-hidden
      />
    )
  }
  return (
    <MaterialSymbol
      name={direction === "asc" ? "arrow_upward" : "arrow_downward"}
      size={14}
      className="shrink-0 text-spyne-primary"
      aria-hidden
    />
  )
}
