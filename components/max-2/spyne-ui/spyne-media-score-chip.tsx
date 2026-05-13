"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Prominent per-vehicle media score (0–100). Designed to read like a
 * MakeMyTrip-style hotel rating — the score is the headline, not a column cell.
 *
 * Bands match the inventory-level score in `ftue-modal.tsx`:
 *   ≥ 75 → "good"  (success green)
 *   50–74 → "watch" (warning amber)
 *   < 50  → "bad"   (error red)
 *
 * Three sizes:
 *   - `sm`  : table rows, dense lists
 *   - `md`  : default — issues panel rows, sticky chips
 *   - `lg`  : VLP / inventory cards (hero placement)
 */

export type SpyneMediaScoreSize = "sm" | "md" | "lg"

type Band = "good" | "watch" | "bad"

function bandFor(score: number): Band {
  if (score >= 75) return "good"
  if (score >= 50) return "watch"
  return "bad"
}

const BAND_COPY: Record<Band, string> = {
  good: "On Target",
  watch: "Needs Attention",
  bad: "Critical",
}

const BAND_COLOR: Record<Band, { ring: string; text: string; soft: string }> = {
  good: {
    ring: "var(--spyne-success)",
    text: "var(--spyne-success)",
    soft: "color-mix(in srgb, var(--spyne-success) 12%, transparent)",
  },
  watch: {
    ring: "var(--spyne-warning)",
    text: "var(--spyne-warning)",
    soft: "color-mix(in srgb, var(--spyne-warning) 14%, transparent)",
  },
  bad: {
    ring: "var(--spyne-error)",
    text: "var(--spyne-error)",
    soft: "color-mix(in srgb, var(--spyne-error) 12%, transparent)",
  },
}

const SIZE_TOKENS: Record<
  SpyneMediaScoreSize,
  { dial: number; stroke: number; valueClass: string; labelClass: string; gap: string }
> = {
  sm: {
    dial: 32,
    stroke: 4,
    valueClass: "text-[11px] font-bold leading-none tabular-nums",
    labelClass: "text-[9px] font-semibold uppercase tracking-widest",
    gap: "gap-2",
  },
  md: {
    dial: 44,
    stroke: 5,
    valueClass: "text-sm font-bold leading-none tabular-nums",
    labelClass: "text-[10px] font-semibold uppercase tracking-widest",
    gap: "gap-2.5",
  },
  lg: {
    dial: 64,
    stroke: 7,
    valueClass: "text-xl font-bold leading-none tabular-nums",
    labelClass: "text-[10px] font-semibold uppercase tracking-widest",
    gap: "gap-3",
  },
}

export interface SpyneMediaScoreChipProps {
  score: number
  size?: SpyneMediaScoreSize
  /** Hide the band label (e.g. "On Target") — show just the dial + number. */
  hideLabel?: boolean
  /** Optional eyebrow text rendered above the band copy (e.g. "Pre-scan", "Live"). */
  eyebrow?: string
  className?: string
}

export function SpyneMediaScoreChip({
  score,
  size = "md",
  hideLabel = false,
  eyebrow,
  className,
}: SpyneMediaScoreChipProps) {
  const safe = Math.max(0, Math.min(100, Math.round(score)))
  const band = bandFor(safe)
  const colors = BAND_COLOR[band]
  const tokens = SIZE_TOKENS[size]
  const radius = (tokens.dial - tokens.stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dash = (safe / 100) * circumference

  return (
    <div
      className={cn("inline-flex items-center", tokens.gap, className)}
      role="img"
      aria-label={`Media score ${safe} out of 100, ${BAND_COPY[band]}`}
    >
      <span
        className="relative inline-flex items-center justify-center rounded-full"
        style={{
          background: colors.soft,
        }}
      >
        <svg
          width={tokens.dial}
          height={tokens.dial}
          viewBox={`0 0 ${tokens.dial} ${tokens.dial}`}
          aria-hidden
        >
          <circle
            cx={tokens.dial / 2}
            cy={tokens.dial / 2}
            r={radius}
            fill="none"
            stroke="var(--spyne-border)"
            strokeWidth={tokens.stroke}
          />
          <circle
            cx={tokens.dial / 2}
            cy={tokens.dial / 2}
            r={radius}
            fill="none"
            stroke={colors.ring}
            strokeWidth={tokens.stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            transform={`rotate(-90 ${tokens.dial / 2} ${tokens.dial / 2})`}
          />
        </svg>
        <span
          className={cn("absolute", tokens.valueClass)}
          style={{ color: colors.text }}
        >
          {safe}
        </span>
      </span>
      {!hideLabel ? (
        <span className="leading-tight">
          {eyebrow ? (
            <span className={cn("block text-muted-foreground", tokens.labelClass)}>
              {eyebrow}
            </span>
          ) : null}
          <span
            className={cn("block font-semibold", size === "sm" ? "text-xs" : "text-sm")}
            style={{ color: colors.text }}
          >
            {BAND_COPY[band]}
          </span>
        </span>
      ) : null}
    </div>
  )
}

