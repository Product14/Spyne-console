"use client"

import {
  MarketingChannelKpiStrip,
  ChannelROITable,
  CampaignOpportunities,
  HotCarPromotions,
  ListingPerformance,
  CampaignFunnel,
} from "@/components/max-2/marketing"
import { max2Classes, max2Layout } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

export default function MarketingPage() {
  return (
    <div className={cn(max2Layout.pageStack)}>
      <div>
        <h1 className={max2Classes.pageTitle}>Marketing</h1>
        <p className={max2Classes.pageDescription}>
          Demand generation: put the right cars in front of the right buyers.
        </p>
      </div>

      <MarketingChannelKpiStrip />

      <CampaignFunnel />

      <ChannelROITable />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CampaignOpportunities />
        <HotCarPromotions />
      </div>

      <ListingPerformance />
    </div>
  )
}
