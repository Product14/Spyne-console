"use client"

import { MaterialSymbol } from '@/components/max-2/material-symbol'

export default function FollowUpSequencesStrip({ data }) {
  return (
    <div className="spyne-card px-4 py-3.5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="spyne-subheading shrink-0">Follow-Up Sequences</div>
          <div className="flex items-center flex-wrap">
            <StatItem value={data.touchesToday}                  label="follow-up touches sent today" />
            <Divider />
            <StatItem value={data.leadsInSequence}               label="leads in active sequence" />
            <Divider />
            <StatItem value={data.apptsFromFollowUpThisWeek}     label="appts from follow-up this week" green />
          </div>
        </div>
        <button
          className="spyne-btn-ghost flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span style={{ color: 'var(--spyne-brand)', fontWeight: 600 }}>View sequences</span>
          <MaterialSymbol name="arrow_forward" size={11} style={{ color: 'var(--spyne-brand)' }} />
        </button>
      </div>
    </div>
  )
}

function StatItem({ value, label, green }) {
  return (
    <div className="flex items-center gap-1.5 px-4 first:pl-0">
      <span
        style={{
          fontSize: 18,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
          color: green ? 'var(--spyne-success)' : 'var(--spyne-text-primary)',
        }}
      >
        {value}
      </span>
      <span className="spyne-caption" style={{ color: 'var(--spyne-text-secondary)' }}>{label}</span>
    </div>
  )
}

function Divider() {
  return (
    <div
      className="mx-1 self-stretch"
      style={{ width: 1, background: 'var(--spyne-border)', minHeight: 20 }}
    />
  )
}
