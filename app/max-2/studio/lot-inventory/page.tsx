"use client"

import * as React from "react"
import { useHoldingCostRateOptional } from "@/components/max-2/holding-cost-rate-context"
import type { LotStatus, LotVehicle, PricingPosition } from "@/services/max-2/max-2.types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RotateCcw, Camera, TrendingDown, Tag, Send, ChevronRight } from "lucide-react"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneSegmentedControl, SpyneSegmentedButton } from "@/components/max-2/spyne-toolbar-controls"
import { useSearchParams } from "next/navigation"
import {
  max2Classes,
  max2Layout,
  spyneComponentClasses,
  spyneLotStatusChipPreset,
  spyneLotStatusOrder,
  spynePricingPositionChipPreset,
  spynePricingPositionOrder,
} from "@/lib/design-system/max-2"
import {
  SpyneDismissibleChip,
  SpyneLotStatusChip,
  SpyneMetricChip,
  SpynePricingPositionChip,
} from "@/components/max-2/spyne-ui"
import { Max2InventoryListHeader, type InventoryVehicleType } from "@/components/max-2/inventory-list-header"
import {
  SpyneFilterSheet,
  SpyneFilterFacetSection,
  type SpyneFilterFacetRow,
} from "@/components/max-2/inventory-filter-panel"
import {
  applyLotInventoryFilters,
  lotInventoryDefaultFilters,
  lotInventoryFiltersActive,
  lotTransmissionFromVin,
  inLotAgeBucket,
  isNewLotVehicle,
  type LotInventoryFilters,
  type LotAgeBucket,
} from "@/lib/lot-inventory-filter-apply"
import { issueLabelForLotVehicle } from "@/lib/inventory-issue-label"
import { lotVehicleToMerchandising } from "@/lib/lot-vehicle-to-merchandising"
import { MerchandisingInventoryActionCta } from "@/components/max-2/studio/merchandising-inventory-action-cta"
import { StudioInventorySortIcon } from "@/components/max-2/studio/studio-inventory-sort-icon"
import { QuickFilterCard } from "@/components/max-2/studio/inventory-filters"

const MODEL_TO_BODY: Record<string, string> = {
  "F-150": "Truck", "Silverado": "Truck",
  "RAV4": "SUV", "Q5": "SUV", "CX-5": "SUV", "Equinox": "SUV",
  "Sportage": "SUV", "Tucson": "SUV", "Forester": "SUV",
  "3 Series": "Sedan", "Altima": "Sedan", "Sonata": "Sedan",
  "Corolla": "Sedan", "Civic": "Sedan", "Camry": "Sedan",
}

const fmt$ = (n: number) => `$${n.toLocaleString()}`

type SortField =
  | "daysInStock"
  | "listPrice"
  | "totalHoldingCost"
  | "photoCount"
  | "vdpViews"
  | "leads"
type SortDir = "asc" | "desc"

const DEFAULT_SORT_FIELD: SortField = "daysInStock"
const DEFAULT_SORT_DIR: SortDir = "desc"
type TableView = "lot-view" | "merchandising"

const priceRangeDefs: { id: string; label: string }[] = [
  { id: "under-15k", label: "Under $15K" },
  { id: "15k-25k", label: "$15K – $25K" },
  { id: "25k-35k", label: "$25K – $35K" },
  { id: "35k-50k", label: "$35K – $50K" },
  { id: "50k+", label: "$50K+" },
]

const ageBucketDefs: { id: LotAgeBucket; label: string }[] = [
  { id: "0-30", label: "0-30 Days" },
  { id: "31-89", label: "31-89 Days" },
  { id: "90+", label: "90+ Days" },
]

const LOT_SEARCH_HINT_ROTATION: string[] = [
  "Search by VIN…",
  "Search by stock #…",
  "Search by make or model…",
  "Search by color…",
]

function facetRows(
  vehicles: LotVehicle[],
  idFn: (v: LotVehicle) => string,
  labelFn: (id: string) => string = (id) => id
): SpyneFilterFacetRow[] {
  const m = new Map<string, number>()
  for (const v of vehicles) {
    const id = idFn(v)
    m.set(id, (m.get(id) ?? 0) + 1)
  }
  return [...m.entries()].map(([id, count]) => ({
    id,
    label: labelFn(id),
    count,
  }))
}

