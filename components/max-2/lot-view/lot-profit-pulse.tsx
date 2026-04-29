"use client"

import * as React from "react"
import { useHoldingCostRateOptional } from "@/components/max-2/holding-cost-rate-context"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { SpyneChip } from "@/components/max-2/spyne-chip"
import type { LotVehicle } from "@/services/max-2/max-2.types"

const fmt$ = (n: number) => `$${n.toLocaleString()}`

function cohortROI(vehicles: LotVehicle[]) {
  if (vehicles.length === 0) return 0
  const totalGross = vehicles.reduce((s, v) => s + v.estimatedFrontGross, 0)
  const totalDays = vehicles.reduce((s, v) => s + v.daysInStock, 0)
  return Math.round(totalGross / totalDays)
}

type RoiTier = "good" | "average" | "poor"

function getROITier(roi: number): RoiTier {
  if (roi >= 100) return "good"
  if (roi >= 60) return "average"
  return "poor"
}

const tierColor: Record<RoiTier, string> = {
  good: "text-spyne-success",
  average: "text-spyne-text",
  poor: "text-spyne-error",
}

const tierChipTone: Record<RoiTier, "success" | "warning" | "error"> = {
  good: "success",
  average: "warning",
  poor: "error",
}

const tierLabel: Record<RoiTier, string> = {
  good: "Good",
  average: "Average",
  poor: "Poor",
}

