"use client"

import Link from "next/link"
import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { max2Classes, spyneComponentClasses } from "@/lib/design-system/max-2"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneChip } from "@/components/max-2/spyne-ui"
import type { SpyneChipTone } from "@/lib/design-system/max-2"

// Four semantic variants that drive default icon, icon-well color, and context-chip tone.
export type InsightCardVariant = "delay" | "engagement" | "attention" | "conversion"

// Badge shown in the top-right chip cluster. Maps to a label string and a SpyneChip tone.
export type InsightMetaBadge = "ai-insight" | "high-impact" | "opportunity"

const VARIANT_ICON: Record<InsightCardVariant, string> = {
  delay: "bolt",
  engagement: "movie",
  attention: "campaign",
  conversion: "phone_in_talk",
}

const META_LABEL: Record<InsightMetaBadge, string> = {
  "ai-insight": "AI Insight",
  "high-impact": "High Impact",
  opportunity: "Opportunity",
}

const META_CHIP_TONE: Record<InsightMetaBadge, SpyneChipTone> = {
  "ai-insight": "neutral",
  "high-impact": "warning",
  opportunity: "primary",
}

/** Icon wells — same language as Studio insight rows (`spyne-insight-row__icon-well*`). */
const VARIANT_ICON_WELL: Record<InsightCardVariant, string> = {
  delay: spyneComponentClasses.insightRowIconWellWarning,
  engagement: "bg-[var(--spyne-primary-soft)]",
  attention: spyneComponentClasses.insightRowIconWell,
  conversion: spyneComponentClasses.insightRowIconWellCritical,
}

const VARIANT_ICON_INK: Record<InsightCardVariant, string> = {
  delay: "text-[color:var(--spyne-warning-ink)]",
  engagement: "text-spyne-primary",
  attention: "text-spyne-primary",
  conversion: "text-[color:var(--spyne-error)]",
}

const CONTEXT_CHIP_TONE: Record<
  InsightCardVariant,
  "warning" | "primary" | "info" | "error"
> = {
  delay: "warning",
  engagement: "primary",
  attention: "info",
  conversion: "error",
}

const primaryCtaClass = cn(
  spyneComponentClasses.btnPrimaryMd,
  "w-full justify-center gap-2 text-[14px] [&_.material-symbols-outlined]:text-white",
)

export type InsightFeatureBadge = { icon: string; label: string }

export type InsightCardProps = {
  variant: InsightCardVariant
  title: string
  description: string
  // Shown inside the "AI Recommendation" tinted box at the bottom (standard mode only).
  recommendation: string
  ctaLabel: string
  // Provide ctaHref for navigation; provide onCtaClick for in-page actions (e.g. opening a modal).
  ctaHref?: string
  onCtaClick?: () => void
  // Small chip below the icon (e.g. "+12% this week"). Tone follows the variant.
  contextChip?: string
  // Outline chip next to the title (e.g. a count or metric).
  metricChip?: string
  insightMeta?: InsightMetaBadge
  /**
   * Switches the card to "trendLine mode":
   * - Yellow AI banner replaces the recommendation box at the top.
   * - Icon + title collapse into a compact single row.
   * - Optional featureBadges and decorativeIconRight become available.
   */
  trendLine?: string
  /** 4-column image strip rendered flush at the card bottom (e.g. sample vehicle photos). */
  imageStrip?: string[]
  /** Overrides the variant's default icon name. */
  iconOverride?: string
  /** If set, renders the icon with a gradient fill using background-clip text trick. */
  iconGradient?: string
  /** Feature highlight badges shown between description and CTA (trendLine mode only). */
  featureBadges?: InsightFeatureBadge[]
  /**
   * trendLine + decorativeIconRight triggers the two-column layout:
   * text/badges/CTA on the left, a large faded gradient icon bottom-aligned on the right.
   * The small heading-row icon is hidden in this layout.
   */
  decorativeIconRight?: string
  /** Extra classes applied to the CTA button/link. */
  ctaClassName?: string
  /** Inline style applied to the CTA button/link (e.g. gradient background). */
  ctaStyle?: CSSProperties
  className?: string
}

