"use client"

import { mockServiceSummary } from "@/lib/max-2-mocks"
import {
  SpyneRoiKpiMetricCell,
  SpyneRoiKpiStrip,
  type SpyneRoiKpiMetricStatus,
} from "@/components/max-2/spyne-roi-kpi-strip"

export function ServiceSummary() {
  const d = mockServiceSummary

  const rows: {
    label: string
    value: string
    sub: string
    status: SpyneRoiKpiMetricStatus
    valueClassName?: string
  }[] = [
    {
      label: "Open ROs",
      value: String(d.openROs),
      sub: `${d.completedToday} completed today`,
      status: "neutral",
    },
    {
      label: "Revenue Today",
      value: `$${d.revenueToday.toLocaleString()}`,
      sub: "Service drive",
      status: "good",
    },
    {
      label: "Avg RO Value",
      value: `$${d.avgROValue.toLocaleString()}`,
      sub: "Per repair order",
      status: "good",
    },
    {
      label: "CSI Score",
      value: `${d.csiScore} / 5.0`,
      sub: d.csiScore >= d.csiTarget ? `At or above ${d.csiTarget} target` : `Below ${d.csiTarget} target`,
      status: d.csiScore >= d.csiTarget ? "good" : "watch",
    },
    {
      label: "Tech Efficiency",
      value: `${d.techEfficiency}%`,
      sub: "Billed vs available hours",
      status: "good",
    },
    {
      label: "Bays Active",
      value: `${d.baysOccupied} / ${d.totalBays}`,
      sub: `${d.waitersInProgress} waiters in progress`,
      status: "neutral",
    },
    {
      label: "Appointments Today",
      value: String(d.appointmentsToday),
      sub: "Scheduled",
      status: "good",
    },
    {
      label: "Overdue Actions",
      value: String(d.overdueActions),
      sub: d.overdueActions > 0 ? "Needs follow-up" : "None overdue",
      status: d.overdueActions > 0 ? "watch" : "good",
      valueClassName: d.overdueActions > 0 ? "text-spyne-error" : undefined,
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
