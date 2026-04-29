"use client"

import { Snowflake, ArrowRight, ExternalLink } from 'lucide-react'

function dayColor(days) {
  if (days > 45) return '#EF4444'
  if (days > 30) return '#D97706'
  return 'var(--spyne-text-muted)'
}

const COL_GRID = '1fr 56px 72px 20px'

export default function ColdVehiclesCard({ data, onCreateCampaign }) {
  const totalHoldingCost = data.reduce((s, d) => s + d.holdingCost, 0)

  return (
    <div className="spyne-card p-5 flex flex-col h-full">
      {/* Header — holding cost inline */}
      <div className="flex items-baseline gap-2 mb-4 flex-wrap">
        <Snowflake size={14} style={{ color: '#0EA5E9', flexShrink: 0 }} />
        <div className="spyne-heading">Cold Vehicles</div>
        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>no leads · aging inventory</span>
        <span className="spyne-caption" style={{ color: 'var(--spyne-warning-text)', fontWeight: 700, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
          ${totalHoldingCost.toLocaleString()} holding · $50/day
        </span>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: COL_GRID, gap: '0 16px', marginBottom: 6, paddingBottom: 6, paddingLeft: 20, paddingRight: 20, marginLeft: -20, marginRight: -20, borderBottom: '1px solid var(--spyne-border)', alignItems: 'center' }}>
        <span style={thStyle}>Vehicle</span>
        <span style={{ ...thStyle, textAlign: 'right' }}>Days</span>
        <span style={{ ...thStyle, textAlign: 'right', color: 'var(--spyne-warning-text)' }}>Holding</span>
        <span />
      </div>

      {/* Rows */}
      <div className="flex flex-col flex-1" style={{ marginLeft: -20, marginRight: -20 }}>
        {data.map((item, i) => {
          const dc = dayColor(item.daysOnLot)
          return (
            <div
              key={item.vehicle}
              style={{
                display: 'grid',
                gridTemplateColumns: COL_GRID,
                gap: '0 16px',
                alignItems: 'center',
                padding: '7px 20px',
                borderBottom: i < data.length - 1 ? '1px solid var(--spyne-border)' : 'none',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--spyne-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.vehicle}
              </span>
              <span style={{ fontSize: 20, fontWeight: 800, color: dc, fontVariantNumeric: 'tabular-nums', textAlign: 'right', lineHeight: 1 }}>
                {item.daysOnLot}d
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--spyne-warning-text)', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                ${item.holdingCost.toLocaleString()}
              </span>
              <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--spyne-text-muted)' }} title="View vehicle details">
                <ExternalLink size={11} />
              </a>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <button
        onClick={onCreateCampaign}
        className="spyne-btn-primary"
        style={{ marginTop: 20, justifyContent: 'center', gap: 6, fontSize: 12 }}
      >
        Create Outbound Campaign
        <ArrowRight size={12} />
      </button>
    </div>
  )
}

const thStyle = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--spyne-text-muted)',
}
