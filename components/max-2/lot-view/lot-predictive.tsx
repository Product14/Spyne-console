"use client"

import { useHoldingCostRateOptional } from "@/components/max-2/holding-cost-rate-context"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const fmt$ = (n: number) => `$${n.toLocaleString()}`

export function LotPredictive() {
  const { vehicles: lotVehicles, lotSummary: s, dailyRate } = useHoldingCostRateOptional()
  const rate = dailyRate ?? 46

  const willCross45 = lotVehicles.filter((v) => {
    const daysUntilCross = 45 - v.daysInStock
    return (
      daysUntilCross > 0 &&
      daysUntilCross <= 7 &&
      v.lotStatus !== "sold-pending"
    )
  })

  const sevenDayLoss = s.totalHoldingCostToday * 7
  const aged45WeeklyCost = s.aged45Plus * rate * 7
  const recoveryLow = Math.round(sevenDayLoss * 0.4)
  const recoveryHigh = Math.round(sevenDayLoss * 0.6)

  return (
    <Card className="shadow-none gap-0">
      <CardContent className="px-6 pb-6 pt-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              If No Action is Taken
            </p>
            <p className="text-sm font-medium mt-0.5">7-day forward projection</p>
          </div>
          <div className="h-px flex-1 bg-border mx-6" />
          <span className="text-xs text-muted-foreground shrink-0">
            Based on current holding costs
          </span>
        </div>

        {/* 3 metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="rounded-lg border bg-muted/20 px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">
              Projected profit loss
            </p>
            <p className="text-3xl font-bold tracking-tight text-spyne-error">
              {fmt$(sevenDayLoss)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              over next 7 days if no units sell
            </p>
          </div>

          <div
            className={cn(
              "rounded-lg border px-5 py-4",
              willCross45.length > 0
                ? "spyne-row-warn"
                : "spyne-row-positive",
            )}
          >
            <p className="text-xs text-muted-foreground mb-1">
              Cars crossing 45-day mark
            </p>
            <p
              className={cn(
                "text-3xl font-bold tracking-tight",
                willCross45.length > 0 ? "text-spyne-text" : "text-spyne-success",
              )}
            >
              {willCross45.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {willCross45.length > 0
                ? willCross45
                    .map((v) => `${v.year} ${v.make} ${v.model}`)
                    .join(", ")
                : "No cars approaching 45-day mark"}
            </p>
          </div>

          <div className="rounded-lg border bg-muted/20 px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">
              Weekly cost from 45+ aged stock
            </p>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {fmt$(aged45WeeklyCost)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {s.aged45Plus} car{s.aged45Plus !== 1 ? "s" : ""} with no buyer
              activity
            </p>
          </div>
        </div>

        {/* Recovery insight */}
        {(willCross45.length > 0 || s.aged45Plus > 0) && (
          <div className="rounded-lg border-l-4 border-l-primary/40 bg-primary/5 px-4 py-3.5">
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-semibold">Taking action today</span> on
              aged and at-risk units could recover an estimated{" "}
              <span className="font-bold text-primary">
                {fmt$(recoveryLow)}–{fmt$(recoveryHigh)}
              </span>{" "}
              in gross margin over the next 7 days by moving inventory faster
              and avoiding further depreciation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
