"use client"

import * as React from "react"
import type { MerchandisingVehicle, MediaStatus, PublishStatus } from "@/services/max-2/max-2.types"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import {
  SpyneFilterSheet,
  SpyneFilterFacetSection,
  type SpyneFilterFacetRow,
} from "@/components/max-2/inventory-filter-panel"
import {
  Max2InventoryListHeader,
  type InventoryVehicleType,
} from "@/components/max-2/inventory-list-header"
import { SpyneMetricChip, SpyneRemovableFilterChip } from "@/components/max-2/spyne-ui"
import {
  applyMerchandisingFilters,
  MERCH_LOT_FOCUS_LABELS,
  MERCH_MEDIA_ISSUE_LABELS,
  merchandisingDefaultFilters,
  merchandisingRemovableFilterRowVisible,
  merchandisingTransmissionFromVin,
  inMerchAgeBucket,
  parseMerchLotFocusFromSearchParams,
  parseMerchMediaIssueFromSearchParams,
  type MerchandisingInventoryFilters,
  type MerchAgeBucket,
  type MerchPriceBucket,
  type MerchScoreBucket,
} from "@/lib/merchandising-inventory-filter-apply"

export type { InventoryVehicleType }
export type InventoryFilters = MerchandisingInventoryFilters
export const defaultFilters = merchandisingDefaultFilters

export function applyFilters(
  vehicles: MerchandisingVehicle[],
  filters: MerchandisingInventoryFilters
): MerchandisingVehicle[] {
  return applyMerchandisingFilters(vehicles, filters)
}

const validMediaStatuses = new Set(["real-photos", "clone-photos", "stock-photos", "no-photos"])
const validPublishStatuses = new Set(["live", "pending", "not-published"])

const validLotPriceRangeKeys = new Set([
  "under-15k",
  "15k-25k",
  "25k-35k",
  "35k-50k",
  "50k+",
])

const lotPriceRangeChipLabel: Record<string, string> = {
  "under-15k": "Under $15K",
  "15k-25k": "$15K – $25K",
  "25k-35k": "$25K – $35K",
  "35k-50k": "$35K – $50K",
  "50k+": "$50K+",
}

export function filtersFromSearchParams(
  params: URLSearchParams
): MerchandisingInventoryFilters {
  const f = { ...merchandisingDefaultFilters }

  const vehicleType = params.get("vehicleType")
  if (vehicleType === "new" || vehicleType === "used") {
    f.vehicleType = vehicleType
  }

  /** Same as overview links: `media`, `mediaStatus`, and shorthand values. */
  const mediaRaw = params.get("mediaStatus") ?? params.get("media")
  if (mediaRaw === "needs-real") {
    f.needsRealPhotosOnly = true
  } else if (mediaRaw === "cgi") {
    f.mediaStatuses = ["clone-photos"]
  } else if (mediaRaw && validMediaStatuses.has(mediaRaw)) {
    f.mediaStatuses = [mediaRaw as MediaStatus]
  }

  const publishRaw = params.get("publishStatus") ?? params.get("status")
  if (publishRaw === "unpublished") {
    f.publishStatuses = ["pending", "not-published"]
  } else if (publishRaw && validPublishStatuses.has(publishRaw)) {
    f.publishStatuses = [publishRaw as PublishStatus]
  }

  const ageMinParam = params.get("ageMin")
  const ageMaxParam = params.get("ageMax")
  const ageShorthand = params.get("age")
  const parseAgeInt = (s: string | null): number | null => {
    if (s === null || s === "") return null
    const n = Number(s)
    return Number.isFinite(n) ? n : null
  }
  if (ageMinParam !== null) f.ageMin = parseAgeInt(ageMinParam)
  else if (ageShorthand === "30") {
    f.ageMin = 30
    f.ageMax = null
  }
  if (ageMaxParam !== null) f.ageMax = parseAgeInt(ageMaxParam)

  const scoreMin = params.get("scoreMin")
  if (scoreMin) f.scoreMin = Number(scoreMin) ?? null

  const search = params.get("search")
  if (search) f.search = search

  const vin = params.get("vin")
  if (vin && !f.search) f.search = vin

  if (params.get("desc") === "missing") {
    f.missingDescriptionOnly = true
  }

  f.mediaIssue = parseMerchMediaIssueFromSearchParams(params)

  f.merchFocus = parseMerchLotFocusFromSearchParams(params)

  const bodyType = params.get("bodyType")
  if (bodyType) f.merchBodyType = bodyType

  const priceRange = params.get("priceRange")
  if (priceRange && validLotPriceRangeKeys.has(priceRange)) {
    f.lotPriceRangeKey = priceRange
  }

  return f
}

