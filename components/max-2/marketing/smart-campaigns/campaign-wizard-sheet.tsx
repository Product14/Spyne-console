"use client"

import * as React from "react"
import Image from "next/image"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneChip } from "@/components/max-2/spyne-ui"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import type {
  Campaign,
  CampaignChannel,
  CampaignVehicle,
  CampaignWizardDraft,
  CampaignWizardStep,
} from "@/services/max-2/smart-campaigns.types"

const STEPS: { key: CampaignWizardStep; label: string }[] = [
  { key: "inventory", label: "Inventory" },
  { key: "design", label: "Design" },
  { key: "schedule", label: "Schedule" },
  { key: "review", label: "Review" },
]

const CHANNEL_LABEL: Record<CampaignChannel, string> = {
  "google-ads": "Google",
  "meta-ads": "Meta",
  autotrader: "AutoTrader",
  "cars-dot-com": "Cars.com",
  email: "Email",
  sms: "SMS",
  "vlp-spotlight": "VLP",
  "social-organic": "Social",
}

interface CampaignWizardProps {
  draft: CampaignWizardDraft
  setDraft: (draft: CampaignWizardDraft) => void
  onCancel: () => void
  onPublish: (campaign: Campaign) => void
}

/**
 * Inline wizard panel. Renders inside the Marketing page (replacing the
 * landing content) so the Max 2 sidebar stays visible and the surface is
 * fully opaque. Both manual and agentic flows share this view; agentic
 * flows land directly on the Review step.
 */
