"use client"

import * as React from "react"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { holdingCostFigma as HC } from "@/lib/holding-cost-figma-tokens"

// ── Types ──────────────────────────────────────────────────────────────────

type Message = { role: "bot" | "user"; text: string }

type InputKind = "percent" | "dollar" | "count"

type QuestionStep = {
  id: string
  lines: string[]
  ackFn: (raw: string) => string
  inputKind: InputKind
  prefix?: string
  suffix?: string
  placeholder: string
  min: number
  max: number
  inputLabel?: string
}

// ── Step definitions ────────────────────────────────────────────────────────

const INTRO_LINES = [
  "Let's figure out your exact daily holding cost.",
  "I'll ask you 4 quick questions — each one feeds directly into the formula. The more accurate your answers, the sharper your reprice and exit signals will be.",
]

const QUESTIONS: QuestionStep[] = [
  {
    id: "floorplan_rate",
    lines: [
      "What's your monthly floorplan interest rate?",
      "This is the % your lender charges each month to finance the cars on your lot. You'll find it on your floor plan statement. Typical range: 0.4% – 0.7% / month.",
    ],
    ackFn: (v) => `${v}% per month — got it.`,
    inputKind: "percent",
    suffix: "% / month",
    placeholder: "0.5",
    min: 0.01,
    max: 5,
  },
  {
    id: "avg_vehicle_cost",
    lines: [
      "What's the average amount you paid — or financed — per vehicle?",
      "This is the principal your lender charges interest on. Use your average invoice cost or ACV. A rough number works fine.",
    ],
    ackFn: (v) => `Average cost of $${Number(v).toLocaleString()} — noted.`,
    inputKind: "dollar",
    prefix: "$",
    placeholder: "28,000",
    min: 1000,
    max: 500000,
  },
  {
    id: "monthly_overhead",
    lines: [
      "Now your lot overhead. What do you spend monthly on insurance, porter wages, reconditioning, and utilities?",
      "These are the fixed costs that exist because you're holding inventory. Mid-size dealerships typically run $12,000 – $22,000 / month. If you're unsure, estimate on the higher side.",
    ],
    ackFn: (v) => `$${Number(v).toLocaleString()} / month in overhead — that makes sense.`,
    inputKind: "dollar",
    prefix: "$",
    placeholder: "15,000",
    min: 0,
    max: 5000000,
  },
  {
    id: "inventory_count",
    lines: [
      "Last one — how many vehicles do you typically have on your lot at any given time?",
      "This spreads overhead fairly across each car.",
    ],
    ackFn: (v) => `${v} vehicles on the lot — perfect. That's everything I need.`,
    inputKind: "count",
    suffix: "vehicles",
    placeholder: "80",
    min: 1,
    max: 5000,
  },
]

// ── Small helpers ───────────────────────────────────────────────────────────

const fmt$ = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function computeResult(answers: number[]): {
  floorplanDaily: number
  overheadDaily: number
  totalDaily: number
} {
  const [rate, avgCost, overhead, count] = answers
  const floorplanDaily = (avgCost * (rate / 100)) / 30
  const overheadDaily = overhead / (count * 30)
  const totalDaily = Math.round((floorplanDaily + overheadDaily) * 100) / 100
  return { floorplanDaily, overheadDaily, totalDaily }
}

// ── Sub-components ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-tl-sm bg-[#F3F0FF] px-3 py-2.5">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7F6AF2] [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7F6AF2] [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7F6AF2]" />
    </div>
  )
}

function BotBubble({ text }: { text: string }) {
  return (
    <div className="flex items-end gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/branding/retail-suite-logomark.svg"
        alt=""
        className="h-7 w-7 shrink-0 rounded object-contain"
        aria-hidden
      />
      <div
        className="max-w-[88%] rounded-2xl rounded-tl-sm px-4 py-2.5 text-[13px] leading-[1.55] text-[#1A1A1A]"
        style={{ background: "#F3F0FF" }}
      >
        {text}
      </div>
    </div>
  )
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[72%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-[13px] leading-[1.55] text-white"
        style={{ backgroundColor: HC.primary }}
      >
        {text}
      </div>
    </div>
  )
}

