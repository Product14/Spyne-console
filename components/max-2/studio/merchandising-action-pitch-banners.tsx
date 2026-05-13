"use client"

import Link from "next/link"
import { Megaphone } from "lucide-react"
import { max2Classes, spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import type { MerchandisingVehicle } from "@/services/max-2/max-2.types"
import { StudioInventoryVehicleThumb } from "@/components/max-2/studio/studio-inventory-vehicle-thumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProLockButton, useIsPro } from "@/components/plan"
import { MaterialSymbol } from "@/components/max-2/material-symbol"

export type MerchandisingActionTabKey =
  | "no-photos"
  | "cgi"
  | "less8"
  | "hero"
  | "no360"
  | "incomplete"
  | "no-interior"
  | "no-exterior"
  | "smart-match"
  | "quality"
  | "non-compliant"

/** Demo rule: newer or in-stock new units qualify for instant media generation. */
export function merchandisingInstantMediaEligible(v: MerchandisingVehicle): boolean {
  return v.mediaStatus === "no-photos" && (v.isNew === true || v.year >= 2023)
}

function PitchBanner({
  body,
  ctaLabel,
  ctaHref,
  variant = "default",
  proLocked = false,
  proLockLabel,
  secondaryCta,
}: {
  body: React.ReactNode
  ctaLabel: string
  ctaHref: string
  /** `instant`: blue / purple / green gradient slab for the instant-media CTA. */
  variant?: "default" | "instant"
  /** When true on Lite plan, swap the shell for the Pro gradient + Unlock CTA. */
  proLocked?: boolean
  proLockLabel?: string
  /** Optional secondary CTA shown to the right of the primary action. */
  secondaryCta?: {
    label: string
    icon?: string
    onClick?: () => void
  }
}) {
  const shell =
    variant === "instant" ? max2Classes.merchandisingInstantPitchBanner : max2Classes.overviewSuggestBanner
  const iconTone =
    variant === "instant" ? "text-spyne-primary" : "text-spyne-warning-ink"

  // Pro-gradient shell when locked — overrides the default warning/instant background
  // so any locked banner (Smart Match, 360° spin, etc.) reads as a Pro upgrade pitch.
  const proLockedStyle: React.CSSProperties | undefined = proLocked
    ? {
        background:
          "linear-gradient(118deg, rgb(124 58 237 / 0.14) 0%, rgb(219 39 119 / 0.14) 50%, rgb(245 158 11 / 0.14) 100%), var(--spyne-surface)",
        borderColor: "color-mix(in srgb, #7C3AED 22%, transparent)",
        boxShadow: "0 0 0 1px color-mix(in srgb, #7C3AED 8%, transparent)",
      }
    : undefined

  return (
    <div className={shell} style={proLockedStyle}>
      <div className={max2Classes.overviewSuggestBannerContent}>
        <Megaphone
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0",
            proLocked ? "text-[#7C3AED]" : iconTone,
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1 text-sm text-spyne-text">{body}</div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {proLocked ? (
          <ProLockButton
            label={proLockLabel ?? "Unlock with Pro"}
            size="md"
            className="shrink-0"
          />
        ) : (
          <Link
            href={ctaHref}
            className={cn(spyneComponentClasses.btnPrimaryMd, "inline-flex shrink-0 justify-center no-underline")}
          >
            {ctaLabel}
          </Link>
        )}
        {secondaryCta ? (
          <button
            type="button"
            onClick={secondaryCta.onClick}
            className={cn(
              spyneComponentClasses.btnSecondaryMd,
              "inline-flex shrink-0 justify-center",
            )}
          >
            {secondaryCta.icon ? (
              <MaterialSymbol name={secondaryCta.icon} size={16} />
            ) : null}
            {secondaryCta.label}
          </button>
        ) : null}
      </div>
    </div>
  )
}

const textCtaClass =
  "inline p-0 align-baseline text-sm font-medium text-spyne-primary underline-offset-2 hover:underline bg-transparent border-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-spyne-primary/30 focus-visible:ring-offset-2 rounded"

