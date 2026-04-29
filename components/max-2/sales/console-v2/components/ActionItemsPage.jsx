"use client"

import { useState, useMemo } from 'react'
import { MaterialSymbol } from '@/components/max-2/material-symbol'
import { SpyneLineTab, SpyneLineTabBadge, SpyneLineTabStrip } from '@/components/max-2/spyne-line-tabs'
import { SpyneSegmentedButton, SpyneSegmentedControl } from '@/components/max-2/spyne-toolbar-controls'
import { max2Classes, spyneSalesLayout } from '@/lib/design-system/max-2'
import { cn } from '@/lib/utils'
import { SPYNE, SPYNE_DRAWER_SHADOW, SPYNE_SOFT_BG } from '../spyne-palette'
import { SERVICE_CONSOLE_TAB_CONTENT } from '@/lib/max-2/service-console-tab-content'
import { SERVICE_ACTION_QUEUE } from '../mockData'

function daysSince(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime()
  return diff / (1000 * 60 * 60 * 24)
}

const QUEUE = [
  {
    id: '1', type: 'urgent', priority: 'HIGH', initials: 'SD', name: 'Sarah Delgado',
    phone: '+1 (555) 234-7890', stageLabel: 'Ready to Buy', stageCls: 'hot',
    vehicle: '2024 Toyota Camry XSE', category: 'New', price: '$31,200', daysOnLot: null,
    due: 'Today', createdAt: '2026-04-03T09:22:00Z',
    reason: 'Confirmed $450/mo budget and loved the Camry XSE. Agent hit ceiling — she\'s ready to close.',
    opener: 'Confirmed $450/mo, loved the Camry XSE — lead with the rate and Midnight Black availability. She\'s comparing with another dealer.',
    action: 'call',
  },
  {
    id: '2', type: 'urgent', priority: 'HIGH', initials: 'MW', name: 'Marcus Webb',
    phone: '+1 (555) 891-3344', stageLabel: 'Ready to Visit', stageCls: 'warm',
    vehicle: '2023 Honda CR-V EX-L', category: 'New', price: '$36,500', daysOnLot: null,
    due: 'Today', createdAt: '2026-04-03T08:06:00Z',
    reason: 'Went cold 3 weeks ago. Re-engaged this morning — don\'t lead with price. Ask what changed.',
    opener: 'Marcus went cold after a price pushback. He just re-engaged — don\'t lead with price. Lead with new inventory and current incentives. Ask what changed.',
    action: 'convo',
  },
  {
    id: '3', type: 'appointment', priority: 'MEDIUM', initials: 'DT', name: 'Diana Torres',
    phone: '+1 (555) 447-2291', stageLabel: 'Ready to Visit', stageCls: 'warm',
    vehicle: '2024 Toyota RAV4 XLE', category: 'New', price: '$33,800', daysOnLot: null,
    apptTime: 'Tomorrow, 2:00 PM',
    due: 'Tomorrow', createdAt: '2026-03-29T14:10:00Z',
    reason: 'Appointment tomorrow. Comparing RAV4 vs CR-V — came in once before. Prep the side-by-side.',
    opener: 'Appointment tomorrow at 2 PM. She\'s been comparing RAV4 vs CR-V. Have the side-by-side ready. This visit is decision-making, not discovery.',
    action: 'prep',
  },
  {
    id: '4', type: 'lot-match', priority: 'MEDIUM', initials: 'JW', name: 'James Whitfield',
    phone: '+1 (555) 670-5512', stageLabel: 'Comparing Options', stageCls: 'cool',
    vehicle: '2022 Chevrolet Tahoe LT', category: 'Used', price: '$52,900', daysOnLot: 47,
    due: 'This week', createdAt: '2026-03-28T11:30:00Z',
    reason: '3-row SUV + $650/mo budget matches a Tahoe on lot 47 days. Moves aging inventory and protects margin.',
    opener: 'James wants a 3-row SUV for under $650/mo. The Tahoe LT has been on lot 47 days — use that as a lever. Lead with availability and what you can do today.',
    action: 'reach',
  },
  {
    id: '5', type: 'standard', priority: 'NORMAL', initials: 'KP', name: 'Kevin Park',
    phone: '+1 (555) 219-8830', stageLabel: 'Talking Numbers', stageCls: 'hot',
    vehicle: '2023 Honda Accord Sport', category: 'New', price: '$30,400', daysOnLot: null,
    due: 'Today', createdAt: '2026-04-02T16:45:00Z',
    reason: 'Asked to speak directly. Wants to discuss trade-in — 2019 Accord, ~$8K equity. Come prepared.',
    opener: 'Kevin asked to talk directly. He wants to discuss trade-in — 2019 Accord, ~$8K equity. Have KBB pulled up before the call.',
    action: 'call',
  },
  {
    id: '6', type: 'high-value', priority: 'HIGH', initials: 'FA', name: 'Fleet Auto Group',
    phone: '+1 (555) 730-1100', stageLabel: 'Talking Numbers', stageCls: 'hot',
    vehicle: '2024 Ford Transit 150', category: 'New', price: '$46,000', daysOnLot: null,
    due: 'Today', createdAt: '2026-04-03T07:00:00Z',
    reason: 'Fleet inquiry — 12 commercial vehicles. Wants a dedicated contact. Don\'t delegate this one.',
    opener: 'Fleet inquiry for 12 commercial vehicles. They want a dedicated point of contact — don\'t hand this off. Have fleet pricing and financing ready.',
    action: 'context',
  },
]

