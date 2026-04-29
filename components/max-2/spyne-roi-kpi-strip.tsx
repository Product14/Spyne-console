"use client"

import type { ReactNode } from "react"
import type { LotVehicle } from "@/services/max-2/max-2.types"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { cn } from "@/lib/utils"

/** Semantic dot + optional status pill context (Lot KPI strip). */
export type SpyneRoiKpiMetricStatus = "good" | "watch" | "bad" | "neutral"

const statusDot: Record<SpyneRoiKpiMetricStatus, string> = {
  good: "bg-spyne-success",
  watch: "bg-spyne-warning",
  bad: "bg-spyne-error",
  neutral: "bg-muted-foreground/40",
}

/**
 * ROI / KPI metric strip shell — one white rounded container, equal-width columns,
 * `divide-x` / `divide-y` separators. Used by Lot View and Sales Console overview.
 *
 * Override the default `lg:grid-cols-5` when the row has a different column count
 * (e.g. `lg:grid-cols-2` for Studio, `lg:grid-cols-8` for Service).
 */
export function SpyneRoiKpiStrip({
  children,
  gridClassName,
  variant = "strip",
}: {
  children: ReactNode
  gridClassName?: string
  /** `cards`: separate rounded KPI cards with gap (Studio overview). `strip`: single bordered shell with dividers. */
  variant?: "strip" | "cards"
}) {
  if (variant === "cards") {
    return (
      <div className={cn(spyneComponentClasses.roiKpiStripCards, gridClassName)}>{children}</div>
    )
  }
  return (
    <div className={spyneComponentClasses.roiKpiStrip}>
      <div className={cn(spyneComponentClasses.roiKpiStripGrid, gridClassName)}>
        {children}
      </div>
    </div>
  )
}

/**
 * Single metric cell: label row (dot + uppercase label), primary value, subtext.
 * Typography and spacing match Lot View `LotKPIStrip` / reference ROI cards.
 */
const KPI_CHART_VB_W = 400
const KPI_CHART_VB_H = 88
const KPI_CHART_PAD = 0.08
/** Studio KPI card background line. */
const KPI_CARD_CHART_GREEN = "#12B76A"
/** Primary series line opacity (20%). */
const KPI_CARD_CHART_LINE_OPACITY = 0.2
/** Decorative sparkline layers, slightly below primary. */
const KPI_CARD_CHART_SPARKLINE_OPACITY_STRONG = 0.16
const KPI_CARD_CHART_SPARKLINE_OPACITY_SOFT = 0.1