export function MerchandisingActionPitchBanners({
  tabKey,
  vehicles,
  onOpenPerfectVinExample,
}: {
  tabKey: MerchandisingActionTabKey
  vehicles: MerchandisingVehicle[]
  onOpenPerfectVinExample?: () => void
}) {
  const isPro = useIsPro()
  const noPhoto = vehicles.filter((v) => v.mediaStatus === "no-photos")
  const instantEligible = noPhoto.filter(merchandisingInstantMediaEligible)
  const nInstant = instantEligible.length

  if (tabKey === "no-photos") {
    const nShoots = Math.max(1, Math.ceil(nInstant * 0.65))

    return (
      <PitchBanner
        variant="instant"
        body={
          <p>
            <strong>Complete your shoot in Smart Match</strong> — Completing {nShoots} shoot{nShoots !== 1 ? "s" : ""} in your inventory will add photos to{" "}
            <strong>{nInstant} new vehicle{nInstant !== 1 ? "s" : ""}</strong>.
          </p>
        }
        ctaLabel="Go to Smart Match"
        ctaHref="/max-2/studio/smart-match"
        proLocked={!isPro}
        proLockLabel="Unlock Smart Match"
      />
    )
  }

  if (tabKey === "cgi") {
    return (
      <PitchBanner
        body={<p>Real photos build more buyer trust — replace AI-generated placeholders to improve listing quality.</p>}
        ctaLabel="View all vehicles"
        ctaHref="/max-2/studio/inventory?media=cgi"
      />
    )
  }

  if (tabKey === "incomplete") {
    return (
      <PitchBanner
        body={
          <p>
            VINs with full exterior + interior coverage perform better.{" "}
            <button type="button" className={textCtaClass} onClick={() => onOpenPerfectVinExample?.()}>
              See an example
            </button>
          </p>
        }
        ctaLabel="View all vehicles"
        ctaHref="/max-2/studio/inventory?issue=incomplete"
      />
    )
  }

  const single: Record<
    Exclude<MerchandisingActionTabKey, "no-photos" | "incomplete" | "cgi">,
    { body: string; href: string }
  > = {
    less8: {
      body: "More angles = more engagement. Aim for 8+ photos per listing.",
      href: "/max-2/studio/inventory?photos=low",
    },
    hero: {
      body: "A front-left 3/4 hero shot earns more clicks — fix the angle on these listings.",
      href: "/max-2/studio/inventory?issue=hero",
    },
    no360: {
      body: "Generate a 360° spin from existing photos — no re-shoot needed for eligible vehicles.",
      href: "/max-2/studio/inventory?issue=no360",
    },
    "no-interior": {
      body: "Interior photos are the #1 buyer request — missing them costs appointment sets.",
      href: "/max-2/studio/inventory?issue=no-interior",
    },
    "no-exterior": {
      body: "Missing exterior angles reduce buyer confidence — add a full walk-around set.",
      href: "/max-2/studio/inventory?issue=no-exterior",
    },
    "smart-match": {
      body: "11 pending Smart Match shoots cover 26 VINs with no photos — complete them now.",
      href: "/max-2/studio/inventory?issue=smart-match",
    },
    quality: {
      body: "Reshoot with the Spyne app — guided angles, auto-cropping, and on-device glare and blur checks catch quality issues before the photo is saved.",
      href: "/max-2/studio/inventory?issue=quality",
    },
    "non-compliant": {
      body: "Shoot with the Spyne app — every frame passes brand-background, watermark, and angle compliance checks the moment it's captured.",
      href: "/max-2/studio/inventory?issue=non-compliant",
    },
  }

  const row = single[tabKey]
  const proLocked = !isPro && (tabKey === "smart-match" || tabKey === "no360")
  const proLockLabel = tabKey === "no360" ? "Unlock 360°" : "Unlock Smart Match"
  const showSpyneAppVideo = tabKey === "quality" || tabKey === "non-compliant"
  return (
    <PitchBanner
      body={<p>{row.body}</p>}
      ctaLabel="View all vehicles"
      ctaHref={row.href}
      proLocked={proLocked}
      proLockLabel={proLockLabel}
      secondaryCta={
        showSpyneAppVideo
          ? { label: "Watch video", icon: "play_circle" }
          : undefined
      }
    />
  )
}

const PERFECT_EXAMPLE_VIN = "1FTEW1EP5MFA10001"

export function PerfectVinExampleModal({
  open,
  onClose,
  vehicles,
}: {
  open: boolean
  onClose: () => void
  vehicles: MerchandisingVehicle[]
}) {
  const v = vehicles.find((x) => x.vin === PERFECT_EXAMPLE_VIN) ?? vehicles[0]
  if (!v) return null

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Example of a strong VIN listing</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Use this as a checklist when you complete exterior and interior coverage.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-3 rounded-lg border border-spyne-border bg-muted/20 p-3">
            <StudioInventoryVehicleThumb
              v={v}
              roundedClassName="rounded-md"
              surfaceClassName="bg-muted"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-spyne-text">
                {v.year} {v.make} {v.model} {v.trim}
              </p>
              <p className="text-xs text-muted-foreground">
                VIN <span className="font-mono text-spyne-text">{v.vin}</span>
              </p>
            </div>
          </div>
          <ul className="list-disc space-y-1.5 pl-4 text-sm text-muted-foreground">
            <li>Exterior gallery with consistent angles and lighting</li>
            <li>Interior cabin and dash coverage, not just the driver seat</li>
            <li>{v.has360 ? "360° spin published on the listing" : "360° spin on file"}</li>
            <li>Hero image follows your front 3/4 standard</li>
          </ul>
          <Link
            href={`/max-2/studio/inventory/vehicle/${encodeURIComponent(v.vin)}`}
            className={cn(
              spyneComponentClasses.btnPrimaryMd,
              "inline-flex w-full justify-center no-underline",
            )}
            onClick={onClose}
          >
            Open this VIN in inventory
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
