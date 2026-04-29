"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import { VehicleMediaTable } from "@/components/max-2/studio/vehicle-media-table"
import {
  InventoryFilterBar,
  applyFilters,
  filtersFromSearchParams,
} from "@/components/max-2/studio/inventory-filters"
import {
  applyMerchMediaIssueToSearchParams,
  merchandisingFiltersActive,
  type MerchandisingInventoryFilters,
} from "@/lib/merchandising-inventory-filter-apply"
import { max2Classes, max2Layout, spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneSegmentedControl, SpyneSegmentedButton } from "@/components/max-2/spyne-toolbar-controls"

type TableView = "lot-view" | "merchandising"

function InventoryContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [filters, setFilters] = React.useState(() =>
    filtersFromSearchParams(searchParams)
  )
  const [tableView, setTableView] = React.useState<TableView>("merchandising")
  const filtersRef = React.useRef(filters)
  filtersRef.current = filters

  React.useEffect(() => {
    setFilters(filtersFromSearchParams(searchParams))
  }, [searchParams])

  const handleFiltersChange = React.useCallback(
    (next: MerchandisingInventoryFilters) => {
      const prevIssue = filtersRef.current.mediaIssue
      setFilters(next)
      if (!merchandisingFiltersActive(next)) {
        router.replace(pathname, { scroll: false })
        return
      }
      if (prevIssue === next.mediaIssue) return
      const params = applyMerchMediaIssueToSearchParams(searchParams, next.mediaIssue)
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  const allVehicles = mockMerchandisingVehicles
  const filtered = applyFilters(allVehicles, filters)

  const tabCounts = {
    all: allVehicles.length,
    new: allVehicles.filter((v) => v.isNew).length,
    used: allVehicles.filter((v) => !v.isNew).length,
  }

  return (
    <div className={cn(max2Layout.pageStack)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={max2Classes.pageTitle}>Active Inventory</h1>
          <p className={max2Classes.pageDescription}>
            Search, filter, and fix media and publishing issues across your merchandising pipeline.
          </p>
        </div>

        <SpyneSegmentedControl aria-label="Table view" className={spyneComponentClasses.segmentedLg}>
          <SpyneSegmentedButton active={tableView === "merchandising"} onClick={() => setTableView("merchandising")}>
            <MaterialSymbol name="photo_camera" size={20} className="text-current" />
            Merchandising
          </SpyneSegmentedButton>
          <SpyneSegmentedButton active={tableView === "lot-view"} onClick={() => setTableView("lot-view")}>
            <MaterialSymbol name="directions_car" size={20} className="text-current" />
            Lot View
          </SpyneSegmentedButton>
        </SpyneSegmentedControl>
      </div>

      <InventoryFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        allVehicles={allVehicles}
        tabCounts={tabCounts}
        tableView={tableView}
      />

      <VehicleMediaTable
        vehicles={filtered}
        tableView={tableView}
        vehicleType={filters.vehicleType}
        merchandisingIssueContext={
          // Merchandising view contexts
          filters.mediaIssue === "incomplete" ? "incomplete-photo-set"
          : filters.mediaIssue === "no360"    ? "no-360"
          : filters.mediaIssue === "hero"     ? "hero"
          : filters.mediaIssue === "under8"   ? "under8"
          : filters.mediaIssue === "glare"    ? "glare"
          // Lot view chip contexts (derived from ageMin/ageMax/publishStatuses)
          : tableView === "lot-view" && filters.ageMin === 61                                                              ? "lot-exit-now"
          : tableView === "lot-view" && filters.ageMin === 46 && filters.ageMax === 60                                     ? "lot-liquidate"
          : tableView === "lot-view" && filters.ageMin === 45                                                              ? "lot-aged"
          : tableView === "lot-view" && filters.ageMin === 34                                                              ? "lot-high-holding"
          : tableView === "lot-view" && filters.ageMin === 31 && filters.ageMax === 45                                     ? "lot-reprice"
          : tableView === "lot-view" && filters.ageMin === 10 && filters.publishStatuses?.includes("live")                 ? "lot-smart-campaign"
          : "default"
        }
      />
    </div>
  )
}

export default function ActiveInventoryPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <p className="text-sm text-spyne-text-secondary">Loading inventory…</p>
        </div>
      }
    >
      <InventoryContent />
    </React.Suspense>
  )
}
