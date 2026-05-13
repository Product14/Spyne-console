"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

const SPYNE_GRADIENT_BG =
  "linear-gradient(135deg, #7C3AED 0%, #DB2777 55%, #F59E0B 100%)"
const STORAGE_KEY = "max2.smartCampaignsIntroSeen.v3"

interface SmartCampaignsIntroModalProps {
  /** When true, modal reopens on every visit and ignores localStorage. */
  forceOpen?: boolean
}

/**
 * Three-slide intro for Smart Campaigns: Problem → Solution → Why Spyne.
 * Replaces the previous single-screen modal so we can carry the full
 * dealer-facing pitch (Aged inventory, multi-rooftop, dynamic overlays,
 * vAuto comparison) without crushing the layout.
 */
export function SmartCampaignsIntroModal({
  forceOpen = false,
}: SmartCampaignsIntroModalProps = {}) {
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState(0)

  React.useEffect(() => {
    if (forceOpen) {
      setOpen(true)
      setStep(0)
      return
    }
    if (typeof window === "undefined") return
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return
    } catch {
      /* no-op */
    }
    setOpen(true)
  }, [forceOpen])

  const dismiss = () => {
    setOpen(false)
    setStep(0)
    if (forceOpen) return
    try {
      window.localStorage.setItem(STORAGE_KEY, "1")
    } catch {
      /* no-op */
    }
  }

  const slides = [<ProblemSlide key="p" />, <SolutionSlide key="s" />, <WhySlide key="w" />]
  const isLast = step === slides.length - 1

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss()
      }}
    >
      <DialogContent
        animation="fade"
        showCloseButton={false}
        className="max2-spyne max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-[600px]"
      >
        <div className="flex max-h-[92vh] flex-col">
          <header className="flex shrink-0 items-center justify-between border-b border-spyne-border px-6 py-3">
            <div className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
                style={{ background: SPYNE_GRADIENT_BG }}
                aria-hidden
              >
                <MaterialSymbol name="auto_awesome" size={14} />
              </span>
              <p className="text-xs font-semibold uppercase tracking-widest text-spyne-primary">
                Smart Campaigns
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="text-xs font-semibold text-muted-foreground hover:text-spyne-text"
            >
              Skip
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-7 py-7">{slides[step]}</div>

          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-spyne-border bg-spyne-surface px-6 py-4">
            <ProgressDots count={slides.length} active={step} />
            <div className="flex items-center gap-2">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((i) => i - 1)}
                  className={cn(spyneComponentClasses.btnSecondaryMd, "!h-10 !text-sm")}
                >
                  Back
                </button>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  isLast ? dismiss() : setStep((i) => Math.min(slides.length - 1, i + 1))
                }
                autoFocus
                className={cn(spyneComponentClasses.btnPrimaryMd, "!h-10 !text-sm")}
              >
                {isLast ? "Get started" : "Next"}
                <MaterialSymbol name="arrow_forward" size={16} />
              </button>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ────────────────────────── Slides ────────────────────────── */

function ProblemSlide() {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-spyne-primary">
        The challenge
      </p>
      <DialogTitle className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-spyne-text">
        Every listing looks the same. Yours doesn&apos;t have to.
      </DialogTitle>
      <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Dealership campaigns today are fragmented, manual, and easy to miss.
        Different vehicle categories need different strategies, but execution
        rarely keeps up.
      </DialogDescription>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <ProblemCard
          title="Promotions expire unnoticed"
          body="Festive offers, manager's specials, and aged-inventory pushes are managed manually and applied inconsistently."
        />
        <ProblemCard
          title="Price becomes the only lever"
          body="When you can't stand out visually, you compete on discounts and lose margin on every deal."
        />
        <ProblemCard
          title="Aged inventory stays invisible"
          body="Vehicles past 30 days look the same as fresh arrivals. No urgency, no visual signal to the buyer."
        />
        <ProblemCard
          title="Rooftops drift apart"
          body="Each location runs promotions differently or not at all. No unified brand presence across the group."
        />
      </div>
    </div>
  )
}

