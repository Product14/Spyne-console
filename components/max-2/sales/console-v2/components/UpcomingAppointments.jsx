"use client"

import { useState } from 'react'
import { MaterialSymbol } from '@/components/max-2/material-symbol'
import { spyneComponentClasses } from '@/lib/design-system/max-2'
import InfoTooltip from './InfoTooltip'

/** Derive a left-border accent from the service/vehicle description */
function getApptAccent(text = '') {
  const t = text.toLowerCase()
  if (t.includes('recall'))                         return '#D13313'
  if (t.includes('brake') || t.includes('repair'))  return '#3B82F6'
  if (t.includes('oil'))                            return '#4600F2'
  if (t.includes('tire') || t.includes('rotation')) return '#6B7280'
  if (t.includes('30k') || t.includes('service'))   return '#027A48'
  return '#4600F2'
}

export default function UpcomingAppointments({ appointments, variant = 'sales' }) {
  const [activeTab, setActiveTab] = useState('today')
  const isService = variant === 'service'
  const items = isService ? (appointments.today ?? []) : (appointments[activeTab] ?? [])
  const todayCount = appointments.today?.length ?? 0

  return (
    <div className="spyne-card spyne-animate-fade-in flex flex-col overflow-hidden" style={{ animationDelay: '50ms' }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={spyneComponentClasses.cardTitle}>
            {isService ? "Today's Appointments" : 'Upcoming Appointments'}
          </span>
          <InfoTooltip
            text={
              isService
                ? "AI-booked drive appointments for today, confirmed by the agent from inbound calls and follow-ups."
                : "AI-booked appointments for today and tomorrow. Confirmed visits from leads the agent qualified — no salesperson involvement required."
            }
          />
        </div>
        {isService ? (
          <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-spyne-border bg-spyne-page px-1.5 text-[11px] font-bold tabular-nums text-spyne-text-secondary">
            {todayCount}
          </span>
        ) : (
          <div className="flex gap-1">
            {['today', 'tomorrow'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`spyne-pill ${activeTab === tab ? 'spyne-pill-active' : ''}`}
                style={{ height: 24, padding: '0 10px', fontSize: 11 }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-spyne-border" />

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-xs" style={{ color: 'var(--spyne-text-muted)' }}>
            No appointments scheduled
          </div>
        ) : (
          items.map((appt) => {
            const accent = getApptAccent(appt.vehicle ?? appt.type ?? '')
            return (
              <div
                key={appt.id}
                className="flex items-center gap-3 py-3 pr-4 border-b border-spyne-border last:border-b-0 transition-colors"
                style={{
                  borderLeft: `3px solid ${accent}`,
                  paddingLeft: 13,
                  cursor: 'default',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--spyne-bg)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                {isService ? (
                  <>
                    <span
                      className="w-[4.5rem] shrink-0 text-[11px] font-semibold tabular-nums"
                      style={{ color: 'var(--spyne-text-secondary)', fontFamily: 'monospace' }}
                    >
                      {appt.timeStart}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate text-[13px] font-semibold leading-tight"
                        style={{ color: 'var(--spyne-text-primary)' }}
                      >
                        {appt.customer}
                      </div>
                      <div
                        className="truncate text-[11px] mt-0.5"
                        style={{ color: 'var(--spyne-text-muted)' }}
                      >
                        {appt.vehicle}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate text-[13px] font-semibold leading-tight"
                        style={{ color: 'var(--spyne-text-primary)' }}
                      >
                        {appt.customer}
                      </div>
                      <div
                        className="truncate text-[11px] mt-0.5"
                        style={{ color: 'var(--spyne-text-muted)' }}
                      >
                        {appt.vehicle}
                      </div>
                    </div>
                    <span
                      className="shrink-0 text-[11px] font-medium tabular-nums whitespace-nowrap"
                      style={{ color: 'var(--spyne-text-secondary)' }}
                    >
                      {appt.timeStart}
                    </span>
                  </>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-spyne-border px-4 py-3">
        <button
          className="flex items-center gap-1 cursor-pointer"
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--spyne-brand)' }}>
            View all appointments
          </span>
          <MaterialSymbol name="arrow_forward" size={11} style={{ color: 'var(--spyne-brand)' }} />
        </button>
      </div>
    </div>
  )
}
