"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// ─── Types ────────────────────────────────────────────────────────────────────

export type DaysToFrontlineVariant = "upsell" | "optimization"

export interface DaysToFrontlineModalProps {
  isOpen: boolean
  onClose: () => void
  variant?: DaysToFrontlineVariant
}

// ─── Style maps ───────────────────────────────────────────────────────────────

type Tone = "warning" | "danger"

const WELL: Record<Tone, string> = {
  warning: "bg-amber-50 text-amber-600",
  danger:  "bg-red-50 text-spyne-error",
}

const TAG: Record<Tone, string> = {
  warning: "bg-amber-50 text-amber-700 border-amber-100",
  danger:  "bg-red-50 text-spyne-error border-red-100",
}

const PREMIUM_GRADIENT = "linear-gradient(90deg, #ED8939 0%, #E83E54 25%, #B651D7 50%, #7F6AF2 72%, #5BBFF6 100%)"

// ─── Smart Match premium row ─────────────────────────────────────────────────

// Compact Smart Match card — used as a nested suggestion inside the white new-vehicles SolutionRow
function SmartMatchCard() {
  return (
    <div className="relative overflow-hidden rounded-lg border-2 border-spyne-primary/25 bg-gradient-to-br from-spyne-primary/8 via-spyne-primary/[0.04] to-transparent px-4 py-4">
      <div className="pointer-events-none absolute -right-5 -top-5 h-24 w-24 rounded-full bg-spyne-primary/6" />
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <MaterialSymbol name="camera_enhance" size={15} className="text-spyne-primary" />
          <p className="text-[13px] font-bold leading-tight text-spyne-primary">Smart Match</p>
          <span className="rounded-full border border-spyne-primary/25 bg-spyne-primary/10 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-spyne-primary">
            Premium
          </span>
        </div>
        <ul className="space-y-2">
          {["Generates publish-ready photos instantly", "No re-shoot needed"].map((pt) => (
            <li key={pt} className="flex items-start gap-2 text-[13px] leading-snug text-muted-foreground">
              <MaterialSymbol name="check_circle" size={14} className="mt-px shrink-0 text-spyne-primary/60" />
              {pt}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2 pt-0.5">
          <button type="button" className={cn(spyneComponentClasses.btnSecondaryMd, "!h-8 !px-3 !text-[12px]")}>
            <MaterialSymbol name="open_in_new" size={13} />
            View Smart Match
          </button>
          <button
            type="button"
            className={cn(spyneComponentClasses.btnPrimaryMd, "!h-8 !border-0 !px-3 !text-[12px] [&_.material-symbols-outlined]:text-white")}
            style={{ background: PREMIUM_GRADIENT }}
          >
            <MaterialSymbol name="bolt" size={14} />
            Enable Smart Match
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Solution row ─────────────────────────────────────────────────────────────

function SolutionRow({
  label,
  points,
  tagCounts,
  vinsCta,
  suggestion,
  footer,
  ctas = [],
  tone = "warning",
}: {
  label?: React.ReactNode
  points: string[]
  /** Issue tags with per-tag VIN counts */
  tagCounts?: { label: string; count: number }[]
  /** If set, shows a total-VINs CTA link at the bottom of the tags row */
  vinsCta?: { total: number; href: string }
  suggestion?: string
  footer?: React.ReactNode
  ctas?: { label: string; icon: string }[]
  tone?: Tone
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-spyne-border bg-white px-5 py-4">
      {label && (
        <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      )}
      <ul className="space-y-2">
        {points.map((pt) => (
          <li key={pt} className="flex items-start gap-2 text-[13px] leading-snug text-muted-foreground">
            <MaterialSymbol name="arrow_right" size={15} className="mt-px shrink-0 text-muted-foreground/50" />
            {pt}
          </li>
        ))}
      </ul>
      {tagCounts && (
        <div className="flex flex-wrap items-center gap-1.5">
          {tagCounts.map((t) => (
            <span key={t.label} className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium", TAG[tone])}>
              {t.label}
              <span className="font-bold tabular-nums opacity-80">{t.count}</span>
            </span>
          ))}
          {vinsCta && (
            <Link
              href={vinsCta.href}
              className="ml-1 inline-flex items-center gap-1 text-[12px] font-semibold text-spyne-primary underline-offset-2 hover:underline"
            >
              <span className="tabular-nums">{vinsCta.total}</span> VINs affected
              <MaterialSymbol name="arrow_forward" size={13} className="shrink-0" />
            </Link>
          )}
        </div>
      )}
      {suggestion && (
        <div className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-3">
          <MaterialSymbol name="lightbulb" size={15} className="mt-px shrink-0 text-amber-500" />
          <p className="text-[12px] font-semibold leading-snug text-amber-800">{suggestion}</p>
        </div>
      )}
      {footer}
      {ctas.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-0.5">
          {ctas.map((cta) => (
            <button
              key={cta.label}
              type="button"
              className={cn(spyneComponentClasses.btnSecondaryMd, "!h-8 !px-3 shrink-0 !text-[12px]")}
            >
              <MaterialSymbol name={cta.icon} size={14} />
              {cta.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Reason block ─────────────────────────────────────────────────────────────

function ReasonBlock({
  icon,
  tone,
  title,
  headerRight,
  children,
}: {
  icon: string
  tone: Tone
  title: string
  headerRight?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-spyne-border">
      <div className="flex items-center gap-3 border-b border-spyne-border bg-white px-5 py-4">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", WELL[tone])}>
          <MaterialSymbol name={icon} size={18} />
        </div>
        <p className="flex-1 text-[13px] font-semibold leading-snug text-spyne-text">{title}</p>
        {headerRight && <div className="shrink-0">{headerRight}</div>}
      </div>
      <div className="flex flex-col gap-3.5 bg-muted/20 p-4">
        {children}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DaysToFrontlineModal({ isOpen, onClose }: DaysToFrontlineModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max2-spyne max-h-[90vh] max-w-lg gap-0 overflow-y-auto p-0">

        {/* Header */}
        <DialogHeader className="border-b border-spyne-border px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-spyne-primary/10">
              <MaterialSymbol name="schedule" size={22} className="text-spyne-primary" />
            </div>
            <div>
              <DialogTitle className="text-[16px] font-bold leading-tight text-spyne-text">
                Improve Days to Frontline
              </DialogTitle>
              <DialogDescription className="mt-1 text-[13px] text-muted-foreground">
                Reduce time taken for vehicles to go live
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="space-y-5 px-6 py-6">
          <p className="px-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Why your Days to Frontline is high
          </p>

          {/* Reason 1 — Late photo input */}
          <ReasonBlock icon="upload" tone="warning" title="Photos are arriving late">
            <SolutionRow
              label={
                <span className="flex items-center gap-1.5">
                  Used vehicles
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 font-bold normal-case tabular-nums text-amber-700">3 days</span>
                  input
                </span>
              }
              points={[
                "3 days in photo input before Spyne receives it",
                "Directly inflates Days to Frontline",
              ]}
              suggestion="Work with recon team to reduce handoff time"
              tone="warning"
            />
            <SolutionRow
              label={
                <span className="flex items-center gap-1.5">
                  New vehicles
                  <span className="rounded bg-spyne-primary/10 px-1.5 py-0.5 font-bold normal-case tabular-nums text-spyne-primary">2 days</span>
                  input
                </span>
              }
              points={[
                "2 days for photos to arrive before Spyne receives them",
                "Directly inflates Days to Frontline",
              ]}
              footer={<SmartMatchCard />}
              tone="warning"
            />
          </ReasonBlock>

          {/* Reason 2 — Not using Spyne app */}
          <ReasonBlock icon="phone_android" tone="warning" title="Team is not using the Spyne app">
            <SolutionRow
              points={[
                "Manual uploads add delays at each step",
                "App automates capture and queues for processing immediately",
              ]}
              ctas={[{ label: "Download Spyne App", icon: "download" }]}
              tone="warning"
            />
          </ReasonBlock>

          {/* Reason 3 — Poor input quality */}
          <ReasonBlock
            icon="image_search"
            tone="danger"
            title="Poor input quality is blocking QC"
            headerRight={
              <Link
                href="/max-2/studio/inventory?issue=input-quality"
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-spyne-primary underline-offset-2 hover:underline"
              >
                <span className="tabular-nums">23</span> VINs affected
                <MaterialSymbol name="arrow_forward" size={13} className="shrink-0" />
              </Link>
            }
          >
            <SolutionRow
              points={[
                "Bad inputs fail QC checks",
                "Publishing is held until all issues are resolved",
              ]}
              tagCounts={[
                { label: "Blur",        count: 12 },
                { label: "Cropped",     count: 8  },
                { label: "Sun glare",   count: 15 },
                { label: "Overexposed", count: 6  },
              ]}
              suggestion="Train your team to avoid these issues at shoot time"
              tone="danger"
            />
          </ReasonBlock>
        </div>

      </DialogContent>
    </Dialog>
  )
}