function facetRows(
  vehicles: MerchandisingVehicle[],
  idFn: (v: MerchandisingVehicle) => string,
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

const mediaLabels: Record<MediaStatus, string> = {
  "real-photos": "Real photos",
  "clone-photos": "Clone photos",
  "stock-photos": "Stock photos",
  "no-photos": "No photos",
}

const publishLabels: Record<PublishStatus, string> = {
  live: "Live",
  pending: "Pending",
  "not-published": "Not published",
}

const ageBucketDefs: { id: MerchAgeBucket; label: string }[] = [
  { id: "0-30", label: "0-30 Days" },
  { id: "31-89", label: "31-89 Days" },
  { id: "90+", label: "90+ Days" },
]

const priceBucketDefs: { id: MerchPriceBucket; label: string }[] = [
  { id: "u20", label: "Under $20K" },
  { id: "20-30", label: "$20K – $30K" },
  { id: "30-40", label: "$30K – $40K" },
  { id: "40+", label: "$40K+" },
]

const scoreBucketDefs: { id: MerchScoreBucket; label: string }[] = [
  { id: "low", label: "Low (<50)" },
  { id: "mid", label: "Medium (50–79)" },
  { id: "high", label: "High (80+)" },
]

const MERCH_SEARCH_HINT_ROTATION: string[] = [
  "Search by VIN…",
  "Search by make or model…",
  "Search by trim…",
]

interface InventoryFilterBarProps {
  filters: MerchandisingInventoryFilters
  onFiltersChange: (filters: MerchandisingInventoryFilters) => void
  allVehicles: MerchandisingVehicle[]
  tabCounts: { all: number; new: number; used: number }
  tableView?: "merchandising" | "lot-view"
}

export function InventoryFilterBar({
  filters,
  onFiltersChange,
  allVehicles,
  tabCounts,
  tableView = "merchandising",
}: InventoryFilterBarProps) {
  const [viewInput, setViewInput] = React.useState(false)
  const [filtersSheetOpen, setFiltersSheetOpen] = React.useState(false)
  const [exportModalOpen, setExportModalOpen] = React.useState(false)

  const update = (partial: Partial<MerchandisingInventoryFilters>) => {
    onFiltersChange({ ...filters, ...partial })
  }

  const hasActiveFilters = merchandisingRemovableFilterRowVisible(filters)

  const tabScoped = React.useMemo(() => {
    let v = [...allVehicles]
    if (filters.vehicleType === "new") v = v.filter((x) => x.isNew)
    else if (filters.vehicleType === "used") v = v.filter((x) => !x.isNew)
    return v
  }, [allVehicles, filters.vehicleType])

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
      if (merchandisingTransmissionFromVin(v.vin) === "manual") manual++
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
        count: tabScoped.filter((v) => inMerchAgeBucket(v.daysInStock, b.id)).length,
      })),
    [tabScoped]
  )

  const mediaRows = React.useMemo((): SpyneFilterFacetRow[] => {
    const order: MediaStatus[] = ["real-photos", "clone-photos", "stock-photos", "no-photos"]
    return order.map((id) => ({
      id,
      label: mediaLabels[id],
      count: tabScoped.filter((v) => v.mediaStatus === id).length,
    }))
  }, [tabScoped])

  const publishRows = React.useMemo((): SpyneFilterFacetRow[] => {
    const order: PublishStatus[] = ["live", "pending", "not-published"]
    return order.map((id) => ({
      id,
      label: publishLabels[id],
      count: tabScoped.filter((v) => v.publishStatus === id).length,
    }))
  }, [tabScoped])

  const priceRows = React.useMemo(
    () =>
      priceBucketDefs.map((b) => ({
        id: b.id,
        label: b.label,
        count: tabScoped.filter((v) => {
          if (b.id === "u20") return v.price < 20000
          if (b.id === "20-30") return v.price >= 20000 && v.price < 30000
          if (b.id === "30-40") return v.price >= 30000 && v.price < 40000
          return v.price >= 40000
        }).length,
      })),
    [tabScoped]
  )

  const scoreRows = React.useMemo(
    () =>
      scoreBucketDefs.map((b) => ({
        id: b.id,
        label: b.label,
        count: tabScoped.filter((v) => {
          if (b.id === "low") return v.listingScore < 50
          if (b.id === "mid") return v.listingScore >= 50 && v.listingScore < 80
          return v.listingScore >= 80
        }).length,
      })),
    [tabScoped]
  )

  // Quick filter counts — media issue cards (matches merchandising tab action items)
  const noPhotosCount      = tabScoped.filter((v) => v.mediaStatus === "no-photos").length
  const under8Count        = tabScoped.filter((v) => v.photoCount > 0 && v.photoCount < 8).length
  const wrongHeroCount     = tabScoped.filter((v) => v.wrongHeroAngle).length
  const no360Count         = tabScoped.filter((v) => !v.has360).length
  const noInteriorCount    = tabScoped.filter((v) => v.incompletePhotoSet && !v.has360).length
  const noExteriorCount    = tabScoped.filter((v) => v.missingWalkaroundVideo).length
  const smartMatchCount    = tabScoped.filter((v) => v.daysInStock > 20 && v.photoCount < 20 && v.photoCount > 0).length
  const qualityCount       = tabScoped.filter((v) => v.hasSunGlare).length
  const nonCompliantCount  = tabScoped.filter((v) => v.wrongHeroAngle && v.hasSunGlare).length

  const chipNoPhotos     = filters.mediaStatuses.length === 1 && filters.mediaStatuses[0] === "no-photos"
  const chipUnder8       = filters.mediaIssue === "under8"
  const chipWrongHero    = filters.mediaIssue === "hero"
  const chipNo360        = filters.mediaIssue === "no360"
  const chipNoInterior   = filters.mediaIssue === "no-interior"
  const chipNoExterior   = filters.mediaIssue === "no-exterior"
  const chipSmartMatch   = filters.mediaIssue === "smart-match"
  const chipQuality      = filters.mediaIssue === "quality"
  const chipNonCompliant = filters.mediaIssue === "non-compliant"

  const toggleNoPhotos     = () => update({ mediaStatuses: chipNoPhotos     ? [] : ["no-photos"], mediaIssue: null })
  const toggleUnder8       = () => update({ mediaIssue: chipUnder8       ? null : "under8",        mediaStatuses: [] })
  const toggleWrongHero    = () => update({ mediaIssue: chipWrongHero    ? null : "hero",           mediaStatuses: [] })
  const toggleNo360        = () => update({ mediaIssue: chipNo360        ? null : "no360",          mediaStatuses: [] })
  const toggleNoInterior   = () => update({ mediaIssue: chipNoInterior   ? null : "no-interior",    mediaStatuses: [] })
  const toggleNoExterior   = () => update({ mediaIssue: chipNoExterior   ? null : "no-exterior",    mediaStatuses: [] })
  const toggleSmartMatch   = () => update({ mediaIssue: chipSmartMatch   ? null : "smart-match",    mediaStatuses: [] })
  const toggleQuality      = () => update({ mediaIssue: chipQuality      ? null : "quality",        mediaStatuses: [] })
  const toggleNonCompliant = () => update({ mediaIssue: chipNonCompliant ? null : "non-compliant",  mediaStatuses: [] })

  // Lot view quick filter counts (derived from MerchandisingVehicle fields)
  const lotRepriceCount   = tabScoped.filter(v => v.daysInStock >= 31 && v.daysInStock <= 45).length
  const lotLiquidateCount = tabScoped.filter(v => v.daysInStock >= 46 && v.daysInStock <= 60).length
  const lotExitNowCount   = tabScoped.filter(v => v.daysInStock > 60).length

  const lotChipAged45    = filters.ageMin === 45 && filters.ageMax === null && filters.ageBuckets.length === 0
  const lotChipSmartCam  = filters.ageMin === 10 && filters.publishStatuses.length === 1 && filters.publishStatuses[0] === "live"
  const lotChipReprice   = filters.ageMin === 31 && filters.ageMax === 45
  const lotChipLiquidate = filters.ageMin === 46 && filters.ageMax === 60
  const lotChipExitNow   = filters.ageMin === 61 && filters.ageMax === null
  const lotChipHighHold  = filters.ageMin === 34 && filters.ageMax === null && filters.ageBuckets.length === 0

  const toggleLotAged45    = () => update(lotChipAged45    ? { ageMin: null, ageMax: null }                              : { ageMin: 45, ageMax: null, ageBuckets: [], publishStatuses: [] })
  const toggleLotSmartCam  = () => update(lotChipSmartCam  ? { ageMin: null, publishStatuses: [] }                      : { ageMin: 10, ageMax: null, ageBuckets: [], publishStatuses: ["live"] })
  const toggleLotReprice   = () => update(lotChipReprice   ? { ageMin: null, ageMax: null }                              : { ageMin: 31, ageMax: 45,   ageBuckets: [], publishStatuses: [] })
  const toggleLotLiquidate = () => update(lotChipLiquidate ? { ageMin: null, ageMax: null }                              : { ageMin: 46, ageMax: 60,   ageBuckets: [], publishStatuses: [] })
  const toggleLotExitNow   = () => update(lotChipExitNow   ? { ageMin: null, ageMax: null }                              : { ageMin: 61, ageMax: null, ageBuckets: [], publishStatuses: [] })
  const toggleLotHighHold  = () => update(lotChipHighHold  ? { ageMin: null, ageMax: null }                              : { ageMin: 34, ageMax: null, ageBuckets: [], publishStatuses: [] })

  const toggleOdometerMissing = () => {
    update({ missingOdometerOnly: !filters.missingOdometerOnly })
  }

  const togglePriceMissing = () => {
    update({ missingPriceOnly: !filters.missingPriceOnly })
  }

  const toggleString = (key: "makes" | "models" | "trims", id: string) => {
    const arr = filters[key]
    update({
      [key]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id],
    })
  }

  const toggleYear = (id: string) => {
    const y = Number(id)
    update({
      years: filters.years.includes(y) ? filters.years.filter((x) => x !== y) : [...filters.years, y],
    })
  }

  const toggleTransmission = (id: string) => {
    const t = id as "manual" | "automatic"
    update({
      transmissions: filters.transmissions.includes(t)
        ? filters.transmissions.filter((x) => x !== t)
        : [...filters.transmissions, t],
    })
  }

  const toggleAgeBucket = (id: string) => {
    const b = id as MerchAgeBucket
    update({
      ageBuckets: filters.ageBuckets.includes(b)
        ? filters.ageBuckets.filter((x) => x !== b)
        : [...filters.ageBuckets, b],
      ageMin: null,
      ageMax: null,
    })
  }

  const toggleMedia = (id: string) => {
    const m = id as MediaStatus
    update({
      mediaStatuses: filters.mediaStatuses.includes(m)
        ? filters.mediaStatuses.filter((x) => x !== m)
        : [...filters.mediaStatuses, m],
    })
  }

  const togglePublish = (id: string) => {
    const p = id as PublishStatus
    update({
      publishStatuses: filters.publishStatuses.includes(p)
        ? filters.publishStatuses.filter((x) => x !== p)
        : [...filters.publishStatuses, p],
    })
  }

  const togglePriceBucket = (id: string) => {
    const b = id as MerchPriceBucket
    update({
      priceBuckets: filters.priceBuckets.includes(b)
        ? filters.priceBuckets.filter((x) => x !== b)
        : [...filters.priceBuckets, b],
      priceMin: null,
      priceMax: null,
    })
  }

  const toggleScoreBucket = (id: string) => {
    const b = id as MerchScoreBucket
    update({
      scoreBuckets: filters.scoreBuckets.includes(b)
        ? filters.scoreBuckets.filter((x) => x !== b)
        : [...filters.scoreBuckets, b],
      scoreMin: null,
    })
  }

  const selectedMakes = new Set(filters.makes)
  const selectedModels = new Set(filters.models)
  const selectedYears = new Set(filters.years.map(String))
  const selectedTrims = new Set(filters.trims)
  const selectedTransmissions = new Set(filters.transmissions)
  const selectedAgeBuckets = new Set(filters.ageBuckets)
  const selectedMedia = new Set(filters.mediaStatuses)
  const selectedPublish = new Set(filters.publishStatuses)
  const selectedPrice = new Set(filters.priceBuckets)
  const selectedScore = new Set(filters.scoreBuckets)

  return (
    <div className="space-y-4" data-view-input={viewInput ? "true" : "false"}>
      <Max2InventoryListHeader
        vehicleType={filters.vehicleType}
        onVehicleTypeChange={(t) => update({ vehicleType: t as InventoryVehicleType })}
        counts={tabCounts}
        showSyncStatus
        searchPlaceholder="Search"
        searchHintRotation={MERCH_SEARCH_HINT_ROTATION}
        searchValue={filters.search}
        onSearchChange={(search) => update({ search })}

        onApplyFiltersClick={() => setFiltersSheetOpen(true)}
        onExportClick={() => setExportModalOpen(true)}
        addVehicleHref="/max-2/studio/add"
        addVehicleLabel="Add vehicle(s)"
        soldInventoryHref="/max-2/studio/sold-inventory"
        quickChips={
          tableView === "lot-view" ? (
            <>
              <QuickFilterCard
                icon="refresh"
                label="Reprice"
                count={lotRepriceCount}
                active={lotChipReprice}
                onClick={toggleLotReprice}
                lotTone="watch"
              />
              <QuickFilterCard
                icon="trending_down"
                label="Liquidate"
                count={lotLiquidateCount}
                active={lotChipLiquidate}
                onClick={toggleLotLiquidate}
                lotTone="urgent"
              />
              <QuickFilterCard
                icon="logout"
                label="Exit Now"
                count={lotExitNowCount}
                active={lotChipExitNow}
                onClick={toggleLotExitNow}
                lotTone="critical"
              />
            </>
          ) : (
            <>
              <QuickFilterCard icon="hide_image"     label="No Photos"               count={noPhotosCount}     active={chipNoPhotos}     onClick={toggleNoPhotos}     />
              <QuickFilterCard icon="photo_library"  label="Less than 8 Media"       count={under8Count}        active={chipUnder8}       onClick={toggleUnder8}       />
              <QuickFilterCard icon="crop_free"      label="Missing Hero Angle"      count={wrongHeroCount}     active={chipWrongHero}    onClick={toggleWrongHero}    />
              <QuickFilterCard icon="360"            label="Generate 360 Spin"       count={no360Count}         active={chipNo360}        onClick={toggleNo360}        />
              <QuickFilterCard icon="weekend"        label="Missing Interior Photos" count={noInteriorCount}    active={chipNoInterior}   onClick={toggleNoInterior}   />
              <QuickFilterCard icon="directions_car" label="Missing Exterior Photos" count={noExteriorCount}    active={chipNoExterior}   onClick={toggleNoExterior}   />
              <QuickFilterCard icon="camera_enhance" label="Smart Match Shoot"       count={smartMatchCount}    active={chipSmartMatch}   onClick={toggleSmartMatch}   />
              <QuickFilterCard icon="broken_image"   label="Image Quality Issues"    count={qualityCount}       active={chipQuality}      onClick={toggleQuality}      />
              <QuickFilterCard icon="gpp_bad"        label="Non-Compliant Media"     count={nonCompliantCount}  active={chipNonCompliant} onClick={toggleNonCompliant} />
            </>
          )
        }
      />

      <ExportInventoryModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        vehicles={allVehicles}
        selectedCount={0}
      />

      <SpyneFilterSheet
        open={filtersSheetOpen}
        onOpenChange={setFiltersSheetOpen}
        onClearFilters={() => onFiltersChange(merchandisingDefaultFilters)}
        onShowResults={() => setFiltersSheetOpen(false)}
        clearLabel="Clear Filters"
        applyLabel="Show Vehicles"
      >
        <SpyneFilterFacetSection
          title="Make"
          rows={makeRows}
          selectedIds={selectedMakes}
          onToggle={(id) => toggleString("makes", id)}
        />
        <SpyneFilterFacetSection
          title="Model"
          rows={modelRows}
          selectedIds={selectedModels}
          onToggle={(id) => toggleString("models", id)}
        />
        <SpyneFilterFacetSection
          title="Year"
          rows={yearRows}
          selectedIds={selectedYears}
          onToggle={toggleYear}
        />
        <SpyneFilterFacetSection
          title="Trim"
          rows={trimRows}
          selectedIds={selectedTrims}
          onToggle={(id) => toggleString("trims", id)}
        />
        <SpyneFilterFacetSection
          title="Transmission"
          rows={transmissionRows}
          selectedIds={selectedTransmissions}
          onToggle={toggleTransmission}
        />
        <SpyneFilterFacetSection
          title="Age"
          rows={ageBucketRows}
          selectedIds={selectedAgeBuckets}
          onToggle={toggleAgeBucket}
        />
        <SpyneFilterFacetSection
          title="Media"
          rows={mediaRows}
          selectedIds={selectedMedia}
          onToggle={toggleMedia}
        />
        <SpyneFilterFacetSection
          title="Publish status"
          rows={publishRows}
          selectedIds={selectedPublish}
          onToggle={togglePublish}
        />
        <SpyneFilterFacetSection
          title="Price"
          rows={priceRows}
          selectedIds={selectedPrice}
          onToggle={togglePriceBucket}
        />
        <SpyneFilterFacetSection
          title="Listing score"
          rows={scoreRows}
          selectedIds={selectedScore}
          onToggle={toggleScoreBucket}
        />
      </SpyneFilterSheet>

      {hasActiveFilters && (
        <div className="flex w-full min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {filters.search.trim() !== "" && (
            <RemovableChip
              label={`Search: ${filters.search.trim()}`}
              onRemove={() => update({ search: "" })}
            />
          )}
          {filters.vehicleType !== "all" && (
            <RemovableChip
              label={filters.vehicleType === "new" ? "Type: New" : "Type: Used"}
              onRemove={() => update({ vehicleType: "all" })}
            />
          )}
          {filters.mediaIssue && (
            <RemovableChip
              label={MERCH_MEDIA_ISSUE_LABELS[filters.mediaIssue]}
              onRemove={() => update({ mediaIssue: null })}
            />
          )}
          {filters.needsRealPhotosOnly && (
            <RemovableChip
              label="Needs real photos"
              onRemove={() => update({ needsRealPhotosOnly: false })}
            />
          )}
          {filters.missingDescriptionOnly && (
            <RemovableChip
              label="Description missing"
              onRemove={() => update({ missingDescriptionOnly: false })}
            />
          )}
          {filters.makes.map((m) => (
            <RemovableChip key={m} label={`Make: ${m}`} onRemove={() => toggleString("makes", m)} />
          ))}
          {filters.models.map((m) => (
            <RemovableChip key={m} label={`Model: ${m}`} onRemove={() => toggleString("models", m)} />
          ))}
          {filters.years.map((y) => (
            <RemovableChip
              key={y}
              label={`Year: ${y}`}
              onRemove={() => toggleYear(String(y))}
            />
          ))}
          {filters.trims.map((t) => (
            <RemovableChip key={t} label={`Trim: ${t}`} onRemove={() => toggleString("trims", t)} />
          ))}
          {filters.transmissions.map((t) => (
            <RemovableChip
              key={t}
              label={t === "manual" ? "Transmission: Manual" : "Transmission: Automatic"}
              onRemove={() => toggleTransmission(t)}
            />
          ))}
          {filters.ageBuckets.map((b) => (
            <RemovableChip
              key={b}
              label={`Age: ${b}`}
              onRemove={() => toggleAgeBucket(b)}
            />
          ))}
          {filters.mediaStatuses.map((m) => (
            <RemovableChip
              key={m}
              label={`Media: ${mediaLabels[m]}`}
              onRemove={() => toggleMedia(m)}
            />
          ))}
          {filters.publishStatuses.map((p) => (
            <RemovableChip
              key={p}
              label={`Status: ${publishLabels[p]}`}
              onRemove={() => togglePublish(p)}
            />
          ))}
          {filters.priceBuckets.map((p) => (
            <RemovableChip
              key={p}
              label={`Price: ${priceBucketDefs.find((d) => d.id === p)?.label ?? p}`}
              onRemove={() => togglePriceBucket(p)}
            />
          ))}
          {filters.scoreBuckets.map((s) => (
            <RemovableChip
              key={s}
              label={`Score: ${scoreBucketDefs.find((d) => d.id === s)?.label ?? s}`}
              onRemove={() => toggleScoreBucket(s)}
            />
          ))}
          {filters.ageMin !== null && (
            <RemovableChip label={`Age ≥ ${filters.ageMin}d`} onRemove={() => update({ ageMin: null })} />
          )}
          {filters.ageMax !== null && (
            <RemovableChip label={`Age ≤ ${filters.ageMax}d`} onRemove={() => update({ ageMax: null })} />
          )}
          {filters.priceMin !== null && (
            <RemovableChip
              label={`Price ≥ $${filters.priceMin.toLocaleString()}`}
              onRemove={() => update({ priceMin: null })}
            />
          )}
          {filters.priceMax !== null && (
            <RemovableChip
              label={`Price ≤ $${filters.priceMax.toLocaleString()}`}
              onRemove={() => update({ priceMax: null })}
            />
          )}
          {filters.scoreMin !== null && (
            <RemovableChip
              label={`Score ≥ ${filters.scoreMin}`}
              onRemove={() => update({ scoreMin: null })}
            />
          )}
          {filters.missingOdometerOnly && (
            <RemovableChip
              label="Odometer missing"
              onRemove={() => update({ missingOdometerOnly: false })}
            />
          )}
          {filters.missingPriceOnly && (
            <RemovableChip
              label="Price missing"
              onRemove={() => update({ missingPriceOnly: false })}
            />
          )}
          {filters.merchFocus && (
            <RemovableChip
              label={MERCH_LOT_FOCUS_LABELS[filters.merchFocus]}
              onRemove={() => update({ merchFocus: null })}
            />
          )}
          {filters.merchBodyType && (
            <RemovableChip
              label={`Body: ${filters.merchBodyType}`}
              onRemove={() => update({ merchBodyType: null })}
            />
          )}
          {filters.lotPriceRangeKey && (
            <RemovableChip
              label={`Price: ${lotPriceRangeChipLabel[filters.lotPriceRangeKey] ?? filters.lotPriceRangeKey}`}
              onRemove={() => update({ lotPriceRangeKey: null })}
            />
          )}
          </div>
          <button
            type="button"
            className="shrink-0 text-sm font-medium text-spyne-primary hover:text-spyne-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spyne-primary"
            onClick={() => onFiltersChange(merchandisingDefaultFilters)}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}

