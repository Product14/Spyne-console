"use client"

import * as React from "react"
import { STUDIO_HOLDING_COST_PER_DAY } from "@/lib/inventory-issue-label"
import {
  mockCampaignSuggestions,
  mockCampaigns,
} from "@/lib/max-2/smart-campaigns-mocks"
import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import { demoVehicleThumbnailByKey } from "@/lib/demo-vehicle-hero-images"
import { cn } from "@/lib/utils"
import { AgenticPromptInput } from "./agentic-prompt-input"
import { AgenticChatPanel, type ChatMessage } from "./agentic-chat-panel"
import { CampaignMetricsRow } from "./campaign-metrics-row"
import { SuggestedCampaignsList } from "./suggested-campaigns-list"
import { MyCampaignsList } from "./my-campaigns-list"
import { CampaignWizard } from "./campaign-wizard-sheet"
import { CampaignDetailView } from "./campaign-detail-view"
import type {
  Campaign,
  CampaignSuggestion,
  CampaignVehicle,
  CampaignWizardDraft,
} from "@/services/max-2/smart-campaigns.types"

type Tab = "create" | "mine"

/** Imperative handle exposed to the marketing page so the header "Create
 *  new campaign" button and inbound deep links can drive the same flow as
 *  the in-tab buttons. */
export interface SmartCampaignsHubHandle {
  startManual: () => void
  /**
   * Open the wizard at Step 04 (Review) with a suggestion pre-selected
   * from a trigger key. Used by the Merchandising smart-campaign hook
   * toast (deep-linked via `?createCampaign=<key>`).
   */
  startFromTrigger: (key: string) => void
}

/**
 * Top-level Smart Campaigns experience.
 *
 *   Tab 1 · Create new campaign → agentic prompt + suggestions + manual entry
 *   Tab 2 · My campaigns → list of running/created campaigns + detail view
 *
 * The wizard and the detail view both render inline (no sheet/modal) so the
 * console sidebar stays visible and the surface is fully opaque.
 */
interface SmartCampaignsHubProps {
  /**
   * Visual layout.
   *   - "default": agentic prompt is a floating composer at the bottom; chat
   *     panel floats above it.
   *   - "hero": prompt becomes a hero block at the top of the page so it's
   *     obvious typing a campaign is the primary action. Chat lands inline.
   */
  layout?: "default" | "hero"
}

export const SmartCampaignsHub = React.forwardRef<
  SmartCampaignsHubHandle,
  SmartCampaignsHubProps
