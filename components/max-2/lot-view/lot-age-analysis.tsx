"use client"

import { useRouter } from "next/navigation"
import { useHoldingCostRateOptional } from "@/components/max-2/holding-cost-rate-context"
import type { LotVehicle } from "@/services/max-2/max-2.types"
import { max2Classes, spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

/**
 * Shared row layout for inventory analysis tabs.
 * Note: avoid minmax() with commas inside Tailwind arbitrary grid-cols — it breaks parsing and collapses the grid to one column.
 */
export const LOT_ANALYSIS_ROW_GRID =
  "grid w-full grid-cols-[128px_1fr_72px_100px_120px_80px_76px] gap-4 items-center"

/** Primary line for the "% of gross" column (matches other tabular metric cells). */
export function formatHoldingVsGrossPctValue(
  accumulated: number,
  grossMargin: number,
): string {
  if (grossMargin <= 0) return "—"
  const p = (accumulated / grossMargin) * 100
  return `${p.toFixed(1)}%`
}

const BUCKETS = [
  {
    label: "0–15 days",
    min: 0, max: 15,
    phase: "Fresh",
    dot: "bg-spyne-success",
    barColor: "bg-spyne-success",
    urgency: 0,
    inventoryQuery: "ageMin=0&ageMax=15",
  },
  {
    label: "16–30 days",
    min: 16, max: 30,
    phase: "Monitor",
    dot: "bg-spyne-info",
    barColor: "bg-spyne-info",
    urgency: 1,
    inventoryQuery: "ageMin=16&ageMax=30",
  },
  {
    label: "31–45 days",
    min: 31, max: 45,
    phase: "Reprice",
    dot: "bg-spyne-warning",
    barColor: "bg-spyne-warning",
    urgency: 2,
    inventoryQuery: "focus=reprice",
  },
  {
    label: "46–60 days",
    min: 46, max: 60,
    phase: "Liquidate",
    dot: "bg-spyne-error",
    barColor: "bg-spyne-error",
    urgency: 3,
    inventoryQuery: "focus=liquidate",
  },
  {
    label: "60+ days",
    min: 61, max: Infinity,
    phase: "Exit Now",
    dot: "bg-spyne-error",
    barColor: "bg-spyne-error",
    urgency: 4,
    inventoryQuery: "focus=exit-now",
  },
]

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  good:  { label: "Healthy",  cls: "spyne-row-positive text-spyne-success" },
  watch: { label: "Monitor",  cls: "spyne-row-warn text-spyne-text"     },
  risk:  { label: "At Risk",  cls: "border border-spyne-border bg-spyne-surface text-spyne-error" },
}

