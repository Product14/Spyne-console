"use client"

import * as React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneChip } from "@/components/max-2/spyne-ui"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import type {
  CampaignSuggestion,
  CampaignTrigger,
} from "@/services/max-2/smart-campaigns.types"

const TRIGGER_LABEL: Record<CampaignTrigger, string> = {
  "aged-30": "Aged 30+",
  "aged-45": "Aged 45+",
  "aged-60": "Aged 60+",
  "high-holding-cost": "High holding",
  "price-cut": "Price cut",
  "hot-demand": "Hot demand",
  festive: "Festive",
  "certified-pre-owned": "CPO",
}

const TRIGGER_TONE: Record<CampaignTrigger, "error" | "warning" | "primary" | "success"> = {
  "aged-30": "primary",
  "aged-45": "warning",
  "aged-60": "error",
  "high-holding-cost": "warning",
  "price-cut": "primary",
  "hot-demand": "success",
  festive: "primary",
  "certified-pre-owned": "success",
}

/** Tagline shown under the title — short, marketing-style. */
const TAGLINE: Partial<Record<string, string>> = {
  "festive-holiday-sales": "Capture the December rush.",
  "festive-summer-clearance": "Layer a $1,500 refund bonus.",
  "aging-45plus": "Push them before the 60-day cliff.",
  "aging-high-holding": "Pull the biggest carry drag forward.",
  "cpo-trust-drive": "Lead with the trust signals.",
  "cpo-1-9-apr": "Pulls financed buyers off the fence.",
}

interface SuggestedCampaignsListProps {
  suggestions: CampaignSuggestion[]
  onReviewAndPublish: (s: CampaignSuggestion) => void
}

/**
 * Horizontal scroll deck of suggested campaigns. Cards are roomy (~260px
 * wide) and content is reduced to: trigger chip + VIN count, big title,
 * one-line tagline, stat, primary CTA.
 */
export function SuggestedCampaignsList({
  suggestions,
  onReviewAndPublish,
}: SuggestedCampaignsListProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <section aria-label="Suggested campaigns" className="space-y-5">
        <header className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-spyne-text">
            Suggested campaigns
          </h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            {suggestions.length}
          </span>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((s) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              onReviewAndPublish={() => onReviewAndPublish(s)}
            />
          ))}
        </div>
      </section>
    </TooltipProvider>
  )
}

function SuggestionCard({
  suggestion,
  onReviewAndPublish,
}: {
  suggestion: CampaignSuggestion
  onReviewAndPublish: () => void
}) {
  const tone = TRIGGER_TONE[suggestion.trigger]
  const tagline = TAGLINE[suggestion.id] ?? ""

  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border border-spyne-border bg-spyne-surface p-6">
      <header className="flex items-center justify-between gap-2">
        <SpyneChip tone={tone} variant="soft" compact>
          {TRIGGER_LABEL[suggestion.trigger]}
        </SpyneChip>
        <VinSetChip count={suggestion.vehicles.length} vehicles={suggestion.vehicles} />
      </header>

      <div className="flex-1">
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-spyne-text">
          {suggestion.title}
        </h3>
        {tagline ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {tagline}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="font-semibold tabular-nums text-spyne-text">
          ~{suggestion.projection.unitsSold}
        </span>
        <span>units est.</span>
      </div>

      <button
        type="button"
        onClick={onReviewAndPublish}
        className={cn(
          spyneComponentClasses.btnSecondaryMd,
          "!h-10 !w-full !justify-center !text-sm",
        )}
      >
        Review &amp; publish
      </button>
    </article>
  )
}

function VinSetChip({
  count,
  vehicles,
}: {
  count: number
  vehicles: CampaignSuggestion["vehicles"]
}) {
  const sample = vehicles.slice(0, 8)
  const overflow = vehicles.length - sample.length

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-help items-center gap-1 rounded-full bg-muted/40 px-2 py-0.5 text-[11px] font-semibold text-spyne-text hover:bg-muted/70">
          {count}
          <span className="text-muted-foreground">VINs</span>
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="end"
        className="max-w-[280px] border border-spyne-border bg-spyne-surface px-3 py-2.5 text-spyne-text shadow-md"
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Set of {count} VINs
        </p>
        <ul className="mt-1.5 space-y-0.5 text-xs">
          {sample.map((v) => (
            <li key={v.vin} className="truncate text-spyne-text">
              {v.year} {v.make} {v.model}
              <span className="ml-1 text-muted-foreground">· {v.daysInStock}d</span>
            </li>
          ))}
        </ul>
        {overflow > 0 ? (
          <p className="mt-1.5 text-[11px] text-muted-foreground">+{overflow} more</p>
        ) : null}
      </TooltipContent>
    </Tooltip>
  )
}
