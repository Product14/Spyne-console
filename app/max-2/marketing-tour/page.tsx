"use client"

import * as React from "react"
import {
  SmartCampaignsHub,
  // SmartCampaignsIntroModal, // FTUE intro disabled per product request.
  type SmartCampaignsHubHandle,
} from "@/components/max-2/marketing"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { max2Classes, max2Layout, spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

/**
 * FTUE / demo clone of the Marketing route. Identical Smart Campaigns
 * experience, but the intro modal fires every visit (forceOpen) so the
 * onboarding story can be replayed on demand.
 */
export default function MarketingTourPage() {
  const hubRef = React.useRef<SmartCampaignsHubHandle>(null)

  return (
    <div className={cn(max2Layout.pageStack)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className={max2Classes.pageTitle}>Smart Campaigns</h1>
          <p className={max2Classes.pageDescription}>
            Spyne suggests campaigns from your aging and holding-cost signals.
          </p>
        </div>
        <button
          type="button"
          onClick={() => hubRef.current?.startManual()}
          className={cn(spyneComponentClasses.btnPrimaryMd, "shrink-0")}
        >
          <MaterialSymbol name="add" size={20} />
          Create new campaign
        </button>
      </div>

      <SmartCampaignsHub ref={hubRef} />
      {/* Smart Campaigns FTUE intro disabled. Restore by uncommenting the
          import above and the line below.
      <SmartCampaignsIntroModal forceOpen />
      */}
    </div>
  )
}
