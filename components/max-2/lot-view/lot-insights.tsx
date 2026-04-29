"use client"

import * as React from "react"
import { useHoldingCostRateOptional } from "@/components/max-2/holding-cost-rate-context"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { SpyneChip } from "@/components/max-2/spyne-chip"
import { TrendingDown, TrendingUp, Minus } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
} from "recharts"

// ── Mock weekly stock levels (6 data points: 5w ago → today) ────────────
const STOCK_HISTORY = [
  { label: "5w ago", count: 21 },
  { label: "4w ago", count: 20 },
  { label: "3w ago", count: 18 },
  { label: "2w ago", count: 17 },
  { label: "Last wk", count: 15 },
  { label: "Today",   count: 15 },
]

// Week-over-week deltas (units sold/added each period)
const DELTAS = STOCK_HISTORY.slice(1).map((w, i) => w.count - STOCK_HISTORY[i].count)
// → [−1, −2, −1, −2, 0]

// ── Trend math ────────────────────────────────────────────────────────────
const current       = STOCK_HISTORY[STOCK_HISTORY.length - 1].count
const oldest        = STOCK_HISTORY[0].count
const weekDelta     = DELTAS[DELTAS.length - 1]            // 0 this week
const totalSold     = Math.abs(Math.min(0, oldest - current))
// avg velocity excludes "this week" since it may be partial
const soldDeltas    = DELTAS.slice(0, -1).filter((d) => d < 0)
const avgVelocity   = soldDeltas.length > 0
  ? Math.abs(soldDeltas.reduce((a, d) => a + d, 0)) / soldDeltas.length
  : 0
const weeksToDeplete = avgVelocity > 0 ? current / avgVelocity : null