const OUTCOMES = ['Appointment set', 'VM left', 'Needs follow-up', 'Not interested']

const OUTCOME_BADGE = {
  'Appointment set': 'spyne-badge-success',
  'VM left':         'spyne-badge-warning',
  'Needs follow-up': 'spyne-badge-info',
  'Not interested':  'spyne-badge-neutral',
}

const OUTCOME_LABEL = {
  'Appointment set': '✓ Appt Set',
  'VM left':         '✓ VM Left',
  'Needs follow-up': '✓ Follow-up',
  'Not interested':  '✓ Not Interested',
}

const PRIORITY_CONFIG = {
  HIGH:   { dot: SPYNE.error, label: 'High',   order: 0 },
  MEDIUM: { dot: SPYNE.warningInk, label: 'Med',    order: 1 },
  NORMAL: { dot: SPYNE.textSecondary, label: 'Normal', order: 2 },
}

const STAGE_TEMP_BADGE = {
  hot:  'spyne-badge-brand',
  warm: 'spyne-badge-warning',
  cool: 'spyne-badge-neutral',
}

function StageBadge({ label, cls }) {
  const variant = STAGE_TEMP_BADGE[cls] || STAGE_TEMP_BADGE.cool
  return <span className={cn('spyne-badge', variant)}>{label}</span>
}

function TypeBadge({ type }) {
  if (type === 'urgent')     return <span className="spyne-badge spyne-badge-warning"><MaterialSymbol name="bolt" size={9} />Re-engaged</span>
  if (type === 'lot-match')  return <span className="spyne-badge spyne-badge-info"><MaterialSymbol name="inventory_2" size={9} />Lot Match</span>
  if (type === 'high-value') return <span className="spyne-badge spyne-badge-brand"><MaterialSymbol name="star" size={9} />High Value</span>
  if (type === 'appointment') return <span className="spyne-badge spyne-badge-neutral"><MaterialSymbol name="event" size={9} />Appointment</span>
  return null
}

