"use client"

import * as React from "react"
import { Plus, ChevronRight, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { MerchandisingVehicle } from "@/services/max-2/max-2.types"
import {
  merchandisingInventoryActionKind,
  merchandisingInventoryDetailHref,
} from "@/lib/inventory-table-action-cta"
import type { MerchandisingOverviewIssueContext } from "@/lib/inventory-issue-label"

function defaultNavigate(vin: string) {
  window.location.href = merchandisingInventoryDetailHref(vin)
}

export type MerchandisingInventoryActionCtaProps = {
  v: MerchandisingVehicle
  /** Studio inventory: primary actions use `text-xs` (12px); lot row uses `sm`. */
  size?: "sm" | "md"
  /** `studio`: soft primary chip (default). `shadcn-outline`: small outline Button for card tables. */
  ui?: "studio" | "shadcn-outline"
  className?: string
  onNavigate?: (vin: string) => void
  /** Aligns row actions with {@link issueLabelForStudioInventoryMerchandisingOverview} context. */
  issueContext?: MerchandisingOverviewIssueContext
}

export function MerchandisingInventoryActionCta({
  v,
  size = "md",
  ui = "studio",
  className,
  onNavigate = defaultNavigate,
  issueContext = "default",
}: MerchandisingInventoryActionCtaProps) {
  const kind = merchandisingInventoryActionKind(v, issueContext)
  const go = (e: React.MouseEvent) => {
    e.stopPropagation()
    onNavigate(v.vin)
  }

  const studioBtn =
    size === "sm"
      ? "inline-flex items-center gap-1.5 rounded-md border border-spyne-primary/20 bg-[var(--spyne-primary-soft)] px-3 py-1.5 text-xs font-semibold text-spyne-primary transition-colors hover:bg-spyne-primary/10 whitespace-nowrap"
      : "inline-flex items-center gap-1 rounded-md border border-spyne-primary/20 bg-[var(--spyne-primary-soft)] px-2.5 py-1.5 text-xs font-semibold text-spyne-primary transition-colors hover:bg-spyne-primary/10 whitespace-nowrap"

  const textLink =
    size === "sm"
      ? "text-xs font-semibold text-spyne-primary hover:underline bg-transparent p-0 h-auto border-0 shadow-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-spyne-primary/30 focus-visible:ring-offset-2 rounded"
      : "text-xs font-semibold text-spyne-primary hover:underline bg-transparent p-0 h-auto border-0 shadow-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-spyne-primary/30 focus-visible:ring-offset-2 rounded"

  if (kind === "view-more-text") {
    return (
      <button type="button" className={cn(textLink, className)} onClick={go}>
        View More
      </button>
    )
  }

  if (ui === "shadcn-outline") {
    const iconCls = "h-3 w-3 shrink-0"
    if (kind === "view-more-button") {
      return (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn("h-7 text-xs font-semibold px-2.5 gap-1 border-spyne-border text-spyne-text hover:bg-muted/60", className)}
          onClick={go}
        >
          <ChevronRight className={iconCls} />
          View More
        </Button>
      )
    }
    const label =
      kind === "add-media" ? "Add Media" : kind === "replace-media" ? "Replace Media" : "Generate 360"
    const Icon = kind === "add-media" ? Plus : kind === "generate-360" ? RotateCw : null
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn(
          "h-7 text-xs font-semibold px-2.5 gap-1 border-spyne-primary/30 text-spyne-primary hover:bg-spyne-primary/5",
          className,
        )}
        onClick={go}
      >
        {Icon ? <Icon className={iconCls} /> : null}
        {label}
      </Button>
    )
  }

  if (kind === "view-more-button") {
    return (
      <button type="button" className={cn(studioBtn, className)} onClick={go}>
        <ChevronRight className="h-3 w-3 shrink-0" />
        View More
      </button>
    )
  }

  if (kind === "add-media") {
    return (
      <button type="button" className={cn(studioBtn, className)} onClick={go}>
        <Plus className="h-3 w-3 shrink-0" />
        Add Media
      </button>
    )
  }

  if (kind === "replace-media") {
    return (
      <button type="button" className={cn(studioBtn, className)} onClick={go}>
        Replace Media
      </button>
    )
  }

  return (
    <button type="button" className={cn(studioBtn, className)} onClick={go}>
      <RotateCw className="h-3 w-3 shrink-0" />
      Generate 360
    </button>
  )
}
