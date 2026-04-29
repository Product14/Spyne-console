"use client"

import { mockCoreMetrics } from "@/lib/max-2-mocks"
import type { MetricStatus } from "@/services/max-2/max-2.types"
import {
  SpyneRoiKpiMetricCell,
  SpyneRoiKpiStrip,
  type SpyneRoiKpiMetricStatus,
} from "@/components/max-2/spyne-roi-kpi-strip"

const statusToStrip: Record<MetricStatus, SpyneRoiKpiMetricStatus> = {
  above: "good",
  at: "watch",
  below: "bad",
}

function formatValue(value: number, unit: string): string {
  if (unit === "$/day") return `$${value.toFixed(2)}`
  if (unit === "$") return `$${value.toLocaleString()}`
  if (unit === "%") return `${value}%`
  if (unit === "x") return `${value}×`
  if (unit === "days") return `${value}d`
  return value.toLocaleString()
}

function formatTarget(target: number, unit: string): string {
  if (unit === "$/day") return `$${target}`
  if (unit === "$") return `$${target.toLocaleString()}`
  if (unit === "%") return `${target}%`
  if (unit === "x") return `${target}×`
  if (unit === "days") return `${target}d`
  return target.toLocaleString()
}

/** Week-over-week style delta from last two points in the trend series. */
function trendDelta(trend: number[]): {
  pctText: string
  direction: "up" | "down" | "flat"
} {
  if (trend.length < 2) return { pctText: "—", direction: "flat" }
  const a = trend[trend.length - 2]
  const b = trend[trend.length - 1]
  if (a === 0 && b === 0) return { pctText: "0.00%", direction: "flat" }
  if (a === 0) return { pctText: "—", direction: "flat" }
  const rawPct = ((b - a) / Math.abs(a)) * 100
  const direction =
    rawPct > 0.0001 ? "up" : rawPct < -0.0001 ? "down" : "flat"
  const sign = rawPct >= 0 ? "+" : ""
  const pctText = `${sign}${rawPct.toFixed(2)}%`
  return { pctText, direction }
}

export function CoreMetrics() {
  return (
    <SpyneRoiKpiStrip
      variant="cards"
      gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    >
      {mockCoreMetrics.map((m) => {
        const { pctText, direction } = trendDelta(m.trend)
        return (
          <SpyneRoiKpiMetricCell
            key={m.id}
            layout="card"
            label={m.name}
            value={formatValue(m.value, m.unit)}
            sub={null}
            status={statusToStrip[m.status]}
            cardChartSeries={m.trend}
            cardSubHighlight={pctText}
            cardSubMuted={
              <>
                <span>From the last week</span>
                <span className="text-muted-foreground/90">
                  {" "}
                  · Target: {formatTarget(m.target, m.unit)}
                </span>
              </>
            }
            cardTrendDirection={direction}
          />
        )
      })}
    </SpyneRoiKpiStrip>
  )
}
