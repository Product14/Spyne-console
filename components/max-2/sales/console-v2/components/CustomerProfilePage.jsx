"use client"

import { MaterialSymbol } from '@/components/max-2/material-symbol'
import { max2Classes, spyneSalesLayout } from '@/lib/design-system/max-2'
import { cn } from '@/lib/utils'
import { customersData, serviceLeadsData } from '../mockData'
import { SERVICE_CONSOLE_TAB_CONTENT } from '@/lib/max-2/service-console-tab-content'
import ConversationThread from './ConversationThread'

const STAGE_LABELS = {
  RESEARCH:    'Just Looking',
  SHOPPING:    'Comparing Options',
  EVALUATION:  'Ready to Visit',
  NEGOTIATION: 'Talking Numbers',
  CLOSING:     'Ready to Buy',
}

const STAGE_BADGE_CLASS = {
  CLOSING:     'spyne-badge-brand',
  NEGOTIATION: 'spyne-badge-brand',
  EVALUATION:  'spyne-badge-warning',
  SHOPPING:    'spyne-badge-neutral',
  RESEARCH:    'spyne-badge-neutral',
}

const SOURCE_BADGE_CLASS = {
  'Internet Lead': 'spyne-badge-info',
  'Phone Lead':    'spyne-badge-success',
  'Email Lead':    'spyne-badge-brand',
  'Walk-in':       'spyne-badge-warning',
  'Referral':      'spyne-badge-neutral',
  'Online Scheduler': 'spyne-badge-info',
  'Service Campaign': 'spyne-badge-brand',
}

function StageBadge({ stage, labelOverride }) {
  const cls = STAGE_BADGE_CLASS[stage] || STAGE_BADGE_CLASS.RESEARCH
  return <span className={cn('spyne-badge', cls)}>{labelOverride || STAGE_LABELS[stage]}</span>
}

function EngagementSignal({ trend, detail }) {
  const iconName = trend === 'improving' ? 'trending_up' : trend === 'cooling' ? 'trending_down' : 'remove'
  const color = trend === 'improving' ? 'var(--spyne-success-text)' : trend === 'cooling' ? 'var(--spyne-danger-text)' : 'var(--spyne-text-muted)'
  const bg    = trend === 'improving' ? 'var(--spyne-success-subtle)' : trend === 'cooling' ? 'var(--spyne-danger-subtle)' : 'var(--spyne-border)'

  return (
    <div
      className="flex items-start gap-2 rounded-[8px] px-3 py-2.5"
      style={{ background: bg }}
    >
      <MaterialSymbol name={iconName} size={13} style={{ color, flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 12, color, lineHeight: 1.45 }}>{detail}</span>
    </div>
  )
}

