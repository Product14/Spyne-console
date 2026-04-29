"use client"

import { useState } from "react"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneLineTab, SpyneLineTabBadge, SpyneLineTabStrip } from "@/components/max-2/spyne-line-tabs"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import InfoTooltip from "./InfoTooltip"

const TABS = [
  { id: "todaysCallbacks", label: "Today's Callbacks" },
  { id: "hot",             label: "Hot" },
  { id: "warm",            label: "Warm" },
] as const

/** Sales tag → left-border accent + badge class */
const TAG_STYLE: Record<string, { border: string; badgeClass: string }> = {
  "Callback Requested":    { border: "#4600F2", badgeClass: "spyne-badge-info"    },
  "Needs human attention": { border: "#EF4444", badgeClass: "spyne-badge-danger"  },
  "Follow-up needed":      { border: "#F59E0B", badgeClass: "spyne-badge-warning" },
}

/** Service priority → left-border accent + badge class + display label */
const PRIORITY_STYLE: Record<string, { border: string; badgeClass: string; label: string }> = {
  urgent: { border: "#EF4444", badgeClass: "spyne-badge-danger",  label: "Urgent" },
  high:   { border: "#F59E0B", badgeClass: "spyne-badge-warning", label: "High"   },
}

type SalesLead = {
  id: number
  initials: string
  color: string
  name: string
  timeAgo: string
  message: string
  tag: string
  tagColor?: string
  scheduledTime?: string
}

type SalesFollowUps = {
  todaysCallbacks: SalesLead[]
  hot: SalesLead[]
  warm: SalesLead[]
}

export type ServicePriorityFollowUpItem = {
  id: string
  initials: string
  color: string
  name: string
  timeAgo: string
  message: string
  priority: "urgent" | "high"
}

export type PriorityFollowUpsProps =
  | { variant?: "sales"; followUps: SalesFollowUps }
  | { variant: "service"; items: ServicePriorityFollowUpItem[]; urgentCount?: number }

export default function PriorityFollowUps(props: PriorityFollowUpsProps) {
  if (props.variant === "service") {
    return <ServicePriorityFollowUpsBody items={props.items} urgentCount={props.urgentCount} />
  }
  return <SalesPriorityFollowUpsBody followUps={props.followUps} />
}

