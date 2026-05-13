"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { MerchandisingVehicle } from "@/services/max-2/max-2.types"
import { STUDIO_HOLDING_COST_PER_DAY } from "@/lib/inventory-issue-label"
import {
  demoVehicleThumbnailByKey,
  isMerchandisingNoPhotosVehicle,
} from "@/lib/demo-vehicle-hero-images"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneChip } from "@/components/max-2/spyne-ui"
import { cn } from "@/lib/utils"

const PUBLISH_LOGOS = [
  { key: "v", color: "#7C3AED", label: "vAuto" },
  { key: "a", color: "#F97316", label: "AutoTrader" },
] as const

/** Column tint backgrounds. Both header and body cells receive the tint. */
const SCORE_TINT = "color-mix(in srgb, #7C3AED 6%, var(--spyne-surface))"
const SCORE_HEADER_TINT = "color-mix(in srgb, #7C3AED 12%, var(--spyne-page-bg))"
const DTF_TINT = "color-mix(in srgb, #3B82F6 6%, var(--spyne-surface))"
const DTF_HEADER_TINT = "color-mix(in srgb, #3B82F6 12%, var(--spyne-page-bg))"

type SortKey = "age" | "score" | "publishing" | "dtf" | "hold"
type SortDir = "asc" | "desc"

interface MerchandisingTableProps {
  vehicles: MerchandisingVehicle[]
}

/**
 * Inventory table for the Merchandising landing.
 *
 * Columns: select · Vehicle · Age · Media · Media Score · Publishing ·
 * Days to Frontline · Hold. Cost · kebab. Media Score and Days to Frontline
 * columns carry a soft column-tint to draw attention to the most actionable
 * signals; full-height vertical separators run between every column.
 */
