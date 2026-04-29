"use client"

import * as React from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { SpyneDarkTooltipPanel } from "@/components/max-2/spyne-ui"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { HoldingCostSetupModals } from "@/components/max-2/lot-view/holding-cost-setup-modals"

const fmt0 = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`
const fmt2 = (n: number) => `$${n.toFixed(2)}`
const fmtN = (n: number, d = 0) =>
  n.toLocaleString("en-US", { maximumFractionDigits: d })

interface CalcState {
  ytdTotal:       string
  ytdVariable:    string
  monthlySales:   string
  turnoverFactor: string
  daysOpen:       string
}

const DEFAULTS: CalcState = {
  ytdTotal:       "2500000",
  ytdVariable:    "500000",
  monthlySales:   "100",
  turnoverFactor: "1.33",
  daysOpen:       "27",
}

type PopoverView = "direct" | "calculator"

export function LotHoldingCostWidget({
  configured,
  onSave,
}: {
  configured: boolean
  onSave: (dailyRate: number) => void
}) {
  const [setupModalOpen, setSetupModalOpen] = React.useState(false)
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const [s, setS] = React.useState<CalcState>(DEFAULTS)
  const [popoverView, setPopoverView] = React.useState<PopoverView>("direct")
  const [directRateInput, setDirectRateInput] = React.useState("")
  const [showFormula, setShowFormula] = React.useState(false)

  const upd = (k: keyof CalcState, v: string) => setS((p) => ({ ...p, [k]: v }))

  const ytdTotal     = parseFloat(s.ytdTotal)      || 0
  const ytdVariable  = parseFloat(s.ytdVariable)   || 0
  const monthlySales = parseFloat(s.monthlySales)  || 0
  const turnover     = parseFloat(s.turnoverFactor) || 1.33
  const daysOpen     = Math.max(parseFloat(s.daysOpen) || 1, 1)

  const fixedCost    = ytdTotal - ytdVariable
  const monthlyFixed = fixedCost / 12
  const avgUnits     = monthlySales * turnover
  const costPerUnit  = avgUnits > 0 ? monthlyFixed / avgUnits : 0
  const dailyRate    = costPerUnit / daysOpen

  // Reset to direct view and pre-fill with current rate each time popover opens
  React.useEffect(() => {
    if (popoverOpen) {
      setPopoverView("direct")
      setDirectRateInput(dailyRate > 0 ? dailyRate.toFixed(2) : "")
      setShowFormula(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popoverOpen])

  const directRateNum   = parseFloat(directRateInput)
  const validDirectRate = Number.isFinite(directRateNum) && directRateNum > 0

  const applyDirect = () => {
    if (!validDirectRate) return
    onSave(directRateNum)
    setPopoverOpen(false)
  }

  const applyCalculated = () => {
    if (dailyRate <= 0) return
    onSave(dailyRate)
    setPopoverOpen(false)
  }

  if (!configured) {
    return (
      <>
        <button
          type="button"
          onClick={() => setSetupModalOpen(true)}
          className={cn(spyneComponentClasses.toolbarTrigger, "group min-w-[min(100%,280px)] sm:min-w-0")}
        >
          <div className="flex items-center gap-1.5">
            <MaterialSymbol name="attach_money" size={14} className="text-spyne-text-secondary" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-spyne-text-secondary">
              Holding Cost
            </span>
            <MaterialSymbol name="expand_more" size={14} className="text-spyne-text-secondary" />
          </div>
          <p className="text-sm font-medium text-spyne-text-secondary mt-0.5">
            Tap to set rate
          </p>
        </button>

        <HoldingCostSetupModals
          open={setupModalOpen}
          onOpenChange={setSetupModalOpen}
          onSave={onSave}
        />
      </>
    )
  }

  return (
    <div className="flex flex-wrap items-end justify-end gap-3 sm:gap-4">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              spyneComponentClasses.toolbarTrigger,
              "group min-w-[min(100%,280px)] sm:min-w-0",
            )}
          >
            <div className="flex items-center gap-1.5">
              <MaterialSymbol name="attach_money" size={14} className="text-spyne-text-secondary" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-spyne-text-secondary">
                Holding Cost
              </span>
              <MaterialSymbol
                name="expand_more"
                size={14}
                className="text-spyne-text-secondary transition-transform duration-150 group-data-[state=open]:rotate-180"
              />
            </div>
            <p className="mt-0.5 text-base font-bold tabular-nums tracking-tight text-spyne-error">
              {fmt2(dailyRate)}
              <span className="ml-1 text-xs font-medium text-muted-foreground">/car/day</span>
            </p>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className={cn(
            "p-0 rounded-xl overflow-hidden border",
            popoverView === "direct" ? "w-[340px]" : "w-[480px]",
          )}
        >
          {popoverView === "direct" ? (
            /* ── Direct entry view ── */
            <>
              <div className="border-b border-spyne-border bg-muted/20 px-5 py-3.5">
                <p className="text-sm font-semibold">Holding Cost</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  $/car/day applied across your inventory
                </p>
              </div>

              <div className="space-y-3 px-5 py-4">
                <div>
                  <p className="mb-1.5 text-xs font-medium text-spyne-text">
                    Your daily holding cost rate
                  </p>
                  <div
                    className="flex h-10 items-stretch overflow-hidden rounded-lg border-2 bg-white transition-shadow focus-within:ring-2 focus-within:ring-spyne-primary/30"
                    style={{ borderColor: "var(--spyne-primary)" }}
                  >
                    <span className="flex shrink-0 items-center border-r border-spyne-border bg-muted/50 px-2.5 text-sm font-semibold text-muted-foreground">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={directRateInput}
                      onChange={(e) => setDirectRateInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") applyDirect() }}
                      placeholder="e.g. 46.44"
                      className="min-w-0 flex-1 bg-transparent px-2.5 text-sm font-medium tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <span className="flex shrink-0 items-center whitespace-nowrap border-l border-spyne-border bg-muted/50 px-2.5 text-xs text-muted-foreground">
                      /car/day
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-spyne-border bg-spyne-primary-soft px-3 py-2">
                  <span className="text-xs text-spyne-text">Don&apos;t know your rate?</span>
                  <button
                    type="button"
                    onClick={() => setPopoverView("calculator")}
                    className="text-xs font-semibold text-spyne-primary hover:underline"
                  >
                    Let&apos;s calculate →
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-spyne-border px-5 py-3">
                <button
                  type="button"
                  onClick={() => setPopoverOpen(false)}
                  className="rounded-lg border border-spyne-border px-4 py-1.5 text-sm font-medium text-spyne-text hover:bg-muted/40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!validDirectRate}
                  onClick={applyDirect}
                  className="rounded-lg bg-spyne-primary px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--spyne-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save &amp; Apply
                </button>
              </div>
            </>
          ) : (
            /* ── Calculator view ── */
            <>
              <div className="flex items-center gap-2 border-b border-spyne-border px-4 py-3">
                <button
                  type="button"
                  onClick={() => setPopoverView("direct")}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60"
                >
                  <MaterialSymbol name="chevron_left" size={20} />
                </button>
                <div>
                  <p className="text-sm font-semibold">Calculate your rate</p>
                  <p className="text-xs text-muted-foreground">
                    Enter what you know — we&apos;ll do the rest
                  </p>
                </div>
              </div>

              <div className="max-h-[70vh] space-y-3 overflow-y-auto px-5 py-4">
                <CalcField
                  label="YTD Total Used Expense"
                  prefix="$"
                  value={s.ytdTotal}
                  set={(v) => upd("ytdTotal", v)}
                  hint="Total of all used car department expenses from the start of the fiscal year — includes both fixed and variable costs."
                />
                <CalcField
                  label="YTD Variable Expense"
                  prefix="$"
                  value={s.ytdVariable}
                  set={(v) => upd("ytdVariable", v)}
                  hint="Variable costs such as commissions, reconditioning, and advertising that fluctuate with sales volume."
                />
                <CalcField
                  label="Monthly Sales"
                  suffix="units/mo"
                  value={s.monthlySales}
                  set={(v) => upd("monthlySales", v)}
                  hint="Average units sold per month"
                />
                <CalcField
                  label="Days Open per Month"
                  suffix="days"
                  value={s.daysOpen}
                  set={(v) => upd("daysOpen", v)}
                  hint="Typically 26–27 selling days"
                />

                {/* Result */}
                <div
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-4 py-3",
                    dailyRate > 0
                      ? "border-spyne-primary/20 bg-spyne-primary-soft"
                      : "border-spyne-border bg-muted/20",
                  )}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Daily Holding Cost
                  </p>
                  <p
                    className={cn(
                      "text-lg font-bold tabular-nums",
                      dailyRate > 0 ? "text-spyne-primary" : "text-muted-foreground",
                    )}
                  >
                    {dailyRate > 0 ? fmt2(dailyRate) : "—"}
                    {dailyRate > 0 && (
                      <span className="ml-1 text-xs font-normal opacity-70">/car/day</span>
                    )}
                  </p>
                </div>

                {/* See how it's calculated */}
                <button
                  type="button"
                  onClick={() => setShowFormula((v) => !v)}
                  className="flex w-full items-center gap-1 text-xs font-medium text-muted-foreground hover:text-spyne-text"
                >
                  <MaterialSymbol
                    name="expand_more"
                    size={16}
                    className={cn(
                      "transition-transform duration-200",
                      showFormula && "rotate-180",
                    )}
                  />
                  See how it&apos;s calculated
                </button>

                {showFormula && (
                  <div className="divide-y divide-spyne-border overflow-hidden rounded-lg border border-spyne-border bg-muted/10">
                    <FormulaRow
                      n={1}
                      label="Fixed Cost"
                      formula={`${fmt0(ytdTotal)} − ${fmt0(ytdVariable)}`}
                      result={fixedCost > 0 ? fmt0(fixedCost) : "—"}
                    />
                    <FormulaRow
                      n={2}
                      label="Monthly Fixed"
                      formula={`${fixedCost > 0 ? fmt0(fixedCost) : "—"} ÷ 12`}
                      result={monthlyFixed > 0 ? `${fmt0(monthlyFixed)}/mo` : "—"}
                    />
                    <FormulaRow
                      n={3}
                      label="Avg Units in Stock"
                      formula={`${monthlySales || "—"} × 1.33`}
                      result={avgUnits > 0 ? `${fmtN(avgUnits, 1)} units` : "—"}
                    />
                    <FormulaRow
                      n={4}
                      label="Cost / Unit / Month"
                      formula={`${monthlyFixed > 0 ? fmt0(monthlyFixed) : "—"} ÷ ${avgUnits > 0 ? fmtN(avgUnits, 1) : "—"}`}
                      result={costPerUnit > 0 ? `${fmt0(costPerUnit)}/unit` : "—"}
                    />
                    <FormulaRow
                      n={5}
                      label="Daily Holding Cost"
                      formula={`${costPerUnit > 0 ? fmt0(costPerUnit) : "—"} ÷ ${daysOpen}d`}
                      result={dailyRate > 0 ? fmt2(dailyRate) : "—"}
                      highlight
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-spyne-border px-5 py-3">
                <button
                  type="button"
                  onClick={() => setPopoverView("direct")}
                  className="flex items-center gap-0.5 text-sm text-muted-foreground hover:text-spyne-text"
                >
                  <MaterialSymbol name="chevron_left" size={16} />
                  Back
                </button>
                <button
                  type="button"
                  disabled={dailyRate <= 0}
                  onClick={applyCalculated}
                  className="rounded-lg bg-spyne-primary px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--spyne-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Apply {dailyRate > 0 ? fmt2(dailyRate) : "—"} /car/day
                </button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function CalcField({
  label,
  prefix,
  suffix,
  value,
  set,
  hint,
}: {
  label: string
  prefix?: string
  suffix?: string
  value: string
  set: (v: string) => void
  hint?: string
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <p className="text-xs font-medium text-spyne-text">{label}</p>
        {hint && (
          <TooltipPrimitive.Provider delayDuration={200}>
            <TooltipPrimitive.Root>
              <TooltipPrimitive.Trigger asChild>
                <span className="inline-flex cursor-default items-center text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                  <MaterialSymbol name="info" size={14} />
                </span>
              </TooltipPrimitive.Trigger>
              <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                  side="top"
                  align="start"
                  sideOffset={6}
                  className={spyneComponentClasses.darkTooltipRadixContent}
                >
                  <SpyneDarkTooltipPanel title={label} lines={[hint]} />
                  <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={14} height={7} />
                </TooltipPrimitive.Content>
              </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
          </TooltipPrimitive.Provider>
        )}
      </div>
      <div className="flex h-9 items-stretch overflow-hidden rounded-md border bg-white transition-shadow focus-within:ring-2 focus-within:ring-spyne-primary/30">
        {prefix && (
          <span className="flex shrink-0 items-center border-r border-spyne-border bg-muted/50 px-2.5 text-xs font-semibold text-muted-foreground">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => set(e.target.value)}
          className="min-w-0 flex-1 bg-transparent px-2.5 text-sm font-medium tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {suffix && (
          <span className="flex shrink-0 items-center whitespace-nowrap border-l border-spyne-border bg-muted/50 px-2.5 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

function FormulaRow({
  n,
  label,
  formula,
  result,
  highlight,
}: {
  n: number
  label: string
  formula: string
  result: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-3 py-2",
        highlight && "bg-spyne-primary-soft/50",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-spyne-primary-soft text-[9px] font-bold text-spyne-primary">
          {n}
        </span>
        <span className="truncate text-[11px] text-muted-foreground">{label}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="tabular-nums text-[11px] text-muted-foreground">{formula}</span>
        <span className={cn("shrink-0 text-[11px] font-bold", highlight ? "text-spyne-primary" : "text-foreground")}>
          = {result}
        </span>
      </div>
    </div>
  )
}
