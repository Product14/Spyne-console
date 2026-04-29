"use client"

import { useHoldingCostRateOptional } from "@/components/max-2/holding-cost-rate-context"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Bucket {
  label: string
  min: number
  max: number
  phase: string
  phaseAction: string
  urgency: "none" | "monitor" | "reprice" | "urgent"
  barColor: string
  phaseColor: string
  phaseBg: string
}

const buckets: Bucket[] = [
  {
    label: "0–15 days",
    min: 0,
    max: 15,
    phase: "Fresh",
    phaseAction: "No action needed",
    urgency: "none",
    barColor: "bg-spyne-success",
    phaseColor: "text-spyne-success",
    phaseBg: "spyne-row-positive",
  },
  {
    label: "16–30 days",
    min: 16,
    max: 30,
    phase: "Monitor",
    phaseAction: "Watch pricing & leads",
    urgency: "monitor",
    barColor: "bg-spyne-info",
    phaseColor: "text-spyne-info",
    phaseBg: "bg-spyne-primary-soft",
  },
  {
    label: "31–45 days",
    min: 31,
    max: 45,
    phase: "Reprice",
    phaseAction: "Drop price to drive demand",
    urgency: "reprice",
    barColor: "bg-spyne-warning",
    phaseColor: "text-spyne-text",
    phaseBg: "spyne-row-warn",
  },
  {
    label: "46–60 days",
    min: 46,
    max: 60,
    phase: "Liquidate",
    phaseAction: "Wholesale or deep reprice",
    urgency: "urgent",
    barColor: "bg-spyne-error",
    phaseColor: "text-spyne-error",
    phaseBg: "spyne-row-error",
  },
  {
    label: "60+ days",
    min: 61,
    max: Infinity,
    phase: "Exit Now",
    phaseAction: "Auction or write-down",
    urgency: "urgent",
    barColor: "bg-spyne-error",
    phaseColor: "text-spyne-error",
    phaseBg: "spyne-row-error",
  },
]

export function AgingDistribution() {
  const { vehicles: lotVehicles } = useHoldingCostRateOptional()
  const activeLot = lotVehicles.filter(
    (v) => v.lotStatus !== "sold-pending" && v.lotStatus !== "arriving",
  )
  const total = activeLot.length

  const counts = buckets.map((b) => {
    const vehicles = activeLot.filter(
      (v) => v.daysInStock >= b.min && v.daysInStock <= b.max,
    )
    const holdingCost = vehicles.reduce(
      (sum, v) => sum + v.holdingCostPerDay,
      0,
    )
    return {
      ...b,
      count: vehicles.length,
      pct: total > 0 ? (vehicles.length / total) * 100 : 0,
      holdingCost,
    }
  })

  const maxCount = Math.max(...counts.map((c) => c.count), 1)
  const riskZoneCount = counts[2].count + counts[3].count + counts[4].count
  const riskZoneCost =
    counts[2].holdingCost + counts[3].holdingCost + counts[4].holdingCost
  const freshCount = counts[0].count + counts[1].count

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Aging Decision Timeline</CardTitle>
        <CardDescription>
          Each bucket tells you what action to take — not just how old the car
          is
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-3">
          {counts.map((bucket) => (
            <div key={bucket.label} className="flex items-center gap-4">
              {/* Phase chip */}
              <span
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold w-[72px] text-center",
                  bucket.phaseBg,
                  bucket.phaseColor,
                )}
              >
                {bucket.phase}
              </span>

              {/* Day label */}
              <span className="text-xs text-muted-foreground w-[68px] shrink-0">
                {bucket.label}
              </span>

              {/* Bar */}
              <div className="flex-1 h-7 bg-muted/40 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    bucket.barColor,
                  )}
                  style={{
                    width: `${(bucket.count / maxCount) * 100}%`,
                    minWidth: bucket.count > 0 ? "6px" : "0",
                  }}
                />
              </div>

              {/* Count + % */}
              <div className="flex items-baseline gap-2 shrink-0 w-[64px] justify-end">
                <span
                  className={cn(
                    "text-base font-bold",
                    bucket.urgency === "urgent"
                      ? bucket.phaseColor
                      : bucket.urgency === "reprice"
                      ? bucket.phaseColor
                      : "text-foreground",
                  )}
                >
                  {bucket.count}
                </span>
                <span className="text-xs text-muted-foreground">
                  {bucket.pct.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary footer */}
        <div className="mt-5 pt-4 border-t space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Active inventory:{" "}
              <strong className="text-foreground font-semibold">{total}</strong>{" "}
              units
            </span>
            <span>
              Fresh (≤ 30d):{" "}
              <strong className="text-spyne-success font-semibold">
                {freshCount}
              </strong>
              {"  ·  "}
              Risk zone (31+d):{" "}
              <strong className="text-spyne-error font-semibold">
                {riskZoneCount}
              </strong>
            </span>
          </div>

          {riskZoneCount > 0 && (
            <div className="flex items-start gap-3 rounded-lg border-l-4 border-l-spyne-warning spyne-row-warn px-4 py-3">
              <div className="flex-1">
                <p className="text-sm text-spyne-text">
                  <span className="font-semibold">
                    {riskZoneCount} car{riskZoneCount !== 1 ? "s" : ""} in the
                    risk zone (31+ days)
                  </span>{" "}
                  — costing{" "}
                  <strong>${riskZoneCost.toLocaleString()}/day</strong> in
                  holding costs. Reprice or liquidate to recover margin.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