>(function SmartCampaignsHub({ layout = "default" }, ref) {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>(mockCampaigns)
  const [tab, setTab] = React.useState<Tab>("create")
  const [draft, setDraft] = React.useState<CampaignWizardDraft | null>(null)
  const [openCampaign, setOpenCampaign] = React.useState<Campaign | null>(null)
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([])
  const [chatThinking, setChatThinking] = React.useState(false)
  /**
   * Conversation state machine driving the bot's clarifying-question flow.
   *   idle     → no chat yet
   *   cohort   → bot waiting for New / Pre-owned / Both
   *   make     → bot waiting for make preference
   *   exclude  → bot waiting for what to exclude
   *   drafting → answers collected, progress + preview in flight
   */
  const [convoStage, setConvoStage] = React.useState<
    "idle" | "cohort" | "make" | "exclude" | "drafting"
  >("idle")
  const convoAnswersRef = React.useRef<{
    prompt: string
    cohort?: string
    make?: string
    exclude?: string
  }>({ prompt: "" })
  const chatTimersRef = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const promptCounter = React.useRef(0)
  const msgCounter = React.useRef(0)

  const newMsgId = React.useCallback((kind: string) => {
    msgCounter.current += 1
    return `${kind}-${msgCounter.current}`
  }, [])

  const clearChatTimers = React.useCallback(() => {
    chatTimersRef.current.forEach((t) => clearTimeout(t))
    chatTimersRef.current = []
  }, [])

  React.useEffect(() => clearChatTimers, [clearChatTimers])

  const buildDraftFromSuggestion = React.useCallback(
    (s: CampaignSuggestion, prompt?: string): CampaignWizardDraft => ({
      id: prompt ? `draft-prompt-${Date.now()}` : `draft-${s.id}-${Date.now()}`,
      step: "review",
      kind: "agentic",
      prompt,
      sourceSuggestionId: s.id,
      title: prompt ? deriveTitleFromPrompt(prompt) : s.title,
      vehicles: s.vehicles,
      config: s.config,
      projection: s.projection,
    }),
    [],
  )

  const openAgenticFromSuggestion = (s: CampaignSuggestion) => {
    setDraft(buildDraftFromSuggestion(s))
  }

  /** Append a single message immediately. */
  const pushMessage = React.useCallback((msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg])
  }, [])

  /** Mark the most recent bot-question as answered (chips disable). */
  const lockLastQuestion = React.useCallback(() => {
    setChatMessages((prev) => {
      const idx = [...prev].reverse().findIndex((m) => m.role === "bot-question")
      if (idx === -1) return prev
      const realIdx = prev.length - 1 - idx
      const next = prev.slice()
      const target = next[realIdx]
      if (target.role === "bot-question") {
        next[realIdx] = { ...target, answered: true }
      }
      return next
    })
  }, [])

  /** Schedule a bot reply with the thinking dots showing in the gap. */
  const scheduleBot = React.useCallback(
    (fn: () => void, delay = 700) => {
      setChatThinking(true)
      chatTimersRef.current.push(
        setTimeout(() => {
          setChatThinking(false)
          fn()
        }, delay),
      )
    },
    [],
  )

  /** First step of the chat: bot acks + asks the cohort question. */
  const startConversation = React.useCallback(
    (prompt: string) => {
      clearChatTimers()
      convoAnswersRef.current = { prompt }
      setConvoStage("cohort")

      pushMessage({ id: newMsgId("u"), role: "user", text: prompt })
      scheduleBot(() => {
        pushMessage({
          id: newMsgId("b"),
          role: "bot",
          text: `Got it. Drafting a campaign for "${truncate(prompt, 60)}".`,
        })
        pushMessage({
          id: newMsgId("q"),
          role: "bot-question",
          text: "Which inventory should I target?",
          options: ["New vehicles", "Pre-owned", "Both"],
        })
      })
    },
    [clearChatTimers, newMsgId, pushMessage, scheduleBot],
  )

  /** Begin the progress + preview pipeline once all answers are collected. */
  const startDrafting = React.useCallback(() => {
    setConvoStage("drafting")
    const { prompt, cohort, make, exclude } = convoAnswersRef.current
    const matched = matchSuggestionWithAnswers(prompt, { cohort, make, exclude })

    const progressId = newMsgId("progress")
    const previewId = newMsgId("preview")
    const steps = [
      cohort && cohort !== "Both"
        ? `Filtering to ${cohort.toLowerCase()}`
        : "Scanning your inventory",
      `Matched ${matched.vehicles.length} VINs`,
      "Picking channels + budget",
    ]

    scheduleBot(() => {
      pushMessage({
        id: progressId,
        role: "bot-progress",
        steps: steps.map((label) => ({ label, done: false })),
      })
    })

    steps.forEach((_, i) => {
      chatTimersRef.current.push(
        setTimeout(
          () => {
            setChatMessages((prev) =>
              prev.map((m) =>
                m.id === progressId && m.role === "bot-progress"
                  ? {
                      ...m,
                      steps: m.steps.map((s, idx) => ({
                        ...s,
                        done: idx <= i,
                      })),
                    }
                  : m,
              ),
            )
          },
          // The first bot reply uses 700ms; steps tick from there.
          1400 + i * 700,
        ),
      )
    })

    chatTimersRef.current.push(
      setTimeout(
        () => {
          pushMessage({
            id: previewId,
            role: "bot-preview",
            suggestion: {
              ...matched,
              title: deriveTitleFromPrompt(prompt),
            },
          })
        },
        1400 + steps.length * 700 + 250,
      ),
    )
  }, [newMsgId, pushMessage, scheduleBot])

  /**
   * Single entry point for prompts and chip taps. Routes based on the
   * conversation state machine so a chip and free-form text are equivalent.
   */
  const handleAgenticInput = React.useCallback(
    (text: string) => {
      const value = text.trim()
      if (!value) return

      // Idle / drafting / waiting-for-preview → treat as a new conversation.
      if (convoStage === "idle" || convoStage === "drafting") {
        startConversation(value)
        return
      }

      // Answering the current question.
      pushMessage({ id: newMsgId("u"), role: "user", text: value })
      lockLastQuestion()

      if (convoStage === "cohort") {
        convoAnswersRef.current.cohort = value
        setConvoStage("make")
        scheduleBot(() => {
          pushMessage({
            id: newMsgId("q"),
            role: "bot-question",
            text: "Any specific make I should focus on?",
            options: ["Any make", "Toyota", "Honda", "Ford", "Hyundai"],
          })
        })
        return
      }

      if (convoStage === "make") {
        convoAnswersRef.current.make = value
        setConvoStage("exclude")
        scheduleBot(() => {
          pushMessage({
            id: newMsgId("q"),
            role: "bot-question",
            text: "Anything I should exclude?",
            options: [
              "No, use all",
              "Skip new arrivals (<7d)",
              "Skip aging (60+d)",
            ],
          })
        })
        return
      }

      if (convoStage === "exclude") {
        convoAnswersRef.current.exclude = value
        startDrafting()
        return
      }
    },
    [convoStage, lockLastQuestion, newMsgId, pushMessage, scheduleBot, startConversation, startDrafting],
  )

  const handleReviewFromChat = (s: CampaignSuggestion) => {
    setDraft(buildDraftFromSuggestion(s, convoAnswersRef.current.prompt))
  }

  const clearChat = () => {
    clearChatTimers()
    setChatMessages([])
    setChatThinking(false)
    setConvoStage("idle")
    convoAnswersRef.current = { prompt: "" }
  }

  const openManual = React.useCallback(() => {
    setDraft(buildEmptyManualDraft())
    setOpenCampaign(null)
    setTab("create")
  }, [])

  const startFromTrigger = React.useCallback(
    (key: string) => {
      const suggestion = matchSuggestionByTriggerKey(key)
      if (!suggestion) return
      setTab("create")
      setOpenCampaign(null)
      openAgenticFromSuggestion(suggestion)
    },
    [],
  )

  React.useImperativeHandle(
    ref,
    () => ({ startManual: openManual, startFromTrigger }),
    [openManual, startFromTrigger],
  )

  const handlePublish = (campaign: Campaign) => {
    setCampaigns((prev) => [campaign, ...prev])
    setDraft(null)
    setTab("mine")
  }

  const cancelDraft = () => setDraft(null)

  const updateCampaign = (next: Campaign) =>
    setCampaigns((prev) => prev.map((c) => (c.id === next.id ? next : c)))

  return (
    <div className="space-y-6">
      {draft ? (
        <CampaignWizard
          draft={draft}
          setDraft={setDraft}
          onCancel={cancelDraft}
          onPublish={handlePublish}
        />
      ) : openCampaign ? (
        <CampaignDetailView
          campaign={openCampaign}
          onClose={() => setOpenCampaign(null)}
          onPause={(c) => {
            const next = { ...c, status: "paused" as const }
            updateCampaign(next)
            setOpenCampaign(next)
          }}
          onResume={(c) => {
            const next = { ...c, status: "running" as const }
            updateCampaign(next)
            setOpenCampaign(next)
          }}
          onStop={(c) => {
            const next = { ...c, status: "completed" as const, endsAt: new Date().toISOString() }
            updateCampaign(next)
            setOpenCampaign(next)
          }}
          onEdit={(c) => {
            // Editing routes through the wizard but keeps the existing
            // campaign id. Saving updates the existing record rather than
            // creating a new one — Publish CTA is hidden via the inline
            // detail view's UI; the wizard's Publish is reserved for new
            // campaigns. We still allow editing draft state for changes
            // like creative tweaks.
            setDraft({
              id: c.id,
              step: "review",
              kind: c.kind,
              title: c.title,
              vehicles: c.vehicles,
              config: c.config,
              projection: {
                impressions: c.performance.impressions,
                leads: c.performance.leads,
                appointments: c.performance.appointments,
                unitsSold: c.performance.unitsSold,
                estimatedSpend: c.config.budget,
                estimatedHoldingSavings: 0,
              },
            })
            setOpenCampaign(null)
          }}
        />
      ) : (
        <>
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { value: "create", label: "Create new campaign" },
              {
                value: "mine",
                label: "My campaigns",
                count: campaigns.length,
              },
            ]}
          />

          {tab === "create" ? (
            layout === "hero" ? (
              <div className="space-y-8">
                <HeroPromptBlock>
                  <AgenticPromptInput
                    onCreate={handleAgenticInput}
                    floating={false}
                    variant="hero"
                  />
                </HeroPromptBlock>

                <CampaignMetricsRow
                  campaigns={campaigns}
                  onViewCampaigns={() => setTab("mine")}
                />
                <SuggestedCampaignsList
                  suggestions={mockCampaignSuggestions}
                  onReviewAndPublish={openAgenticFromSuggestion}
                />

                {/* Hero layout uses the 700×700 modal chat. */}
                <AgenticChatPanel
                  position="modal"
                  messages={chatMessages}
                  thinking={chatThinking}
                  onReview={handleReviewFromChat}
                  onAnswer={handleAgenticInput}
                  onClear={clearChat}
                />
              </div>
            ) : (
              <div className="space-y-8 pb-32">
                <CampaignMetricsRow
                  campaigns={campaigns}
                  onViewCampaigns={() => setTab("mine")}
                />
                <SuggestedCampaignsList
                  suggestions={mockCampaignSuggestions}
                  onReviewAndPublish={openAgenticFromSuggestion}
                />

                {/* Default marketing tab: floating chat above the bottom bar. */}
                <AgenticChatPanel
                  position="floating"
                  messages={chatMessages}
                  thinking={chatThinking}
                  onReview={handleReviewFromChat}
                  onAnswer={handleAgenticInput}
                  onClear={clearChat}
                />

                <AgenticPromptInput
                  onCreate={handleAgenticInput}
                  floating
                  chatActive={chatMessages.length > 0}
                />
              </div>
            )
          ) : (
            <MyCampaignsList campaigns={campaigns} onOpen={setOpenCampaign} />
          )}
        </>
      )}
    </div>
  )
})

