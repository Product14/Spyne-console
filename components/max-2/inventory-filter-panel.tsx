"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { max2Classes, spyneComponentClasses } from "@/lib/design-system/max-2"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Sheet, SheetContent } from "@/components/ui/sheet"

const VISIBLE_FACET_ROWS = 4

export type SpyneFilterFacetRow = {
  id: string
  label: string
  count: number
}

export function SpyneFilterSheet({
  open,
  onOpenChange,
  onClearFilters,
  onShowResults,
  clearLabel = "Clear Filters",
  applyLabel = "Show Vehicles",
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClearFilters: () => void
  onShowResults: () => void
  clearLabel?: string
  applyLabel?: string
  children: React.ReactNode
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          spyneComponentClasses.filterPanelRoot,
          "flex h-full max-h-[100dvh] min-h-0 w-full flex-col gap-0 border-spyne-border p-0 overflow-hidden sm:max-w-md",
          "[&>button.absolute]:hidden"
        )}
      >
        {/*
          Sheet portals to document.body, outside layout’s Max2SpyneScope. Spyne filter
          rules in globals.css are `.max2-spyne .spyne-filter-*` — re-scope so they apply.
          flex-1 min-h-0 so the scrollable body gets a bounded height (Radix Sheet is flex-col).
        */}
        <div
          className={cn(
            max2Classes.spyneScope,
            "flex min-h-0 flex-1 flex-col overflow-hidden",
          )}
        >
          <div className={spyneComponentClasses.filterPanel}>
            <div className={spyneComponentClasses.filterPanelHeader}>
              <div className={spyneComponentClasses.filterPanelTitle}>
                <MaterialSymbol name="tune" size={24} className="text-spyne-text" />
                <span>Filters</span>
              </div>
              <button
                type="button"
                className={spyneComponentClasses.filterPanelClose}
                onClick={() => onOpenChange(false)}
                aria-label="Close filters"
              >
                <MaterialSymbol name="close" size={24} />
              </button>
            </div>

            <div className={spyneComponentClasses.filterPanelBody}>{children}</div>

            <div className={spyneComponentClasses.filterPanelFooter}>
              <button
                type="button"
                className={cn(spyneComponentClasses.btnSecondaryMd, "min-w-0 flex-1")}
                onClick={onClearFilters}
              >
                {clearLabel}
              </button>
              <button
                type="button"
                className={cn(spyneComponentClasses.btnPrimaryMd, "min-w-0 flex-1")}
                onClick={onShowResults}
              >
                {applyLabel}
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function SpyneFilterFacetSection({
  title,
  rows,
  selectedIds,
  onToggle,
  visibleCount = VISIBLE_FACET_ROWS,
  defaultOpen = true,
}: {
  title: string
  rows: SpyneFilterFacetRow[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  visibleCount?: number
  defaultOpen?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [showAll, setShowAll] = React.useState(false)

  const sorted = React.useMemo(
    () => [...rows].filter((r) => r.count > 0).sort((a, b) => a.label.localeCompare(b.label)),
    [rows],
  )

  const hiddenCount = Math.max(0, sorted.length - visibleCount)
  const displayed = showAll || hiddenCount === 0 ? sorted : sorted.slice(0, visibleCount)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={spyneComponentClasses.filterSection}>
      <CollapsibleTrigger asChild>
        <button type="button" className={spyneComponentClasses.filterSectionTrigger}>
          <span>{title}</span>
          <MaterialSymbol
            name="expand_less"
            size={20}
            className={cn(
              "text-spyne-text-secondary transition-transform shrink-0",
              !open && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pb-1">
          {displayed.map((row) => (
            <label
              key={row.id}
              className={cn(spyneComponentClasses.filterOption, "cursor-pointer")}
            >
              <Checkbox
                checked={selectedIds.has(row.id)}
                onCheckedChange={() => onToggle(row.id)}
              />
              <span className="text-sm text-spyne-text font-normal">{row.label}</span>
              <span className={spyneComponentClasses.filterOptionCount}>({row.count})</span>
            </label>
          ))}
          {hiddenCount > 0 && !showAll && (
            <button
              type="button"
              className={spyneComponentClasses.filterMore}
              onClick={() => setShowAll(true)}
            >
              +{hiddenCount} MORE
            </button>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
