"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { SpyneLineTab, SpyneLineTabInlineCount, SpyneLineTabStrip } from "@/components/max-2/spyne-line-tabs"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type InventoryVehicleType = "all" | "new" | "used"

export interface Max2InventoryListHeaderProps {
  vehicleType: InventoryVehicleType
  onVehicleTypeChange: (t: InventoryVehicleType) => void
  counts: { all: number; new: number; used: number }
  /** When true, shows last-sync line on the right of the tab row. */
  showSyncStatus?: boolean
  /** Overrides default VAuto-style sync line when `showSyncStatus` is true. */
  syncLabel?: string
  searchPlaceholder?: string
  /**
   * When non-empty (and motion is allowed), cycles these as the visible hint when the field is empty and unfocused.
   * Falls back to `searchPlaceholder` when unset or for `prefers-reduced-motion` (first hint only as static placeholder).
   */
  searchHintRotation?: string[]
  searchValue: string
  onSearchChange: (value: string) => void
  viewInput?: { checked: boolean; onCheckedChange: (v: boolean) => void }
  onApplyFiltersClick?: () => void
  onExportClick?: () => void
  addVehicleHref?: string
  addVehicleLabel?: string
  /** Outlined link styled like external navigation (e.g. sold inventory). */
  soldInventoryHref?: string
  soldInventoryLabel?: string
  quickChips?: React.ReactNode
  /** When true, shows the ⋮ menu with Refresh / Export and `moreMenuExtras`. */
  showOverflowMenu?: boolean
  /** Extra items in the overflow menu (Export, etc.) */
  moreMenuExtras?: React.ReactNode
}

function defaultSyncLabel() {
  const formatted = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date())
  return `Last synced from Vauto: ${formatted}`
}

const TAB_DEFS: { id: InventoryVehicleType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "used", label: "Pre-Owned" },
]