function ResultCard({
  answers,
  onUse,
}: {
  answers: number[]
  onUse: (rate: number) => void
}) {
  const { floorplanDaily, overheadDaily, totalDaily } = computeResult(answers)

  return (
    <div className="flex items-end gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/branding/retail-suite-logomark.svg"
        alt=""
        className="h-7 w-7 shrink-0 rounded object-contain"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        {/* Breakdown card */}
        <div
          className="mb-3 overflow-hidden rounded-2xl rounded-tl-sm border"
          style={{ borderColor: HC.border }}
        >
          <div
            className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider"
            style={{
              background: "linear-gradient(90deg, rgba(70,0,242,0.07) 0%, rgba(76,191,255,0.07) 100%)",
              color: HC.primary,
            }}
          >
            Your daily holding cost breakdown
          </div>
          <div className="divide-y px-4" style={{ "--divide-color": HC.border } as React.CSSProperties}>
            <div className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-[13px] font-medium" style={{ color: HC.ink }}>Floor plan interest</p>
                <p className="text-[11px]" style={{ color: HC.inkMuted }}>
                  ${answers[1].toLocaleString()} avg cost × {answers[0]}% ÷ 30 days
                </p>
              </div>
              <span className="text-[13px] font-semibold tabular-nums" style={{ color: HC.ink }}>
                {fmt$(floorplanDaily)} / day
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-[13px] font-medium" style={{ color: HC.ink }}>Lot overhead</p>
                <p className="text-[11px]" style={{ color: HC.inkMuted }}>
                  ${answers[2].toLocaleString()} ÷ ({answers[3]} vehicles × 30 days)
                </p>
              </div>
              <span className="text-[13px] font-semibold tabular-nums" style={{ color: HC.ink }}>
                {fmt$(overheadDaily)} / day
              </span>
            </div>
            <div
              className="flex items-center justify-between py-3"
              style={{ background: "rgba(70,0,242,0.04)" }}
            >
              <div>
                <p className="text-[14px] font-semibold" style={{ color: HC.primary }}>
                  Daily holding cost
                </p>
                <p className="text-[11px]" style={{ color: HC.inkMuted }}>
                  A {answers[3]}-car lot parked for 30 days costs ~$
                  {Math.round(totalDaily * answers[3] * 30).toLocaleString()}
                </p>
              </div>
              <span
                className="text-[22px] font-bold tabular-nums"
                style={{ color: HC.primary }}
              >
                {fmt$(totalDaily)}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => onUse(totalDaily)}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold text-white transition-[filter] hover:brightness-110"
          style={{ backgroundColor: HC.primary }}
        >
          Use {fmt$(totalDaily)} / car / day
          <MaterialSymbol name="arrow_forward" size={20} />
        </button>
      </div>
    </div>
  )
}

// ── Input bar ───────────────────────────────────────────────────────────────

