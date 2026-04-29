"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { MerchandisingVehicle } from "@/services/max-2/max-2.types"
import { cn } from "@/lib/utils"
import { max2Classes, max2Layout, spyneComponentClasses, spyneConsoleTokens } from "@/lib/design-system/max-2"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { CopyOnClickIdentifier } from "@/components/max-2/copy-on-click-identifier"
import { SpyneSegmentedControl, SpyneSegmentedButton } from "@/components/max-2/spyne-toolbar-controls"
import { SpyneRoiKpiMetricCell, SpyneRoiKpiStrip } from "@/components/max-2/spyne-roi-kpi-strip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import {
  SpyneMediaStatusChip,
  SpynePublishStatusChip,
} from "@/components/max-2/spyne-ui"
import { StudioInventoryLineTabs } from "@/components/max-2/studio/studio-inventory-line-tabs"
import { MerchandisingMediaPipelineCell } from "@/components/max-2/studio/merchandising-media-pipeline-cell"
import { merchandisingInstantMediaEligible } from "@/components/max-2/studio/merchandising-action-pitch-banners"
import { resolveStudioMediaPipeline } from "@/lib/studio-media-pipeline"
import { formatVinForDisplay } from "@/lib/inventory-vin"
import {
  demoVehicleThumbnailByKey,
  isMerchandisingNoPhotosVehicle,
  merchandisingDemoThumbnailSrc,
} from "@/lib/demo-vehicle-hero-images"
import {
  HOLDING_COST_CHANGED_EVENT,
  getEffectiveStudioHoldingCostPerDayClient,
} from "@/lib/holding-cost-config"
import { STUDIO_HOLDING_COST_PER_DAY } from "@/lib/inventory-issue-label"

type VdpTab =
  | "photos"
  | "vehicle"
  | "media"
  | "images"
  | "spin360"
  | "video"
  | "financials"
  | "documents"

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
}

function stockLabel(v: MerchandisingVehicle): string {
  if (v.stockNumber) return v.stockNumber
  const digits = v.vin.replace(/\D/g, "")
  return digits ? `STK${digits.slice(0, 3)}` : `STK${v.vin.slice(0, 3)}`
}

function estimatedFrontGross(v: MerchandisingVehicle): number {
  if (v.estimatedFrontGross != null && v.estimatedFrontGross > 0) return v.estimatedFrontGross
  return Math.max(600, Math.round(v.price * 0.088))
}

function demoRegistrationFromVin(vin: string): string {
  const digits = vin.replace(/\D/g, "").slice(-4).padStart(4, "0")
  return `HR 26 ${digits}`
}

function formatPublishedLine(iso?: string): string {
  if (!iso) return "Not published yet"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "Not published yet"
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "2-digit", hour: "numeric", minute: "2-digit" }).format(d)
}

function formatSyncLine(iso?: string): string {
  if (!iso) return "Last synced from vAuto: pending"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "Last synced from vAuto: pending"
  const line = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(d)
  return `Last synced from vAuto: ${line}`
}

function galleryUrls(v: MerchandisingVehicle): string[] {
  const count = Math.max(1, Math.min(v.photoCount || 8, 14))
  return Array.from({ length: count }, (_, i) => demoVehicleThumbnailByKey(`${v.vin}-g${i}`))
}

function TabStatusIcon({ stage }: { stage: "ok" | "warn" | "bad" }) {
  if (stage === "ok") {
    return <MaterialSymbol name="check_circle" size={16} className="text-spyne-success" aria-hidden />
  }
  if (stage === "bad") {
    return <MaterialSymbol name="error" size={16} className="text-spyne-error" aria-hidden />
  }
  return <MaterialSymbol name="warning" size={16} className="text-spyne-warning-ink" aria-hidden />
}

/** Leading icon + label for VDP segmented tabs (matches `spyne-segmented--lg` touch targets). */
function VdpTabButtonContent({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <MaterialSymbol name={icon} size={20} className="opacity-95" />
      {children}
    </span>
  )
}

function pipelineTabIconForImages(p: ReturnType<typeof resolveStudioMediaPipeline>): "ok" | "warn" | "bad" {
  if (p.images === "ready") return "ok"
  if (p.images === "draft") return "bad"
  return "warn"
}

