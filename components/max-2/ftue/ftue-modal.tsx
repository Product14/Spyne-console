"use client"

import { useEffect, useMemo, useRef } from "react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import gsap from "gsap"
import { demoVehicleThumbnailByKey } from "@/lib/demo-vehicle-hero-images"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneChip } from "@/components/max-2/spyne-ui"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import type { FtueController, FtueState } from "@/services/max-2/ftue.types"

const MERCHANDISING_PATH = "/max-2/studio"

/**
 * Fixed body height for every modal phase. Keeps the modal from jumping in size
 * between syncing → scanning → insights, and pins the footer in the same spot.
 */
const MODAL_BODY_MIN_HEIGHT = 480

const IMS_LABEL: Record<FtueState["ims"], string> = {
  vauto: "vAuto",
  winq: "wInq",
  homenet: "HomeNet",
  "dealer-dotcom": "Dealer.com",
}

/** Stylised IMS brand plates — used in place of vendor logos we don't ship. */
const IMS_BRAND: Record<
  FtueState["ims"],
  { wordmark: string; suffix?: string; tone: string; ink: string }
> = {
  vauto: { wordmark: "v", suffix: "Auto", tone: "#0F2540", ink: "#FFFFFF" },
  winq: { wordmark: "w", suffix: "Inq", tone: "#1F3A8A", ink: "#FFFFFF" },
  homenet: { wordmark: "Home", suffix: "Net", tone: "#0E7C66", ink: "#FFFFFF" },
  "dealer-dotcom": { wordmark: "dealer", suffix: ".com", tone: "#B91C1C", ink: "#FFFFFF" },
}

interface FtueModalProps {
  controller: FtueController
}

/** Top-level FTUE modal — manages the sync → scan → insights transition. */
export function FtueModal({ controller }: FtueModalProps) {
  const { state, isModalOpen, closeModal } = controller

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(open) => {
        if (!open) closeModal()
      }}
    >
      <DialogContent
        animation="fade"
        className="max2-spyne max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-[640px]"
      >
        {state.phase === "syncing" ? (
          <SyncingState controller={controller} />
        ) : state.phase === "scanning" ? (
          <ScanningState controller={controller} />
        ) : (
          <InsightsState controller={controller} />
        )}
      </DialogContent>
    </Dialog>
  )
}

/** Shared shell so all three phases match in width and height. */
function PhaseShell({
  title,
  description,
  body,
  footer,
}: {
  title: React.ReactNode
  description: React.ReactNode
  body: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="flex max-h-[90vh] flex-col">
      <div className="shrink-0 border-b border-spyne-border px-6 pb-4 pt-6">
        <DialogHeader>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
      </div>

      <div
        className="flex-1 overflow-y-auto px-6 py-6"
        style={{ minHeight: MODAL_BODY_MIN_HEIGHT }}
      >
        {body}
      </div>

      <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-spyne-border bg-card/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        {footer}
      </div>
    </div>
  )
}

/* ────────────────────────── Syncing ────────────────────────── */

function SyncingState({ controller }: { controller: FtueController }) {
  const { state, startAnalysis, closeModal } = controller
  const { ims, sync } = state
  const brand = IMS_BRAND[ims]
  const syncedAtLabel = useMemo(() => formatSyncedAt(sync.syncedAt), [sync.syncedAt])

  return (
    <PhaseShell
      title={`Inventory synced from ${IMS_LABEL[ims]}`}
      description={`Spyne has the latest snapshot of your IMS feed. Review the summary, then start the analysis.`}
      body={
        <div className="flex h-full flex-col gap-5">
          <SyncFlowVisual ims={ims} brand={brand} />
          <SyncSummaryCard
            ims={IMS_LABEL[ims]}
            fetched={sync.fetched}
            total={sync.total}
            syncedAt={syncedAtLabel}
          />
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={closeModal}
            className={cn(spyneComponentClasses.btnSecondaryMd, "!h-9 !px-3 !text-sm")}
          >
            Maybe later
          </button>
          <button
            type="button"
            onClick={startAnalysis}
            className={cn(spyneComponentClasses.btnPrimaryMd, "!h-9 !text-sm")}
            autoFocus
          >
            Start analysis
            <MaterialSymbol name="arrow_forward" size={16} />
          </button>
        </>
      }
    />
  )
}

function formatSyncedAt(iso: string): string {
  try {
    const date = new Date(iso)
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date)
  } catch {
    return iso
  }
}