function ActionButton({ action, onClick }) {
  const configs = {
    call:    { label: 'Call Now',        icon: <MaterialSymbol name="phone" size={12} />,        cls: 'spyne-btn-primary' },
    convo:   { label: 'Pick Up Convo',   icon: <MaterialSymbol name="chat" size={12} />,         cls: 'spyne-btn-secondary' },
    prep:    { label: 'View Prep',       icon: <MaterialSymbol name="visibility" size={12} />,   cls: 'spyne-btn-secondary' },
    reach:   { label: 'Reach Out',       icon: <MaterialSymbol name="arrow_forward" size={12} />, cls: 'spyne-btn-secondary' },
    context: { label: 'View Context',    icon: <MaterialSymbol name="visibility" size={12} />,   cls: 'spyne-btn-ghost' },
  }
  const { label, icon, cls } = configs[action]
  return (
    <button className={cls} onClick={(e) => { e.stopPropagation(); onClick() }}>
      {icon}{label}
    </button>
  )
}

function QueueCard({ card, isActive, onOpen, resolved, outcome }) {
  const accentBorder = {
    'urgent':     '3px solid var(--spyne-warning)',
    'lot-match':  '3px solid var(--spyne-info)',
    'high-value': '3px solid var(--spyne-brand)',
  }[card.type]

  if (resolved) {
    return (
      <div className="spyne-card flex flex-col" style={{ opacity: 0.75 }}>
        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'var(--spyne-success)', color: '#fff' }}>✓</div>
              <span className="spyne-label truncate" style={{ color: 'var(--spyne-text-primary)' }}>{card.name}</span>
            </div>
            <span className={`spyne-badge ${OUTCOME_BADGE[outcome]}`}>{OUTCOME_LABEL[outcome]}</span>
          </div>
          <div style={{ marginLeft: 40 }}><StageBadge label={card.stageLabel} cls={card.stageCls} /></div>
          <div className="flex items-center gap-1.5 flex-wrap" style={{ fontSize: 12, color: 'var(--spyne-text-muted)' }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--spyne-success)', marginTop: 1 }} />
            <span style={{ fontWeight: 500, color: 'var(--spyne-text-secondary)' }}>{card.vehicle}</span>
            <span style={{ color: 'var(--spyne-border-strong)' }}>·</span>
            <span>{card.category}</span>
            <span style={{ color: 'var(--spyne-border-strong)' }}>·</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{card.price}</span>
          </div>
        </div>
        <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--spyne-border)' }}>
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
            Logged {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · <strong style={{ color: 'var(--spyne-text-secondary)', fontWeight: 500 }}>Dravid Roy</strong>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`spyne-card-interactive flex flex-col${isActive ? ' active-action-card' : ''}`}
      style={accentBorder ? { borderLeft: accentBorder } : {}}
      onClick={onOpen}
    >
      <div className="flex flex-col gap-2 flex-1" style={{ padding: accentBorder ? '14px 14px 10px 12px' : '14px 14px 10px' }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)' }}>
              {card.initials}
            </div>
            <span className="spyne-label truncate" style={{ color: 'var(--spyne-text-primary)' }}>{card.name}</span>
          </div>
          <TypeBadge type={card.type} />
        </div>
        <div style={{ marginLeft: 40 }}><StageBadge label={card.stageLabel} cls={card.stageCls} /></div>
        <div className="flex items-center gap-1.5 flex-wrap" style={{ fontSize: 12, color: 'var(--spyne-text-secondary)' }}>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--spyne-success)', marginTop: 1 }} />
          <span style={{ fontWeight: 600, color: 'var(--spyne-text-primary)' }}>{card.vehicle}</span>
          <span style={{ color: 'var(--spyne-border-strong)' }}>·</span>
          <span>{card.category}</span>
          <span style={{ color: 'var(--spyne-border-strong)' }}>·</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{card.price}</span>
          {card.daysOnLot && (
            <>
              <span style={{ color: 'var(--spyne-border-strong)' }}>·</span>
              <span style={{ fontWeight: 600, color: 'var(--spyne-warning-text)' }}>{card.daysOnLot} days on lot ⚠</span>
            </>
          )}
        </div>
        {card.apptTime && (
          <div className="flex items-center gap-1.5" style={{ fontSize: 11, fontWeight: 600, color: 'var(--spyne-warning-text)' }}>
            <MaterialSymbol name="event" size={11} />{card.apptTime}
          </div>
        )}
        <p className="spyne-body-sm flex-1" style={{ color: 'var(--spyne-text-secondary)' }}>{card.reason}</p>
      </div>
      <div
        className="flex items-center justify-end border-t"
        style={{ borderColor: 'var(--spyne-border)', padding: accentBorder ? '10px 14px 10px 12px' : '10px 14px' }}
      >
        <ActionButton action={card.action} onClick={onOpen} />
      </div>
    </div>
  )
}

