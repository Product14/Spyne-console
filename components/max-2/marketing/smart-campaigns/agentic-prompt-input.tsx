"use client"

import * as React from "react"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { cn } from "@/lib/utils"

const SPYNE_GRADIENT_BG =
  "linear-gradient(118deg, #7C3AED 0%, #DB2777 50%, #F59E0B 100%)"

/** Examples the placeholder cycles through with a typewriter animation. */
const ANIMATED_EXAMPLES = [
  "Move 45+ day sedans this week",
  "Run a Memorial Day sale on new SUVs",
  "Push 1.9% APR on Certified Pre-Owned",
  "Clear 60+ day pickup inventory",
  "Spotlight high-margin trims to local buyers",
]

/** Quick-prompt chips shown beneath the bar. */
const QUICK_PROMPTS = [
  "Move 45+ day aged sedans",
  "Memorial Day new-car push",
  "CPO 1.9% APR finance offer",
  "Clear 60+ day trucks",
]

interface AgenticPromptInputProps {
  onCreate: (prompt: string) => void
  /** When true, renders as a fixed floating composer at the bottom of the page. */
  floating?: boolean
  /** Visual size: "default" sits in the bottom bar; "hero" is the big inline pitch. */
  variant?: "default" | "hero"
  /** When a chat session is open, swap the typewriter for a simple follow-up cue. */
  chatActive?: boolean
}

/**
 * Floating composer for the Smart Campaigns experience. Fixed at the bottom,
 * sized for emphasis with a gradient halo. Quick-prompt chips beneath give
 * users a one-tap way in.
 */
export function AgenticPromptInput({
  onCreate,
  floating = true,
  variant = "default",
  chatActive = false,
}: AgenticPromptInputProps) {
  const [prompt, setPrompt] = React.useState("")
  const placeholder = useTypewriterPlaceholder(
    prompt.length === 0 && !chatActive,
    chatActive,
  )
  const trimmed = prompt.trim()
  const canCreate = trimmed.length > 0

  const submit = (value?: string) => {
    const text = (value ?? prompt).trim()
    if (!text) return
    onCreate(text)
    setPrompt("")
  }

  const isHero = variant === "hero"

  const composer = (
    <div
      className="rounded-2xl p-[2px]"
      style={{
        background: SPYNE_GRADIENT_BG,
        boxShadow: isHero
          ? "0 32px 80px color-mix(in srgb, #7C3AED 28%, transparent), 0 0 0 8px color-mix(in srgb, #7C3AED 10%, transparent)"
          : "0 24px 64px color-mix(in srgb, #7C3AED 28%, transparent), 0 0 0 6px color-mix(in srgb, #7C3AED 10%, transparent)",
      }}
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl bg-spyne-surface focus-within:ring-2 focus-within:ring-spyne-primary/30",
          isHero ? "px-5 py-4" : "px-4 py-3",
        )}
      >
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl text-white shadow-md",
            isHero ? "h-12 w-12" : "h-10 w-10",
          )}
          style={{ background: SPYNE_GRADIENT_BG }}
          aria-hidden
        >
          <MaterialSymbol name="auto_awesome" size={isHero ? 24 : 20} />
        </span>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder={placeholder}
          aria-label="Describe a campaign"
          className={cn(
            "flex-1 border-0 bg-transparent text-spyne-text placeholder:text-muted-foreground/70 focus:outline-none",
            isHero ? "text-lg" : "text-base",
          )}
        />
        <button
          type="button"
          onClick={() => submit()}
          disabled={!canCreate}
          aria-label="Create campaign"
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-transform",
            isHero ? "h-13 w-13" : "h-11 w-11",
            canCreate ? "hover:scale-[1.05]" : "cursor-not-allowed opacity-40",
          )}
          style={{
            background: SPYNE_GRADIENT_BG,
            height: isHero ? 52 : 44,
            width: isHero ? 52 : 44,
          }}
        >
          <MaterialSymbol name="arrow_upward" size={isHero ? 24 : 20} />
        </button>
      </div>
    </div>
  )

  const quickPrompts = !chatActive ? (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2",
        isHero ? "mt-5" : "mt-3 gap-1.5",
      )}
    >
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Try
      </span>
      {QUICK_PROMPTS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => submit(p)}
          className={cn(
            "rounded-full border border-spyne-border bg-spyne-surface font-medium text-spyne-text shadow-sm transition-colors hover:border-spyne-primary/40 hover:text-spyne-primary",
            isHero ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs",
          )}
        >
          {p}
        </button>
      ))}
    </div>
  ) : null

  if (!floating) {
    return (
      <section aria-label="Create a campaign">
        {composer}
        {quickPrompts}
      </section>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-[760px]">
        {composer}
        {quickPrompts}
      </div>
    </div>
  )
}

function useTypewriterPlaceholder(active: boolean, chatActive = false): string {
  const [exampleIdx, setExampleIdx] = React.useState(0)
  const [charIdx, setCharIdx] = React.useState(0)
  const [phase, setPhase] = React.useState<"typing" | "holding" | "deleting">("typing")

  React.useEffect(() => {
    if (!active) return
    const current = ANIMATED_EXAMPLES[exampleIdx]
    let delay = 55
    if (phase === "holding") delay = 1400
    if (phase === "deleting") delay = 28

    const t = setTimeout(() => {
      if (phase === "typing") {
        if (charIdx < current.length) {
          setCharIdx((i) => i + 1)
        } else {
          setPhase("holding")
        }
      } else if (phase === "holding") {
        setPhase("deleting")
      } else {
        if (charIdx > 0) {
          setCharIdx((i) => i - 1)
        } else {
          setExampleIdx((i) => (i + 1) % ANIMATED_EXAMPLES.length)
          setPhase("typing")
        }
      }
    }, delay)

    return () => clearTimeout(t)
  }, [active, phase, charIdx, exampleIdx])

  if (chatActive) return "Ask a follow-up…"
  if (!active) return "Describe a campaign…"
  return `${ANIMATED_EXAMPLES[exampleIdx].slice(0, charIdx)}`
}