/** GSAP one-shot reveal: plates fade-in, line draws, dots stream once, success badge pops. */
function SyncFlowVisual({
  ims,
  brand,
}: {
  ims: FtueState["ims"]
  brand: (typeof IMS_BRAND)[FtueState["ims"]]
}) {
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      const ims = root.querySelector<HTMLElement>("[data-sync-ims]")
      const spyne = root.querySelector<HTMLElement>("[data-sync-spyne]")
      const trackFill = root.querySelector<HTMLElement>("[data-sync-track-fill]")
      const dots = root.querySelectorAll<HTMLElement>("[data-sync-dot]")
      const checkBadge = root.querySelector<HTMLElement>("[data-sync-check]")
      const ring = root.querySelector<HTMLElement>("[data-sync-ring]")

      gsap.set([ims, spyne], { autoAlpha: 0, y: 12 })
      gsap.set(trackFill, { transformOrigin: "left center", scaleX: 0 })
      gsap.set(dots, { autoAlpha: 0, x: 0 })
      gsap.set(checkBadge, { autoAlpha: 0, scale: 0.4 })
      gsap.set(ring, { autoAlpha: 0, scale: 0.8 })

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.to(ims, { autoAlpha: 1, y: 0, duration: 0.45 })
        .to(spyne, { autoAlpha: 1, y: 0, duration: 0.45 }, "-=0.25")
        .to(trackFill, { scaleX: 1, duration: 0.85, ease: "power2.inOut" }, "-=0.1")
        .to(
          dots,
          {
            autoAlpha: 1,
            keyframes: [
              { x: 0, autoAlpha: 0, duration: 0 },
              { autoAlpha: 0.95, duration: 0.1 },
              { x: "+=100%", autoAlpha: 0.95, duration: 0.7, ease: "power1.inOut" },
              { autoAlpha: 0, duration: 0.1 },
            ],
            stagger: 0.08,
          },
          "-=0.7",
        )
        .to(
          ring,
          {
            autoAlpha: 1,
            scale: 1.05,
            duration: 0.35,
            ease: "back.out(2)",
          },
          "-=0.15",
        )
        .to(
          checkBadge,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.4,
            ease: "back.out(2.2)",
          },
          "-=0.2",
        )
        .to(ring, { scale: 1, duration: 0.25 }, "-=0.1")
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={rootRef}
      className="relative shrink-0 rounded-xl border border-spyne-border bg-card px-5 py-7"
      aria-label={`Inventory data flowed from ${IMS_LABEL[ims]} into Spyne.`}
    >
      <div className="flex items-center justify-between gap-4">
        <ImsPlate brand={brand} label={IMS_LABEL[ims]} />
        <SyncPipeline />
        <SpynePlate />
      </div>
    </div>
  )
}

function ImsPlate({
  brand,
  label,
}: {
  brand: (typeof IMS_BRAND)[FtueState["ims"]]
  label: string
}) {
  return (
    <div data-sync-ims className="flex w-[140px] shrink-0 flex-col items-center gap-2">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm"
        style={{ background: brand.tone, color: brand.ink }}
        aria-hidden
      >
        <span className="text-base font-extrabold leading-none tracking-tight">
          <span>{brand.wordmark}</span>
          {brand.suffix ? <span className="font-semibold opacity-90">{brand.suffix}</span> : null}
        </span>
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="text-[10px] text-muted-foreground">Inventory source</p>
    </div>
  )
}

function SpynePlate() {
  return (
    <div data-sync-spyne className="flex w-[140px] shrink-0 flex-col items-center gap-2">
      <div className="relative flex h-16 w-16 items-center justify-center" aria-hidden>
        <span
          data-sync-ring
          className="absolute inset-[-6px] rounded-2xl"
          style={{
            border: "2px solid color-mix(in srgb, var(--spyne-success) 35%, transparent)",
            boxShadow: "0 0 0 4px color-mix(in srgb, var(--spyne-success) 12%, transparent)",
          }}
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-spyne-border bg-spyne-surface shadow-sm">
          <Image
            src="/branding/retail-suite-logomark.svg"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10"
            aria-hidden
            priority
          />
          <span
            data-sync-check
            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-spyne-success text-white shadow-sm"
            aria-hidden
          >
            <MaterialSymbol name="check" size={14} />
          </span>
        </div>
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Spyne
      </p>
      <p className="text-[10px] text-muted-foreground">Retail Suite</p>
    </div>
  )
}

/** Animated pipeline between IMS plate and Spyne plate. Driven by the parent's GSAP timeline. */
function SyncPipeline() {
  const dots = [0, 1, 2, 3, 4]
  return (
    <div className="relative flex h-16 flex-1 items-center" aria-hidden style={{ minWidth: 80 }}>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-spyne-border/70">
        <div
          data-sync-track-fill
          className="h-full rounded-full bg-spyne-success"
          style={{ width: "100%" }}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
        {dots.map((i) => (
          <span
            key={i}
            data-sync-dot
            className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-spyne-primary"
            style={{
              left: 0,
              boxShadow: "0 0 0 3px color-mix(in srgb, var(--spyne-primary) 18%, transparent)",
            }}
          />
        ))}
      </div>
    </div>
  )
}

