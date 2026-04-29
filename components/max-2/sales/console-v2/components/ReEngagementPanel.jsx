"use client"

import { MaterialSymbol } from '@/components/max-2/material-symbol'
import InfoTooltip from './InfoTooltip'
import { SPYNE, SPYNE_SOFT_BG } from '../spyne-palette'

export default function ReEngagementPanel({ data }) {
  return (
    <div
      className="spyne-animate-slide-up h-full flex flex-col"
      style={{
        borderRadius: 'var(--spyne-radius-lg)',
        border: '1px solid var(--spyne-brand-muted)',
        borderLeft: '4px solid var(--spyne-brand)',
        background: 'var(--spyne-brand-subtle)',
        boxShadow: 'var(--spyne-shadow-brand)',
      }}
    >
      <div className="p-4 lg:p-6 flex-1 flex flex-col gap-4">

        {/* Top row: hero stat */}
        <div className="flex items-center gap-5">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="spyne-subheading">Re-engagement</div>
              <InfoTooltip text="Measures how effectively Vini revives cold CRM leads. Re-engagement rate = % of contacted leads who replied. Qualified leads = dead CRM leads Vini moved back into an active buying stage." />
            </div>
            <div className="spyne-display" style={{ color: 'var(--spyne-brand)', fontSize: 44, lineHeight: 1 }}>
              {data.rate}
            </div>
            <div className="spyne-body mt-1" style={{ color: 'var(--spyne-text-secondary)' }}>
              re-engagement rate
            </div>
          </div>
          <div className="flex flex-col gap-1.5 ml-2">
            <span
              className="flex items-center gap-1 px-2 py-0.5 spyne-caption"
              style={{
                borderRadius: 'var(--spyne-radius-pill)',
                background: 'var(--spyne-success-subtle)',
                color: 'var(--spyne-success-text)',
                fontWeight: 700,
                border: '1px solid var(--spyne-success-muted)',
                width: 'fit-content',
              }}
            >
              <MaterialSymbol name="trending_up" size={11} />
              {data.improvement}
            </span>
          </div>
        </div>

        {/* 2×2 stat grid — confirmed order:
            Leads Re-engaged | Qualified Leads
            Avg Days Cold    | Appointments Booked  */}
        <div className="grid grid-cols-2 gap-3 flex-1" style={{ gridTemplateRows: '1fr 1fr' }}>
          <StatCell value={data.leadsReEngaged} label="leads re-engaged" />
          <StatCell value={data.qualifiedLeads} label="qualified leads" green />
          <StatCell value={`${data.avgDaysCold}d`} label="avg days cold before reply" />
          <StatCell value={data.apptsBooked}    label="appointments booked" green />
        </div>
      </div>

      {/* Highlight bar */}
      <div
        className="px-4 py-2.5 flex items-center justify-center"
        style={{ background: SPYNE_SOFT_BG.info, borderTop: '1px solid var(--spyne-brand-muted)' }}
      >
        <p className="spyne-caption text-center leading-relaxed" style={{ color: SPYNE.textPrimary, fontWeight: 500 }}>
          <strong>{data.highlightBar.split('·')[0].trim()}</strong>
          {data.highlightBar.includes('·') && <> · {data.highlightBar.split('·')[1].trim()}</>}
        </p>
      </div>
    </div>
  )
}

function StatCell({ value, label, green }) {
  return (
    <div
      className="flex flex-col justify-center gap-1 p-3"
      style={{
        background: 'rgba(255,255,255,0.75)',
        borderRadius: 'var(--spyne-radius-md)',
        border: '1px solid var(--spyne-brand-muted)',
        boxShadow: 'var(--spyne-shadow-sm)',
      }}
    >
      <div
        className="spyne-number"
        style={{ color: green ? 'var(--spyne-success)' : 'var(--spyne-text-primary)', fontSize: 22 }}
      >
        {value}
      </div>
      <div className="spyne-caption" style={{ color: 'var(--spyne-text-secondary)', lineHeight: 1.4 }}>
        {label}
      </div>
    </div>
  )
}
