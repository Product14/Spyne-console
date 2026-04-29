"use client"

import { useState } from 'react'
import { MaterialSymbol } from '@/components/max-2/material-symbol'

/* ── SMS Bubble ─────────────────────────────────────────────────────── */
function SmsBubble({ entry }) {
  const isAgent = entry.agent
  return (
    <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'} mb-3`}>
      <div style={{ maxWidth: '76%' }}>
        <div
          className="px-3 py-2"
          style={{
            background: isAgent ? 'var(--spyne-brand)' : 'var(--spyne-border)',
            color: isAgent ? '#fff' : 'var(--spyne-text-primary)',
            borderRadius: isAgent ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {entry.body}
        </div>
        <p
          style={{
            fontSize: 10,
            color: 'var(--spyne-text-muted)',
            textAlign: isAgent ? 'right' : 'left',
            marginTop: 3,
          }}
        >
          {isAgent ? `Vini AI · ${entry.timestamp}` : entry.timestamp}
        </p>
      </div>
    </div>
  )
}

/* ── Call Card (expandable) ─────────────────────────────────────────── */
function CallCard({ entry }) {
  const [expanded, setExpanded] = useState(false)
  const connected = entry.callOutcome === 'connected'
  const iconName  = connected ? 'phone' : 'phone_disabled'
  const iconColor = connected ? 'var(--spyne-success-text)' : 'var(--spyne-danger-text)'
  const iconBg    = connected ? 'var(--spyne-success-subtle)' : 'var(--spyne-danger-subtle)'
  const direction = entry.agent ? 'Outbound' : 'Inbound'
  const outcome   =
    entry.callOutcome === 'connected' ? 'Connected' :
    entry.callOutcome === 'no_answer' ? 'No answer' : 'Voicemail'

  return (
    <div
      className="rounded-[8px] border mb-3"
      style={{ borderColor: 'var(--spyne-border)', background: 'var(--spyne-surface)' }}
    >
      <button
        className="w-full flex items-center gap-3 p-3 cursor-pointer"
        style={{ background: 'none', border: 'none', textAlign: 'left' }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div
          className="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0"
          style={{ background: iconBg, color: iconColor }}
        >
          <MaterialSymbol name={iconName} size={13} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>
              {direction} call · {outcome}
            </span>
            {entry.duration && (
              <span style={{ fontSize: 11, color: 'var(--spyne-text-muted)' }}>· {entry.duration}</span>
            )}
            {entry.agent && (
              <span className="spyne-badge spyne-badge-brand">
                Vini AI
              </span>
            )}
          </div>
          <p
            className="mt-0.5 truncate"
            style={{ fontSize: 12, color: 'var(--spyne-text-secondary)', lineHeight: 1.4 }}
          >
            {entry.body}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span style={{ fontSize: 10, color: 'var(--spyne-text-muted)', whiteSpace: 'nowrap' }}>
            {entry.timestamp}
          </span>
          <MaterialSymbol
            name="expand_more"
            size={13}
            style={{
              color: 'var(--spyne-text-muted)',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 150ms',
            }}
          />
        </div>
      </button>

      {expanded && (
        <div
          className="mx-3 mb-3 p-3 rounded-lg"
          style={{ background: 'var(--spyne-bg)' }}
        >
          {/* Call summary — always shown */}
          <p style={{ fontSize: 12, color: 'var(--spyne-text-secondary)', lineHeight: 1.6, marginBottom: entry.transcript ? 10 : 0 }}>
            {entry.body}
          </p>

          {/* Transcript — only if present */}
          {entry.transcript && (
            <div style={{ borderTop: '1px solid var(--spyne-border)', paddingTop: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--spyne-text-muted)', marginBottom: 8 }}>
                Transcript
              </p>
              {entry.transcript.map((line, i) => {
                const colonIdx = line.indexOf(': ')
                const speaker  = colonIdx > -1 ? line.slice(0, colonIdx) : null
                const text     = colonIdx > -1 ? line.slice(colonIdx + 2) : line
                return (
                  <div key={i} style={{ marginBottom: i < entry.transcript.length - 1 ? 6 : 0 }}>
                    {speaker && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, marginRight: 4,
                        color: speaker === 'Agent' ? 'var(--spyne-brand)' : 'var(--spyne-text-primary)',
                      }}>
                        {speaker}:
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: 'var(--spyne-text-secondary)', lineHeight: 1.5 }}>{text}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Stage Change Pill (centered inline) ────────────────────────────── */
function StageChangePill({ entry }) {
  const text =
    entry.fromStage && entry.toStage
      ? `${entry.fromStage} → ${entry.toStage}`
      : entry.body
  return (
    <div
      className="flex items-center justify-center gap-1.5 mb-3"
      style={{
        background: 'var(--spyne-brand-subtle)',
        borderRadius: 6,
        padding: '5px 10px',
      }}
    >
      <MaterialSymbol name="info" size={11} style={{ color: 'var(--spyne-brand)', flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: 'var(--spyne-text-muted)' }}>
        {entry.title || 'Stage changed'} ·{' '}
      </span>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--spyne-brand)' }}>{text}</span>
      <span style={{ color: 'var(--spyne-brand-muted)', fontSize: 11 }}>·</span>
      <span style={{ fontSize: 11, color: 'var(--spyne-text-muted)' }}>{entry.timestamp}</span>
    </div>
  )
}

/* ── Appointment Chip ───────────────────────────────────────────────── */
function AppointmentChip({ entry }) {
  // Split "Test Drive · Attended" into type + status
  const parts     = (entry.title || 'Appointment').split(' · ')
  const apptType  = parts[0]
  const apptStatus = parts[1] || null

  const attended  = apptStatus === 'Attended' || apptStatus === 'Completed'
  const upcoming  = !apptStatus || apptStatus === 'Upcoming' || apptStatus === 'Confirmed' || apptStatus === 'Scheduled'
  const missed    = apptStatus === 'Missed' || apptStatus === 'No-show'

  const statusBadgeClass = attended ? 'spyne-badge-success' : missed ? 'spyne-badge-danger' : 'spyne-badge-brand'

  return (
    <div
      className="rounded-[8px] border mb-3"
      style={{ borderColor: 'var(--spyne-warning-muted)', background: 'var(--spyne-warning-subtle)' }}
    >
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0"
          style={{ background: 'var(--spyne-warning-muted)', color: 'var(--spyne-warning-text)', marginTop: 1 }}
        >
          <MaterialSymbol name="event" size={13} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--spyne-warning-text)' }}>
              {apptType}
            </span>
            {apptStatus && (
              <span className={`spyne-badge ${statusBadgeClass}`}>
                {apptStatus}
              </span>
            )}
          </div>
          {entry.vehicle && (
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--spyne-warning-text)', marginTop: 2 }}>
              {entry.vehicle}
            </p>
          )}
          {entry.body && (
            <p style={{ fontSize: 12, color: 'var(--spyne-text-secondary)', marginTop: 3, lineHeight: 1.4 }}>
              {entry.body}
            </p>
          )}
        </div>
        <span style={{ fontSize: 10, color: 'var(--spyne-text-muted)', whiteSpace: 'nowrap', marginTop: 3 }}>
          {entry.timestamp}
        </span>
      </div>

      {upcoming && (
        <div
          style={{
            borderTop: '1px solid var(--spyne-warning-muted)',
            padding: '8px 12px',
            display: 'flex',
            gap: 8,
          }}
        >
          <button className="spyne-btn-primary" style={{ height: 28, fontSize: 11 }}>Confirm</button>
          <button className="spyne-btn-ghost" style={{ height: 28, fontSize: 11 }}>Reschedule</button>
        </div>
      )}
    </div>
  )
}

/* ── Action Item Chip ───────────────────────────────────────────────── */
function AgentActionChip({ entry }) {
  const [done, setDone] = useState(false)
  // Strip boilerplate prefix — salesperson only needs to see the task itself
  const task = (entry.body || '').replace(/^Action item created:\s*/i, '')

  return (
    <div
      className="rounded-[8px] border mb-3"
      style={{
        borderColor: done ? 'var(--spyne-border)' : 'var(--spyne-brand-muted)',
        background: done ? 'var(--spyne-bg)' : 'var(--spyne-brand-subtle)',
        opacity: done ? 0.6 : 1,
        transition: 'all 200ms',
      }}
    >
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <MaterialSymbol name="auto_awesome" size={13} style={{ color: done ? 'var(--spyne-text-muted)' : 'var(--spyne-brand)', flexShrink: 0, marginTop: 2 }} />
        <div className="flex-1 min-w-0">
          <p style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: done ? 'var(--spyne-text-muted)' : 'var(--spyne-brand)', marginBottom: 3,
          }}>
            Action Item
          </p>
          <p style={{ fontSize: 12, color: done ? 'var(--spyne-text-muted)' : 'var(--spyne-text-primary)', lineHeight: 1.5, textDecoration: done ? 'line-through' : 'none' }}>
            {task}
          </p>
        </div>
        <span style={{ fontSize: 10, color: 'var(--spyne-text-muted)', whiteSpace: 'nowrap', marginTop: 2 }}>
          {entry.timestamp}
        </span>
      </div>

      {!done && (
        <div
          style={{
            borderTop: '1px solid var(--spyne-brand-muted)',
            padding: '8px 12px',
            display: 'flex',
            gap: 8,
          }}
        >
          <button className="spyne-btn-primary" style={{ height: 28, fontSize: 11 }}>Do it now</button>
          <button className="spyne-btn-ghost" style={{ height: 28, fontSize: 11 }} onClick={() => setDone(true)}>Mark done</button>
        </div>
      )}

      {done && (
        <div style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <MaterialSymbol name="check_circle" size={11} style={{ color: 'var(--spyne-success-text)' }} />
          <span style={{ fontSize: 11, color: 'var(--spyne-success-text)' }}>Marked done</span>
        </div>
      )}
    </div>
  )
}

/* ── Main export ────────────────────────────────────────────────────── */
export default function ConversationThread({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="flex items-center justify-center py-10">
        <p style={{ fontSize: 13, color: 'var(--spyne-text-muted)' }}>No conversation history yet.</p>
      </div>
    )
  }

  const sorted = [...timeline].sort((a, b) => b.sortKey - a.sortKey)

  return (
    <div>
      {sorted.map((entry) => {
        switch (entry.type) {
          case 'sms':          return <SmsBubble       key={entry.id} entry={entry} />
          case 'call':         return <CallCard         key={entry.id} entry={entry} />
          case 'stage_change': return <StageChangePill key={entry.id} entry={entry} />
          case 'appointment':  return <AppointmentChip key={entry.id} entry={entry} />
          case 'agent_action': return <AgentActionChip key={entry.id} entry={entry} />
          default:             return null
        }
      })}
    </div>
  )
}