/** Shared compact row — 2 visual lines: name+time, then message+badge+scheduledTime */
function FollowUpRow({
  initials,
  color,
  name,
  timeAgo,
  message,
  borderColor,
  badgeClass,
  badgeLabel,
  scheduledTime,
  isLast,
}: {
  initials: string
  color: string
  name: string
  timeAgo: string
  message: string
  borderColor: string
  badgeClass: string
  badgeLabel: string
  scheduledTime?: string
  isLast: boolean
}) {
  return (
    <div
      className="flex items-start gap-3 py-3 pr-4 transition-colors"
      style={{
        borderLeft: `3px solid ${borderColor}`,
        paddingLeft: 13,
        borderBottom: isLast ? "none" : "1px solid var(--spyne-border)",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--spyne-bg)" }}
      onMouseLeave={(e)  => { (e.currentTarget as HTMLDivElement).style.background = "transparent" }}
    >
      {/* Avatar */}
      <div
        className={`${color} flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white`}
      >
        {initials}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Row 1: name + time */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[13px] font-semibold leading-tight" style={{ color: "var(--spyne-text-primary)" }}>
            {name}
          </span>
          <span className="shrink-0 text-[11px] tabular-nums" style={{ color: "var(--spyne-text-muted)" }}>
            {timeAgo}
          </span>
        </div>

        {/* Row 2: message */}
        <div className="mt-0.5 truncate text-[11px]" style={{ color: "var(--spyne-text-secondary)" }}>
          {message}
        </div>

        {/* Row 3: badge + optional scheduled time */}
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className={`spyne-badge ${badgeClass}`}>{badgeLabel}</span>
          {scheduledTime ? (
            <span className="shrink-0 text-[11px] tabular-nums" style={{ color: "var(--spyne-text-muted)" }}>
              {scheduledTime}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ServicePriorityFollowUpsBody({
  items,
  urgentCount,
}: {
  items: ServicePriorityFollowUpItem[]
  urgentCount?: number
}) {
  return (
    <div
      className="spyne-card spyne-animate-fade-in flex h-full flex-col overflow-hidden"
      style={{ animationDelay: "100ms" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={spyneComponentClasses.cardTitle}>Priority Follow-ups</span>
          <InfoTooltip text="Customers who need advisor action after the agent flagged no-shows, pending RO approval, or overdue service with no response." />
        </div>
        {urgentCount != null ? (
          <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-spyne-border bg-spyne-page px-1.5 text-[11px] font-bold tabular-nums text-spyne-text-secondary">
            {urgentCount}
          </span>
        ) : null}
      </div>

      <div className="border-t border-spyne-border" />

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-xs" style={{ color: "var(--spyne-text-muted)" }}>
            No priority follow-ups
          </div>
        ) : (
          items.map((lead, i) => {
            const s = PRIORITY_STYLE[lead.priority] ?? { border: "#6B7280", badgeClass: "spyne-badge-neutral", label: "Normal" }
            return (
              <FollowUpRow
                key={lead.id}
                initials={lead.initials}
                color={lead.color}
                name={lead.name}
                timeAgo={lead.timeAgo}
                message={lead.message}
                borderColor={s.border}
                badgeClass={s.badgeClass}
                badgeLabel={s.label}
                isLast={i === items.length - 1}
              />
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-spyne-border px-4 py-3">
        <button className="flex items-center gap-1 cursor-pointer" style={{ background: "none", border: "none", padding: 0 }}>
          <span className="text-xs font-semibold" style={{ color: "var(--spyne-brand)" }}>View all follow-ups</span>
          <MaterialSymbol name="arrow_forward" size={11} style={{ color: "var(--spyne-brand)" }} />
        </button>
      </div>
    </div>
  )
}

function SalesPriorityFollowUpsBody({ followUps }: { followUps: SalesFollowUps }) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("todaysCallbacks")
  const items = followUps[activeTab] ?? []

  const tabBadge = {
    todaysCallbacks: followUps.todaysCallbacks?.length,
    hot:             followUps.hot?.length,
    warm:            followUps.warm?.length,
  }

  return (
    <div
      className="spyne-card spyne-animate-fade-in flex h-full flex-col overflow-hidden"
      style={{ animationDelay: "100ms" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={spyneComponentClasses.cardTitle}>Priority Follow-ups</span>
          <InfoTooltip text="High-priority leads flagged by Vini for human review. Leads that showed strong intent signals but have not yet converted to an appointment." />
        </div>
      </div>

      {/* Tab strip — full-width hairline, tabs padded to match card gutter */}
      <SpyneLineTabStrip compact tight className="px-4">
        {TABS.map((tab) => {
          const count = tabBadge[tab.id]
          return (
            <SpyneLineTab
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="whitespace-nowrap"
            >
              {tab.label}
              {count ? <SpyneLineTabBadge>{count}</SpyneLineTabBadge> : null}
            </SpyneLineTab>
          )
        })}
      </SpyneLineTabStrip>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-xs" style={{ color: "var(--spyne-text-muted)" }}>
            No leads in this category
          </div>
        ) : (
          items.map((lead, i) => {
            const s = TAG_STYLE[lead.tag] ?? { border: "#6B7280", badgeClass: "spyne-badge-neutral" }
            return (
              <FollowUpRow
                key={lead.id}
                initials={lead.initials}
                color={lead.color}
                name={lead.name}
                timeAgo={lead.timeAgo}
                message={lead.message}
                borderColor={s.border}
                badgeClass={s.badgeClass}
                badgeLabel={lead.tag}
                scheduledTime={lead.scheduledTime}
                isLast={i === items.length - 1}
              />
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-spyne-border px-4 py-3">
        <button className="flex items-center gap-1 cursor-pointer" style={{ background: "none", border: "none", padding: 0 }}>
          <span className="text-xs font-semibold" style={{ color: "var(--spyne-brand)" }}>View all follow-ups</span>
          <MaterialSymbol name="arrow_forward" size={11} style={{ color: "var(--spyne-brand)" }} />
        </button>
      </div>
    </div>
  )
}
