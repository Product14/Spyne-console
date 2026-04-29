"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { MaterialSymbol } from "@/components/max-2/material-symbol"

/** Row of mutually exclusive segments — use with `SpyneSegmentedButton` inside `.max2-spyne`. */
export function SpyneSegmentedControl({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={cn(spyneComponentClasses.segmented, className)} role="tablist">
      {children}
    </div>
  )
}

export function SpyneSegmentedButton({
  active,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      role="tab"
      aria-pressed={active}
      className={cn(spyneComponentClasses.segmentedBtn, className)}
      {...rest}
    >
      {children}
    </button>
  )
}

/** 7px dot — pair with `spyneComponentClasses.segmentedDotLive` when “online”. */
export function SpyneSegmentedStatusDot({
  live,
  className,
}: {
  live?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(spyneComponentClasses.segmentedDot, live && spyneComponentClasses.segmentedDotLive, className)}
      aria-hidden
    />
  )
}

/** Wrap a native `<select className={filterSelect}>` and place `SpyneFilterSelectChevron` after it. */
export function SpyneFilterSelectWrap({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn(spyneComponentClasses.filterSelectWrap, className)}>{children}</div>
}

/** Chevron for `SpyneFilterSelectWrap` — place after `<select className={filterSelect}>`. */
export function SpyneFilterSelectChevron({ className }: { className?: string }) {
  return (
    <MaterialSymbol name="expand_more" size={14} className={cn(spyneComponentClasses.filterSelectChevron, className)} aria-hidden />
  )
}
