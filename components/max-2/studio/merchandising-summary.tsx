"use client"

import { useState, useCallback, useMemo, useRef, type ElementType, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { mockMerchandisingSummary, mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import { demoVehicleThumbnailByKey } from "@/lib/demo-vehicle-hero-images"
import { cn } from "@/lib/utils"
import { max2Classes, spyneComponentClasses, spyneConsoleTokens } from "@/lib/design-system/max-2"
import {
  SpyneChip,
  SpynePublishStatusChip,
  SpyneSeverityChip,
} from "@/components/max-2/spyne-ui"
import { Max2ActionTab, Max2ActionTabStrip } from "@/components/max-2/max2-action-tab"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import {
  SpyneRoiKpiMetricCell,
  SpyneRoiKpiStrip,
} from "@/components/max-2/spyne-roi-kpi-strip"
import {
  Clock, Globe, Camera, FileText, Eye,
  ArrowRight, ImageOff, Tag, ExternalLink,
  Sun, Video, Images, AlertTriangle, Zap, Sparkles,
  ChevronRight, ChevronDown, Crown, Megaphone, BookOpen, Copy, Check,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { StudioInventoryVehicleThumb, VehicleMediaTable } from "@/components/max-2/studio/vehicle-media-table"
import { AiInsightsShell, InsightCard } from "@/components/max-2/studio/ai-insight-card"
import { DaysToFrontlineModal } from "@/components/max-2/studio/days-to-frontline-modal"
import {
  MerchandisingActionPitchBanners,
  PerfectVinExampleModal,
  type MerchandisingActionTabKey,
} from "@/components/max-2/studio/merchandising-action-pitch-banners"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { MerchandisingVehicle, MediaStatus, PublishStatus } from "@/services/max-2/max-2.types"
import { MerchandisingMediaPipelineCell } from "@/components/max-2/studio/merchandising-media-pipeline-cell"
import { StudioInventorySortIcon } from "@/components/max-2/studio/studio-inventory-sort-icon"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

/** Merchandising KPI strip: compact “How to improve” control (all three metrics). */
const merchandisingKpiHowToImproveClass =
  "inline-flex items-center gap-0.5 shrink-0 self-start text-[10px] sm:text-[11px] font-medium leading-none text-spyne-primary hover:underline pt-0.5"

const merchandisingKpiValueSizeClass = "text-2xl"
const merchandisingKpiSubSizeClass = "text-[10px] leading-snug"

type InsightTone = "success" | "warning" | "critical"

type InsightItem = {
  id: string
  cardTitle: string
  iconTone: InsightTone
  icon: ElementType
  metricLine: string
  inventoryHref: string
  metrics: { label: string; value: string }[]
}

const INSIGHT_ICON_WELL: Record<InsightTone, string> = {
  success: spyneComponentClasses.insightRowIconWellSuccess,
  warning: spyneComponentClasses.insightRowIconWellWarning,
  critical: spyneComponentClasses.insightRowIconWellCritical,
}

/** Icon color — darker tonal shade matching the well bg, sourced from design-system vars */
const INSIGHT_ICON_COLOR: Record<InsightTone, string> = {
  success: "text-[color:var(--spyne-success)]",
  warning: "text-[color:var(--spyne-warning-ink)]",
  critical: "text-[color:var(--spyne-error)]",
}

const INSIGHT_CHIP_TONE: Record<InsightTone, "success" | "warning" | "error"> = {
  success: "success",
  warning: "warning",
  critical: "error",
}

const INSIGHT_CHIP_LABEL: Record<InsightTone, string> = {
  success: "Resolved",
  warning: "In Progress",
  critical: "Needs Action",
}

function InsightRow({ item }: { item: InsightItem }) {
  const Icon = item.icon
  const tone = item.iconTone

  return (
    <div className={cn(spyneComponentClasses.insightRow, "p-0 overflow-hidden")}>
      <div className="flex gap-4 px-5 py-4">
        {/* Icon well */}
        <div className={cn(spyneComponentClasses.insightRowIconWell, INSIGHT_ICON_WELL[tone], "shrink-0 self-start mt-0.5")}>
          <Icon className={cn("h-4 w-4 shrink-0", INSIGHT_ICON_COLOR[tone])} aria-hidden />
        </div>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Title */}
          <p className={cn(spyneComponentClasses.insightRowTitle, "truncate")}>
            {item.cardTitle}
          </p>
          {/* Meta line */}
          <p className={spyneComponentClasses.insightRowMeta}>{item.metricLine}</p>
          {/* Metrics chips — single row, no wrap */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {item.metrics.map((m) => (
              <div
                key={m.label}
                className="flex shrink-0 items-center gap-1 rounded-full border border-spyne-border bg-white px-3 py-1"
              >
                <span className="text-xs font-bold tabular-nums text-spyne-text">{m.value}</span>
                <span className="text-xs text-spyne-text-secondary">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* View Details — top-right corner */}
        <Link
          href={item.inventoryHref}
          className="inline-flex shrink-0 items-center gap-1 self-start whitespace-nowrap text-xs font-medium text-spyne-primary transition-opacity hover:opacity-80"
        >
          View Details
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}

function fmtPrice(p: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p)
}

function HighlightNums({ text }: { text: string }) {
  const parts = text.split(/([\d,]+(?:\.\d+)?)/)
  return (
    <>
      {parts.map((part, i) =>
        /^\d/.test(part) ? (
          <span key={i} className="font-semibold text-[#1a1a1a]">{part}</span>
        ) : (
          part
        )
      )}
    </>
  )
}

type SummaryVehicleSortField = "age" | "score" | "views" | "price"

const DEFAULT_SUMMARY_SORT_FIELD: SummaryVehicleSortField = "age"
const DEFAULT_SUMMARY_SORT_DIR: "asc" | "desc" = "desc"

function VehicleTable({ vehicles, issueBadge }: { vehicles: MerchandisingVehicle[]; issueBadge?: (v: MerchandisingVehicle) => ReactNode }) {
  const [sortField, setSortField] = useState<SummaryVehicleSortField>(DEFAULT_SUMMARY_SORT_FIELD)
  /** `null` = default (age, descending). */
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null)

  const toggleSummarySort = (f: SummaryVehicleSortField) => {
    if (sortDir !== null && sortField === f) {
      if (sortDir === "asc") setSortDir("desc")
      else {
        setSortField(DEFAULT_SUMMARY_SORT_FIELD)
        setSortDir(null)
      }
    } else {
      setSortField(f)
      setSortDir("asc")
    }
  }

  const sortedVehicles = useMemo(() => {
    const rows = [...vehicles]
    const effField = sortDir === null ? DEFAULT_SUMMARY_SORT_FIELD : sortField
    const effDir = sortDir === null ? DEFAULT_SUMMARY_SORT_DIR : sortDir
    rows.sort((a, b) => {
      let c = 0
      switch (effField) {
        case "age":
          c = a.daysInStock - b.daysInStock
          break
        case "score":
          c = a.listingScore - b.listingScore
          break
        case "views":
          c = a.vdpViews - b.vdpViews
          break
        case "price":
          c = a.price - b.price
          break
        default:
          break
      }
      return effDir === "asc" ? c : -c
    })
    return rows
  }, [vehicles, sortField, sortDir])

  if (vehicles.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No vehicles in this category.</p>
  }
  const TH = ({
    children,
    right,
    center,
    className,
    onClick,
  }: {
    children: ReactNode
    right?: boolean
    center?: boolean
    className?: string
    onClick?: () => void
  }) => (
    <th
      className={cn(
        spyneComponentClasses.studioInventoryTableHeadCell,
        right && spyneComponentClasses.studioInventoryTableHeadCellRight,
        center && spyneComponentClasses.studioInventoryTableHeadCellCenter,
        onClick && "cursor-pointer select-none",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </th>
  )
  return (
    <div className="overflow-x-auto">
      <table className={spyneComponentClasses.studioInventoryTable}>
        <thead>
          <tr className={spyneComponentClasses.studioInventoryTableHeaderRow}>
            <TH className={spyneComponentClasses.studioInventoryTableThumbCol}>
              <span className="sr-only">Thumb</span>
            </TH>
            <TH className={spyneComponentClasses.studioInventoryTableVehicleColAfterThumb}>Vehicle</TH>
            <TH>Media</TH>
            <TH center>Status</TH>
            <TH center onClick={() => toggleSummarySort("score")}>
              <span className="inline-flex w-full items-center justify-center gap-1.5">
                <span>Score</span>
                <StudioInventorySortIcon active={sortDir !== null && sortField === "score"} direction={sortDir ?? "asc"} />
              </span>
            </TH>
            <TH center onClick={() => toggleSummarySort("age")}>
              <span className="inline-flex w-full items-center justify-center gap-1.5">
                <span>Age</span>
                <StudioInventorySortIcon active={sortDir !== null && sortField === "age"} direction={sortDir ?? "asc"} />
              </span>
            </TH>
            <TH center onClick={() => toggleSummarySort("views")}>
              <span className="inline-flex w-full min-w-0 items-center justify-center gap-1.5">
                <span className="inline-flex items-center gap-1">
                  <span>Views</span>
                  <span
                    className="inline-flex leading-none text-spyne-text-secondary"
                    title="Vehicle Detail Page views"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MaterialSymbol name="info" size={16} />
                  </span>
                </span>
                <StudioInventorySortIcon active={sortDir !== null && sortField === "views"} direction={sortDir ?? "asc"} />
              </span>
            </TH>
            {issueBadge && <TH center>Issue</TH>}
            <TH center onClick={() => toggleSummarySort("price")}>
              <span className="inline-flex w-full items-center justify-center gap-1.5">
                <span>Price</span>
                <StudioInventorySortIcon active={sortDir !== null && sortField === "price"} direction={sortDir ?? "asc"} />
              </span>
            </TH>
          </tr>
        </thead>
        <tbody>
          {sortedVehicles.map((v) => (
              <tr key={v.vin} className={spyneComponentClasses.studioInventoryTableRow}>
                <td className={cn(spyneComponentClasses.studioInventoryTableCell, "w-28 shrink-0", spyneComponentClasses.studioInventoryTableThumbCol)}>
                  <StudioInventoryVehicleThumb
                    v={v}
                    roundedClassName="rounded-md"
                    surfaceClassName="bg-muted"
                  />
                </td>
                {/* Vehicle */}
                <td className={cn(spyneComponentClasses.studioInventoryTableCell, "min-w-[160px]", spyneComponentClasses.studioInventoryTableVehicleColAfterThumb)}>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{v.year} {v.make} {v.model}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{v.trim}</p>
                </td>
                {/* Media */}
                <td className={spyneComponentClasses.studioInventoryTableCell}>
                  <MerchandisingMediaPipelineCell vehicle={v} />
                </td>
                {/* Status */}
                <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-center")}>
                  <SpynePublishStatusChip publishStatus={v.publishStatus} compact />
                </td>
                {/* Score */}
                <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-center")}>
                  <span className={cn("text-sm font-semibold tabular-nums", v.listingScore >= 75 ? "text-spyne-success" : v.listingScore >= 50 ? "text-spyne-text" : "text-spyne-error")}>
                    {v.listingScore}
                  </span>
                </td>
                {/* Age */}
                <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-center whitespace-nowrap")}>
                  <span className={cn("text-sm tabular-nums", v.daysInStock >= 45 ? "text-spyne-error font-semibold" : v.daysInStock >= 30 ? "text-spyne-text font-semibold" : "")}>
                    {v.daysInStock}d
                  </span>
                </td>
                {/* Views */}
                <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-center text-sm tabular-nums text-muted-foreground")}>{v.vdpViews}</td>
                {/* Issue */}
                {issueBadge && <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-center whitespace-nowrap")}>{issueBadge(v)}</td>}
                {/* Price */}
                <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-center text-sm font-medium tabular-nums whitespace-nowrap")}>{fmtPrice(v.price)}</td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function VehicleListModal({
  open,
  onClose,
  title,
  description,
  vehicles,
  inventoryHref,
}: {
  open: boolean
  onClose: () => void
  title: string
  description: string
  vehicles: MerchandisingVehicle[]
  inventoryHref: string
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-snug">{description}</p>
          <div className="max-h-[420px] overflow-y-auto rounded-xl border border-spyne-border">
            <VehicleMediaTable vehicles={vehicles} showCheckboxes={false} embedded />
          </div>
          <Link
            href={inventoryHref}
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-primary bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            See these vehicles in Active Inventory
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}

type TrainingGuideSection = { heading: string; bullets: string[] }

function PhotographerTrainingModal({
  open,
  onClose,
  title,
  badInput,
  improvement,
  sections,
}: {
  open: boolean
  onClose: () => void
  title: string
  badInput: string
  improvement: string
  sections: TrainingGuideSection[]
}) {
  const [copied, setCopied] = useState(false)

  const plainText = useCallback(() => {
    const body = sections
      .map((s) => `${s.heading}\n${s.bullets.map((b) => `• ${b}`).join("\n")}`)
      .join("\n\n")
    return `Training note: ${title}\n\nIssue we saw: ${badInput}\nHow we fixed it: ${improvement}\n\n--- Photographer checklist ---\n\n${body}`
  }, [title, badInput, improvement, sections])

  const handleCopy = () => {
    void navigator.clipboard.writeText(plainText())
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[min(90vh,640px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="h-4 w-4 text-primary shrink-0" />
            Training guide for photographer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
            <div className="mt-3 rounded-lg border bg-muted/30 p-3 space-y-2 text-sm">
              <p>
                <span className="font-semibold text-spyne-text">Bad input: </span>
                <span className="text-muted-foreground">{badInput}</span>
              </p>
              <p>
                <span className="font-semibold text-spyne-success">Made better: </span>
                <span className="text-muted-foreground">{improvement}</span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Send this checklist</p>
            {sections.map((sec) => (
              <div key={sec.heading} className="rounded-lg border p-3">
                <p className="text-sm font-semibold">{sec.heading}</p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  {sec.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="text-primary shrink-0">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied to clipboard" : "Copy for email / SMS"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


/** Recharts donut: score out of 10 (full ring = 10). */
function WebsiteScoreDonutCharts({
  score,
  potentialScore,
  potentialBoost,
}: {
  score: number
  potentialScore: number
  potentialBoost: number
}) {
  const track = spyneConsoleTokens.border

  function pieSlices(value: number) {
    const v = Math.min(Math.max(value, 0), 10)
    const rest = 10 - v
    if (rest <= 0.001) {
      return [{ name: "a", value: 10 }]
    }
    return [
      { name: "a", value: v },
      { name: "b", value: rest },
    ]
  }

  function Donut({ value, mainColor, label }: { value: number; mainColor: string; label: string }) {
    const slices = pieSlices(value)
    const fills = slices.length === 1 ? [mainColor] : [mainColor, track]

    return (
      <div className="relative flex w-[92px] shrink-0 flex-col items-center sm:w-[100px]">
        <div className="h-[88px] w-full sm:h-[92px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="90%"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                paddingAngle={0}
                label={false}
              >
                {slices.map((_, i) => (
                  <Cell key={i} fill={fills[i] ?? track} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div
          className="pointer-events-none absolute left-1/2 top-[40%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          aria-hidden
        >
          <span className="text-xl font-bold tabular-nums leading-none" style={{ color: mainColor }}>
            {value.toFixed(1)}
          </span>
        </div>
        <p className="-mt-0.5 text-center text-[10px] leading-tight text-muted-foreground">{label}</p>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-nowrap items-end justify-center gap-2 overflow-x-auto rounded-lg border border-spyne-border bg-gradient-to-b from-muted/40 to-spyne-surface px-2 py-4 sm:gap-3 sm:px-4">
      <Donut value={score} mainColor={spyneConsoleTokens.warning} label="Your Score" />
      <div className="flex shrink-0 flex-col items-center gap-1 px-0.5 pb-1">
        <span className="max-w-[5.5rem] text-center text-xs font-semibold leading-tight text-spyne-success">
          +{potentialBoost.toFixed(0)} Potential Boost
        </span>
        <div className="flex items-center gap-0.5 text-muted-foreground">
          <div className="h-px w-6 bg-muted-foreground/30 sm:w-7" />
          <ArrowRight className="h-3 w-3 shrink-0" />
        </div>
      </div>
      <Donut value={potentialScore} mainColor={spyneConsoleTokens.success} label="Potential Score" />
    </div>
  )
}

function WebsiteScoreModal({
  open,
  onClose,
  score,
  vehicles,
  summary,
}: {
  open: boolean
  onClose: () => void
  score: number
  vehicles: MerchandisingVehicle[]
  summary: typeof mockMerchandisingSummary
}) {
  const photosPresent = parseFloat(((summary.realPhotos / summary.totalVehicles) * 10).toFixed(1))
  const heroUniformity = parseFloat((((summary.totalVehicles - vehicles.filter(v => v.wrongHeroAngle).length) / summary.totalVehicles) * 10).toFixed(1))
  const bgUniformity = 6.0

  const potentialBoost = 1.8
  const potentialScore = parseFloat(Math.min(10, score + potentialBoost).toFixed(1))

  const subScores = [
    { label: "Photos Present",        desc: "Very few vehicles have real images",              val: photosPresent },
    { label: "Hero Image Uniformity", desc: "Hero angles need to be correct",                  val: heroUniformity },
    { label: "Background Uniformity", desc: "Mixed backgrounds present across website",         val: bgUniformity },
  ]

  const suggestions = [
    "Standardize vehicle photo backgrounds by choosing one approach (either studio-style or outdoor) and reprocessing the outliers to match.",
    "Enforce a single hero image angle rule (for example: front-left 3/4 view) at upload or processing time.",
    "Reorder image sets so the standardized hero angle always appears first on every vehicle card.",
    "Reprocess existing listings that break background or hero-angle consistency to visually align the grid.",
  ]

  const actionItems = [
    { label: "Add photos",           count: vehicles.filter(v => v.mediaStatus === "no-photos").length,        href: "/max-2/studio/inventory?media=no-photos", icon: "hide_image"    },
    { label: "Replace instant media", count: vehicles.filter(v => v.mediaStatus === "clone-photos").length,     href: "/max-2/studio/inventory?media=cgi",       icon: "auto_awesome"  },
    { label: "Add more photos",      count: vehicles.filter(v => v.photoCount > 0 && v.photoCount < 8).length, href: "/max-2/studio/inventory?photos=low",      icon: "photo_library" },
    { label: "Add hero shot",        count: vehicles.filter(v => v.wrongHeroAngle).length,                 href: "/max-2/studio/inventory?issue=hero",      icon: "rotate_right"  },
  ]

  const barColor = (val: number) =>
    val >= 7 ? spyneConsoleTokens.success : val >= 5 ? spyneConsoleTokens.warning : spyneConsoleTokens.error

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[500px] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Improve your media score</DialogTitle>
          <DialogDescription className="sr-only">
            How the score is measured, your current and potential score, insights, suggestions, and links to fix
            listing issues.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* ── Score donuts (Recharts) above methodology ── */}
          <WebsiteScoreDonutCharts
            score={score}
            potentialScore={potentialScore}
            potentialBoost={potentialBoost}
          />

          {/* ── How the score is measured (trimmed) ── */}
          <div className="rounded-lg border border-spyne-border bg-muted/20 p-4 text-left">
            <p className="mb-2 text-xs font-semibold text-foreground">How we measure media score</p>
            <p className="text-sm text-muted-foreground">
              A <span className="font-medium text-foreground">0 to 10</span> composite of how complete and consistent
              your inventory looks on your site.
            </p>
            <ul className="mt-2 list-disc space-y-0.5 pl-4 text-sm text-muted-foreground">
              <li>Real photo coverage</li>
              <li>Hero angle consistency</li>
              <li>Background cohesion</li>
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">
              Descriptions, publish state, and media depth can also move the headline number.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">6.5</span> is a peer average for quick comparison.
            </p>
          </div>

          {/* ── Insights ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Insights</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/5 text-primary border border-primary/20 tracking-wide">
                  ✦ AI POWERED
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">Last synced 12 hours ago ↻</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {subScores.map((item) => (
                <div key={item.label} className="rounded-lg border p-3.5 flex flex-col gap-2.5">
                  <div>
                    <p className="text-xs font-semibold leading-tight">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(item.val / 10) * 100}%`, backgroundColor: barColor(item.val) }} />
                    </div>
                    <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color: barColor(item.val) }}>
                      {item.val}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Suggestions ── */}
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm font-semibold text-primary">Suggestions to boost score</p>
            </div>
            <ul className="space-y-2">
              {suggestions.map((sug, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-snug">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  {sug}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Actions Required ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-spyne-error shrink-0" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-spyne-error">Actions Required</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {actionItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <MaterialSymbol name={item.icon} size={18} className="text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-sm font-semibold text-spyne-error tabular-nums">{item.count}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Website link ── */}
          <a
            href="https://www.dealership.com/inventory"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 hover:bg-primary/10 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-sm font-medium text-primary">View live inventory page</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-primary/60 group-hover:text-primary transition-colors shrink-0" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function MerchandisingSummary() {
  const router = useRouter()
  const s = mockMerchandisingSummary
  const vehicles = mockMerchandisingVehicles

  const [frontlineModalOpen, setFrontlineModalOpen] = useState(false)
  const [websiteScoreModalOpen, setWebsiteScoreModalOpen] = useState(false)
  const [perfectVinExampleOpen, setPerfectVinExampleOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const actionTabScrollRef = useRef<HTMLDivElement>(null)

  // Less-than-N media threshold — user-configurable
  const [less8Threshold, setLess8Threshold] = useState(8)
  const [less8EditOpen, setLess8EditOpen] = useState(false)
  const [less8CustomValue, setLess8CustomValue] = useState("")
  const scrollActionTabs = (dir: "left" | "right") => {
    if (actionTabScrollRef.current) {
      actionTabScrollRef.current.scrollBy({ left: dir === "right" ? 200 : -200, behavior: "smooth" })
    }
  }
  const [opportunityListModal, setOpportunityListModal] = useState<null | { title: string; description: string; vehicles: MerchandisingVehicle[]; href: string }>(null)
  const [trainingModal, setTrainingModal] = useState<null | {
    title: string
    badInput: string
    improvement: string
    sections: TrainingGuideSection[]
  }>(null)
  const [proPlanModalOpen, setProPlanModalOpen] = useState(false)

  const needRealPhotos = vehicles.filter(
    (v) => v.mediaStatus !== "real-photos"
  ).length
  const aged30Plus = vehicles.filter((v) => v.daysInStock >= 30).length
  const missingDesc = vehicles.filter((v) => !v.hasDescription).length
  const notPublished = vehicles.filter(
    (v) => v.publishStatus !== "live"
  ).length
  const preliminaryPhotos = vehicles.filter(
    (v) => v.photoCount > 0 && v.photoCount < 8
  ).length

  const actions = [
    {
      count: needRealPhotos,
      label: "need real photos",
      severity: "critical" as const,
      icon: Camera,
      href: "/max-2/studio/inventory?media=needs-real",
    },
    {
      count: aged30Plus,
      label: "aged 30+ days - review pricing",
      severity: "critical" as const,
      icon: Tag,
      href: "/max-2/studio/inventory?age=30",
    },
    {
      count: notPublished,
      label: "not yet published",
      severity: "warning" as const,
      icon: Eye,
      href: "/max-2/studio/inventory?status=unpublished",
    },
    {
      count: missingDesc,
      label: "missing descriptions",
      severity: "warning" as const,
      icon: FileText,
      href: "/max-2/studio/inventory?desc=missing",
    },
    {
      count: preliminaryPhotos,
      label: "with < 8 photos - schedule shoot",
      severity: "warning" as const,
      icon: ImageOff,
      href: "/max-2/studio/inventory?photos=low",
    },
  ]
    .filter((a) => a.count > 0)
    .sort((a, b) => {
      if (a.severity === "critical" && b.severity !== "critical") return -1
      if (a.severity !== "critical" && b.severity === "critical") return 1
      return b.count - a.count
    })
    .slice(0, 4)

  return (
    <div className="flex flex-col gap-7">
      {/* ── Section 1: ROI metrics (same strip as Lot / Sales overview) ── */}
      <SpyneRoiKpiStrip gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
        {/* Days to Frontline — custom cell with mini distribution chart */}
        {(() => {
          const dtfData = [
            { label: "≤ 3d", count: 9, color: spyneConsoleTokens.success },
            { label: "4–6d", count: 8, color: spyneConsoleTokens.warningInk },
            { label: "7+ d", count: 5, color: spyneConsoleTokens.error },
          ]
          const maxCount = Math.max(...dtfData.map((d) => d.count))
          const valueColor =
            s.avgDaysToFrontline <= 4
              ? "text-spyne-success"
              : s.avgDaysToFrontline <= 5
              ? "text-spyne-text"
              : "text-spyne-error"

          return (
            <div className="grid min-w-0 w-full grid-cols-1 sm:grid-cols-2">
              {/* Left: metric */}
              <div className="flex min-w-0 flex-col justify-between px-5 py-4">
                <div
                  className={cn(
                    spyneComponentClasses.roiKpiMetricLabelRow,
                    "w-full gap-2",
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <p className={spyneComponentClasses.roiKpiMetricLabel}>Days to Frontline</p>
                    <TooltipPrimitive.Provider delayDuration={300}>
                      <TooltipPrimitive.Root>
                        <TooltipPrimitive.Trigger asChild>
                          <button
                            type="button"
                            className="text-muted-foreground/40 hover:text-muted-foreground transition-colors outline-none"
                            aria-label="How it's calculated"
                          >
                            <MaterialSymbol name="info" size={14} />
                          </button>
                        </TooltipPrimitive.Trigger>
                        <TooltipPrimitive.Portal>
                          <TooltipPrimitive.Content
                            side="top"
                            sideOffset={8}
                            className={spyneComponentClasses.darkTooltipRadixContent}
                          >
                            <div className={spyneComponentClasses.darkTooltipPanel}>
                              <p className="mb-3 text-[13px] font-semibold text-[var(--spyne-on-dark-text)]">How it's calculated</p>
                              <div className="flex flex-col gap-2">
                                {[
                                  { icon: "local_shipping", label: "Arrived on lot" },
                                  { icon: "photo_camera",   label: "Photos added" },
                                  { icon: "auto_awesome",   label: "AI processed" },
                                  { icon: "check_circle",   label: "Published to frontline" },
                                ].map((step, i, arr) => (
                                  <div key={step.label}>
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10">
                                        <MaterialSymbol name={step.icon} size={13} className="text-[var(--spyne-on-dark-text)]" />
                                      </div>
                                      <span className={cn("text-[12px]", i === arr.length - 1 ? "font-semibold text-[var(--spyne-on-dark-text)]" : "text-[var(--spyne-on-dark-text-muted)]")}>
                                        {step.label}
                                      </span>
                                    </div>
                                    {i < arr.length - 1 && (
                                      <div className="ml-[11px] h-3 w-px bg-white/15" />
                                    )}
                                  </div>
                                ))}
                              </div>
                              <p className="mt-3 text-[11px] text-[var(--spyne-on-dark-text-muted)]">Avg time from step 1 → 4 across all units</p>
                            </div>
                            <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={14} height={7} />
                          </TooltipPrimitive.Content>
                        </TooltipPrimitive.Portal>
                      </TooltipPrimitive.Root>
                    </TooltipPrimitive.Provider>
                  </div>
                </div>
                <div>
                  <p
                    className={cn(
                      "font-bold tracking-tight mb-1.5 text-foreground",
                      merchandisingKpiValueSizeClass,
                      valueColor,
                    )}
                  >
                    {s.avgDaysToFrontline}d
                  </p>
                  <p className={cn(spyneComponentClasses.roiKpiMetricSub, merchandisingKpiSubSizeClass)}>
                    Avg{" "}
                    <span className="font-semibold text-spyne-text tabular-nums">{s.avgInputTimeDays}d</span>
                    {" to receive photos · Spyne publishes in "}
                    <span className="font-semibold text-spyne-text tabular-nums">
                      {(s.avgSpyneProcessingHours / 24).toFixed(1)}d
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 flex-col justify-center gap-2 px-5 py-4">
                <div className="mb-1 flex items-start justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Distribution
                  </p>
                  <button
                    type="button"
                    className={cn(merchandisingKpiHowToImproveClass, "shrink-0 whitespace-nowrap pt-0")}
                    aria-haspopup="dialog"
                    onClick={() => setFrontlineModalOpen(true)}
                  >
                    How to improve
                    <ChevronRight className="h-3 w-3 shrink-0 opacity-90" aria-hidden />
                  </button>
                </div>
                {dtfData.map((d) => (
                  <div key={d.label} className="flex items-center gap-2">
                    <span className="w-8 shrink-0 text-[10px] tabular-nums text-muted-foreground">{d.label}</span>
                    <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-spyne-border">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(d.count / maxCount) * 100}%`, background: d.color }}
                      />
                    </div>
                    <span className="shrink-0 text-right text-[10px] font-semibold tabular-nums text-spyne-text whitespace-nowrap">{d.count} vehicles</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
        {/* ── Website Listing Score cell ── */}
        {(() => {
          const scored = vehicles.filter((v) => v.listingScore > 0)
          const raw = scored.length > 0
            ? scored.reduce((sum, v) => sum + v.listingScore, 0) / scored.length / 10
            : 9.8
          const score = Math.round(raw * 10) / 10
          const scoreColor = score >= 8 ? "#16A34A" : score >= 6 ? "#D97706" : "#DC2626"
          const statusLabel = score >= 8 ? "Excellent" : score >= 6 ? "Average" : "Needs improvement"
          return (
            <div className="flex min-w-0 flex-col justify-between px-5 py-4">
              {/* Label row — matches Days to Frontline structure */}
              <div className={cn(spyneComponentClasses.roiKpiMetricLabelRow, "w-full gap-2")}>
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <p className={spyneComponentClasses.roiKpiMetricLabel}>Website Listing Score</p>
                  <TooltipPrimitive.Provider delayDuration={200}>
                    <TooltipPrimitive.Root>
                      <TooltipPrimitive.Trigger asChild>
                        <button type="button" className="text-muted-foreground/40 hover:text-muted-foreground transition-colors outline-none" aria-label="About Website Listing Score">
                          <MaterialSymbol name="info" size={14} />
                        </button>
                      </TooltipPrimitive.Trigger>
                      <TooltipPrimitive.Portal>
                        <TooltipPrimitive.Content side="top" sideOffset={8} className={spyneComponentClasses.darkTooltipRadixContent}>
                          <div className={spyneComponentClasses.darkTooltipPanel}>
                            <p className="mb-2.5 text-[13px] font-semibold text-[var(--spyne-on-dark-text)]">Website Listing Score</p>
                            <p className="mb-2 text-[11px] text-[var(--spyne-on-dark-text-muted)]">Avg score across published listings, rated on:</p>
                            <div className="flex flex-col gap-1.5">
                              {[
                                { icon: "check_circle", label: "Consistency", desc: "Uniform angles across all vehicles" },
                                { icon: "image",        label: "Background",  desc: "Clean, brand-compliant backdrop" },
                                { icon: "crop_free",    label: "Hero image",  desc: "Correct front-left 3/4 angle" },
                              ].map((item) => (
                                <div key={item.label} className="flex items-start gap-2">
                                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/10 mt-0.5">
                                    <MaterialSymbol name={item.icon} size={12} className="text-[var(--spyne-on-dark-text)]" />
                                  </div>
                                  <div>
                                    <span className="text-[12px] font-semibold text-[var(--spyne-on-dark-text)]">{item.label}</span>
                                    <span className="text-[11px] text-[var(--spyne-on-dark-text-muted)]"> — {item.desc}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={14} height={7} />
                        </TooltipPrimitive.Content>
                      </TooltipPrimitive.Portal>
                    </TooltipPrimitive.Root>
                  </TooltipPrimitive.Provider>
                </div>
                <Link href="/max-2/studio/inventory" className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-spyne-primary hover:underline underline-offset-2">
                  <MaterialSymbol name="open_in_new" size={13} />
                  See details
                </Link>
              </div>
              {/* Value + sub + last synced — grouped together at the bottom */}
              <div className="flex flex-col gap-1">
                <p className={cn("font-bold tracking-tight", merchandisingKpiValueSizeClass)} style={{ color: scoreColor }}>
                  {score}
                </p>
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn(spyneComponentClasses.roiKpiMetricSub, merchandisingKpiSubSizeClass)}>
                    <span className="font-semibold" style={{ color: scoreColor }}>{statusLabel}</span>
                    {" · out of 10"}
                  </p>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                    Last synced
                    <span className="font-semibold text-spyne-primary">1 hour ago</span>
                    <MaterialSymbol name="refresh" size={12} className="text-spyne-primary" />
                  </span>
                </div>
              </div>
            </div>
          )
        })()}
      </SpyneRoiKpiStrip>

      {/* ── Section 2: Action Items (tabbed) ── */}
      {(() => {
        const tabDefs: {
          key: string
          label: string
          tooltip: string
          icon: ReactNode
          filter: (v: (typeof vehicles)[0]) => boolean
          href: string
        }[] = [
          {
            key: "no-photos",
            label: "No\nPhotos",
            tooltip: "No real photos yet. Listings without photos can't be fully published — schedule a shoot to move these forward.",
            icon: <MaterialSymbol name="hide_image" size={24} />,
            filter: (v) => v.mediaStatus === "no-photos",
            href: "/max-2/studio/inventory?media=no-photos",
          },
          {
            key: "less8",
            label: `Less than ${less8Threshold}\nMedia`,
            tooltip: `Fewer than ${less8Threshold} photos. Industry standard is 25+ images per vehicle — more angles mean higher buyer engagement and more leads.`,
            icon: <MaterialSymbol name="photo_library" size={24} />,
            filter: (v) => v.photoCount > 0 && v.photoCount < less8Threshold,
            href: "/max-2/studio/inventory?photos=low",
          },
          {
            key: "hero",
            label: "Missing Hero\nAngle",
            tooltip: "The hero angle is the first impression buyers see on VDPs. A correct front-left 3/4 angle improves click-through rate.",
            icon: <MaterialSymbol name="crop_free" size={24} />,
            filter: (v) => v.wrongHeroAngle,
            href: "/max-2/studio/inventory?issue=hero",
          },
          {
            key: "no360",
            label: "Generate 360\nSpin",
            tooltip: "Generate a 360° spin from existing photos — no re-shoot needed for eligible vehicles. Spins increase time-on-page and buyer confidence.",
            icon: <MaterialSymbol name="360" size={24} />,
            filter: (v) => !v.has360,
            href: "/max-2/studio/inventory?issue=no360",
          },
          {
            key: "no-interior",
            label: "Missing Interior Photos",
            tooltip: "Interior photos are the #1 buyer request. Vehicles without interior angles see significantly fewer appointment sets.",
            icon: <MaterialSymbol name="weekend" size={24} />,
            filter: (v) => v.incompletePhotoSet && !v.has360,
            href: "/max-2/studio/inventory?issue=no-interior",
          },
          {
            key: "no-exterior",
            label: "Missing Exterior Photos",
            tooltip: "Missing exterior walk-around angles reduce buyer confidence. Add a full exterior set to complete the listing.",
            icon: <MaterialSymbol name="directions_car" size={24} />,
            filter: (v) => v.missingWalkaroundVideo,
            href: "/max-2/studio/inventory?issue=no-exterior",
          },
          {
            key: "smart-match",
            label: "Smart Match\nShoot Pending",
            tooltip: "Smart Match re-processes existing images to align backgrounds, lighting, and angles to your brand standards — no re-shoot needed.",
            icon: <MaterialSymbol name="camera_enhance" size={24} />,
            filter: (v) => v.daysInStock > 20 && v.photoCount < 20 && v.photoCount > 0,
            href: "/max-2/studio/inventory?issue=smart-match",
          },
          {
            key: "quality",
            label: "Image Quality\nIssues",
            tooltip: "Sun glare, blurry shots, or reflections make listings look unprofessional. Reprocess or reshoot to fix these vehicles.",
            icon: <MaterialSymbol name="broken_image" size={24} />,
            filter: (v) => v.hasSunGlare,
            href: "/max-2/studio/inventory?issue=quality",
          },
          {
            key: "non-compliant",
            label: "Non-Compliant\nMedia",
            tooltip: "These listings include media that doesn't meet platform or brand guidelines. Replacing them protects your listing score.",
            icon: <MaterialSymbol name="gpp_bad" size={24} />,
            filter: (v) => v.wrongHeroAngle && v.hasSunGlare,
            href: "/max-2/studio/inventory?issue=non-compliant",
          },
        ]

        const tab = tabDefs[activeTab]
        const matched = vehicles.filter(tab.filter)
        const shown = matched.slice(0, 5)
        const hasMore = matched.length > 5

        return (
          <div
            className={cn(
              max2Classes.overviewPanelShell,
              "mt-0 grid grid-cols-1 gap-x-0 gap-y-0",
            )}
          >
            <div
              className={cn(
                max2Classes.overviewPanelHeader,
                "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className={spyneComponentClasses.cardTitle}>Action Items</p>
                <p className={max2Classes.overviewPanelDescription}>
                  Vehicles grouped by media issue. Click a tab to review and fix.
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
            {/* Horizontally scrollable tab strip with hover arrows */}
            <div className="group/tabs relative px-5 pb-2 pt-0">
              <button
                type="button"
                aria-hidden
                onClick={() => scrollActionTabs("left")}
                className="absolute left-0 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md border border-spyne-border opacity-0 transition-opacity duration-150 group-hover/tabs:opacity-100 hover:bg-muted/80"
              >
                <MaterialSymbol name="chevron_left" size={20} className="text-spyne-text" />
              </button>
              <div
                ref={actionTabScrollRef}
                className="flex gap-3 overflow-x-auto scroll-smooth pb-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {tabDefs.map((t, i) => {
                  const count = vehicles.filter(t.filter).length
                  if (t.key === "less8") {
                    return (
                      <Popover key={t.key} open={less8EditOpen} onOpenChange={setLess8EditOpen}>
                        <div className="group/l8edit relative shrink-0" style={{ width: 144, minWidth: 144 }}>
                          <Max2ActionTab
                            icon={t.icon}
                            title={t.label}
                            tooltip={t.tooltip}
                            count={count}
                            vehicleCountStyle="plain-error"
                            selected={activeTab === i}
                            onClick={() => setActiveTab(i)}
                            className="!w-full !min-w-0"
                          />
                          {/* Pencil — appears on hover, bottom-right corner */}
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              className={cn(
                                "absolute bottom-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-md border border-spyne-border bg-white text-muted-foreground/60 shadow-sm transition-all",
                                "opacity-0 group-hover/l8edit:opacity-100 hover:!text-spyne-primary hover:!border-spyne-primary/30",
                                less8EditOpen && "!opacity-100 !text-spyne-primary !border-spyne-primary/30",
                              )}
                              aria-label="Edit photo threshold"
                            >
                              <MaterialSymbol name="edit" size={12} />
                            </button>
                          </PopoverTrigger>
                        </div>
                        <PopoverContent
                          side="bottom"
                          align="start"
                          sideOffset={8}
                          className="w-52 rounded-xl border border-spyne-border bg-white p-3 shadow-lg"
                        >
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Photo count benchmark
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {[5, 8, 10, 15, 20, 25].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => { setLess8Threshold(n); setLess8EditOpen(false); setLess8CustomValue("") }}
                                className={cn(
                                  "flex h-7 min-w-[38px] items-center justify-center rounded-lg border px-2 text-[12px] font-semibold tabular-nums transition-colors",
                                  n === less8Threshold
                                    ? "border-spyne-primary bg-spyne-primary/10 text-spyne-primary"
                                    : "border-spyne-border bg-muted/30 text-spyne-text hover:border-spyne-primary/40 hover:bg-spyne-primary/5",
                                )}
                              >
                                &lt;{n}
                              </button>
                            ))}
                          </div>
                          <div className="mt-2.5 flex items-center gap-1.5">
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={less8CustomValue}
                              onChange={(e) => setLess8CustomValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const n = parseInt(less8CustomValue, 10)
                                  if (n > 0 && n <= 100) { setLess8Threshold(n); setLess8EditOpen(false); setLess8CustomValue("") }
                                }
                              }}
                              placeholder="Custom…"
                              className="h-7 min-w-0 flex-1 rounded-lg border border-spyne-border bg-muted/20 px-2 text-[12px] tabular-nums text-spyne-text outline-none focus:border-spyne-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const n = parseInt(less8CustomValue, 10)
                                if (n > 0 && n <= 100) { setLess8Threshold(n); setLess8EditOpen(false); setLess8CustomValue("") }
                              }}
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-spyne-primary text-white disabled:opacity-40"
                              disabled={!less8CustomValue || parseInt(less8CustomValue, 10) <= 0}
                            >
                              <MaterialSymbol name="check" size={14} />
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )
                  }
                  return (
                    <Max2ActionTab
                      key={t.key}
                      icon={t.icon}
                      title={t.label}
                      tooltip={t.tooltip}
                      count={count}
                      vehicleCountStyle="plain-error"
                      selected={activeTab === i}
                      onClick={() => setActiveTab(i)}
                      className="!w-[144px] !min-w-[144px] shrink-0"
                    />
                  )
                })}
              </div>
              <button
                type="button"
                aria-hidden
                onClick={() => scrollActionTabs("right")}
                className="absolute right-0 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md border border-spyne-border opacity-0 transition-opacity duration-150 group-hover/tabs:opacity-100 hover:bg-muted/80"
              >
                <MaterialSymbol name="chevron_right" size={20} className="text-spyne-text" />
              </button>
            </div>

            <div className="px-5 pt-4 pb-4">
              <MerchandisingActionPitchBanners
                tabKey={tab.key as MerchandisingActionTabKey}
                vehicles={vehicles}
                onOpenPerfectVinExample={() => setPerfectVinExampleOpen(true)}
              />
            </div>

            <div className="min-w-0">
              <VehicleMediaTable
                vehicles={shown}
                showCheckboxes={false}
                embedded
                merchandisingIssueContext={
                  tab.key === "incomplete" || tab.key === "no-interior" || tab.key === "no-exterior"
                    ? "incomplete-photo-set"
                    : tab.key === "no360"
                      ? "no-360"
                      : "default"
                }
              />
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
        )
      })()}

      {/* ── Section 3: Insights & Opportunities ── */}
      {(() => {
        const sunGlareVehicles = vehicles.filter((v) => v.hasSunGlare)
        const walkaroundVehicles = vehicles.filter((v) => v.missingWalkaroundVideo)
        const lowPhotoVehicles = vehicles.filter((v) => v.photoCount >= 1 && v.photoCount < 25)
        const under8Vehicles = vehicles.filter((v) => v.photoCount > 0 && v.photoCount < 8)
        const notPublishedVehicles = vehicles.filter((v) => v.publishStatus !== "live")

        /** Demo rollup: total units flagged this period; remaining rows still show glare in inventory. */
        const demoSunGlareTotalFlagged = 12
        const sunGlareRemaining = sunGlareVehicles.length
        const sunGlareAutoFixed = Math.max(0, demoSunGlareTotalFlagged - sunGlareRemaining)
        const sunGlareAffected = sunGlareRemaining + sunGlareAutoFixed

        const insights = [
          {
            id: "sun-glare",
            cardTitle: "Sun glare in photos",
            iconTone: "warning" as const,
            icon: Sun,
            metricLine: `Studio AI automatically corrected all ${sunGlareAutoFixed} affected listings.`,
            inventoryHref: "/max-2/studio/inventory?issue=glare",
            badInput: "Shooting into direct sun left blown highlights on glass and paint; detail was lost in post.",
            improvement: `All ${sunGlareAffected} vehicles publish-ready. Studio AI saved your team ~2 hrs of manual retouching.`,
            metrics: [
              { label: "publish-ready", value: `${sunGlareAutoFixed}` },
              { label: "time saved", value: "~2 hrs" },
            ],
            severity: "warning" as const,
            sections: [
              {
                heading: "Shoot position",
                bullets: [
                  "Keep the sun behind you or at 45° — never straight into the lens for hero shots.",
                  "If the lot forces backlight, bracket exposure or use a polarizer on exterior glass.",
                ],
              },
              {
                heading: "Time of day",
                bullets: [
                  "Schedule north-facing rows in early morning; south-facing rows after 3pm when possible.",
                  "Avoid noon for dark paint — hotspots are hardest to recover then.",
                ],
              },
            ] satisfies TrainingGuideSection[],
          },
          {
            id: "walkaround-360",
            cardTitle: "Missing 360° Videos",
            iconTone: "warning" as const,
            icon: Video,
            metricLine: `Studio AI is generating 360° walk-arounds for ${walkaroundVehicles.length} vehicles right now.`,
            inventoryHref: "/max-2/studio/inventory?issue=no360",
            badInput: "Clips were too short, shaky, or skipped the full vehicle perimeter, so the 360 pipeline could not align frames.",
            improvement: `Videos auto-publish when done, ~1 day out. No action needed from your team.`,
            metrics: [
              { label: "queued", value: `${walkaroundVehicles.length}` },
              { label: "ETA", value: "~1 day" },
              { label: "dealer action", value: "not needed" },
            ],
            severity: "warning" as const,
            sections: [
              {
                heading: "Capture path",
                bullets: [
                  "Walk a full 360° at consistent distance (one car length) and steady height.",
                  "Start and end at the same point so the seam blends in processing.",
                ],
              },
              {
                heading: "Camera settings",
                bullets: [
                  "Lock exposure for the whole lap — no auto ISO ramping mid-walk.",
                  "Hold 1080p or higher; avoid digital zoom while moving.",
                ],
              },
            ] satisfies TrainingGuideSection[],
          },
          {
            id: "photo-count-industry",
            cardTitle: "Below Photo Standard",
            iconTone: "success" as const,
            icon: Images,
            metricLine: `Studio AI recovered ${Math.round(lowPhotoVehicles.length * 0.75)} of ${lowPhotoVehicles.length} vehicles.`,
            inventoryHref: "/max-2/studio/inventory?issue=incomplete",
            badInput: "Sets stopped after basics (front, rear, dash) without full exterior walk, interior detail, and feature shots.",
            improvement: `${lowPhotoVehicles.length - Math.round(lowPhotoVehicles.length * 0.75)} vehicles still need a reshoot. Studio AI can't fill angles never captured.`,
            metrics: [
              { label: "publish-ready", value: `${Math.round(lowPhotoVehicles.length * 0.75)}` },
              { label: "still need more photos", value: `${lowPhotoVehicles.length - Math.round(lowPhotoVehicles.length * 0.75)}` },
            ],
            severity: "warning" as const,
            sections: [
              {
                heading: "Minimum set",
                bullets: [
                  "Exterior: 3/4 front, 3/4 rear, straight sides, wheels, bed/trunk if applicable.",
                  "Interior: dash, seats, rear seat, cargo, infotainment, odometer, VIN plate.",
                ],
              },
              {
                heading: "Dealer standards",
                bullets: [
                  "Duplicate angles only if trim-specific (e.g. sunroof open/closed).",
                  "Upload full resolution — no aggressive in-camera crop.",
                ],
              },
            ] satisfies TrainingGuideSection[],
          },
          {
            id: "under-8-exterior",
            cardTitle: "Missing Exterior Photos",
            iconTone: "critical" as const,
            icon: AlertTriangle,
            metricLine: `${under8Vehicles.length - Math.round(under8Vehicles.length * 0.6)} vehicles have exterior gaps Studio AI can’t fill.`,
            inventoryHref: "/max-2/studio/inventory?issue=under8",
            badInput: "Exteriors were rushed or partial, leaving gaps in the buyer’s visual walk-around.",
            improvement: `Too incomplete for AI recovery. Schedule a reshoot today. Each day offline costs ~$38/unit.`,
            metrics: [
              { label: "enhanced by AI", value: `${Math.round(under8Vehicles.length * 0.6)}` },
              { label: "need reshoot", value: `${under8Vehicles.length - Math.round(under8Vehicles.length * 0.6)}` },
              { label: "time saved", value: "~3 hrs" },
            ],
            severity: "critical" as const,
            sections: [
              {
                heading: "Exterior pass",
                bullets: [
                  "Count to 8 before leaving the vehicle: four corners + straight profile both sides minimum.",
                  "Include one tight front badge and one clean rear with plate frame visible.",
                ],
              },
              {
                heading: "QC before upload",
                bullets: [
                  "Scroll the filmstrip in Spyne — if any angle is blurry, re-take before sync.",
                  "Confirm first image is the approved hero angle for the store.",
                ],
              },
            ] satisfies TrainingGuideSection[],
          },
        ]

        const smartCampaignVehicles = vehicles.filter(
          (v) => v.listingScore < 70 || v.daysInStock >= 21
        )

        const opportunities = [
          {
            id: "go-live" as const,
            icon: Zap,
            title: "Go live instantly",
            desc: "No photos on the vehicle yet? Publish the moment Studio AI finishes, with no manual gate on ready listings.",
            benefit: "Faster time-to-live",
            rank: 1 as const,
            proIncludes: [] as string[],
            count: notPublishedVehicles.length,
            countLabel: "not yet live",
            modalVehicles: notPublishedVehicles,
            href: "/max-2/studio/inventory?publishStatus=not-published",
            gradient: "from-spyne-warning to-spyne-warning",
            accent: "ring-spyne-warning/40",
          },
          {
            id: "smart-campaign" as const,
            icon: Megaphone,
            title: "Run smart campaigns",
            desc: "Some vehicles have aged a lot on the lot. Auto-boost weak VDPs with the right creative and budget rules.",
            benefit: "Lift leads on aged and weak listings",
            rank: 2 as const,
            proIncludes: [] as string[],
            count: smartCampaignVehicles.length,
            countLabel: "eligible units",
            modalVehicles: smartCampaignVehicles,
            href: "/max-2/studio/inventory?ageMin=21",
            gradient: "from-spyne-success to-spyne-success",
            accent: "ring-spyne-success/30",
          },
          {
            id: "pro-plan" as const,
            icon: Crown,
            title: "Pro Plan",
            desc: "Full-stack media, priority QA, and automation so every VDP ships complete. Best for high volume stores.",
            benefit: "Best for high volume stores",
            rank: 3 as const,
            proIncludes: [
              "Unlimited AI background & window mask",
              "Priority processing queue & same-day fixes",
              "360° + video add-ons bundled",
              "Dedicated success manager + monthly shoot audits",
            ],
            count: undefined as number | undefined,
            countLabel: undefined as string | undefined,
            modalVehicles: [] as MerchandisingVehicle[],
            href: "/max-2/studio",
            gradient: "from-spyne-primary via-spyne-primary to-spyne-primary",
            accent: "ring-spyne-primary/25",
          },
        ]

        const aiInsightCards = [
          {
            id: "photo-delay-cost",
            variant: "delay" as const,
            contextChip: "Holding Cost Risk",
            insightMeta: "opportunity" as const,
            title: "Delayed photos are increasing holding cost",
            description: "30% of your inventory went live late due to missing photos.",
            recommendation:
              "AI suggests using existing media to reduce go-live delays by up to 40%.",
            ctaLabel: "Go live instantly",
            ctaHref: "/max-2/studio/inventory?publishStatus=not-published",
            metricChip: "30% of inventory",
          },
          {
            id: "richer-media",
            variant: "engagement" as const,
            contextChip: "Pro Plan",
            insightMeta: "high-impact" as const,
            title: "Go beyond photos with Pro",
            description: "Buyers spend 2× longer on listings with 360° spins and video — upgrade once and let AI handle the rest.",
            recommendation:
              "AI recommends adding 360 spins and video to lift engagement where photos alone plateau.",
            ctaLabel: "Unlock Pro Plan",
            onCtaClick: () => setProPlanModalOpen(true),
            metricChip: "High impact",
          },
        ]

        const instantMediaThumbs = (() => {
          const t = vehicles.map((v) => v.thumbnailUrl).filter(Boolean).slice(0, 4) as string[]
          let pad = 0
          while (t.length < 4) {
            t.push(demoVehicleThumbnailByKey(`instant-media-pad-${pad++}`))
          }
          return t
        })()

        return (
          <div className="flex w-full min-w-0 flex-col gap-4">
            <AiInsightsShell
              title="AI Insights"
              subtitle="Smart recommendations to improve your inventory performance"
              lastSynced="Last synced 12 hours ago"
            >
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
                {/* Figma 5592:54613 — instant media library card */}
                <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white">
                  {/* Yellow insight banner — full width, flush top */}
                  <div className="flex items-start gap-3 bg-[#FFF8E1] px-5 py-3">
                    <MaterialSymbol name="smart_toy" size={18} className="mt-0.5 shrink-0 text-[#B45309]" />
                    <p className="text-[12px] font-medium leading-5 text-[#78350F]">
                      <span className="font-semibold">30%</span> of your inventory has been slow-moving because photos took an average of{" "}
                      <span className="font-semibold">32 days</span> to arrive or had bad quality
                    </p>
                  </div>

                  {/* Card body — content left (full height), image right (bottom-aligned) */}
                  <div className="flex flex-1 items-stretch gap-10 px-6 pb-6 pt-5">
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-1">
                          <p className="text-[16px] font-semibold leading-6 text-[#402387]">
                            Go live Instantly with your media library!
                          </p>
                          <span
                            className="mt-0.5 inline-flex shrink-0 items-center gap-0.5 rounded-full py-0.5 pl-1 pr-2 text-[10px] font-semibold text-white"
                            style={{ background: "linear-gradient(to left, #2190ff, #9328ff)" }}
                          >
                            <MaterialSymbol name="auto_awesome" size={14} className="opacity-90" />
                            New
                          </span>
                        </div>
                        <p className="text-[12px] leading-5 text-[#8F8F8F]">
                          Capture media once and automatically reuse it for vehicles with matching make, model, year, trim, and color.
                        </p>
                      </div>
                      <Link
                        href="/max-2/studio/inventory?media=clone-photos"
                        className={cn(spyneComponentClasses.btnPrimaryMd, "inline-flex no-underline !w-fit !px-5 !py-1.5 !text-[12px]")}
                      >
                        Go live instantly
                      </Link>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/max-2/instant-media-reuse.png"
                      alt="Capture media once, reuse across matching vehicles"
                      className="w-[190px] shrink-0 self-end object-contain"
                    />
                  </div>
                </div>
                <InsightCard
                  variant={aiInsightCards[1].variant}
                  title={aiInsightCards[1].title}
                  description={aiInsightCards[1].description}
                  recommendation={aiInsightCards[1].recommendation}
                  ctaLabel={aiInsightCards[1].ctaLabel}
                  ctaHref={aiInsightCards[1].ctaHref}
                  onCtaClick={aiInsightCards[1].onCtaClick}
                  contextChip={aiInsightCards[1].contextChip}
                  metricChip={aiInsightCards[1].metricChip}
                  insightMeta={aiInsightCards[1].insightMeta}
                  trendLine="Cars with 360° spins and video earn 2× more time on page — but 73% of your listings have photos only."
                  decorativeIconRight="rocket_launch"
                  featureBadges={[
                    { icon: "360", label: "360 Spin" },
                    { icon: "videocam", label: "Video Tour" },
                    { icon: "view_in_ar", label: "3D Showcase" },
                  ]}
                  ctaClassName="!w-fit !px-5 !py-1.5 !text-[12px]"
                  ctaStyle={{ background: "linear-gradient(90deg, #ED8939 0%, #E83E54 25%, #B651D7 50%, #7F6AF2 72%, #5BBFF6 100%)" }}
                />
              </div>
            </AiInsightsShell>

            {/*
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="gap-0 pt-px pb-5 shadow-none">
              <CardHeader className="px-5 pb-4 pt-5">
                <CardTitle>Insights</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Studio AI recovered merchandising quality from incomplete media input.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.map((item) => (
                  <InsightRow key={item.id} item={item} />
                ))}
              </CardContent>
            </Card>

            <Card className="gap-4 pt-px pb-5 shadow-none overflow-hidden">
              <CardHeader className="px-5 pb-0">
                <CardTitle>Opportunities</CardTitle>
                <CardDescription className="text-xs">
                  Here's how Spyne can resolve the issues above automatically.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-3 px-5 pb-0">
                {opportunities.map((opp) => {
                  const Icon = opp.icon
                  const isPro = opp.id === "pro-plan"
                  return (
                    <button
                      key={opp.id}
                      type="button"
                      onClick={() => (isPro ? setProPlanModalOpen(true) : router.push(opp.href))}
                      className={cn(
                        "group flex w-full flex-col gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-sm",
                        isPro
                          ? "border-spyne-primary/20 bg-[var(--spyne-primary-soft)] hover:border-spyne-primary/35"
                          : "border-spyne-border bg-spyne-surface hover:border-spyne-primary/25"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white bg-gradient-to-br",
                            opp.gradient,
                            isPro && "shadow-sm"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[13px] font-semibold leading-tight text-spyne-text">
                              {opp.title}
                            </span>
                            {isPro && (
                              <span
                                className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                                style={{ background: "var(--spyne-primary)", color: "#fff" }}
                              >
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] font-semibold leading-snug text-spyne-text">{opp.desc}</p>
                          {!isPro && opp.count != null && (
                            <div className="pt-0.5">
                              <span
                                className="text-[22px] font-bold tabular-nums leading-none"
                                style={{ color: "var(--spyne-text-primary)" }}
                              >
                                {opp.count}
                              </span>
                              <p className="mt-0.5 text-[10px] text-spyne-text-secondary">{opp.countLabel}</p>
                            </div>
                          )}
                        </div>
                        <ArrowRight
                          className="h-3.5 w-3.5 shrink-0 self-center transition-transform group-hover:translate-x-0.5"
                          style={{ color: "var(--spyne-primary)", opacity: 0.5 }}
                        />
                      </div>
                      <div
                        className="flex items-center gap-1 border-t border-spyne-border/80 pt-2.5 text-[11px] font-semibold"
                        style={{ color: "var(--spyne-primary)" }}
                      >
                        {isPro ? "See what Pro includes" : "Take action"}
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>
          </div>
            */}
          </div>
        )
      })()}

      {opportunityListModal && (
        <VehicleListModal
          open={!!opportunityListModal}
          onClose={() => setOpportunityListModal(null)}
          title={opportunityListModal.title}
          description={opportunityListModal.description}
          vehicles={opportunityListModal.vehicles}
          inventoryHref={opportunityListModal.href}
        />
      )}

      {trainingModal && (
        <PhotographerTrainingModal
          open={!!trainingModal}
          onClose={() => setTrainingModal(null)}
          title={trainingModal.title}
          badInput={trainingModal.badInput}
          improvement={trainingModal.improvement}
          sections={trainingModal.sections}
        />
      )}

      <Dialog open={proPlanModalOpen} onOpenChange={setProPlanModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <Crown className="h-4 w-4 text-primary" />
              Pro Plan — what you get
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-snug">
            Pro bundles everything your lot needs to keep VDPs complete, on-brand, and fast — without tying up your team on manual fixes.
          </p>
          <ul className="mt-3 space-y-2.5 text-sm">
            {[
              "Unlimited AI background replacement and window masking",
              "Priority processing queue with same-day turnaround on flagged units",
              "360° exterior spin and vehicle video included in the bundle",
              "Dedicated success manager plus monthly photographer and QA audits",
              "API-ready workflows for DMS and website partners",
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <Check className="h-4 w-4 text-spyne-success shrink-0 mt-0.5" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/max-2/studio"
            onClick={() => setProPlanModalOpen(false)}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors mt-2"
          >
            Talk to sales about Pro
            <ArrowRight className="h-4 w-4" />
          </Link>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <DaysToFrontlineModal
        isOpen={frontlineModalOpen}
        onClose={() => setFrontlineModalOpen(false)}
        variant="upsell"
      />
      <WebsiteScoreModal
        open={websiteScoreModalOpen}
        onClose={() => setWebsiteScoreModalOpen(false)}
        score={s.websiteScore}
        vehicles={vehicles}
        summary={s}
      />
      <PerfectVinExampleModal
        open={perfectVinExampleOpen}
        onClose={() => setPerfectVinExampleOpen(false)}
        vehicles={vehicles}
      />
    </div>
  )
}
