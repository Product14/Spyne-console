"use client"

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
  LineChart, Line, Legend,
} from 'recharts'
import { MaterialSymbol } from '@/components/max-2/material-symbol'
import { spyneComponentClasses } from '@/lib/design-system/max-2'
import { CHART_SERIES, SPYNE } from '../spyne-palette'

const TOGGLES_INBOUND = [
  { id: 'leadsInteracted',   label: 'Leads Interacted',          color: CHART_SERIES[0] },
  { id: 'leadsQualified',    label: 'Leads Qualified',           color: CHART_SERIES[1] },
  { id: 'afterHoursEngaged', label: 'After Hours Leads Engaged', color: SPYNE.orange },
  { id: 'humanHandoffs',     label: 'Human Handoffs',            color: SPYNE.pink },
  { id: 'appointments',      label: 'Appointments Booked',       color: SPYNE.success },
]

const TOGGLES_OUTBOUND = [
  { id: 'crmLeadsWorked',    label: 'CRM Leads Worked',    color: CHART_SERIES[0] },
  { id: 'responseRate',      label: 'Response Rate',       color: CHART_SERIES[1] },
  { id: 'reEngagements',     label: 'Re-engagements',      color: SPYNE.orange },
  { id: 'humanHandoffs',     label: 'Human Handoffs',      color: SPYNE.pink },
  { id: 'appointmentsBooked', label: 'Appointments Booked', color: SPYNE.success },
]

const TOGGLES_SERVICE_INBOUND = [
  { id: 'leadsInteracted',   label: 'Calls Handled',            color: CHART_SERIES[0] },
  { id: 'leadsQualified',    label: 'Intents Resolved',         color: CHART_SERIES[1] },
  { id: 'afterHoursEngaged', label: 'After-Hours Calls',        color: SPYNE.orange },
  { id: 'humanHandoffs',     label: 'Advisor Handoffs',         color: SPYNE.pink },
  { id: 'appointments',      label: 'Appts Booked',             color: SPYNE.success },
]

const TOGGLES_SERVICE_OUTBOUND = [
  { id: 'crmLeadsWorked',    label: 'Outreach Queue Worked', color: CHART_SERIES[0] },
  { id: 'responseRate',      label: 'Customer Reply Rate',   color: CHART_SERIES[1] },
  { id: 'reEngagements',     label: 'Declined Work Revived', color: SPYNE.orange },
  { id: 'humanHandoffs',     label: 'Advisor Handoffs',      color: SPYNE.pink },
  { id: 'appointmentsBooked', label: 'Drive Appts Booked',   color: SPYNE.success },
]

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="spyne-caption px-2.5 py-1.5 shadow-lg"
      style={{
        background: 'var(--spyne-text-primary)',
        color: '#fff',
        borderRadius: 'var(--spyne-radius-md)',
      }}
    >
      <div style={{ fontWeight: 700 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value}{unit || ''}
        </div>
      ))}
    </div>
  )
}

