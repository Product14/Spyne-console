"use client"

import { useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneChip } from "@/components/max-2/spyne-ui"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import { LaunchCampaignModal } from "./launch-campaign-modal"

const campaigns = [
  {
    id: "co1",
    vehicle: "2021 Ford F-150 XLT",
    segment: "Truck $30-45k",
    demandTrend: "Truck demand up 12%",
    suggestedCampaign: "Geo-targeted social ad",
  },
  {
    id: "co2",
    vehicle: "2022 Audi Q5 Premium",
    segment: "Luxury $40k+",
    demandTrend: "Luxury crossover demand strong",
    suggestedCampaign: "Premium display campaign",
  },
  {
    id: "co3",
    vehicle: "2020 Toyota RAV4 XLE",
    segment: "SUV < $30k",
    demandTrend: "SUV demand up 18%",
    suggestedCampaign: "Search + retargeting bundle",
  },
  {
    id: "co4",
    vehicle: "2021 Mazda CX-5 Touring",
    segment: "Crossover $25-40k",
    demandTrend: "Crossover demand rising 9%",
    suggestedCampaign: "Email blast to past inquiries",
  },
]

export function CampaignOpportunities() {
  const [selectedCampaign, setSelectedCampaign] = useState<(typeof campaigns)[number] | null>(null)

  return (
    <>
      <Card className="shadow-none gap-0">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-3">
            <span className={cn(spyneComponentClasses.kpiIcon, "bg-spyne-primary-soft text-spyne-primary")}>
              <MaterialSymbol name="rocket_launch" size={20} />
            </span>
            <div className="min-w-0">
              <CardTitle>Campaign Opportunities</CardTitle>
              <CardDescription>
                Vehicles ready for targeted campaigns
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className={cn(
                spyneComponentClasses.insightRow,
                "flex flex-col gap-3 p-4 sm:flex-row sm:items-center",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-spyne-text">{c.vehicle}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <SpyneChip variant="outline" tone="neutral" compact>
                    {c.segment}
                  </SpyneChip>
                  <span className="inline-flex items-center gap-1 text-xs text-spyne-success">
                    <MaterialSymbol name="trending_up" size={14} className="shrink-0" />
                    {c.demandTrend}
                  </span>
                </div>
                <p className="mt-1 text-xs text-spyne-text-secondary">
                  Suggested: {c.suggestedCampaign}
                </p>
              </div>
              <button
                type="button"
                className={cn(spyneComponentClasses.btnPrimaryMd, "shrink-0")}
                onClick={() => setSelectedCampaign(c)}
              >
                Launch Campaign
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <LaunchCampaignModal
        campaign={selectedCampaign}
        open={selectedCampaign !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedCampaign(null)
        }}
      />
    </>
  )
}
