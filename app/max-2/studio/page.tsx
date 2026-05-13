"use client"

import * as React from "react"
import Link from "next/link"
import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import { STUDIO_HOLDING_COST_PER_DAY } from "@/lib/inventory-issue-label"
import { MerchandisingTable } from "@/components/max-2/studio/merchandising-table"
import { SmartCampaignHookToast } from "@/components/max-2/studio/smart-campaign-hook-toast"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneChip } from "@/components/max-2/spyne-ui"
import { max2Classes, max2Layout, spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

type CohortTab = "new" | "used"
type HookFilter = null | "aged-30" | "high-holding"

/** Holding-cost threshold (USD accumulated) above which a VIN counts as "high holding". */
const HIGH_HOLDING_THRESHOLD = 1200

const FILTER_COPY: Record<Exclude<HookFilter, null>, string> = {
  "aged-30": "Age > 30 days",
  "high-holding": "High holding cost",
}

export default function StudioPage() {
  const [tab, setTab] = React.useState<CohortTab>("new")
  const [activeFilter, setActiveFilter] = React.useState<HookFilter>(null)

  const all = React.useMemo(
    () => mockMerchandisingVehicles.filter((v) => v.year > 0),
    [],
  )

  const counts = {
    new: all.filter((v) => v.isNew).length,
    used: all.filter((v) => !v.isNew).length,
    total: all.length,
  }

  /**
   * Aging filters span the whole inventory — not the current cohort. Aged VINs
   * almost always live in the Pre-owned bucket, so scoping the count to "New"
   * collapses the result to zero and breaks the campaign suggestion.
   */
  const aged30 = React.useMemo(
    () => all.filter((v) => v.daysInStock >= 30),
    [all],
  )
  const highHolding = React.useMemo(
    () =>
      all.filter(
        (v) => v.daysInStock * STUDIO_HOLDING_COST_PER_DAY >= HIGH_HOLDING_THRESHOLD,
      ),
    [all],
  )

  const filteredVehicles = React.useMemo(() => {
    if (activeFilter === "aged-30") return aged30
    if (activeFilter === "high-holding") return highHolding
    return all.filter((v) => (tab === "new" ? v.isNew : !v.isNew))
  }, [activeFilter, aged30, highHolding, all, tab])

  const hookFilterMatches =
    activeFilter === "aged-30"
      ? aged30
      : activeFilter === "high-holding"
        ? highHolding
        : []
  const hookHoldingCost = hookFilterMatches.reduce(
    (acc, v) => acc + v.daysInStock * STUDIO_HOLDING_COST_PER_DAY,
    0,
  )

  return (
    <div className={cn(max2Layout.pageStack, "pb-32")}>
      <PageHeader />

      <CohortTabs
        value={tab}
        onChange={(t) => {
          setTab(t)
          setActiveFilter(null)
        }}
        counts={counts}
        disabled={activeFilter !== null}
      />

      <div className="flex flex-wrap items-stretch gap-3">
        <AgingFilterBox
          icon="schedule"
          label="Age >30 days"
          count={aged30.length}
          active={activeFilter === "aged-30"}
          onToggle={() =>
            setActiveFilter((prev) => (prev === "aged-30" ? null : "aged-30"))
          }
        />
        <AgingFilterBox
          icon="savings"
          label="High holding cost"
          count={highHolding.length}
          active={activeFilter === "high-holding"}
          onToggle={() =>
            setActiveFilter((prev) =>
              prev === "high-holding" ? null : "high-holding",
            )
          }
        />
      </div>

      <MerchandisingTable vehicles={filteredVehicles} />

      {activeFilter ? (
        <SmartCampaignHookToast
          filterKey={activeFilter}
          filterLabel={FILTER_COPY[activeFilter]}
          vehicleCount={hookFilterMatches.length}
          holdingCost={hookHoldingCost}
        />
      ) : null}
    </div>
  )
}

/* ────────────────────────── Header ────────────────────────── */

function PageHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className={max2Classes.pageTitle}>Merchandising</h1>
        <p className={max2Classes.pageDescription}>
          Manage your inventory and see what needs your attention.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <HeaderPill icon="schedule" label="Inventory TAT" value="7 days" delta="↑ 0.1d" />
        <HeaderPill icon="savings" label="Holding cost" value="$45/day" tone="warning" />
        <Link
          href="/max-2/studio/add"
          className={cn(spyneComponentClasses.btnPrimaryMd, "no-underline")}
        >
          <MaterialSymbol name="add" size={20} />
          Add new inventory
        </Link>
      </div>
    </div>
  )
}

