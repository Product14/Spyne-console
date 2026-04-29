"use client"

import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import InfoTooltip from "@/components/max-2/sales/console-v2/components/InfoTooltip"

export type ServiceShowRateSegment = {
  key: string
  label: string
  count: number
  barClass: string
}

export function ServiceShowRatePanel({
  rateLabel,
  rateCaption,
  deltaLabel,
  segments,
  className,
}: {
  rateLabel: string
  rateCaption: string
  deltaLabel: string
  segments: ServiceShowRateSegment[]
  className?: string
}) {
  const total = segments.reduce((acc, s) => acc + s.count, 0) || 1

  return (
    <div className={cn("spyne-card flex h-full min-h-0 flex-col gap-4 p-4", className)}>
      <div className="flex items-center gap-1.5">
        <h3 className={cn(spyneComponentClasses.cardTitle, "m-0")}>Show rate</h3>
        <InfoTooltip text="Share of AI-booked appointments where the customer arrived as scheduled, plus no-shows and reschedules." />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div
          className="flex flex-col justify-center rounded-lg border border-spyne-border px-4 py-3"
          style={{
            background: "color-mix(in srgb, var(--spyne-success) 12%, white)",
          }}
        >
          <span
            className="font-bold tabular-nums tracking-tight text-spyne-success"
            style={{ fontSize: "clamp(1.5rem, 2vw + 0.5rem, 2rem)", lineHeight: 1.1 }}
          >
            {rateLabel}
          </span>
          <span className="spyne-caption mt-1 text-spyne-text-secondary">{rateCaption}</span>
        </div>
        <div
          className="flex flex-col justify-center rounded-lg border border-spyne-border px-4 py-3"
          style={{
            background: "color-mix(in srgb, var(--spyne-info) 14%, white)",
          }}
        >
          <span
            className="font-bold tabular-nums tracking-tight text-spyne-info"
            style={{ fontSize: "clamp(1.125rem, 1.5vw + 0.5rem, 1.35rem)", lineHeight: 1.2 }}
          >
            ↑ {deltaLabel}
          </span>
        </div>
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/40">
        {segments.map((s) => (
          <div
            key={s.key}
            className={cn(s.barClass, "min-w-0 transition-[flex-grow]")}
            style={{ flexGrow: s.count, flexBasis: 0 }}
            title={`${s.label}: ${s.count}`}
          />
        ))}
      </div>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", s.barClass)} aria-hidden />
              <span className="spyne-body truncate text-spyne-text-primary">{s.label}</span>
            </div>
            <span className="spyne-caption shrink-0 tabular-nums text-spyne-text-secondary">
              {s.count} appts ({Math.round((s.count / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
