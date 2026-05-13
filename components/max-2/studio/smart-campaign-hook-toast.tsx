"use client"

import Link from "next/link"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneChip } from "@/components/max-2/spyne-ui"
import { cn } from "@/lib/utils"

const SPYNE_GRADIENT_BG =
  "linear-gradient(118deg, #7C3AED 0%, #DB2777 50%, #F59E0B 100%)"

type HookFilterKey = "aged-30" | "high-holding"

interface SmartCampaignHookToastProps {
  /** Active filter key — drives the deep link into the wizard. */
  filterKey: HookFilterKey
  /** Label shown for the active filter, e.g. "Age > 30 days". */
  filterLabel: string
  /** Number of vehicles matching the filter. */
  vehicleCount: number
  /** Estimated holding-cost drag for the matching VINs. */
  holdingCost: number
}

/**
 * Non-dismissible bottom hook that links straight into the campaign-creation
 * wizard (deep-linked via `?createCampaign=<filterKey>`).
 */
export function SmartCampaignHookToast({
  filterKey,
  filterLabel,
  vehicleCount,
  holdingCost,
}: SmartCampaignHookToastProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 motion-safe:animate-in motion-safe:slide-in-from-bottom-4">
      <div
        className="pointer-events-auto flex w-full max-w-[560px] items-center gap-3 rounded-2xl border bg-spyne-surface px-4 py-3 shadow-xl"
        style={{
          borderColor: "color-mix(in srgb, #7C3AED 28%, var(--spyne-border))",
          boxShadow:
            "0 18px 48px color-mix(in srgb, #7C3AED 25%, transparent), 0 0 0 4px color-mix(in srgb, #7C3AED 10%, transparent)",
        }}
        role="region"
        aria-label="Smart Campaigns suggestion"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
          style={{ background: SPYNE_GRADIENT_BG }}
          aria-hidden
        >
          <MaterialSymbol name="auto_awesome" size={16} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-sm font-semibold text-spyne-text">
              Create this as a campaign
            </p>
            <SpyneChip tone="primary" variant="soft" compact>
              {filterLabel}
            </SpyneChip>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
            {vehicleCount} VINs · ${Math.round(holdingCost).toLocaleString()} holding
          </p>
        </div>

        <Link
          href={`/max-2/marketing?createCampaign=${filterKey}`}
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold text-white no-underline shadow-sm transition-transform hover:scale-[1.02]",
          )}
          style={{ background: SPYNE_GRADIENT_BG }}
        >
          Create campaign
          <MaterialSymbol name="arrow_forward" size={14} />
        </Link>
      </div>
    </div>
  )
}