const ALL_EXPORT_COLUMNS = [
  { id: "vin", label: "VIN" },
  { id: "vehicleName", label: "Vehicle Name" },
  { id: "stockId", label: "SKU ID" },
  { id: "productName", label: "Product Name" },
  { id: "price", label: "Price" },
  { id: "regNum", label: "Reg Num" },
  { id: "make", label: "Make" },
  { id: "model", label: "Model" },
  { id: "year", label: "Year" },
  { id: "trim", label: "Trim" },
  { id: "odometer", label: "Odometer" },
  { id: "bodyStyle", label: "Body Style" },
  { id: "fuelType", label: "Fuel Type" },
  { id: "daysInStock", label: "Days in Stock" },
  { id: "listingScore", label: "Media Score" },
  { id: "publishStatus", label: "Publish Status" },
]

const DEFAULT_SELECTED_COLS = ["vin", "vehicleName", "stockId", "productName", "price", "regNum"]

const EXPORT_FORMATS = [
  { id: "csv", label: "CSV (.csv)" },
  { id: "excel", label: "Excel (.xlsx)" },
  { id: "pdf", label: "PDF (.pdf)" },
]

function buildCsvRow(v: MerchandisingVehicle, cols: string[]): string {
  const stockNumber = v.stockNumber ?? `STK${v.vin.slice(-4)}`
  const val = (id: string): string => {
    switch (id) {
      case "vin":         return v.vin
      case "vehicleName": return `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ""}`
      case "stockId":     return stockNumber
      case "productName": return `${v.make} ${v.model}`
      case "price":       return String(v.price)
      case "regNum":      return ""
      case "make":        return v.make
      case "model":       return v.model
      case "year":        return String(v.year)
      case "trim":        return v.trim
      case "odometer":    return String(v.odometer)
      case "bodyStyle":   return v.bodyStyle ?? ""
      case "fuelType":    return v.fuelType ?? ""
      case "daysInStock": return String(v.daysInStock)
      case "listingScore":   return String((v.listingScore / 10).toFixed(1))
      case "publishStatus":  return v.publishStatus
      default: return ""
    }
  }
  return cols.map((c) => `"${val(c).replace(/"/g, '""')}"`).join(",")
}

