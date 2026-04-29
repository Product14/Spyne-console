"use client"

import { useHoldingCostRateOptional } from "@/components/max-2/holding-cost-rate-context"
import { cn } from "@/lib/utils"
import { AlertTriangle, EyeOff, ImageOff, Wrench, ArrowRight } from "lucide-react"

interface ActionItem {
  id: string
  icon: React.ReactNode
  title: string
  count: number
  lossLabel: string
  lossValue: string
  action: string
  severity: "critical" | "warning"
}

export function LotActionCenter({
  onFilter,
}: {
  onFilter?: (filterId: string) => void
}) {
  const { vehicles: lotVehicles, lotSummary: s, dailyRate } = useHoldingCostRateOptional()
  const rate = dailyRate ?? 46
  const reconDelayCars = lotVehicles.filter(
    (v) => v.lotStatus === "in-recon" && v.daysInStock > 2,
  )

  const actions: ActionItem[] = [
    {
      id: "aged-45",
      icon: <AlertTriangle className="h-[15px] w-[15px]" />,
      title: "Aged 45+ Days",
      count: s.aged45Plus,
      lossLabel: "est. daily loss",
      lossValue: `$${(s.aged45Plus * rate).toLocaleString()}`,
      action: "Reprice or Liquidate",
      severity: "critical" as const,
    },
    {
      id: "no-leads",
      icon: <EyeOff className="h-[15px] w-[15px]" />,
      title: "No Leads (5+ days)",
      count: s.noLeads5Days,
      lossLabel: "holding cost/day",
      lossValue: `$${(s.noLeads5Days * rate).toLocaleString()}`,
      action: "Fix Pricing or Visibility",
      severity: "critical" as const,
    },
    {
      id: "no-photos",
      icon: <ImageOff className="h-[15px] w-[15px]" />,
      title: "No Real Photos",
      count: s.noPhotos,
      lossLabel: "missed VDP value",
      lossValue: `$${(s.noPhotos * 800).toLocaleString()}`,
      action: "Upload Photos",
      severity: "warning" as const,
    },
    ...(reconDelayCars.length > 0
      ? [
          {
            id: "recon-delay",
            icon: <Wrench className="h-[15px] w-[15px]" />,
            title: "Recon Delay",
            count: reconDelayCars.length,
            lossLabel: "gross revenue delayed",
            lossValue: `$${reconDelayCars
              .reduce((sum, v) => sum + v.estimatedFrontGross, 0)
              .toLocaleString()}`,
            action: "Expedite Recon",
            severity: "warning" as const,
          },
        ]
      : []),
  ].filter((a) => a.count > 0)

  if (actions.length === 0) return null

  return (
    <div className="rounded-[8px] border border-spyne-border bg-spyne-surface shadow-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-muted/30">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-spyne-error animate-pulse" />
          <span className="text-sm font-semibold">Action Required Today</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {actions.length} issue{actions.length !== 1 ? "s" : ""} need
          attention
        </span>
      </div>

      {/* Action columns */}
      <div
        className={cn(
          "grid divide-y sm:divide-y-0 divide-x",
          actions.length === 4
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            : actions.length === 3
            ? "grid-cols-1 sm:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2",
        )}
      >
        {actions.map((item) => (
          <button
            key={item.id}
            onClick={() => onFilter?.(item.id)}
            className={cn(
              "group text-left px-6 py-5 hover:bg-muted/30 transition-colors border-l-[3px]",
              item.severity === "critical"
                ? "border-l-spyne-error"
                : "border-l-spyne-warning",
            )}
          >
            {/* Icon + label */}
            <div className="flex items-center gap-2 mb-4">
              <span
                className={cn(
                  item.severity === "critical"
                    ? "text-spyne-error"
                    : "text-spyne-warning",
                )}
              >
                {item.icon}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {item.title}
              </span>
            </div>

            {/* Count */}
            <div className="mb-3">
              <span
                className={cn(
                  "text-4xl font-bold tracking-tight",
                  item.severity === "critical"
                    ? "text-spyne-error"
                    : "text-spyne-text",
                )}
              >
                {item.count}
              </span>
              <span className="text-base font-medium text-muted-foreground ml-1.5">
                car{item.count !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Loss */}
            <div className="mb-4">
              <span className="text-sm font-bold text-foreground">
                {item.lossValue}
              </span>
              <span className="text-xs text-muted-foreground ml-1.5">
                {item.lossLabel}
              </span>
            </div>

            {/* CTA */}
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold transition-colors",
                item.severity === "critical"
                  ? "text-spyne-error group-hover:text-spyne-error"
                  : "text-spyne-warning group-hover:text-spyne-text",
              )}
            >
              <span>{item.action}</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
