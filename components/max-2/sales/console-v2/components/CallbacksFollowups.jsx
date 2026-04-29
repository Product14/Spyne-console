"use client"

import { useState } from 'react'
import { MaterialSymbol } from '@/components/max-2/material-symbol'
import { SpyneLineTab, SpyneLineTabBadge, SpyneLineTabStrip } from '@/components/max-2/spyne-line-tabs'
import { spyneComponentClasses } from '@/lib/design-system/max-2'

const ACTION_BADGE = {
  'Callback Today':    'spyne-badge-warning',
  'Human Requested':   'spyne-badge-danger',
  'AI Escalated':      'spyne-badge-info',
}

export default function CallbacksFollowups({ data }) {
  const [activeTab, setActiveTab] = useState('needsAttention')
  const [resolved, setResolved] = useState([])
  const [expanded, setExpanded] = useState({})

  const items = (data[activeTab] ?? []).filter((item) => !resolved.includes(item.id))

  const toggleExpanded = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="spyne-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <span className={spyneComponentClasses.cardTitle}>Callbacks &amp; Followups</span>
          <MaterialSymbol name="info" size={13} style={{ color: 'var(--spyne-text-muted)' }} />
        </div>
        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Last 7 days</span>
      </div>

      {/* Tabs */}
      <SpyneLineTabStrip bleed compact tight>
        {[
          { id: 'needsAttention', label: 'Needs Attention', count: (data.needsAttention ?? []).filter(x => !resolved.includes(x.id)).length },
          { id: 'completed',      label: 'Completed',       count: resolved.length },
        ].map((tab) => (
          <SpyneLineTab key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
            {tab.count > 0 ? <SpyneLineTabBadge>{tab.count}</SpyneLineTabBadge> : null}
          </SpyneLineTab>
        ))}
      </SpyneLineTabStrip>

      {/* Lead cards */}
      <div className="space-y-3">
        {activeTab === 'needsAttention' && items.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            isExpanded={!!expanded[lead.id]}
            onToggleExpand={() => toggleExpanded(lead.id)}
            onResolve={() => setResolved((prev) => [...prev, lead.id])}
          />
        ))}
        {activeTab === 'completed' && resolved.length === 0 && (
          <div className="text-center py-6 spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
            No resolved items yet
          </div>
        )}
        {activeTab === 'needsAttention' && items.length === 0 && (
          <div className="text-center py-6 spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
            All caught up
          </div>
        )}
      </div>

      {/* Footer */}
      {data.totalOpenConversations > 0 && (
        <div
          className="flex justify-end mt-4 pt-4"
          style={{ borderTop: '1px solid var(--spyne-border)' }}
        >
          <button
            className="flex items-center gap-1 cursor-pointer"
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <span className="spyne-label" style={{ color: 'var(--spyne-brand)', fontWeight: 600 }}>
              View all {data.totalOpenConversations} open conversations
            </span>
            <MaterialSymbol name="arrow_forward" size={11} style={{ color: 'var(--spyne-brand)' }} />
          </button>
        </div>
      )}
    </div>
  )
}

function LeadCard({ lead, isExpanded, onToggleExpand, onResolve }) {
  const visibleEvents = isExpanded ? lead.events : lead.events.slice(0, 1)

  return (
    <div
      className="p-4"
      style={{
        border: '1px solid var(--spyne-border)',
        borderRadius: 'var(--spyne-radius-md)',
        background: 'var(--spyne-surface)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`${lead.color} w-8 h-8 text-white flex items-center justify-center shrink-0`}
          style={{ borderRadius: '50%', fontSize: 11, fontWeight: 700 }}
        >
          {lead.initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="spyne-label" style={{ color: 'var(--spyne-text-primary)', fontWeight: 700 }}>{lead.name}</span>
              <span className="spyne-caption ml-2" style={{ color: 'var(--spyne-text-muted)' }}>
                Last interacted {lead.lastInteracted}
              </span>
            </div>
            <span className={`spyne-badge shrink-0 ${ACTION_BADGE[lead.actionType] || 'spyne-badge-neutral'}`}>
              {lead.actionType}
            </span>
          </div>

          {/* Timeline */}
          <div className="mt-2.5 space-y-2">
            {visibleEvents.map((event, i) => (
              <div key={i} className="flex items-start gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ background: 'var(--spyne-border-strong)' }}
                />
                <div className="spyne-caption" style={{ color: 'var(--spyne-text-secondary)' }}>
                  <span style={{ color: 'var(--spyne-text-primary)', fontWeight: 600 }}>{event.actor}</span>
                  {' '}{event.action}
                  {event.subject && (
                    <span style={{ color: 'var(--spyne-text-muted)' }}> · &quot;{event.subject}&quot;</span>
                  )}
                  <span style={{ color: 'var(--spyne-text-muted)' }}> · {event.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Expand / collapse */}
          {lead.moreEvents > 0 && (
            <button
              onClick={onToggleExpand}
              className="flex items-center gap-1 mt-2 cursor-pointer"
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--spyne-brand)' }}
            >
              <MaterialSymbol
                name="expand_more"
                size={11}
                style={{ transition: 'transform 150ms', transform: isExpanded ? 'rotate(180deg)' : 'none' }}
              />
              <span className="spyne-caption" style={{ color: 'var(--spyne-brand)', fontWeight: 600 }}>
                {isExpanded ? 'Show less' : `Show ${lead.moreEvents} more events`}
              </span>
            </button>
          )}
        </div>

        {/* Resolve button */}
        <button
          onClick={onResolve}
          className="spyne-btn-secondary shrink-0 cursor-pointer"
          style={{
            height: 28,
            padding: '0 12px',
            fontSize: 11,
            color: 'var(--spyne-danger)',
            borderColor: 'var(--spyne-danger-muted)',
            background: 'var(--spyne-danger-subtle)',
          }}
        >
          Resolve
        </button>
      </div>
    </div>
  )
}
