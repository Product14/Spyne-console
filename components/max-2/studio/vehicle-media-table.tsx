"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import type { MerchandisingVehicle } from "@/services/max-2/max-2.types"
import { formatVinForDisplay } from "@/lib/inventory-vin"
import { cn } from "@/lib/utils"
import { spyneComponentClasses, spyneDarkTooltipTokens } from "@/lib/design-system/max-2"
import { SpyneDarkTooltipPanel } from "@/components/max-2/spyne-ui"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { Checkbox } from "@/components/ui/checkbox"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { soldVehiclesStore } from "@/lib/sold-vehicles-store"
import {
  STUDIO_HOLDING_COST_PER_DAY,
  issueLabelForStudioInventoryLotView,
  issueLabelForStudioInventoryMerchandisingOverview,
  allIssueLabelsForMerchandisingOverview,
  type InventoryIssueDisplay,
  type MerchandisingOverviewIssueContext,
} from "@/lib/inventory-issue-label"
import { MerchandisingInventoryActionCta } from "@/components/max-2/studio/merchandising-inventory-action-cta"
import { merchandisingInventoryDetailHref, merchandisingInventoryPrimaryIsViewMore } from "@/lib/inventory-table-action-cta"
import { StudioInventorySortIcon } from "@/components/max-2/studio/studio-inventory-sort-icon"
import { CopyOnClickIdentifier } from "@/components/max-2/copy-on-click-identifier"
import { MerchandisingMediaPipelineCell } from "@/components/max-2/studio/merchandising-media-pipeline-cell"
import { merchandisingInstantMediaEligible } from "@/components/max-2/studio/merchandising-action-pitch-banners"
import { isMerchandisingNoPhotosVehicle, merchandisingDemoThumbnailSrc } from "@/lib/demo-vehicle-hero-images"
import { StudioInventoryVehicleThumb } from "@/components/max-2/studio/studio-inventory-vehicle-thumb"
import { holdingCostFigma } from "@/lib/holding-cost-figma-tokens"
import { TrendingDown } from "lucide-react"

/**
 * When labels exceed this budget, show 2 issues with +N on the 2nd row instead of 3 rows + +N on the 3rd.
 */
const MERCH_ISSUES_THREE_LINE_MAX_COMBINED = 70
const MERCH_ISSUES_THREE_LINE_MAX_SINGLE = 26

function planMerchInventoryIssueColumnLayout(issueRows: InventoryIssueDisplay[]): {
  line1?: InventoryIssueDisplay
  line2?: InventoryIssueDisplay
  line3?: InventoryIssueDisplay
  extraIssueLabels: string[]
  moreIssuesCount: number
} {
  const n = issueRows.length
  if (n === 0) {
    return { extraIssueLabels: [], moreIssuesCount: 0 }
  }
  if (n <= 2) {
    return {
      line1: issueRows[0],
      line2: issueRows[1],
      extraIssueLabels: [],
      moreIssuesCount: 0,
    }
  }
  const combined3 = issueRows.slice(0, 3).reduce((a, i) => a + i.label.length, 0)
  const maxLen3 = Math.max(...issueRows.slice(0, 3).map((i) => i.label.length))
  const fitsThreeIssueRows =
    combined3 <= MERCH_ISSUES_THREE_LINE_MAX_COMBINED && maxLen3 <= MERCH_ISSUES_THREE_LINE_MAX_SINGLE

  if (fitsThreeIssueRows) {
    return {
      line1: issueRows[0],
      line2: issueRows[1],
      line3: issueRows[2],
      extraIssueLabels: issueRows.slice(3).map((i) => i.label),
      moreIssuesCount: n - 3,
    }
  }
  return {
    line1: issueRows[0],
    line2: issueRows[1],
    extraIssueLabels: issueRows.slice(2).map((i) => i.label),
    moreIssuesCount: n - 2,
  }
}

function merchandisingIssueLabelClassName(iss: InventoryIssueDisplay) {
  return cn(
    "min-w-0 text-sm font-medium",
    iss.tone === "danger" && "text-spyne-error",
    iss.tone === "warning" && "text-spyne-warning-ink",
    iss.tone === "neutral" && "text-muted-foreground",
  )
}

function IssuesOverflowCountButton({ count, lines }: { count: number; lines: string[] }) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
        <button
          type="button"
          className="shrink-0 whitespace-nowrap rounded px-0.5 text-sm font-semibold tabular-nums text-muted-foreground underline decoration-dotted decoration-muted-foreground/60 underline-offset-2 hover:text-spyne-text"
          onClick={(e) => e.stopPropagation()}
          aria-label={`${count} more issues`}
        >
          +{count}
        </button>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side="top"
          align="start"
          sideOffset={8}
          className={spyneComponentClasses.darkTooltipRadixContent}
        >
          <SpyneDarkTooltipPanel title="Additional issues" lines={lines} />
          <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={14} height={7} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price)
}

function estimatedFrontGrossForMerch(v: MerchandisingVehicle): number {
  if (v.estimatedFrontGross != null && v.estimatedFrontGross > 0) return v.estimatedFrontGross
  return Math.max(600, Math.round(v.price * 0.088))
}

function holdingUtilizedPctLabel(holdingAccumulated: number, grossMargin: number): string {
  if (grossMargin <= 0) return "—"
  return `${Math.round((holdingAccumulated / grossMargin) * 100)}%`
}

/** Holding cost as % of estimated front gross (margin); null when margin is unknown or non-positive. */
function holdingCostPctOfMargin(holdingAccumulated: number, grossMargin: number): number | null {
  if (grossMargin <= 0) return null
  return (holdingAccumulated / grossMargin) * 100
}

/**
 * Resolution hints aligned with Lot View issue buckets (reprice, liquidate, Smart Campaign, exit, high holding).
 */
function merchandisingHoldingResolutions(
  v: MerchandisingVehicle,
  holdingAccum: number,
  estGross: number,
): string[] {
  const days = v.daysInStock
  const pctOfGross = estGross > 0 ? (holdingAccum / estGross) * 100 : 0
  const live = v.publishStatus === "live"
  const actions: string[] = []

  if (days > 60) {
    actions.push("Exit now: wholesale or auction")
  } else if (days >= 46) {
    actions.push("Liquidate: deep reprice or wholesale")
  } else if (days >= 45) {
    actions.push("Reprice or liquidate (aged 45+ days)")
  } else if (days >= 31 && days <= 44 && live) {
    actions.push("Reprice to competitive market (31–45 day window)")
  }

  if (live && days >= 10 && v.vdpViews < 45) {
    actions.push("Run Smart Campaign to lift VDP views")
  }

  if (holdingAccum >= 1500 || pctOfGross >= 12) {
    actions.push("High holding cost: prioritize sale or reprice")
  }

  if (actions.length === 0) {
    if (days >= 16) {
      actions.push("Monitor pricing before the 31-day repricing window")
    } else {
      actions.push("On track: keep photos and price competitive")
    }
  }

  return [...new Set(actions)].slice(0, 5)
}


function formatMiles(n: number): string {
  return new Intl.NumberFormat("en-US").format(n)
}

function stockLabel(v: MerchandisingVehicle): string {
  if (v.stockNumber) return v.stockNumber
  const n = v.vin.replace(/\D/g, "")
  return n ? `STK${n.slice(0, 3)}` : `STK${v.vin.slice(0, 3)}`
}

