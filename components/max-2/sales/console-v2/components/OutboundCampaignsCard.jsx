"use client"

import { MaterialSymbol } from '@/components/max-2/material-symbol'
import { spyneComponentClasses } from '@/lib/design-system/max-2'
import InfoTooltip from './InfoTooltip'

export default function OutboundCampaignsCard({ data, onViewCampaign }) {
  const { campaigns } = data

  const totalEnrolled  = campaigns.reduce((s, c) => s + c.enrolled, 0)
  const totalAttempted = campaigns.reduce((s, c) => s + c.attempted, 0)
  const totalReEngaged = campaigns.reduce((s, c) => s + (c.reEngaged ?? 0), 0)
  const totalAppts     = campaigns.reduce((s, c) => s + c.apptsBooked, 0)
  const avgResponse    = (() => {
    const resp = campaigns.reduce((s, c) => s + c.attempted * parseFloat(c.responseRate), 0)
    return (resp / totalAttempted).toFixed(1) + '%'
  })()

  return (
    <div className="spyne-card p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-4">
        <div className={spyneComponentClasses.cardTitle}>Campaign Performance</div>
        <InfoTooltip text="Tracks how each outbound campaign is converting dormant CRM leads. Re-engaged = a cold lead replied. Appts Booked = Vini converted the re-engagement into a confirmed visit." />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--spyne-border)' }}>
              <th style={thStyle}>Campaign</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Enrolled</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Attempted</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Response Rate</th>
              <th style={{ ...thStyle, textAlign: 'center', color: 'var(--spyne-brand)' }}>Re-engaged</th>
              <th style={{ ...thStyle, textAlign: 'center', color: 'var(--spyne-brand)' }}>Appts Booked</th>
              <th style={thStyle} />
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c, i) => (
              <tr
                key={c.key}
                style={{ background: i % 2 !== 0 ? 'var(--spyne-bg)' : 'transparent' }}
              >
                <td style={{ ...tdRowLabel, color: c.color }}>{c.label}</td>
                <td style={tdCell}>{c.enrolled.toLocaleString()}</td>
                <td style={tdCell}>{c.attempted.toLocaleString()}</td>
                <td style={{ ...tdCell, color: 'var(--spyne-text-secondary)' }}>{c.responseRate}</td>
                <td style={{ ...tdCell, color: 'var(--spyne-brand)', fontWeight: 700 }}>
                  {c.reEngaged != null ? c.reEngaged.toLocaleString() : <span style={{ color: 'var(--spyne-text-muted)', fontWeight: 400 }}>—</span>}
                </td>
                <td style={{ ...tdCell, color: 'var(--spyne-brand)', fontWeight: 700 }}>
                  {c.apptsBooked.toLocaleString()}
                </td>
                <td style={{ padding: '8px 0 8px 8px', textAlign: 'right' }}>
                  <button
                    onClick={() => onViewCampaign?.(c.key)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      fontSize: 11, fontWeight: 600, color: 'var(--spyne-brand)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '2px 6px', borderRadius: 'var(--spyne-radius-sm)',
                      fontFamily: 'inherit',
                    }}
                  >
                    View <MaterialSymbol name="arrow_forward" size={11} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '1.5px solid var(--spyne-border)', background: 'var(--spyne-bg)' }}>
              <td style={{ ...tdRowLabel, color: 'var(--spyne-text-primary)', fontWeight: 700 }}>Total</td>
              <td style={{ ...tdCell, fontWeight: 700 }}>{totalEnrolled.toLocaleString()}</td>
              <td style={{ ...tdCell, fontWeight: 700 }}>{totalAttempted.toLocaleString()}</td>
              <td style={{ ...tdCell, color: 'var(--spyne-text-secondary)', fontWeight: 700 }}>{avgResponse}</td>
              <td style={{ ...tdCell, color: 'var(--spyne-brand)', fontWeight: 700 }}>{totalReEngaged.toLocaleString()}</td>
              <td style={{ ...tdCell, color: 'var(--spyne-brand)', fontWeight: 700 }}>{totalAppts.toLocaleString()}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

const thStyle = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  color: 'var(--spyne-text-muted)',
  textAlign: 'left',
  padding: '0 10px 10px 0',
}

const tdRowLabel = {
  fontSize: 12,
  fontWeight: 700,
  padding: '10px 10px 10px 0',
}

const tdCell = {
  fontSize: 13,
  fontWeight: 600,
  textAlign: 'center',
  padding: '10px',
  color: 'var(--spyne-text-primary)',
}