/**
 * InsightCard — AI-generated insight tile used in the Merchandising Summary panel.
 *
 * Two render modes, controlled by the `trendLine` prop:
 *
 * **Standard mode** (no trendLine):
 *   icon → chips → title (+ metricChip) → description → AI Recommendation box → CTA
 *
 * **trendLine mode** (trendLine set):
 *   yellow AI banner (top) → icon + title row → description → featureBadges? → CTA
 *   When `decorativeIconRight` is also set, the body switches to a two-column layout
 *   with a large faded gradient icon bottom-aligned on the right (mirrors the Instant Media card).
 *
 * The `variant` drives default icon, icon-well background color, and context-chip tone.
 * Override the icon with `iconOverride`; apply a gradient fill with `iconGradient`.
 */
export function InsightCard({
  variant,
  title,
  description,
  recommendation,
  ctaLabel,
  ctaHref,
  onCtaClick,
  contextChip,
  metricChip,
  insightMeta,
  trendLine,
  imageStrip,
  iconOverride,
  iconGradient,
  featureBadges,
  decorativeIconRight,
  ctaClassName,
  ctaStyle,
  className,
}: InsightCardProps) {
  const iconName = iconOverride ?? VARIANT_ICON[variant]

  const ctaInner = (
    <>
      {ctaLabel}
      <MaterialSymbol name="arrow_forward" size={16} aria-hidden />
    </>
  )

  const cta =
    onCtaClick != null ? (
      <button type="button" onClick={onCtaClick} style={ctaStyle} className={cn(primaryCtaClass, "border-0 cursor-pointer", ctaClassName)}>
        {ctaInner}
      </button>
    ) : (
      <Link href={ctaHref ?? "#"} style={ctaStyle} className={cn(primaryCtaClass, "no-underline", ctaClassName)}>
        {ctaInner}
      </Link>
    )

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border border-spyne-border bg-spyne-surface shadow-none",
        "transition-[box-shadow] hover:shadow-sm",
        className,
      )}
    >
      {/* Yellow trend banner — full-width flush top, replaces recommendation box */}
      {trendLine && (
        <div className="flex items-start gap-3 bg-[#FFF8E1] px-5 py-3">
          <MaterialSymbol name="smart_toy" size={18} className="mt-0.5 shrink-0 text-[#B45309]" />
          <p className="text-[12px] font-medium leading-5 text-[#78350F]">{trendLine}</p>
        </div>
      )}

      {trendLine && decorativeIconRight ? (
        /* Two-column layout: content left, large faded gradient icon right (bottom-aligned) — mirrors the Instant Media card */
        <div className="flex flex-1 items-stretch gap-8 px-6 pb-6 pt-5">
          {/* Left: title → description → badges → CTA */}
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[16px] font-semibold leading-6 text-[#402387]">{title}</h3>
              <p className="text-[12px] leading-5 text-[#8F8F8F]">{description}</p>
            </div>
            {featureBadges && featureBadges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {featureBadges.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center gap-1.5 rounded-lg border border-[#E8E0FF] bg-[#F5F0FF] px-2.5 py-1.5"
                  >
                    <MaterialSymbol name={f.icon} size={14} className="shrink-0 text-[#7F6AF2]" />
                    <span className="text-[11px] font-semibold text-[#402387]">{f.label}</span>
                  </div>
                ))}
              </div>
            )}
            <div>{cta}</div>
          </div>
          {/* Right: large faded gradient icon, bottom-aligned — styled like the savings icon in the holding cost modal */}
          <span
            className="material-symbols-outlined pointer-events-none shrink-0 select-none self-end"
            aria-hidden
            style={{
              fontSize: "110px",
              backgroundImage:
                "linear-gradient(135deg, #ED8939 0%, #E83E54 28%, #B651D7 52%, #7F6AF2 72%, #5BBFF6 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              opacity: 0.22,
              lineHeight: 1,
            }}
          >
            {decorativeIconRight}
          </span>
        </div>
      ) : (
        <div className="flex flex-1 flex-col p-5">
          {trendLine ? (
            /* Icon + title in same row */
            <div className="mb-2 flex items-center gap-2">
              <div
                className={cn(
                  spyneComponentClasses.insightRowIconWell,
                  VARIANT_ICON_WELL[variant],
                  "h-8 w-8 shrink-0 rounded-lg",
                )}
              >
                <MaterialSymbol
                  name={iconName}
                  size={18}
                  style={
                    iconGradient
                      ? { backgroundImage: iconGradient, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
                      : undefined
                  }
                  className={iconGradient ? undefined : VARIANT_ICON_INK[variant]}
                />
              </div>
              <h3 className="min-w-0 flex-1 text-[16px] font-semibold leading-6 text-[#402387]">{title}</h3>
              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                {contextChip ? (
                  <SpyneChip variant="soft" tone={CONTEXT_CHIP_TONE[variant]} compact>
                    {contextChip}
                  </SpyneChip>
                ) : null}
                {insightMeta ? (
                  <SpyneChip variant="soft" tone={META_CHIP_TONE[insightMeta]} compact>
                    {META_LABEL[insightMeta]}
                  </SpyneChip>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div
                  className={cn(
                    spyneComponentClasses.insightRowIconWell,
                    VARIANT_ICON_WELL[variant],
                    "h-10 w-10 shrink-0 rounded-lg",
                  )}
                >
                  <MaterialSymbol name={iconName} size={20} className={VARIANT_ICON_INK[variant]} />
                </div>
                <div className="flex min-w-0 flex-1 flex-wrap items-start justify-end gap-1.5">
                  {contextChip ? (
                    <SpyneChip variant="soft" tone={CONTEXT_CHIP_TONE[variant]} compact>
                      {contextChip}
                    </SpyneChip>
                  ) : null}
                  {insightMeta ? (
                    <SpyneChip variant="soft" tone={META_CHIP_TONE[insightMeta]} compact>
                      {META_LABEL[insightMeta]}
                    </SpyneChip>
                  ) : null}
                </div>
              </div>
              <div className="mb-2 flex flex-wrap items-start gap-2">
                <h3 className={cn(spyneComponentClasses.insightRowTitle, "min-w-0 flex-1 leading-snug")}>{title}</h3>
                {metricChip ? (
                  <SpyneChip variant="outline" tone="neutral" compact className="shrink-0 tabular-nums">
                    {metricChip}
                  </SpyneChip>
                ) : null}
              </div>
            </>
          )}

          <p
            className={cn(
              trendLine
                ? cn("text-[12px] leading-5 text-[#8F8F8F]", featureBadges?.length ? "mb-3" : "mb-4 flex-1")
                : cn(spyneComponentClasses.insightRowMeta, "leading-relaxed mb-4 flex-1"),
            )}
          >
            {description}
          </p>

          {trendLine && featureBadges && featureBadges.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {featureBadges.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-1.5 rounded-lg border border-[#E8E0FF] bg-[#F5F0FF] px-2.5 py-1.5"
                >
                  <MaterialSymbol name={f.icon} size={14} className="shrink-0 text-[#7F6AF2]" />
                  <span className="text-[11px] font-semibold text-[#402387]">{f.label}</span>
                </div>
              ))}
            </div>
          )}

          {!trendLine && (
            <div className="mt-auto rounded-lg border border-spyne-border bg-muted/30 p-4">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-spyne-text-secondary">
                AI Recommendation
              </p>
              <p className="text-[13px] leading-snug text-spyne-text">{recommendation}</p>
            </div>
          )}

          <div className={trendLine ? "mt-auto" : "mt-4"}>{cta}</div>
        </div>
      )}

      {/* Image strip — full-width flush bottom */}
      {imageStrip && imageStrip.length > 0 && (
        <div className="grid h-28 w-full grid-cols-4 gap-0.5 bg-muted/50">
          {imageStrip.map((src, i) => (
            <div key={i} className="relative h-full min-h-0 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="absolute inset-0 h-full w-full object-contain object-center" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Panel wrapper for a grid of InsightCards — provides the header with title, subtitle, and optional last-synced timestamp. */
export function AiInsightsShell({
  title,
  subtitle,
  lastSynced,
  children,
}: {
  title: string
  subtitle: string
  lastSynced?: string
  children: ReactNode
}) {
  return (
    <div className={cn(max2Classes.overviewPanelShell, "w-full min-w-0")}>
      <div className={max2Classes.overviewPanelHeader}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <MaterialSymbol name="auto_awesome" size={20} className="text-spyne-primary" />
              <p className={spyneComponentClasses.cardTitle}>{title}</p>
            </div>
            <p className={max2Classes.overviewPanelDescription}>{subtitle}</p>
          </div>
          {lastSynced ? (
            <span className="whitespace-nowrap text-[11px] tabular-nums text-muted-foreground sm:pt-0.5">
              {lastSynced}
            </span>
          ) : null}
        </div>
      </div>
      <div className="px-5 pb-5">{children}</div>
    </div>
  )
}
