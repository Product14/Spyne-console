"use client"

import { mockMarketingChannels } from "@/lib/max-2-mocks"
import {
  SpyneRoiKpiMetricCell,
  SpyneRoiKpiStrip,
} from "@/components/max-2/spyne-roi-kpi-strip"
function cpsStatus(cps: number): "good" | "watch" | "bad" {
  if (cps === 0) return "good"
  if (cps > 400) return "bad"
  if (cps > 250) return "watch"
  return "good"
}

export function MarketingChannelKpiStrip() {
  const totals = mockMarketingChannels.reduce(
    (acc, ch) => ({
      spend: acc.spend + ch.spend,
      leads: acc.leads + ch.leads,
      appointments: acc.appointments + ch.appointments,
      unitsSold: acc.unitsSold + ch.unitsSold,
    }),
    { spend: 0, leads: 0, appointments: 0, unitsSold: 0 },
  )
  const totalCPS = totals.unitsSold > 0 ? Math.round(totals.spend / totals.unitsSold) : 0
  const totalCPL = totals.leads > 0 ? +(totals.spend / totals.leads).toFixed(1) : 0
  const cpsSt = cpsStatus(totalCPS)

  return (
    <SpyneRoiKpiStrip gridClassName="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <SpyneRoiKpiMetricCell
        label="Total Spend"
        value={`$${totals.spend.toLocaleString()}`}
        sub="All channels, MTD"
        status="neutral"
      />
      <SpyneRoiKpiMetricCell
        label="Leads"
        value={String(totals.leads)}
        sub="Inbound + paid"
        status="good"
      />
      <SpyneRoiKpiMetricCell
        label="Appointments"
        value={String(totals.appointments)}
        sub="From marketing"
        status="good"
      />
      <SpyneRoiKpiMetricCell
        label="Units Sold"
        value={String(totals.unitsSold)}
        sub="Attributed"
        status={totals.unitsSold > 0 ? "good" : "watch"}
      />
      <SpyneRoiKpiMetricCell
        label="Blended CPS"
        value={totals.unitsSold > 0 ? `$${totalCPS}` : "—"}
        sub="Cost per sold unit"
        status={cpsSt}
        valueClassName={cpsSt === "bad" ? "text-spyne-error" : undefined}
      />
      <SpyneRoiKpiMetricCell
        label="Blended CPL"
        value={totals.leads > 0 ? `$${totalCPL}` : "—"}
        sub="Cost per lead"
        status="neutral"
      />
    </SpyneRoiKpiStrip>
  )
}
