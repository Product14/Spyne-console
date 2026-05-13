"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneChip } from "@/components/max-2/spyne-ui"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import type { CampaignSuggestion } from "@/services/max-2/smart-campaigns.types"

const SPYNE_GRADIENT_BG =
  "linear-gradient(135deg, #7C3AED 0%, #DB2777 55%, #F59E0B 100%)"

/* ────────────────────────── Message model ────────────────────────── */

export type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "bot"; text: string }
  | {
      id: string
      role: "bot-question"
      text: string
      options: string[]
      /** When true, the chips are disabled (already answered). */
      answered?: boolean
    }
  | {
      id: string
      role: "bot-progress"
      steps: { label: string; done: boolean }[]
    }
  | {
      id: string
      role: "bot-preview"
      suggestion: CampaignSuggestion
    }

interface AgenticChatPanelProps {
  messages: ChatMessage[]
  /** When true, a typing-dots indicator is shown after the last bot message. */
  thinking?: boolean
  onReview: (suggestion: CampaignSuggestion) => void
  /** Fired when the user taps a quick-reply chip OR sends a follow-up message. */
  onAnswer: (text: string) => void
  onClear: () => void
  /**
   * Where to render the chat surface.
   *   - "floating" (default): fixed pill above the bottom composer; matches
   *     the original `/max-2/marketing` flow.
   *   - "modal": 700×700 modal that owns the whole conversation; used by the
   *     hero layout on `/max-2/marketing-ai`.
   */
  position?: "floating" | "modal"
}

/**
 * Two rendering modes:
 *   - Floating: card that anchors above the bottom-bar composer (original).
 *   - Modal: fixed-size 700×700 Dialog with its own composer inside.
 */
export function AgenticChatPanel({
  messages,
  thinking = false,
  onReview,
  onAnswer,
  onClear,
  position = "floating",
}: AgenticChatPanelProps) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, thinking])

  if (position === "modal") {
    const open = messages.length > 0
    return (
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) onClear()
        }}
      >
        <DialogContent
          animation="fade"
          showCloseButton={false}
          className="max2-spyne flex h-[700px] max-h-[92vh] w-full max-w-[700px] flex-col gap-0 overflow-hidden p-0"
        >
          <DialogTitle className="sr-only">Spyne campaign chat</DialogTitle>
          <DialogDescription className="sr-only">
            Conversational draft of your Smart Campaign.
          </DialogDescription>

          <ChatHeader onClose={onClear} />

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-spyne-page-bg/60 px-5 py-5"
          >
            {messages.map((m) => (
              <MessageRow
                key={m.id}
                message={m}
                onReview={onReview}
                onAnswer={onAnswer}
              />
            ))}
            {thinking ? <ThinkingIndicator /> : null}
          </div>

          <ChatComposer onSubmit={onAnswer} />
        </DialogContent>
      </Dialog>
    )
  }

  // Floating panel (original behavior). Hidden when there are no messages.
  if (messages.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-4 motion-safe:animate-in motion-safe:slide-in-from-bottom-4">
      <div
        className="pointer-events-auto w-full max-w-[760px] overflow-hidden rounded-2xl border border-spyne-border bg-spyne-surface"
        style={{
          boxShadow:
            "0 24px 64px color-mix(in srgb, #7C3AED 18%, transparent), 0 0 0 4px color-mix(in srgb, #7C3AED 6%, transparent)",
        }}
      >
        <ChatHeader onClose={onClear} />
        <div
          ref={scrollRef}
          className="max-h-[420px] space-y-3 overflow-y-auto px-4 py-4"
        >
          {messages.map((m) => (
            <MessageRow
              key={m.id}
              message={m}
              onReview={onReview}
              onAnswer={onAnswer}
            />
          ))}
          {thinking ? <ThinkingIndicator /> : null}
        </div>
      </div>
    </div>
  )
}

function ChatHeader({ onClose }: { onClose: () => void }) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-spyne-border px-5 py-3">
      <div className="flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-white"
          style={{ background: SPYNE_GRADIENT_BG }}
          aria-hidden
        >
          <MaterialSymbol name="auto_awesome" size={14} />
        </span>
        <p className="text-sm font-semibold text-spyne-text">Spyne</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close chat"
        className="rounded-md p-1 text-muted-foreground hover:bg-muted/40 hover:text-spyne-text"
      >
        <MaterialSymbol name="close" size={16} />
      </button>
    </header>
  )
}

/* ────────────────────────── Composer (inside modal) ────────────────────────── */

function ChatComposer({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [value, setValue] = React.useState("")
  const canSend = value.trim().length > 0

  const submit = () => {
    if (!canSend) return
    onSubmit(value.trim())
    setValue("")
  }

  return (
    <div className="shrink-0 border-t border-spyne-border bg-spyne-surface px-4 py-3">
      <div className="flex items-center gap-2 rounded-2xl border border-spyne-border bg-spyne-surface px-3 py-1 focus-within:border-spyne-primary focus-within:ring-2 focus-within:ring-spyne-primary/20">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder="Ask a follow-up…"
          aria-label="Follow-up message"
          className="flex-1 border-0 bg-transparent py-2 text-sm text-spyne-text placeholder:text-muted-foreground/70 focus:outline-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send"
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-transform",
            canSend ? "hover:scale-[1.05]" : "cursor-not-allowed opacity-40",
          )}
          style={{ background: SPYNE_GRADIENT_BG }}
        >
          <MaterialSymbol name="arrow_upward" size={14} />
        </button>
      </div>
    </div>
  )
}

/* ────────────────────────── Message rows ────────────────────────── */

