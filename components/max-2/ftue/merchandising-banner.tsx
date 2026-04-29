"use client"

import { Progress } from "@/components/ui/progress"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneChip } from "@/components/max-2/spyne-ui"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import type { FtueController } from "@/services/max-2/ftue.types"

interface MerchandisingBannerProps {
  controller: FtueController
}

/**
 * Persistent banner that lives on the Merchandising overview after the FTUE modal closes.
 * Clicking re-opens the modal in its current state (mid-processing or complete).
 */
export function MerchandisingBanner({ controller }: MerchandisingBannerProps) {
  const { state, openModal, processingComplete, isModalOpen } = controller

  // Banner only renders post-scan and once the user has seen the modal.
  if (state.phase !== "insights") return null
  if (state.isFirstRun && isModalOpen) return null

  const { score, breakdown, processing } = state
  const pct = processing.total > 0 ? Math.round((processing.processed / processing.total) * 100) : 0

  const headline = processingComplete
    ? "Inventory onboarding complete"
    : `Processing ${processing.total} raw photo${processing.total === 1 ? "" : "s"} from your IMS`

  const subline = processingComplete
    ? `${processing.issued.toLocaleString()} listings published, ${processing.inReview.toLocaleString()} awaiting review`
    : `${processing.processed.toLocaleString()} of ${processing.total.toLocaleString()} VINs done · ${processing.issued.toLocaleString()} live · ${processing.inReview.toLocaleString()} in review`

  return (
    <button
      type="button"
      onClick={openModal}
      aria-label="Open inventory onboarding details"
      className={cn(
        "group flex w-full items-center gap-4 rounded-xl border border-spyne-border bg-spyne-surface px-5 py-4 text-left transition-colors",
        "hover:border-spyne-primary/30 hover:bg-spyne-primary-soft/30",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-spyne-primary/30 focus-visible:ring-offset-2",
      )}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-spyne-primary"
        style={{ background: "var(--spyne-primary-soft)" }}
        aria-hidden
      >
        <MaterialSymbol
          name={processingComplete ? "verified" : "auto_awesome"}
          size={20}
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-spyne-text">{headline}</p>
          <SpyneChip
            tone={processingComplete ? "success" : "primary"}
            variant="soft"
            compact
          >
            Score {score}
          </SpyneChip>
          {breakdown.noPhotos > 0 ? (
            <SpyneChip tone="error" variant="soft" compact>
              {breakdown.noPhotos} no photos
            </SpyneChip>
          ) : null}
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">{subline}</p>
        {!processingComplete ? (
          <Progress
            value={pct}
            className="mt-2 h-1.5 max-w-md bg-spyne-border/60"
            aria-label={`${pct}% of raw photos processed`}
          />
        ) : null}
      </div>

      <span
        className={cn(
          spyneComponentClasses.btnSecondaryMd,
          "shrink-0 group-hover:border-spyne-primary/30 group-hover:text-spyne-primary",
        )}
        aria-hidden
      >
        View details
        <MaterialSymbol name="chevron_right" size={16} />
      </span>
    </button>
  )
}
