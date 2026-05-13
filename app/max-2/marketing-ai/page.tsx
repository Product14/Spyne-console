"use client"

import * as React from "react"
import {
  SmartCampaignsHub,
  type SmartCampaignsHubHandle,
} from "@/components/max-2/marketing"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { max2Classes, max2Layout, spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

/**
 * Hero variant of the Smart Campaigns experience.
 *
 * Same data and flows as `/max-2/marketing`, but the agentic prompt is the
 * page's primary affordance: it sits at the top as a centered hero block
 * with a clear "What campaign do you want to run?" headline. Suggestions
 * and metrics live below.
 */
export default function MarketingAiPage() {
  const hubRef = React.useRef<SmartCampaignsHubHandle>(null)

  return (
    <div className={cn(max2Layout.pageStack)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className={max2Classes.pageTitle}>Campaigns AI</h1>
          <p className={max2Classes.pageDescription}>
            Type a sentence. Spyne builds the campaign.
          </p>
        </div>
        <button
          type="button"
          onClick={() => hubRef.current?.startManual()}
          className={cn(spyneComponentClasses.btnSecondaryMd, "shrink-0")}
        >
          <MaterialSymbol name="tune" size={20} />
          Build manually
        </button>
      </div>

      <SmartCampaignsHub ref={hubRef} layout="hero" />
    </div>
  )
}
