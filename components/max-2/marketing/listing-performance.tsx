"use client"

import { useState } from "react"
import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
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
import { BoostPerformerModal } from "./boost-performer-modal"
import { ImproveListingModal } from "./improve-listing-modal"
import type { MerchandisingVehicle } from "@/services/max-2/max-2.types"

export function ListingPerformance() {
  const sorted = [...mockMerchandisingVehicles]
    .filter((v) => v.publishStatus === "live")
    .sort((a, b) => b.vdpViews - a.vdpViews)

  const top5 = sorted.slice(0, 5)
  const bottom5 = sorted.slice(-5).reverse()

  const [boostVehicle, setBoostVehicle] = useState<MerchandisingVehicle | null>(null)
  const [improveVehicle, setImproveVehicle] = useState<MerchandisingVehicle | null>(null)

  function VehicleRow({
    v,
    variant,
  }: {
    v: (typeof sorted)[number]
    variant: "top" | "bottom"
  }) {
    return (
      <div className="flex items-center gap-3 border-b border-spyne-border py-2.5 last:border-b-0">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-spyne-text">
            {v.year} {v.make} {v.model}
          </p>
          <div className="mt-0.5 flex items-center gap-3 text-xs text-spyne-text-secondary">
            <span>{v.vdpViews} VDPs</span>
            <span>Score: {v.listingScore}</span>
          </div>
        </div>
        <SpyneChip
          variant="soft"
          tone={variant === "top" ? "success" : "error"}
          compact
          className="shrink-0 tabular-nums"
        >
          {v.vdpViews} views
        </SpyneChip>
        <button
          type="button"
          className={cn(
            "shrink-0",
            variant === "top"
              ? spyneComponentClasses.btnPrimaryMd
              : spyneComponentClasses.btnSecondaryMd,
          )}
          onClick={() =>
            variant === "top" ? setBoostVehicle(v) : setImproveVehicle(v)
          }
        >
          {variant === "top" ? "Boost" : "Improve"}
        </button>
      </div>
    )
  }

  return (
    <>
      <Card className="shadow-none gap-0">
        <CardHeader className="pb-4">
          <CardTitle>Listing Performance</CardTitle>
          <CardDescription>
            Live listings ranked by VDP views (top five and lowest five).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <MaterialSymbol name="trending_up" size={16} className="text-spyne-success" />
                <h3 className="text-sm font-semibold text-spyne-text">Top Performers</h3>
              </div>
              <div
                className={cn(
                  spyneComponentClasses.insightRow,
                  "rounded-lg p-3",
                )}
              >
                {top5.map((v) => (
                  <VehicleRow key={v.vin} v={v} variant="top" />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <MaterialSymbol name="trending_down" size={16} className="text-spyne-error" />
                <h3 className="text-sm font-semibold text-spyne-text">Needs Attention</h3>
              </div>
              <div
                className={cn(
                  spyneComponentClasses.insightRow,
                  "rounded-lg p-3",
                )}
              >
                {bottom5.map((v) => (
                  <VehicleRow key={v.vin} v={v} variant="bottom" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <BoostPerformerModal
        vehicle={boostVehicle}
        open={boostVehicle !== null}
        onOpenChange={(open) => {
          if (!open) setBoostVehicle(null)
        }}
      />

      <ImproveListingModal
        vehicle={improveVehicle}
        open={improveVehicle !== null}
        onOpenChange={(open) => {
          if (!open) setImproveVehicle(null)
        }}
      />
    </>
  )
}