export default function CustomerProfilePage({ customerId, onBack, department = 'sales' }) {
  const isService = department === 'service'
  const roster = isService ? serviceLeadsData : customersData
  const customer = roster.find((c) => c.id === customerId)

  if (!customer) {
    return (
      <div className="flex min-h-[240px] items-center justify-center py-16">
        <p className="spyne-body text-spyne-text-secondary">
          {isService ? SERVICE_CONSOLE_TAB_CONTENT.customerProfile.notFound : 'Customer not found.'}
        </p>
      </div>
    )
  }

  const srcCls = SOURCE_BADGE_CLASS[customer.source] || SOURCE_BADGE_CLASS.Referral

  return (
    <div className={cn('spyne-animate-fade-in', spyneSalesLayout.pageStack)}>

      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
        <button type="button" onClick={onBack} className="spyne-btn-ghost h-9">
          <MaterialSymbol name="arrow_back" size={14} />
          {isService ? SERVICE_CONSOLE_TAB_CONTENT.customerProfile.backToList : 'All Customers'}
        </button>
        <a
          href={`tel:${customer.phone.replace(/\D/g, '')}`}
          className="spyne-btn-primary h-9 no-underline"
        >
          <MaterialSymbol name="phone" size={13} />
          Call Now
        </a>
      </div>

      {/* ── Two-pane layout ── */}
      <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>

        {/* LEFT PANE */}
        <div
          style={{
            width: '52%',
            paddingRight: 28,
            borderRight: '1px solid var(--spyne-border)',
            position: 'sticky',
            top: 172,
            maxHeight: 'calc(100vh - 172px)',
            overflowY: 'auto',
          }}
        >
          <div style={{ paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Identity */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div
                className={`${customer.avatarColor} flex items-center justify-center rounded-full text-white font-bold flex-shrink-0`}
                style={{ width: 48, height: 48, fontSize: 15 }}
              >
                {customer.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 className={max2Classes.pageTitle}>{customer.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                  <a
                    href={`tel:${customer.phone.replace(/\D/g, '')}`}
                    style={{ fontSize: 12, color: 'var(--spyne-text-secondary)', textDecoration: 'none' }}
                  >
                    {customer.phone}
                  </a>
                  {customer.email && (
                    <span style={{ fontSize: 12, color: 'var(--spyne-text-muted)' }}>· {customer.email}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  <StageBadge
                    stage={customer.buyingStage}
                    labelOverride={isService ? customer.serviceStageLabel : undefined}
                  />
                  <span className={cn('spyne-badge', srcCls)}>
                    {customer.source}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--spyne-text-muted)' }}>{customer.salesperson}</span>
                </div>
              </div>
            </div>

            {/* Engagement signal */}
            <EngagementSignal trend={customer.engagementTrend} detail={customer.engagementDetail} />

            {/* Stage progression */}
            {customer.stageHistory && customer.stageHistory.length > 1 && (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                  {[...customer.stageHistory].reverse().map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {i > 0 && <MaterialSymbol name="chevron_right" size={10} style={{ color: 'var(--spyne-text-muted)' }} />}
                      <StageBadge stage={t.stage} labelOverride={t.label} />
                    </div>
                  ))}
                </div>
                <p
                  style={{ fontSize: 11, color: 'var(--spyne-text-muted)', marginTop: 4, fontWeight: 500 }}
                >
                  Updated {customer.stageHistory[0].timestamp} · by {customer.stageHistory[0].source}
                </p>
              </div>
            )}

            {/* Next appointment */}
            {customer.nextAppointment && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  background: 'var(--spyne-warning-subtle)',
                  border: '1px solid var(--spyne-warning-muted)',
                  borderRadius: 12,
                }}
              >
                <MaterialSymbol name="event" size={13} style={{ color: 'var(--spyne-warning)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--spyne-warning-text)' }}>
                    {customer.nextAppointment.type}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--spyne-text-muted)' }}>
                    {customer.nextAppointment.date}
                  </p>
                </div>
              </div>
            )}

            {/* Action items */}
            {customer.actionItems && customer.actionItems.length > 0 && (
              <div
                style={{
                  padding: '12px 14px',
                  background: 'var(--spyne-surface)',
                  border: '1px solid var(--spyne-border)',
                  borderRadius: 12,
                }}
              >
                <p className="spyne-subheading" style={{ marginBottom: 8 }}>Action Items</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {customer.actionItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--spyne-brand)', marginTop: 1, flexShrink: 0 }}>•</span>
                      <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--spyne-text-secondary)' }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buyer intent */}
            <div
              style={{
                padding: '14px 14px',
                background: 'var(--spyne-surface)',
                border: '1px solid var(--spyne-border)',
                borderRadius: 12,
              }}
            >
              <p className="spyne-subheading" style={{ marginBottom: 10 }}>Buyer Intent</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                {customer.budget && (
                  <div>
                    <p className="spyne-caption">Budget</p>
                    <p className="spyne-label">{customer.budget}</p>
                  </div>
                )}
                <div>
                  <p className="spyne-caption">Finance type</p>
                  <p className="spyne-label">{customer.financeType}</p>
                </div>
                {customer.useCase && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p className="spyne-caption">Use case</p>
                    <p className="spyne-label">{customer.useCase}</p>
                  </div>
                )}
              </div>
              {customer.features && customer.features.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--spyne-border)' }}>
                  <p className="spyne-caption" style={{ marginBottom: 6 }}>Must-haves</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {customer.features.map((f) => (
                      <span key={f} className="spyne-badge spyne-badge-neutral">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Lead with this */}
            <div
              style={{
                padding: '14px 14px',
                background: 'var(--spyne-brand-subtle)',
                borderTop: '1px solid var(--spyne-brand-muted)',
                borderRight: '1px solid var(--spyne-brand-muted)',
                borderBottom: '1px solid var(--spyne-brand-muted)',
                borderLeft: '4px solid var(--spyne-brand)',
                borderRadius: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <MaterialSymbol name="auto_awesome" size={13} style={{ color: 'var(--spyne-brand)' }} />
                <p
                  className="spyne-subheading"
                  style={{ color: 'var(--spyne-brand)', textTransform: 'uppercase' }}
                >
                  Lead with this
                </p>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--spyne-text-primary)' }}>
                {customer.conversationOpener}
              </p>
            </div>

            {/* Vehicle interest */}
            <div>
              <p className="spyne-subheading" style={{ marginBottom: 8 }}>Vehicle Interest</p>
              <div
                style={{
                  padding: '14px 14px',
                  background: 'var(--spyne-surface)',
                  border: '1px solid var(--spyne-border)',
                  borderRadius: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>
                    {customer.vehicle}
                  </p>
                  <span className="spyne-badge spyne-badge-success" style={{ flexShrink: 0 }}>In Stock</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--spyne-text-primary)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    ${customer.vehiclePrice.toLocaleString()}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: customer.vehicleDaysOnLot > 30 ? 'var(--spyne-warning-text)' : 'var(--spyne-text-muted)',
                      fontWeight: customer.vehicleDaysOnLot > 30 ? 600 : 400,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <MaterialSymbol name="schedule" size={11} />
                    {customer.vehicleDaysOnLot} days on lot{customer.vehicleDaysOnLot > 30 ? ' ⚠' : ''}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANE — conversation thread */}
        <div style={{ flex: 1, paddingLeft: 28, minWidth: 0 }}>
          <p className="spyne-subheading" style={{ marginBottom: 16 }}>Conversation History</p>
          <ConversationThread timeline={customer.timeline} />
        </div>

      </div>
    </div>
  )
}