/* ────────────────────────── Hero prompt block ────────────────────────── */

/** Headline + subhead above the hero prompt. */
function HeroPromptBlock({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-labelledby="hero-prompt-heading"
      className="mx-auto max-w-3xl text-center"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-spyne-primary">
        Ask Spyne
      </p>
      <h2
        id="hero-prompt-heading"
        className="mt-2 text-3xl font-semibold tracking-tight text-spyne-text"
      >
        What campaign do you want to run?
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Describe it in a sentence. Spyne picks the VINs, channels, and budget,
        then walks you through a quick review before publish.
      </p>
      <div className="mt-7 text-left">{children}</div>
    </section>
  )
}

/* ────────────────────────── Tabs ────────────────────────── */

function Tabs({
  value,
  onChange,
  items,
}: {
  value: Tab
  onChange: (next: Tab) => void
  items: { value: Tab; label: string; count?: number }[]
}) {
  return (
    <div className="flex items-center gap-1 border-b border-spyne-border">
      {items.map((item) => {
        const isActive = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              "relative inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors",
              isActive
                ? "text-spyne-text"
                : "text-muted-foreground hover:text-spyne-text",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <span>{item.label}</span>
            {typeof item.count === "number" ? (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                  isActive
                    ? "bg-spyne-primary-soft text-spyne-primary"
                    : "bg-muted/40 text-muted-foreground",
                )}
              >
                {item.count}
              </span>
            ) : null}
            {isActive ? (
              <span
                className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-spyne-primary"
                aria-hidden
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

/* ────────────────────────── Helpers ────────────────────────── */

/**
 * Pick a suggestion archetype + lightly re-shape its vehicle list based on
 * the conversation answers (cohort / make / exclude). Real wiring would hit
 * the real catalog; this keeps the chat-driven flow grounded for the demo.
 */
/**
 * Resolve a trigger key (used in `?createCampaign=<key>` deep links from the
 * Merchandising hook toast) to a concrete suggestion archetype.
 */
function matchSuggestionByTriggerKey(key: string): CampaignSuggestion | null {
  const k = key.toLowerCase()
  if (k.includes("holding")) {
    return (
      mockCampaignSuggestions.find((s) => s.trigger === "high-holding-cost") ??
      null
    )
  }
  if (k.includes("aged-60") || k.includes("60")) {
    return mockCampaignSuggestions.find((s) => s.trigger === "aged-60") ?? null
  }
  if (k.includes("aged-45") || k.includes("45")) {
    return mockCampaignSuggestions.find((s) => s.trigger === "aged-45") ?? null
  }
  if (k.includes("aged-30") || k.includes("30") || k.includes("aged")) {
    // Fall back to the closest aging archetype we ship.
    return (
      mockCampaignSuggestions.find((s) => s.trigger === "aged-45") ??
      mockCampaignSuggestions.find((s) => s.trigger === "aged-30") ??
      null
    )
  }
  if (k.includes("festive") || k.includes("holiday")) {
    return mockCampaignSuggestions.find((s) => s.trigger === "festive") ?? null
  }
  if (k.includes("cpo") || k.includes("certified")) {
    return (
      mockCampaignSuggestions.find((s) => s.trigger === "certified-pre-owned") ??
      null
    )
  }
  return mockCampaignSuggestions[0] ?? null
}

function matchSuggestionWithAnswers(
  prompt: string,
  answers: { cohort?: string; make?: string; exclude?: string },
): CampaignSuggestion {
  const base = matchSuggestion(prompt)
  let vehicles = base.vehicles

  // Cohort — multi-select aware. "Both" or selecting both options leaves the set untouched.
  if (answers.cohort) {
    const c = answers.cohort.toLowerCase()
    const wantsBoth = c.includes("both")
    const wantsNew = c.includes("new vehicle") || /\bnew\b/.test(c)
    const wantsUsed = c.includes("pre-owned") || c.includes("used")
    if (!wantsBoth && wantsNew && !wantsUsed) {
      vehicles = vehicles.filter((v) => v.daysInStock <= 14)
    } else if (!wantsBoth && wantsUsed && !wantsNew) {
      vehicles = vehicles.filter((v) => v.daysInStock > 14)
    }
  }

  // Make — supports a comma-separated set ("Toyota, Honda").
  if (answers.make) {
    const m = answers.make.toLowerCase()
    if (!m.includes("any make")) {
      const makes = m
        .split(/[,\s]*,[,\s]*|\s*\+\s*/)
        .map((x) => x.trim())
        .filter(Boolean)
      const narrowed = vehicles.filter((v) =>
        makes.some((mk) => v.make.toLowerCase().includes(mk)),
      )
      if (narrowed.length > 0) vehicles = narrowed
    }
  }

  // Exclusions — multi-select aware. Apply each one cumulatively.
  if (answers.exclude) {
    const ex = answers.exclude.toLowerCase()
    if (!ex.includes("no, use all")) {
      if (ex.includes("new arrivals") || ex.includes("<7d")) {
        vehicles = vehicles.filter((v) => v.daysInStock >= 7)
      }
      if (ex.includes("aging") || ex.includes("60+")) {
        vehicles = vehicles.filter((v) => v.daysInStock < 60)
      }
    }
  }

  // If filtering wiped the list, fall back to the base set so the preview stays meaningful.
  if (vehicles.length === 0) vehicles = base.vehicles

  return { ...base, vehicles }
}

function matchSuggestion(prompt: string): CampaignSuggestion {
  const p = prompt.toLowerCase()
  const matched = mockCampaignSuggestions.find((s) => {
    if (s.trigger === "aged-60" && /60\s*\+?|sixty/.test(p)) return true
    if (s.trigger === "aged-45" && /45\s*\+?|forty/.test(p)) return true
    if (s.trigger === "aged-30" && /30\s*\+?|thirty/.test(p)) return true
    if (s.trigger === "high-holding-cost" && /holding|carry|cost/.test(p)) return true
    return false
  })
  return matched ?? mockCampaignSuggestions[0]
}

function deriveTitleFromPrompt(prompt: string): string {
  const trimmed = prompt.trim()
  if (trimmed.length <= 64) return capitalize(trimmed)
  return capitalize(trimmed.slice(0, 60).trim()) + "…"
}

function capitalize(s: string): string {
  if (!s) return s
  return s[0].toUpperCase() + s.slice(1)
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return `${s.slice(0, max).trimEnd()}…`
}

function buildEmptyManualDraft(): CampaignWizardDraft {
  const seed = mockMerchandisingVehicles
    .filter((v) => v.daysInStock >= 30 && v.year > 0)
    .slice(0, 8)
    .map<CampaignVehicle>((v) => ({
      vin: v.vin,
      name: `${v.year} ${v.make} ${v.model}`,
      year: v.year,
      make: v.make,
      model: v.model,
      trim: v.trim,
      daysInStock: v.daysInStock,
      holdingAccumulated: v.daysInStock * STUDIO_HOLDING_COST_PER_DAY,
      price: v.price,
      thumbnailUrl: v.thumbnailUrl || demoVehicleThumbnailByKey(v.vin),
    }))

  return {
    id: `draft-manual-${Date.now()}`,
    step: "inventory",
    kind: "manual",
    title: "New campaign",
    vehicles: seed,
    config: {
      channels: ["google-ads", "vlp-spotlight"],
      budget: 1500,
      durationDays: 10,
      scheduledFor: new Date().toISOString(),
      creative: {
        headline: "Featured this week",
        body: "Hand-picked inventory ready for an immediate test drive.",
      },
    },
    projection: {
      impressions: 0,
      leads: 0,
      appointments: 0,
      unitsSold: 0,
      estimatedSpend: 1500,
      estimatedHoldingSavings: 0,
    },
  }
}
