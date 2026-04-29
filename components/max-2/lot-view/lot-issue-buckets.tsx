"use client"

import * as React from "react"
import Link from "next/link"
import { useHoldingCostRateOptional } from "@/components/max-2/holding-cost-rate-context"
import { lotVehicleToMerchandising } from "@/lib/lot-vehicle-to-merchandising"
import type { LotVehicle } from "@/services/max-2/max-2.types"
import { cn } from "@/lib/utils"
import { max2Classes, spyneComponentClasses } from "@/lib/design-system/max-2"
import {
  Max2ActionTab,
  Max2ActionTabStrip,
  type Max2ActionTabUrgency,
} from "@/components/max-2/max2-action-tab"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { VehicleMediaTable } from "@/components/max-2/studio/vehicle-media-table"

function cohortMarginEatenPct(vehicles: LotVehicle[]): number | null {
  if (vehicles.length === 0) return null
  const totalGross = vehicles.reduce((s, v) => s + v.estimatedFrontGross, 0)
  if (totalGross <= 0) return null
  const totalHolding = vehicles.reduce((s, v) => s + v.totalHoldingCost, 0)
  return (totalHolding / totalGross) * 100
}

// ── Main component ────────────────────────────────────────────────────────

export function LotIssueBuckets() {
  const { vehicles: lotVehicles } = useHoldingCostRateOptional()
  const [activeTab, setActiveTab] = React.useState(0)
  const [suggestArrowLeft, setSuggestArrowLeft] = React.useState<number | null>(null)
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const suggestAnchorRef = React.useRef<HTMLDivElement | null>(null)

  const vehicles = lotVehicles

  const tabDefs: {
    key: string
    label: string
    phaseBadge: string
    urgency: Max2ActionTabUrgency
    icon: React.ReactNode
    filter: (v: LotVehicle) => boolean
    href: string
    /** Shown above the table when this tab has matches: tooltip-style warning strip + CTA. */
    suggest: { body: string; cta: string; ctaHref: string; icon: string }
  }[] = [
    {
      key: "reprice",
      label: "Reprice these vehicles within 10 days",
      phaseBadge: "Age · 31–45 days",
      urgency: "watch",
      icon: <MaterialSymbol name="refresh" size={24} />,
      filter: (v) => v.daysInStock >= 31 && v.daysInStock <= 45 && v.lotStatus === "frontline",
      href: "/max-2/studio/inventory?focus=reprice",
      suggest: {
        body: "Run a smart campaign to lift VDP views and leads before age penalties stack further.",
        cta: "Run smart campaign",
        ctaHref: "/max-2/studio/inventory?focus=smart-campaign",
        icon: "campaign",
      },
    },
    {
      key: "liquidate",
      label: "Liquidate or deep reprice these units within 14 days",
      phaseBadge: "Age · 46–60 days",
      urgency: "urgent",
      icon: <MaterialSymbol name="trending_down" size={24} />,
      filter: (v) => v.daysInStock >= 46 && v.daysInStock <= 60 && v.lotStatus !== "sold-pending",
      href: "/max-2/studio/inventory?focus=liquidate",
      suggest: {
        body: "Run a smart campaign to drive urgency and leads before holding cost erodes deal gross.",
        cta: "Run smart campaign",
        ctaHref: "/max-2/studio/inventory?focus=smart-campaign",
        icon: "campaign",
      },
    },
    {
      key: "exit-now",
      label: "Exit these vehicles now (wholesale or auction)",
      phaseBadge: "Age · 61+ days",
      urgency: "critical",
      icon: <MaterialSymbol name="logout" size={24} />,
      filter: (v) => v.daysInStock > 60 && v.lotStatus !== "sold-pending",
      href: "/max-2/studio/inventory?focus=exit-now",
      suggest: {
        body: "Run a smart campaign to generate last-chance leads and move these units before capital is further tied up.",
        cta: "Run smart campaign",
        ctaHref: "/max-2/studio/inventory?focus=smart-campaign",
        icon: "campaign",
      },
    },
  ]

  const tab = tabDefs[activeTab]
  const matched = vehicles.filter(tab.filter)
  const shown = matched.slice(0, 5).map(lotVehicleToMerchandising)
  const hasMore = matched.length > 5

  React.useLayoutEffect(() => {
    if (matched.length === 0) {
      setSuggestArrowLeft(null)
      return
    }
    const anchor = suggestAnchorRef.current
    const tabEl = tabRefs.current[activeTab]
    if (!anchor || !tabEl) return

    const update = () => {
      const a = suggestAnchorRef.current
      const t = tabRefs.current[activeTab]
      if (!a || !t) return
      const ar = a.getBoundingClientRect()
      const tr = t.getBoundingClientRect()
      setSuggestArrowLeft(tr.left + tr.width / 2 - ar.left)
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(anchor)
    window.addEventListener("resize", update)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [activeTab, matched.length])

  return (
    <div className={cn(max2Classes.overviewPanelShell, max2Classes.overviewPanelShellAllowOverflow)}>
      <div
        className={cn(
          max2Classes.overviewPanelHeader,
          "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className={spyneComponentClasses.cardTitle}>Action Items</p>
          <p className={max2Classes.overviewPanelDescription}>
            Vehicles grouped by lot issue. Click a tab to review.
          </p>
        </div>
        <Link
          href={tab.href}
          className="inline-flex shrink-0 items-center gap-1.5 self-start text-sm font-semibold text-spyne-primary no-underline hover:underline sm:self-auto"
        >
          View all vehicles
          <MaterialSymbol name="arrow_forward" size={16} className="shrink-0 opacity-90" aria-hidden />
        </Link>
      </div>

      <div>
        <Max2ActionTabStrip className="!grid !grid-cols-3 !pt-0 !px-5 !pb-2 gap-3">
          {tabDefs.map((t, i) => {
            const matchedTab = vehicles.filter(t.filter)
            const count = matchedTab.length
            const marginEatenPct = count === 0 ? undefined : cohortMarginEatenPct(matchedTab)
            return (
              <Max2ActionTab
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                key={t.key}
                icon={t.icon}
                title={t.label}
                phaseBadge={t.phaseBadge}
                count={count}
                marginEatenPct={marginEatenPct}
                metaStyle="text"
                urgency={t.urgency}
                vehicleCountStyle="plain-error"
                selected={activeTab === i}
                onClick={() => setActiveTab(i)}
              />
            )
          })}
        </Max2ActionTabStrip>

        {matched.length > 0 && (
          <div className="px-5 pt-0">
            <div ref={suggestAnchorRef} className={max2Classes.overviewSuggestBannerAnchor}>
              {suggestArrowLeft != null && (
                <div
                  aria-hidden
                  className={max2Classes.overviewSuggestBannerPointer}
                  style={{ left: suggestArrowLeft }}
                />
              )}
              <div className={max2Classes.overviewSuggestBanner}>
                <div className={max2Classes.overviewSuggestBannerContent}>
                  <MaterialSymbol
                    name={tab.suggest.icon}
                    size={20}
                    className="mt-0.5 shrink-0 text-spyne-warning-ink"
                  />
                  <p className="text-sm text-spyne-text">{tab.suggest.body}</p>
                </div>
                <Link
                  href={tab.suggest.ctaHref}
                  className={cn(spyneComponentClasses.btnPrimaryMd, "inline-flex shrink-0 justify-center no-underline")}
                >
                  {tab.suggest.cta}
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className={matched.length > 0 ? max2Classes.overviewSuggestBannerTableGap : undefined}>
          {shown.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No vehicles in this category.
            </p>
          ) : (
            <VehicleMediaTable
              vehicles={shown}
              showCheckboxes={false}
              embedded
              tableView="lot-view"
              merchandisingIssueContext={
                tab.key === "reprice"
                  ? "lot-reprice"
                  : tab.key === "liquidate"
                    ? "lot-liquidate"
                    : "lot-exit-now"
              }
            />
          )}

          {hasMore && (
            <div
              className={cn(
                max2Classes.overviewPanelFooterRow,
                "!border-t-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
              )}
            >
              <p className="text-sm font-medium tabular-nums text-muted-foreground">
                Showing {shown.length} of {matched.length} vehicles
              </p>
              <Link
                href={tab.href}
                className="inline-flex items-center gap-1.5 text-base font-semibold text-spyne-primary hover:underline sm:ml-auto"
              >
                View all vehicles
                <MaterialSymbol name="arrow_forward" size={18} className="shrink-0 opacity-90" aria-hidden />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
