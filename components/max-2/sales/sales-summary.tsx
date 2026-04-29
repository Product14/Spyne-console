"use client"

import { mockSalesSummary } from "@/lib/max-2-mocks"
import {
  SpyneRoiKpiMetricCell,
  SpyneRoiKpiStrip,
  type SpyneRoiKpiMetricStatus,
} from "@/components/max-2/spyne-roi-kpi-strip"

export function SalesSummary() {
  const d = mockSalesSummary

  const onPace = d.unitsSoldMTD >= d.unitsTarget * 0.75
  const rows: {
    label: string
    value: string
    sub: string
    status: SpyneRoiKpiMetricStatus
    valueClassName?: string
  }[] = [
    {
      label: "Units Sold MTD",
      value: `${d.unitsSoldMTD} / ${d.unitsTarget}`,
      sub: onPace ? "On pace vs target" : "Behind target",
      status: onPace ? "good" : "watch",
    },
    {
      label: "Total Gross MTD",
      value: `$${(d.totalGrossMTD / 1000).toFixed(0)}k`,
      sub: "Front + back",
      status: "good",
    },
    {
      label: "Close Rate",
      value: `${d.closeRate}%`,
      sub: "Show to sale",
      status: "good",
    },
    {
      label: "Appts Today",
      value: String(d.appointmentsToday),
      sub: "Scheduled",
      status: "good",
    },
    {
      label: "Test Drives",
      value: String(d.testDrivesToday),
      sub: "Today",
      status: "neutral",
    },
    {
      label: "Pending Deals",
      value: String(d.pendingDeals),
      sub: "Open opportunities",
      status: d.pendingDeals > 3 ? "watch" : "good",
    },
    {
      label: "Deals in F&I",
      value: String(d.dealsInFI),
      sub: "In finance",
      status: "good",
    },
    {
      label: "Avg Days to Close",
      value: String(d.avgDaysToClose),
      sub: "Rolling",
      status: "neutral",
    },
  ]

  return (
    <SpyneRoiKpiStrip gridClassName="sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
      {rows.map((r) => (
        <SpyneRoiKpiMetricCell
          key={r.label}
          label={r.label}
          value={r.value}
          sub={r.sub}
          status={r.status}
          valueClassName={r.valueClassName}
        />
      ))}
    </SpyneRoiKpiStrip>
  )
}