function pipelineTabIconForSpin(p: ReturnType<typeof resolveStudioMediaPipeline>): "ok" | "warn" | "bad" {
  if (p.spin360 === "ready") return "ok"
  if (p.spin360 === "draft") return "bad"
  return "warn"
}

function pipelineTabIconForVideo(v: MerchandisingVehicle, p: ReturnType<typeof resolveStudioMediaPipeline>): "ok" | "warn" | "bad" {
  if (p.video === "ready") return "ok"
  if (v.missingWalkaroundVideo && v.publishStatus === "live") return "bad"
  return "warn"
}

function aggregatePipelineTab(p: ReturnType<typeof resolveStudioMediaPipeline>): "ok" | "warn" | "bad" {
  const stages = [p.images, p.spin360, p.video]
  if (stages.every((s) => s === "ready")) return "ok"
  if (stages.some((s) => s === "draft")) return "bad"
  return "warn"
}

function findScrollParent(el: HTMLElement): HTMLElement | Window {
  let p: HTMLElement | null = el.parentElement
  while (p) {
    const { overflowY } = getComputedStyle(p)
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") return p
    p = p.parentElement
  }
  return window
}

/** Preview, Add/Remove Media, download, overflow (shared by expanded + compact VDP header). */
function VehicleVdpToolbarActions({ vin, compact }: { vin: string; compact?: boolean }) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              spyneComponentClasses.btnSecondaryMd,
              "inline-flex items-center gap-1 rounded-lg border border-spyne-border bg-white px-3 py-2 text-sm font-semibold",
            )}
          >
            Preview
            <MaterialSymbol name="expand_more" size={16} className="opacity-70" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem className="cursor-default gap-2" onSelect={() => undefined}>
            <MaterialSymbol name="open_in_new" size={16} className="text-muted-foreground" />
            Dealer site
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-default gap-2" onSelect={() => undefined}>
            <MaterialSymbol name="open_in_new" size={16} className="text-muted-foreground" />
            Third-party listing
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-default gap-2" onSelect={() => undefined}>
            <MaterialSymbol name="smartphone" size={16} className="text-muted-foreground" />
            Mobile preview
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Link
        href={`/max-2/studio/add?vin=${encodeURIComponent(vin)}`}
        className={cn(spyneComponentClasses.btnPrimaryMd, "inline-flex shrink-0 items-center gap-2 no-underline")}
      >
        <MaterialSymbol name="edit" size={16} />
        {compact ? (
          <>
            <span className="hidden min-[480px]:inline">Add/Remove Media</span>
            <span className="min-[480px]:hidden">Media</span>
          </>
        ) : (
          "Add/Remove Media"
        )}
      </Link>

      <button
        type="button"
        className={cn(
          spyneComponentClasses.btnSecondaryMd,
          "shrink-0 rounded-lg border border-spyne-border bg-white px-2.5 py-2",
        )}
        aria-label="Download vehicle package"
      >
        <MaterialSymbol name="download" size={20} className="text-spyne-text" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              spyneComponentClasses.btnSecondaryMd,
              "shrink-0 rounded-lg border border-spyne-border bg-white px-2.5 py-2",
            )}
            aria-label="More actions"
          >
            <MaterialSymbol name="more_vert" size={20} className="text-spyne-text" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="cursor-default" onSelect={() => undefined}>
            Copy identifiers
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-default" onSelect={() => undefined}>
            Share link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-default text-spyne-error focus:text-spyne-error" onSelect={() => undefined}>
            Remove from frontline
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export function VehicleDisplayPage({ vehicle: v }: { vehicle: MerchandisingVehicle }) {
  const router = useRouter()
  const pageRootRef = React.useRef<HTMLDivElement>(null)
  const [headerCompact, setHeaderCompact] = React.useState(false)
  const [tab, setTab] = React.useState<VdpTab>("photos")
  const [viewInput, setViewInput] = React.useState(false)
  const [heroIndex, setHeroIndex] = React.useState(0)
  const [holdingPerDay, setHoldingPerDay] = React.useState(STUDIO_HOLDING_COST_PER_DAY)

  const pipeline = React.useMemo(() => resolveStudioMediaPipeline(v), [v])
  const urls = React.useMemo(() => galleryUrls(v), [v])
  const heroSrc = urls[heroIndex] ?? merchandisingDemoThumbnailSrc(v)
  const holdingAccum = v.daysInStock * holdingPerDay
  const estGross = estimatedFrontGross(v)
  const netMarginEst = estGross - holdingAccum
  const holdingPctOfGross = estGross > 0 ? Math.round((holdingAccum / estGross) * 100) : 0
  const instantBanner =
    v.mediaStatus === "clone-photos" || merchandisingInstantMediaEligible(v)
  const wholesale = v.daysInStock >= 45
  const syncTs = v.lastPublishedAt ?? v.listingUpdatedAt
  const listingTouch = v.listingUpdatedAt ?? v.lastPublishedAt
  const vehicleTitle = `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ""}`

  React.useEffect(() => {
    const refresh = () => setHoldingPerDay(getEffectiveStudioHoldingCostPerDayClient(STUDIO_HOLDING_COST_PER_DAY))
    refresh()
    window.addEventListener(HOLDING_COST_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(HOLDING_COST_CHANGED_EVENT, refresh)
  }, [])

  React.useEffect(() => {
    const root = pageRootRef.current
    if (!root) return
    const scrollParent = findScrollParent(root)
    let raf = 0
    const COLLAPSE_AFTER = 56

    const readScrollTop = () =>
      scrollParent instanceof Window ? scrollParent.scrollY : (scrollParent as HTMLElement).scrollTop

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const next = readScrollTop() > COLLAPSE_AFTER
        setHeaderCompact((prev) => (prev !== next ? next : prev))
      })
    }

    scrollParent.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => {
      cancelAnimationFrame(raf)
      scrollParent.removeEventListener("scroll", onScroll)
    }
  }, [])

  const onPrevHero = () => {
    setHeroIndex((i) => (i <= 0 ? urls.length - 1 : i - 1))
  }
  const onNextHero = () => {
    setHeroIndex((i) => (i >= urls.length - 1 ? 0 : i + 1))
  }

  return (
    <div ref={pageRootRef} className={cn(max2Layout.pageStack)}>
      {/* Unified secondary chrome: inventory line tabs + vehicle title (same sticky shell as Studio nav) */}
      <div
        className={cn(
          max2Classes.moduleSecondaryNavShell,
          "border-b border-spyne-border transition-shadow duration-200 motion-reduce:transition-none",
          headerCompact && "shadow-sm",
        )}
      >
        <div className="min-w-0 w-full px-max2-page">
          <StudioInventoryLineTabs className="!border-b-0" />
        </div>
        <div className={max2Classes.studioInventoryTabHairline} aria-hidden />
        <div
          className={cn(
            max2Classes.vehicleDisplayPageStickyInner,
            "transition-[padding] duration-200 motion-reduce:transition-none",
            headerCompact ? "pb-2 pt-2" : "pt-4 pb-4",
          )}
        >
          <div
            className={cn(
              "flex flex-wrap justify-between gap-3",
              headerCompact ? "items-center gap-y-2" : "items-start gap-4",
            )}
          >
            <div className={cn("flex min-w-0 flex-1 gap-3", headerCompact ? "items-center" : "items-start")}>
              <button
                type="button"
                onClick={() => router.push("/max-2/studio/inventory")}
                className={cn(
                  spyneComponentClasses.btnSecondaryMd,
                  "shrink-0 rounded-lg border border-spyne-border bg-white px-2 py-2",
                  headerCompact ? "mt-0" : "mt-0.5",
                )}
                aria-label="Back to Active Inventory"
              >
                <MaterialSymbol name="arrow_back" size={20} className="text-spyne-text" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h1
                    className={cn(
                      max2Classes.pageTitle,
                      !headerCompact && "text-balance",
                      headerCompact && "truncate text-base font-semibold leading-snug tracking-tight",
                    )}
                  >
                    {vehicleTitle}
                  </h1>
                  {!headerCompact ? (
                    <span
                      className={cn(
                        spyneComponentClasses.badgePillInline,
                        v.isNew ? "bg-spyne-primary/10 text-spyne-primary" : "bg-spyne-info/10 text-spyne-info",
                      )}
                    >
                      {v.isNew ? "New" : "Pre-Owned"}
                    </span>
                  ) : null}
                </div>
                {!headerCompact ? (
                  <div className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-1 text-sm">
                    <CopyOnClickIdentifier value={formatVinForDisplay(v.vin)} />
                    <span className="text-muted-foreground" aria-hidden>
                      ·
                    </span>
                    <CopyOnClickIdentifier value={stockLabel(v)} />
                    <span className="text-muted-foreground" aria-hidden>
                      ·
                    </span>
                    <CopyOnClickIdentifier value={demoRegistrationFromVin(v.vin)} />
                  </div>
                ) : null}
              </div>
            </div>

            <div
              className={cn(
                "flex min-w-0 flex-wrap items-center justify-end gap-2",
                headerCompact && "max-w-full gap-1.5 sm:gap-2",
              )}
            >
              <VehicleVdpToolbarActions vin={v.vin} compact={headerCompact} />
            </div>
          </div>

          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
              headerCompact ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
            )}
            aria-hidden={headerCompact}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="mt-4 flex flex-col gap-3 border-t border-spyne-border/80 pt-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 font-medium text-spyne-success">
                    <MaterialSymbol name="check_circle" size={18} aria-hidden />
                    {formatSyncLine(syncTs)}
                  </span>
                  <span className="hidden text-muted-foreground sm:inline" aria-hidden>
                    ·
                  </span>
                  <span className="text-spyne-text">
                    {v.photoCount} images · {formatPrice(v.price)} · {v.bodyStyle ?? "Sedan"} ·{" "}
                    <span className={wholesale ? "font-semibold text-spyne-warning-ink" : "font-medium"}>
                      {wholesale ? "Wholesale" : "Retail"}
                    </span>
                  </span>
                </div>
                <div className="shrink-0 text-right text-xs text-muted-foreground">
                  {listingTouch ? (
                    <p className="tabular-nums">
                      {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(listingTouch))}
                    </p>
                  ) : null}
                  <p className="mt-0.5">
                    <span className="font-semibold text-spyne-text">{v.daysInStock} days</span> in stock · Last edit studio@mega-dealer.com
                  </p>
                </div>
              </div>

              {instantBanner ? (
                <div
                  className="mt-4 flex items-center gap-2 rounded-lg border border-spyne-info/25 px-3 py-2 text-sm"
                  style={{ backgroundColor: `${spyneConsoleTokens.info}14` }}
                >
                  <MaterialSymbol name="bolt" size={18} className="text-spyne-info" aria-hidden />
                  <span className="font-medium text-spyne-text">This vehicle is using Instant Media.</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="min-w-0 px-max2-page">
      {/* Section switcher (segmented control): 16px above, 12px below */}
      <div className="w-full min-w-0 overflow-x-auto pt-4 pb-3">
        <SpyneSegmentedControl
          aria-label="Vehicle display sections"
          className={cn("min-w-max", spyneComponentClasses.segmentedLg)}
        >
          <SpyneSegmentedButton active={tab === "photos"} onClick={() => setTab("photos")}>
            <VdpTabButtonContent icon="dashboard">Photos</VdpTabButtonContent>
          </SpyneSegmentedButton>
          <SpyneSegmentedButton active={tab === "vehicle"} onClick={() => setTab("vehicle")}>
            <VdpTabButtonContent icon="directions_car">Vehicle details</VdpTabButtonContent>
          </SpyneSegmentedButton>
          <SpyneSegmentedButton active={tab === "media"} onClick={() => setTab("media")}>
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <MaterialSymbol name="perm_media" size={20} className="opacity-95" />
              Media
              <TabStatusIcon stage={aggregatePipelineTab(pipeline)} />
            </span>
          </SpyneSegmentedButton>
          <SpyneSegmentedButton active={tab === "images"} onClick={() => setTab("images")}>
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <MaterialSymbol name="image" size={20} className="opacity-95" />
              Images
              <TabStatusIcon stage={pipelineTabIconForImages(pipeline)} />
            </span>
          </SpyneSegmentedButton>
          <SpyneSegmentedButton active={tab === "spin360"} onClick={() => setTab("spin360")}>
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <MaterialSymbol name="360" size={20} className="opacity-95" />
              360° spin
              <TabStatusIcon stage={pipelineTabIconForSpin(pipeline)} />
            </span>
          </SpyneSegmentedButton>
          <SpyneSegmentedButton active={tab === "video"} onClick={() => setTab("video")}>
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <MaterialSymbol name="videocam" size={20} className="opacity-95" />
              Video tour
              <TabStatusIcon stage={pipelineTabIconForVideo(v, pipeline)} />
            </span>
          </SpyneSegmentedButton>
          <SpyneSegmentedButton active={tab === "financials"} onClick={() => setTab("financials")}>
            <VdpTabButtonContent icon="payments">Financials</VdpTabButtonContent>
          </SpyneSegmentedButton>
          <SpyneSegmentedButton active={tab === "documents"} onClick={() => setTab("documents")}>
            <VdpTabButtonContent icon="folder_open">Documents</VdpTabButtonContent>
          </SpyneSegmentedButton>
        </SpyneSegmentedControl>
      </div>

      {/* KPI strip (always visible under tabs for scan) */}
      <div className="mb-6">
        <SpyneRoiKpiStrip gridClassName="lg:grid-cols-5">
          <SpyneRoiKpiMetricCell label="List price" value={formatPrice(v.price)} sub="Window · DMS" />
          <SpyneRoiKpiMetricCell label="Est. front gross" value={formatPrice(estGross)} sub="Merchandising model" />
          <SpyneRoiKpiMetricCell label="Holding (total)" value={formatPrice(holdingAccum)} sub={`${formatPrice(holdingPerDay)}/day`} />
          <SpyneRoiKpiMetricCell label="Holding vs gross" value={`${holdingPctOfGross}%`} sub="Of est. front gross" />
          <SpyneRoiKpiMetricCell label="VDP views (30d)" value={String(v.vdpViews)} sub="Marketing signal" />
        </SpyneRoiKpiStrip>
      </div>

      {tab === "photos" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <section className={cn(max2Classes.overviewPanelShell, "lg:col-span-4")}>
            <div className={max2Classes.overviewPanelHeader}>
              <h2 className={spyneComponentClasses.cardTitle}>Publishing status</h2>
              <p className={max2Classes.overviewPanelDescription}>Where this unit is live or queued.</p>
            </div>
            <div className="space-y-0 px-5 pb-5">
              <div className={cn(spyneComponentClasses.insightRow, "p-0 overflow-hidden")}>
                <div className="flex gap-4 py-4">
                  <div
                    className={cn(spyneComponentClasses.insightRowIconWell, "shrink-0 self-start")}
                    style={{ backgroundColor: `${spyneConsoleTokens.chipOrange}22` }}
                  >
                    <span className="text-sm font-bold" style={{ color: spyneConsoleTokens.chipOrange }}>
                      V
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={cn(spyneComponentClasses.insightRowTitle, "m-0")}>vAuto</p>
                      <SpynePublishStatusChip publishStatus={v.publishStatus} compact />
                    </div>
                    <p className={spyneComponentClasses.insightRowMeta}>{formatPublishedLine(v.lastPublishedAt)}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.publishStatus === "live" ? "Synced to frontline feeds" : "Sync awaiting listing readiness"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-spyne-border pt-4">
                <SpyneMediaStatusChip mediaStatus={v.mediaStatus} compact />
                <SpynePublishStatusChip publishStatus={v.publishStatus} compact />
              </div>
            </div>
          </section>

          <section className={cn(max2Classes.overviewPanelShell, "lg:col-span-8")}>
            <div className={cn(max2Classes.overviewPanelHeader, "flex flex-row flex-wrap items-start justify-between gap-3")}>
              <h2 className={spyneComponentClasses.cardTitle}>Photos</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">View Input</span>
                <Switch checked={viewInput} onCheckedChange={setViewInput} aria-label="Toggle View Input" />
              </div>
            </div>
            <div className="px-5 pb-5">
              {isMerchandisingNoPhotosVehicle(v) ? (
                <div className="flex aspect-[16/9] w-full flex-col items-center justify-center rounded-xl border border-dashed border-spyne-border bg-muted/40">
                  <MaterialSymbol name="hide_image" size={40} className="text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium text-spyne-text">No listing photos yet</p>
                  <Link href={`/max-2/studio/add?vin=${encodeURIComponent(v.vin)}`} className={cn(spyneComponentClasses.btnPrimaryMd, "mt-4 no-underline")}>
                    Add photos
                  </Link>
                </div>
              ) : (
                <>
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-spyne-border bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element -- demo gallery uses static public assets */}
                    <img src={heroSrc} alt="" className="h-full w-full object-contain object-center" />
                    {viewInput ? (
                      <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-1 text-[11px] font-medium text-white">
                        View Input (source files)
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={onPrevHero}
                      className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-spyne-border bg-white/95 shadow-sm transition hover:bg-white"
                      aria-label="Previous image"
                    >
                      <MaterialSymbol name="chevron_left" size={24} />
                    </button>
                    <button
                      type="button"
                      onClick={onNextHero}
                      className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-spyne-border bg-white/95 shadow-sm transition hover:bg-white"
                      aria-label="Next image"
                    >
                      <MaterialSymbol name="chevron_right" size={24} />
                    </button>
                  </div>
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    <button
                      type="button"
                      className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-spyne-border bg-black/90"
                      aria-label="Feature video"
                    >
                      <div className="flex h-full w-full items-center justify-center">
                        <MaterialSymbol name="play_circle" size={32} className="text-white/90" />
                      </div>
                    </button>
                    {urls.map((src, i) => {
                      const active = i === heroIndex
                      return (
                        <button
                          key={`${src}-${i}`}
                          type="button"
                          onClick={() => setHeroIndex(i)}
                          className={cn(
                            "relative h-16 w-28 shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition",
                            active ? "border-spyne-primary" : "border-transparent",
                          )}
                          aria-label={`Photo ${i + 1}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="h-full w-full object-cover" />
                          {v.has360 && i === Math.min(3, urls.length - 1) ? (
                            <span className="absolute bottom-1 right-1 rounded bg-spyne-warning px-1 text-[9px] font-bold text-spyne-warning-ink">
                              360°
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === "vehicle" && (
        <section className={max2Classes.overviewPanelShell}>
          <div className={max2Classes.overviewPanelHeader}>
            <h2 className={spyneComponentClasses.cardTitle}>Vehicle details</h2>
            <p className={max2Classes.overviewPanelDescription}>Specs pulled from inventory and vAuto.</p>
          </div>
          <dl className="grid gap-4 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Year", String(v.year)],
              ["Make", v.make],
              ["Model", v.model],
              ["Trim", v.trim || "—"],
              ["Exterior", v.exteriorColor ?? "—"],
              ["Body style", v.bodyStyle ?? "—"],
              ["Fuel", v.fuelType ?? "—"],
              ["Odometer", `${new Intl.NumberFormat("en-US").format(v.odometer)} mi`],
              ["Combined MPG", v.combinedMpg != null ? String(v.combinedMpg) : "—"],
              ["Stock", stockLabel(v)],
              ["VIN", formatVinForDisplay(v.vin)],
              ["Listing ID", v.listingExternalId ?? "—"],
            ].map(([label, val]) => (
              <div key={label} className="rounded-lg border border-spyne-border/80 bg-muted/20 px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-spyne-text">{val}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {tab === "media" && (
        <section className={max2Classes.overviewPanelShell}>
          <div className={max2Classes.overviewPanelHeader}>
            <h2 className={spyneComponentClasses.cardTitle}>Media pipeline</h2>
            <p className={max2Classes.overviewPanelDescription}>Studio stages for images, spin, and video.</p>
          </div>
          <div className="px-5 pb-5">
            <MerchandisingMediaPipelineCell vehicle={v} />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-spyne-border/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Photo count</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-spyne-text">{v.photoCount}</p>
              </div>
              <div className="rounded-lg border border-spyne-border/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Media score</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-spyne-text">{v.listingScore}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === "images" && (
        <section className={max2Classes.overviewPanelShell}>
          <div className={max2Classes.overviewPanelHeader}>
            <h2 className={spyneComponentClasses.cardTitle}>Images</h2>
            <p className={max2Classes.overviewPanelDescription}>Gallery and hero coverage for this listing.</p>
          </div>
          <div className="px-5 pb-5 text-sm text-spyne-text">
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>Hero angle: {v.wrongHeroAngle ? "Needs retake" : "On target"}</li>
              <li>Interior and exterior: {v.incompletePhotoSet ? "Incomplete set flagged" : "Coverage OK"}</li>
              <li>Glare cleanup: {v.hasSunGlare ? "Sun glare detected" : "None flagged"}</li>
            </ul>
            <Link href="/max-2/studio/inventory" className="mt-4 inline-flex text-sm font-semibold text-spyne-primary hover:underline">
              Back to Active Inventory
            </Link>
          </div>
        </section>
      )}

      {tab === "spin360" && (
        <section className={max2Classes.overviewPanelShell}>
          <div className={max2Classes.overviewPanelHeader}>
            <h2 className={spyneComponentClasses.cardTitle}>360° spin</h2>
            <p className={max2Classes.overviewPanelDescription}>Interactive spin for this stock number.</p>
          </div>
          <div className="flex flex-col items-center justify-center px-5 pb-8 pt-2">
            {v.has360 ? (
              <div className="flex aspect-video w-full max-w-lg items-center justify-center rounded-xl border border-spyne-border bg-muted/30">
                <MaterialSymbol name="360" size={48} className="text-spyne-primary" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No 360° spin yet. Generate spin from Studio.</p>
            )}
            <Link
              href={`/max-2/studio/add?vin=${encodeURIComponent(v.vin)}&focus=360`}
              className={cn(spyneComponentClasses.btnPrimaryMd, "mt-6 no-underline")}
            >
              {v.has360 ? "Replace 360°" : "Generate 360°"}
            </Link>
          </div>
        </section>
      )}

      {tab === "video" && (
        <section className={max2Classes.overviewPanelShell}>
          <div className={max2Classes.overviewPanelHeader}>
            <h2 className={spyneComponentClasses.cardTitle}>Video tour</h2>
            <p className={max2Classes.overviewPanelDescription}>Walkaround and feature clips.</p>
          </div>
          <div className="px-5 pb-8">
            {v.hasVideo ? (
              <div className="flex aspect-video w-full max-w-2xl items-center justify-center rounded-xl border border-spyne-border bg-black/90">
                <MaterialSymbol name="play_circle" size={56} className="text-white/90" />
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border border-spyne-error/25 bg-spyne-error/5 p-4 text-sm">
                <MaterialSymbol name="error" className="mt-0.5 shrink-0 text-spyne-error" size={20} />
                <div>
                  <p className="font-semibold text-spyne-text">Walkaround video missing</p>
                  <p className="mt-1 text-muted-foreground">
                    Add a walkthrough so shoppers stay on the VDP longer.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === "financials" && (
        <section className={max2Classes.overviewPanelShell}>
          <div className={max2Classes.overviewPanelHeader}>
            <h2 className={spyneComponentClasses.cardTitle}>Holding cost and margin</h2>
            <p className={max2Classes.overviewPanelDescription}>Estimated economics for this unit (demo model).</p>
          </div>
          <div className="px-5 pb-5">
            <SpyneRoiKpiStrip gridClassName="lg:grid-cols-4">
              <SpyneRoiKpiMetricCell label="Days in stock" value={`${v.daysInStock}d`} sub="Age clock" />
              <SpyneRoiKpiMetricCell label="Holding total" value={formatPrice(holdingAccum)} sub={`${formatPrice(holdingPerDay)} × ${v.daysInStock}d`} />
              <SpyneRoiKpiMetricCell label="Est. front gross" value={formatPrice(estGross)} sub="Before holding" />
              <SpyneRoiKpiMetricCell
                label="Net margin (est.)"
                value={formatPrice(netMarginEst)}
                sub={netMarginEst >= 0 ? "After holding" : "Holding exceeds proxy gross"}
              />
            </SpyneRoiKpiStrip>
            <p className="mt-4 text-xs text-muted-foreground">
              Rates follow your Studio holding setup. Update daily carry in Lot Overview if needed.
            </p>
          </div>
        </section>
      )}

      {tab === "documents" && (
        <section className={max2Classes.overviewPanelShell}>
          <div className={max2Classes.overviewPanelHeader}>
            <h2 className={spyneComponentClasses.cardTitle}>Documents</h2>
            <p className={max2Classes.overviewPanelDescription}>Window sticker, buyer&apos;s guide, and title copies.</p>
          </div>
          <ul className="divide-y divide-spyne-border px-5 pb-5">
            {[
              { icon: "description" as const, name: "Window sticker (PDF)", meta: "Generated from vAuto" },
              { icon: "shield" as const, name: "Buyer's guide", meta: "Compliance pack" },
              { icon: "folder_open" as const, name: "Title snapshot", meta: "Dealer copy" },
            ].map((doc) => (
              <li key={doc.name} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <MaterialSymbol name={doc.icon} size={20} className="text-spyne-text" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-spyne-text">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.meta}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className={cn(spyneComponentClasses.btnSecondaryMd, "shrink-0 text-xs")}
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      </div>
    </div>
  )
}
