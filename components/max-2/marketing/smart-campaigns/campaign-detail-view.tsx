"use client"

import * as React from "react"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneChip } from "@/components/max-2/spyne-ui"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import type {
  Campaign,
  CampaignChannel,
  CampaignStatus,
} from "@/services/max-2/smart-campaigns.types"

const STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  running: "Running",
  paused: "Paused",
  completed: "Completed",
}

const STATUS_TONE: Record<CampaignStatus, "neutral" | "primary" | "success" | "warning"> = {
  draft: "neutral",
  scheduled: "primary",
  running: "success",
  paused: "warning",
  completed: "neutral",
}

const CHANNEL_LABEL: Record<CampaignChannel, string> = {
  "google-ads": "Google",
  "meta-ads": "Meta",
  autotrader: "AutoTrader",
  "cars-dot-com": "Cars.com",
  email: "Email",
  sms: "SMS",
  "vlp-spotlight": "VLP",
  "social-organic": "Social",
}

interface CampaignDetailViewProps {
  campaign: Campaign
  onClose: () => void
  onPause: (campaign: Campaign) => void
  onResume: (campaign: Campaign) => void
  onStop: (campaign: Campaign) => void
  onEdit: (campaign: Campaign) => void
}

/**
 * Read-only-with-controls view of an already-created campaign.
 * Allows pause / resume / stop / edit. No publish — the campaign is
 * already out in the world.
 */
export function CampaignDetailView({
  campaign,
  onClose,
  onPause,
  onResume,
  onStop,
  onEdit,
}: CampaignDetailViewProps) {
  const canPause = campaign.status === "running"
  const canResume = campaign.status === "paused"
  const canStop = campaign.status !== "completed" && campaign.status !== "draft"
  const canEdit = campaign.status !== "completed"

  return (
    <div className="overflow-hidden rounded-2xl border border-spyne-border bg-spyne-surface">
      <header className="border-b border-spyne-border px-8 pt-7 pb-6">
        <button
          type="button"
          onClick={onClose}
          className="mb-5 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-spyne-text"
        >
          <MaterialSymbol name="arrow_back" size={16} />
          Back
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <SpyneChip tone={STATUS_TONE[campaign.status]} variant="soft" compact>
                {STATUS_LABEL[campaign.status]}
              </SpyneChip>
              {campaign.kind === "agentic" ? (
                <SpyneChip
                  tone="primary"
                  variant="soft"
                  compact
                  leading={<MaterialSymbol name="auto_awesome" size={14} />}
                >
                  By Spyne
                </SpyneChip>
              ) : null}
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-spyne-text">
              {campaign.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Launched {formatDate(campaign.launchedAt)} · {campaign.config.durationDays}d run
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canEdit ? (
              <button
                type="button"
                onClick={() => onEdit(campaign)}
                className={cn(spyneComponentClasses.btnSecondaryMd, "!h-10 !text-sm")}
              >
                <MaterialSymbol name="edit" size={16} />
                Edit
              </button>
            ) : null}
            {canPause ? (
              <button
                type="button"
                onClick={() => onPause(campaign)}
                className={cn(spyneComponentClasses.btnSecondaryMd, "!h-10 !text-sm")}
              >
                <MaterialSymbol name="pause" size={16} />
                Pause
              </button>
            ) : null}
            {canResume ? (
              <button
                type="button"
                onClick={() => onResume(campaign)}
                className={cn(spyneComponentClasses.btnPrimaryMd, "!h-10 !text-sm")}
              >
                <MaterialSymbol name="play_arrow" size={16} />
                Resume
              </button>
            ) : null}
            {canStop ? (
              <button
                type="button"
                onClick={() => onStop(campaign)}
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-lg border border-spyne-error/40 px-3 text-sm font-semibold text-spyne-error hover:bg-spyne-error-soft",
                )}
              >
                <MaterialSymbol name="stop_circle" size={16} />
                Stop
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="space-y-6 bg-spyne-page-bg px-8 py-7">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <PerfTile label="Impressions" value={campaign.performance.impressions.toLocaleString()} />
          <PerfTile label="Leads" value={campaign.performance.leads.toLocaleString()} />
          <PerfTile label="Appointments" value={campaign.performance.appointments.toLocaleString()} />
          <PerfTile
            label="Units sold"
            value={campaign.performance.unitsSold.toLocaleString()}
            accent
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="rounded-xl border border-spyne-border bg-spyne-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Vehicles
            </p>
            <div className="mt-4 max-h-[280px] overflow-y-auto rounded-lg border border-spyne-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-spyne-page-bg text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">VIN</th>
                    <th className="px-4 py-2.5 font-medium">Vehicle</th>
                    <th className="px-4 py-2.5 font-medium">Age</th>
                  </tr>
                </thead>
                <tbody>
                  {campaign.vehicles.map((v) => (
                    <tr key={v.vin} className="border-t border-spyne-border/60">
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                        {v.vin.slice(-8)}
                      </td>
                      <td className="px-4 py-2.5 text-spyne-text">
                        {v.year} {v.make} {v.model}
                      </td>
                      <td className="px-4 py-2.5 text-xs tabular-nums text-spyne-text">
                        {v.daysInStock}d
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="space-y-6 rounded-xl border border-spyne-border bg-spyne-surface p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Creative
              </p>
              <p className="mt-2 text-sm font-semibold text-spyne-text">
                {campaign.config.creative.headline}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {campaign.config.creative.body}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Channels
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {campaign.config.channels.map((c) => (
                  <SpyneChip key={c} tone="primary" variant="soft" compact>
                    {CHANNEL_LABEL[c]}
                  </SpyneChip>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Budget
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-spyne-text">
                ${campaign.config.budget.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                ${campaign.performance.spend.toLocaleString()} spent
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function PerfTile({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="rounded-xl border border-spyne-border bg-spyne-surface p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums",
          accent ? "text-spyne-success" : "text-spyne-text",
        )}
      >
        {value}
      </p>
    </div>
  )
}

function formatDate(iso?: string): string {
  if (!iso) return "-"
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}