export function CampaignWizard({
  draft,
  setDraft,
  onCancel,
  onPublish,
}: CampaignWizardProps) {
  const stepIndex = STEPS.findIndex((s) => s.key === draft.step)
  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex === STEPS.length - 1

  const goToStep = (next: CampaignWizardStep) => setDraft({ ...draft, step: next })

  const handleNext = () => {
    const next = STEPS[stepIndex + 1]
    if (next) goToStep(next.key)
  }
  const handleBack = () => {
    const prev = STEPS[stepIndex - 1]
    if (prev) goToStep(prev.key)
  }

  const handlePublish = () => {
    onPublish({
      id: draft.id,
      kind: draft.kind,
      status: "scheduled",
      title: draft.title,
      vehicles: draft.vehicles,
      config: draft.config,
      performance: {
        impressions: 0,
        leads: 0,
        appointments: 0,
        unitsSold: 0,
        spend: 0,
      },
      createdAt: new Date().toISOString(),
      launchedAt: draft.config.scheduledFor,
    })
  }

  return (
    <div className="flex max-h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-2xl border border-spyne-border bg-spyne-surface">
      <header className="shrink-0 border-b border-spyne-border px-8 pt-7 pb-6">
        <button
          type="button"
          onClick={onCancel}
          className="mb-5 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-spyne-text"
        >
          <MaterialSymbol name="arrow_back" size={16} />
          Back to campaigns
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold tracking-tight text-spyne-text">
              {draft.kind === "agentic" ? "Review campaign" : "New campaign"}
            </h2>
            {draft.prompt ? (
              <p className="mt-2 max-w-xl truncate text-sm text-muted-foreground">
                "{draft.prompt}"
              </p>
            ) : null}
          </div>
          {draft.kind === "agentic" ? (
            <SpyneChip
              tone="primary"
              variant="soft"
              compact
              leading={<MaterialSymbol name="auto_awesome" size={14} />}
            >
              Spyne draft
            </SpyneChip>
          ) : null}
        </div>

        <StepTrack
          currentStep={draft.step}
          onJump={(s) => {
            const targetIdx = STEPS.findIndex((x) => x.key === s)
            if (targetIdx <= stepIndex) goToStep(s)
          }}
        />
      </header>

      <div className="flex-1 overflow-y-auto bg-spyne-page-bg px-8 py-7">
        {draft.step === "inventory" ? (
          <InventoryStep draft={draft} setDraft={setDraft} />
        ) : draft.step === "design" ? (
          <DesignStep draft={draft} setDraft={setDraft} />
        ) : draft.step === "schedule" ? (
          <ScheduleStep draft={draft} setDraft={setDraft} />
        ) : (
          <ReviewStep draft={draft} setDraft={setDraft} />
        )}
      </div>

      <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-spyne-border bg-spyne-surface px-8 py-4">
        <button
          type="button"
          onClick={isFirstStep ? onCancel : handleBack}
          className={cn(spyneComponentClasses.btnSecondaryMd, "!h-10 !text-sm !px-4")}
        >
          {isFirstStep ? "Cancel" : "Back"}
        </button>

        <div className="flex items-center gap-2">
          {isLastStep ? (
            <>
              <button
                type="button"
                onClick={onCancel}
                className={cn(
                  spyneComponentClasses.btnSecondaryMd,
                  "!h-10 !text-sm !px-4",
                )}
              >
                Save as draft
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className={cn(spyneComponentClasses.btnPrimaryMd, "!h-10 !px-5 !text-sm")}
              >
                Publish
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className={cn(spyneComponentClasses.btnPrimaryMd, "!h-10 !px-5 !text-sm")}
            >
              Next
              <MaterialSymbol name="arrow_forward" size={16} />
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}

/* ────────────────────────── Step track ────────────────────────── */

function StepTrack({
  currentStep,
  onJump,
}: {
  currentStep: CampaignWizardStep
  onJump: (s: CampaignWizardStep) => void
}) {
  const currentIdx = STEPS.findIndex((s) => s.key === currentStep)
  return (
    <ol className="mt-7 flex items-center gap-3">
      {STEPS.map((step, i) => {
        const isDone = i < currentIdx
        const isActive = i === currentIdx
        const isUpcoming = i > currentIdx
        return (
          <li key={step.key} className="flex flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => onJump(step.key)}
              className={cn(
                "flex items-center gap-2 text-left transition-opacity",
                isUpcoming && "pointer-events-none opacity-60",
              )}
              disabled={isUpcoming}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold tabular-nums",
                  isActive && "border-spyne-primary bg-spyne-primary text-white",
                  isDone &&
                    "border-spyne-primary bg-spyne-primary-soft text-spyne-primary",
                  isUpcoming && "border-spyne-border text-muted-foreground",
                )}
              >
                {isDone ? <MaterialSymbol name="check" size={14} /> : String(i + 1)}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold",
                  isActive && "text-spyne-text",
                  isDone && "text-spyne-text",
                  isUpcoming && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </button>
            {i < STEPS.length - 1 ? (
              <span
                className={cn(
                  "h-px flex-1",
                  i < currentIdx ? "bg-spyne-primary/40" : "bg-spyne-border",
                )}
                aria-hidden
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

/* ────────────────────────── Step 01 — Inventory ────────────────────────── */

function InventoryStep({
  draft,
  setDraft,
}: {
  draft: CampaignWizardDraft
  setDraft: (d: CampaignWizardDraft) => void
}) {
  const removeVehicle = (vin: string) => {
    setDraft({ ...draft, vehicles: draft.vehicles.filter((v) => v.vin !== vin) })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <InventoryFiltersPanel total={draft.vehicles.length} />

      <div className="rounded-xl border border-spyne-border bg-spyne-surface">
        <div className="flex items-center justify-between gap-2 border-b border-spyne-border px-6 py-4">
          <p className="text-sm font-semibold text-spyne-text">Vehicles</p>
          <span className="text-xs text-muted-foreground tabular-nums">
            {draft.vehicles.length.toLocaleString()}
          </span>
        </div>
        <div className="max-h-[440px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-spyne-surface text-xs text-muted-foreground">
              <tr className="border-b border-spyne-border">
                <th className="px-6 py-3 font-medium">VIN</th>
                <th className="px-6 py-3 font-medium">Vehicle</th>
                <th className="px-6 py-3 font-medium">Age</th>
                <th className="px-6 py-3 font-medium">Holding</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {draft.vehicles.map((v) => (
                <tr key={v.vin} className="border-b border-spyne-border/60 hover:bg-muted/30">
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                    {v.vin.slice(-8)}
                  </td>
                  <td className="px-6 py-3">
                    <p className="text-sm font-semibold text-spyne-text">{v.name}</p>
                  </td>
                  <td className="px-6 py-3 tabular-nums">
                    <AgePill days={v.daysInStock} />
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold tabular-nums text-spyne-text">
                    ${Math.round(v.holdingAccumulated).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeVehicle(v.vin)}
                      aria-label={`Remove ${v.name}`}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted/40 hover:text-spyne-error"
                    >
                      <MaterialSymbol name="close" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {draft.vehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No vehicles in this group.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function InventoryFiltersPanel({ total }: { total: number }) {
  return (
    <aside className="rounded-xl border border-spyne-border bg-spyne-surface">
      <div className="space-y-5 p-5">
        <FilterDropdown label="Rooftop" value="All rooftops" />

        <div>
          <p className="text-sm font-semibold text-spyne-text">Inventory Group 1</p>
          <p className="text-xs text-muted-foreground">
            Total no. of vehicles{" "}
            <SpyneChip tone="primary" variant="soft" compact className="ml-1">
              {total}
            </SpyneChip>
          </p>
        </div>
      </div>

      <FilterSection title="Inventory type">
        <FilterCheckbox label="New vehicles" defaultChecked />
        <FilterCheckbox label="Used vehicles" />
      </FilterSection>

      <FilterSection title="Mileage (odometer)">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <FilterInput placeholder="Min" />
          <span className="text-xs text-muted-foreground">to</span>
          <FilterInput placeholder="Max" />
        </div>
      </FilterSection>

      <FilterSection title="Stock no.">
        <div className="space-y-2">
          <StockRangeRow />
          <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground">
            or
          </p>
          <StockRangeRow />
        </div>
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-spyne-primary"
        >
          <MaterialSymbol name="add" size={14} />
          Add a row
        </button>
      </FilterSection>

      <FilterSection title="Vehicle details">
        <FilterCheckbox label="Certified pre-owned" />
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Certified pre-owned by
        </p>
        <FilterDropdown label="" value="Select make" />
      </FilterSection>

      <FilterCheckGroup title="Year" items={["2024", "2023", "2022", "2021", "2020"]} />
      <FilterCheckGroup title="Make" items={["Toyota", "Hyundai", "Ford", "Chevrolet"]} searchable />
      <FilterCheckGroup title="Model" items={["Camry", "Accord", "F-150", "3 Series"]} searchable />
      <FilterCheckGroup title="Trim" items={["Base", "LE", "XLE", "Limited", "Premium"]} searchable />

      <FilterSection title="Exclude vehicle from promo">
        <FilterInput placeholder="Vehicle search" iconRight="search" />
        <ul className="mt-2 space-y-1.5 text-xs">
          {[1, 2, 3].map((i) => (
            <li key={i} className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-0.5 h-3.5 w-3.5 accent-spyne-primary"
                aria-label="Exclude vehicle"
              />
              <span className="leading-tight text-spyne-text">
                2017 Nissan Rogue SL
                <span className="block text-[10px] text-muted-foreground">
                  R5480M · JN8AT2MV5HW273123
                </span>
              </span>
            </li>
          ))}
        </ul>
        <button type="button" className="mt-2 text-xs font-semibold text-spyne-primary">
          24 more
        </button>
      </FilterSection>
    </aside>
  )
}

function FilterSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <details
      className="group border-t border-spyne-border"
      open
    >
      <summary className="flex cursor-pointer items-center justify-between px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
        <MaterialSymbol
          name="expand_more"
          size={16}
          className="transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="px-5 pb-4">{children}</div>
    </details>
  )
}

function FilterCheckGroup({
  title,
  items,
  searchable = false,
}: {
  title: string
  items: string[]
  searchable?: boolean
}) {
  return (
    <FilterSection title={title}>
      {searchable ? (
        <FilterInput placeholder={`Search ${title.toLowerCase()}`} iconRight="search" />
      ) : null}
      <ul className={cn("space-y-1.5 text-xs", searchable && "mt-2")}>
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 accent-spyne-primary"
              aria-label={`Filter by ${item}`}
            />
            <span className="text-spyne-text">{item}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="mt-2 text-xs font-semibold text-spyne-primary">
        24 more
      </button>
    </FilterSection>
  )
}

function FilterDropdown({ label, value }: { label: string; value: string }) {
  return (
    <div>
      {label ? (
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
      ) : null}
      <button
        type="button"
        className="flex h-9 w-full items-center justify-between rounded-lg border border-spyne-border bg-spyne-surface px-3 text-sm text-spyne-text hover:border-spyne-primary/40"
      >
        <span>{value}</span>
        <MaterialSymbol name="expand_more" size={16} className="text-muted-foreground" />
      </button>
    </div>
  )
}

function FilterCheckbox({
  label,
  defaultChecked = false,
}: {
  label: string
  defaultChecked?: boolean
}) {
  return (
    <label className="flex items-center gap-2 py-1 text-xs text-spyne-text">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-3.5 w-3.5 accent-spyne-primary"
      />
      {label}
    </label>
  )
}

function FilterInput({
  placeholder,
  iconRight,
}: {
  placeholder: string
  iconRight?: string
}) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-spyne-border bg-spyne-surface px-3 pr-8 text-xs text-spyne-text placeholder:text-muted-foreground/70 focus:border-spyne-primary focus:outline-none focus:ring-2 focus:ring-spyne-primary/20"
      />
      {iconRight ? (
        <MaterialSymbol
          name={iconRight}
          size={14}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
      ) : null}
    </div>
  )
}

function StockRangeRow() {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-1.5">
      <FilterInput placeholder="Start with" />
      <span className="text-xs text-muted-foreground">&amp;</span>
      <FilterInput placeholder="End with" />
      <button
        type="button"
        aria-label="Clear range"
        className="rounded-md p-0.5 text-muted-foreground hover:bg-muted/40 hover:text-spyne-error"
      >
        <MaterialSymbol name="close" size={14} />
      </button>
    </div>
  )
}

function AgePill({ days }: { days: number }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
        days >= 60
          ? "bg-spyne-error-soft text-spyne-error"
          : days >= 45
            ? "bg-spyne-warning-soft text-spyne-warning-ink"
            : days >= 30
              ? "bg-spyne-primary-soft text-spyne-primary"
              : "bg-muted text-muted-foreground",
      )}
    >
      {days}d
    </span>
  )
}


/* ────────────────────────── Step 02 — Design ────────────────────────── */

function DesignStep({
  draft,
  setDraft,
}: {
  draft: CampaignWizardDraft
  setDraft: (d: CampaignWizardDraft) => void
}) {
  const heroVehicle = draft.vehicles[0]

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-spyne-border bg-spyne-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Creative
        </p>

        <div className="mt-5 space-y-2">
          <label htmlFor="campaign-headline" className="text-xs font-medium text-muted-foreground">
            Headline
          </label>
          <input
            id="campaign-headline"
            type="text"
            value={draft.config.creative.headline}
            onChange={(e) =>
              setDraft({
                ...draft,
                config: {
                  ...draft.config,
                  creative: { ...draft.config.creative, headline: e.target.value },
                },
              })
            }
            className="h-11 w-full rounded-lg border border-spyne-border bg-spyne-surface px-3 text-sm text-spyne-text focus:border-spyne-primary focus:outline-none focus:ring-2 focus:ring-spyne-primary/20"
          />
        </div>

        <div className="mt-4 space-y-2">
          <label htmlFor="campaign-body" className="text-xs font-medium text-muted-foreground">
            Body
          </label>
          <textarea
            id="campaign-body"
            rows={3}
            value={draft.config.creative.body}
            onChange={(e) =>
              setDraft({
                ...draft,
                config: {
                  ...draft.config,
                  creative: { ...draft.config.creative, body: e.target.value },
                },
              })
            }
            className="w-full rounded-lg border border-spyne-border bg-spyne-surface px-3 py-2.5 text-sm text-spyne-text focus:border-spyne-primary focus:outline-none focus:ring-2 focus:ring-spyne-primary/20"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-spyne-border bg-spyne-surface">
        <div className="px-5 pt-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Preview
          </p>
        </div>
        <div className="relative mt-4 aspect-[16/10] bg-spyne-page-bg">
          {heroVehicle ? (
            <Image
              src={heroVehicle.thumbnailUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              aria-hidden
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No vehicle
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-5 bottom-5 rounded-lg bg-black/55 px-4 py-3 text-white">
            <p className="text-base font-bold">{draft.config.creative.headline}</p>
            <p className="mt-0.5 text-xs opacity-90">{draft.config.creative.body}</p>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ────────────────────────── Step 03 — Schedule ────────────────────────── */

function ScheduleStep({
  draft,
  setDraft,
}: {
  draft: CampaignWizardDraft
  setDraft: (d: CampaignWizardDraft) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-spyne-border bg-spyne-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Schedule
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <DateField
            label="Start"
            value={draft.config.scheduledFor}
            onChange={(iso) =>
              setDraft({ ...draft, config: { ...draft.config, scheduledFor: iso } })
            }
          />
          <DateField
            label="End"
            value={addDaysIso(draft.config.scheduledFor, draft.config.durationDays)}
            readOnly
          />
        </div>

        <div className="mt-5 space-y-2">
          <label htmlFor="campaign-budget" className="text-xs font-medium text-muted-foreground">
            Budget
          </label>
          <input
            id="campaign-budget"
            type="number"
            min={100}
            step={100}
            value={draft.config.budget}
            onChange={(e) =>
              setDraft({
                ...draft,
                config: { ...draft.config, budget: Number(e.target.value) || 0 },
              })
            }
            className="h-11 w-full rounded-lg border border-spyne-border bg-spyne-surface px-3 text-sm tabular-nums text-spyne-text focus:border-spyne-primary focus:outline-none focus:ring-2 focus:ring-spyne-primary/20"
          />
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium text-muted-foreground">Channels</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {draft.config.channels.map((c) => (
              <SpyneChip key={c} tone="primary" variant="soft" compact>
                {CHANNEL_LABEL[c]}
              </SpyneChip>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-spyne-border bg-spyne-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Projection
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <ProjectionTile label="Impressions" value={draft.projection.impressions.toLocaleString()} />
          <ProjectionTile label="Leads" value={draft.projection.leads.toLocaleString()} />
          <ProjectionTile label="Appointments" value={draft.projection.appointments.toLocaleString()} />
          <ProjectionTile label="Units" value={draft.projection.unitsSold.toLocaleString()} />
        </div>
        <div className="mt-5 rounded-lg border border-spyne-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Holding cost saved</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-spyne-success">
            ${draft.projection.estimatedHoldingSavings.toLocaleString()}
          </p>
        </div>
      </section>
    </div>
  )
}

function DateField({
  label,
  value,
  onChange,
  readOnly = false,
}: {
  label: string
  value: string
  onChange?: (iso: string) => void
  readOnly?: boolean
}) {
  const dateValue = (() => {
    try {
      return new Date(value).toISOString().slice(0, 10)
    } catch {
      return ""
    }
  })()

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <input
        type="date"
        value={dateValue}
        readOnly={readOnly}
        onChange={(e) => {
          if (!onChange) return
          const iso = new Date(`${e.target.value}T09:00:00.000Z`).toISOString()
          onChange(iso)
        }}
        className={cn(
          "mt-1 h-11 w-full rounded-lg border border-spyne-border bg-spyne-surface px-3 text-sm tabular-nums text-spyne-text focus:border-spyne-primary focus:outline-none focus:ring-2 focus:ring-spyne-primary/20",
          readOnly && "cursor-default bg-muted/30",
        )}
      />
    </div>
  )
}

function ProjectionTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-spyne-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-spyne-text">{value}</p>
    </div>
  )
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString()
}

/* ────────────────────────── Step 04 — Review ────────────────────────── */

function ReviewStep({
  draft,
  setDraft,
}: {
  draft: CampaignWizardDraft
  setDraft: (d: CampaignWizardDraft) => void
}) {
  const removeVehicle = (vin: string) => {
    setDraft({ ...draft, vehicles: draft.vehicles.filter((v) => v.vin !== vin) })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <ReviewSummaryTile label="VINs" value={draft.vehicles.length.toLocaleString()} />
        <ReviewSummaryTile
          label="Budget"
          value={`$${draft.config.budget.toLocaleString()}`}
        />
        <ReviewSummaryTile
          label="Schedule"
          value={`${draft.config.durationDays}d`}
          sub={formatDate(draft.config.scheduledFor)}
        />
        <ReviewSummaryTile
          label="Est. units"
          value={draft.projection.unitsSold.toLocaleString()}
          accent
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="rounded-xl border border-spyne-border bg-spyne-surface p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Vehicles
            </p>
            <span className="text-xs text-muted-foreground tabular-nums">
              {draft.vehicles.length}
            </span>
          </div>

          {draft.vehicles.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-spyne-border px-4 py-10 text-center text-sm text-muted-foreground">
              No vehicles in this campaign.
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {draft.vehicles.map((v) => (
                <VehicleFrameTile
                  key={v.vin}
                  vehicle={v}
                  onRemove={() => removeVehicle(v.vin)}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-xl border border-spyne-border bg-spyne-surface p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Creative
          </p>
          <p className="mt-3 text-sm font-semibold text-spyne-text">
            {draft.config.creative.headline}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{draft.config.creative.body}</p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Channels
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {draft.config.channels.map((c) => (
              <SpyneChip key={c} tone="primary" variant="soft" compact>
                {CHANNEL_LABEL[c]}
              </SpyneChip>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

function VehicleFrameTile({
  vehicle,
  onRemove,
}: {
  vehicle: CampaignVehicle
  onRemove?: () => void
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-spyne-border bg-card transition-colors hover:border-spyne-error/40">
      <div className="relative aspect-[4/3]">
        <Image
          src={vehicle.thumbnailUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 16vw, 33vw"
          className="object-cover"
          aria-hidden
        />
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            title="Remove from campaign"
            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-spyne-surface text-spyne-error opacity-0 shadow-md transition-opacity hover:bg-spyne-error hover:text-white focus-visible:opacity-100 group-hover:opacity-100"
          >
            <MaterialSymbol name="close" size={14} />
          </button>
        ) : null}
      </div>
      <div className="px-3 py-2">
        <p className="truncate text-xs font-semibold text-spyne-text">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
          {vehicle.daysInStock}d · {vehicle.vin.slice(-6)}
        </p>
      </div>
    </div>
  )
}

function ReviewSummaryTile({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string
  value: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div className="rounded-xl border border-spyne-border bg-spyne-surface p-5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums",
          accent ? "text-spyne-success" : "text-spyne-text",
        )}
      >
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}
