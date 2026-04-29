"use client"

import { mockDemandSignals } from "@/lib/max-2-mocks"
import {
  SpyneRoiKpiMetricCell,
  SpyneRoiKpiStrip,
} from "@/components/max-2/spyne-roi-kpi-strip"

export function SourcingDemandKpiStrip() {
  const totalRequests = mockDemandSignals.reduce((a, s) => a + s.requestCount, 0)
  const highUrgency = mockDemandSignals.filter((s) => s.urgency === "high").length
  const notInStock = mockDemandSignals.filter((s) => !s.inStock).length
  const inStock = mockDemandSignals.filter((s) => s.inStock).length
  const avgBudget = Math.round(
    mockDemandSignals.reduce((a, s) => a + s.avgBudget * s.requestCount, 0) /
      Math.max(totalRequests, 1),
  )

  return (
    <SpyneRoiKpiStrip gridClassName="sm:grid-cols-2 lg:grid-cols-4">
      <SpyneRoiKpiMetricCell
        label="Demand Requests"
        value={String(totalRequests)}
        sub="Weighted asks across signals"
        status="neutral"
      />
      <SpyneRoiKpiMetricCell
        label="High Urgency"
        value={String(highUrgency)}
        sub="SKUs in top urgency tier"
        status={highUrgency > 4 ? "watch" : "good"}
      />
      <SpyneRoiKpiMetricCell
        label="Not in Stock"
        value={String(notInStock)}
        sub={`${inStock} matched to inventory`}
        status={notInStock > 5 ? "bad" : "watch"}
        valueClassName={notInStock > 5 ? "text-spyne-error" : undefined}
      />
      <SpyneRoiKpiMetricCell
        label="Avg Budget"
        value={`$${avgBudget.toLocaleString()}`}
        sub="Across demand signals"
        status="good"
      />
    </SpyneRoiKpiStrip>
  )
}
