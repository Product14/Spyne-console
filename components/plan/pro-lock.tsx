"use client"

import type { ReactNode } from "react"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import { usePlan } from "./plan-context"

/**
 * Shared "Unlock Pro" gradient — purple → pink → amber.
 * Reused across CTAs and lock chips so Pro-only surfaces feel cohesive.
 */
export const PRO_GRADIENT =
  "linear-gradient(118deg, #7C3AED 0%, #DB2777 50%, #F59E0B 100%)"

/** Soft tinted backdrop matching the gradient (used for cards/banners). */
export const PRO_GRADIENT_SOFT =
  "linear-gradient(118deg, rgb(124 58 237 / 0.14) 0%, rgb(219 39 119 / 0.14) 50%, rgb(245 158 11 / 0.14) 100%)"

/* ────────────────────────── ProBadge ────────────────────────── */

/**
 * Tiny "Pro" chip — drop next to a feature name to signal it requires Pro.
 * Always rendered as a static span; consumers gate it behind `useIsPro()`/`usePlan()`.
 */
export function ProBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm",
        className,
      )}
      style={{ background: PRO_GRADIENT }}
    >
      <MaterialSymbol name="workspace_premium" size={14} />
      Pro
    </span>
  )
}

/* ────────────────────────── ProLockButton ────────────────────────── */

interface ProLockButtonProps {
  /** Full-width primary CTA when locked. */
  label?: string
  onClick?: () => void
  className?: string
  size?: "sm" | "md" | "lg"
}

/**
 * "Unlock Pro" gradient CTA — visually similar to the plan-switch trigger so
 * lock affordances feel native to the design system.
 */
export function ProLockButton({
  label = "Unlock with Pro",
  onClick,
  className,
  size = "md",
}: ProLockButtonProps) {
  const sizeClass =
    size === "lg"
      ? "h-11 px-4 text-sm"
      : size === "sm"
        ? "h-8 px-3 text-xs"
        : "h-10 px-3.5 text-sm"
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-semibold text-white shadow-sm transition-transform",
        "hover:brightness-110 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C3AED]/40",
        sizeClass,
        className,
      )}
      style={{ background: PRO_GRADIENT }}
    >
      <MaterialSymbol name="lock" size={size === "sm" ? 14 : 16} />
      {label}
    </button>
  )
}

/* ────────────────────────── ProLockOverlay ────────────────────────── */

interface ProLockOverlayProps {
  /** The wrapped feature surface. Pointer events are blocked when locked. */
  children: ReactNode
  /** Short headline shown over the lock. */
  title?: string
  /** Sub-copy shown beneath the headline. */
  description?: string
  /** Override the unlock CTA. */
  ctaLabel?: string
  onUnlock?: () => void
  className?: string
}

/**
 * Renders `children` underneath a Pro-gradient veil + lock CTA.
 * Use when a specific feature card / banner / button must remain visible to
 * advertise the upgrade, but isn't interactive on the Lite plan.
 */
export function ProLockOverlay({
  children,
  title = "Pro feature",
  description,
  ctaLabel,
  onUnlock,
  className,
}: ProLockOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none select-none opacity-55 blur-[1px]" aria-hidden>
        {children}
      </div>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl border px-4 text-center"
        style={{
          background: PRO_GRADIENT_SOFT,
          borderColor: "color-mix(in srgb, #7C3AED 18%, transparent)",
          backdropFilter: "blur(2px)",
        }}
      >
        <ProBadge />
        <p className="text-sm font-semibold text-spyne-text">{title}</p>
        {description ? (
          <p className="max-w-md text-xs leading-snug text-muted-foreground">{description}</p>
        ) : null}
        <ProLockButton label={ctaLabel} onClick={onUnlock} size="sm" className="mt-1" />
      </div>
    </div>
  )
}

/* ────────────────────────── ProGate ────────────────────────── */

interface ProGateProps {
  /** Rendered when the current plan is Pro. */
  children: ReactNode
  /** Rendered when the current plan is Lite. Defaults to nothing. */
  fallback?: ReactNode
}

/** Inline gate — shows `children` only on Pro, otherwise renders `fallback`. */
export function ProGate({ children, fallback = null }: ProGateProps) {
  const { plan } = usePlan()
  if (plan === "pro") return <>{children}</>
  return <>{fallback}</>
}

/* ────────────────────────── ProTreatment ────────────────────────── */

/**
 * Compact Pro pitch banner — used in places where Smart Match (or another Pro
 * feature) is referenced inline and we want to push the upgrade without
 * hiding the original surface.
 */
export function ProPitchBanner({
  title,
  description,
  ctaLabel = "Unlock with Pro",
  onUnlock,
  className,
}: {
  title: string
  description: string
  ctaLabel?: string
  onUnlock?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:gap-4",
        className,
      )}
      style={{
        background: PRO_GRADIENT_SOFT,
        borderColor: "color-mix(in srgb, #7C3AED 22%, transparent)",
      }}
    >
      <div className="flex shrink-0 items-center gap-2">
        <ProBadge />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-spyne-text">{title}</p>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{description}</p>
      </div>
      <ProLockButton label={ctaLabel} onClick={onUnlock} size="sm" className="shrink-0" />
    </div>
  )
}

/* ────────────────────────── Wrap with gradient styling ────────────────────────── */

/**
 * Lightweight wrapper that paints a Pro gradient ring around its child without
 * blocking interaction — used for tile-level pitches (e.g. the 360° Spin
 * package tile in the improve-listing modal).
 */
export function ProGradientFrame({
  children,
  className,
  showBadge = true,
}: {
  children: ReactNode
  className?: string
  showBadge?: boolean
}) {
  return (
    <div
      className={cn("relative rounded-xl p-[1.5px]", className)}
      style={{ background: PRO_GRADIENT }}
    >
      <div className="rounded-[10px] bg-spyne-surface">{children}</div>
      {showBadge ? (
        <span className="absolute -right-2 -top-2">
          <ProBadge />
        </span>
      ) : null}
    </div>
  )
}

export { spyneComponentClasses }