function TableView({ queue, onOpen, onMarkDone }) {
  const [sortKey, setSortKey] = useState('priority')

  const sorted = [...queue].sort((a, b) => {
    if (sortKey === 'priority') return PRIORITY_CONFIG[a.priority].order - PRIORITY_CONFIG[b.priority].order
    if (sortKey === 'due') return a.due.localeCompare(b.due)
    return 0
  })

  return (
    <div className="spyne-card overflow-hidden">
      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--spyne-border)', background: 'var(--spyne-bg)' }}>
              {[
                { key: 'priority', label: 'Priority' },
                { key: null,       label: 'Type' },
                { key: null,       label: 'Customer' },
                { key: null,       label: 'Vehicle' },
                { key: null,       label: 'Action Required' },
                { key: 'due',      label: 'Due' },
                { key: null,       label: 'Stage' },
                { key: null,       label: '' },
              ].map(({ key, label }) => (
                <th
                  key={label}
                  onClick={() => key && setSortKey(key)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    color: sortKey === key ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
                    cursor: key ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                >
                  {label}{sortKey === key ? ' ↓' : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((card, i) => {
              const pc = PRIORITY_CONFIG[card.priority]
              return (
                <tr
                  key={card.id}
                  onClick={() => onOpen(card)}
                  style={{
                    borderBottom: '1px solid var(--spyne-border)',
                    background: i % 2 === 0 ? 'var(--spyne-surface)' : 'var(--spyne-bg)',
                    cursor: 'pointer',
                    transition: 'background 100ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--spyne-brand-subtle)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? 'var(--spyne-surface)' : 'var(--spyne-bg)' }}
                >
                  {/* Priority */}
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <div className="flex items-center gap-1.5">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: pc.dot, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: pc.dot }}>{pc.label}</span>
                    </div>
                  </td>
                  {/* Type */}
                  <td style={{ padding: '10px 14px' }}><TypeBadge type={card.type} /></td>
                  {/* Customer */}
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)' }}>
                        {card.initials}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>{card.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--spyne-text-muted)' }}>{card.phone}</div>
                      </div>
                    </div>
                  </td>
                  {/* Vehicle */}
                  <td style={{ padding: '10px 14px', minWidth: 160 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--spyne-text-primary)' }}>{card.vehicle}</div>
                    <div className="flex items-center gap-1.5" style={{ marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: 'var(--spyne-text-muted)', fontVariantNumeric: 'tabular-nums' }}>{card.price}</span>
                      {card.daysOnLot && (
                        <span style={{ fontSize: 11, color: 'var(--spyne-warning-text)', fontWeight: 600 }}>⚠ {card.daysOnLot}d on lot</span>
                      )}
                    </div>
                  </td>
                  {/* Action Required */}
                  <td style={{ padding: '10px 14px', maxWidth: 220 }}>
                    <p style={{ fontSize: 12, color: 'var(--spyne-text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {card.reason}
                    </p>
                  </td>
                  {/* Due */}
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: card.due === 'Today' ? 'var(--spyne-brand)' : 'var(--spyne-text-secondary)' }}>
                      {card.due}
                    </span>
                  </td>
                  {/* Stage */}
                  <td style={{ padding: '10px 14px' }}>
                    <StageBadge label={card.stageLabel} cls={card.stageCls} />
                  </td>
                  {/* Actions */}
                  <td style={{ padding: '10px 14px' }} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <a href={`tel:${card.phone.replace(/\D/g, '')}`} className="spyne-btn-ghost" style={{ padding: '4px 8px', height: 28 }} aria-label="Call">
                        <MaterialSymbol name="phone" size={12} />
                      </a>
                      <button className="spyne-btn-ghost" style={{ padding: '4px 8px', height: 28 }} aria-label="Message">
                        <MaterialSymbol name="chat" size={12} />
                      </button>
                      <button
                        className="spyne-btn-ghost"
                        style={{ padding: '4px 8px', height: 28, fontSize: 11, whiteSpace: 'nowrap', color: 'var(--spyne-success-text)' }}
                        onClick={() => onMarkDone?.(card.id)}
                        aria-label="Mark done"
                      >
                        ✓ Done
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SwimlaneView({ queue, onOpen }) {
  const groups = [
    { key: 'HIGH',   label: 'High Priority',  color: SPYNE.error, bg: SPYNE_SOFT_BG.error, border: SPYNE_SOFT_BG.errorBorder },
    { key: 'MEDIUM', label: 'Medium',          color: SPYNE.warningInk, bg: SPYNE_SOFT_BG.warning, border: SPYNE_SOFT_BG.warningBorder },
    { key: 'NORMAL', label: 'Normal',          color: SPYNE.textSecondary, bg: 'var(--spyne-bg)', border: 'var(--spyne-border)' },
  ]

  return (
    <div className="space-y-6">
      {groups.map(({ key, label, color, bg, border }) => {
        const cards = queue.filter((c) => c.priority === key)
        if (cards.length === 0) return null
        return (
          <div key={key}>
            <div
              className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg"
              style={{ background: bg, border: `1px solid ${border}`, borderLeft: `4px solid ${color}` }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
              <span
                style={{
                  minWidth: 20, height: 20, borderRadius: 'var(--spyne-radius-pill)',
                  padding: '0 6px', background: color, color: '#fff',
                  fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {cards.length}
              </span>
            </div>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {cards.map((card) => (
                <QueueCard key={card.id} card={card} isActive={false} onOpen={() => onOpen(card)} resolved={false} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Panel({ card, onClose, onSave }) {
  const [selected, setSelected] = useState(null)
  if (!card) return null

  return (
    <>
      <div className="fixed inset-0" style={{ background: 'rgba(15,23,42,0.25)', zIndex: 59 }} onClick={onClose} />
      <div
        className="fixed bottom-0 right-0 flex flex-col"
        style={{
          top: 0,
          width: 420,
          background: 'var(--spyne-surface)',
          borderLeft: '1px solid var(--spyne-border)',
          boxShadow: SPYNE_DRAWER_SHADOW,
          zIndex: 60,
          overflowY: 'auto',
        }}
      >
        <div className="flex flex-col gap-2 p-4" style={{ borderBottom: '1px solid var(--spyne-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)' }}>
              {card.initials}
            </div>
            <span className="spyne-heading flex-1" style={{ fontSize: 15 }}>{card.name}</span>
            <button
              className="spyne-btn-ghost"
              style={{ width: 28, height: 28, padding: 0, border: '1px solid var(--spyne-border)' }}
              onClick={onClose} aria-label="Close"
            >
              <MaterialSymbol name="close" size={13} />
            </button>
          </div>
          <div className="spyne-caption" style={{ marginLeft: 42, color: 'var(--spyne-text-secondary)' }}>{card.phone}</div>
          <div style={{ marginLeft: 42 }}><StageBadge label={card.stageLabel} cls={card.stageCls} /></div>
        </div>

        <div className="p-4" style={{ borderBottom: '1px solid var(--spyne-border)' }}>
          <div style={{
            borderLeft: '3px solid var(--spyne-brand)',
            borderTop: '1px solid var(--spyne-brand-muted)',
            borderRight: '1px solid var(--spyne-brand-muted)',
            borderBottom: '1px solid var(--spyne-brand-muted)',
            borderRadius: 'var(--spyne-radius-md)',
            background: 'var(--spyne-brand-subtle)',
            padding: '12px 14px',
          }}>
            <div className="flex items-center gap-1.5 mb-2"
              style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--spyne-brand)' }}>
              <MaterialSymbol name="auto_awesome" size={11} />Lead with this
            </div>
            <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-primary)', lineHeight: 1.6 }}>{card.opener}</p>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-2" style={{ borderBottom: '1px solid var(--spyne-border)' }}>
          <a href={`tel:${card.phone.replace(/\D/g, '')}`} className="spyne-btn-primary w-full justify-center" style={{ height: 40 }}>
            <MaterialSymbol name="phone" size={14} />Call Now
          </a>
          <button className="spyne-btn-secondary w-full justify-center" style={{ height: 38 }}>
            View Full Profile<MaterialSymbol name="arrow_forward" size={12} />
          </button>
        </div>

        <div className="p-4">
          <p className="spyne-subheading mb-3">Log what happened</p>
          <div className="flex flex-col gap-2">
            {OUTCOMES.map((o) => (
              <div
                key={o} onClick={() => setSelected(o)}
                className="flex items-center gap-3 px-3 py-3 cursor-pointer"
                style={{
                  borderRadius: 'var(--spyne-radius-md)',
                  border: selected === o ? '1.5px solid var(--spyne-brand)' : '1.5px solid var(--spyne-border)',
                  background: selected === o ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)',
                  transition: 'all 150ms',
                }}
              >
                <div style={{
                  width: 15, height: 15, borderRadius: '50%', flexShrink: 0,
                  border: selected === o ? '4.5px solid var(--spyne-brand)' : '1.5px solid var(--spyne-border-strong)',
                  transition: 'all 150ms',
                }} />
                <span className="spyne-label" style={{ color: selected === o ? 'var(--spyne-brand)' : 'var(--spyne-text-secondary)', fontWeight: selected === o ? 600 : 500 }}>
                  {o}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button
              className="spyne-btn-primary"
              style={{ opacity: selected ? 1 : 0.35, pointerEvents: selected ? 'auto' : 'none' }}
              onClick={() => { if (selected) onSave(selected) }}
            >
              Save outcome<MaterialSymbol name="arrow_forward" size={12} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function ActionItemsPage({ sidebarCollapsed, department = 'sales' }) {
  const isService = department === 'service'
  const baseQueue = isService ? SERVICE_ACTION_QUEUE : QUEUE
  const [activeTab, setActiveTab]   = useState('act')
  const [view, setView]             = useState('table')
  const [activeCard, setActiveCard] = useState(null)
  const [filter, setFilter]         = useState('All')
  const [resolvedIds, setResolvedIds] = useState(new Set())
  const [actQueue, setActQueue]     = useState(baseQueue)
  const [doneQueue, setDoneQueue]   = useState([])
  const [toast, setToast]           = useState(null)

  const sourceQueue = isService ? SERVICE_ACTION_QUEUE : QUEUE

  // Auto-archive: items older than 3 days not yet resolved
  const archivedItems = useMemo(
    () => sourceQueue.filter(c => daysSince(c.createdAt) > 3 && !resolvedIds.has(c.id)),
    [resolvedIds, sourceQueue]
  )
  const archivedIds = useMemo(() => new Set(archivedItems.map(c => c.id)), [archivedItems])

  function openPanel(card) { setActiveCard(card) }
  function closePanel()    { setActiveCard(null) }

  function markDone(id) {
    const card = actQueue.find(c => c.id === id)
    if (!card) return
    setResolvedIds(s => new Set([...s, id]))
    setActQueue(q => q.filter(c => c.id !== id))
    setDoneQueue(d => [{ ...card, outcome: 'Marked done' }, ...d])
    setToast('Marked as done')
    setTimeout(() => setToast(null), 3200)
  }

  function saveOutcome(outcome) {
    const card = activeCard
    setResolvedIds(s => new Set([...s, card.id]))
    setActQueue(q => q.filter(c => c.id !== card.id))
    setDoneQueue(d => [{ ...card, outcome }, ...d])
    closePanel()
    setToast('Outcome logged — moved to Done Today')
    setTimeout(() => setToast(null), 3200)
  }

  // Active queue excludes archived items
  const activeQueue = actQueue.filter(c => !archivedIds.has(c.id))

  const filtered = (list) => {
    if (isService) {
      if (filter === SERVICE_CONSOLE_TAB_CONTENT.actionItems.filterExpress) {
        return list.filter((c) => c.category === 'Express')
      }
      if (filter === SERVICE_CONSOLE_TAB_CONTENT.actionItems.filterMainShop) {
        return list.filter((c) => c.category === 'Main shop')
      }
      return list
    }
    if (filter === 'New') return list.filter((c) => c.category === 'New')
    if (filter === 'Used') return list.filter((c) => c.category === 'Used')
    return list
  }

  return (
    <div className={spyneSalesLayout.pageStack}>
      {/* Sticky page header — matches Appointments / Leads */}
      <div
        className={cn(
          'sticky z-[30] -mx-max2-page bg-spyne-page px-max2-page pb-3 pt-4',
          'top-[6rem] lg:top-10',
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className={max2Classes.pageTitle}>Action Items</h1>
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-spyne-primary px-1.5 text-[11px] font-bold leading-none text-white">
                {activeQueue.length}
              </span>
            </div>
            <p className={`${max2Classes.pageDescription} mt-0.5`}>
              {isService
                ? SERVICE_CONSOLE_TAB_CONTENT.actionItems.pageDescription
                : 'Prioritized queue, outcomes, and daily follow-ups'}
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            <SpyneSegmentedControl aria-label="Action items layout" className="shrink-0">
              <SpyneSegmentedButton active={view === 'table'} onClick={() => setView('table')}>
                <MaterialSymbol name="view_list" size={14} aria-hidden />
                Table
              </SpyneSegmentedButton>
              <SpyneSegmentedButton active={view === 'cards'} onClick={() => setView('cards')}>
                <MaterialSymbol name="view_column" size={14} aria-hidden />
                Cards
              </SpyneSegmentedButton>
            </SpyneSegmentedControl>

            {['Intent', 'Priority'].map((f) => (
              <button key={f} type="button" className="spyne-pill h-[30px] text-xs">
                {f}{' '}
                <span className="text-[10px] text-spyne-text-secondary">▾</span>
              </button>
            ))}
            <SpyneSegmentedControl
              aria-label={isService ? SERVICE_CONSOLE_TAB_CONTENT.actionItems.pageDescription : 'Vehicle category'}
              className="shrink-0"
            >
              {(isService
                ? [
                    SERVICE_CONSOLE_TAB_CONTENT.actionItems.filterAll,
                    SERVICE_CONSOLE_TAB_CONTENT.actionItems.filterExpress,
                    SERVICE_CONSOLE_TAB_CONTENT.actionItems.filterMainShop,
                  ]
                : ['All', 'New', 'Used']
              ).map((f) => (
                <SpyneSegmentedButton key={f} active={filter === f} onClick={() => setFilter(f)}>
                  {f}
                </SpyneSegmentedButton>
              ))}
            </SpyneSegmentedControl>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <SpyneLineTabStrip>
        {[
          { id: 'act',      label: 'To Act On',  count: activeQueue.length },
          { id: 'done',     label: 'Done Today',  count: doneQueue.length },
          { id: 'archived', label: 'Archived',    count: archivedItems.length },
        ].map((tab) => (
          <SpyneLineTab
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => { setActiveTab(tab.id); closePanel() }}
          >
            {tab.label}
            <SpyneLineTabBadge>{tab.count}</SpyneLineTabBadge>
          </SpyneLineTab>
        ))}
      </SpyneLineTabStrip>

      {/* To Act On */}
      {activeTab === 'act' && (
        filtered(activeQueue).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <div style={{ width: 52, height: 52, borderRadius: 'var(--spyne-radius-lg)', background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialSymbol name="auto_awesome" size={22} />
            </div>
            <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-secondary)' }}>Queue is clear</p>
            <p className="spyne-body-sm" style={{ maxWidth: 260 }}>Vini is working the leads. When one is ready for a human touch, it'll show up here.</p>
          </div>
        ) : view === 'table' ? (
          <TableView queue={filtered(activeQueue)} onOpen={openPanel} onMarkDone={markDone} />
        ) : (
          <SwimlaneView queue={filtered(activeQueue)} onOpen={openPanel} />
        )
      )}

      {/* Done Today */}
      {activeTab === 'done' && (
        doneQueue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <div style={{ width: 52, height: 52, borderRadius: 'var(--spyne-radius-lg)', background: 'var(--spyne-success-subtle)', color: 'var(--spyne-success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              ✓
            </div>
            <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-secondary)' }}>Nothing logged yet</p>
            <p className="spyne-body-sm" style={{ maxWidth: 260 }}>When you log an outcome on a lead, it shows up here. Vini keeps working the rest.</p>
          </div>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {filtered(doneQueue).map(card => (
              <QueueCard key={card.id} card={card} isActive={false} onOpen={() => {}} resolved={true} outcome={card.outcome} />
            ))}
          </div>
        )
      )}

      {/* Archived */}
      {activeTab === 'archived' && (
        archivedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <div style={{ width: 52, height: 52, borderRadius: 'var(--spyne-radius-lg)', background: 'var(--spyne-border)', color: 'var(--spyne-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialSymbol name="archive" size={22} />
            </div>
            <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-secondary)' }}>No archived items</p>
            <p className="spyne-body-sm" style={{ maxWidth: 260 }}>Items that go unresolved for more than 3 days are automatically archived here.</p>
          </div>
        ) : (
          <div>
            <div
              className="flex items-center gap-2 mb-4 px-3 py-3 rounded-[8px]"
              style={{ background: 'var(--spyne-warning-subtle)', border: '1px solid var(--spyne-warning-border)' }}
            >
              <MaterialSymbol name="archive" size={13} style={{ color: 'var(--spyne-warning-text)', flexShrink: 0 }} />
              <p className="spyne-caption" style={{ color: 'var(--spyne-warning-text)' }}>
                Items auto-archive after 3 days to keep your queue actionable. These are read-only.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {archivedItems.map(card => {
                const archivedDate = new Date(card.createdAt)
                archivedDate.setDate(archivedDate.getDate() + 3)
                const dateLabel = archivedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                return (
                  <div
                    key={card.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg"
                    style={{ background: 'var(--spyne-surface)', border: '1px solid var(--spyne-border)', opacity: 0.75 }}
                  >
                    <div
                      className="flex items-center justify-center font-bold text-xs shrink-0"
                      style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--spyne-border)', color: 'var(--spyne-text-muted)' }}
                    >
                      {card.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="spyne-label" style={{ color: 'var(--spyne-text-secondary)' }}>{card.name}</span>
                      <span className="spyne-caption ml-2" style={{ color: 'var(--spyne-text-muted)' }}>{card.vehicle}</span>
                    </div>
                    <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)', whiteSpace: 'nowrap' }}>
                      Archived {dateLabel}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      )}

      <Panel card={activeCard} onClose={closePanel} onSave={saveOutcome} />

      {toast && (
        <div
          className="fixed flex items-center gap-2 spyne-label"
          style={{
            bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--spyne-text-primary)', color: '#fff',
            padding: '10px 18px', borderRadius: 'var(--spyne-radius-md)',
            boxShadow: 'var(--spyne-shadow-lg)', zIndex: 200, whiteSpace: 'nowrap',
          }}
        >
          ✓ {toast}
        </div>
      )}
    </div>
  )
}