export function LotAgeDistributionPanel({
  className,
  vehicles: vehiclesProp,
  noBorder = false,
}: {
  className?: string
  noBorder?: boolean
  /** When set, uses this list (caller should already exclude non-lot units if desired). */
  vehicles?: LotVehicle[]
}) {
  const router = useRouter()
  const { vehicles: lotVehicles } = useHoldingCostRateOptional()

  const active =
    vehiclesProp ??
    lotVehicles.filter(
      (v) => v.lotStatus !== "arriving" && v.lotStatus !== "in-recon",
    )
  const total = active.length

  const rows = BUCKETS.map((b) => {
    const vehicles = active.filter(
      (v) => v.daysInStock >= b.min && v.daysInStock <= b.max,
    )
    const grossMargin = vehicles.reduce((s, v) => s + v.estimatedFrontGross, 0)
    const avgDays =
      vehicles.length > 0
        ? vehicles.reduce((s, v) => s + v.daysInStock, 0) / vehicles.length
        : 0
    const agedCount = vehicles.filter((v) => v.daysInStock >= 45).length
    const status =
      agedCount > 0 ? "risk" : avgDays > 28 ? "watch" : "good"
    return {
      ...b,
      vehicles,
      count: vehicles.length,
      pct: total > 0 ? (vehicles.length / total) * 100 : 0,
      accumulated: vehicles.reduce((s, v) => s + v.totalHoldingCost, 0),
      grossMargin,
      status,
    }
  })

  const maxAccumulated = Math.max(...rows.map((r) => r.accumulated), 1)

  const headers = [
    "Phase / age",
    "Distribution",
    "Cars",
    "Gross Margin",
    "Holding Cost",
    "% of gross",
    "Status",
  ]

  return (
    <div className={cn(!noBorder && "pt-1 pb-5", className)}>
      <div className={cn("overflow-x-auto", !noBorder && "overflow-hidden rounded-xl border border-spyne-border bg-spyne-surface")}>
        <table className="w-full min-w-[760px] table-fixed text-sm">
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[24%]" />
            <col className="w-[9%]" />
            <col className="w-[14%]" />
            <col className="w-[13%]" />
            <col className="w-[13%]" />
            <col className="w-[9%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-t border-spyne-border text-left bg-muted">
              {headers.map((h, i) => (
                <th
                  key={`${h}-${i}`}
                  className={cn(
                    "py-3 px-4 text-xs font-medium uppercase tracking-wider text-spyne-text whitespace-nowrap",
                    i === 2 && "text-right",
                    i === 3 && "text-right",
                    i === 4 && "text-right",
                    i === 5 && "text-right",
                    i === 6 && "text-center",
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
          {rows.map((row) => {
            const status = STATUS_CFG[row.status]
            return (
            <tr
              key={row.label}
              onClick={
                row.count > 0
                  ? () => router.push(`/max-2/studio/inventory?${row.inventoryQuery}`)
                  : undefined
              }
              className={cn(
                "border-b last:border-0 border-spyne-border transition-colors",
                row.count === 0 ? "opacity-40" : "cursor-pointer hover:bg-muted/40",
              )}
            >
              {/* Phase / Age */}
              <td className="py-3.5 px-4 align-middle">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", row.dot)} />
                  <div>
                    <p className="text-sm font-semibold leading-tight">{row.phase}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{row.label}</p>
                  </div>
                </div>
              </td>

              {/* Distribution bar */}
              <td className="py-3.5 px-4 align-middle">
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-spyne-border">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", row.barColor)}
                      style={{ width: `${(row.accumulated / maxAccumulated) * 100}%`, minWidth: row.accumulated > 0 ? "4px" : "0" }}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">by holding cost</p>
              </td>

              {/* Cars */}
              <td className="py-3.5 px-4 align-middle text-right">
                <p className={cn("text-sm font-bold tabular-nums", row.urgency >= 2 && row.count > 0 ? "text-spyne-error" : "text-foreground")}>{row.count}</p>
                <p className="text-[10px] text-muted-foreground tabular-nums">{row.pct.toFixed(0)}%</p>
              </td>

              {/* Gross Margin */}
              <td className="py-3.5 px-4 align-middle text-right">
                <p className="text-sm font-semibold tabular-nums">{row.count > 0 ? `$${row.grossMargin.toLocaleString()}` : "—"}</p>
                <p className="text-[10px] text-muted-foreground">est. gross</p>
              </td>

              {/* Holding Cost */}
              <td className="py-3.5 px-4 align-middle text-right">
                <p className={cn("text-sm font-semibold tabular-nums", row.urgency >= 2 && row.count > 0 ? "text-spyne-error" : "text-foreground")}>
                  {row.count > 0 ? `$${row.accumulated.toLocaleString()}` : "—"}
                </p>
              </td>

              {/* % of Gross */}
              <td className="py-3.5 px-4 align-middle text-right">
                <p className={cn("text-sm font-semibold tabular-nums", row.urgency >= 2 && row.count > 0 ? "text-spyne-error" : "text-foreground")}>
                  {row.count > 0 ? formatHoldingVsGrossPctValue(row.accumulated, row.grossMargin) : "—"}
                </p>
                <p className="text-[10px] text-muted-foreground">of gross margin</p>
              </td>

              {/* Status */}
              <td className="py-3.5 px-4 align-middle text-center">
                <div className="flex items-center justify-center gap-1.5">
                {row.count > 0 ? (
                  <>
                    <span className={cn("inline-flex justify-center rounded-full px-2.5 py-1 text-xs font-medium", status.cls)}>
                      {status.label}
                    </span>
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground"
                      aria-hidden
                    />
                  </>
                ) : (
                  <span className="h-4 w-4" />
                )}
              </div>
              </td>
            </tr>
            )
          })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function LotAgeAnalysis() {
  return (
    <div className={max2Classes.overviewPanelShell}>
      <div className={max2Classes.overviewPanelHeader}>
        <p className={spyneComponentClasses.cardTitle}>Age Distribution &amp; Holding Cost</p>
        <p className={max2Classes.overviewPanelDescription}>
          Each bucket shows vehicle count and total holding cost accrued
        </p>
      </div>

      <div>
        <LotAgeDistributionPanel noBorder />
      </div>
    </div>
  )
}
