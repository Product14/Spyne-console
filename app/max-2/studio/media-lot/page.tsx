"use client"

import * as React from "react"
import {
  LotKPIStrip,
  LotBodyAnalysis,
  LotIssueBuckets,
  LotHoldingCostWidget,
} from "@/components/max-2/lot-view"
import { readPersistedHoldingStateBrowser } from "@/lib/holding-cost-config"
import { max2Classes, max2Layout } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

export default function MediaLotPage() {
  const [holdingCostConfigured, setHoldingCostConfigured] = React.useState(false)

  React.useEffect(() => {
    setHoldingCostConfigured(readPersistedHoldingStateBrowser().configured)
  }, [])

  const handleHoldingCostSaved = React.useCallback((_dailyRate: number) => {
    setHoldingCostConfigured(true)
  }, [])

  return (
    <div className={cn(max2Layout.pageStack)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={max2Classes.pageTitle}>Lot Overview</h1>
          <p className={max2Classes.pageDescription}>
            Inventory and media health for your lot: aged stock, holding cost,
            and prioritized actions.
          </p>
        </div>
        <LotHoldingCostWidget
          configured={holdingCostConfigured}
          onSave={handleHoldingCostSaved}
        />
      </div>

      <LotKPIStrip showHoldingCost={holdingCostConfigured} />
      <LotBodyAnalysis />
      <LotIssueBuckets />
    </div>
  )
}