function SyncSummaryCard({
  ims,
  fetched,
  total,
  syncedAt,
}: {
  ims: string
  fetched: number
  total: number
  syncedAt: string
}) {
  return (
    <div className="rounded-xl border border-spyne-border bg-spyne-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Sync summary
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-spyne-text">
            {fetched.toLocaleString()}
            <span className="ml-1.5 text-sm font-medium text-muted-foreground">
              vehicles synced
            </span>
          </p>
        </div>
        <SpyneChip
          tone="success"
          variant="soft"
          compact
          leading={<MaterialSymbol name="check_circle" size={14} />}
        >
          100% complete
        </SpyneChip>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-spyne-border bg-card px-3 py-2.5">
          <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Source
          </dt>
          <dd className="mt-1 truncate text-sm font-semibold text-spyne-text">{ims}</dd>
        </div>
        <div className="rounded-lg border border-spyne-border bg-card px-3 py-2.5">
          <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Synced
          </dt>
          <dd className="mt-1 truncate text-sm font-semibold text-spyne-text">{syncedAt}</dd>
        </div>
        <div className="rounded-lg border border-spyne-border bg-card px-3 py-2.5">
          <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            VINs received
          </dt>
          <dd className="mt-1 truncate text-sm font-semibold text-spyne-text tabular-nums">
            {fetched.toLocaleString()} / {total.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-lg border border-spyne-border bg-card px-3 py-2.5">
          <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Status
          </dt>
          <dd className="mt-1 flex items-center gap-1 text-sm font-semibold text-spyne-success">
            <MaterialSymbol name="check_circle" size={14} />
            Ready to analyse
          </dd>
        </div>
      </dl>
    </div>
  )
}

/* ────────────────────────── Scanning (analysing) ────────────────────────── */

function ScanningState({ controller }: { controller: FtueController }) {
  const { state } = controller
  return (
    <PhaseShell
      title="Analysing your inventory"
      description={`Spyne is scoring ${state.sync.total.toLocaleString()} VINs from ${IMS_LABEL[state.ims]} for media coverage, photo quality, and listing readiness.`}
      body={<AnalysingVisual total={state.sync.total} />}
      footer={
        <>
          <span className="text-xs text-muted-foreground">
            Hang tight — this usually takes a few seconds.
          </span>
          <button
            type="button"
            disabled
            className={cn(spyneComponentClasses.btnPrimaryMd, "!h-9 !text-sm cursor-not-allowed opacity-60")}
          >
            <MaterialSymbol name="autorenew" size={16} className="motion-safe:animate-spin" />
            Analysing…
          </button>
        </>
      }
    />
  )
}

/* Demo vehicle deck for the analysis stream — name + VIN + status. */
type AnalysisTone = "success" | "warning" | "critical"

interface AnalysisVehicle {
  name: string
  vin: string
  tone: AnalysisTone
}

const ANALYSIS_VEHICLES: AnalysisVehicle[] = [
  { name: "2024 Toyota Camry XSE", vin: "4T1BG22K1WU091823", tone: "success" },
  { name: "2023 Honda CR-V Hybrid", vin: "5J6RW2H81PA013446", tone: "success" },
  { name: "2022 Ford F-150 Lariat", vin: "1FTFW1ED5NFA20789", tone: "warning" },
  { name: "2024 Tesla Model Y LR", vin: "7SAYGDEE9PA118207", tone: "success" },
  { name: "2021 Jeep Grand Cherokee", vin: "1C4RJFAG7MC555012", tone: "critical" },
  { name: "2023 Subaru Outback Wilderness", vin: "4S4BTGUD8P3110984", tone: "success" },
  { name: "2024 Kia Telluride SX", vin: "5XYP5DHC6RG307644", tone: "warning" },
  { name: "2022 BMW X5 xDrive40i", vin: "5UXCR6C00N9L88312", tone: "success" },
  { name: "2023 Mazda CX-5 Turbo", vin: "JM3KFBDM7P0440918", tone: "success" },
  { name: "2024 Hyundai Santa Fe", vin: "5NMS44GA6RH065221", tone: "warning" },
  { name: "2021 Chevrolet Tahoe LT", vin: "1GNSCMKD7MR212847", tone: "critical" },
  { name: "2024 Volvo XC60 Recharge", vin: "YV4H60DK6R1819004", tone: "success" },
  { name: "2023 Acura MDX A-Spec", vin: "5J8YE1H05PL009834", tone: "success" },
  { name: "2022 Lexus RX 350L", vin: "JTJBZMCAXN2074612", tone: "warning" },
  { name: "2024 Ford Bronco Sport", vin: "3FMCR9C66RRE26710", tone: "success" },
  { name: "2023 Audi Q5 Premium Plus", vin: "WA1BNAFY3P2030771", tone: "success" },
  { name: "2024 Nissan Pathfinder SL", vin: "5N1DR3CD3RC216008", tone: "warning" },
  { name: "2021 Ram 1500 Big Horn", vin: "1C6RR7LT2MS503127", tone: "critical" },
  { name: "2024 Mercedes-Benz GLC 300", vin: "W1NKM4HB1RF115420", tone: "success" },
  { name: "2023 Cadillac XT5 Premium", vin: "1GYKNCRS4PZ219006", tone: "success" },
]

/**
 * Elite GSAP timeline (~5.5s, end-to-end):
 * - Vertical column of vehicle cards (photo + name + VIN) flows from top to bottom of a tall stage
 * - A scanner beam sits in the middle of the stage and pulses
 * - As each card crosses the beam line, its status badge stamps on with a back-out pop
 * - VIN counter ticks 0 → total in lockstep with the scroll
 * - Radial gauge sweeps 0 → 100% over the same duration
 */
function AnalysingVisual({ total }: { total: number }) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const counterRef = useRef<HTMLSpanElement | null>(null)
  const pctRef = useRef<HTMLSpanElement | null>(null)

  // Stable thumbnail per VIN.
  const deck = useMemo(
    () =>
      ANALYSIS_VEHICLES.map((v) => ({
        ...v,
        thumb: demoVehicleThumbnailByKey(v.vin),
      })),
    [],
  )

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      const stream = root.querySelector<HTMLElement>("[data-scan-stream]")
      const cards = root.querySelectorAll<HTMLElement>("[data-scan-card]")
      const beam = root.querySelector<HTMLElement>("[data-scan-beam]")
      const arc = root.querySelector<SVGPathElement>("[data-scan-arc]")
      const arcLength = arc ? arc.getTotalLength() : 0
      const stage = root.querySelector<HTMLElement>("[data-scan-stage]")
      const success = root.querySelector<HTMLElement>("[data-scan-success]")
      const successCheck = root.querySelector<SVGPathElement>("[data-scan-success-check]")
      const successRings = root.querySelectorAll<HTMLElement>("[data-scan-success-ring]")
      const successCopy = root.querySelectorAll<HTMLElement>("[data-scan-success-copy]")
      const bottomGauge = root.querySelector<HTMLElement>("[data-scan-bottom-gauge]")
      const bottomCheck = root.querySelector<HTMLElement>("[data-scan-bottom-check]")
      const checkLength = successCheck ? successCheck.getTotalLength() : 0

      if (!stream || !stage) return

      // Distance the deck must travel: deck height − stage height + a little slack
      const travel = Math.max(0, stream.scrollHeight - stage.clientHeight + 32)

      gsap.set(cards, { autoAlpha: 0, y: 8 })
      gsap.set(beam, { autoAlpha: 0, scaleX: 0.6, transformOrigin: "center" })
      if (arc) gsap.set(arc, { strokeDasharray: arcLength, strokeDashoffset: arcLength })
      gsap.set(success, { autoAlpha: 0 })
      if (successCheck) {
        gsap.set(successCheck, { strokeDasharray: checkLength, strokeDashoffset: checkLength })
      }
      gsap.set(successRings, { autoAlpha: 0, scale: 0.4, transformOrigin: "center center" })
      gsap.set(successCopy, { autoAlpha: 0, y: 10 })
      gsap.set(bottomCheck, { autoAlpha: 0, scale: 0.4 })

      const counter = { v: 0 }
      const pct = { v: 0 }

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } })

      // 1) Cards fade in quickly (the deck is "loaded")
      tl.to(cards, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.025 })
      // 2) Beam ignites
      tl.to(beam, { autoAlpha: 1, scaleX: 1, duration: 0.35, ease: "power3.out" }, "-=0.2")

      // 3) The deck scrolls upward through the beam. ease "none" so badges
      //    line up predictably with each card's beam crossing.
      tl.add("scroll", "+=0.05")
      tl.to(stream, { y: -travel, duration: 8.0, ease: "none" }, "scroll")

      // 4) Beam pulses while scrolling
      tl.to(
        beam,
        {
          keyframes: [
            { opacity: 1, duration: 0 },
            { opacity: 0.55, duration: 0.45, ease: "power1.inOut" },
            { opacity: 1, duration: 0.45, ease: "power1.inOut" },
          ],
          repeat: 7,
          yoyo: false,
        },
        "scroll",
      )

      // 5) Counter + radial gauge tick over the scroll window
      tl.to(
        counter,
        {
          v: total,
          duration: 8.0,
          ease: "none",
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = Math.round(counter.v).toLocaleString()
            }
          },
        },
        "scroll",
      )
      tl.to(
        pct,
        {
          v: 100,
          duration: 8.0,
          ease: "none",
          onUpdate: () => {
            if (pctRef.current) pctRef.current.textContent = `${Math.round(pct.v)}%`
            if (arc) {
              gsap.set(arc, { strokeDashoffset: arcLength * (1 - pct.v / 100) })
            }
          },
        },
        "scroll",
      )

      // 6) Stamp each card's badge as it (visually) crosses the beam line.
      cards.forEach((card, i) => {
        // Distribute stamps evenly across the scroll window with a small lead-in.
        const t = (i / Math.max(1, cards.length - 1)) * 7.6 + 0.2
        const badge = card.querySelector<HTMLElement>("[data-scan-card-badge]")
        const tint = card.querySelector<HTMLElement>("[data-scan-card-tint]")
        if (badge) {
          gsap.set(badge, { autoAlpha: 0, scale: 0.5, transformOrigin: "center" })
          tl.to(
            badge,
            { autoAlpha: 1, scale: 1, duration: 0.32, ease: "back.out(2.4)" },
            `scroll+=${t}`,
          )
        }
        if (tint) {
          gsap.set(tint, { autoAlpha: 0 })
          tl.to(tint, { autoAlpha: 1, duration: 0.32 }, `scroll+=${t}`)
        }
      })

      // 7) Validation finale (~1.5s before the modal flips to insights).
      //    Beam dims, success overlay enters, check draws, rings expand, copy lifts.
      tl.add("validate", "scroll+=8.05")
      tl.to(beam, { autoAlpha: 0, duration: 0.3 }, "validate")
      tl.to(stream, { autoAlpha: 0.35, duration: 0.4 }, "validate")
      tl.to(success, { autoAlpha: 1, duration: 0.3, ease: "power3.out" }, "validate")

      if (successCheck) {
        tl.to(
          successCheck,
          { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut" },
          "validate+=0.2",
        )
      }

      // Concentric ring pulses around the check
      successRings.forEach((ring, i) => {
        tl.to(
          ring,
          {
            autoAlpha: 0.6,
            scale: 1,
            duration: 0.18,
            ease: "power2.out",
          },
          `validate+=${0.15 + i * 0.12}`,
        )
        tl.to(
          ring,
          {
            scale: 1.6 + i * 0.25,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power2.out",
          },
          `validate+=${0.33 + i * 0.12}`,
        )
      })

      tl.to(
        successCopy,
        { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power3.out" },
        "validate+=0.45",
      )

      // Bottom strip — fade gauge, pop a green check
      tl.to(bottomGauge, { autoAlpha: 0, duration: 0.25 }, "validate+=0.3")
      tl.to(
        bottomCheck,
        { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(2.4)" },
        "validate+=0.45",
      )
    }, root)

    return () => ctx.revert()
  }, [total])

  return (
    <div ref={rootRef} className="flex h-full min-h-[460px] flex-col gap-4">
      {/* Stage: scrolling vehicle stream + scanner beam */}
      <div
        data-scan-stage
        className="relative flex-1 overflow-hidden rounded-xl border border-spyne-border bg-spyne-page-bg/60"
      >
        {/* Top + bottom fade masks (matching surface tone) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12"
          style={{
            background:
              "linear-gradient(180deg, var(--spyne-surface) 0%, color-mix(in srgb, var(--spyne-surface) 70%, transparent) 50%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12"
          style={{
            background:
              "linear-gradient(0deg, var(--spyne-surface) 0%, color-mix(in srgb, var(--spyne-surface) 70%, transparent) 50%, transparent 100%)",
          }}
        />

        {/* Scanner beam, fixed at ~52% of the stage */}
        <div
          data-scan-beam
          aria-hidden
          className="pointer-events-none absolute inset-x-3 z-20"
          style={{
            top: "52%",
            height: 36,
            transform: "translateY(-50%)",
            background:
              "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--spyne-primary) 32%, transparent) 50%, transparent 100%)",
            boxShadow: "0 0 28px 4px color-mix(in srgb, var(--spyne-primary) 35%, transparent)",
            borderTop: "1px solid color-mix(in srgb, var(--spyne-primary) 60%, transparent)",
            borderBottom: "1px solid color-mix(in srgb, var(--spyne-primary) 60%, transparent)",
          }}
        />

        {/* Scrolling deck */}
        <div data-scan-stream className="absolute inset-x-0 top-0 px-3 pt-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {deck.map((v, i) => (
              <AnalysisVehicleCard key={`${v.vin}-${i}`} vehicle={v} />
            ))}
          </div>
        </div>

        {/* Validation overlay — appears at the end of the timeline */}
        <div
          data-scan-success
          aria-live="polite"
          className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-3"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in srgb, var(--spyne-success) 14%, var(--spyne-surface)) 0%, var(--spyne-surface) 70%)",
          }}
        >
          <div className="relative flex h-24 w-24 items-center justify-center">
            <span
              data-scan-success-ring
              className="absolute inset-0 rounded-full"
              style={{
                background: "color-mix(in srgb, var(--spyne-success) 20%, transparent)",
              }}
              aria-hidden
            />
            <span
              data-scan-success-ring
              className="absolute inset-0 rounded-full"
              style={{
                background: "color-mix(in srgb, var(--spyne-success) 14%, transparent)",
              }}
              aria-hidden
            />
            <span
              data-scan-success-ring
              className="absolute inset-0 rounded-full"
              style={{
                background: "color-mix(in srgb, var(--spyne-success) 10%, transparent)",
              }}
              aria-hidden
            />
            <div
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-spyne-success text-white"
              style={{
                boxShadow:
                  "0 10px 28px color-mix(in srgb, var(--spyne-success) 35%, transparent), 0 0 0 6px color-mix(in srgb, var(--spyne-success) 12%, transparent)",
              }}
              aria-hidden
            >
              <svg viewBox="0 0 36 36" width="36" height="36" aria-hidden>
                <path
                  data-scan-success-check
                  d="M9 18 L15.5 24.5 L27.5 12.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <p
            data-scan-success-copy
            className="text-base font-semibold text-spyne-text"
          >
            Inventory analysis complete
          </p>
          <p
            data-scan-success-copy
            className="px-6 text-center text-xs text-muted-foreground"
          >
            {total.toLocaleString()} VINs evaluated · media, photo quality, and listing readiness scored.
          </p>
          <span data-scan-success-copy>
            <SpyneChip
              tone="success"
              variant="soft"
              compact
              leading={<MaterialSymbol name="verified" size={14} />}
            >
              Verified by Spyne
            </SpyneChip>
          </span>
        </div>
      </div>

      {/* Footer readout: gauge + counter */}
      <div className="flex shrink-0 items-center justify-between gap-4 rounded-xl border border-spyne-border bg-spyne-surface px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div data-scan-bottom-gauge className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden>
                <circle cx="24" cy="24" r="20" fill="none" stroke="var(--spyne-border)" strokeWidth="4" />
                <path
                  data-scan-arc
                  d="M 24 4 A 20 20 0 1 1 23.99 4"
                  fill="none"
                  stroke="var(--spyne-primary)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  transform="rotate(-90 24 24)"
                />
              </svg>
              <span
                ref={pctRef}
                className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums leading-none text-spyne-text"
              >
                0%
              </span>
            </div>
            <div
              data-scan-bottom-check
              className="absolute inset-0 flex items-center justify-center"
              aria-hidden
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full bg-spyne-success text-white"
                style={{
                  boxShadow: "0 0 0 4px color-mix(in srgb, var(--spyne-success) 18%, transparent)",
                }}
              >
                <MaterialSymbol name="check" size={20} />
              </span>
            </div>
          </div>
          <div className="leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Analysing
            </p>
            <p className="text-sm font-semibold text-spyne-text">Photos · VINs · listing health</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            VINs evaluated
          </p>
          <p className="mt-0.5 text-base font-semibold tabular-nums text-spyne-text">
            <span ref={counterRef}>0</span>
            <span className="ml-1 text-muted-foreground">/ {total.toLocaleString()}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function AnalysisVehicleCard({
  vehicle,
}: {
  vehicle: AnalysisVehicle & { thumb: string }
}) {
  const tone = vehicle.tone
  const tintBg =
    tone === "success"
      ? "color-mix(in srgb, var(--spyne-success) 14%, transparent)"
      : tone === "warning"
        ? "color-mix(in srgb, var(--spyne-warning) 28%, transparent)"
        : "color-mix(in srgb, var(--spyne-error) 14%, transparent)"
  const badgeTone: "success" | "warning" | "error" =
    tone === "success" ? "success" : tone === "warning" ? "warning" : "error"
  const badgeIcon =
    tone === "success" ? "check_circle" : tone === "warning" ? "priority_high" : "cancel"
  const badgeLabel = tone === "success" ? "Ready" : tone === "warning" ? "Watch" : "Action"

  return (
    <div
      data-scan-card
      data-tone={tone}
      className="relative flex h-[88px] gap-2.5 overflow-hidden rounded-lg border border-spyne-border bg-spyne-surface p-2 shadow-sm"
    >
      {/* Photo */}
      <div className="relative h-full w-[96px] shrink-0 overflow-hidden rounded-md bg-spyne-page-bg">
        <Image
          src={vehicle.thumb}
          alt=""
          fill
          sizes="96px"
          className="object-cover"
          aria-hidden
        />
      </div>
      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        <p className="truncate text-xs font-semibold text-spyne-text">{vehicle.name}</p>
        <p className="truncate font-[family-name:Inter,ui-sans-serif] text-[10px] tracking-tight text-spyne-text-secondary">
          VIN · {vehicle.vin}
        </p>
        <div className="mt-0.5 inline-flex">
          <SpyneChip
            tone={badgeTone}
            variant="soft"
            compact
            data-scan-card-badge
            leading={<MaterialSymbol name={badgeIcon} size={14} />}
          >
            {badgeLabel}
          </SpyneChip>
        </div>
      </div>
      {/* Tint overlay applied as the beam stamps the card */}
      <span
        data-scan-card-tint
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-lg"
        style={{ background: tintBg }}
      />
    </div>
  )
}