function downloadCsv(vehicles: MerchandisingVehicle[], cols: string[], colDefs: typeof ALL_EXPORT_COLUMNS) {
  const header = cols.map((id) => colDefs.find((c) => c.id === id)?.label ?? id).join(",")
  const rows = vehicles.map((v) => buildCsvRow(v, cols))
  const csv = [header, ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `inventory-export-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function ExportInventoryModal({
  open,
  onOpenChange,
  vehicles,
  selectedCount,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  vehicles: MerchandisingVehicle[]
  selectedCount: number
}) {
  const [selectedCols, setSelectedCols] = React.useState<string[]>(DEFAULT_SELECTED_COLS)
  const [dropdownOpen, setDropdownOpen] = React.useState(false)

  const removeCol = (id: string) => setSelectedCols((prev) => prev.filter((c) => c !== id))
  const addCol = (id: string) => {
    if (!selectedCols.includes(id)) setSelectedCols((prev) => [...prev, id])
    setDropdownOpen(false)
  }

  const exportCount = selectedCount > 0 ? selectedCount : vehicles.length
  const availableToAdd = ALL_EXPORT_COLUMNS.filter((c) => !selectedCols.includes(c.id))
  const selectedColDefs = selectedCols.map((id) => ALL_EXPORT_COLUMNS.find((c) => c.id === id)!).filter(Boolean)

  const handleDownload = () => {
    downloadCsv(vehicles, selectedCols, ALL_EXPORT_COLUMNS)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl [&>button]:hidden">
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-spyne-border px-6 py-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-100">
            <MaterialSymbol name="file_export" size={28} className="text-green-600" />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <h2 className="text-lg font-semibold text-gray-900">
              Export Inventory ({exportCount})
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {selectedCount > 0
                ? `Exporting ${selectedCount} selected vehicles.`
                : "Select the data to export from your inventory."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-muted hover:text-gray-600"
            aria-label="Close"
          >
            <MaterialSymbol name="close" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Column selector */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-900">Select columns to export</p>

            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg border border-spyne-border bg-white px-4 py-2.5 text-sm text-gray-400 transition-colors hover:bg-muted/40"
              >
                <span>Select more columns from dropdown</span>
                <MaterialSymbol name="keyboard_arrow_down" size={20} className={cn("transition-transform", dropdownOpen && "rotate-180")} />
              </button>
              {dropdownOpen && availableToAdd.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-spyne-border bg-white shadow-lg">
                  {availableToAdd.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => addCol(col.id)}
                      className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-muted/60 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedColDefs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedColDefs.map((col) => (
                  <span
                    key={col.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-spyne-primary px-3 py-1 text-sm font-medium text-spyne-primary"
                  >
                    {col.label}
                    <button
                      type="button"
                      onClick={() => removeCol(col.id)}
                      aria-label={`Remove ${col.label}`}
                      className="flex items-center text-spyne-primary/70 hover:text-spyne-primary"
                    >
                      <MaterialSymbol name="close" size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Format + Download */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">Export as:</p>
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  defaultValue="csv"
                  className="h-11 appearance-none rounded-lg border border-spyne-border bg-white pl-4 pr-9 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-spyne-primary/30"
                >
                  {EXPORT_FORMATS.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
                <MaterialSymbol name="keyboard_arrow_down" size={18} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 rounded-lg bg-spyne-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--spyne-primary-hover)]"
              >
                Start download
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Matches `Max2ActionTab` lot bucket accents (aging strip on the left). */
const LOT_QUICK_TONE_CLASS = {
  watch: "shadow-[inset_3px_0_0_0_var(--spyne-warning)]",
  urgent: "shadow-[inset_4px_0_0_0_var(--spyne-warning)]",
  critical: "shadow-[inset_4px_0_0_0_var(--spyne-error)]",
} as const

export function QuickFilterCard({
  icon,
  label,
  count,
  active,
  onClick,
  lotTone,
}: {
  icon: string
  label: string
  count: number
  active: boolean
  onClick: () => void
  /** Lot inventory buckets: same card shell as merchandising, color-coded strip + count line. */
  lotTone?: keyof typeof LOT_QUICK_TONE_CLASS
}) {
  const countLineClass =
    lotTone === "watch" || lotTone === "urgent"
      ? cn(
          "text-[12px] font-medium text-spyne-warning-ink",
          lotTone === "urgent" && "font-semibold",
        )
      : lotTone === "critical"
        ? "text-[12px] font-medium text-spyne-error"
        : "text-[12px] font-medium text-spyne-error"

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-[140px] flex-col gap-2 rounded-xl border bg-white px-4 py-3 text-left transition-colors hover:bg-muted/40 shrink-0",
        active ? "border-spyne-primary border-2" : "border-spyne-border",
        lotTone != null && LOT_QUICK_TONE_CLASS[lotTone],
      )}
    >
      <MaterialSymbol
        name={icon}
        size={20}
        className={cn(active ? "text-spyne-primary" : "text-gray-400")}
      />
      <span className={cn("text-[13px] font-semibold leading-tight", active ? "text-spyne-primary" : "text-gray-800")}>
        {label}
      </span>
      <span className={countLineClass}>
        {count} vehicles →
      </span>
    </button>
  )
}

function RemovableChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return <SpyneRemovableFilterChip compact={false} label={label} onRemove={onRemove} />
}