function SolutionSlide() {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-spyne-primary">
        Introducing
      </p>
      <DialogTitle className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-spyne-text">
        A marketing team that never sleeps.
      </DialogTitle>
      <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Run visual promotions across your entire inventory, automatically. Four
        building blocks, one fluent campaign engine.
      </DialogDescription>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <CapabilityCard
          eyebrow="Promotional Overlays"
          title="Stand out before the click"
          body="Overlay images applied to vehicle photos, highlighting dealership info, offers, or VIN-specific details."
        />
        <CapabilityCard
          eyebrow="Promotional Billboards"
          title="Tell a bigger story"
          body="Full-frame images added inside the VIN photo set to promote your dealership or seasonal offers."
        />
        <CapabilityCard
          eyebrow="Dynamic Text Overlays"
          title="Always accurate, always live"
          body="Price, mileage, and any vehicle field update on every listing the moment values change."
        />
        <CapabilityCard
          eyebrow="Campaign Control"
          title="Full lifecycle management"
          body="Create, schedule, pause, activate, or delete campaigns at one location or across rooftops. Preview each VIN before go-live."
        />
      </div>
    </div>
  )
}

function WhySlide() {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-spyne-primary">
        Built for high-volume dealerships
      </p>
      <DialogTitle className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-spyne-text">
        Stop competing on price alone. Start winning on presence.
      </DialogTitle>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <UseCaseTile icon="celebration" title="Festive &amp; seasonal" body="Schedule ahead. Auto-run without manual updates." />
        <UseCaseTile icon="schedule" title="Aged inventory" body="30+ day listings automatically get a visual push." />
        <UseCaseTile icon="hub" title="Multi-rooftop" body="One campaign applied consistently across every location." />
      </div>

      <div
        className="mt-6 overflow-hidden rounded-xl border"
        style={{
          borderColor: "color-mix(in srgb, #7C3AED 25%, var(--spyne-border))",
        }}
      >
        <p className="px-4 pt-3 text-[11px] font-semibold uppercase tracking-widest text-spyne-primary">
          Spyne vs others
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-3 text-xs">
          <ComparisonRow label="Ageing-based targeting" yes="Auto by days on lot" no="Not available" />
          <ComparisonRow label="Lifecycle controls" yes="Create, pause, activate" no="Limited" />
          <ComparisonRow label="VIN-level preview" yes="Every VIN before publish" no="Not available" />
          <ComparisonRow label="Rule depth" yes="Age, trim, price, certification, more" no="Basic filters only" />
        </div>
      </div>

      <p className="mt-5 text-sm italic leading-relaxed text-muted-foreground">
        "vAuto tells you which cars to promote. Spyne makes sure they actually
        get noticed."
      </p>
    </div>
  )
}

/* ────────────────────────── Cells ────────────────────────── */

function ProblemCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-spyne-border bg-spyne-surface p-4"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: SPYNE_GRADIENT_BG }}
      />
      <p className="text-sm font-semibold tracking-tight text-spyne-text">
        {title}
      </p>
      <p className="mt-1 text-xs leading-snug text-muted-foreground">{body}</p>
    </div>
  )
}

function CapabilityCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <div className="rounded-xl border border-spyne-border bg-spyne-surface p-4">
      <span
        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
        style={{ background: SPYNE_GRADIENT_BG }}
      >
        {eyebrow}
      </span>
      <p className="mt-3 text-sm font-semibold tracking-tight text-spyne-text">
        {title}
      </p>
      <p className="mt-1 text-xs leading-snug text-muted-foreground">{body}</p>
    </div>
  )
}

function UseCaseTile({
  icon,
  title,
  body,
}: {
  icon: string
  title: string
  body: string
}) {
  return (
    <div className="rounded-xl border border-spyne-border bg-spyne-surface p-3.5">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-spyne-primary-soft text-spyne-primary"
        aria-hidden
      >
        <MaterialSymbol name={icon} size={16} />
      </span>
      <p
        className="mt-2.5 text-xs font-semibold tracking-tight text-spyne-text"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{body}</p>
    </div>
  )
}

function ComparisonRow({
  label,
  yes,
  no,
}: {
  label: string
  yes: string
  no: string
}) {
  return (
    <>
      <div className="flex items-start gap-1.5">
        <MaterialSymbol
          name="check_circle"
          size={14}
          className="mt-0.5 shrink-0 text-spyne-success"
        />
        <div className="min-w-0">
          <p className="font-semibold text-spyne-text">{label}</p>
          <p className="text-muted-foreground">{yes}</p>
        </div>
      </div>
      <div className="flex items-start gap-1.5">
        <MaterialSymbol
          name="cancel"
          size={14}
          className="mt-0.5 shrink-0 text-muted-foreground/60"
        />
        <p className="text-muted-foreground">{no}</p>
      </div>
    </>
  )
}

/* ────────────────────────── Progress dots ────────────────────────── */

function ProgressDots({ count, active }: { count: number; active: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === active ? "w-6 bg-spyne-primary" : "w-1.5 bg-spyne-border",
          )}
          aria-hidden
        />
      ))}
    </div>
  )
}
