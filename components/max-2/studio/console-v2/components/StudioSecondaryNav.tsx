"use client"

import { max2Classes } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import { StudioInventoryLineTabs } from "@/components/max-2/studio/studio-inventory-line-tabs"

export default function StudioSecondaryNav() {
  return (
    <div className={cn(max2Classes.moduleSecondaryNavShell)}>
      <div className="min-w-0 w-full px-max2-page">
        <StudioInventoryLineTabs className="!border-b-0" />
      </div>
      <div className={max2Classes.studioInventoryTabHairline} aria-hidden />
    </div>
  )
}