function ChatInput({
  step,
  value,
  onChange,
  onSubmit,
}: {
  step: QuestionStep
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    inputRef.current?.focus()
  }, [step.id])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSubmit()
  }

  const raw = value.replace(/,/g, "")
  const num = parseFloat(raw)
  const isValid = value.trim() !== "" && !Number.isNaN(num) && num >= step.min && num <= step.max

  return (
    <div
      className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
      style={{ borderColor: HC.primary, backgroundColor: HC.surfaceInput }}
    >
      {step.prefix && (
        <span className="shrink-0 text-[15px] font-semibold" style={{ color: HC.inkMuted }}>
          {step.prefix}
        </span>
      )}
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={step.placeholder}
        className="min-w-0 flex-1 bg-transparent text-[15px] font-medium outline-none placeholder:text-[#C0C0C0]"
        style={{ color: HC.ink, fontFamily: "Inter, system-ui, sans-serif" }}
      />
      {step.suffix && (
        <span className="shrink-0 text-[12px]" style={{ color: HC.inkMuted }}>
          {step.suffix}
        </span>
      )}
      <button
        type="button"
        onClick={onSubmit}
        disabled={!isValid}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white transition-[filter] hover:enabled:brightness-110 disabled:opacity-40"
        style={{ backgroundColor: HC.primary }}
        aria-label="Send"
      >
        <MaterialSymbol name="arrow_upward" size={16} />
      </button>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export function HoldingCostChatCalculator({
  onSave,
  onBack,
}: {
  onSave: (dailyRate: number) => void
  onBack: () => void
}) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [pendingQueue, setPendingQueue] = React.useState<string[]>(INTRO_LINES)
  const [isTyping, setIsTyping] = React.useState(false)
  const [questionIndex, setQuestionIndex] = React.useState(-1) // -1 = intro
  const [showInput, setShowInput] = React.useState(false)
  const [showResult, setShowResult] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [answers, setAnswers] = React.useState<number[]>([])
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // ── Queue processing: pop one message every ~800ms ────────────────────────
  React.useEffect(() => {
    if (pendingQueue.length === 0) return
    setIsTyping(true)
    setShowInput(false)

    const delay = messages.length === 0 ? 400 : 850
    const timer = window.setTimeout(() => {
      const [first, ...rest] = pendingQueue
      setMessages((m) => [...m, { role: "bot", text: first }])
      setPendingQueue(rest)
      if (rest.length === 0) {
        setIsTyping(false)
        // Queue emptied — decide what to show next
        // (handled by the effect below, which watches isTyping → false)
      }
    }, delay)

    return () => window.clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQueue])

  // ── After queue empties: advance state ────────────────────────────────────
  React.useEffect(() => {
    if (pendingQueue.length > 0 || isTyping) return

    if (showResult) return // nothing to do in result phase

    if (questionIndex < 0) {
      // Intro just finished → move to question 0
      window.setTimeout(() => {
        setQuestionIndex(0)
        setPendingQueue(QUESTIONS[0].lines)
        setInputValue("")
      }, 300)
    } else {
      // Question lines just finished → show input
      setShowInput(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping, pendingQueue.length])

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping, showInput, showResult])

  // ── Handle user submission ────────────────────────────────────────────────
  const handleSubmit = () => {
    if (questionIndex < 0 || questionIndex >= QUESTIONS.length) return
    const step = QUESTIONS[questionIndex]
    const raw = inputValue.replace(/,/g, "").trim()
    const num = parseFloat(raw)
    if (!raw || Number.isNaN(num) || num < step.min || num > step.max) return

    // Add user bubble
    const displayText =
      step.prefix
        ? `${step.prefix}${Number(raw).toLocaleString()}`
        : step.suffix
          ? `${raw} ${step.suffix}`
          : raw
    setMessages((m) => [...m, { role: "user", text: displayText }])
    setShowInput(false)
    setInputValue("")

    const newAnswers = [...answers, num]
    setAnswers(newAnswers)

    const nextIndex = questionIndex + 1
    const isLast = nextIndex >= QUESTIONS.length

    // Build the queue: ack line + (next question lines OR result trigger)
    const ack = step.ackFn(raw)

    if (isLast) {
      // Stream ack then trigger result
      setPendingQueue([ack])
      window.setTimeout(() => {
        setShowResult(true)
      }, ack.length * 18 + 1200) // rough timing after ack appears
    } else {
      setPendingQueue([ack, ...QUESTIONS[nextIndex].lines])
      setQuestionIndex(nextIndex)
    }
  }

  const currentStep = questionIndex >= 0 && questionIndex < QUESTIONS.length
    ? QUESTIONS[questionIndex]
    : null

  return (
    <div className="flex flex-1 flex-col" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div
        className="flex shrink-0 items-center gap-3 border-b px-5 py-3.5"
        style={{ borderColor: HC.border }}
      >
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
          aria-label="Back"
        >
          <MaterialSymbol name="arrow_back" size={20} className="text-[#1A1A1A]" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/branding/retail-suite-logomark.svg"
          alt=""
          className="h-8 w-8 shrink-0 rounded object-contain"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#1A1A1A]">Holding Cost Calculator</p>
          <p className="text-[11px] text-[#6B7280]">4 questions · ~1 min</p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4"
      >
        <div className="flex-1" />
        <div className="flex flex-col gap-3">
          {messages.map((msg, i) =>
            msg.role === "bot" ? (
              <BotBubble key={i} text={msg.text} />
            ) : (
              <UserBubble key={i} text={msg.text} />
            ),
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-end gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/branding/retail-suite-logomark.svg"
                alt=""
                className="h-7 w-7 shrink-0 rounded object-contain"
                aria-hidden
              />
              <TypingIndicator />
            </div>
          )}

          {/* Result card */}
          {showResult && answers.length === QUESTIONS.length && (
            <div className="mt-1">
              <ResultCard answers={answers} onUse={onSave} />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      {showInput && currentStep && !showResult && (
        <div
          className="shrink-0 border-t px-4 py-3"
          style={{ borderColor: HC.border }}
        >
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider" style={{ color: HC.inkMuted }}>
            {currentStep.inputLabel ??
              (currentStep.inputKind === "percent"
                ? "Rate"
                : currentStep.inputKind === "dollar"
                  ? "Amount"
                  : "Count")}
          </p>
          <ChatInput
            step={currentStep}
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  )
}
