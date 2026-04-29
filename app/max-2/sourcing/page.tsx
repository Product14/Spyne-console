"use client"

import {
  SourcingDemandKpiStrip,
  DemandSignals,
  MarketGaps,
  ServiceLaneOpps,
  TradeInOpps,
} from "@/components/max-2/sourcing"
import { max2Classes, max2Layout } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

export default function SourcingPage() {
  return (
    <div className={cn(max2Layout.pageStack)}>
      <div>
        <h1 className={max2Classes.pageTitle}>Sourcing</h1>
        <p className={max2Classes.pageDescription}>
          Demand and acquisition opportunities: buy what your market is asking for.
        </p>
      </div>

      <SourcingDemandKpiStrip />

      <DemandSignals />
      <MarketGaps />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServiceLaneOpps />
        <TradeInOpps />
      </div>
    </div>
  )
}