/** Lines for the dark vehicle-spec tooltip (identifiers, pricing, odometer, optional DMS fields). */
function merchandisingVehicleSpecLines(v: MerchandisingVehicle): string[] {
  const lines: string[] = [
    `Stock: ${stockLabel(v)}`,
    `VIN: ${formatVinForDisplay(v.vin)}`,
    `Price: ${formatPrice(v.price)}`,
    `Condition: ${v.isNew ? "New" : "Pre-owned"}`,
    `Days in stock: ${v.daysInStock}`,
    `Odometer: ${formatMiles(v.odometer)} mi`,
  ]
  if (v.listingExternalId) {
    lines.splice(2, 0, `Listing ID: ${v.listingExternalId}`)
  }
  if (v.combinedMpg != null && v.combinedMpg > 0) {
    lines.push(`Fuel mileage (EPA combined): ${v.combinedMpg} MPG`)
  }
  if (v.bodyStyle) lines.push(`Body style: ${v.bodyStyle}`)
  if (v.exteriorColor) lines.push(`Exterior: ${v.exteriorColor}`)
  if (v.fuelType) lines.push(`Fuel type: ${v.fuelType}`)
  return lines
}

function listingCorrelationId(v: MerchandisingVehicle): string {
  if (v.listingExternalId) return v.listingExternalId
  const raw = `${v.vin}STUDIO`.toUpperCase().replace(/[^A-Z0-9]/g, "")
  const chunk = raw + raw
  return chunk.slice(0, 16)
}

function formatInventoryCreatedDateLine(v: MerchandisingVehicle): string {
  if (v.inventoryCreatedAt) {
    const d = new Date(v.inventoryCreatedAt)
    if (!Number.isNaN(d.getTime())) {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(d)
    }
  }
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - v.daysInStock)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d)
}

function formatSyncTooltipTimestamp(iso: string | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d)
  const compact = formatted.replace(/\s(am|pm)$/i, (_, m: string) => m.toLowerCase())
  return `Last published: ${compact}`
}

const PUBLISH_VAUTO_BADGE_SRC = "/max-2/publish-vauto-badge.png"

/**
 * Left / top / bottom inset match so the platform mark sits evenly; label stays `text-xs` like `badgePillInline`.
 * Right padding slightly wider for the text end.
 */
const publishStateBadgeShell =
  "inline-flex shrink-0 items-center whitespace-nowrap rounded-full pl-1.5 py-1.5 pr-2.5 text-xs font-medium gap-1.5"

/** Vauto-style circular mark: full color when live, grayscale when not published (or pending). */
function PublishPlatformBadgeIcon({ live }: { live: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex aspect-square h-6 w-6 shrink-0 overflow-hidden rounded-full",
        !live && "grayscale",
      )}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={PUBLISH_VAUTO_BADGE_SRC} alt="" className="h-full w-full object-cover" />
    </span>
  )
}