export function LotInsights() {
  const { vehicles: lotVehicles, lotSummary: s } = useHoldingCostRateOptional()

  const {
    agedCars,
    freshCars,
    premiumCars,
    noLeadsCars,
    freshAvgDays,
    premiumAvgDays,
  } = React.useMemo(() => {
    const frontline = lotVehicles.filter((v) => v.lotStatus === "frontline")
    const agedCars = lotVehicles.filter((v) => v.daysInStock >= 45 && v.lotStatus === "frontline")
    const freshCars = frontline.filter((v) => v.daysInStock <= 15)
    const premiumCars = frontline.filter((v) => v.listPrice >= 40000)
    const noLeadsCars = frontline.filter((v) => v.leads === 0 && v.daysInStock > 5)
    const freshAvgDays =
      freshCars.length > 0
        ? freshCars.reduce((a, v) => a + v.daysInStock, 0) / freshCars.length
        : 0
    const premiumAvgDays =
      premiumCars.length > 0
        ? premiumCars.reduce((a, v) => a + v.daysInStock, 0) / premiumCars.length
        : 0
    return {
      agedCars,
      freshCars,
      premiumCars,
      noLeadsCars,
      freshAvgDays,
      premiumAvgDays,
    }
  }, [lotVehicles])

  const insights: { dot: string; text: string }[] = [
    {
      dot: "bg-spyne-success",
      text: `${freshCars.length} fresh cars (0–15d) averaging ${freshAvgDays.toFixed(0)} days - pipeline is healthy`,
    },
    agedCars.length > 0
      ? {
          dot: "bg-spyne-error",
          text: `${agedCars.length} car${agedCars.length !== 1 ? "s" : ""} past 45 days with no buyer activity - gross is eroding daily`,
        }
      : {
          dot: "bg-spyne-success",
          text: "No cars past 45 days - strong turnover, lot is healthy",
        },
    premiumCars.length > 0 && {
      dot: "bg-primary/50",
      text: `Premium inventory ($40K+) at ${premiumAvgDays.toFixed(0)}d avg - ${premiumAvgDays < 20 ? "great velocity, consider buying more" : "add digital advertising to move faster"}`,
    },
    noLeadsCars.length > 0 && {
      dot: "bg-spyne-warning",
      text: `${noLeadsCars.length} frontline car${noLeadsCars.length !== 1 ? "s" : ""} with no leads - check listing quality, photos, and pricing vs market`,
    },
    {
      dot: "bg-spyne-success",
      text: `Avg C2M is ${s.avgCostToMarket.toFixed(1)}% - competitive overall, but 1 car above market suppressing lead volume`,
    },
  ]
    .filter(Boolean)
    .slice(0, 5) as { dot: string; text: string }[]

  // Velocity context
  const thisWeekSlow = weekDelta === 0 && avgVelocity > 0
  const overallTrend = oldest - current // positive = sold down
  const TrendIcon = overallTrend > 0 ? TrendingDown : overallTrend < 0 ? TrendingUp : Minus
  const trendLabel =
    overallTrend > 0 ? "Selling Down" : overallTrend < 0 ? "Stocking Up" : "Stable"
  const trendColor =
    overallTrend > 0 ? "text-spyne-success" : overallTrend < 0 ? "text-spyne-text" : "text-muted-foreground"

  return (
    <Card className="shadow-none gap-0">
      <CardHeader className="pb-4">
        <CardTitle>Insights</CardTitle>
        <CardDescription>
          Stock trend and inventory intelligence
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-1 space-y-5">

        {/* ── Stock Trend ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Stock Trend
            </p>
            <div className={cn("flex items-center gap-1 text-xs font-semibold", trendColor)}>
              <TrendIcon className="h-3.5 w-3.5" />
              {trendLabel}
            </div>
          </div>

          {/* Interactive area chart */}
          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={STOCK_HISTORY}
                margin={{ top: 6, right: 4, bottom: 0, left: -22 }}
              >
                <defs>
                  <linearGradient id="stockFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="var(--spyne-primary)" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="var(--spyne-primary)" stopOpacity={0}    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={["dataMin - 2", "dataMax + 1"]}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload as (typeof STOCK_HISTORY)[0]
                    const idx = STOCK_HISTORY.findIndex((w) => w.label === d.label)
                    const delta = idx > 0 ? d.count - STOCK_HISTORY[idx - 1].count : null
                    return (
                      <div className="rounded-xl border border-spyne-border bg-spyne-surface px-3 py-2 text-xs space-y-0.5">
                        <p className="font-semibold text-foreground">{d.label}</p>
                        <p className="text-muted-foreground">
                          <span className="font-bold text-foreground tabular-nums">{d.count}</span> units in stock
                        </p>
                        {delta !== null && delta !== 0 && (
                          <p className={cn("font-semibold", delta < 0 ? "text-spyne-success" : "text-spyne-text")}>
                            {delta < 0 ? `${Math.abs(delta)} sold` : `+${delta} added`}
                          </p>
                        )}
                        {delta === 0 && <p className="text-muted-foreground">No change</p>}
                      </div>
                    )
                  }}
                  cursor={{ stroke: "var(--spyne-primary)", strokeWidth: 1, strokeDasharray: "4 2" }}
                />

                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--spyne-primary)"
                  strokeWidth={2.5}
                  fill="url(#stockFill)"
                  dot={(props) => {
                    const isLast = props.index === STOCK_HISTORY.length - 1
                    return (
                      <Dot
                        key={props.index}
                        {...props}
                        r={isLast ? 5 : 3}
                        fill={isLast ? "var(--spyne-primary)" : "#fff"}
                        stroke="var(--spyne-primary)"
                        strokeWidth={2}
                      />
                    )
                  }}
                  activeDot={{ r: 5, fill: "var(--spyne-primary)", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 3 velocity stats */}
          <div className="grid grid-cols-3 gap-2">
            <StatChip
              label="Avg velocity"
              value={`${avgVelocity.toFixed(1)}/wk`}
              sub="units sold"
              status={avgVelocity >= 2 ? "good" : avgVelocity >= 1 ? "ok" : "slow"}
            />
            <StatChip
              label="This week"
              value={weekDelta === 0 ? "0 sold" : `${Math.abs(weekDelta)} sold`}
              sub={thisWeekSlow ? "below avg" : "on track"}
              status={thisWeekSlow ? "slow" : "ok"}
            />
            <StatChip
              label="Time to clear"
              value={weeksToDeplete ? `~${Math.ceil(weeksToDeplete)}w` : "—"}
              sub={`at ${avgVelocity.toFixed(1)}/wk`}
              status={weeksToDeplete && weeksToDeplete > 16 ? "slow" : "ok"}
            />
          </div>

          {/* Net summary */}
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn(
              "font-semibold",
              overallTrend > 0 ? "text-spyne-success" : overallTrend < 0 ? "text-spyne-text" : "",
            )}>
              {overallTrend > 0 ? `↓ ${overallTrend} units sold` : overallTrend < 0 ? `↑ ${Math.abs(overallTrend)} units added` : "→ No net change"}
            </span>
            <span>over 5 weeks</span>
            {thisWeekSlow && (
              <SpyneChip variant="soft" tone="warning" compact className="ml-auto">
                Slow this week
              </SpyneChip>
            )}
          </div>
        </div>

        <div className="border-t" />

        {/* ── Key Observations ── */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Key Observations
          </p>
          <div className="space-y-3">
            {insights.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0 mt-[5px]", item.dot)} />
                <p className="text-sm text-muted-foreground leading-snug">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  )
}

function StatChip({
  label, value, sub, status,
}: {
  label: string
  value: string
  sub: string
  status: "good" | "ok" | "slow"
}) {
  const cfg = {
    good: { bg: "spyne-row-positive", border: "border-spyne-border", val: "text-spyne-success" },
    ok:   { bg: "bg-muted/40",   border: "border-border",      val: "text-foreground"  },
    slow: { bg: "spyne-row-warn",   border: "border-spyne-border",   val: "text-spyne-text"   },
  }[status]

  return (
    <div className={cn("rounded-lg border px-2.5 py-2 text-center", cfg.bg, cfg.border)}>
      <p className={cn("text-sm font-bold tabular-nums", cfg.val)}>{value}</p>
      <p className="text-[10px] text-muted-foreground font-medium leading-none mt-0.5">{label}</p>
      <p className="text-[10px] text-muted-foreground/60 leading-none mt-0.5">{sub}</p>
    </div>
  )
}
