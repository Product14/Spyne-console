"use client"

import { useState } from "react"
import { mockOpportunities } from "@/lib/max-2-mocks"
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
import { PromoteVehicleModal } from "./promote-vehicle-modal"
import type { OpportunityItem } from "@/services/max-2/max-2.types"

export function HotCarPromotions() {
  const hotOpp = mockOpportunities.find((o) => o.category === "hot-vehicle")
  const items = hotOpp?.items ?? []
  const [selectedVehicle, setSelectedVehicle] = useState<OpportunityItem | null>(null)

  return (
    <>
      <Card className="shadow-none gap-0">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-3">
            <span className={cn(spyneComponentClasses.kpiIcon, "bg-spyne-primary-soft text-spyne-warning-ink")}>
              <MaterialSymbol name="local_fire_department" size={20} />
            </span>
            <div className="min-w-0">
              <CardTitle>Hot Car Promotions</CardTitle>
              <CardDescription>
                Rising demand and strong inventory
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                spyneComponentClasses.insightRow,
                "flex flex-col gap-3 p-4 sm:flex-row sm:items-center",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-spyne-text">{item.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <SpyneChip
                    variant="outline"
                    tone="warning"
                    compact
                    leading={<MaterialSymbol name="trending_up" size={14} className="shrink-0" />}
                  >
                    Hot
                  </SpyneChip>
                  <span className="text-xs text-spyne-text-secondary">{item.detail}</span>
                </div>
              </div>
              <button
                type="button"
                className={cn(spyneComponentClasses.btnSecondaryMd, "shrink-0")}
                onClick={() => setSelectedVehicle(item)}
              >
                Promote
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <PromoteVehicleModal
        vehicle={selectedVehicle}
        open={selectedVehicle !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedVehicle(null)
        }}
      />
    </>
  )
}