/* ────────────────────────── Insights ────────────────────────── */

function InsightsState({ controller }: { controller: FtueController }) {
  const { state, applySmartMatch, processingComplete, closeModal } = controller
  const { score, breakdown, processing, smartMatchApplied } = state
  const router = useRouter()
  const pathname = usePathname()
  const alreadyOnMerch = pathname === MERCHANDISING_PATH

  function handleGoToMerchandising() {
    closeModal()
    if (!alreadyOnMerch) {
      router.push(MERCHANDISING_PATH)
    }
  }

  return (
    <PhaseShell
      title="Your inventory snapshot"
      description={`We finished analysing ${breakdown.totalVehicles} vehicles from ${IMS_LABEL[state.ims]}. Here's where you stand.`}
      body={
        <div className="space-y-5">
          <InventoryScore score={score} />

          <InventoryBreakdown
            breakdown={breakdown}
            smartMatchApplied={smartMatchApplied}
            onApplySmartMatch={applySmartMatch}
          />

          {!smartMatchApplied && breakdown.noPhotos > 0 ? (
            <SmartMatchPitch count={breakdown.noPhotos} onApplySmartMatch={applySmartMatch} />
          ) : null}

          {processing.total > 0 ? (
            <RawPhotoProgress processing={processing} complete={processingComplete} />
          ) : null}
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={closeModal}
            className={cn(spyneComponentClasses.btnSecondaryMd, "!h-9 !px-3 !text-sm")}
          >
            Maybe later
          </button>
          <button
            type="button"
            onClick={handleGoToMerchandising}
            className={cn(spyneComponentClasses.btnPrimaryMd, "!h-9 !text-sm")}
          >
            {alreadyOnMerch ? "Got it, take me to my dashboard" : "Take me to Merchandising"}
            <MaterialSymbol name="arrow_forward" size={16} />
          </button>
        </>
      }
    />
  )
}

