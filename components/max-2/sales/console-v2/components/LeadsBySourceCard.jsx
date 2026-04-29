"use client"

import { spyneComponentClasses } from '@/lib/design-system/max-2'
import InfoTooltip from './InfoTooltip'

export default function LeadsBySourceCard({
  data,
  title = 'Leads by Source',
  tooltipText = 'Breaks down all inbound leads by originating channel. The funnel shows how each source converts from first contact through to a sold vehicle, helping you see which channels drive the highest-quality traffic.',
}) {
  const { sources, funnel } = data

  return (
    <div className="spyne-card p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <div className={spyneComponentClasses.cardTitle}>{title}</div>
          <InfoTooltip text={tooltipText} />
        </div>
      </div>

      {/* Source stat strip */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        {sources.map((s) => (
          <div
            key={s.key}
            className="rounded-lg p-3 text-center"
            style={{ background: s.color + '10' }}
          >
            <div className="spyne-number" style={{ color: s.color, fontSize: 22, lineHeight: 1.1 }}>
              {s.count.toLocaleString()}
            </div>
            <div className="spyne-label mt-0.5" style={{ color: 'var(--spyne-text-primary)' }}>
              {s.label}
            </div>
            <div className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
              {s.pct}% of total
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--spyne-border)', marginBottom: 12, marginLeft: -16, marginRight: -16 }} />

      {/* Funnel table — rows = sources, cols = funnel stages */}
      <div style={{ overflowX: 'auto', marginLeft: -16, marginRight: -16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--spyne-border)' }}>
              <th style={{ ...thStyle, paddingLeft: 16 }}>Source</th>
              {funnel.map((col, ci) => (
                <th
                  key={col.metric}
                  style={{
                    ...thStyle,
                    color: col.highlight ? 'var(--spyne-brand)' : undefined,
                    paddingRight: ci === funnel.length - 1 ? 16 : 10,
                  }}
                >
                  {col.metric}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sources.map((s, i) => (
              <tr
                key={s.key}
                style={{ background: i % 2 !== 0 ? 'var(--spyne-bg)' : 'transparent' }}
              >
                <td style={{ ...tdRowLabel, color: 'rgba(0, 0, 0, 0.8)' }}>
                  {s.label}
                </td>
                {funnel.map((col, ci) => {
                  const cell = col[s.key]
                  const isHighlight = col.highlight
                  const isNull = !cell || cell.count == null
                  return (
                    <td
                      key={col.metric}
                      style={{ ...tdCell, color: isNull ? 'var(--spyne-text-muted)' : isHighlight ? 'var(--spyne-brand)' : 'var(--spyne-text-primary)', paddingRight: ci === funnel.length - 1 ? 16 : 10 }}
                    >
                      {isNull ? (
                        <span style={{ fontWeight: 400 }}>—</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{cell.count.toLocaleString()}</span>
                          {cell.rate && (
                            <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--spyne-text-muted)' }}>
                              {cell.rate}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
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
  color: 'rgba(26, 26, 26, 1)',
  textAlign: 'center',
  padding: '0 10px 8px 0',
  backgroundColor: 'rgba(250, 250, 250, 1)',
}

const tdBaseBorder = {
  border: 'none',
  borderBottom: '1px solid rgba(229, 231, 235, 1)',
}

const tdRowLabel = {
  ...tdBaseBorder,
  fontSize: 12,
  fontWeight: 600,
  padding: '8px 10px 8px 16px',
  backgroundColor: 'rgba(255, 255, 255, 1)',
}

const tdCell = {
  ...tdBaseBorder,
  fontSize: 13,
  textAlign: 'center',
  padding: '8px 10px',
  backgroundColor: 'rgba(255, 255, 255, 1)',
}