function SyncStatusTooltipContent({ lastPublishedAt }: { lastPublishedAt?: string }) {
  const sub = formatSyncTooltipTimestamp(lastPublishedAt)
  return (
    <div className={spyneComponentClasses.darkTooltipPanel}>
      <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-[var(--spyne-on-dark-text)]">
        <MaterialSymbol name="sync" size={20} className="text-[var(--spyne-on-dark-text)]" />
        <span>Sync Status</span>
      </div>
      <div className={cn("mb-2", spyneComponentClasses.darkTooltipInnerWell)}>
        <div className="grid grid-cols-2 gap-3">
          <span className={spyneComponentClasses.darkTooltipSectionLabel}>Platform</span>
          <span className={spyneComponentClasses.darkTooltipSectionLabel}>Status</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 items-start gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[var(--spyne-on-dark-text)]"
              style={{ background: "var(--spyne-chip-orange)" }}
              aria-hidden
            >
              V
            </span>
            <span className="font-medium text-[var(--spyne-on-dark-text)]">Vauto</span>
          </div>
          <div className="min-w-0 text-left">
            <div className="font-medium text-[var(--spyne-on-dark-text)]">Published</div>
            {sub ? <div className={cn("mt-0.5", spyneComponentClasses.darkTooltipMeta)}>{sub}</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function PublishStateBadge({ v }: { v: MerchandisingVehicle }) {
  const { publishStatus: status } = v

  if (status === "live") {
    const chip = (
      <span
        className={cn(
          "cursor-default",
          publishStateBadgeShell,
          spyneComponentClasses.badgeSuccess,
        )}
      >
        <PublishPlatformBadgeIcon live />
        Published
      </span>
    )
    return (
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild onClick={(e) => e.stopPropagation()}>
          {chip}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            sideOffset={10}
            className={spyneComponentClasses.darkTooltipRadixContent}
          >
            <SyncStatusTooltipContent lastPublishedAt={v.lastPublishedAt ?? v.listingUpdatedAt} />
            <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={14} height={7} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    )
  }
  if (status === "pending") {
    return (
      <span
        className={cn(publishStateBadgeShell, spyneComponentClasses.badgeInfo)}
      >
        <PublishPlatformBadgeIcon live={false} />
        Pending
      </span>
    )
  }
  return (
    <span
      className={cn(publishStateBadgeShell, spyneComponentClasses.badgeNeutral)}
    >
      <PublishPlatformBadgeIcon live={false} />
      Not Published
    </span>
  )
}

function ImagePreviewCell({ v }: { v: MerchandisingVehicle }) {
  const [hovered, setHovered] = React.useState(false)
  const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const cellRef = React.useRef<HTMLDivElement>(null)
  const noPhotos = isMerchandisingNoPhotosVehicle(v)
  const primarySrc = noPhotos ? "" : merchandisingDemoThumbnailSrc(v)
  const [portalSrc, setPortalSrc] = React.useState(primarySrc)
  React.useEffect(() => {
    setPortalSrc(primarySrc)
  }, [primarySrc])

  const handleMouseEnter = () => {
    if (!cellRef.current) return
    const rect = cellRef.current.getBoundingClientRect()
    setPos({
      top: rect.top + window.scrollY + rect.height / 2,
      left: rect.right + window.scrollX + 12,
    })
    setHovered(true)
  }

  return (
    <div
      ref={cellRef}
      className="relative shrink-0 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      <StudioInventoryVehicleThumb v={v} showPhotoCount onResolvedSrc={setPortalSrc} />
      {hovered && !noPhotos && portalSrc && typeof document !== "undefined" && (
        <ImagePreviewPortal src={portalSrc} top={pos.top} left={pos.left} />
      )}
    </div>
  )
}

function VehicleCellDownloadMediaControl({ v }: { v: MerchandisingVehicle }) {
  const hasMedia = !isMerchandisingNoPhotosVehicle(v)
  const tooltipLabel = hasMedia ? "Download media" : "No media"

  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={tooltipLabel}
          aria-disabled={!hasMedia}
          tabIndex={hasMedia ? 0 : -1}
          className={cn(
            "-mt-1 z-[1] inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 pointer-events-none transition-opacity duration-150",
            "group-hover:pointer-events-auto group-hover:opacity-100",
            "focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spyne-primary/30",
            hasMedia && "hover:bg-muted hover:text-spyne-text",
            !hasMedia && "cursor-not-allowed text-muted-foreground/60 hover:bg-transparent hover:text-muted-foreground/60",
          )}
          onClick={(e) => {
            e.stopPropagation()
            if (!hasMedia) return
          }}
        >
          <MaterialSymbol
            name="download"
            size={20}
            className={cn(
              "[font-variation-settings:'FILL'_0,'wght'_400,'GRAD'_0,'opsz'_24]",
              !hasMedia && "opacity-70",
            )}
            aria-hidden
          />
        </button>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side="top"
          align="end"
          sideOffset={4}
          className={spyneComponentClasses.darkTooltipRadixContent}
        >
          <div
            className="max-w-[min(100vw-2rem,240px)] whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium leading-snug normal-case text-[var(--spyne-on-dark-text)]"
            style={{
              background: spyneDarkTooltipTokens.shellBackgroundVar,
              boxShadow: "0 1px 3px rgb(0 0 0 / 0.22)",
            }}
          >
            {tooltipLabel}
          </div>
          <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={10} height={5} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

function ImagePreviewPortal({ src, top, left }: { src: string; top: number; left: number }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const { createPortal } = require("react-dom")
  return createPortal(
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{ top, left, transform: "translateY(-50%)" }}
    >
      <div
        className="overflow-hidden rounded-xl border border-spyne-border bg-white shadow-[0_8px_32px_rgba(0,0,0,0.16),0_2px_8px_rgba(0,0,0,0.08)]"
        style={{ width: 280 }}
      >
        <div className="relative aspect-video w-full bg-muted">
          <img src={src} alt="" className="absolute inset-0 h-full w-full object-contain object-center" />
        </div>
      </div>
    </div>,
    document.body
  )
}

type RenameField = "vin" | "stock" | "reg"

const RENAME_META: Record<RenameField, { label: string; maxLen: number; placeholder: string }> = {
  vin:   { label: "VIN",           maxLen: 17, placeholder: "17-character VIN" },
  stock: { label: "Stock Number",  maxLen: 20, placeholder: "e.g. STK-12345" },
  reg:   { label: "Reg. Number",   maxLen: 20, placeholder: "e.g. REG-7890" },
}

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/i

function validateRename(
  field: RenameField,
  value: string,
  vehicles: MerchandisingVehicle[],
  currentVin: string,
  renames: Map<string, { vin?: string; stock?: string; reg?: string }>,
): string | null {
  const trimmed = value.trim()
  if (!trimmed) return `${RENAME_META[field].label} cannot be empty.`

  if (field === "vin") {
    if (trimmed.length !== 17) return "VIN must be exactly 17 characters."
    if (!VIN_RE.test(trimmed)) return "VIN may only contain letters A–Z and digits 0–9 (no I, O, or Q)."
    const clash = vehicles.find((v) => {
      const effective = renames.get(v.vin)?.vin ?? v.vin
      return v.vin !== currentVin && effective.toUpperCase() === trimmed.toUpperCase()
    })
    if (clash) return `VIN ${trimmed.toUpperCase()} is already used by ${clash.year} ${clash.make} ${clash.model}.`
  } else {
    if (trimmed.length > RENAME_META[field].maxLen)
      return `${RENAME_META[field].label} must be ${RENAME_META[field].maxLen} characters or fewer.`
    const clash = vehicles.find((v) => {
      if (v.vin === currentVin) return false
      const ov = renames.get(v.vin)
      const effective = field === "stock"
        ? (ov?.stock ?? v.stockNumber ?? "")
        : (ov?.reg ?? "")
      return effective.trim().toLowerCase() === trimmed.toLowerCase()
    })
    if (clash) return `${RENAME_META[field].label} "${trimmed}" is already used by ${clash.year} ${clash.make} ${clash.model}.`
  }
  return null
}

function RenameModal({
  open,
  field,
  currentValue,
  vehicle,
  vehicles,
  renames,
  onSave,
  onClose,
}: {
  open: boolean
  field: RenameField
  currentValue: string
  vehicle: MerchandisingVehicle
  vehicles: MerchandisingVehicle[]
  renames: Map<string, { vin?: string; stock?: string; reg?: string }>
  onSave: (value: string) => void
  onClose: () => void
}) {
  const [value, setValue] = React.useState(currentValue)
  const [error, setError] = React.useState<string | null>(null)
  const meta = RENAME_META[field]

  React.useEffect(() => {
    if (open) {
      setValue(currentValue)
      setError(null)
    }
  }, [open, currentValue])

  const handleSave = () => {
    const err = validateRename(field, value, vehicles, vehicle.vin, renames)
    if (err) { setError(err); return }
    onSave(value.trim())
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            Rename {meta.label}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {vehicle.year} {vehicle.make} {vehicle.model}
            {vehicle.trim ? ` ${vehicle.trim}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-spyne-text">{meta.label}</label>
            <Input
              autoFocus
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(null) }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave() }}
              placeholder={meta.placeholder}
              maxLength={field === "vin" ? 17 : 20}
              className={cn(
                "h-9 text-sm",
                error && "border-spyne-error focus-visible:ring-spyne-error/30",
              )}
            />
            {error ? (
              <p className="flex items-start gap-1.5 text-xs text-spyne-error">
                <MaterialSymbol name="error" size={14} className="mt-[1px] shrink-0" />
                {error}
              </p>
            ) : field === "vin" ? (
              <p className="text-[11px] text-muted-foreground">17 chars · A–Z, 0–9 · no I, O, Q</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">Max {meta.maxLen} characters</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-spyne-border px-3.5 py-1.5 text-sm font-medium text-spyne-text transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-spyne-primary px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--spyne-primary-hover)]"
            >
              Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function VehicleRowActionsMenu({
  isSold,
  onMarkSold,
  onRenameField,
  onCopyIdentifiers,
  showPromote,
  onPromote,
}: {
  isSold: boolean
  onMarkSold: () => void
  onRenameField: (field: RenameField) => void
  onCopyIdentifiers: () => void
  /** When set, Promote appears in this menu so the action column keeps one primary Merch CTA. */
  showPromote?: boolean
  onPromote?: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            spyneComponentClasses.toolbarTrigger,
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-0 p-0 shadow-none",
          )}
          aria-label="More actions"
          onClick={(e) => e.stopPropagation()}
        >
          <MaterialSymbol name="more_vert" size={20} className="text-spyne-text-secondary" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[200px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mark as sold — label + switch (toggle on row select; menu stays open) */}
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            onMarkSold()
          }}
          className="flex cursor-default items-center justify-between gap-3"
        >
          <span>{isSold ? "Unmark sold" : "Mark as sold"}</span>
          <Switch
            checked={isSold}
            onCheckedChange={() => {}}
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-none scale-90"
          />
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            void onCopyIdentifiers()
          }}
          className="flex cursor-default items-center gap-2"
        >
          <MaterialSymbol name="content_copy" size={14} className="text-muted-foreground" />
          Copy stock and listing ID
        </DropdownMenuItem>
        {showPromote && onPromote ? (
          <DropdownMenuItem
            onSelect={() => {
              onPromote()
            }}
            className="flex cursor-default items-center gap-2"
          >
            <MaterialSymbol name="trending_up" size={14} className="text-muted-foreground" />
            Promote
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            onRenameField("vin")
          }}
          className="flex cursor-default items-center gap-2"
        >
          <MaterialSymbol name="edit" size={14} className="text-muted-foreground" />
          Rename VIN
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            onRenameField("stock")
          }}
          className="flex cursor-default items-center gap-2"
        >
          <MaterialSymbol name="edit" size={14} className="text-muted-foreground" />
          Rename stock number
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            onRenameField("reg")
          }}
          className="flex cursor-default items-center gap-2"
        >
          <MaterialSymbol name="edit" size={14} className="text-muted-foreground" />
          Rename registration
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function openVehicleRowDetail(vin: string) {
  window.location.href = merchandisingInventoryDetailHref(vin)
}

function ViewMoreLink({ vin }: { vin: string }) {
  return (
    <button
      type="button"
      className="p-0 text-left text-[10px] font-normal leading-snug text-spyne-text-secondary hover:text-spyne-primary hover:underline"
      onClick={(e) => {
        e.stopPropagation()
        openVehicleRowDetail(vin)
      }}
    >
      View more
    </button>
  )
}

interface VehicleMediaTableProps {
  vehicles?: MerchandisingVehicle[]
  title?: string
  /**
   * Hide the select-all checkbox column and the floating bulk-action bar.
   * Use when embedding the table inside an existing card/section (e.g. Studio Overview).
   * Design-system: always pair with `embedded` so border/radius are also suppressed.
   */
  showCheckboxes?: boolean
  /**
   * Strip the table's own outer border and rounded corners.
   * Use whenever the table is nested inside a parent that already provides
   * border + border-radius (e.g. a Card or a rounded section container).
   */
  embedded?: boolean
  /** Switch between lot-centric columns and merchandising-centric columns. */
  tableView?: "lot-view" | "merchandising"
  /** When "new" or "used", hides the Type column since it's redundant. */
  vehicleType?: "all" | "new" | "used"
  /**
   * Cohort-specific Issue column: `incomplete-photo-set` (interior vs exterior only),
   * `no-360` (always "No 360 spin"), or default priority chain.
   */
  merchandisingIssueContext?: MerchandisingOverviewIssueContext
}

export function VehicleMediaTable({
  vehicles,
  title,
  showCheckboxes = true,
  embedded = false,
  tableView = "merchandising",
  vehicleType = "all",
  merchandisingIssueContext = "default",
}: VehicleMediaTableProps) {
  const data = vehicles ?? mockMerchandisingVehicles

  type LotSortKey = "vehicle" | "age" | "holding" | "price"
  type MerchSortKey = "vehicle" | "dtf" | "score" | "created"
  const DEFAULT_LOT_SORT: { key: LotSortKey; dir: "asc" | "desc" } = {
    key: "age",
    dir: "desc",
  }
  const DEFAULT_MERCH_SORT: { key: MerchSortKey; dir: "asc" | "desc" } = {
    key: "dtf",
    dir: "asc",
  }
  /** `dir: null` = use default sort for the current view (age↓ lot, DTF↑ merch). */
  const [lotSort, setLotSort] = React.useState<{ key: LotSortKey; dir: "asc" | "desc" | null }>({
    key: DEFAULT_LOT_SORT.key,
    dir: null,
  })
  const [merchSort, setMerchSort] = React.useState<{ key: MerchSortKey; dir: "asc" | "desc" | null }>({
    key: DEFAULT_MERCH_SORT.key,
    dir: null,
  })

  React.useEffect(() => {
    if (tableView === "lot-view") {
      setLotSort({ key: DEFAULT_LOT_SORT.key, dir: null })
    } else {
      setMerchSort({ key: DEFAULT_MERCH_SORT.key, dir: null })
    }
  }, [tableView])

  const toggleLotSort = (key: LotSortKey) => {
    setLotSort((prev) => {
      if (prev.dir !== null && prev.key === key) {
        if (prev.dir === "asc") return { key, dir: "desc" as const }
        return { key: DEFAULT_LOT_SORT.key, dir: null }
      }
      return { key, dir: "asc" }
    })
  }
  const toggleMerchSort = (key: MerchSortKey) => {
    setMerchSort((prev) => {
      if (prev.dir !== null && prev.key === key) {
        if (prev.dir === "asc") return { key, dir: "desc" as const }
        return { key: DEFAULT_MERCH_SORT.key, dir: null }
      }
      return { key, dir: "asc" }
    })
  }

  const sortedData = React.useMemo(() => {
    const rows = [...data]
    if (tableView === "lot-view") {
      const key = lotSort.dir === null ? DEFAULT_LOT_SORT.key : lotSort.key
      const dir = lotSort.dir === null ? DEFAULT_LOT_SORT.dir : lotSort.dir
      if (key === "vehicle") {
        rows.sort((a, b) => {
          const as = `${a.year} ${a.make} ${a.model} ${a.trim}`
          const bs = `${b.year} ${b.make} ${b.model} ${b.trim}`
          const c = as.localeCompare(bs)
          return dir === "asc" ? c : -c
        })
        return rows
      }
      rows.sort((a, b) => {
        let c = 0
        if (key === "age") c = a.daysInStock - b.daysInStock
        else if (key === "holding") {
          c = a.daysInStock * STUDIO_HOLDING_COST_PER_DAY - b.daysInStock * STUDIO_HOLDING_COST_PER_DAY
        } else c = a.price - b.price
        return dir === "asc" ? c : -c
      })
      return rows
    }
    const key = merchSort.dir === null ? DEFAULT_MERCH_SORT.key : merchSort.key
    const dir = merchSort.dir === null ? DEFAULT_MERCH_SORT.dir : merchSort.dir
    if (key === "vehicle") {
      rows.sort((a, b) => {
        const as = `${a.year} ${a.make} ${a.model} ${a.trim}`
        const bs = `${b.year} ${b.make} ${b.model} ${b.trim}`
        const c = as.localeCompare(bs)
        return dir === "asc" ? c : -c
      })
      return rows
    }
    rows.sort((a, b) => {
      let c = 0
      if (key === "dtf") c = a.daysToFrontline - b.daysToFrontline
      else if (key === "created") c = b.daysInStock - a.daysInStock
      else c = a.listingScore - b.listingScore
      return dir === "asc" ? c : -c
    })
    return rows
  }, [data, tableView, lotSort, merchSort])

  const [selected, setSelected] = React.useState<Set<string>>(() => new Set())
  const router = useRouter()

  const selectedInstantEligibleCount = React.useMemo(() => {
    let n = 0
    for (const v of data) {
      if (selected.has(v.vin) && merchandisingInstantMediaEligible(v)) n += 1
    }
    return n
  }, [data, selected])
  const [soldMap, setSoldMap] = React.useState(() => soldVehiclesStore.getAll())
  const [toast, setToast] = React.useState<{ vin: string; label: string } | null>(null)
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  // Local rename overrides: vin → { vin?, stock?, reg? }
  const [renames, setRenames] = React.useState<Map<string, { vin?: string; stock?: string; reg?: string }>>(
    () => new Map()
  )
  const [renameModal, setRenameModal] = React.useState<{
    field: RenameField
    vehicle: MerchandisingVehicle
  } | null>(null)

  const saveRename = React.useCallback((vin: string, field: RenameField, value: string) => {
    setRenames((prev) => {
      const next = new Map(prev)
      const existing = next.get(vin) ?? {}
      next.set(vin, { ...existing, [field]: value })
      return next
    })
    setRenameModal(null)
  }, [])

  React.useEffect(() => {
    return soldVehiclesStore.subscribe(() => setSoldMap(soldVehiclesStore.getAll()))
  }, [])

  const toggleOne = React.useCallback((vin: string, next: boolean) => {
    setSelected((prev) => {
      const n = new Set(prev)
      if (next) n.add(vin)
      else n.delete(vin)
      return n
    })
  }, [])

  const toggleSold = React.useCallback((vin: string, vehicleLabel: string) => {
    const wasSold = soldVehiclesStore.isSold(vin)
    if (wasSold) {
      soldVehiclesStore.unmark(vin)
      setToast(null)
      clearTimeout(toastTimerRef.current)
    } else {
      soldVehiclesStore.mark(vin)
      setToast({ vin, label: vehicleLabel })
      clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setToast(null), 5000)
    }
  }, [])

  const selectedOnPage = data.filter((v) => selected.has(v.vin)).length
  const headerChecked =
    data.length === 0 ? false
    : selectedOnPage === data.length ? true
    : selectedOnPage > 0 ? "indeterminate"
    : false

  const copyStockLine = React.useCallback(async (v: MerchandisingVehicle) => {
    const line = `${stockLabel(v)} • ${listingCorrelationId(v)}`
    try { await navigator.clipboard.writeText(line) } catch { /* ignore */ }
  }, [])

  return (
    <TooltipProvider delayDuration={200}>
    <div className={cn("overflow-hidden bg-spyne-surface", !embedded && "rounded-xl border border-spyne-border")}>
      {title ? (
        <div className="border-b border-spyne-border px-5 py-3.5">
          <h3 className={spyneComponentClasses.studioInventoryTableTitle}>{title}</h3>
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table
          className={cn(
            spyneComponentClasses.studioInventoryTable,
            "[&_thead_tr_th]:py-2 [&_tbody_tr_td]:py-2.5 [&_thead_tr_th]:px-3 [&_tbody_tr_td]:px-3",
          )}
        >
          {/* Header */}
          <thead>
            <tr className={spyneComponentClasses.studioInventoryTableHeaderRow}>
              {showCheckboxes && (
                <th className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableCheckboxTh)}>
                  <span className="inline-flex items-center leading-none">
                    <Checkbox
                      checked={headerChecked}
                      onCheckedChange={(c) =>
                        c === true
                          ? setSelected(new Set(data.map((v) => v.vin)))
                          : setSelected(new Set())
                      }
                      aria-label="Select all vehicles"
                    />
                  </span>
                </th>
              )}
              <th
                className={cn(
                  spyneComponentClasses.studioInventoryTableHeadCell,
                  !showCheckboxes && "pl-4",
                  showCheckboxes && spyneComponentClasses.studioInventoryTableVehicleColAfterCheckbox,
                  "cursor-pointer select-none",
                )}
                onClick={() => (tableView === "lot-view" ? toggleLotSort("vehicle") : toggleMerchSort("vehicle"))}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span>Vehicle</span>
                  <StudioInventorySortIcon
                    active={
                      tableView === "lot-view"
                        ? lotSort.dir !== null && lotSort.key === "vehicle"
                        : merchSort.dir !== null && merchSort.key === "vehicle"
                    }
                    direction={tableView === "lot-view" ? (lotSort.dir ?? "asc") : (merchSort.dir ?? "asc")}
                  />
                </span>
              </th>
              {tableView === "lot-view" ? (
                <>
                  {vehicleType === "all" && (
                    <th className={cn("w-28", spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellRight)}>Gross Margin</th>
                  )}
                  <th
                    className={cn(
                      "w-24",
                      spyneComponentClasses.studioInventoryTableHeadCell,
                      spyneComponentClasses.studioInventoryTableHeadCellRight,
                      "cursor-pointer select-none",
                    )}
                    onClick={() => toggleLotSort("age")}
                  >
                    <span className="inline-flex w-full items-center justify-end gap-1.5">
                      <span>Age</span>
                      <StudioInventorySortIcon
                        active={lotSort.dir !== null && lotSort.key === "age"}
                        direction={lotSort.dir ?? "asc"}
                      />
                    </span>
                  </th>
                  <th
                    className={cn(
                      "w-28",
                      spyneComponentClasses.studioInventoryTableHeadCell,
                      spyneComponentClasses.studioInventoryTableHeadCellRight,
                      "cursor-pointer select-none",
                    )}
                    onClick={() => toggleLotSort("holding")}
                  >
                    <span className="inline-flex w-full items-center justify-end gap-1.5">
                      <span>Holding Cost</span>
                      <StudioInventorySortIcon
                        active={lotSort.dir !== null && lotSort.key === "holding"}
                        direction={lotSort.dir ?? "asc"}
                      />
                    </span>
                  </th>
                  <th
                    className={cn(
                      "w-24",
                      spyneComponentClasses.studioInventoryTableHeadCell,
                      spyneComponentClasses.studioInventoryTableHeadCellRight,
                      "cursor-pointer select-none",
                    )}
                    onClick={() => toggleLotSort("price")}
                  >
                    <span className="inline-flex w-full items-center justify-end gap-1.5">
                      <span>S. Price</span>
                      <StudioInventorySortIcon
                        active={lotSort.dir !== null && lotSort.key === "price"}
                        direction={lotSort.dir ?? "asc"}
                      />
                    </span>
                  </th>
                  <th className={cn("w-44 min-w-0", spyneComponentClasses.studioInventoryTableHeadCell)}>Issue</th>
                  <th className={cn("min-w-0", spyneComponentClasses.studioInventoryTableHeadCell)}>Action</th>
                  <th
                    className={cn(
                      spyneComponentClasses.studioInventoryTableHeadCell,
                      spyneComponentClasses.studioInventoryTableRowMenuTh,
                    )}
                  >
                    <span className="sr-only">Row actions</span>
                  </th>
                </>
              ) : (
                <>
                  <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Media</th>
                  <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Publish State</th>
                  <th
                    className={cn("w-32", spyneComponentClasses.studioInventoryTableHeadCell, "cursor-pointer select-none")}
                    onClick={() => toggleMerchSort("created")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Created
                      <StudioInventorySortIcon
                        active={merchSort.dir !== null && merchSort.key === "created"}
                        direction={merchSort.dir ?? "asc"}
                      />
                    </span>
                  </th>
                  <th
                    className={cn(
                      "w-16",
                      spyneComponentClasses.studioInventoryTableHeadCell,
                      spyneComponentClasses.studioInventoryTableHeadCellRight,
                      "cursor-pointer select-none",
                    )}
                    onClick={() => toggleMerchSort("dtf")}
                  >
                    <span className="inline-flex w-full items-center justify-end gap-1.5">
                      <abbr title="Days to Frontline" className="no-underline">
                        Days → Live
                      </abbr>
                      <StudioInventorySortIcon
                        active={merchSort.dir !== null && merchSort.key === "dtf"}
                        direction={merchSort.dir ?? "asc"}
                      />
                    </span>
                  </th>
                  <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Issue</th>
                  <th className={cn("min-w-0", spyneComponentClasses.studioInventoryTableHeadCell)}>Action</th>
                  <th
                    className={cn(
                      spyneComponentClasses.studioInventoryTableHeadCell,
                      spyneComponentClasses.studioInventoryTableRowMenuTh,
                    )}
                  >
                    <span className="sr-only">Row actions</span>
                  </th>
                </>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {sortedData.map((v) => {
              const override = renames.get(v.vin)
              const displayVin = override?.vin ?? v.vin
              const displayStock = override?.stock ?? stockLabel(v)
              const displayReg = override?.reg ?? ""
              const holdingAccum = v.daysInStock * STUDIO_HOLDING_COST_PER_DAY
              const estGross = estimatedFrontGrossForMerch(v)
              const holdingPct = holdingUtilizedPctLabel(holdingAccum, estGross)
              const holdingMarginPct = holdingCostPctOfMargin(holdingAccum, estGross)
              const holdingCostOverHalfOfMargin =
                holdingMarginPct != null && holdingMarginPct > 50
              const resolutionHints = merchandisingHoldingResolutions(v, holdingAccum, estGross)
              const issue =
                tableView === "lot-view"
                  ? issueLabelForStudioInventoryLotView(v, merchandisingIssueContext)
                  : issueLabelForStudioInventoryMerchandisingOverview(v, merchandisingIssueContext)
              const allIssues =
                tableView === "lot-view" || merchandisingIssueContext !== "default"
                  ? null
                  : allIssueLabelsForMerchandisingOverview(v)
              const issueRows = allIssues ?? [issue]
              const issueLayout = planMerchInventoryIssueColumnLayout(issueRows)
              return (
                <tr
                  key={v.vin}
                  className={cn(
                    spyneComponentClasses.studioInventoryTableRow,
                    "group cursor-pointer",
                  )}
                  onClick={() => {
                    window.location.href = merchandisingInventoryDetailHref(v.vin)
                  }}
                >
                  {/* Checkbox */}
                  {showCheckboxes && (
                    <td className={spyneComponentClasses.studioInventoryTableCheckboxTd} onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.has(v.vin)}
                        onCheckedChange={(c) => toggleOne(v.vin, c === true)}
                        aria-label={`Select ${v.year} ${v.make} ${v.model}`}
                      />
                    </td>
                  )}

                  {/* Vehicle (image + info) */}
                  <td
                    className={cn(
                      spyneComponentClasses.studioInventoryTableCell,
                      !showCheckboxes && "pl-4",
                      showCheckboxes && spyneComponentClasses.studioInventoryTableVehicleColAfterCheckbox,
                    )}
                  >
                    <div
                      className={cn(
                        spyneComponentClasses.studioInventoryTableVehicleMediaRow,
                        "w-full min-w-0",
                      )}
                    >
                      <ImagePreviewCell v={v} />
                      <div className="min-w-0 flex-1 cursor-default text-start">
                        <TooltipPrimitive.Root>
                          <TooltipPrimitive.Trigger asChild>
                            <div className="flex w-full min-w-0 cursor-default items-center justify-start gap-1 text-start">
                              {v.make || v.model ? (
                                <span className="min-w-0 truncate text-sm font-semibold text-spyne-text transition-colors duration-200 group-hover:text-spyne-primary">
                                  {v.year > 0 ? `${v.year} ` : ""}{v.make} {v.model}
                                  {v.trim ? ` ${v.trim}` : ""}
                                </span>
                              ) : (
                                <span className="min-w-0 truncate text-sm italic text-spyne-text-secondary">
                                  Name not available
                                </span>
                              )}
                              <span
                                className="inline-flex h-5 w-5 shrink-0 items-center justify-center"
                                aria-hidden
                              >
                                <MaterialSymbol
                                  name="chevron_right"
                                  size={20}
                                  className="translate-x-0.5 text-spyne-primary opacity-0 [font-variation-settings:'FILL'_0,'wght'_600,'GRAD'_0,'opsz'_24] transition duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100"
                                />
                              </span>
                            </div>
                          </TooltipPrimitive.Trigger>
                          <TooltipPrimitive.Portal>
                            <TooltipPrimitive.Content
                              side="top"
                              align="start"
                              sideOffset={8}
                              className={spyneComponentClasses.darkTooltipRadixContent}
                            >
                              <SpyneDarkTooltipPanel
                                title="Vehicle specifications"
                                lines={merchandisingVehicleSpecLines(v)}
                              />
                              <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={14} height={7} />
                            </TooltipPrimitive.Content>
                          </TooltipPrimitive.Portal>
                        </TooltipPrimitive.Root>
                        <p
                          className={cn(
                            "mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0.5",
                            spyneComponentClasses.studioInventoryTableCellMeta,
                          )}
                        >
                          <CopyOnClickIdentifier value={formatVinForDisplay(displayVin)} />
                          <span className="shrink-0 text-spyne-text-secondary" aria-hidden>
                            ·
                          </span>
                          <CopyOnClickIdentifier value={displayStock} />
                          {displayReg ? (
                            <>
                              <span className="shrink-0 text-spyne-text-secondary" aria-hidden>
                                ·
                              </span>
                              <span
                                className={cn(
                                  "tabular-nums",
                                  spyneComponentClasses.studioInventoryVinStockIdentifier,
                                )}
                              >
                                {displayReg}
                              </span>
                            </>
                          ) : null}
                        </p>
                        {tableView === "merchandising" && vehicleType === "all" ? (
                          <p
                            className={cn(
                              "mt-2 text-xs font-medium",
                              v.isNew ? "text-spyne-primary" : "text-spyne-info",
                            )}
                          >
                            {v.isNew ? "New" : "Pre-Owned"}
                          </p>
                        ) : null}
                        {tableView === "lot-view" ? (
                          <p className={cn("mt-1 text-xs font-medium", v.daysInStock >= 45 ? "text-spyne-info" : "text-spyne-warning-ink")}>
                            {v.daysInStock >= 45 ? "Wholesale" : "Retail"}
                          </p>
                        ) : null}
                      </div>
                      <div className="shrink-0 self-start">
                        <VehicleCellDownloadMediaControl v={v} />
                      </div>
                    </div>
                  </td>


                  {tableView === "lot-view" ? (
                    <>
                      {/* Lot View: Gross Margin */}
                      {vehicleType === "all" && (
                        <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-right")}>
                          <span className="text-sm font-semibold tabular-nums text-spyne-success">{formatPrice(estGross)}</span>
                          <p className={cn("mt-0.5", spyneComponentClasses.studioInventoryTableCellMeta)}>est. gross</p>
                        </td>
                      )}

                      {/* Lot View: Age */}
                      <td className={spyneComponentClasses.studioInventoryTableCell}>
                        <div className="flex flex-col items-end text-spyne-text">
                          <span className="text-sm font-semibold tabular-nums leading-tight">{v.daysInStock}d</span>
                          <span className={cn("mt-0.5 whitespace-nowrap", spyneComponentClasses.studioInventoryTableCellMeta)}>{formatInventoryCreatedDateLine(v)}</span>
                        </div>
                      </td>

                      {/* Lot View: Holding Cost */}
                      <td className={spyneComponentClasses.studioInventoryTableCell} onClick={(e) => e.stopPropagation()}>
                        <TooltipPrimitive.Root>
                          <TooltipPrimitive.Trigger asChild>
                            <button
                              type="button"
                              className={cn(
                                "flex flex-col items-end w-full cursor-default rounded-md outline-none focus-visible:ring-2 focus-visible:ring-spyne-primary/30",
                                holdingCostOverHalfOfMargin ? "text-spyne-error" : "text-spyne-text",
                              )}
                            >
                              <span
                                className={cn(
                                  "text-sm font-semibold tabular-nums leading-tight",
                                  holdingCostOverHalfOfMargin && "text-spyne-error",
                                )}
                              >
                                {formatPrice(holdingAccum)}
                              </span>
                              <span
                                className={cn(
                                  "mt-0.5",
                                  spyneComponentClasses.studioInventoryTableCellMeta,
                                  holdingCostOverHalfOfMargin && "text-spyne-error",
                                )}
                              >
                                {holdingPct === "—" ? "—" : `${holdingPct} of margin`}
                              </span>
                            </button>
                          </TooltipPrimitive.Trigger>
                          <TooltipPrimitive.Portal>
                            <TooltipPrimitive.Content side="top" align="end" sideOffset={8} className={spyneComponentClasses.darkTooltipRadixContent}>
                              <SpyneDarkTooltipPanel title="Suggested actions" lines={resolutionHints} />
                              <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={14} height={7} />
                            </TooltipPrimitive.Content>
                          </TooltipPrimitive.Portal>
                        </TooltipPrimitive.Root>
                      </td>

                      {/* Lot View: Price */}
                      <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-right")}>
                        <span className="text-sm font-semibold tabular-nums text-spyne-text">{formatPrice(v.price)}</span>
                      </td>

                      {/* Lot View: Issue */}
                      <td className={cn(spyneComponentClasses.studioInventoryTableCell, "min-w-0")}>
                        <span
                          className={cn(
                            "block min-w-0 truncate text-sm font-medium",
                            issue.tone === "danger" && "text-spyne-error",
                            issue.tone === "warning" && "text-spyne-warning-ink",
                            issue.tone === "neutral" && "text-muted-foreground",
                          )}
                          title={issue.label}
                        >
                          {issue.label}
                        </span>
                      </td>

                      {/* Lot View: CTA — aged units keep pricing action; otherwise same merchandising CTAs as Merch toggle */}
                      <td className={spyneComponentClasses.studioInventoryTableCell} onClick={(e) => e.stopPropagation()}>
                        <div className="flex min-w-0 flex-col items-start gap-1.5">
                          {v.daysInStock >= 45 ? (
                            <button type="button" className="inline-flex items-center gap-1.5 rounded-md border border-spyne-primary/20 bg-[var(--spyne-primary-soft)] px-3 py-1.5 text-xs font-semibold text-spyne-primary transition-colors hover:bg-spyne-primary/10 whitespace-nowrap">
                              <TrendingDown className="h-3 w-3 shrink-0" />
                              Reduce Price
                            </button>
                          ) : (
                            <MerchandisingInventoryActionCta v={v} size="sm" ui="studio" issueContext={merchandisingIssueContext} />
                          )}
                          {(v.daysInStock >= 45 || !merchandisingInventoryPrimaryIsViewMore(v, merchandisingIssueContext)) ? (
                            <ViewMoreLink vin={v.vin} />
                          ) : null}
                        </div>
                      </td>
                      <td
                        className={cn(spyneComponentClasses.studioInventoryTableCell, spyneComponentClasses.studioInventoryTableRowMenuTd)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-end">
                          <VehicleRowActionsMenu
                            isSold={soldMap.has(v.vin)}
                            onMarkSold={() => {
                              toggleSold(v.vin, `${v.year} ${v.make} ${v.model}`)
                            }}
                            onRenameField={(field) => setRenameModal({ field, vehicle: v })}
                            onCopyIdentifiers={() => copyStockLine(v)}
                            showPromote={v.publishStatus === "live" && v.vdpViews < 20}
                            onPromote={() => openVehicleRowDetail(v.vin)}
                          />
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      {/* Merch: Media (Images / 360 / Video processing: Draft, Review, Ready) */}
                      <td className={spyneComponentClasses.studioInventoryTableCell}>
                        <MerchandisingMediaPipelineCell vehicle={v} />
                      </td>

                      {/* Merch: Publish State */}
                      <td className={spyneComponentClasses.studioInventoryTableCell} onClick={(e) => e.stopPropagation()}>
                        <PublishStateBadge v={v} />
                      </td>

                      {/* Merch: Created Date (with Photos Received subtext) */}
                      <td className={cn(spyneComponentClasses.studioInventoryTableCell)}>
                        <div className="flex flex-col gap-0.5">
                          <span className="whitespace-nowrap text-sm font-semibold tabular-nums leading-tight text-spyne-text">
                            {formatInventoryCreatedDateLine(v)}
                          </span>
                          {v.photosReceivedAt ? (
                            <span className={cn("inline-flex items-center gap-0.5 tabular-nums", spyneComponentClasses.studioInventoryTableCellMeta)}>
                              <TooltipPrimitive.Provider delayDuration={200}>
                                <TooltipPrimitive.Root>
                                  <TooltipPrimitive.Trigger asChild>
                                    <span className="cursor-default">
                                      <MaterialSymbol name="photo_camera" size={10} className="shrink-0" />
                                    </span>
                                  </TooltipPrimitive.Trigger>
                                  <TooltipPrimitive.Portal>
                                    <TooltipPrimitive.Content side="top" sideOffset={4} className={spyneComponentClasses.darkTooltipRadixContent}>
                                      <div className={spyneComponentClasses.darkTooltipPanel}>Photos received date</div>
                                      <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={10} height={5} />
                                    </TooltipPrimitive.Content>
                                  </TooltipPrimitive.Portal>
                                </TooltipPrimitive.Root>
                              </TooltipPrimitive.Provider>
                              {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(v.photosReceivedAt))}
                            </span>
                          ) : (
                            <span className={cn("inline-flex items-center gap-0.5", spyneComponentClasses.studioInventoryTableCellMeta)}>
                              <TooltipPrimitive.Provider delayDuration={200}>
                                <TooltipPrimitive.Root>
                                  <TooltipPrimitive.Trigger asChild>
                                    <span className="cursor-default">
                                      <MaterialSymbol name="photo_camera" size={10} className="shrink-0" />
                                    </span>
                                  </TooltipPrimitive.Trigger>
                                  <TooltipPrimitive.Portal>
                                    <TooltipPrimitive.Content side="top" sideOffset={4} className={spyneComponentClasses.darkTooltipRadixContent}>
                                      <div className={spyneComponentClasses.darkTooltipPanel}>Photos not yet received</div>
                                      <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={10} height={5} />
                                    </TooltipPrimitive.Content>
                                  </TooltipPrimitive.Portal>
                                </TooltipPrimitive.Root>
                              </TooltipPrimitive.Provider>
                              <span className="opacity-40">—</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Merch: D to F (days to frontline) */}
                      <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-right")}>
                        <div className="inline-flex flex-col items-end text-spyne-text">
                          <span className="text-sm font-semibold tabular-nums leading-tight">{v.daysToFrontline}d</span>
                          <span className={cn("mt-0.5 whitespace-nowrap", spyneComponentClasses.studioInventoryTableCellMeta)}>{formatInventoryCreatedDateLine(v)}</span>
                        </div>
                      </td>

                      {/* Merch: Issue (up to 3 lines when they fit; +N on same row as 3rd, else 2 lines + +N) */}
                      <td className={spyneComponentClasses.studioInventoryTableCell}>
                        <div className="flex min-w-0 flex-col gap-1">
                          {issueLayout.line1 ? (
                            <span className={cn(merchandisingIssueLabelClassName(issueLayout.line1), "truncate")}>
                              {issueLayout.line1.label}
                            </span>
                          ) : null}
                          {issueLayout.line2 != null || (issueLayout.line3 == null && issueLayout.moreIssuesCount > 0) ? (
                            <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                              {issueLayout.line2 ? (
                                <span className={cn(merchandisingIssueLabelClassName(issueLayout.line2), "min-w-0 flex-1 truncate")}>
                                  {issueLayout.line2.label}
                                </span>
                              ) : null}
                              {issueLayout.line3 == null && issueLayout.moreIssuesCount > 0 ? (
                                <IssuesOverflowCountButton
                                  count={issueLayout.moreIssuesCount}
                                  lines={issueLayout.extraIssueLabels}
                                />
                              ) : null}
                            </div>
                          ) : null}
                          {issueLayout.line3 != null ? (
                            <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                              <span className={cn(merchandisingIssueLabelClassName(issueLayout.line3), "min-w-0 flex-1 truncate")}>
                                {issueLayout.line3.label}
                              </span>
                              {issueLayout.moreIssuesCount > 0 ? (
                                <IssuesOverflowCountButton
                                  count={issueLayout.moreIssuesCount}
                                  lines={issueLayout.extraIssueLabels}
                                />
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Merch: CTA */}
                      <td className={spyneComponentClasses.studioInventoryTableCell} onClick={(e) => e.stopPropagation()}>
                        <div className="flex min-w-0 flex-col items-start gap-1.5">
                          <MerchandisingInventoryActionCta v={v} size="md" ui="studio" issueContext={merchandisingIssueContext} />
                          {!merchandisingInventoryPrimaryIsViewMore(v, merchandisingIssueContext) ? (
                            <ViewMoreLink vin={v.vin} />
                          ) : null}
                        </div>
                      </td>
                      <td
                        className={cn(spyneComponentClasses.studioInventoryTableCell, spyneComponentClasses.studioInventoryTableRowMenuTd)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-end">
                          <VehicleRowActionsMenu
                            isSold={soldMap.has(v.vin)}
                            onMarkSold={() => {
                              toggleSold(v.vin, `${v.year} ${v.make} ${v.model}`)
                            }}
                            onRenameField={(field) => setRenameModal({ field, vehicle: v })}
                            onCopyIdentifiers={() => copyStockLine(v)}
                            showPromote={v.publishStatus === "live" && v.vdpViews < 20}
                            onPromote={() => openVehicleRowDetail(v.vin)}
                          />
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>

    {/* Sold toast */}
    <div
      className={cn(
        "fixed bottom-20 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ease-in-out",
        toast
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-3 opacity-0 pointer-events-none",
      )}
    >
      {toast && (
        <div className="flex items-center gap-3 rounded-2xl px-5 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.32),0_2px_12px_rgba(0,0,0,0.18)]" style={{ background: "#121212" }}>
          <MaterialSymbol name="check_circle" size={16} className="shrink-0 text-spyne-success" />
          <span className="text-sm font-medium text-white whitespace-nowrap">
            <span className="text-[#cccccc]">{toast.label}</span> marked as sold
          </span>
          <div className="h-4 w-px shrink-0" style={{ background: "#2e2e2e" }} />
          <button
            type="button"
            onClick={() => { toggleSold(toast.vin, toast.label); setToast(null) }}
            className="whitespace-nowrap rounded-md bg-white/10 px-2.5 py-1 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => { clearTimeout(toastTimerRef.current); setToast(null) }}
            className="ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#666666] transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Dismiss"
          >
            <MaterialSymbol name="close" size={16} />
          </button>
        </div>
      )}
    </div>

    {/* Rename modal */}
    {renameModal && (
      <RenameModal
        open
        field={renameModal.field}
        currentValue={
          renameModal.field === "vin"
            ? (renames.get(renameModal.vehicle.vin)?.vin ?? renameModal.vehicle.vin)
            : renameModal.field === "stock"
            ? (renames.get(renameModal.vehicle.vin)?.stock ?? stockLabel(renameModal.vehicle))
            : (renames.get(renameModal.vehicle.vin)?.reg ?? "")
        }
        vehicle={renameModal.vehicle}
        vehicles={data}
        renames={renames}
        onSave={(value) => saveRename(renameModal.vehicle.vin, renameModal.field, value)}
        onClose={() => setRenameModal(null)}
      />
    )}

    {/* Floating selection action bar */}
    {showCheckboxes && <div
      className={cn(
        "fixed bottom-6 left-1/2 z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-x-auto transition-all duration-300 ease-in-out",
        selected.size > 0
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-4 opacity-0 pointer-events-none",
      )}
    >
      <div
        className="flex w-max flex-nowrap items-center gap-4 rounded-2xl px-6 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.32),0_2px_12px_rgba(0,0,0,0.18)]"
        style={{ background: "#121212" }}
      >
        <span className="mr-1 shrink-0 whitespace-nowrap text-sm font-semibold tabular-nums text-white">
          {selected.size} selected
        </span>
        <div className="h-4 w-px shrink-0" style={{ background: "#2e2e2e" }} />
        <button
          type="button"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/12 bg-white/14 px-3.5 text-sm font-medium text-white/75 shadow-sm transition-colors hover:bg-white/22 hover:text-white"
        >
          <MaterialSymbol name="download" size={16} className="text-white/55" />
          Download
        </button>
        <button
          type="button"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/12 bg-white/14 px-3.5 text-sm font-medium text-white/75 shadow-sm transition-colors hover:bg-white/22 hover:text-white"
        >
          <MaterialSymbol name="delete" size={16} className="text-white/55" />
          Delete
        </button>
        {selectedInstantEligibleCount > 0 ? (
          <button
            type="button"
            className={cn(
              spyneComponentClasses.btnPrimaryMd,
              "shrink-0 whitespace-nowrap border-0 px-3.5 text-sm shadow-sm [&_.material-symbols-outlined]:text-white",
            )}
            style={{ background: holdingCostFigma.topBarGradient }}
            onClick={() => router.push("/max-2/studio/add")}
          >
            <MaterialSymbol name="auto_awesome" size={16} aria-hidden />
            Use Instant Media ({selectedInstantEligibleCount})
          </button>
        ) : null}
        <button
          type="button"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-spyne-primary px-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--spyne-primary-hover)]"
        >
          <MaterialSymbol name="campaign" size={16} />
          Run Campaign
        </button>
        <button
          type="button"
          onClick={() => setSelected(new Set())}
          className="ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#666666] transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Dismiss selection"
        >
          <MaterialSymbol name="close" size={16} />
        </button>
      </div>
    </div>}
    </TooltipProvider>
  )
}

export { StudioInventoryVehicleThumb } from "@/components/max-2/studio/studio-inventory-vehicle-thumb"