export function LotProfitPulse() {
  const { vehicles: lotVehicles, lotSummary: s, dailyRate } = useHoldingCostRateOptional()
  const rate = dailyRate ?? 46

  const { freshCohort, agedCohort, overallROI, freshROI, agedROI, reconDelayCars, reconInProgress, avgReconDays } =
    React.useMemo(() => {
      const frontline = lotVehicles.filter(
        (v) => v.lotStatus === "frontline" && v.daysInStock > 0,
      )
      const freshCohort = frontline.filter((v) => v.daysInStock <= 30)
      const agedCohort = frontline.filter((v) => v.daysInStock > 30)
      const reconDelayCars = lotVehicles.filter(
        (v) => v.lotStatus === "in-recon" && v.daysInStock > 2,
      )
      const reconInProgress = lotVehicles.filter((v) => v.lotStatus === "in-recon")
      const avgReconDays =
        reconInProgress.length > 0
          ? reconInProgress.reduce((s, v) => s + v.daysInStock, 0) /
            reconInProgress.length
          : 0
      return {
        freshCohort,
        agedCohort,
        overallROI: cohortROI(frontline),
        freshROI: cohortROI(freshCohort),
        agedROI: cohortROI(agedCohort),
        reconDelayCars,
        reconInProgress,
        avgReconDays,
      }
    }, [lotVehicles])

  const daily = s.totalHoldingCostToday
  const agedDailyCost = agedCohort.reduce(
    (sum, v) => sum + v.holdingCostPerDay,
    0,
  )
  const reconDelayedRevenue = reconDelayCars.reduce(
    (sum, v) => sum + v.estimatedFrontGross,
    0,
  )

  const roiTier = getROITier(overallROI)
  const isReconOnTarget = avgReconDays <= 3
  const daysOverTarget = Math.max(0, avgReconDays - 3)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* ── Card 1: Profit Leakage ── */}
      <Card className="shadow-none">
        <CardContent className="p-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Profit Leakage
          </p>

          <div className="mb-1">
            <span className="text-4xl font-bold tracking-tight text-spyne-error">
              {fmt$(daily)}
            </span>
            <span className="text-base text-muted-foreground font-normal ml-1.5">
              / day
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            Losing {fmt$(daily)} every day in holding costs across all units
          </p>

          <div className="border-t pt-4 space-y-2.5">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">
                7-day projection
              </span>
              <span className="text-sm font-semibold text-spyne-text">
                {fmt$(daily * 7)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">
                30-day projection
              </span>
              <span className="text-sm font-bold text-spyne-error">
                {fmt$(daily * 30)}
              </span>
            </div>
          </div>

          <div className="border-t mt-4 pt-4 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Loss Breakdown
            </p>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">
                Aged inventory ({agedCohort.length} cars)
              </span>
              <span className="text-sm font-semibold text-spyne-error">
                {fmt$(agedDailyCost)}/day
              </span>
            </div>
            {reconDelayedRevenue > 0 && (
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">
                  Revenue stuck in recon
                </span>
                <span className="text-sm font-semibold text-spyne-text">
                  {fmt$(reconDelayedRevenue)} held
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Card 2: ROI / Day ── */}
      <Card className="shadow-none">
        <CardContent className="p-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Avg Gross ROI / Day
          </p>

          <div className="mb-1 flex items-end gap-3">
            <span
              className={cn(
                "text-4xl font-bold tracking-tight",
                tierColor[roiTier],
              )}
            >
              {fmt$(overallROI)}
            </span>
            <span className="text-base text-muted-foreground font-normal mb-0.5">
              / day
            </span>
          </div>
          <div className="flex items-center gap-2 mb-5">
            <SpyneChip variant="soft" tone={tierChipTone[roiTier]}>
              {tierLabel[roiTier]}
            </SpyneChip>
            <span className="text-xs text-muted-foreground">
              Gross ÷ days on lot
            </span>
          </div>

          <div className="border-t pt-4 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Benchmark
            </p>
            {(
              [
                { range: "> $100 / day", label: "Good", dot: "bg-spyne-success" },
                { range: "$60–100 / day", label: "Average", dot: "bg-spyne-warning" },
                { range: "< $60 / day", label: "Poor", dot: "bg-spyne-error" },
              ] as const
            ).map((b) => (
              <div
                key={b.range}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn("h-2 w-2 rounded-full shrink-0", b.dot)}
                  />
                  <span className="text-muted-foreground">{b.range}</span>
                </div>
                <span className="text-muted-foreground/70 text-xs">
                  {b.label}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Cohort Breakdown
            </p>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">
                Fresh (0–30d · {freshCohort.length} cars)
              </span>
              <span className="text-sm font-semibold text-spyne-success">
                {fmt$(freshROI)}/day
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">
                Aged (31+ days · {agedCohort.length} cars)
              </span>
              <span className="text-sm font-semibold text-spyne-error">
                {fmt$(agedROI)}/day
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Card 3: Speed to Market ── */}
      <Card className="shadow-none">
        <CardContent className="p-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Speed to Market
          </p>

          <div className="mb-1">
            <span
              className={cn(
                "text-4xl font-bold tracking-tight",
                isReconOnTarget ? "text-spyne-success" : "text-spyne-error",
              )}
            >
              {avgReconDays.toFixed(1)}d
            </span>
            <span className="text-base text-muted-foreground font-normal ml-1.5">
              avg to frontline
            </span>
          </div>
          <div className="flex items-center gap-2 mb-5">
            <SpyneChip variant="soft" tone={isReconOnTarget ? "success" : "error"}>
              {isReconOnTarget ? "At target" : "Behind target"}
            </SpyneChip>
          </div>

          <div className="border-t pt-4 space-y-2.5">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Target</span>
              <span className="text-sm font-semibold">≤ 3 days</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">
                Current avg
              </span>
              <span
                className={cn(
                  "text-sm font-semibold",
                  isReconOnTarget ? "text-spyne-success" : "text-spyne-error",
                )}
              >
                {avgReconDays.toFixed(1)} days
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">
                In recon now
              </span>
              <span className="text-sm font-semibold">
                {reconInProgress.length} cars
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">
                Overdue (&gt; 2d)
              </span>
              <span
                className={cn(
                  "text-sm font-semibold",
                  reconDelayCars.length > 0
                    ? "text-spyne-text"
                    : "text-spyne-success",
                )}
              >
                {reconDelayCars.length} car
                {reconDelayCars.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div
            className={cn(
              "mt-5 rounded-lg px-3.5 py-3 text-sm leading-relaxed",
              daysOverTarget > 0
                ? "spyne-row-warn text-spyne-text"
                : "spyne-row-positive text-spyne-success",
            )}
          >
            {daysOverTarget > 0
              ? `${daysOverTarget.toFixed(1)} days slower than ideal - losing ~${fmt$(Math.round(daysOverTarget * rate * reconDelayCars.length))} per delayed car`
              : "Recon is on track. Keep units moving to frontline within 3 days."}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
