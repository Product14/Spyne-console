"use client"

import { useHoldingCostRateOptional } from "@/components/max-2/holding-cost-rate-context"
import { cn } from "@/lib/utils"

type Status = "good" | "watch" | "bad"

interface KPIItem {
  label: string
  value: string
  status: Status
  statusLabel: string
  insight: string
}

const dotColor: Record<Status, string> = {
  good: "bg-spyne-success",
  watch: "bg-spyne-warning",
  bad: "bg-spyne-error",
}

const valueColor: Record<Status, string> = {
  good: "text-foreground",
  watch: "text-spyne-text",
  bad: "text-spyne-error",
}

const fmt$ = (n: number) => `$${n.toLocaleString()}`

export function LotKPICards() {
  const { vehicles: lotVehicles, lotSummary: s } = useHoldingCostRateOptional()
  const reconDelayed = lotVehicles.filter(
    (v) => v.lotStatus === "in-recon" && v.daysInStock > 2,
  )
  const aged45 = lotVehicles.filter(
    (v) => v.daysInStock >= 45 && v.lotStatus !== "sold-pending",
  ).length
  const frontlinePct = s.totalUnits > 0 ? s.frontlineReady / s.totalUnits : 0

  const items: KPIItem[] = [
    {
      label: "Total Units",
      value: String(s.totalUnits),
      status: "good",
      statusLabel: "Active",
      insight: `${s.frontlineReady} frontline · ${s.inRecon} recon · ${s.arriving} arriving`,
    },
    {
      label: "Frontline Ready",
      value: String(s.frontlineReady),
      status: frontlinePct >= 0.55 ? "good" : frontlinePct >= 0.4 ? "watch" : "bad",
      statusLabel:
        frontlinePct >= 0.55 ? "Strong" : frontlinePct >= 0.4 ? "Moderate" : "Low",
      insight: `${(frontlinePct * 100).toFixed(0)}% of lot · ${frontlinePct < 0.5 ? "restock soon" : "good coverage"}`,
    },
    {
      label: "In Recon",
      value: String(s.inRecon),
      status: reconDelayed.length === 0 ? "good" : reconDelayed.length === 1 ? "watch" : "bad",
      statusLabel:
        reconDelayed.length === 0 ? "On Track" : `${reconDelayed.length} Delayed`,
      insight: reconDelayed.length > 0 ? "Past 2-day target - expedite" : "Within 2-day target",
    },
    {
      label: "Arriving",
      value: String(s.arriving),
      status: "good",
      statusLabel: "In Transit",
      insight: "Prep recon bays to hit 3-day target",
    },
    {
      label: "Avg Days in Stock",
      value: `${s.avgDaysInStock.toFixed(1)}d`,
      status: s.avgDaysInStock < 20 ? "good" : s.avgDaysInStock < 30 ? "watch" : "bad",
      statusLabel: s.avgDaysInStock < 20 ? "Healthy" : s.avgDaysInStock < 30 ? "Elevated" : "High",
      insight: aged45 > 0 ? `${aged45} cars 45+ days hurting avg` : "All in healthy range",
    },
    {
      label: "Avg C2M%",
      value: `${s.avgCostToMarket.toFixed(1)}%`,
      status: s.avgCostToMarket <= 98 ? "good" : s.avgCostToMarket <= 102 ? "watch" : "bad",
      statusLabel:
        s.avgCostToMarket <= 98 ? "Competitive" : s.avgCostToMarket <= 102 ? "At Market" : "Overpriced",
      insight:
        s.avgCostToMarket <= 98
          ? "Below market - strong position"
          : "1 car above market pulling avg up",
    },
    {
      label: "Daily Hold Cost",
      value: fmt$(s.totalHoldingCostToday),
      status: "watch",
      statusLabel: "Ongoing",
      insight: `${fmt$(s.totalHoldingCostToday * 30)}/mo if no units sell`,
    },
  ]

  return (
    <div className="rounded-xl border border-spyne-border bg-spyne-surface shadow-none overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 divide-x divide-y lg:divide-y-0">
        {items.map((item) => (
          <KPICell key={item.label} item={item} />
        ))}
      </div>
    </div>
  )
}

function KPICell({ item }: { item: KPIItem }) {
  return (
    <div className="px-5 py-4">
      {/* Status dot + label */}
      <div className="flex items-center gap-2 mb-2.5">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            dotColor[item.status],
          )}
        />
        <span className="text-xs font-medium text-muted-foreground">
          {item.label}
        </span>
      </div>

      {/* Value */}
      <div
        className={cn(
          "text-2xl font-bold tracking-tight mb-1",
          valueColor[item.status],
        )}
      >
        {item.value}
      </div>

      {/* Status badge */}
      <div
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold mb-2",
          item.status === "good"
            ? "spyne-row-positive text-spyne-success"
            : item.status === "watch"
            ? "spyne-row-warn text-spyne-text"
            : "spyne-row-error text-spyne-error",
        )}
      >
        {item.statusLabel}
      </div>

      {/* Insight */}
      <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
        {item.insight}
      </p>
    </div>
  )
}
