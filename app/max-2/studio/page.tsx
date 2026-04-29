"use client"

import * as React from "react"
import Link from "next/link"
import { MerchandisingSummary } from "@/components/max-2/studio/merchandising-summary"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { LotHoldingCostWidget } from "@/components/max-2/lot-view/lot-holding-cost-widget"
import { HoldingCostSetupModals } from "@/components/max-2/lot-view/holding-cost-setup-modals"
import { MerchandisingBanner, useFtue } from "@/components/max-2/ftue"
import { readPersistedHoldingStateBrowser } from "@/lib/holding-cost-config"
import { max2Classes, max2Layout, spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

/**
 * Dev: set `NEXT_PUBLIC_HOLDING_COST_FTE_REFRESH_ONLY=true` so the FTE opens only on a full tab reload
 * (not on client-side navigation). Uses Navigation Timing + legacy `performance.navigation` fallback.
 */
function isBrowserReload(): boolean {
  if (typeof window === "undefined") return false
  try {
    const list = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[]
    const n = list[0]
    if (n?.type === "reload") return true
    const legacy = (performance as unknown as { navigation?: { type: number } }).navigation
    if (legacy?.type === 1) return true
  } catch {
    /* ignore */
  }
  return false
}

export default function StudioPage() {
  const [holdingCostFteOpen, setHoldingCostFteOpen] = React.useState(false)
  const [holdingCostConfigured, setHoldingCostConfigured] = React.useState(false)
  const ftue = useFtue()

  React.useEffect(() => {
    const { configured } = readPersistedHoldingStateBrowser()
    setHoldingCostConfigured(configured)

    if (configured) {
      setHoldingCostFteOpen(false)
      return
    }

    const refreshOnlyFte =
      process.env.NEXT_PUBLIC_HOLDING_COST_FTE_REFRESH_ONLY === "true"

    if (refreshOnlyFte) {
      setHoldingCostFteOpen(isBrowserReload())
      return
    }

    setHoldingCostFteOpen(true)
  }, [])

  const handleHoldingCostSave = React.useCallback((_dailyRate: number) => {
    setHoldingCostConfigured(true)
    setHoldingCostFteOpen(false)
  }, [])

  return (
    <div className={cn(max2Layout.pageStack)}>
      <HoldingCostSetupModals
        open={holdingCostFteOpen}
        onOpenChange={setHoldingCostFteOpen}
        onSave={handleHoldingCostSave}
        firstRunEyebrow="Quick setup"
        firstRunSubtitle="Set your daily holding cost per vehicle so Merchandising and Lot Overview metrics reflect real carry."
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={max2Classes.pageTitle}>
            Merchandising
          </h1>
          <p className={max2Classes.pageDescription}>
            Inventory health, media quality, and what needs your attention today.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <LotHoldingCostWidget
            configured={holdingCostConfigured}
            onSave={handleHoldingCostSave}
          />
          <Link
            href="/max-2/studio/add"
            className={cn(
              spyneComponentClasses.btnPrimaryMd,
              "shrink-0 no-underline"
            )}
          >
            <MaterialSymbol name="add" size={20} />
            Add Media
          </Link>
        </div>
      </div>

      <MerchandisingBanner controller={ftue} />

      <MerchandisingSummary />

      <button
        type="button"
        onClick={() => setHoldingCostFteOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 z-40 max-w-[min(100vw-2rem,280px)] rounded-lg border border-dashed border-spyne-border",
          "bg-spyne-surface px-3 py-2 text-left text-xs font-medium text-spyne-text-secondary shadow-sm",
          "hover:bg-muted/50 hover:text-spyne-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spyne-primary/30",
        )}
      >
        <span className="flex items-center gap-2">
          <MaterialSymbol name="science" size={16} className="shrink-0 text-spyne-primary" />
          <span>
            Dev: open holding cost modal
          </span>
        </span>
      </button>
    </div>
  )
}