/* ────────────────────────── Inventory Score ────────────────────────── */

type ScoreBand = "good" | "watch" | "bad"

function scoreBand(score: number): ScoreBand {
  if (score >= 75) return "good"
  if (score >= 50) return "watch"
  return "bad"
}

function InventoryScore({ score }: { score: number }) {
  const band = scoreBand(score)
  const bandCopy: Record<
    ScoreBand,
    { label: string; description: string; chipTone: "success" | "warning" | "error" }
  > = {
    good: {
      label: "On Target",
      description: "Most listings have real, ready-to-publish media.",
      chipTone: "success",
    },
    watch: {
      label: "Needs Attention",
      description: "A meaningful chunk of inventory is missing real media.",
      chipTone: "warning",
    },
    bad: {
      label: "Critical",
      description: "Most listings are running on placeholder or no media.",
      chipTone: "error",
    },
  }
  const copy = bandCopy[band]
  const ringColor =
    band === "good"
      ? "var(--spyne-success)"
      : band === "watch"
        ? "var(--spyne-warning)"
        : "var(--spyne-error)"

  return (
    <section
      aria-labelledby="ftue-inventory-score"
      className="flex items-center gap-5 rounded-xl border border-spyne-border bg-spyne-surface p-5"
    >
      <ScoreDial score={score} ringColor={ringColor} />
      <div className="min-w-0 flex-1">
        <p
          id="ftue-inventory-score"
          className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
        >
          Inventory Score
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-spyne-text">{score}</span>
          <span className="text-sm text-muted-foreground">/ 100</span>
          <SpyneChip tone={copy.chipTone} variant="soft" compact className="ml-1">
            {copy.label}
          </SpyneChip>
        </div>
        <p className="mt-2 text-sm leading-snug text-muted-foreground">{copy.description}</p>
        {/* TODO open-question #1: confirm score methodology, range, and thresholds. */}
      </div>
    </section>
  )
}

