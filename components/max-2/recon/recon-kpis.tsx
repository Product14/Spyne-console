"use client"

import {
  SpyneRoiKpiMetricCell,
  SpyneRoiKpiStrip,
  type SpyneRoiKpiMetricStatus,
} from "@/components/max-2/spyne-roi-kpi-strip"

interface KPIItem {
  label: string
  value: string
  sub: string
  status: SpyneRoiKpiMetricStatus
}

const kpis: KPIItem[] = [
  {
    label: "Avg Days to Frontline",
    value: "2.8d",
    sub: "Target ≤ 3d",
    status: "good",
  },
  {
    label: "SLA Compliance",
    value: "80%",
    sub: "Target 100%",
    status: "bad",
  },
  {
    label: "Avg Recon Cost",
    value: "$1,180",
    sub: "Target $1K – $1.4K",
    status: "good",
  },
  {
    label: "Door Rate Compliance",
    value: "88%",
    sub: "Target 100%",
    status: "watch",
  },
]

export function ReconKPIs() {
  return (
    <SpyneRoiKpiStrip gridClassName="sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <SpyneRoiKpiMetricCell
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          sub={kpi.sub}
          status={kpi.status}
        />
      ))}
    </SpyneRoiKpiStrip>
  )
}
