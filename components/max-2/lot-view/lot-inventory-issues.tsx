"use client"

import * as React from "react"
import { useHoldingCostRateOptional } from "@/components/max-2/holding-cost-rate-context"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import {
  EyeOff,
  ImageOff,
  Wrench,
  ArrowUp,
  TriangleAlert,
  BarChart2,
} from "lucide-react"

const fmt$ = (n: number) => `$${n.toLocaleString()}`

interface IssueItem {
  id: string
  icon: React.ReactNode
  title: string
  count: number
  impact: string
  suggestion: string
  severity: "high" | "medium"
}

export function LotInventoryIssues() {
  const { vehicles: lotVehicles, dailyRate } = useHoldingCostRateOptional()
  const rate = dailyRate ?? 46

  const {
    issues,
    top5Cars,
    belowRank10Cars,
    overpricedCars,
    belowMarketCars,
    atMarketCars,
  } = React.useMemo(() => {
    const noLeadsCars = lotVehicles.filter(
      (v) => v.leads === 0 && v.daysInStock > 5 && v.lotStatus === "frontline",
    )
    const noRealPhotoCars = lotVehicles.filter(
      (v) => !v.hasRealPhotos && v.lotStatus === "frontline",
    )
    const reconDelayCars = lotVehicles.filter(
      (v) => v.lotStatus === "in-recon" && v.daysInStock > 2,
    )
    const overpricedCars = lotVehicles.filter(
      (v) => v.pricingPosition === "above-market" && v.lotStatus === "frontline",
    )
    const belowMarketCars = lotVehicles.filter(
      (v) => v.pricingPosition === "below-market" && v.lotStatus === "frontline",
    )
    const atMarketCars = lotVehicles.filter(
      (v) => v.pricingPosition === "at-market" && v.lotStatus === "frontline",
    )

    const ranked = [...lotVehicles]
      .filter((v) => v.lotStatus === "frontline")
      .sort((a, b) => b.vdpViews - a.vdpViews)

    const top5Cars = ranked.slice(0, 5)
    const belowRank10Cars = ranked.slice(10)

    const issues: IssueItem[] = [
      {
        id: "no-leads",
        icon: <EyeOff className="h-4 w-4" />,
        title: "No Leads in 5+ Days",
        count: noLeadsCars.length,
        impact: `${fmt$(noLeadsCars.length * rate)}/day in holding cost with zero buyer activity`,
        suggestion: "Review pricing position and marketplace listing quality",
        severity: "high" as const,
      },
      {
        id: "no-photos",
        icon: <ImageOff className="h-4 w-4" />,
        title: "No Real Photos (Frontline)",
        count: noRealPhotoCars.length,
        impact: "Stock photos generate 60% fewer VDP views than real photography",
        suggestion: "Schedule a photo shoot — real photos can 3× lead volume",
        severity: "high" as const,
      },
      {
        id: "recon-stuck",
        icon: <Wrench className="h-4 w-4" />,
        title: "Stuck in Recon (2+ days)",
        count: reconDelayCars.length,
        impact: `${fmt$(reconDelayCars.reduce((s, v) => s + v.estimatedFrontGross, 0))} in expected gross sitting idle`,
        suggestion: "Escalate to service manager — every extra day costs margin",
        severity: "medium" as const,
      },
    ].filter((i) => i.count > 0)

    return {
      issues,
      top5Cars,
      belowRank10Cars,
      overpricedCars,
      belowMarketCars,
      atMarketCars,
    }
  }, [lotVehicles, rate])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ── Inventory Issues ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TriangleAlert className="h-4 w-4 text-spyne-warning" />
            <CardTitle>Inventory Issues</CardTitle>
          </div>
          <CardDescription>
            Cars that are costing money without generating value
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {issues.length === 0 ? (
            <div className="rounded-lg spyne-row-positive border border-spyne-border px-4 py-5 text-center text-sm text-spyne-success font-medium">
              No active issues — lot is performing well
            </div>
          ) : (
            <div className="divide-y">
              {issues.map((issue) => (
                <div key={issue.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    {/* Left accent line + icon */}
                    <div
                      className={cn(
                        "mt-0.5 rounded-md p-1.5 shrink-0",
                        issue.severity === "high"
                          ? cn("border border-spyne-border", spyneComponentClasses.rowError, "text-spyne-error")
                          : cn("border border-spyne-border", spyneComponentClasses.rowWarn, "text-spyne-text"),
                      )}
                    >
                      {issue.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title + count */}
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="text-sm font-semibold">
                          {issue.title}
                        </span>
                        <span
                          className={cn(
                            "text-xl font-bold shrink-0 leading-none",
                            issue.severity === "high"
                              ? "text-spyne-error"
                              : "text-spyne-text",
                          )}
                        >
                          {issue.count}
                        </span>
                      </div>

                      {/* Impact */}
                      <p
                        className={cn(
                          "text-xs mb-1.5",
                          issue.severity === "high"
                            ? "text-spyne-error"
                            : "text-spyne-warning",
                        )}
                      >
                        {issue.impact}
                      </p>

                      {/* Suggestion */}
                      <p className="text-xs text-muted-foreground">
                        → {issue.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Market Position Intelligence ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" />
            <CardTitle>Market Position</CardTitle>
          </div>
          <CardDescription>
            Pricing and marketplace ranking vs the competition
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-5">
          {/* Pricing distribution */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Pricing Distribution
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: "Below Market",
                  count: belowMarketCars.length,
                  color: "text-spyne-success",
                  bg: "spyne-row-positive",
                  sub: "competitive",
                },
                {
                  label: "At Market",
                  count: atMarketCars.length,
                  color: "text-foreground",
                  bg: "bg-muted/40",
                  sub: "neutral",
                },
                {
                  label: "Overpriced",
                  count: overpricedCars.length,
                  color: "text-spyne-error",
                  bg: "spyne-row-error",
                  sub: "needs action",
                },
              ].map((segment) => (
                <div
                  key={segment.label}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-center",
                    segment.bg,
                  )}
                >
                  <div
                    className={cn(
                      "text-2xl font-bold tracking-tight",
                      segment.color,
                    )}
                  >
                    {segment.count}
                  </div>
                  <div className="text-[11px] font-medium text-muted-foreground mt-0.5">
                    {segment.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground/70">
                    {segment.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Marketplace visibility */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Marketplace Visibility
            </p>
            <div className="space-y-2.5">
              {[
                {
                  icon: (
                    <ArrowUp className="h-3.5 w-3.5 text-spyne-success" />
                  ),
                  label: "Top 5 performers (by VDPs)",
                  count: `${top5Cars.length} cars`,
                  color: "text-spyne-success",
                },
                {
                  icon: (
                    <span className="h-3.5 w-3.5 rounded-full bg-spyne-warning inline-block mt-0.5" />
                  ),
                  label: "Low visibility (below rank 10)",
                  count: `${belowRank10Cars.length} cars`,
                  color: "text-spyne-text",
                },
                {
                  icon: (
                    <span className="h-3.5 w-3.5 rounded-full bg-spyne-error inline-block mt-0.5" />
                  ),
                  label: "Overpriced vs market",
                  count: `${overpricedCars.length} car${overpricedCars.length !== 1 ? "s" : ""}`,
                  color: "text-spyne-error",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    {row.icon}
                    <span className="text-muted-foreground">{row.label}</span>
                  </div>
                  <span className={cn("font-semibold text-sm", row.color)}>
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Overpriced detail */}
          {overpricedCars.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Overpriced Detail
              </p>
              <div className="space-y-1.5">
                {overpricedCars.map((v) => (
                  <div
                    key={v.vin}
                    className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-sm"
                  >
                    <div>
                      <span className="font-medium">
                        {v.year} {v.make} {v.model}
                      </span>
                      <span className="text-muted-foreground text-xs ml-2">
                        #{v.stockNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-semibold text-spyne-error">
                        {v.costToMarketPct.toFixed(1)}%
                      </span>
                      <span className="text-xs text-spyne-error">
                        +${(v.listPrice - v.marketPrice).toLocaleString()} vs
                        mkt
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