export default function ActivityChart({ data, agentType, department = 'sales' }) {
  const isOutbound = agentType === 'outbound'
  const isService = department === 'service'
  const TOGGLES = isOutbound
    ? isService
      ? TOGGLES_SERVICE_OUTBOUND
      : TOGGLES_OUTBOUND
    : isService
      ? TOGGLES_SERVICE_INBOUND
      : TOGGLES_INBOUND
  const [activeMetric, setActiveMetric] = useState(isOutbound ? 'crmLeadsWorked' : 'leadsInteracted')
  const [granularity, setGranularity]   = useState('daily')
  const [chartMode, setChartMode]       = useState('perMetric') // 'perMetric' | 'pipeline'

  useEffect(() => {
    setActiveMetric(isOutbound ? 'crmLeadsWorked' : 'leadsInteracted')
  }, [isOutbound])

  const activeGranularity = (granularity === 'weekly' && data.weekly) ? 'weekly' : 'daily'
  const chartSource = data[activeGranularity] || data.daily

  // Guard against stale metric key after agent switch
  const safeMetric = chartSource.metrics[activeMetric] ? activeMetric : TOGGLES[0].id
  const metric = chartSource.metrics[safeMetric]
  const unit = metric?.unit || ''
  const lowerIsBetter = metric?.lowerIsBetter

  // Per-metric bar chart data
  const barData = chartSource.days.map((day, i) => ({
    day,
    value: metric?.data[i] ?? 0,
  }))

  // Pipeline view — all metrics as lines on one chart
  const lineData = chartSource.days.map((day, i) => {
    const entry = { day }
    TOGGLES.forEach((t) => {
      if (chartSource.metrics[t.id]) {
        entry[t.id] = chartSource.metrics[t.id].data[i]
      }
    })
    return entry
  })

  return (
    <div className="spyne-card p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={spyneComponentClasses.cardTitle}>Recent Activity</div>
          {/* Granularity picker */}
          <div className="relative">
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value)}
              className="spyne-input appearance-none cursor-pointer"
              style={{ fontSize: 11, height: 28, paddingLeft: 10, paddingRight: 24, fontFamily: 'inherit' }}
              aria-label="Chart granularity"
            >
              <option value="daily">Daily</option>
              {data.weekly && <option value="weekly">Weekly</option>}
            </select>
            <MaterialSymbol
              name="expand_more"
              size={11}
              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--spyne-text-muted)' }}
            />
          </div>
        </div>

        {/* Chart mode tabs */}
        <div
          style={{
            display: 'flex',
            border: '1px solid var(--spyne-border)',
            borderRadius: 'var(--spyne-radius-md)',
            overflow: 'hidden',
            background: 'var(--spyne-surface)',
            flexShrink: 0,
          }}
        >
          {[
            { id: 'perMetric', label: 'Per Metric' },
            { id: 'pipeline',  label: 'Pipeline View' },
          ].map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setChartMode(tab.id)}
              style={{
                padding: '0 12px', height: 28, fontSize: 11, fontWeight: chartMode === tab.id ? 600 : 500,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: chartMode === tab.id ? 'var(--spyne-brand-subtle)' : 'transparent',
                color: chartMode === tab.id ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
                borderRight: i === 0 ? '1px solid var(--spyne-border)' : 'none',
                transition: 'all 150ms',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric toggle pills — only in Per Metric mode */}
      {chartMode === 'perMetric' && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {TOGGLES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveMetric(t.id)}
              className={`spyne-pill ${activeMetric === t.id ? 'spyne-pill-active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Charts */}
      {chartMode === 'perMetric' ? (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 20, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--spyne-border)" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'var(--spyne-text-muted)', fontFamily: 'inherit' }}
              axisLine={false}
              tickLine={false}
              interval={activeGranularity === 'daily' && barData.length > 14 ? Math.floor(barData.length / 10) : 0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--spyne-text-muted)', fontFamily: 'inherit' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ fill: 'var(--spyne-brand-subtle)' }} />
            <Bar dataKey="value" name={metric?.label} fill="var(--spyne-brand)" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {barData.length <= 14 && (
                <LabelList
                  dataKey="value"
                  position="top"
                  style={{ fontSize: 10, fill: 'var(--spyne-text-secondary)', fontWeight: 600, fontFamily: 'inherit' }}
                  formatter={(v) => `${v}${unit}`}
                />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={lineData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--spyne-border)" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'var(--spyne-text-muted)', fontFamily: 'inherit' }}
              axisLine={false}
              tickLine={false}
              interval={activeGranularity === 'daily' && lineData.length > 14 ? Math.floor(lineData.length / 10) : 0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--spyne-text-muted)', fontFamily: 'inherit' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />
            {TOGGLES.map((t) => (
              chartSource.metrics[t.id] ? (
                <Line
                  key={t.id}
                  type="monotone"
                  dataKey={t.id}
                  name={t.label}
                  stroke={t.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ) : null
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}

      {chartMode === 'perMetric' && lowerIsBetter && (
        <div className="text-center spyne-caption mt-1" style={{ color: 'var(--spyne-text-muted)' }}>
          Lower is better — faster response time
        </div>
      )}

      {/* Channel summary */}
      <div
        className="flex items-center justify-center gap-5 mt-4 pt-4"
        style={{ borderTop: '1px solid var(--spyne-border)' }}
      >
        <ChannelStat symbol="phone" label="Calls"  value={data.channelSummary.calls} />
        <ChannelStat symbol="chat"  label="SMS"    value={data.channelSummary.sms} />
        <ChannelStat symbol="mail"  label="Emails" value={data.channelSummary.emails} />
      </div>
    </div>
  )
}

function ChannelStat({ symbol, label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <MaterialSymbol name={symbol} size={12} style={{ color: 'var(--spyne-text-muted)' }} />
      <span className="spyne-caption" style={{ color: 'var(--spyne-text-secondary)' }}>Total {label}:</span>
      <span className="spyne-caption" style={{ color: 'var(--spyne-text-primary)', fontWeight: 700 }}>{value}</span>
    </div>
  )
}