function LotInventoryContent() {
  const { vehicles: lotVehicles } = useHoldingCostRateOptional()
  const searchParams = useSearchParams()
  const currentYear = new Date().getFullYear()

  const [vehicleTypeTab, setVehicleTypeTab] = React.useState<InventoryVehicleType>("all")
  const [viewInput, setViewInput] = React.useState(false)
  const [filtersSheetOpen, setFiltersSheetOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [lotFilters, setLotFilters] = React.useState<LotInventoryFilters>(() => {
    const base = { ...lotInventoryDefaultFilters }
    const st = searchParams.get("status")
    if (st && spyneLotStatusOrder.includes(st as LotStatus)) {
      base.lotStatuses = [st as LotStatus]
    }
    const bt = searchParams.get("bodyType")
    if (bt) base.bodyTypes = [bt]
    return base
  })

  const [sortField, setSortField] = React.useState<SortField>(DEFAULT_SORT_FIELD)
  /** `null` = table default (days in stock, descending); otherwise user-chosen sort. */
  const [sortDir, setSortDir] = React.useState<SortDir | null>(null)
  const [tableView, setTableView] = React.useState<TableView>("merchandising")
  const [quickBucket, setQuickBucket] = React.useState<"reprice" | "liquidate" | "exit-now" | null>(null)

  const tabCounts = React.useMemo(() => {
    const all = lotVehicles.length
    const nNew = lotVehicles.filter((v) => isNewLotVehicle(v, currentYear)).length
    return { all, new: nNew, used: all - nNew }
  }, [currentYear, lotVehicles])

  const tabScoped = React.useMemo(() => {
    let v = [...lotVehicles]
    if (vehicleTypeTab === "new") v = v.filter((x) => isNewLotVehicle(x, currentYear))
    if (vehicleTypeTab === "used") v = v.filter((x) => !isNewLotVehicle(x, currentYear))
    return v
  }, [vehicleTypeTab, currentYear, lotVehicles])

  const buckets = React.useMemo(() => {
    const reprice = tabScoped.filter((v) => v.daysInStock >= 31 && v.daysInStock <= 45 && v.lotStatus === "frontline")
    const liquidate = tabScoped.filter((v) => v.daysInStock >= 46 && v.daysInStock <= 60 && v.lotStatus !== "sold-pending")
    const exitNow = tabScoped.filter((v) => v.daysInStock > 60 && v.lotStatus !== "sold-pending")
    return { reprice: reprice.length, liquidate: liquidate.length, exitNow: exitNow.length }
  }, [tabScoped])

  const hasActiveFilters =
    search !== "" || lotInventoryFiltersActive(lotFilters) || quickBucket !== null

  const resetFilters = () => {
    setSearch("")
    setLotFilters(lotInventoryDefaultFilters)
    setQuickBucket(null)
  }

  const updateLot = (partial: Partial<LotInventoryFilters>) => {
    setLotFilters((prev) => ({ ...prev, ...partial }))
  }

  const toggleWholesaleChip = () => {
    const active =
      lotFilters.lotStatuses.length === 1 &&
      lotFilters.lotStatuses[0] === "wholesale-candidate"
    if (active) updateLot({ lotStatuses: [] })
    else updateLot({ lotStatuses: ["wholesale-candidate"] })
  }

  const toggleRetailChip = () => {
    const active =
      lotFilters.lotStatuses.length === 1 && lotFilters.lotStatuses[0] === "frontline"
    if (active) updateLot({ lotStatuses: [] })
    else updateLot({ lotStatuses: ["frontline"] })
  }

  const toggleSort = (field: SortField) => {
    if (sortDir !== null && sortField === field) {
      if (sortDir === "asc") setSortDir("desc")
      else {
        setSortField(DEFAULT_SORT_FIELD)
        setSortDir(null)
      }
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase()
    let rows = applyLotInventoryFilters(
      lotVehicles,
      lotFilters,
      MODEL_TO_BODY,
      vehicleTypeTab,
      currentYear
    )
    if (q) {
      rows = rows.filter((v) =>
        [v.make, v.model, v.stockNumber, v.vin, v.trim, v.color].some((f) =>
          f.toLowerCase().includes(q)
        )
      )
    }
    if (quickBucket === "reprice") rows = rows.filter((v) => v.daysInStock >= 31 && v.daysInStock <= 45 && v.lotStatus === "frontline")
    if (quickBucket === "liquidate") rows = rows.filter((v) => v.daysInStock >= 46 && v.daysInStock <= 60 && v.lotStatus !== "sold-pending")
    if (quickBucket === "exit-now") rows = rows.filter((v) => v.daysInStock > 60 && v.lotStatus !== "sold-pending")
    const effField = sortDir === null ? DEFAULT_SORT_FIELD : sortField
    const effDir = sortDir === null ? DEFAULT_SORT_DIR : sortDir
    return [...rows].sort((a, b) => {
      const aVal = a[effField] as number
      const bVal = b[effField] as number
      return effDir === "asc" ? aVal - bVal : bVal - aVal
    })
  }, [search, lotFilters, sortField, sortDir, vehicleTypeTab, currentYear, lotVehicles, quickBucket])

  const makeRows = React.useMemo(
    () => facetRows(tabScoped, (v) => v.make),
    [tabScoped]
  )
  const modelRows = React.useMemo(
    () => facetRows(tabScoped, (v) => v.model),
    [tabScoped]
  )
  const yearRows = React.useMemo(
    () => facetRows(tabScoped, (v) => String(v.year)),
    [tabScoped]
  )
  const trimRows = React.useMemo(
    () => facetRows(tabScoped, (v) => v.trim),
    [tabScoped]
  )
  const transmissionRows = React.useMemo((): SpyneFilterFacetRow[] => {
    let manual = 0
    let auto = 0
    for (const v of tabScoped) {
      if (lotTransmissionFromVin(v.vin) === "manual") manual++
      else auto++
    }
    return [
      { id: "manual", label: "Manual", count: manual },
      { id: "automatic", label: "Automatic", count: auto },
    ]
  }, [tabScoped])

  const ageBucketRows = React.useMemo(
    () =>
      ageBucketDefs.map((b) => ({
        id: b.id,
        label: b.label,
        count: tabScoped.filter((v) => inLotAgeBucket(v.daysInStock, b.id)).length,
      })),
    [tabScoped]
  )

  const statusRows = React.useMemo(
    () =>
      spyneLotStatusOrder.map((id) => ({
        id,
        label: spyneLotStatusChipPreset[id].label,
        count: tabScoped.filter((v) => v.lotStatus === id).length,
      })),
    [tabScoped]
  )

  const pricingRows = React.useMemo(
    () =>
      spynePricingPositionOrder.map((id) => ({
        id,
        label: spynePricingPositionChipPreset[id].label,
        count: tabScoped.filter((v) => v.pricingPosition === id).length,
      })),
    [tabScoped]
  )

  const priceRangeRows = React.useMemo(
    () =>
      priceRangeDefs.map((b) => ({
        id: b.id,
        label: b.label,
        count: tabScoped.filter((v) => {
          if (b.id === "under-15k") return v.listPrice < 15000
          if (b.id === "15k-25k") return v.listPrice >= 15000 && v.listPrice < 25000
          if (b.id === "25k-35k") return v.listPrice >= 25000 && v.listPrice < 35000
          if (b.id === "35k-50k") return v.listPrice >= 35000 && v.listPrice < 50000
          return v.listPrice >= 50000
        }).length,
      })),
    [tabScoped]
  )

  const bodyTypes = React.useMemo(
    () => [...new Set(Object.values(MODEL_TO_BODY))].sort(),
    [],
  )
  const bodyRows = React.useMemo(
    () =>
      bodyTypes.map((id) => ({
        id,
        label: id,
        count: tabScoped.filter((v) => MODEL_TO_BODY[v.model] === id).length,
      })),
    [tabScoped, bodyTypes]
  )

  const leadRows: SpyneFilterFacetRow[] = React.useMemo(
    () => [
      {
        id: "has-leads",
        label: "Has leads",
        count: tabScoped.filter((v) => v.leads > 0).length,
      },
      {
        id: "no-leads",
        label: "No leads",
        count: tabScoped.filter((v) => v.leads === 0).length,
      },
    ],
    [tabScoped]
  )

  const photoRows: SpyneFilterFacetRow[] = React.useMemo(
    () => [
      {
        id: "has-real-photos",
        label: "Real photos",
        count: tabScoped.filter((v) => v.hasRealPhotos).length,
      },
      {
        id: "no-real-photos",
        label: "No real photos",
        count: tabScoped.filter((v) => !v.hasRealPhotos).length,
      },
      {
        id: "missing",
        label: "No / stock photos",
        count: tabScoped.filter((v) => !v.hasRealPhotos || v.photoCount === 0).length,
      },
    ],
    [tabScoped]
  )

  const toggleString = (key: "makes" | "models" | "trims", id: string) => {
    const arr = lotFilters[key]
    updateLot({
      [key]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id],
    })
  }

  const toggleYear = (id: string) => {
    const y = Number(id)
    updateLot({
      years: lotFilters.years.includes(y)
        ? lotFilters.years.filter((x) => x !== y)
        : [...lotFilters.years, y],
    })
  }

  const toggleTransmission = (id: string) => {
    const t = id as "manual" | "automatic"
    updateLot({
      transmissions: lotFilters.transmissions.includes(t)
        ? lotFilters.transmissions.filter((x) => x !== t)
        : [...lotFilters.transmissions, t],
    })
  }

  const toggleAgeBucket = (id: string) => {
    const b = id as LotAgeBucket
    updateLot({
      ageBuckets: lotFilters.ageBuckets.includes(b)
        ? lotFilters.ageBuckets.filter((x) => x !== b)
        : [...lotFilters.ageBuckets, b],
    })
  }

  const toggleLotStatus = (id: string) => {
    const s = id as LotStatus
    updateLot({
      lotStatuses: lotFilters.lotStatuses.includes(s)
        ? lotFilters.lotStatuses.filter((x) => x !== s)
        : [...lotFilters.lotStatuses, s],
    })
  }

  const togglePricing = (id: string) => {
    const p = id as PricingPosition
    updateLot({
      pricingPositions: lotFilters.pricingPositions.includes(p)
        ? lotFilters.pricingPositions.filter((x) => x !== p)
        : [...lotFilters.pricingPositions, p],
    })
  }

  const togglePriceRange = (id: string) => {
    updateLot({
      priceRangeKeys: lotFilters.priceRangeKeys.includes(id)
        ? lotFilters.priceRangeKeys.filter((x) => x !== id)
        : [...lotFilters.priceRangeKeys, id],
    })
  }

  const toggleBody = (id: string) => {
    updateLot({
      bodyTypes: lotFilters.bodyTypes.includes(id)
        ? lotFilters.bodyTypes.filter((x) => x !== id)
        : [...lotFilters.bodyTypes, id],
    })
  }

  const toggleLead = (id: string) => {
    const m = id as "has-leads" | "no-leads"
    updateLot({
      leadModes: lotFilters.leadModes.includes(m)
        ? lotFilters.leadModes.filter((x) => x !== m)
        : [...lotFilters.leadModes, m],
    })
  }

  const togglePhoto = (id: string) => {
    const m = id as "has-real-photos" | "no-real-photos" | "missing"
    updateLot({
      photoModes: lotFilters.photoModes.includes(m)
        ? lotFilters.photoModes.filter((x) => x !== m)
        : [...lotFilters.photoModes, m],
    })
  }

  return (
    <div className={cn(max2Layout.pageStack)}>
      <div>
        <h1 className={max2Classes.pageTitle}>Lot Inventory</h1>
        <p className={max2Classes.pageDescription}>
          Filter by lot status, age, and pricing. Drill into units that need action.
        </p>
      </div>

      <Max2InventoryListHeader
        vehicleType={vehicleTypeTab}
        onVehicleTypeChange={setVehicleTypeTab}
        counts={tabCounts}
        searchPlaceholder="Search"
        searchHintRotation={LOT_SEARCH_HINT_ROTATION}
        searchValue={search}
        onSearchChange={setSearch}
        viewInput={{ checked: viewInput, onCheckedChange: setViewInput }}
        onApplyFiltersClick={() => setFiltersSheetOpen(true)}
        addVehicleHref="/max-2/studio/add"
        addVehicleLabel="Add Vehicle"
        showOverflowMenu
        quickChips={
          <>
            <QuickFilterCard
              icon="refresh"
              label="Reprice"
              count={buckets.reprice}
              active={quickBucket === "reprice"}
              onClick={() => setQuickBucket(quickBucket === "reprice" ? null : "reprice")}
              lotTone="watch"
            />
            <QuickFilterCard
              icon="trending_down"
              label="Liquidate"
              count={buckets.liquidate}
              active={quickBucket === "liquidate"}
              onClick={() => setQuickBucket(quickBucket === "liquidate" ? null : "liquidate")}
              lotTone="urgent"
            />
            <QuickFilterCard
              icon="logout"
              label="Exit Now"
              count={buckets.exitNow}
              active={quickBucket === "exit-now"}
              onClick={() => setQuickBucket(quickBucket === "exit-now" ? null : "exit-now")}
              lotTone="critical"
            />
          </>
        }
      />

      <SpyneFilterSheet
        open={filtersSheetOpen}
        onOpenChange={setFiltersSheetOpen}
        onClearFilters={resetFilters}
        onShowResults={() => setFiltersSheetOpen(false)}
        clearLabel="Clear Filters"
        applyLabel="Show Vehicles"
      >
        <SpyneFilterFacetSection
          title="Make"
          rows={makeRows}
          selectedIds={new Set(lotFilters.makes)}
          onToggle={(id) => toggleString("makes", id)}
        />
        <SpyneFilterFacetSection
          title="Model"
          rows={modelRows}
          selectedIds={new Set(lotFilters.models)}
          onToggle={(id) => toggleString("models", id)}
        />
        <SpyneFilterFacetSection
          title="Year"
          rows={yearRows}
          selectedIds={new Set(lotFilters.years.map(String))}
          onToggle={toggleYear}
        />
        <SpyneFilterFacetSection
          title="Trim"
          rows={trimRows}
          selectedIds={new Set(lotFilters.trims)}
          onToggle={(id) => toggleString("trims", id)}
        />
        <SpyneFilterFacetSection
          title="Transmission"
          rows={transmissionRows}
          selectedIds={new Set(lotFilters.transmissions)}
          onToggle={toggleTransmission}
        />
        <SpyneFilterFacetSection
          title="Age"
          rows={ageBucketRows}
          selectedIds={new Set(lotFilters.ageBuckets)}
          onToggle={toggleAgeBucket}
        />
        <SpyneFilterFacetSection
          title="Lot status"
          rows={statusRows}
          selectedIds={new Set(lotFilters.lotStatuses)}
          onToggle={toggleLotStatus}
        />
        <SpyneFilterFacetSection
          title="Pricing vs market"
          rows={pricingRows}
          selectedIds={new Set(lotFilters.pricingPositions)}
          onToggle={togglePricing}
        />
        <SpyneFilterFacetSection
          title="Price range"
          rows={priceRangeRows}
          selectedIds={new Set(lotFilters.priceRangeKeys)}
          onToggle={togglePriceRange}
        />
        <SpyneFilterFacetSection
          title="Body type"
          rows={bodyRows}
          selectedIds={new Set(lotFilters.bodyTypes)}
          onToggle={toggleBody}
        />
        <SpyneFilterFacetSection
          title="Leads"
          rows={leadRows}
          selectedIds={new Set(lotFilters.leadModes)}
          onToggle={toggleLead}
        />
        <SpyneFilterFacetSection
          title="Photos"
          rows={photoRows}
          selectedIds={new Set(lotFilters.photoModes)}
          onToggle={togglePhoto}
        />
      </SpyneFilterSheet>

      <Card className="shadow-none gap-0" data-view-input={viewInput ? "true" : "false"}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>All Vehicles</CardTitle>
              <CardDescription>
                {filtered.length} of {lotVehicles.length} vehicles
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
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
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={resetFilters}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-1">
          {hasActiveFilters && (
            <div className="mb-4 flex w-full min-w-0 items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              {search && (
                <SpyneDismissibleChip
                  ariaLabel="Remove search filter"
                  onDismiss={() => setSearch("")}
                >
                  &ldquo;{search}&rdquo;
                </SpyneDismissibleChip>
              )}
              {lotFilters.recentsOnly && (
                <SpyneDismissibleChip
                  ariaLabel="Remove recents filter"
                  onDismiss={() => updateLot({ recentsOnly: false })}
                >
                  Recents (≤7 days)
                </SpyneDismissibleChip>
              )}
              {lotFilters.agedOver40 && (
                <SpyneDismissibleChip
                  ariaLabel="Remove age over 40 days filter"
                  onDismiss={() => updateLot({ agedOver40: false })}
                >
                  Age &gt; 40 days
                </SpyneDismissibleChip>
              )}
              {lotFilters.makes.map((m) => (
                <SpyneDismissibleChip
                  key={m}
                  ariaLabel={`Remove make filter ${m}`}
                  onDismiss={() => toggleString("makes", m)}
                >
                  Make: {m}
                </SpyneDismissibleChip>
              ))}
              {lotFilters.models.map((m) => (
                <SpyneDismissibleChip
                  key={m}
                  ariaLabel={`Remove model filter ${m}`}
                  onDismiss={() => toggleString("models", m)}
                >
                  Model: {m}
                </SpyneDismissibleChip>
              ))}
              {lotFilters.years.map((y) => (
                <SpyneDismissibleChip
                  key={y}
                  ariaLabel={`Remove year filter ${y}`}
                  onDismiss={() => toggleYear(String(y))}
                >
                  Year: {y}
                </SpyneDismissibleChip>
              ))}
              {lotFilters.trims.map((t) => (
                <SpyneDismissibleChip
                  key={t}
                  ariaLabel={`Remove trim filter ${t}`}
                  onDismiss={() => toggleString("trims", t)}
                >
                  Trim: {t}
                </SpyneDismissibleChip>
              ))}
              {lotFilters.transmissions.map((t) => (
                <SpyneDismissibleChip
                  key={t}
                  ariaLabel={`Remove transmission filter ${t}`}
                  onDismiss={() => toggleTransmission(t)}
                >
                  {t === "manual" ? "Manual" : "Automatic"}
                </SpyneDismissibleChip>
              ))}
              {lotFilters.ageBuckets.map((b) => (
                <SpyneDismissibleChip
                  key={b}
                  ariaLabel={`Remove age bucket ${b}`}
                  onDismiss={() => toggleAgeBucket(b)}
                >
                  Age: {b}
                </SpyneDismissibleChip>
              ))}
              {lotFilters.lotStatuses.map((s) => (
                <SpyneDismissibleChip
                  key={s}
                  ariaLabel={`Remove lot status ${spyneLotStatusChipPreset[s].label}`}
                  onDismiss={() => toggleLotStatus(s)}
                >
                  {spyneLotStatusChipPreset[s].label}
                </SpyneDismissibleChip>
              ))}
              {lotFilters.pricingPositions.map((p) => (
                <SpyneDismissibleChip
                  key={p}
                  ariaLabel={`Remove pricing filter ${spynePricingPositionChipPreset[p].label}`}
                  onDismiss={() => togglePricing(p)}
                >
                  {spynePricingPositionChipPreset[p].label}
                </SpyneDismissibleChip>
              ))}
              {lotFilters.priceRangeKeys.map((k) => (
                <SpyneDismissibleChip
                  key={k}
                  ariaLabel={`Remove price range filter ${k}`}
                  onDismiss={() => togglePriceRange(k)}
                >
                  {priceRangeDefs.find((d) => d.id === k)?.label ?? k}
                </SpyneDismissibleChip>
              ))}
              {lotFilters.bodyTypes.map((b) => (
                <SpyneDismissibleChip
                  key={b}
                  ariaLabel={`Remove body type ${b}`}
                  onDismiss={() => toggleBody(b)}
                >
                  Body: {b}
                </SpyneDismissibleChip>
              ))}
              {lotFilters.leadModes.map((l) => (
                <SpyneDismissibleChip
                  key={l}
                  ariaLabel={`Remove lead filter ${l}`}
                  onDismiss={() => toggleLead(l)}
                >
                  {l === "has-leads" ? "Has leads" : "No leads"}
                </SpyneDismissibleChip>
              ))}
              {lotFilters.photoModes.map((p) => (
                <SpyneDismissibleChip
                  key={p}
                  ariaLabel={`Remove photo filter ${p}`}
                  onDismiss={() => togglePhoto(p)}
                >
                  {p === "has-real-photos" ? "Real photos" : p === "no-real-photos" ? "No real photos" : "No/stock photos"}
                </SpyneDismissibleChip>
              ))}
              </div>
              <button
                type="button"
                className="shrink-0 text-sm font-medium text-spyne-primary hover:text-spyne-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spyne-primary"
                onClick={resetFilters}
              >
                Clear all
              </button>
            </div>
          )}

          {tableView === "lot-view" ? (
            <div className="overflow-x-auto">
              <table className={spyneComponentClasses.studioInventoryTable}>
                <thead>
                  <tr className={spyneComponentClasses.studioInventoryTableHeaderRow}>
                    <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Stock #</th>
                    <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Vehicle</th>
                    <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Color</th>
                    <th
                      className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellRight, "cursor-pointer select-none")}
                      onClick={() => toggleSort("listPrice")}
                    >
                      <span className="inline-flex w-full items-center justify-end gap-1.5">
                        <span>List Price</span>
                        <StudioInventorySortIcon
                          active={sortDir !== null && sortField === "listPrice"}
                          direction={sortDir ?? "asc"}
                        />
                      </span>
                    </th>
                    <th
                      className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellRight, "cursor-pointer select-none")}
                      onClick={() => toggleSort("daysInStock")}
                    >
                      <span className="inline-flex w-full items-center justify-end gap-1.5">
                        <span>Days</span>
                        <StudioInventorySortIcon
                          active={sortDir !== null && sortField === "daysInStock"}
                          direction={sortDir ?? "asc"}
                        />
                      </span>
                    </th>
                    <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Pricing</th>
                    <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Status</th>
                    <th
                      className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellRight, "cursor-pointer select-none")}
                      onClick={() => toggleSort("totalHoldingCost")}
                    >
                      <span className="inline-flex w-full items-center justify-end gap-1.5">
                        <span>Hold Cost</span>
                        <StudioInventorySortIcon
                          active={sortDir !== null && sortField === "totalHoldingCost"}
                          direction={sortDir ?? "asc"}
                        />
                      </span>
                    </th>
                    <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => {
                    const isAged = v.daysInStock >= 45
                    const issue = issueLabelForLotVehicle(v)
                    const issueAccent = issue.tone === "warning" || issue.tone === "danger"

                    // Lot-view CTA logic
                    let ctaLabel = "View Details"
                    let ctaVariant: "default" | "outline" | "destructive" = "outline"
                    if (v.pricingPosition === "above-market") {
                      ctaLabel = "Price Drop"
                      ctaVariant = "destructive"
                    } else if (isAged && v.lotStatus === "frontline") {
                      ctaLabel = "Send to Wholesale"
                      ctaVariant = "outline"
                    } else if (v.lotStatus === "in-recon") {
                      ctaLabel = "Check Recon"
                      ctaVariant = "outline"
                    }

                    return (
                      <tr key={v.vin} className={spyneComponentClasses.studioInventoryTableRow}>
                        <td
                          className={cn(
                            spyneComponentClasses.studioInventoryTableCell,
                            "text-sm text-muted-foreground tabular-nums",
                            (isAged || issueAccent) && spyneComponentClasses.overviewIssueRowAccent,
                          )}
                        >
                          {v.stockNumber}
                        </td>
                        <td className={cn(spyneComponentClasses.studioInventoryTableCell, "font-medium whitespace-nowrap")}>
                          {v.year} {v.make} {v.model} {v.trim}
                        </td>
                        <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-muted-foreground whitespace-nowrap")}>{v.color}</td>
                        <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-right tabular-nums")}>{fmt$(v.listPrice)}</td>
                        <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-right tabular-nums font-semibold", isAged && "text-spyne-error")}>
                          {v.daysInStock}
                        </td>
                        <td className={spyneComponentClasses.studioInventoryTableCell}>
                          <SpynePricingPositionChip pricingPosition={v.pricingPosition} compact />
                        </td>
                        <td className={spyneComponentClasses.studioInventoryTableCell}>
                          <SpyneLotStatusChip status={v.lotStatus} compact />
                        </td>
                        <td className={cn(
                          spyneComponentClasses.studioInventoryTableCell,
                          "text-right tabular-nums font-semibold",
                          v.totalHoldingCost >= 2000 ? "text-spyne-error" : v.totalHoldingCost >= 1000 ? "text-spyne-text" : "text-muted-foreground",
                        )}>
                          {fmt$(v.totalHoldingCost)}
                        </td>
                        <td className={spyneComponentClasses.studioInventoryTableCell}>
                          <Button
                            size="sm"
                            variant={ctaVariant === "destructive" ? "destructive" : "outline"}
                            className={cn(
                              "h-7 text-xs px-2.5 gap-1",
                              ctaVariant === "outline" && "border-spyne-border text-spyne-text hover:bg-muted/60",
                            )}
                          >
                            {ctaLabel === "Price Drop" && <TrendingDown className="h-3 w-3" />}
                            {ctaLabel === "Send to Wholesale" && <Send className="h-3 w-3" />}
                            {ctaLabel === "Check Recon" && <Tag className="h-3 w-3" />}
                            {ctaLabel === "View Details" && <ChevronRight className="h-3 w-3" />}
                            {ctaLabel}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-muted-foreground">
                        No vehicles match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={spyneComponentClasses.studioInventoryTable}>
                <thead>
                  <tr className={spyneComponentClasses.studioInventoryTableHeaderRow}>
                    <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Stock #</th>
                    <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Vehicle</th>
                    <th
                      className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellRight, "cursor-pointer select-none")}
                      onClick={() => toggleSort("photoCount")}
                    >
                      <span className="inline-flex w-full items-center justify-end gap-1.5">
                        <span>Photos</span>
                        <StudioInventorySortIcon
                          active={sortDir !== null && sortField === "photoCount"}
                          direction={sortDir ?? "asc"}
                        />
                      </span>
                    </th>
                    <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Real Photos</th>
                    <th
                      className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellRight, "cursor-pointer select-none")}
                      onClick={() => toggleSort("vdpViews")}
                    >
                      <span className="inline-flex w-full items-center justify-end gap-1.5">
                        <span>VDP Views</span>
                        <StudioInventorySortIcon
                          active={sortDir !== null && sortField === "vdpViews"}
                          direction={sortDir ?? "asc"}
                        />
                      </span>
                    </th>
                    <th
                      className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellRight, "cursor-pointer select-none")}
                      onClick={() => toggleSort("leads")}
                    >
                      <span className="inline-flex w-full items-center justify-end gap-1.5">
                        <span>Leads</span>
                        <StudioInventorySortIcon
                          active={sortDir !== null && sortField === "leads"}
                          direction={sortDir ?? "asc"}
                        />
                      </span>
                    </th>
                    <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Last Lead</th>
                    <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => {
                    const lastLead = v.lastLeadDate
                      ? new Date(v.lastLeadDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "—"

                    return (
                      <tr key={v.vin} className={spyneComponentClasses.studioInventoryTableRow}>
                        <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-sm text-muted-foreground tabular-nums")}>
                          {v.stockNumber}
                        </td>
                        <td className={cn(spyneComponentClasses.studioInventoryTableCell, "font-medium whitespace-nowrap")}>
                          {v.year} {v.make} {v.model} {v.trim}
                        </td>
                        <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-right tabular-nums")}>
                          <span className={cn(
                            "font-semibold",
                            v.photoCount === 0 ? "text-spyne-error" : v.photoCount < 4 ? "text-spyne-warning-ink" : "text-spyne-text",
                          )}>
                            {v.photoCount}
                          </span>
                        </td>
                        <td className={spyneComponentClasses.studioInventoryTableCell}>
                          {v.hasRealPhotos ? (
                            <span className="flex items-center gap-1 text-sm font-medium text-spyne-success">
                              <Camera className="h-3.5 w-3.5" />
                              Real
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-spyne-warning-ink">Stock only</span>
                          )}
                        </td>
                        <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-right tabular-nums")}>
                          <span className={cn(
                            "font-semibold",
                            v.vdpViews < 10 ? "text-muted-foreground" : "text-spyne-text",
                          )}>
                            {v.vdpViews}
                          </span>
                        </td>
                        <td className={cn(
                          spyneComponentClasses.studioInventoryTableCell,
                          "text-right tabular-nums font-semibold",
                          v.leads === 0 ? "text-spyne-error" : "text-spyne-text",
                        )}>
                          {v.leads}
                        </td>
                        <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-xs text-muted-foreground whitespace-nowrap")}>
                          {lastLead}
                        </td>
                        <td className={spyneComponentClasses.studioInventoryTableCell}>
                          <MerchandisingInventoryActionCta
                            v={lotVehicleToMerchandising(v)}
                            size="md"
                            ui="shadcn-outline"
                          />
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">
                        No vehicles match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function LotInventoryPage() {
  return (
    <React.Suspense fallback={null}>
      <LotInventoryContent />
    </React.Suspense>
  )
}
