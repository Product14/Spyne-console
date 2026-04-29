"use client"

import { useState } from 'react'
import { MaterialSymbol } from '@/components/max-2/material-symbol'
import InfoTooltip from './InfoTooltip'

const SECTION_LABEL_STYLE = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--spyne-text-muted)',
}

function StatCell({ value, label, accent }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="tabular-nums"
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          color: accent ? 'var(--spyne-brand)' : 'var(--spyne-text-primary)',
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: 11, color: 'var(--spyne-text-muted)', lineHeight: 1.3 }}>
        {label}
      </span>
    </div>
  )
}

export default function AgentCard({ agent }) {
  const { name, role, photo, status, performance, agentType } = agent
  const [imgError, setImgError] = useState(false)
  const isOutbound = agentType === 'outbound'
  const isOnline = status === 'online'

  return (
    <div className="spyne-card spyne-animate-fade-in flex flex-col overflow-hidden">
      {/* Agent header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        {/* Avatar with status ring */}
        <div className="relative shrink-0">
          {photo && !imgError ? (
            <img
              src={photo}
              alt={name}
              onError={() => setImgError(true)}
              className="h-11 w-11 rounded-full object-cover object-top"
              style={{
                border: isOnline
                  ? '2.5px solid var(--spyne-success)'
                  : '2px solid var(--spyne-border)',
              }}
            />
          ) : (
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full text-base font-bold"
              style={{
                background: 'var(--spyne-brand-subtle)',
                color: 'var(--spyne-brand)',
                border: isOnline
                  ? '2.5px solid var(--spyne-success)'
                  : '2px solid var(--spyne-brand-muted)',
              }}
            >
              {name.charAt(0)}
            </div>
          )}
          {/* Status dot */}
          <span
            className="absolute bottom-0 right-0 h-3 w-3 rounded-full"
            style={{
              background: isOnline ? 'var(--spyne-success)' : 'var(--spyne-text-muted)',
              border: '2px solid var(--spyne-surface)',
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--spyne-text-primary)' }}>
              {name}
            </span>
            <InfoTooltip text="Vini AI's activity summary for the selected period — structured the same way you'd evaluate a BDC agent. Review overall contact activity, speed-to-response, and after-hours coverage side by side." />
          </div>
          <div style={{ fontSize: 11, color: 'var(--spyne-text-muted)', marginTop: 1 }}>
            {role}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-spyne-border" />

      {/* Stats */}
      <div className="flex flex-1 flex-col gap-3 px-4 py-3">
        <div style={SECTION_LABEL_STYLE}>
          {isOutbound ? 'Outbound Activity' : 'Overall Stats'}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {isOutbound ? (
            <>
              <StatCell value={performance.overall.leadsWorked}      label="leads worked" />
              <StatCell value={performance.overall.responseRate}      label="response rate" accent />
              <StatCell value={performance.overall.reEngagements}     label="re-engagements" />
              <StatCell value={performance.overall.reEngagementRate}  label="re-engagement rate" accent />
            </>
          ) : (
            <>
              <StatCell value={performance.overall.leadsInteracted}    label="leads interacted" />
              <StatCell value={performance.speedToLead.avgFirstContact} label="avg first contact" accent />
              <StatCell value={performance.overall.appointmentsBooked} label="appts booked" />
              <StatCell value={performance.overall.apptBookingRate}    label="appt booking rate" accent />
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-spyne-border px-4 py-3">
        <button
          className="flex items-center gap-1 cursor-pointer"
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--spyne-brand)' }}>
            View full performance
          </span>
          <MaterialSymbol name="arrow_forward" size={11} style={{ color: 'var(--spyne-brand)' }} />
        </button>
      </div>
    </div>
  )
}
