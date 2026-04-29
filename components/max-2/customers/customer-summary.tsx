"use client"

import { mockCustomerSummary } from "@/lib/max-2-mocks"
import {
  SpyneRoiKpiMetricCell,
  SpyneRoiKpiStrip,
  type SpyneRoiKpiMetricStatus,
} from "@/components/max-2/spyne-roi-kpi-strip"

const stats = [
  { key: "totalActive" as const, label: "Active Leads" },
  { key: "newThisWeek" as const, label: "New This Week" },
  { key: "appointmentsToday" as const, label: "Appointments Today" },
  { key: "followUpsDue" as const, label: "Follow-Ups Due", warn: true },
  { key: "beBackOpportunities" as const, label: "Be-Back Opportunities", warn: true },
  { key: "avgResponseTime" as const, label: "Avg Response Time" },
  { key: "conversionRate" as const, label: "Conversion Rate", pct: true },
  { key: "lostThisMonth" as const, label: "Lost This Month", danger: true },
] as const

export function CustomerSummaryCards() {
  const s = mockCustomerSummary

  return (
    <SpyneRoiKpiStrip gridClassName="sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
      {stats.map((stat) => {
        const raw = s[stat.key]
        const value = "pct" in stat && stat.pct ? `${raw}%` : String(raw)

        const isWarn = "warn" in stat && stat.warn && typeof raw === "number" && raw > 0
        const isDanger = "danger" in stat && stat.danger && typeof raw === "number" && raw > 0

        let status: SpyneRoiKpiMetricStatus = "good"
        if (isDanger) status = "bad"
        else if (isWarn) status = "watch"

        const sub =
          stat.key === "totalActive"
            ? "In pipeline"
            : stat.key === "newThisWeek"
              ? "Last 7 days"
              : stat.key === "appointmentsToday"
                ? "Scheduled today"
                : stat.key === "followUpsDue"
                  ? "Action needed"
                  : stat.key === "beBackOpportunities"
                    ? "Re-engage list"
                    : stat.key === "avgResponseTime"
                      ? "To first touch"
                      : stat.key === "conversionRate"
                        ? "Lead to sale"
                        : "Closed lost"

        return (
          <SpyneRoiKpiMetricCell
            key={stat.key}
            label={stat.label}
            value={value}
            sub={sub}
            status={status}
            valueClassName={isDanger ? "text-spyne-error" : undefined}
          />
        )
      })}
    </SpyneRoiKpiStrip>
  )
}
