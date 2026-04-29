"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { holdingCostFigma as HC } from "@/lib/holding-cost-figma-tokens"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ─── Types ─────────────────────────────────────────────────────────────────

interface CalcState {
  ytdTotal:    string   // Step 1a — YTD Total Used Expense
  ytdVariable: string   // Step 1b — YTD Variable Expense
  monthlySales:string   // Step 3  — Monthly Sales (units)
  daysOpen:    string   // Step 5  — Days Open per Month
}

const DEFAULTS: CalcState = {
  ytdTotal:     "2500000",
  ytdVariable:  "500000",
  monthlySales: "100",
  daysOpen:     "27",
}

const fmt0  = (n: number) => `$${Math.round(n).toLocaleString()}`
const fmt2  = (n: number) => `$${n.toFixed(2)}`
const fmtN  = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 1 })

// ─── Component ─────────────────────────────────────────────────────────────

export function HoldingCostCalculator({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Persisted daily $/car when user applies from the calculator. */
  onSave?: (dailyRate: number) => void
}) {
  const [s, setS] = React.useState<CalcState>(DEFAULTS)
  const upd = (k: keyof CalcState, v: string) => setS((p) => ({ ...p, [k]: v }))

  // ── 5-Step Formula ────────────────────────────────────────────────────
  const ytdTotal    = parseFloat(s.ytdTotal)    || 0
  const ytdVariable = parseFloat(s.ytdVariable) || 0
  const monthlySales= parseFloat(s.monthlySales)|| 0
  const daysOpen    = Math.max(parseFloat(s.daysOpen) || 1, 1)

  const step1_fixedCost       = ytdTotal - ytdVariable                   // Step 1
  const step2_monthlyFixed    = step1_fixedCost / 12                     // Step 2
  const step3_avgUnits        = monthlySales * 1.33                      // Step 3
  const step4_costPerUnitMonth= step3_avgUnits > 0
    ? step2_monthlyFixed / step3_avgUnits : 0                            // Step 4
  const step5_dailyHoldingCost= step4_costPerUnitMonth / daysOpen        // Step 5

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        animation="fade"
        className="flex max-h-[90vh] w-full max-w-[min(420px,calc(100%-2rem))] flex-col gap-0 overflow-hidden rounded-2xl border p-0 shadow-2xl sm:max-w-[420px]"
        style={{ borderColor: HC.border, backgroundColor: HC.surface }}
      >

        <DialogHeader
          className="shrink-0 border-b px-6 pb-5 pt-6 text-left"
          style={{ borderColor: HC.border }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: HC.primarySoft }}
            >
              <MaterialSymbol name="calculate" size={24} className="text-[#4600F2]" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5 pr-8">
              <DialogTitle
                className="text-lg font-semibold leading-snug tracking-tight"
                style={{ color: HC.ink }}
              >
                Holding Cost Calculator
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed" style={{ color: HC.inkMuted }}>
                5-step formula used by every US used car manager
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Scrollable body ── */}
        <div className="min-h-0 flex-1 divide-y divide-[#E5E7EB] overflow-y-auto">

          {/* Step 1 */}
          <StepRow n={1} label="Annual Fixed Cost">
            <TooltipInp prefix="$" value={s.ytdTotal} set={(v) => upd("ytdTotal", v)} hint="All dept. expenses year-to-date" />
            <Op>−</Op>
            <TooltipInp prefix="$" value={s.ytdVariable} set={(v) => upd("ytdVariable", v)} hint="Commissions, recon, variable costs" />
            <Eq />
            <Res value={step1_fixedCost > 0 ? fmt0(step1_fixedCost) : "—"} />
          </StepRow>

          {/* Step 2 */}
          <StepRow n={2} label="Monthly Fixed Cost">
            <Comp value={step1_fixedCost > 0 ? fmt0(step1_fixedCost) : "—"} />
            <Op>÷</Op>
            <Const value="12" label="months" />
            <Eq />
            <Res value={step2_monthlyFixed > 0 ? `${fmt0(step2_monthlyFixed)}/mo` : "—"} muted />
          </StepRow>

          {/* Step 3 */}
          <StepRow n={3} label="Avg Units in Stock">
            <TooltipInp suffix="units" value={s.monthlySales} set={(v) => upd("monthlySales", v)} hint="Average units sold per month" />
            <Op>×</Op>
            <Const value="1.33" label="" />
            <Eq />
            <Res value={step3_avgUnits > 0 ? `${fmtN(step3_avgUnits)} units` : "—"} muted />
          </StepRow>

          {/* Step 4 */}
          <StepRow n={4} label="Cost Per Unit / Month">
            <Comp value={step2_monthlyFixed > 0 ? fmt0(step2_monthlyFixed) : "—"} />
            <Op>÷</Op>
            <Comp value={step3_avgUnits > 0 ? fmtN(step3_avgUnits) : "—"} />
            <Eq />
            <Res value={step4_costPerUnitMonth > 0 ? `${fmt0(step4_costPerUnitMonth)}/unit` : "—"} muted />
          </StepRow>

          {/* Step 5 */}
          <StepRow n={5} label="Daily Holding Cost">
            <Comp value={step4_costPerUnitMonth > 0 ? fmt0(step4_costPerUnitMonth) : "—"} />
            <Op>÷</Op>
            <TooltipInp suffix="days" value={s.daysOpen} set={(v) => upd("daysOpen", v)} hint="Typically 26–27 selling days" />
            <Eq />
            <Res value={step5_dailyHoldingCost > 0 ? fmt2(step5_dailyHoldingCost) : "—"} highlight />
          </StepRow>

        </div>

        {/* ── Result footer ── */}
        <div
          className="flex shrink-0 items-center justify-between border-t px-6 py-4"
          style={{ borderColor: HC.border, backgroundColor: HC.errorSoft }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: HC.error }}
          >
            Daily Holding Cost / Car
          </p>
          <p className="text-xl font-bold tabular-nums" style={{ color: HC.error }}>
            {step5_dailyHoldingCost > 0 ? fmt2(step5_dailyHoldingCost) : "—"}
            <span className="ml-1 text-sm font-normal opacity-80">/car/day</span>
          </p>
        </div>

        {/* ── Save footer ── */}
        {onSave && (
          <div
            className="flex shrink-0 items-center justify-end gap-3 border-t px-6 py-4"
            style={{ borderColor: HC.border, backgroundColor: HC.surfaceMuted }}
          >
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border px-5 py-2.5 text-[15px] font-medium transition-colors hover:bg-black/[0.03]"
              style={{ borderColor: HC.border, color: HC.ink, backgroundColor: HC.surface }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={step5_dailyHoldingCost <= 0}
              onClick={() => {
                onSave?.(step5_dailyHoldingCost)
                onOpenChange(false)
              }}
              className="rounded-xl px-6 py-2.5 text-[15px] font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: HC.primary }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = HC.primaryHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = HC.primary
              }}
            >
              Save & Apply
            </button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StepRow({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-5">
      <div className="mb-3 flex items-center gap-2.5">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
          style={{ backgroundColor: HC.primarySoft, color: HC.primary }}
        >
          {n}
        </span>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: HC.inkMuted }}
        >
          {label}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

function TooltipInp({ prefix, suffix, value, set, hint }: {
  prefix?: string; suffix?: string; value: string
  set: (v: string) => void; hint?: string
}) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="relative flex-1 min-w-0">
        <div
          className="flex h-11 items-stretch overflow-hidden rounded-xl border-2 bg-white transition-shadow focus-within:shadow-[0_0_0_3px_rgba(70,0,242,0.12)]"
          style={{ borderColor: HC.border }}
        >
          {prefix && (
            <span
              className="flex shrink-0 items-center border-r px-2.5 text-sm font-semibold"
              style={{
                borderColor: HC.border,
                backgroundColor: HC.surfaceMuted,
                color: HC.inkMuted,
              }}
            >
              {prefix}
            </span>
          )}
          <input
            type="number"
            value={value}
            onChange={(e) => set(e.target.value)}
            className="min-w-0 flex-1 bg-transparent px-2.5 text-sm font-medium outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            style={{ color: HC.ink }}
          />
          {suffix && (
            <span
              className="flex shrink-0 items-center whitespace-nowrap border-l px-2.5 text-xs font-medium"
              style={{
                borderColor: HC.border,
                backgroundColor: HC.surfaceMuted,
                color: HC.inkMuted,
              }}
            >
              {suffix}
            </span>
          )}
          {hint && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="flex shrink-0 cursor-default items-center px-2 transition-colors hover:opacity-80"
                  style={{ color: HC.inkMuted }}
                >
                  <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-current text-[8px] font-bold">
                    i
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[180px] text-xs">
                {hint}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

function Comp({ value }: { value: string }) {
  return (
    <div
      className="flex h-11 min-w-0 flex-1 items-center rounded-xl border px-3"
      style={{ borderColor: HC.border, backgroundColor: HC.surfaceMuted }}
    >
      <span className="truncate text-sm tabular-nums" style={{ color: HC.inkMuted }}>
        {value}
      </span>
    </div>
  )
}

function Const({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="flex h-11 shrink-0 items-center justify-center gap-1 rounded-xl border px-3"
      style={{ borderColor: HC.border, backgroundColor: HC.surfaceMuted }}
    >
      <span className="text-sm font-semibold" style={{ color: HC.ink }}>
        {value}
      </span>
      {label && (
        <span className="text-xs" style={{ color: HC.inkMuted }}>
          {label}
        </span>
      )}
    </div>
  )
}

function Op({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-5 shrink-0 text-center text-sm font-medium" style={{ color: HC.inkMuted }}>
      {children}
    </span>
  )
}

function Eq() {
  return (
    <span className="shrink-0 text-sm font-medium" style={{ color: HC.inkMuted }}>
      =
    </span>
  )
}

function Res({ value, highlight, muted }: { value: string; highlight?: boolean; muted?: boolean }) {
  return (
    <div
      className="flex h-11 w-[132px] shrink-0 items-center justify-end rounded-xl border px-3"
      style={
        highlight
          ? {
              borderColor: "rgba(70, 0, 242, 0.22)",
              backgroundColor: HC.primarySoft,
            }
          : { borderColor: HC.border, backgroundColor: HC.surfaceMuted }
      }
    >
      <span
        className="text-sm font-bold tabular-nums"
        style={{
          color: highlight ? HC.primary : muted ? HC.inkMuted : HC.ink,
        }}
      >
        {value}
      </span>
    </div>
  )
}
