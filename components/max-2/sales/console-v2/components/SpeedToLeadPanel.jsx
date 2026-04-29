"use client"

import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { cn } from "@/lib/utils"
import InfoTooltip from "./InfoTooltip"
import { SPYNE, SPYNE_SOFT_BG } from "../spyne-palette"

export default function SpeedToLeadPanel({
  data,
  heading = "Speed-to-Lead",
  tooltipText = "Measures how fast Vini responds to new leads. Research shows leads contacted within 5 minutes are 9× more likely to convert. This card tracks Vini's response speed and the appointments it generates from instant outreach.",
}) {
  const [highlightLead, highlightTrail] = splitHighlight(data.highlightBar)

  return (
    <div
      className={cn(
        "spyne-animate-slide-up flex h-full min-h-0 flex-col overflow-hidden rounded-[var(--spyne-radius-lg)]",
        "border-0 bg-spyne-surface shadow-[var(--spyne-card-shadow)]",
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-5 p-4 lg:p-6">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="spyne-subheading m-0">{heading}</h3>
          <InfoTooltip text={tooltipText} />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0">
            <div
              className="font-bold tabular-nums tracking-tight text-spyne-primary"
              style={{
                fontSize: "clamp(1.75rem, 2.5vw + 0.5rem, 2.25rem)",
                lineHeight: 1.05,
              }}
            >
              {data.avgTime}
            </div>
            <p className="spyne-body m-0 mt-2 flex items-center gap-1.5 text-spyne-text-secondary">
              <MaterialSymbol name="schedule" size={16} className="shrink-0 text-spyne-text-secondary opacity-90" />
              avg first contact time
            </p>
          </div>

          <div className="flex flex-col gap-1.5 sm:items-end sm:text-right">
            <span
              className="spyne-caption inline-flex w-fit max-w-full items-center gap-1 rounded-[var(--spyne-radius-pill)] border font-bold"
              style={{
                padding: "6px 10px",
                background: "var(--spyne-success-subtle)",
                color: "var(--spyne-success-text)",
                borderColor: "var(--spyne-success-muted)",
              }}
            >
              <MaterialSymbol name="trending_down" size={14} className="shrink-0 text-current" />
              <span className="min-w-0 text-left sm:text-right">{data.improvement}</span>
            </span>
            <span className="spyne-caption text-spyne-text-secondary">prior week: {data.priorPeriod}</span>
          </div>
        </div>

        <div
          className="grid min-h-[140px] flex-1 grid-cols-2 gap-3"
          style={{ gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)" }}
        >
          <StatCell icon="bolt" value={data.leadsInstantlyReached} label="leads instantly reached" />
          <StatCell icon="forum" value={data.leadsEngaged} label="leads engaged (replied back)" />
          <StatCell icon="event" value={data.apptsFromInstantResponse} label="appts from instant response" green />
          <StatCell icon="database" value={`${data.crmLeadsCaptured}%`} label="of CRM leads captured" />
        </div>
      </div>

      <div
        className="flex items-center justify-center border-t border-spyne-border px-4 py-3"
        style={{ background: SPYNE_SOFT_BG.info }}
      >
        <p className="spyne-caption m-0 max-w-prose text-center leading-relaxed" style={{ color: SPYNE.textPrimary, fontWeight: 500 }}>
          <strong>{highlightLead}</strong>
          {highlightTrail ? (
            <>
              {" "}
              <span className="text-spyne-text-secondary">·</span> {highlightTrail}
            </>
          ) : null}
        </p>
      </div>
    </div>
  )
}

function splitHighlight(text) {
  if (!text || typeof text !== "string") return ["", ""]
  const idx = text.indexOf("·")
  if (idx === -1) return [text.trim(), ""]
  return [text.slice(0, idx).trim(), text.slice(idx + 1).trim()]
}

function StatCell({ icon, value, label, green }) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col justify-center gap-2 rounded-[var(--spyne-radius-md)] border border-spyne-border bg-spyne-surface p-3.5",
        "shadow-[var(--spyne-card-shadow)]",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex shrink-0",
            green ? "text-spyne-success" : "text-spyne-text-secondary opacity-[0.88]",
          )}
        >
          <MaterialSymbol name={icon} size={20} className="text-current" />
        </span>
        <div
          className={cn(
            "spyne-number min-w-0 flex-1 text-[22px] leading-none",
            green ? "text-spyne-success" : "text-spyne-text-primary",
          )}
        >
          {value}
        </div>
      </div>
      {/* 20px icon + gap-2 (8px) — align caption with value column */}
      <div className="spyne-caption pl-7 leading-snug text-spyne-text-secondary">{label}</div>
    </div>
  )
}
