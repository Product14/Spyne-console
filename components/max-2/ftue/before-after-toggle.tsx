"use client"

import * as React from "react"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import {
  SpyneSegmentedControl,
  SpyneSegmentedButton,
} from "@/components/max-2/spyne-toolbar-controls"
import { cn } from "@/lib/utils"

export type BeforeAfterView = "before" | "after"

interface BeforeAfterToggleProps {
  value: BeforeAfterView
  onChange: (next: BeforeAfterView) => void
  className?: string
}

/** Before / After segmented control for the VLP gallery. */
export function BeforeAfterToggle({
  value,
  onChange,
  className,
}: BeforeAfterToggleProps) {
  return (
    <div className={cn("inline-flex", className)}>
      <SpyneSegmentedControl aria-label="Before / After photos">
        <SpyneSegmentedButton
          active={value === "before"}
          onClick={() => onChange("before")}
        >
          <MaterialSymbol name="image" size={16} />
          Before
        </SpyneSegmentedButton>
        <SpyneSegmentedButton
          active={value === "after"}
          onClick={() => onChange("after")}
        >
          <MaterialSymbol name="auto_awesome" size={16} />
          After
        </SpyneSegmentedButton>
      </SpyneSegmentedControl>
    </div>
  )
}