function ScoreDial({ score, ringColor }: { score: number; ringColor: string }) {
  const size = 84
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dash = (Math.max(0, Math.min(100, score)) / 100) * circumference

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Inventory score ${score} out of 100`}
    >
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--spyne-border)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={ringColor}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize="20"
        fontWeight={700}
        fill="var(--spyne-text-primary)"
      >
        {score}
      </text>
    </svg>
  )
}

/* ────────────────────────── Inventory Breakdown ────────────────────────── */

interface InventoryBreakdownProps {
  breakdown: FtueState["breakdown"]
  smartMatchApplied: boolean
  onApplySmartMatch: () => void
}

function InventoryBreakdown({
  breakdown,
  smartMatchApplied,
  onApplySmartMatch,
}: InventoryBreakdownProps) {
  const rows: {
    key: string
    icon: string
    title: string
    meta: string
    count: number
    iconWell: string
    cta?: { label: string; onClick: () => void; disabled?: boolean }
  }[] = [
    {
      key: "total",
      icon: "directions_car",
      title: "Total vehicles",
      meta: "Pulled from your IMS feed",
      count: breakdown.totalVehicles,
      iconWell: "",
    },
    {
      key: "no-photos",
      icon: "image_not_supported",
      title: "No photos",
      meta: smartMatchApplied
        ? "Smart Match applied — sourcing real media now"
        : "These listings are invisible to shoppers",
      count: breakdown.noPhotos,
      iconWell: spyneComponentClasses.insightRowIconWellCritical,
    },
    {
      key: "stock",
      icon: "collections",
      title: "Stock photos",
      meta: "Generic catalog imagery — converts poorly",
      count: breakdown.stockPhotos,
      iconWell: spyneComponentClasses.insightRowIconWellWarning,
    },
    {
      key: "raw",
      icon: "photo_camera",
      title: "Raw photos",
      meta: "Auto-processing by Spyne now",
      count: breakdown.rawPhotos,
      iconWell: spyneComponentClasses.insightRowIconWellSuccess,
    },
  ]

  return (
    <section aria-label="Inventory breakdown" className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.key}
          className={cn(spyneComponentClasses.insightRow, "flex items-center gap-3 px-4 py-3")}
        >
          <div
            className={cn(spyneComponentClasses.insightRowIconWell, row.iconWell || "")}
            aria-hidden
          >
            <MaterialSymbol name={row.icon} size={16} />
          </div>
          <div className={spyneComponentClasses.insightRowMain}>
            <p className={spyneComponentClasses.insightRowTitle}>{row.title}</p>
            <p className={spyneComponentClasses.insightRowMeta}>{row.meta}</p>
          </div>
          <span className="ml-auto text-base font-semibold tabular-nums text-spyne-text">
            {row.count.toLocaleString()}
          </span>
          {row.cta ? (
            <button
              type="button"
              onClick={row.cta.onClick}
              disabled={row.cta.disabled}
              className={cn(spyneComponentClasses.btnPrimaryMd, "ml-3 !h-8 !px-3 !text-xs")}
            >
              {row.cta.label}
            </button>
          ) : null}
        </div>
      ))}
    </section>
  )
}

/* ────────────────────────── Smart Match Pitch ────────────────────────── */

function SmartMatchPitch({
  count,
  onApplySmartMatch,
}: {
  count: number
  onApplySmartMatch: () => void
}) {
  return (
    <section
      className="rounded-xl border border-spyne-border p-5"
      style={{
        background:
          "linear-gradient(118deg, rgb(125 211 252 / 0.22) 0%, rgb(196 181 253 / 0.22) 50%, rgb(110 231 183 / 0.22) 100%), var(--spyne-surface)",
      }}
      aria-labelledby="ftue-smart-match-title"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-spyne-primary"
          style={{ background: "var(--spyne-primary-soft)" }}
          aria-hidden
        >
          <MaterialSymbol name="auto_awesome" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p id="ftue-smart-match-title" className="text-sm font-semibold text-spyne-text">
            Apply Smart Match to {count} listings with no photos
          </p>
          <p className="mt-1 text-sm leading-snug text-muted-foreground">
            Spyne pulls real media from matching VINs across our network so empty listings go live
            in minutes — not days.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onApplySmartMatch}
              className={spyneComponentClasses.btnPrimaryMd}
            >
              <MaterialSymbol name="auto_awesome" size={16} />
              Apply Smart Match
            </button>
            <button type="button" className={spyneComponentClasses.btnSecondaryMd}>
              Learn how it works
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────── Raw Photo Progress ────────────────────────── */

function RawPhotoProgress({
  processing,
  complete,
}: {
  processing: FtueState["processing"]
  complete: boolean
}) {
  const pct = useMemo(() => {
    if (processing.total === 0) return 0
    return Math.round((processing.processed / processing.total) * 100)
  }, [processing.processed, processing.total])

  return (
    <section
      className="rounded-xl border border-spyne-border bg-spyne-surface p-5"
      aria-labelledby="ftue-raw-progress-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            id="ftue-raw-progress-title"
            className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Raw photo processing
          </p>
          <p className="mt-1 text-sm font-semibold text-spyne-text">
            {processing.processed.toLocaleString()} of {processing.total.toLocaleString()} VINs
            processed
          </p>
        </div>
        <SpyneChip
          tone={complete ? "success" : "primary"}
          variant="soft"
          compact
          leading={
            <MaterialSymbol
              name={complete ? "check_circle" : "autorenew"}
              size={14}
              className={complete ? "" : "motion-safe:animate-spin"}
            />
          }
        >
          {complete ? "Complete" : "Live"}
        </SpyneChip>
      </div>

      <Progress
        value={pct}
        className="mt-3 h-2 bg-spyne-border/60"
        aria-label={`${pct}% of raw photos processed`}
      />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <ProgressMetricTile icon="rate_review" tone="warning" value={processing.inReview} label="In Review" />
        <ProgressMetricTile icon="rocket_launch" tone="success" value={processing.issued} label="Issued (live)" />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        You can close this modal — processing keeps running in the background.
      </p>
    </section>
  )
}

function ProgressMetricTile({
  icon,
  tone,
  value,
  label,
}: {
  icon: string
  tone: "warning" | "success"
  value: number
  label: string
}) {
  const wellClass =
    tone === "warning"
      ? spyneComponentClasses.insightRowIconWellWarning
      : spyneComponentClasses.insightRowIconWellSuccess
  return (
    <div className="flex items-center gap-3 rounded-lg border border-spyne-border bg-card px-3 py-2.5">
      <div
        className={cn(
          spyneComponentClasses.insightRowIconWell,
          spyneComponentClasses.insightRowIconWellCompact,
          wellClass,
        )}
        aria-hidden
      >
        <MaterialSymbol name={icon} size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-base font-semibold tabular-nums leading-none text-spyne-text">
          {value.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
