"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"

export function SpyneLineTabStrip({
  className,
  bleed,
  compact,
  tight,
  embedded,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  bleed?: boolean
  compact?: boolean
  tight?: boolean
  embedded?: boolean
}) {
  return (
    <div
      role="tablist"
      className={cn(
        spyneComponentClasses.lineTabStrip,
        bleed && spyneComponentClasses.lineTabStripBleed,
        compact && spyneComponentClasses.lineTabStripCompact,
        tight && spyneComponentClasses.lineTabStripTight,
        embedded && spyneComponentClasses.lineTabStripEmbedded,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function SpyneLineTab({
  active,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(spyneComponentClasses.lineTab, active && spyneComponentClasses.lineTabActive, className)}
      {...rest}
    >
      {children}
    </button>
  )
}

export function SpyneLineTabBadge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn(spyneComponentClasses.lineTabBadge, className)}>{children}</span>
}

/**
 * Line tab count as plain parentheses after the label (`All(89)`), same color and weight as the tab.
 * Wrap the label and this span in an element with `spyneComponentClasses.lineTabLabelWithCount` so flex `gap` does not insert space before `(`.
 */
export function SpyneLineTabInlineCount({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  return (
    <span className={cn(spyneComponentClasses.lineTabCountInline, className)}>
      ({value})
    </span>
  )
}
