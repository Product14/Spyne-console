"use client"

import * as React from "react"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneChip } from "@/components/max-2/spyne-ui"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import type { Campaign, CampaignStatus } from "@/services/max-2/smart-campaigns.types"

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

interface MyCampaignsListProps {
  campaigns: Campaign[]
  onOpen: (campaign: Campaign) => void
}

export function MyCampaignsList({ campaigns, onOpen }: MyCampaignsListProps) {
  if (campaigns.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-spyne-border bg-spyne-surface px-6 py-16 text-center">
        <p className="text-sm font-semibold text-spyne-text">No campaigns yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Create one from the Create tab.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-spyne-border bg-spyne-surface">
      <table className="w-full text-left text-sm">
        <thead className="bg-spyne-page-bg text-xs text-muted-foreground">
          <tr>
            <th className="px-6 py-3 font-medium">Campaign</th>
            <th className="px-6 py-3 font-medium">Status</th>
            <th className="px-6 py-3 font-medium">VINs</th>
            <th className="px-6 py-3 font-medium">Launched</th>
            <th className="px-6 py-3 font-medium">Performance</th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr
              key={c.id}
              className="cursor-pointer border-t border-spyne-border/60 transition-colors hover:bg-muted/30"
              onClick={() => onOpen(c)}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-spyne-text">{c.title}</p>
                  {c.kind === "agentic" ? (
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
              </td>
              <td className="px-6 py-4">
                <SpyneChip tone={STATUS_TONE[c.status]} variant="soft" compact>
                  {STATUS_LABEL[c.status]}
                </SpyneChip>
              </td>
              <td className="px-6 py-4 text-sm font-semibold tabular-nums text-spyne-text">
                {c.vehicles.length}
              </td>
              <td className="px-6 py-4 text-xs tabular-nums text-muted-foreground">
                {c.launchedAt ? formatDate(c.launchedAt) : "-"}
              </td>
              <td className="px-6 py-4 text-sm tabular-nums">
                <span className="font-semibold text-spyne-text">
                  {c.performance.unitsSold}
                </span>
                <span className="text-muted-foreground"> units</span>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpen(c)
                  }}
                  aria-label={`Open ${c.title}`}
                  className={cn(
                    spyneComponentClasses.btnSecondaryMd,
                    "!h-8 !px-2 !text-xs",
                  )}
                >
                  <MaterialSymbol name="arrow_forward" size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatDate(iso: string): string {
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
