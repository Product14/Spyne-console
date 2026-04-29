"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { writePersistedHoldingState } from "@/lib/holding-cost-config"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { holdingCostFigma as HC } from "@/lib/holding-cost-figma-tokens"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { SpyneDarkTooltipPanel } from "@/components/max-2/spyne-ui"
import { HoldingCostChatCalculator } from "@/components/max-2/lot-view/holding-cost-chat-calculator"

/** @deprecated Import from `@/lib/holding-cost-config` */
export {
  HOLDING_COST_CONFIGURED_LS_KEY,
  HOLDING_COST_DAILY_RATE_LS_KEY,
} from "@/lib/holding-cost-config"

// ── Formula helpers ──────────────────────────────────────────────────────────

const fmt0 = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`
const fmt2 = (n: number) => `$${n.toFixed(2)}`
const fmtN = (n: number, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d })

interface CalcInputs {
  ytdTotal:    string
  ytdVariable: string
  monthlySales:string
  daysOpen:    string
}

const CALC_DEFAULTS: CalcInputs = {
  ytdTotal:     "2500000",
  ytdVariable:  "500000",
  monthlySales: "100",
  daysOpen:     "27",
}

type ModalView = "direct" | "calculator" | "chat"

// ── Why this matters card ────────────────────────────────────────────────────

function WhyThisMattersCard() {
  return (
    <div
      className="overflow-hidden rounded-[14px] p-4"
      style={{ background: "linear-gradient(90deg, rgba(70,0,242,0.1) 0%, rgba(76,191,255,0.1) 100%)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <MaterialSymbol name="smart_toy" size={20} className="shrink-0 text-[#0A0A0A]" />
          <p
            className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold leading-5 text-[#0A0A0A]"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            Why this matters - Every extra day in stock = money lost
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 opacity-0" aria-hidden>
          <MaterialSymbol name="auto_awesome" size={14} className="text-[#8F8F8F]" />
          <span
            className="text-xs font-medium uppercase"
            style={{ color: HC.aiBadgeInk, letterSpacing: "0.12em", fontFamily: "Inter, system-ui, sans-serif" }}
          >
            AI POWERED
          </span>
        </div>
      </div>
      <ul
        className="mt-4 list-disc space-y-0 pl-5 text-sm font-medium leading-7 text-black/40"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        <li>Your holding cost directly impacts how much profit you lose as inventory ages.</li>
        <li className="text-black/90">
          In your dashboard, you&apos;ll see how holding costs stack up across ageing buckets —
          helping you identify which cars to reprice, liquidate, or exit faster.
        </li>
      </ul>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export function HoldingCostSetupModals(
  props: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (dailyRate: number) => void
    /** @deprecated No longer used; kept for call-site compatibility */
    startInChat?: boolean
    /** @deprecated kept for call-site compatibility */
    firstRunEyebrow?: string
    /** @deprecated kept for call-site compatibility */
    firstRunSubtitle?: string
  },
) {
  const { open, onOpenChange, onSave } = props

  const [view, setView] = React.useState<ModalView>("direct")
  const [directRate, setDirectRate] = React.useState("")
  const [calc, setCalc] = React.useState<CalcInputs>(CALC_DEFAULTS)
  const [showFormula, setShowFormula] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) {
      setView("direct")
      setDirectRate("")
      setCalc(CALC_DEFAULTS)
      setShowFormula(false)
    }
  }, [open])

  const updCalc = (k: keyof CalcInputs, v: string) =>
    setCalc((p) => ({ ...p, [k]: v }))

  // Formula computation
  const ytdTotal     = parseFloat(calc.ytdTotal)     || 0
  const ytdVariable  = parseFloat(calc.ytdVariable)  || 0
  const monthlySales = parseFloat(calc.monthlySales) || 0
  const daysOpen     = Math.max(parseFloat(calc.daysOpen) || 1, 1)

  const fixedCost    = ytdTotal - ytdVariable
  const monthlyFixed = fixedCost / 12
  const avgUnits     = monthlySales * 1.33
  const costPerUnit  = avgUnits > 0 ? monthlyFixed / avgUnits : 0
  const calcDailyRate= costPerUnit / daysOpen

  const persistAndClose = (dailyRate: number) => {
    writePersistedHoldingState(dailyRate)
    onSave(dailyRate)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        animation="fade"
        closeButtonClassName="text-[#4600F2] opacity-90 hover:opacity-100 data-[state=open]:text-[#4600F2]"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          inputRef.current?.focus()
        }}
        className={cn(
          "flex w-full max-w-[min(665px,calc(100%-2rem))] flex-col gap-0 overflow-hidden rounded-2xl border p-0 shadow-2xl sm:max-w-[665px]",
          "max-h-[min(92vh,820px)]",
        )}
        style={{ backgroundColor: HC.surface, borderColor: HC.border }}
      >
        {/* Spectrum bar */}
        <div
          className="h-[3px] w-full shrink-0 rounded-t-2xl"
          style={{ background: HC.topBarGradient }}
          aria-hidden
        />

        {view === "chat" ? (
          /* ── Chat calculator view — fixed height matches direct view ── */
          <div className="flex min-h-[580px] flex-1 flex-col overflow-hidden">
            <HoldingCostChatCalculator
              onSave={(rate) => persistAndClose(rate)}
              onBack={() => setView("direct")}
            />
          </div>
        ) : view === "direct" ? (
          /* ── Direct entry view ── */
          <div className="relative min-h-0 flex-1 overflow-y-auto px-8 pb-8 pt-8">
            {/* soft spectrum glow */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[180px]"
              aria-hidden
              style={{
                background:
                  "radial-gradient(ellipse 100% 100% at 50% -10%, rgba(237,137,57,0.10) 0%, rgba(232,62,84,0.07) 30%, rgba(182,81,215,0.05) 55%, rgba(91,191,246,0.03) 75%, transparent 100%)",
              }}
            />

            {/* faded savings icon */}
            <span
              className="material-symbols-outlined pointer-events-none absolute right-6 top-6 select-none"
              aria-hidden
              style={{
                fontSize: "140px",
                backgroundImage:
                  "linear-gradient(135deg, #ED8939 0%, #E83E54 28%, #B651D7 52%, #7F6AF2 72%, #5BBFF6 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                opacity: 0.18,
                transform: "scaleX(-1)",
                lineHeight: 1,
              }}
            >
              savings
            </span>

            {/* Eyebrow */}
            <p
              className="relative inline-block bg-clip-text text-lg font-semibold leading-7 text-transparent [-webkit-background-clip:text] [background-clip:text]"
              style={{
                backgroundImage: HC.titleGradient,
                fontFamily: "Inter, system-ui, sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              Let&apos;s set up your holding cost
            </p>

            <div className="mt-3.5 space-y-2">
              <DialogTitle
                className="max-w-[410px] text-[31.5px] font-semibold leading-[42px] tracking-[-0.02em] text-black"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                How much does each car cost you per day?
              </DialogTitle>
              <DialogDescription
                className="text-sm font-medium leading-5 text-black/40"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Every extra day in stock = money lost
              </DialogDescription>
            </div>

            <div className="mt-6 w-full max-w-[418px] space-y-4">
              <div>
                <label
                  htmlFor="holding-cost-daily-rate"
                  className="mb-2 block text-sm font-medium leading-5 tracking-[-0.02em] text-black"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  Holding cost ($ / car / day)
                </label>
                <div
                  className="flex h-14 items-center overflow-hidden rounded-xl border-2 bg-[#FAFAFA] pl-4 pr-3 transition-shadow focus-within:ring-2 focus-within:ring-[#4600F2]/20"
                  style={{ borderColor: HC.primary }}
                >
                  <span
                    className="select-none text-2xl font-semibold leading-10 text-black/30"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    $
                  </span>
                  <input
                    id="holding-cost-daily-rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={directRate}
                    onChange={(e) => setDirectRate(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const n = parseFloat(directRate)
                        if (Number.isFinite(n) && n > 0) persistAndClose(n)
                      }
                    }}
                    placeholder=""
                    className="min-w-0 flex-1 border-0 bg-transparent pl-2 text-2xl font-semibold leading-10 text-black outline-none [appearance:textfield] placeholder:text-black/30 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    ref={inputRef}
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  />
                </div>
              </div>

              {/* Let's calculate strip */}
              <div
                className="flex h-8 items-center justify-between gap-3 rounded-lg px-3"
                style={{ backgroundColor: HC.purpleMutedFill }}
              >
                <span
                  className="text-xs font-semibold leading-5 text-black"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  Not sure? We&apos;ll calculate it for you
                </span>
                <button
                  type="button"
                  onClick={() => setView("chat")}
                  className="shrink-0 text-xs font-semibold leading-5"
                  style={{ color: HC.primary, fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  Let&apos;s calculate →
                </button>
              </div>

              <button
                type="button"
                disabled={!directRate || parseFloat(directRate) <= 0}
                onClick={() => {
                  const n = parseFloat(directRate)
                  if (!Number.isFinite(n) || n <= 0) return
                  persistAndClose(n)
                }}
                className={cn(
                  "flex h-12 w-full items-center justify-center gap-3 rounded-xl text-base font-semibold text-white transition-[filter]",
                  "hover:enabled:brightness-110 disabled:cursor-not-allowed disabled:opacity-50",
                )}
                style={{ backgroundColor: HC.primary, fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Calculate impact
                <MaterialSymbol name="arrow_forward" size={20} />
              </button>
            </div>

            <div className="mt-8">
              <WhyThisMattersCard />
            </div>
          </div>
        ) : (
          /* ── Calculator view ── */
          <div className="relative min-h-0 flex-1 overflow-y-auto px-8 pb-8 pt-6">
            {/* Back + title */}
            <div className="mb-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setView("direct"); setShowFormula(false) }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors hover:bg-black/[0.04]"
                style={{ borderColor: HC.border }}
              >
                <MaterialSymbol name="chevron_left" size={22} style={{ color: HC.ink }} />
              </button>
              <div>
                <p
                  className="text-xl font-semibold tracking-[-0.02em]"
                  style={{ color: HC.ink, fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  Calculate your holding cost
                </p>
                <p
                  className="mt-0.5 text-sm font-medium"
                  style={{ color: HC.inkMuted, fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  Enter what you know — we&apos;ll do the rest
                </p>
              </div>
            </div>

            {/* 4 inputs */}
            <div className="space-y-4 max-w-[418px]">
              <SetupCalcField
                label="YTD Total Used Expense"
                hint="Total of all used car department expenses from the start of the fiscal year — includes both fixed and variable costs."
                prefix="$"
                value={calc.ytdTotal}
                set={(v) => updCalc("ytdTotal", v)}
              />
              <SetupCalcField
                label="YTD Variable Expense"
                hint="Variable costs such as commissions, reconditioning, and advertising that fluctuate with sales volume."
                prefix="$"
                value={calc.ytdVariable}
                set={(v) => updCalc("ytdVariable", v)}
              />
              <SetupCalcField
                label="Monthly Sales"
                hint="Average units sold per month"
                suffix="units / mo"
                value={calc.monthlySales}
                set={(v) => updCalc("monthlySales", v)}
              />
              <SetupCalcField
                label="Days Open per Month"
                hint="Typically 26–27 selling days"
                suffix="days"
                value={calc.daysOpen}
                set={(v) => updCalc("daysOpen", v)}
              />

              {/* Result */}
              <div
                className="flex items-center justify-between rounded-xl border-2 px-5 py-3.5"
                style={{
                  borderColor: calcDailyRate > 0 ? HC.primary : HC.border,
                  backgroundColor: calcDailyRate > 0 ? HC.primarySoft : HC.surfaceMuted,
                }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: calcDailyRate > 0 ? HC.primary : HC.inkMuted, fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  Daily Holding Cost / Car
                </p>
                <p
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: calcDailyRate > 0 ? HC.primary : HC.inkMuted, fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  {calcDailyRate > 0 ? fmt2(calcDailyRate) : "—"}
                  {calcDailyRate > 0 && (
                    <span className="ml-1 text-sm font-normal opacity-70">/car/day</span>
                  )}
                </p>
              </div>

              {/* See how it's calculated toggle */}
              <button
                type="button"
                onClick={() => setShowFormula((v) => !v)}
                className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: showFormula ? HC.primary : HC.inkMuted, fontFamily: "Inter, system-ui, sans-serif" }}
              >
                <MaterialSymbol
                  name="expand_more"
                  size={18}
                  className={cn("transition-transform duration-200", showFormula && "rotate-180")}
                  style={{ color: "inherit" }}
                />
                See how it&apos;s calculated
              </button>

              {showFormula && (
                <div
                  className="overflow-hidden rounded-xl border divide-y text-xs"
                  style={{ borderColor: HC.border, backgroundColor: HC.surfaceMuted }}
                >
                  <SetupFormulaRow n={1} label="Fixed Cost"
                    formula={`${fmt0(ytdTotal)} − ${fmt0(ytdVariable)}`}
                    result={fixedCost > 0 ? fmt0(fixedCost) : "—"} />
                  <SetupFormulaRow n={2} label="Monthly Fixed"
                    formula={`${fixedCost > 0 ? fmt0(fixedCost) : "—"} ÷ 12`}
                    result={monthlyFixed > 0 ? `${fmt0(monthlyFixed)}/mo` : "—"} />
                  <SetupFormulaRow n={3} label="Avg Units in Stock"
                    formula={`${monthlySales || "—"} × 1.33`}
                    result={avgUnits > 0 ? `${fmtN(avgUnits, 1)} units` : "—"} />
                  <SetupFormulaRow n={4} label="Cost / Unit / Month"
                    formula={`${monthlyFixed > 0 ? fmt0(monthlyFixed) : "—"} ÷ ${avgUnits > 0 ? fmtN(avgUnits, 1) : "—"}`}
                    result={costPerUnit > 0 ? `${fmt0(costPerUnit)}/unit` : "—"} />
                  <SetupFormulaRow n={5} label="Daily Holding Cost"
                    formula={`${costPerUnit > 0 ? fmt0(costPerUnit) : "—"} ÷ ${daysOpen}d`}
                    result={calcDailyRate > 0 ? fmt2(calcDailyRate) : "—"}
                    highlight />
                </div>
              )}

              {/* Apply button */}
              <button
                type="button"
                disabled={calcDailyRate <= 0}
                onClick={() => {
                  if (!Number.isFinite(calcDailyRate) || calcDailyRate <= 0) return
                  persistAndClose(calcDailyRate)
                }}
                className={cn(
                  "flex h-12 w-full items-center justify-center gap-3 rounded-xl text-base font-semibold text-white transition-[filter]",
                  "hover:enabled:brightness-110 disabled:cursor-not-allowed disabled:opacity-50",
                )}
                style={{ backgroundColor: HC.primary, fontFamily: "Inter, system-ui, sans-serif" }}
              >
                {calcDailyRate > 0 ? `Apply ${fmt2(calcDailyRate)} /car/day` : "Calculate first"}
                <MaterialSymbol name="arrow_forward" size={20} />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SetupCalcField({
  label,
  hint,
  prefix,
  suffix,
  value,
  set,
}: {
  label: string
  hint: string
  prefix?: string
  suffix?: string
  value: string
  set: (v: string) => void
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <label
          className="text-sm font-medium leading-5 tracking-[-0.01em]"
          style={{ color: HC.ink, fontFamily: "Inter, system-ui, sans-serif" }}
        >
          {label}
        </label>
        {hint && (
          <TooltipPrimitive.Provider delayDuration={200}>
            <TooltipPrimitive.Root>
              <TooltipPrimitive.Trigger asChild>
                <span
                  className="inline-flex cursor-default items-center transition-opacity hover:opacity-80"
                  style={{ color: HC.inkMuted }}
                >
                  <MaterialSymbol name="info" size={16} />
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
      <div
        className="flex h-12 items-stretch overflow-hidden rounded-xl border-2 bg-[#FAFAFA] transition-shadow focus-within:ring-2 focus-within:ring-[#4600F2]/20"
        style={{ borderColor: HC.border }}
      >
        {prefix && (
          <span
            className="flex shrink-0 items-center border-r px-3.5 text-base font-semibold"
            style={{ borderColor: HC.border, color: HC.inkMuted, backgroundColor: HC.surfaceMuted }}
          >
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => set(e.target.value)}
          className="min-w-0 flex-1 bg-transparent px-3.5 text-base font-medium tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          style={{ color: HC.ink, fontFamily: "Inter, system-ui, sans-serif" }}
        />
        {suffix && (
          <span
            className="flex shrink-0 items-center whitespace-nowrap border-l px-3.5 text-sm font-medium"
            style={{ borderColor: HC.border, color: HC.inkMuted, backgroundColor: HC.surfaceMuted }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

function SetupFormulaRow({
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
      className="flex items-center justify-between gap-3 px-4 py-2.5"
      style={highlight ? { backgroundColor: HC.primarySoft } : undefined}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
          style={{ backgroundColor: HC.primarySoft, color: HC.primary }}
        >
          {n}
        </span>
        <span className="truncate text-xs" style={{ color: HC.inkMuted, fontFamily: "Inter, system-ui, sans-serif" }}>
          {label}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="tabular-nums text-xs" style={{ color: HC.inkMuted }}>{formula}</span>
        <span
          className="shrink-0 text-xs font-bold tabular-nums"
          style={{ color: highlight ? HC.primary : HC.ink }}
        >
          = {result}
        </span>
      </div>
    </div>
  )
}