export function MerchandisingTable({ vehicles }: MerchandisingTableProps) {
  const router = useRouter()
  const [sort, setSort] = React.useState<{ key: SortKey; dir: SortDir }>({
    key: "age",
    dir: "desc",
  })

  const sorted = React.useMemo(() => sortVehicles(vehicles, sort), [vehicles, sort])

  const onSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" },
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-spyne-border bg-spyne-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] border-collapse text-left">
          <thead>
            <tr className="bg-spyne-page-bg text-xs text-muted-foreground">
              <th className={cn(headerCell, "w-12")}>
                <input
                  type="checkbox"
                  aria-label="Select all"
                  className="h-3.5 w-3.5 accent-spyne-primary"
                />
              </th>
              <th className={cn(headerCell)}>Vehicle</th>
              <SortableHeader sortKey="age" sort={sort} onSort={onSort}>
                Age
              </SortableHeader>
              <th className={cn(headerCell)}>Media</th>
              <SortableHeader
                sortKey="score"
                sort={sort}
                onSort={onSort}
                style={{ background: SCORE_HEADER_TINT }}
              >
                Media Score
              </SortableHeader>
              <SortableHeader sortKey="publishing" sort={sort} onSort={onSort}>
                Publishing
              </SortableHeader>
              <SortableHeader
                sortKey="dtf"
                sort={sort}
                onSort={onSort}
                style={{ background: DTF_HEADER_TINT }}
              >
                Days to Frontline
              </SortableHeader>
              <SortableHeader sortKey="hold" sort={sort} onSort={onSort}>
                Hold. Cost
              </SortableHeader>
              <th className={cn(headerCell, "w-12 border-r-0")} />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-16 text-center text-sm text-muted-foreground"
                >
                  No vehicles match the current filters.
                </td>
              </tr>
            ) : (
              sorted.map((v) => (
                <Row
                  key={v.vin}
                  vehicle={v}
                  onOpen={() =>
                    router.push(
                      `/max-2/studio/inventory/vehicle/${encodeURIComponent(v.vin)}`,
                    )
                  }
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ────────────────────────── Header cell ────────────────────────── */

const headerCell =
  "border-b border-spyne-border border-r border-spyne-border/70 px-5 py-3 align-middle font-semibold uppercase tracking-wide text-[11px]"

function SortableHeader({
  sortKey,
  sort,
  onSort,
  children,
  style,
}: {
  sortKey: SortKey
  sort: { key: SortKey; dir: SortDir }
  onSort: (key: SortKey) => void
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  const isActive = sort.key === sortKey
  return (
    <th className={headerCell} style={style}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex w-full items-center justify-between gap-1 transition-colors",
          isActive ? "text-spyne-text" : "hover:text-spyne-text",
        )}
      >
        <span>{children}</span>
        <MaterialSymbol
          name={isActive && sort.dir === "asc" ? "arrow_upward" : "swap_vert"}
          size={14}
          className={cn(isActive ? "opacity-100" : "opacity-60")}
        />
      </button>
    </th>
  )
}

/* ────────────────────────── Row ────────────────────────── */

const bodyCell =
  "border-r border-spyne-border/60 px-5 py-4 align-middle"

function Row({
  vehicle: v,
  onOpen,
}: {
  vehicle: MerchandisingVehicle
  onOpen: () => void
}) {
  const score = mediaScoreFor(v)
  const scoreColor = scoreToColor(score)
  const holdingAccumulated = v.daysInStock * STUDIO_HOLDING_COST_PER_DAY
  const hasStockPhoto = !isMerchandisingNoPhotosVehicle(v)

  return (
    <tr
      className="cursor-pointer border-t border-spyne-border/60 align-middle transition-colors hover:bg-muted/30"
      onClick={onOpen}
    >
      <td className={cn(bodyCell, "w-12")}>
        <input
          type="checkbox"
          aria-label={`Select ${v.year} ${v.make} ${v.model}`}
          className="h-3.5 w-3.5 accent-spyne-primary"
          onClick={(e) => e.stopPropagation()}
        />
      </td>

      <td className={bodyCell}>
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-spyne-page-bg">
            {v.isNew ? (
              <span
                className="absolute left-1.5 top-1.5 z-10 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ background: "var(--spyne-primary)" }}
              >
                New
              </span>
            ) : null}
            {hasStockPhoto ? (
              <Image
                src={v.thumbnailUrl || demoVehicleThumbnailByKey(v.vin)}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
                aria-hidden
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <MaterialSymbol name="hide_image" size={20} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-tight text-spyne-text">
              {v.year} {v.make} {v.model}
              {v.trim ? ` ${v.trim}` : ""}
            </p>
            <p className="mt-0.5 flex items-center gap-1 truncate font-mono text-xs text-muted-foreground">
              <span>{stockLabel(v)}</span>
              <span className="text-muted-foreground/60">·</span>
              <span>VIN{v.vin.slice(-13)}</span>
              <MaterialSymbol
                name="content_copy"
                size={14}
                className="text-muted-foreground/60"
              />
            </p>
            {v.price > 0 ? (
              <p className="mt-1 text-sm font-semibold tabular-nums text-spyne-text">
                $ {v.price.toLocaleString()}
              </p>
            ) : null}
          </div>
        </div>
      </td>

      <td className={bodyCell}>
        <p className="text-base font-medium tabular-nums text-spyne-text">
          {v.daysInStock} day{v.daysInStock === 1 ? "" : "s"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground tabular-nums">
          {formatTimestamp(v.listingUpdatedAt ?? v.lastPublishedAt)}
        </p>
      </td>

      <td className={bodyCell}>
        <div className="flex items-center gap-2">
          <MediaIcon icon="image" enabled={v.photoCount > 0} />
          <MediaIcon icon="360" enabled={v.has360} />
          <MediaIcon icon="videocam" enabled={v.hasVideo} />
        </div>
        {v.mediaStatus === "clone-photos" || v.mediaStatus === "no-photos" ? (
          <div className="mt-2.5">
            <SpyneChip
              tone="primary"
              variant="soft"
              compact
              leading={<MaterialSymbol name="auto_awesome" size={14} />}
            >
              Smart Match
            </SpyneChip>
          </div>
        ) : null}
      </td>

      <td className={bodyCell} style={{ background: SCORE_TINT }}>
        <p
          className="text-base font-semibold tabular-nums"
          style={{ color: scoreColor }}
        >
          {(score / 10).toFixed(1)}
        </p>
      </td>

      <td className={bodyCell}>
        <div className="flex items-center gap-2">
          {PUBLISH_LOGOS.map((p) => (
            <PublishAvatar
              key={p.key}
              letter={p.key}
              color={p.color}
              live={v.publishStatus === "live"}
              label={p.label}
            />
          ))}
        </div>
      </td>

      <td className={bodyCell} style={{ background: DTF_TINT }}>
        <p className="text-base font-semibold tabular-nums text-[#3B82F6]">
          {v.daysToFrontline} day{v.daysToFrontline === 1 ? "" : "s"}
        </p>
      </td>

      <td className={bodyCell}>
        <p className="text-base font-medium tabular-nums text-spyne-text">
          {v.daysInStock} day{v.daysInStock === 1 ? "" : "s"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground tabular-nums">
          ${Math.round(holdingAccumulated).toLocaleString()}
        </p>
      </td>

      <td className={cn(bodyCell, "w-12 border-r-0 text-right")}>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label="More actions"
          className="rounded-md p-1 text-muted-foreground hover:bg-muted/40 hover:text-spyne-text"
        >
          <MaterialSymbol name="more_vert" size={16} />
        </button>
      </td>
    </tr>
  )
}

/* ────────────────────────── Cells ────────────────────────── */

function MediaIcon({ icon, enabled }: { icon: string; enabled: boolean }) {
  const map: Record<string, string> = {
    image: "image",
    "360": "360",
    videocam: "videocam",
  }
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md",
        enabled
          ? "bg-spyne-success-soft text-spyne-success"
          : "bg-muted/40 text-muted-foreground",
      )}
      aria-hidden
    >
      <MaterialSymbol name={map[icon] ?? icon} size={16} />
    </span>
  )
}

function PublishAvatar({
  letter,
  color,
  live,
  label,
}: {
  letter: string
  color: string
  live: boolean
  label: string
}) {
  return (
    <span className="relative" aria-label={label}>
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold uppercase text-white"
        style={{ background: color }}
      >
        {letter}
      </span>
      {live ? (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-spyne-success text-white"
          aria-hidden
        >
          <MaterialSymbol name="check" size={14} />
        </span>
      ) : null}
    </span>
  )
}

/* ────────────────────────── Helpers ────────────────────────── */

function stockLabel(v: MerchandisingVehicle): string {
  if (v.stockNumber) return `STK-${v.stockNumber.replace(/^S/, "")}`
  return `STK-${v.vin.slice(-4)}`
}

function formatTimestamp(iso?: string): string {
  if (!iso) return ""
  try {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "2-digit",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso))
  } catch {
    return ""
  }
}

function mediaScoreFor(v: MerchandisingVehicle): number {
  let base: number
  switch (v.mediaStatus) {
    case "no-photos":
      base = 18
      break
    case "stock-photos":
      base = 38
      break
    case "clone-photos":
      base = 52
      break
    case "real-photos":
      base = 78
      break
    default:
      base = 70
  }
  const photoBump = Math.min(8, Math.round((v.photoCount || 0) / 2))
  const spinBump = v.has360 ? 4 : 0
  const videoBump = v.hasVideo ? 4 : 0
  return Math.max(0, Math.min(100, base + photoBump + spinBump + videoBump))
}

function scoreToColor(score: number): string {
  if (score >= 75) return "var(--spyne-success)"
  if (score >= 50) return "var(--spyne-warning-ink)"
  return "var(--spyne-error)"
}

function sortVehicles(
  list: MerchandisingVehicle[],
  sort: { key: SortKey; dir: SortDir },
): MerchandisingVehicle[] {
  const dir = sort.dir === "asc" ? 1 : -1
  const out = [...list]
  out.sort((a, b) => {
    switch (sort.key) {
      case "age":
        return (a.daysInStock - b.daysInStock) * dir
      case "score":
        return (mediaScoreFor(a) - mediaScoreFor(b)) * dir
      case "publishing":
        return (
          (a.publishStatus === "live" ? 1 : 0) -
          (b.publishStatus === "live" ? 1 : 0)
        ) * dir
      case "dtf":
        return (a.daysToFrontline - b.daysToFrontline) * dir
      case "hold":
        return (a.daysInStock - b.daysInStock) * dir
      default:
        return 0
    }
  })
  return out
}
