"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneChip } from "@/components/max-2/spyne-ui"
import { ProBadge, useIsPro } from "@/components/plan"
import { spyneComponentClasses, max2Classes } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

interface SmartMatchExplainerSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Inline trigger uses condensed copy; the sheet is the expanded version. */
  onApply?: () => void
  /** True when applied — flips the primary CTA to a "Done" indicator. */
  applied?: boolean
  /** True while applying — disables the primary CTA. */
  applying?: boolean
}

/**
 * Expanded "Learn how it works" panel paired with the condensed Smart Match
 * pitch in the FTUE modal and issues panel. Spec point 4: introduces the
 * concept on first run, shows source/matching/library logic.
 */
export function SmartMatchExplainerSheet({
  open,
  onOpenChange,
  onApply,
  applied = false,
  applying = false,
}: SmartMatchExplainerSheetProps) {
  const isPro = useIsPro()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "max2-spyne w-full sm:max-w-[480px] border-spyne-border bg-spyne-surface p-0 z-[130]",
          max2Classes.spyneScope,
        )}
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="shrink-0 border-b border-spyne-border px-5 pb-4 pt-5">
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
                style={{
                  background: "linear-gradient(118deg, #7C3AED 0%, #DB2777 50%, #F59E0B 100%)",
                }}
                aria-hidden
              >
                <MaterialSymbol name="auto_awesome" size={24} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-base font-semibold text-spyne-text">
                    Smart Match
                  </SheetTitle>
                  {!isPro ? <ProBadge /> : null}
                </div>
                <SheetDescription className="mt-0.5 text-xs text-muted-foreground">
                  Shoot once, use always — for every new VIN.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <section className="space-y-5">
              <div className="rounded-xl border border-spyne-border bg-card p-4">
                <p className="text-sm font-semibold text-spyne-text">What it does</p>
                <p className="mt-1.5 text-sm leading-snug text-muted-foreground">
                  When a VIN lands without photos, Smart Match searches your dealer's matched
                  library — and the broader Spyne network — for vehicles with the same year,
                  make, model, and trim. It pulls the real photos already shot for those
                  matches, applies your dealer overlay, and publishes the VLP in minutes
                  instead of waiting days for a re-shoot.
                </p>
              </div>

              <ExplainerStep
                index={1}
                icon="library_books"
                title="Build the library"
                copy="Every shoot you do feeds your dealer-private match library — keyed by Y/M/M/T and trim signature. New dealers start with the network library and grow their own as photos roll in."
              />
              <ExplainerStep
                index={2}
                icon="search"
                title="Find a match"
                copy="When a no-photo VIN appears, we search your library first, then network-wide. Best match is decided by trim fidelity, photo recency, and shoot quality."
              />
              <ExplainerStep
                index={3}
                icon="rocket_launch"
                title="Publish automatically"
                copy="The matched media is run through your standard background, watermark, and compliance rules — then auto-published to every connected channel."
              />

              <div
                className="rounded-xl border p-4"
                style={{
                  background:
                    "linear-gradient(118deg, rgb(125 211 252 / 0.18) 0%, rgb(196 181 253 / 0.18) 50%, rgb(110 231 183 / 0.18) 100%), var(--spyne-surface)",
                  borderColor: "color-mix(in srgb, var(--spyne-primary) 22%, var(--spyne-border))",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  What changes for you
                </p>
                <ul className="mt-2 space-y-2 text-sm">
                  <BenefitRow icon="bolt">
                    Empty VLPs go live in minutes, not <strong>5 days</strong>.
                  </BenefitRow>
                  <BenefitRow icon="savings">
                    Cut holding cost on every day a car would otherwise sit unlisted.
                  </BenefitRow>
                  <BenefitRow icon="trending_up">
                    Sell faster — keep gross margin that leaks each day a VIN stays dark.
                  </BenefitRow>
                </ul>
              </div>

              <div className="rounded-xl border border-dashed border-spyne-border p-4 text-xs leading-relaxed text-muted-foreground">
                <p className="font-semibold text-spyne-text">A note on first-time matches</p>
                <p className="mt-1">
                  If your library hasn't been built yet, Smart Match seeds itself from the
                  network on first apply. Each subsequent VIN you shoot improves matches for
                  every dealer you opt to share with.
                </p>
              </div>
            </section>
          </div>

          <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-spyne-border bg-card/40 px-5 py-4">
            <SpyneChip
              tone="success"
              variant="soft"
              compact
              leading={<MaterialSymbol name="lock" size={14} />}
            >
              Photos stay yours
            </SpyneChip>
            {onApply ? (
              <button
                type="button"
                onClick={() => {
                  if (applying || applied) return
                  onApply()
                  onOpenChange(false)
                }}
                disabled={!isPro || applying || applied}
                className={cn(
                  spyneComponentClasses.btnPrimaryMd,
                  "!h-9 !text-sm",
                  (!isPro || applying || applied) && "cursor-not-allowed opacity-60",
                )}
              >
                <MaterialSymbol
                  name={applied ? "check" : "auto_awesome"}
                  size={16}
                  className={applying ? "motion-safe:animate-spin" : ""}
                />
                {applied ? "Applied" : applying ? "Applying…" : "Apply Smart Match"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className={cn(spyneComponentClasses.btnSecondaryMd, "!h-9 !text-sm")}
              >
                Got it
              </button>
            )}
          </footer>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ExplainerStep({
  index,
  icon,
  title,
  copy,
}: {
  index: number
  icon: string
  title: string
  copy: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-spyne-primary"
        style={{ background: "var(--spyne-primary-soft)" }}
        aria-hidden
      >
        {index}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <MaterialSymbol name={icon} size={16} className="text-spyne-text" />
          <p className="text-sm font-semibold text-spyne-text">{title}</p>
        </div>
        <p className="mt-1 text-sm leading-snug text-muted-foreground">{copy}</p>
      </div>
    </div>
  )
}

function BenefitRow({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-spyne-text">
      <MaterialSymbol name={icon} size={16} className="mt-0.5 shrink-0 text-spyne-primary" />
      <span>{children}</span>
    </li>
  )
}
