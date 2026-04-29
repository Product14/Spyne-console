"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { SpyneChip } from "@/components/max-2/spyne-ui"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { cn } from "@/lib/utils"
import type { SpyneChipTone } from "@/lib/design-system/max-2"
import { spyneComponentClasses } from "@/lib/design-system/max-2"

function holdingLoadChipTone(pct: number): SpyneChipTone {
  if (pct < 10) return "success"
  if (pct < 25) return "warning"
  return "error"
}

function formatMarginPct(pct: number): string {
  return String(Math.round(pct))
}

export type Max2ActionTabMetaStyle = "chips" | "text"
export type Max2ActionTabUrgency = "none" | "watch" | "urgent" | "critical"

export type Max2ActionTabProps = {
  icon: React.ReactNode
  title: string
  count: number
  /**
   * “N vehicles →” line. Default: primary outline chip (Lot Overview).
   * `plain-error`: plain count + arrow in `text-spyne-error` (Studio Merchandising).
   * `plain-error-view-all`: red count line + “View all vehicles” in primary (Lot Action Items).
   */
  vehicleCountStyle?: "chip" | "plain-error" | "plain-error-view-all"
  /**
   * Phase + holding row. `text`: plain labels (Lot), tighter hierarchy. Default `chips`.
   */
  metaStyle?: Max2ActionTabMetaStyle
  /** Left-edge urgency accent (Lot aging buckets). */
  urgency?: Max2ActionTabUrgency
  /** Short phase label, e.g. age window (shown as an outline badge). */
  phaseBadge?: string
  /** Cohort: total holding cost as % of total estimated front gross. Omitted when not shown. */
  marginEatenPct?: number | null
  /** If set, shows an info icon next to the title with this tooltip text. */
  tooltip?: string
  selected?: boolean
  onClick?: () => void
  className?: string
}

const URGENCY_TAB_CLASS: Record<Exclude<Max2ActionTabUrgency, "none">, string> = {
  watch: "shadow-[inset_3px_0_0_0_var(--spyne-warning)]",
  urgent: "shadow-[inset_4px_0_0_0_var(--spyne-warning)]",
  critical: "shadow-[inset_4px_0_0_0_var(--spyne-error)]",
}

/**
 * Single “action required” tab: icon, heading, then “N vehicles →”.
 * Icon slot: use `<MaterialSymbol name="…" size={24} />` (Max 2 default icon system).
 * Styles are defined under `.max2-spyne` in `app/globals.css` (see design-system/max-2.md).
 */
export const Max2ActionTab = React.forwardRef<HTMLButtonElement, Max2ActionTabProps>(
  function Max2ActionTab(
    {
      icon,
      title,
      count,
      vehicleCountStyle = "chip",
      metaStyle = "chips",
      urgency = "none",
      phaseBadge,
      marginEatenPct,
      tooltip,
      selected,
      onClick,
      className,
    },
    ref,
  ) {
    const vehicleLabel = count === 1 ? "vehicle" : "vehicles"
    const showMarginRow = count > 0 && marginEatenPct !== undefined
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={selected}
        onClick={onClick}
        className={cn(
          spyneComponentClasses.actionTab,
          urgency !== "none" && URGENCY_TAB_CLASS[urgency],
          selected && spyneComponentClasses.actionTabSelected,
          "relative !gap-3",
          className,
        )}
      >
        {/* Info icon — top-right corner */}
        {tooltip && (
          <TooltipPrimitive.Provider delayDuration={200}>
            <TooltipPrimitive.Root>
              <TooltipPrimitive.Trigger
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <span
                  className="absolute right-2.5 top-2.5 shrink-0 cursor-default text-muted-foreground/35 transition-colors hover:text-muted-foreground"
                  aria-label="More info"
                >
                  <MaterialSymbol name="info" size={15} />
                </span>
              </TooltipPrimitive.Trigger>
              <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                  side="top"
                  sideOffset={6}
                  className={spyneComponentClasses.darkTooltipRadixContent}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={cn(spyneComponentClasses.darkTooltipPanel, "max-w-[220px] text-[12px] leading-relaxed")}>
                    {tooltip}
                  </div>
                  <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={12} height={6} />
                </TooltipPrimitive.Content>
              </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
          </TooltipPrimitive.Provider>
        )}

        {/* Top row: icon left, phase + holding (chips or plain text) */}
        <div className="flex w-full min-w-0 flex-row items-start justify-between gap-2">
          <span className={spyneComponentClasses.actionTabIcon}>{icon}</span>
          <div className="flex min-w-0 shrink-0 flex-col items-end gap-1 text-right">
            {metaStyle === "text" ? (
              <>
                {phaseBadge && (
                  <span className="text-[11px] font-medium leading-snug text-muted-foreground">{phaseBadge}</span>
                )}
                {showMarginRow && marginEatenPct != null && (
                  <span className="text-[11px] font-medium leading-snug text-spyne-error">
                    Holding cost = <span className="font-bold tabular-nums">{formatMarginPct(marginEatenPct)}%</span> of gross margin
                  </span>
                )}
              </>
            ) : (
              <>
                {phaseBadge && (
                  <SpyneChip variant="outline" tone="neutral" compact className="text-[11px]">
                    {phaseBadge}
                  </SpyneChip>
                )}
                {showMarginRow && (
                  marginEatenPct == null ? null : (
                    <SpyneChip
                      variant="soft"
                      tone={holdingLoadChipTone(marginEatenPct)}
                      compact
                      className="text-[11px] tabular-nums"
                    >
                      {formatMarginPct(marginEatenPct)}% holding
                    </SpyneChip>
                  )
                )}
              </>
            )}
          </div>
        </div>

        {/* Title + count grouped so gap-3 only applies between icon-row and this block */}
        <div className="flex w-full min-w-0 flex-col gap-1">
          {/* Title */}
          <div className="flex w-full min-w-0 items-center">
            <span
              className={cn(
                spyneComponentClasses.actionTabTitle,
                "!text-[14px] !font-semibold !leading-snug !tracking-tight whitespace-pre-line",
              )}
            >
              {title}
            </span>
          </div>

          {/* Vehicle count / view-all — gap-1 (4px) below title */}
          <div className="flex w-full min-w-0 flex-col items-start gap-1">
          {vehicleCountStyle === "plain-error-view-all" ? (
            <>
              <span className="text-[13px] font-semibold tabular-nums text-spyne-error">
                {count} {vehicleLabel}
              </span>
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-spyne-primary">
                View all vehicles
                <MaterialSymbol name="arrow_forward" size={14} className="shrink-0 opacity-80" />
              </span>
            </>
          ) : vehicleCountStyle === "plain-error" ? (
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold tabular-nums text-spyne-error">
              {count} {vehicleLabel}
              <MaterialSymbol name="arrow_forward" size={14} className="shrink-0 text-spyne-error opacity-80" />
            </span>
          ) : (
            <SpyneChip
              variant="outline"
              tone="primary"
              compact
              className="tabular-nums text-[13px] font-semibold"
              trailing={
                <MaterialSymbol name="arrow_forward" size={14} className="text-spyne-primary opacity-80" />
              }
            >
              {count} {vehicleLabel}
            </SpyneChip>
          )}
          </div>
        </div>
      </button>
    )
  },
)

Max2ActionTab.displayName = "Max2ActionTab"

export type Max2ActionTabStripProps = {
  children: React.ReactNode
  className?: string
}

export function Max2ActionTabStrip({ children, className }: Max2ActionTabStripProps) {
  return (
    <div role="tablist" className={cn(spyneComponentClasses.actionTabStrip, className)}>
      {children}
    </div>
  )
}