function RoiKpiCardSparkline() {
  return (
    <svg
      className={spyneComponentClasses.roiKpiMetricCardSparkline}
      viewBox={`0 0 ${KPI_CHART_VB_W} ${KPI_CHART_VB_H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M0 62C48 58 72 28 120 36C168 44 176 68 224 52C272 36 296 18 344 28C368 33 384 42 400 38"
        stroke={KPI_CARD_CHART_GREEN}
        strokeOpacity={KPI_CARD_CHART_SPARKLINE_OPACITY_STRONG}
        strokeWidth="1.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M0 72C56 66 88 48 136 54C184 60 208 78 256 64C304 50 328 38 400 46"
        stroke={KPI_CARD_CHART_GREEN}
        strokeOpacity={KPI_CARD_CHART_SPARKLINE_OPACITY_SOFT}
        strokeWidth="1"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/** Maps numeric series to a line in the KPI card background (SVG y grows downward). */
function RoiKpiCardLineChart({ values }: { values: number[] }) {
  const n = values.length
  if (n === 0) return null

  const series = n === 1 ? [values[0], values[0]] : values
  let min = Math.min(...series)
  let max = Math.max(...series)
  if (min === max) {
    min -= 1
    max += 1
  }
  const span = max - min
  const lo = min - span * KPI_CHART_PAD
  const hi = max + span * KPI_CHART_PAD
  const range = hi - lo || 1

  const pts = series.map((v, i) => {
    const x = (i / (series.length - 1)) * KPI_CHART_VB_W
    const t = (v - lo) / range
    const y = KPI_CHART_VB_H - t * (KPI_CHART_VB_H * 0.92) - KPI_CHART_VB_H * 0.04
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })

  const d = pts.reduce((acc, p, i) => {
    const [x, y] = p.split(",").map(Number)
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`
  }, "")

  return (
    <svg
      className={spyneComponentClasses.roiKpiMetricCardSparkline}
      viewBox={`0 0 ${KPI_CHART_VB_W} ${KPI_CHART_VB_H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d={d}
        stroke={KPI_CARD_CHART_GREEN}
        strokeOpacity={KPI_CARD_CHART_LINE_OPACITY}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function RoiKpiTrendCaret({ direction }: { direction: "up" | "down" | "flat" }) {
  if (direction === "flat") {
    return <span className="mt-0.5 inline-block h-2 w-2.5 shrink-0" aria-hidden />
  }
  const isUp = direction === "up"
  return (
    <span
      className={cn(
        "mt-0.5 inline-flex shrink-0",
        isUp ? "text-spyne-success" : "text-spyne-error",
      )}
      aria-hidden
    >
      <svg
        width="10"
        height="8"
        viewBox="0 0 10 8"
        fill="currentColor"
        className={cn(!isUp && "rotate-180")}
      >
        <path d="M5 0L10 8H0L5 0Z" />
      </svg>
    </span>
  )
}

export function SpyneRoiKpiMetricCell({
  label,
  value,
  sub,
  status,
  valueClassName,
  subClassName,
  cellClassName,
  onClick,
  footer,
  labelAccessory,
  layout = "strip",
  cardChartSeries,
  cardSubHighlight,
  cardSubMuted,
  cardTrendDirection = "up",
}: {
  label: ReactNode
  value: string
  sub: ReactNode
  status: SpyneRoiKpiMetricStatus
  valueClassName?: string
  /** Optional override for subline color (e.g. semantic success/error). */
  subClassName?: string
  /** Merged onto the metric cell wrapper (e.g. highlighted column background). */
  cellClassName?: string
  /** When set, cell is a button (Studio overview drill-downs). Ignored if `footer` is set. Not used with `layout="card"` (use `labelAccessory` links instead). */
  onClick?: () => void
  /** When set, cell is a non-interactive wrapper with actions below the subline (no full-cell button). */
  footer?: ReactNode
  /** Renders on the right side of the label row (e.g. “View more”). */
  labelAccessory?: ReactNode
  /** `card`: featured Studio KPI tile with icon header, sparkline, and trend row. */
  layout?: "strip" | "card"
  /** When set (non-empty), renders a data-driven line chart instead of the decorative sparkline. */
  cardChartSeries?: number[]
  /** Card layout: green “increment” segment after the trend caret (use with `cardSubMuted`). */
  cardSubHighlight?: ReactNode
  /** Card layout: muted context after the highlight. */
  cardSubMuted?: ReactNode
  /** Card layout: caret and % color follow direction (vs prior point in series). */
  cardTrendDirection?: "up" | "down" | "flat"
}) {
  const dot = statusDot[status]

  if (layout === "card") {
    const useSplitSub = cardSubHighlight != null || cardSubMuted != null
    const chart =
      cardChartSeries != null && cardChartSeries.length > 0 ? (
        <RoiKpiCardLineChart values={cardChartSeries} />
      ) : (
        <RoiKpiCardSparkline />
      )

    const cardBody = (
      <>
        {chart}
        <div className="relative z-[1] flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className={spyneComponentClasses.roiKpiMetricCardIconWrap}>
              <MaterialSymbol name="bar_chart" size={18} />
            </div>
            <p className="min-w-0 text-sm font-medium leading-tight text-spyne-text">
              {label}
            </p>
          </div>
          {labelAccessory != null ? (
            <div className="shrink-0 pt-0.5">{labelAccessory}</div>
          ) : null}
        </div>
        <p
          className={cn(
            spyneComponentClasses.roiKpiMetricValue,
            "relative z-[1] mb-0 mt-5 text-foreground",
            valueClassName,
          )}
        >
          {value}
        </p>
        <div className="relative z-[1] mt-4 flex flex-wrap items-start gap-x-1 gap-y-0.5">
          <RoiKpiTrendCaret direction={cardTrendDirection} />
          {useSplitSub ? (
            <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-1 gap-y-0.5 leading-snug">
              {cardSubHighlight != null ? (
                <span
                  className={cn(
                    spyneComponentClasses.roiKpiMetricSub,
                    "font-medium",
                    cardTrendDirection === "down" && "text-spyne-error",
                    cardTrendDirection === "up" && "text-spyne-success",
                    cardTrendDirection === "flat" && "text-muted-foreground",
                  )}
                >
                  {cardSubHighlight}
                </span>
              ) : null}
              {cardSubMuted != null ? (
                <span className={cn(spyneComponentClasses.roiKpiMetricSub, "text-muted-foreground", subClassName)}>
                  {cardSubMuted}
                </span>
              ) : null}
            </div>
          ) : (
            <div className={cn(spyneComponentClasses.roiKpiMetricSub, "min-w-0 flex-1 leading-snug", subClassName)}>
              {sub}
            </div>
          )}
        </div>
        {footer != null ? <div className="relative z-[1] mt-4">{footer}</div> : null}
      </>
    )

    return (
      <div className={cn(spyneComponentClasses.roiKpiMetricCard, cellClassName)}>{cardBody}</div>
    )
  }

  /** Label row + value/sub as a column; `justify-between` pins the headline number to the bottom when the strip row is taller (matches Lot / Studio multi-column KPI rows). */
  const stripBody = (
    <div className="flex h-full min-h-0 w-full flex-col justify-between">
      <div
        className={cn(
          spyneComponentClasses.roiKpiMetricLabelRow,
          labelAccessory != null && "w-full justify-between gap-2",
        )}
      >
        <p
          className={cn(
            spyneComponentClasses.roiKpiMetricLabel,
            labelAccessory != null && "min-w-0 truncate flex-1",
          )}
        >
          {label}
        </p>
        {labelAccessory != null ? <div className="shrink-0 self-start pt-0.5">{labelAccessory}</div> : null}
      </div>
      <div className="min-w-0">
        <p className={cn(spyneComponentClasses.roiKpiMetricValue, valueClassName)}>{value}</p>
        <p className={cn(spyneComponentClasses.roiKpiMetricSub, subClassName)}>{sub}</p>
      </div>
    </div>
  )

  if (footer != null) {
    return (
      <div
        className={cn(
          spyneComponentClasses.roiKpiMetricCell,
          cellClassName,
          "flex h-full min-h-0 w-full flex-col",
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col">{stripBody}</div>
        <div className="mt-3 shrink-0">{footer}</div>
      </div>
    )
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          spyneComponentClasses.roiKpiMetricCell,
          cellClassName,
          "flex h-full min-h-0 w-full flex-col text-left transition-colors hover:bg-muted/30",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-spyne-primary/25 focus-visible:ring-offset-2",
        )}
      >
        {stripBody}
      </button>
    )
  }

  return (
    <div
      className={cn(
        spyneComponentClasses.roiKpiMetricCell,
        cellClassName,
        "flex h-full min-h-0 w-full flex-col",
      )}
    >
      {stripBody}
    </div>
  )
}

/** Stacked bar + legend for retail vs wholesale (Lot View disposition column). */
export function SpyneRoiKpiDispositionPanel({ vehicles }: { vehicles: LotVehicle[] }) {
  const retail = vehicles.filter((v) => v.lotStatus === "frontline").length
  const wholesale = vehicles.filter((v) => v.lotStatus === "wholesale-candidate").length
  const total = vehicles.length

  const rows = [
    {
      label: "Retail",
      count: retail,
      bar: "bg-[var(--spyne-chip-orange)]",
      dot: "bg-[var(--spyne-chip-orange)]",
      val: "text-[var(--spyne-chip-orange)]",
    },
    {
      label: "Wholesale",
      count: wholesale,
      bar: "bg-spyne-info",
      dot: "bg-spyne-info",
      val: "text-spyne-info",
    },
  ]

  return (
    <div className={spyneComponentClasses.roiKpiMetricCell}>
      <div className={spyneComponentClasses.roiKpiMetricLabelRow}>
        <p className={spyneComponentClasses.roiKpiMetricLabel}>Disposition</p>
      </div>

      <div className={spyneComponentClasses.roiKpiDispositionBarTrack}>
        {rows.map((r) =>
          r.count > 0 ? (
            <div
              key={r.label}
              className={r.bar}
              style={{ width: `${total > 0 ? (r.count / total) * 100 : 0}%` }}
            />
          ) : null,
        )}
      </div>

      <div className={spyneComponentClasses.roiKpiDispositionLegend}>
        {rows.map((r) => (
          <div key={r.label} className={spyneComponentClasses.roiKpiDispositionLegendRow}>
            <div className="flex items-center gap-1.5">
              <span className={cn(spyneComponentClasses.roiKpiMetricDot, r.dot)} />
              <span className={spyneComponentClasses.roiKpiDispositionLegendLabel}>{r.label}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={cn("text-xs font-bold tabular-nums", r.val)}>{r.count}</span>
              <span className={spyneComponentClasses.roiKpiDispositionLegendPct}>
                {total > 0 ? `${((r.count / total) * 100).toFixed(0)}%` : "0%"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
