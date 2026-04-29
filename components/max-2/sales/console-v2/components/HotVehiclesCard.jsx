"use client"

import { MaterialSymbol } from '@/components/max-2/material-symbol'
import { ExternalLink } from 'lucide-react'

const COLORS = ['#4F46E5', '#0D9488', '#D97706', '#7C3AED', '#0EA5E9']

function dayColor(days) {
  if (days > 45) return '#EF4444'
  if (days > 30) return '#D97706'
  return 'var(--spyne-text-muted)'
}

const COL_GRID = '1fr 56px 64px 48px 20px'

export default function HotVehiclesCard({ data }) {
  return (
    <div className="spyne-card p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MaterialSymbol name="local_fire_department" size={14} style={{ color: '#EF4444' }} />
        <div className="spyne-heading">Hot Vehicles</div>
        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)', marginLeft: 2 }}>most leads right now</span>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: COL_GRID, gap: '0 16px', marginBottom: 6, paddingBottom: 6, paddingLeft: 20, paddingRight: 20, marginLeft: -20, marginRight: -20, borderBottom: '1px solid var(--spyne-border)', alignItems: 'center' }}>
        <span style={thStyle}>Vehicle</span>
        <span style={{ ...thStyle, textAlign: 'right' }}>Leads</span>
        <span style={{ ...thStyle, textAlign: 'right', color: 'var(--spyne-success-text)' }}>This Week</span>
        <span style={{ ...thStyle, textAlign: 'right' }}>On Lot</span>
        <span />
      </div>

      {/* Rows */}
      <div className="flex flex-col flex-1" style={{ marginLeft: -20, marginRight: -20 }}>
        {data.map((item, i) => {
          const color = COLORS[i % COLORS.length]
          const dc    = dayColor(item.daysOnLot)
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
              <span style={{ fontSize: 20, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', textAlign: 'right', lineHeight: 1 }}>
                {item.leads}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--spyne-success-text)', background: 'var(--spyne-success-subtle)', borderRadius: 'var(--spyne-radius-pill)', padding: '2px 7px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                +{item.newThisWeek}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: dc, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                {item.daysOnLot}d
              </span>
              <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--spyne-text-muted)' }} title="View vehicle details">
                <ExternalLink size={11} />
              </a>
            </div>
          )
        })}
      </div>
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