export function Max2InventoryListHeader({
  vehicleType,
  onVehicleTypeChange,
  counts,
  showSyncStatus = false,
  syncLabel,
  searchPlaceholder = "Search",
  searchHintRotation,
  searchValue,
  onSearchChange,
  viewInput,
  onApplyFiltersClick,
  onExportClick,
  addVehicleHref,
  addVehicleLabel = "Add vehicle(s)",
  soldInventoryHref,
  soldInventoryLabel = "Sold Inventory",
  quickChips,
  showOverflowMenu = false,
  moreMenuExtras,
}: Max2InventoryListHeaderProps) {
  const sync = syncLabel ?? defaultSyncLabel()

  const hints = React.useMemo(
    () => (searchHintRotation ?? []).map((s) => s.trim()).filter(Boolean),
    [searchHintRotation]
  )

  const [hintIndex, setHintIndex] = React.useState(0)
  const [searchFocused, setSearchFocused] = React.useState(false)
  const [reducedMotion, setReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const useAnimatedHints = hints.length > 0 && !reducedMotion
  const showHintOverlay =
    useAnimatedHints && searchValue.length === 0 && !searchFocused

  React.useEffect(() => {
    setHintIndex(0)
  }, [hints.join("|")])

  React.useEffect(() => {
    if (!useAnimatedHints || hints.length <= 1) return
    const id = window.setInterval(() => {
      setHintIndex((i) => (i + 1) % hints.length)
    }, 3000)
    return () => window.clearInterval(id)
  }, [useAnimatedHints, hints.length])

  const searchAriaLabel =
    hints.length > 0
      ? `Search vehicles. You can search by: ${hints.map((h) => h.replace(/…/g, "")).join(", ")}`
      : searchPlaceholder

  const inputPlaceholder =
    hints.length === 0
      ? searchPlaceholder
      : reducedMotion
        ? hints[0] ?? searchPlaceholder
        : showHintOverlay
          ? ""
          : searchPlaceholder

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-end",
          showSyncStatus ? "sm:justify-between" : ""
        )}
      >
        <SpyneLineTabStrip embedded className="min-w-0 flex-1">
          {TAB_DEFS.map((tab) => {
            const active = vehicleType === tab.id
            const n = tab.id === "all" ? counts.all : tab.id === "new" ? counts.new : counts.used
            return (
              <SpyneLineTab key={tab.id} active={active} onClick={() => onVehicleTypeChange(tab.id)}>
                <span className={spyneComponentClasses.lineTabLabelWithCount}>
                  {tab.label}
                  <SpyneLineTabInlineCount value={n} />
                </span>
              </SpyneLineTab>
            )
          })}
        </SpyneLineTabStrip>
        {showSyncStatus ? (
          <div className="flex items-center gap-2 text-xs font-medium text-spyne-success shrink-0 pb-0">
            <MaterialSymbol name="cloud_done" size={20} className="shrink-0 text-spyne-success" />
            <span>{sync}</span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="relative min-w-[min(100%,160px)] w-full max-w-[220px] sm:shrink-0">
          <MaterialSymbol
            name="search"
            size={16}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-spyne-text-secondary"
          />
          <Input
            placeholder={inputPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            aria-label={searchAriaLabel}
            className="h-9 rounded-md border-spyne-border bg-white pl-8 pr-3 text-[13px] leading-tight text-spyne-text shadow-none placeholder:text-spyne-text-secondary"
          />
          {showHintOverlay && hints[hintIndex] ? (
            <span
              key={hintIndex}
              className={cn(
                "pointer-events-none absolute left-8 right-3 top-1/2 -translate-y-1/2",
                spyneComponentClasses.inventorySearchHint
              )}
              aria-hidden
            >
              {hints[hintIndex]}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:justify-end sm:ml-auto">
          {viewInput && (
            <label className={cn(spyneComponentClasses.btnSecondaryMd, "cursor-pointer whitespace-nowrap bg-white")}>
              <span>View Input</span>
              <Switch
                checked={viewInput.checked}
                onCheckedChange={viewInput.onCheckedChange}
                className="data-[state=checked]:bg-spyne-primary"
              />
            </label>
          )}

          {onApplyFiltersClick && (
            <button
              type="button"
              onClick={onApplyFiltersClick}
              className={cn(spyneComponentClasses.btnSecondaryMd, "whitespace-nowrap")}
            >
              <MaterialSymbol name="filter_list" size={20} />
              Apply Filters
            </button>
          )}

          {onExportClick && (
            <button
              type="button"
              onClick={onExportClick}
              className={cn(spyneComponentClasses.btnSecondaryMd, "whitespace-nowrap")}
            >
              <MaterialSymbol name="file_export" size={20} />
              Export
            </button>
          )}

          {addVehicleHref && (
            <Link
              href={addVehicleHref}
              className={cn(spyneComponentClasses.btnPrimaryMd, "no-underline whitespace-nowrap")}
            >
              <MaterialSymbol name="add" size={20} />
              {addVehicleLabel}
            </Link>
          )}

          {soldInventoryHref ? (
            <Link
              href={soldInventoryHref}
              className={cn(
                spyneComponentClasses.btnSecondaryMd,
                "no-underline whitespace-nowrap inline-flex items-center gap-1.5"
              )}
            >
              {soldInventoryLabel}
              <MaterialSymbol name="north_east" size={20} className="text-spyne-text-secondary" />
            </Link>
          ) : null}

          {showOverflowMenu ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-spyne-border bg-spyne-surface text-spyne-text transition-colors hover:bg-muted/60"
                  aria-label="More options"
                >
                  <MaterialSymbol name="more_vert" size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Refresh from DMS
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Export view
                </DropdownMenuItem>
                {moreMenuExtras}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      {quickChips ? (
        <div className="flex items-stretch gap-3 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {quickChips}
        </div>
      ) : null}
    </div>
  )
}