function HeaderPill({
  icon,
  label,
  value,
  delta,
  tone = "neutral",
}: {
  icon: string
  label: string
  value: string
  delta?: string
  tone?: "neutral" | "warning"
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
        tone === "warning"
          ? "border-spyne-warning/40 bg-spyne-warning-soft"
          : "border-spyne-border bg-spyne-surface",
      )}
    >
      <MaterialSymbol
        name={icon}
        size={16}
        className={tone === "warning" ? "text-spyne-warning-ink" : "text-spyne-text"}
      />
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="text-sm font-semibold tabular-nums text-spyne-text">{value}</span>
      {delta ? (
        <span className="text-[11px] font-semibold tabular-nums text-spyne-error">
          {delta}
        </span>
      ) : null}
    </div>
  )
}

/* ────────────────────────── Cohort tabs ────────────────────────── */

function CohortTabs({
  value,
  onChange,
  counts,
  disabled = false,
}: {
  value: CohortTab
  onChange: (next: CohortTab) => void
  counts: { new: number; used: number; total: number }
  disabled?: boolean
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-spyne-border">
      <div className={cn("flex items-center gap-1", disabled && "opacity-50")}>
        <CohortButton
          active={value === "new"}
          onClick={() => onChange("new")}
          label="New vehicles"
          count={counts.new}
          disabled={disabled}
        />
        <CohortButton
          active={value === "used"}
          onClick={() => onChange("used")}
          label="Pre-owned vehicles"
          count={counts.used}
          disabled={disabled}
        />
      </div>
      <div className="flex items-center gap-2 pb-2">
        <SpyneChip
          tone="neutral"
          variant="soft"
          compact
          leading={<MaterialSymbol name="sync" size={14} />}
        >
          Last synced: Today, 6:35 PM
        </SpyneChip>
        <SpyneChip tone="primary" variant="soft" compact>
          Total inventory: {counts.total}
        </SpyneChip>
      </div>
    </div>
  )
}

function CohortButton({
  active,
  onClick,
  label,
  count,
  disabled = false,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors",
        active ? "text-spyne-text" : "text-muted-foreground hover:text-spyne-text",
        disabled && "cursor-not-allowed",
      )}
      aria-current={active ? "page" : undefined}
    >
      <span>
        {label} <span className="tabular-nums">({count})</span>
      </span>
      {active ? (
        <span
          className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-spyne-primary"
          aria-hidden
        />
      ) : null}
    </button>
  )
}

/* ────────────────────────── Aging filter boxes ────────────────────────── */

function AgingFilterBox({
  icon,
  label,
  count,
  active,
  onToggle,
}: {
  icon: string
  label: string
  count: number
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={cn(
        "flex min-w-[200px] items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
        active
          ? "border-spyne-primary bg-spyne-primary-soft shadow-sm"
          : "border-spyne-border bg-spyne-surface hover:border-spyne-primary/30",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          active
            ? "bg-spyne-primary text-white"
            : "bg-muted/40 text-spyne-text",
        )}
        aria-hidden
      >
        <MaterialSymbol name={icon} size={20} />
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm font-semibold",
            active ? "text-spyne-primary" : "text-spyne-text",
          )}
        >
          {label}
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {count} vehicle{count === 1 ? "" : "s"}
        </p>
      </div>
      {active ? (
        <MaterialSymbol
          name="close"
          size={16}
          className="ml-2 text-spyne-primary"
        />
      ) : null}
    </button>
  )
}