function MessageRow({
  message,
  onReview,
  onAnswer,
}: {
  message: ChatMessage
  onReview: (s: CampaignSuggestion) => void
  onAnswer: (text: string) => void
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[80%] rounded-2xl rounded-tr-sm bg-spyne-surface px-3.5 py-2 text-sm text-spyne-text shadow-sm">
          {message.text}
        </p>
      </div>
    )
  }

  if (message.role === "bot") {
    return <BotRow>{message.text}</BotRow>
  }

  if (message.role === "bot-question") {
    return (
      <BotRow>
        <QuestionBody message={message} onAnswer={onAnswer} />
      </BotRow>
    )
  }

  if (message.role === "bot-progress") {
    return (
      <BotRow>
        <ul className="space-y-1.5">
          {message.steps.map((step, i) => (
            <li key={`${message.id}-step-${i}`} className="flex items-center gap-2 text-xs">
              {step.done ? (
                <MaterialSymbol
                  name="check_circle"
                  size={14}
                  className="text-spyne-success"
                />
              ) : (
                <MaterialSymbol
                  name="autorenew"
                  size={14}
                  className="text-spyne-primary motion-safe:animate-spin"
                />
              )}
              <span
                className={cn(
                  step.done ? "text-spyne-text" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
          ))}
        </ul>
      </BotRow>
    )
  }

  // bot-preview
  return (
    <BotRow>
      <CampaignPreviewCard
        suggestion={message.suggestion}
        onReview={() => onReview(message.suggestion)}
      />
    </BotRow>
  )
}

function QuestionBody({
  message,
  onAnswer,
}: {
  message: Extract<ChatMessage, { role: "bot-question" }>
  onAnswer: (text: string) => void
}) {
  const [selected, setSelected] = React.useState<string[]>([])
  const locked = !!message.answered
  const canSubmit = selected.length > 0 && !locked

  const toggle = (opt: string) => {
    if (locked) return
    setSelected((prev) =>
      prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt],
    )
  }

  const submit = () => {
    if (!canSubmit) return
    onAnswer(selected.join(", "))
  }

  return (
    <>
      <p>{message.text}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {message.options.map((opt) => {
          const isOn = selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              disabled={locked}
              aria-pressed={isOn}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium shadow-sm transition-colors",
                locked && "cursor-not-allowed opacity-50",
                !locked && isOn
                  ? "border-spyne-primary bg-spyne-primary-soft text-spyne-primary"
                  : "border-spyne-border bg-spyne-surface text-spyne-text",
                !locked && !isOn && "hover:border-spyne-primary/40 hover:text-spyne-primary",
              )}
            >
              {isOn ? (
                <MaterialSymbol
                  name="check"
                  size={14}
                  className="text-spyne-primary"
                />
              ) : null}
              {opt}
            </button>
          )
        })}
      </div>
      {!locked ? (
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            {selected.length === 0
              ? "Pick one or more"
              : `${selected.length} selected`}
          </p>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition-colors",
              canSubmit
                ? "bg-spyne-primary text-white hover:bg-spyne-primary/90"
                : "cursor-not-allowed bg-muted/50 text-muted-foreground",
            )}
          >
            Continue
            <MaterialSymbol name="arrow_forward" size={14} />
          </button>
        </div>
      ) : null}
    </>
  )
}

function BotRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: SPYNE_GRADIENT_BG }}
        aria-hidden
      >
        <MaterialSymbol name="auto_awesome" size={14} />
      </span>
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-spyne-primary-soft/40 px-3.5 py-2 text-sm leading-snug text-spyne-text">
        {children}
      </div>
    </div>
  )
}

function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: SPYNE_GRADIENT_BG }}
        aria-hidden
      >
        <MaterialSymbol name="auto_awesome" size={14} />
      </span>
      <div
        className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-spyne-primary-soft/40 px-3 py-2.5"
        aria-label="Spyne is thinking"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full bg-spyne-primary motion-safe:animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

function CampaignPreviewCard({
  suggestion,
  onReview,
}: {
  suggestion: CampaignSuggestion
  onReview: () => void
}) {
  return (
    <div className="-mx-1.5 -my-0.5 w-[420px] max-w-full overflow-hidden rounded-xl border border-spyne-border bg-spyne-surface">
      <div className="px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Draft campaign
        </p>
        <h4 className="mt-1 text-sm font-semibold tracking-tight text-spyne-text">
          {suggestion.title}
        </h4>
        <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
          {suggestion.reason}
        </p>

        <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="text-spyne-text">
            <span className="font-bold tabular-nums">
              {suggestion.vehicles.length}
            </span>{" "}
            <span className="text-muted-foreground">VINs</span>
          </span>
          <span className="text-spyne-text">
            <span className="font-bold tabular-nums">
              ${(suggestion.config.budget / 1000).toFixed(1)}k
            </span>{" "}
            <span className="text-muted-foreground">budget</span>
          </span>
          <span className="text-spyne-text">
            <span className="font-bold tabular-nums">
              ~{suggestion.projection.unitsSold}
            </span>{" "}
            <span className="text-muted-foreground">units est.</span>
          </span>
        </dl>
      </div>

      <div className="flex items-center justify-end border-t border-spyne-border bg-spyne-page-bg/60 px-3 py-2">
        <button
          type="button"
          onClick={onReview}
          className={cn(spyneComponentClasses.btnPrimaryMd, "!h-8 !text-xs")}
        >
          Review &amp; publish
          <MaterialSymbol name="arrow_forward" size={14} />
        </button>
      </div>
    </div>
  )
}
