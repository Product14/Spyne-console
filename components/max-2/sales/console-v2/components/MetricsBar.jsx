"use client"

import {
  SpyneRoiKpiMetricCell,
  SpyneRoiKpiStrip,
} from "@/components/max-2/spyne-roi-kpi-strip"

function metricSub(m) {
  if (m.sub != null && m.sub !== "") return m.sub
  if (m.delta) {
    return `${m.delta} vs last period`
  }
  return m.note ?? ""
}

export default function MetricsBar({ metrics }) {
  const colClass = `lg:grid-cols-${metrics.length}`
  return (
    <SpyneRoiKpiStrip gridClassName={colClass}>
      {metrics.map((m, i) => (
        <SpyneRoiKpiMetricCell
          key={i}
          label={m.label}
          value={m.value}
          sub={metricSub(m)}
          status={m.highlight ? "watch" : "good"}
          valueClassName={m.highlight ? "text-spyne-error" : undefined}
          cellClassName="px-3 py-3"
        />
      ))}
    </SpyneRoiKpiStrip>
  )
}
