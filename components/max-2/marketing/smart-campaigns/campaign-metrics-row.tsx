"use client"

import * as React from "react"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { cn } from "@/lib/utils"
import type { Campaign } from "@/services/max-2/smart-campaigns.types"

interface CampaignMetricsRowProps {
  campaigns: Campaign[]
  /** Called when the View action on the Campaigns-created tile is clicked. */
  onViewCampaigns?: () => void
}

/**
 * Top-of-page KPI strip on the Create tab — shows how the user's Smart
 * Campaigns portfolio is performing at a glance.
 */
export function CampaignMetricsRow({
  campaigns,
  onViewCampaigns,
}: CampaignMetricsRowProps) {
  const metrics = React.useMemo(() => deriveMetrics(campaigns), [campaigns])

  return (
    <div className="grid grid-cols-3 gap-3">
      <MetricTile
        icon="campaign"
        label="Campaigns created"
        value={metrics.created.toLocaleString()}
        sub={`${metrics.active} active`}
        action={
          onViewCampaigns ? { label: "View", onClick: onViewCampaigns } : undefined
        }
      />
      <MetricTile
        icon="directions_car"
        label="VINs impacted"
        value={metrics.vinsImpacted.toLocaleString()}
        sub={`across ${metrics.created} campaigns`}
      />
      <MetricTile
        icon="rocket_launch"
        label="Units sold"
        value={metrics.unitsSold.toLocaleString()}
        sub={`${metrics.leads.toLocaleString()} leads`}
        accent="primary"
      />
    </div>
  )
}

function MetricTile({
  icon,
  label,
  value,
  sub,
  accent = "neutral",
  action,
}: {
  icon: string
  label: string
  value: string
  sub: string
  accent?: "neutral" | "primary" | "success"
  action?: { label: string; onClick: () => void }
}) {
  const accentColor =
    accent === "success"
      ? "var(--spyne-success)"
      : accent === "primary"
        ? "var(--spyne-primary)"
        : "var(--spyne-text-primary)"

  return (
    <div className="relative rounded-xl border border-spyne-border bg-spyne-surface p-5">
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="absolute right-4 top-4 text-xs font-semibold text-spyne-primary hover:underline"
        >
          {action.label}
        </button>
      ) : null}
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <MaterialSymbol name={icon} size={16} />
        {label}
      </div>
      <p
        className={cn("mt-2 text-3xl font-bold tabular-nums tracking-tight")}
        style={{ color: accentColor }}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

function deriveMetrics(campaigns: Campaign[]) {
  const active = campaigns.filter(
    (c) => c.status === "running" || c.status === "scheduled" || c.status === "paused",
  ).length
  const vinsImpacted = campaigns.reduce((acc, c) => acc + c.vehicles.length, 0)
  const unitsSold = campaigns.reduce((acc, c) => acc + c.performance.unitsSold, 0)
  const leads = campaigns.reduce((acc, c) => acc + c.performance.leads, 0)

  return {
    created: campaigns.length,
    active,
    vinsImpacted,
    unitsSold,
    leads,
  }
}
