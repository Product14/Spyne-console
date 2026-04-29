import { useState, useEffect, useRef, useMemo } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Edit3,
  Eye,
  Filter,
  GitBranch,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Pause,
  Phone,
  PhoneOutgoing,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Sparkles,
  Target,
  Timer,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
  XCircle,
  X,
  AlertTriangle,
  Rocket,
  PhoneCall,
  Car,
  DollarSign,
  Megaphone,
  Download,
  Info,
  PhoneOff,
  PhoneMissed,
  VoicemailIcon,
  UserX,
  XOctagon,
  Upload,
  FileText,
  Tag,
  Gift,
  Repeat,
  UploadCloud,
  Table,
  MapPin,
  PieChart,
  Activity,
  TrendingDown,
  Hash,
  Percent,
  BarChart2,
} from 'lucide-react'
import CustomerOverviewPanel from './CustomerOverviewPanel'
import { AreaChart, Area, YAxis, ResponsiveContainer } from 'recharts'

/* ─── Status / type configs ──────────────────────────────────────── */

const CAMPAIGN_STATUS = {
  active:    { label: 'Active',    bg: 'var(--spyne-success-subtle)', color: 'var(--spyne-success-text)', border: 'var(--spyne-success-muted)', dot: 'var(--spyne-success)' },
  paused:    { label: 'Paused',    bg: 'var(--spyne-warning-subtle)', color: 'var(--spyne-warning-text)', border: 'var(--spyne-warning-muted)', dot: 'var(--spyne-warning)' },
  draft:     { label: 'Draft',     bg: 'var(--spyne-surface-hover)',  color: 'var(--spyne-text-muted)',   border: 'var(--spyne-border)',         dot: 'var(--spyne-border-strong)' },
  completed: { label: 'Completed', bg: 'var(--spyne-brand-subtle)',   color: 'var(--spyne-brand-dark)',   border: 'var(--spyne-brand-muted)',    dot: 'var(--spyne-brand)' },
}

const STEP_TYPE_CONFIG = {
  trigger:   { label: 'Trigger',      icon: Zap,            color: 'var(--spyne-warning)',     bg: 'var(--spyne-warning-subtle)' },
  sms:       { label: 'Send SMS',     icon: MessageSquare,  color: 'var(--spyne-brand)',       bg: 'var(--spyne-brand-subtle)' },
  call:      { label: 'AI Call',      icon: Phone,          color: 'var(--spyne-info)',        bg: 'var(--spyne-info-subtle)' },
  email:     { label: 'Send Email',   icon: Mail,           color: 'var(--spyne-danger)',      bg: 'var(--spyne-danger-subtle)' },
  wait:      { label: 'Wait',         icon: Clock,          color: 'var(--spyne-text-muted)',  bg: 'var(--spyne-surface-hover)' },
  condition: { label: 'Condition',    icon: GitBranch,      color: 'var(--spyne-warning)',     bg: 'var(--spyne-warning-subtle)' },
  action:    { label: 'AI Action',    icon: Sparkles,       color: 'var(--spyne-brand)',       bg: 'var(--spyne-brand-subtle)' },
  transfer:  { label: 'Warm Transfer', icon: UserCheck,     color: 'var(--spyne-success)',     bg: 'var(--spyne-success-subtle)' },
  end:       { label: 'End',          icon: Check,          color: 'var(--spyne-success)',     bg: 'var(--spyne-success-subtle)' },
}

/* ─── Outbound pipeline configs ──────────────────────────────────── */

const CHANNEL_ICON = {
  SMS: MessageSquare,
  Voice: Phone,
  Email: Mail,
  AI: Sparkles,
}

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', bg: 'var(--spyne-danger-subtle)', color: 'var(--spyne-danger-text)', border: 'var(--spyne-danger-muted)' },
  high:     { label: 'High',     bg: 'var(--spyne-warning-subtle)', color: 'var(--spyne-warning-text)', border: 'var(--spyne-warning-muted)' },
  medium:   { label: 'Medium',   bg: 'var(--spyne-info-subtle)',    color: 'var(--spyne-info-text)',    border: 'var(--spyne-info-muted)' },
  low:      { label: 'Low',      bg: 'var(--spyne-brand-subtle)',   color: 'var(--spyne-brand-dark)',   border: 'var(--spyne-brand-muted)' },
}

const LEAD_STATUS_CONFIG = {
  awaiting_contact: { label: 'Awaiting Contact', color: 'var(--spyne-warning-text)', bg: 'var(--spyne-warning-subtle)' },
  in_sequence:      { label: 'In Sequence',      color: 'var(--spyne-brand-dark)',   bg: 'var(--spyne-brand-subtle)' },
  responded:        { label: 'Responded',         color: 'var(--spyne-success-text)', bg: 'var(--spyne-success-subtle)' },
  no_response:      { label: 'No Response',       color: 'var(--spyne-text-muted)',   bg: 'var(--spyne-surface-hover)' },
  booked:           { label: 'Appt Booked',       color: 'var(--spyne-success-text)', bg: 'var(--spyne-success-subtle)' },
}

/* ─── Main Component ─────────────────────────────────────────────── */

export default function CampaignsPage({ data, outboundData, agent, prefillVehicles, onClearPrefill, lotData }) {
  const [view, setView] = useState('list')             // 'list' | 'detail' | 'builder'
  const [selectedId, setSelectedId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateWizard, setShowCreateWizard] = useState(false)
  const [showPreLaunch, setShowPreLaunch] = useState(false)
  const [pendingCampaign, setPendingCampaign] = useState(null)
  const [showLotCampaign, setShowLotCampaign] = useState(false)
  const [lotVehicles, setLotVehicles] = useState(null)

  // Handle prefill from Lot View
  useEffect(() => {
    if (prefillVehicles && prefillVehicles.length > 0) {
      setLotVehicles(prefillVehicles)
      setShowLotCampaign(true)
      onClearPrefill?.()
    }
  }, [prefillVehicles])

  const selectedCampaign = data.campaigns.find((c) => c.id === selectedId)

  const openDetail = (id) => { setSelectedId(id); setView('detail') }
  const openBuilder = (id) => { setSelectedId(id); setView('builder') }
  const goBack = () => { setView('list'); setSelectedId(null) }

  const handleCreateComplete = (campaignDraft) => {
    setPendingCampaign(campaignDraft)
    setShowCreateWizard(false)
    setShowPreLaunch(true)
  }

  // After launch, navigate to the new campaign detail (#11)
  const handleLaunch = () => {
    setShowPreLaunch(false)
    setPendingCampaign(null)
    // Navigate to the first campaign as a demo (in production, this would be the newly created one)
    if (data.campaigns.length > 0) {
      setSelectedId(data.campaigns[0].id)
      setView('detail')
    }
  }

  const handleLotCampaignLaunch = () => {
    setShowLotCampaign(false)
    setLotVehicles(null)
    if (data.campaigns.length > 0) {
      setSelectedId(data.campaigns[0].id)
      setView('detail')
    }
  }

  if (view === 'detail' && selectedCampaign) {
    return <CampaignDetail campaign={selectedCampaign} outboundData={outboundData} onBack={goBack} onEditWorkflow={() => openBuilder(selectedCampaign.id)} />
  }
  if (view === 'builder' && selectedCampaign) {
    return <WorkflowBuilder campaign={selectedCampaign} onBack={() => openDetail(selectedCampaign.id)} />
  }

  /* ─── List view ─── */
  const filtered = data.campaigns.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-5 spyne-animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="spyne-title" style={{ color: 'var(--spyne-text-primary)' }}>Campaigns</h1>
          <p className="spyne-body-sm mt-0.5" style={{ color: 'var(--spyne-text-muted)' }}>
            {data.campaigns.length} campaigns · {data.campaigns.filter((c) => c.status === 'active').length} active
          </p>
        </div>
        <div className="flex items-center gap-3">
          {agent && <AgentStatusPill agent={agent} />}
          <button className="spyne-btn-primary" style={{ gap: 6 }} onClick={() => setShowCreateWizard(true)}>
            <Plus size={14} strokeWidth={2.5} />
            New Campaign
          </button>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.summaryMetrics.map((m) => (
          <div key={m.label} className="spyne-card p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <m.icon size={13} strokeWidth={2} style={{ color: 'var(--spyne-text-muted)' }} />
              <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{m.label}</span>
            </div>
            <span className="spyne-number" style={{ fontSize: 22, color: 'var(--spyne-text-primary)' }}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* AI Recommendations (#1 — insight text removed to keep cards compact) */}
      <AIRecommendations lotData={lotData} onCreateCampaign={(vehicles) => {
        setLotVehicles(vehicles)
        setShowLotCampaign(true)
      }} onCreateWizard={() => setShowCreateWizard(true)} />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--spyne-text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="spyne-input w-full pl-9"
            style={{ fontSize: 12, height: 34 }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          {['all', 'active', 'paused', 'draft', 'completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`spyne-pill ${statusFilter === s ? 'spyne-pill-active' : ''}`}
              style={{ height: 28, fontSize: 11, padding: '0 10px' }}
            >
              {s === 'all' ? 'All' : CAMPAIGN_STATUS[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Table */}
      <CampaignTable
        campaigns={filtered}
        onOpen={openDetail}
        onEditWorkflow={openBuilder}
      />

      {/* Create Campaign Wizard Modal */}
      {showCreateWizard && (
        <CreateCampaignWizard
          onClose={() => setShowCreateWizard(false)}
          onComplete={handleCreateComplete}
        />
      )}

      {/* Pre-Launch Intelligence Modal */}
      {showPreLaunch && (
        <PreLaunchIntelligenceModal
          campaign={pendingCampaign}
          onClose={() => { setShowPreLaunch(false); setPendingCampaign(null) }}
          onLaunch={handleLaunch}
          onOptimize={handleLaunch}
        />
      )}

      {/* Lot Holding Cost Campaign Modal */}
      {showLotCampaign && lotVehicles && (
        <LotCampaignModal
          vehicles={lotVehicles}
          onClose={() => { setShowLotCampaign(false); setLotVehicles(null) }}
          onLaunch={handleLotCampaignLaunch}
        />
      )}
    </div>
  )
}

/* ─── Campaign Table (replaces cards) ───────────────────────────── */

function CampaignTable({ campaigns, onOpen, onEditWorkflow }) {
  if (campaigns.length === 0) {
    return (
      <div className="spyne-card px-5 py-12 text-center">
        <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-muted)' }}>No campaigns match your filters</p>
      </div>
    )
  }

  return (
    <div className="spyne-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr style={{ background: 'var(--spyne-surface-hover)' }}>
            <th className="text-left px-5 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Campaign</th>
            <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Status</th>
            <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Type</th>
            <th className="text-right px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Enrolled</th>
            <th className="text-right px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Active</th>
            <th className="text-right px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Response</th>
            <th className="text-right px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Appts</th>
            <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Channels</th>
            <th className="text-right px-5 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--spyne-border)' }}>
          {campaigns.map((campaign) => {
            const st = CAMPAIGN_STATUS[campaign.status] || CAMPAIGN_STATUS.draft
            return (
              <tr
                key={campaign.id}
                className="transition-colors cursor-pointer"
                onClick={() => onOpen(campaign.id)}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--spyne-surface-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = ''}
              >
                <td className="px-5 py-3.5" style={{ maxWidth: 280 }}>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: st.dot }} />
                    <div className="min-w-0">
                      <span className="spyne-label font-semibold block truncate" style={{ color: 'var(--spyne-text-primary)' }}>{campaign.name}</span>
                      <span className="spyne-caption block truncate" style={{ color: 'var(--spyne-text-muted)', maxWidth: 240 }}>{campaign.description}</span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <span className="spyne-badge" style={{ background: st.bg, color: st.color, borderColor: st.border }}>{st.label}</span>
                </td>
                <td className="px-3 py-3.5">
                  <span className="spyne-caption font-medium" style={{ color: 'var(--spyne-text-secondary)' }}>{campaign.type}</span>
                </td>
                <td className="px-3 py-3.5 text-right">
                  <span className="spyne-label tabular-nums font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{campaign.leadsEnrolled}</span>
                </td>
                <td className="px-3 py-3.5 text-right">
                  <span className="spyne-label tabular-nums" style={{ color: 'var(--spyne-text-secondary)' }}>{campaign.leadsActive}</span>
                </td>
                <td className="px-3 py-3.5 text-right">
                  <span className="spyne-label tabular-nums font-semibold" style={{ color: campaign.responseRate >= 50 ? 'var(--spyne-success-text)' : 'var(--spyne-text-primary)' }}>
                    {campaign.responseRate}%
                  </span>
                </td>
                <td className="px-3 py-3.5 text-right">
                  <span className="spyne-label tabular-nums font-semibold" style={{ color: campaign.appointmentsBooked > 0 ? 'var(--spyne-success-text)' : 'var(--spyne-text-muted)' }}>
                    {campaign.appointmentsBooked}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-1.5">
                    {campaign.channels.map((ch) => {
                      const ChIcon = CHANNEL_ICON[ch] || MessageSquare
                      return (
                        <div key={ch} className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'var(--spyne-surface-hover)' }} title={ch}>
                          <ChIcon size={12} style={{ color: 'var(--spyne-text-muted)' }} />
                        </div>
                      )
                    })}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                    {campaign.status === 'active' && (
                      <button className="spyne-btn-ghost" style={{ padding: '4px 8px', fontSize: 11, height: 28 }} title="Pause campaign">
                        <Pause size={12} /> Pause
                      </button>
                    )}
                    {campaign.status === 'paused' && (
                      <button className="spyne-btn-ghost" style={{ padding: '4px 8px', fontSize: 11, height: 28, color: 'var(--spyne-success-text)' }} title="Resume campaign">
                        <Play size={12} /> Resume
                      </button>
                    )}
                    {(campaign.status === 'completed' || campaign.status === 'paused') && (
                      <button className="spyne-btn-ghost" style={{ padding: '4px 8px', fontSize: 11, height: 28, color: 'var(--spyne-brand)' }} title="Rerun on new leads">
                        <RefreshCw size={12} /> Rerun
                      </button>
                    )}
                    <button
                      className="spyne-btn-ghost"
                      style={{ padding: '4px 8px', fontSize: 11, height: 28 }}
                      onClick={() => onEditWorkflow(campaign.id)}
                      title="Edit workflow"
                    >
                      <GitBranch size={12} />
                    </button>
                    <button className="spyne-btn-ghost" style={{ padding: 4, height: 28 }} title="More options">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--spyne-border)', background: 'var(--spyne-surface)' }}>
        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
          {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
        </span>
        <span className="spyne-caption tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>
          {campaigns.reduce((s, c) => s + c.leadsEnrolled, 0).toLocaleString()} total leads enrolled
        </span>
      </div>
    </div>
  )
}

/* ─── AI Recommendations Section (#1 — insight removed for compact cards) ── */

function AIRecommendations({ lotData, onCreateCampaign, onCreateWizard }) {
  const [dismissed, setDismissed] = useState({})

  const recommendations = []

  if (lotData) {
    const highCostVehicles = lotData.vehicles.filter((v) => v.daysOnLot >= 30)
    if (highCostVehicles.length > 0) {
      const totalHoldingCost = highCostVehicles.reduce((sum, v) => sum + v.holdingCost, 0)
      const totalMatchedLeads = highCostVehicles.reduce((s, v) => s + v.matchedLeads, 0)
      recommendations.push({
        id: 'aging-inventory',
        priority: 'high',
        icon: DollarSign,
        iconBg: 'var(--spyne-warning-subtle)',
        iconColor: 'var(--spyne-warning)',
        accentColor: 'var(--spyne-warning)',
        title: `Aging Inventory — ${highCostVehicles.length} Vehicles Need Push`,
        subtitle: `$${totalHoldingCost.toLocaleString()} holding cost · ${totalMatchedLeads} leads matched by vehicle interest & price bracket`,
        actionLabel: 'Target Matched Leads',
        actionIcon: Megaphone,
        onAction: () => onCreateCampaign(highCostVehicles),
      })
    }
  }

  recommendations.push({
    id: 'vehicle-available',
    priority: 'high',
    icon: Car,
    iconBg: 'var(--spyne-success-subtle)',
    iconColor: 'var(--spyne-success)',
    accentColor: 'var(--spyne-success)',
    title: 'Vehicle Back in Stock — 3 Interested Customers',
    subtitle: '2024 Honda CR-V EX-L (Crystal Black) is now available · 3 leads previously inquired',
    actionLabel: 'Notify Interested Leads',
    actionIcon: Send,
    onAction: onCreateWizard,
  })

  recommendations.push({
    id: 'hot-vehicle',
    priority: 'medium',
    icon: TrendingUp,
    iconBg: 'var(--spyne-brand-subtle)',
    iconColor: 'var(--spyne-brand)',
    accentColor: 'var(--spyne-brand)',
    title: 'Hot Vehicle Alert — 2024 Toyota RAV4 Trending',
    subtitle: '8 leads searched for RAV4 in the last 48h · 2 units on lot · avg inquiry-to-visit: 1.4 days',
    actionLabel: 'Launch RAV4 Campaign',
    actionIcon: Rocket,
    onAction: onCreateWizard,
  })

  recommendations.push({
    id: 'weekend-push',
    priority: 'medium',
    icon: Calendar,
    iconBg: 'var(--spyne-info-subtle)',
    iconColor: 'var(--spyne-info)',
    accentColor: 'var(--spyne-info)',
    title: 'Weekend Appointment Slots Open',
    subtitle: '12 open Saturday slots · 34 leads with no appointment yet · best convert window: Thu–Fri outreach',
    actionLabel: 'Create Weekend Push',
    actionIcon: Megaphone,
    onAction: onCreateWizard,
  })

  const visible = recommendations.filter((r) => !dismissed[r.id])
  if (visible.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={14} style={{ color: 'var(--spyne-brand)' }} />
        <span className="spyne-subheading" style={{ fontWeight: 600, color: 'var(--spyne-text-primary)' }}>AI Recommendations</span>
        <span className="spyne-caption px-2 py-0.5 font-bold tabular-nums" style={{ borderRadius: 'var(--spyne-radius-pill)', background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)' }}>
          {visible.length}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visible.map((rec) => {
          const RecIcon = rec.icon
          const ActionIcon = rec.actionIcon
          return (
            <div
              key={rec.id}
              className="overflow-hidden"
              style={{
                borderRadius: 'var(--spyne-radius-lg)',
                border: `1px solid color-mix(in srgb, ${rec.accentColor} 25%, transparent)`,
                background: 'var(--spyne-surface)',
              }}
            >
              <div className="h-0.5" style={{ background: rec.accentColor }} />
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: rec.iconBg }}
                  >
                    <RecIcon size={17} strokeWidth={2.2} style={{ color: rec.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="spyne-label font-semibold mb-0.5" style={{ color: 'var(--spyne-text-primary)', lineHeight: 1.4 }}>{rec.title}</h4>
                    <p className="spyne-caption mb-3" style={{ color: 'var(--spyne-text-muted)', lineHeight: 1.5 }}>{rec.subtitle}</p>
                    <div className="flex items-center gap-2">
                      <button
                        className="spyne-btn-primary"
                        style={{ fontSize: 11, height: 30, gap: 5, background: rec.accentColor, boxShadow: 'none' }}
                        onClick={rec.onAction}
                      >
                        <ActionIcon size={12} />
                        {rec.actionLabel}
                      </button>
                      <button
                        className="spyne-btn-ghost"
                        style={{ fontSize: 11, height: 30 }}
                        onClick={() => setDismissed({ ...dismissed, [rec.id]: true })}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Campaign Detail View ───────────────────────────────────────── */

function CampaignDetail({ campaign, outboundData, onBack, onEditWorkflow }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedLead, setSelectedLead] = useState(null)
  const [customerPanelLead, setCustomerPanelLead] = useState(null)
  const st = CAMPAIGN_STATUS[campaign.status] || CAMPAIGN_STATUS.draft

  const detailTabs = [
    { id: 'overview',  label: 'Overview' },
    { id: 'workflow',  label: 'Workflow' },
    { id: 'leads',     label: `Leads (${campaign.leadsEnrolled})` },
    { id: 'analytics', label: 'Analytics' },
  ]

  // Build a mock customer object for CustomerOverviewPanel (#5)
  const buildCustomerForPanel = (lead) => ({
    id: lead.id,
    name: lead.name,
    initials: lead.initials,
    phone: lead.phone,
    email: lead.email || `${lead.name.toLowerCase().replace(/\s/g, '.')}@email.com`,
    source: lead.source || 'Campaign',
    vehicleInterest: lead.vehicle,
    stage: lead.status === 'booked' ? 'NEGOTIATION' : lead.status === 'responded' ? 'EVALUATION' : 'SHOPPING',
    budget: '$25K – $40K',
    financeType: 'Finance',
    lastSignal: lead.lastActivity || 'Campaign outreach',
    nextAppointment: lead.appointmentDate || null,
    thread: [],
  })

  return (
    <div className="flex gap-0 spyne-animate-fade-in" style={{ minHeight: 0 }}>
      {/* Main content */}
      <div className="space-y-5" style={{ flex: 1, minWidth: 0, transition: 'all 250ms ease' }}>
        {/* Back + header */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <button onClick={onBack} className="spyne-btn-ghost" style={{ marginLeft: -10 }}>
              <ArrowLeft size={14} />
            </button>
            <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Campaign /</span>
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="spyne-title" style={{ color: 'var(--spyne-text-primary)', fontSize: 24 }}>{campaign.name}</h1>
                <button className="spyne-btn-ghost" style={{ padding: 4 }}><Copy size={14} style={{ color: 'var(--spyne-text-muted)' }} /></button>
                <span
                  className="spyne-badge flex items-center gap-1.5"
                  style={{ background: st.bg, color: st.color, borderColor: st.border, padding: '4px 12px', borderRadius: 'var(--spyne-radius-pill)' }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                  {st.label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {campaign.status === 'active' ? (
                <button className="spyne-btn-secondary"><Pause size={13} /> Pause</button>
              ) : campaign.status === 'paused' ? (
                <button className="spyne-btn-primary"><Play size={13} /> Resume</button>
              ) : null}
              <button className="spyne-btn-secondary" onClick={onEditWorkflow}><Edit3 size={13} /> Edit Workflow</button>
            </div>
          </div>

          {/* Metadata row */}
          <div className="flex items-center gap-8 mt-4 flex-wrap">
            <div>
              <span className="spyne-caption block" style={{ color: 'var(--spyne-text-muted)', marginBottom: 2 }}>Scheduled for:</span>
              <span className="spyne-label font-medium" style={{ color: 'var(--spyne-text-primary)' }}>{campaign.createdAt}</span>
            </div>
            <div>
              <span className="spyne-caption block" style={{ color: 'var(--spyne-text-muted)', marginBottom: 2 }}>Campaign Type</span>
              <span className="spyne-label font-medium flex items-center gap-1.5" style={{ color: 'var(--spyne-success-text)' }}>
                <Target size={13} />
                {campaign.type}
              </span>
            </div>
            <div>
              <span className="spyne-caption block" style={{ color: 'var(--spyne-text-muted)', marginBottom: 2 }}>Created on:</span>
              <span className="spyne-label font-medium" style={{ color: 'var(--spyne-text-primary)' }}>{campaign.createdAt}</span>
            </div>
            <div>
              <span className="spyne-caption block" style={{ color: 'var(--spyne-text-muted)', marginBottom: 2 }}>Agents Deployed:</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)' }}>
                  V
                </div>
                <span className="spyne-label font-medium" style={{ color: 'var(--spyne-text-primary)' }}>Vini AI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b" style={{ borderColor: 'var(--spyne-border)' }}>
          {detailTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2.5 border-b-2 transition-colors cursor-pointer"
              style={{
                borderColor: activeTab === tab.id ? 'var(--spyne-brand)' : 'transparent',
                color: activeTab === tab.id ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                fontSize: 13,
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--spyne-brand)' : 'transparent'}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && <DetailOverviewTab campaign={campaign} onLeadClick={(lead) => setCustomerPanelLead(lead)} />}
        {activeTab === 'workflow' && <DetailWorkflowTab campaign={campaign} onEdit={onEditWorkflow} />}
        {activeTab === 'leads' && <DetailLeadsTab campaign={campaign} selectedLead={selectedLead} onSelectLead={(lead) => setCustomerPanelLead(lead)} />}
        {activeTab === 'analytics' && <DetailAnalyticsTab campaign={campaign} />}
      </div>

      {/* Right-side CustomerOverviewPanel (#5) */}
      {customerPanelLead && (
        <div style={{ width: 420, flexShrink: 0, borderLeft: '1px solid var(--spyne-border)', marginTop: -20, marginBottom: -20, marginRight: -20, animation: 'spyne-slide-in-right 200ms cubic-bezier(0.0,0,0.2,1) both' }}>
          <CustomerOverviewPanel
            customer={buildCustomerForPanel(customerPanelLead)}
            onClose={() => setCustomerPanelLead(null)}
            onViewProfile={() => {}}
            inline
          />
        </div>
      )}
    </div>
  )
}

/* ─── Campaign Funnel — area chart card style ──────────────────── */

function FunnelAreaGraph({ data, maxValue, fill = '#4600F2', animationDelay = 0 }) {
  return (
    <ResponsiveContainer height={82} width="100%">
      <AreaChart data={data} margin={{ bottom: 0, left: 0, right: 0, top: 5 }} syncMethod="index">
        <YAxis domain={[0, maxValue]} hide />
        <Area
          dataKey="value"
          fill={fill}
          stroke="transparent"
          type="monotone"
          isAnimationActive={true}
          animationDuration={500}
          animationBegin={animationDelay}
          animationEasing="linear"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function FunnelConversionChip({ value, index, color = '#A78BFA' }) {
  return (
    <div
      className="absolute top-[50%] flex translate-y-[50%] items-center justify-center rounded-2xl bg-white px-2 py-1.5"
      style={{
        left: `${(100 / 5) * (index + 1)}%`,
        transform: 'translateX(-50%)',
        boxShadow: `0px 0px 82.11px 0px ${color}`,
        fontSize: 11,
        fontWeight: 700,
        zIndex: 10,
      }}
    >
      {value}
    </div>
  )
}

function CampaignFunnelCards({ stages }) {
  const maxValue = useMemo(() => Math.max(...stages.map((s) => s.count), 1), [stages])
  const conversionRates = useMemo(
    () =>
      stages.slice(0, -1).map((s, i) =>
        s.count > 0 ? `${Math.round((stages[i + 1].count / s.count) * 1000) / 10}%` : '-'
      ),
    [stages]
  )

  const getAreaData = (item, index) => {
    const next = index < stages.length - 1 ? stages[index + 1].count : item.count
    return [
      { value: item.count, name: '' },
      { value: next, name: '' },
    ]
  }

  return (
    <div className="spyne-card p-5">
      <span className="spyne-subheading mb-5 block" style={{ fontWeight: 600 }}>Campaign Funnel</span>
      <div className="relative flex w-full justify-between gap-x-3">
        {stages.map((stage, index) => (
          <div
            key={stage.label}
            className="flex w-full flex-col justify-between overflow-hidden"
            style={{ backgroundColor: '#4600F20F', borderRadius: 'var(--spyne-radius-md, 8px)' }}
          >
            <div className="flex flex-col p-4">
              <span className="spyne-caption font-medium" style={{ color: 'var(--spyne-text-secondary)' }}>
                {stage.label}
              </span>
              <span className="spyne-number" style={{ fontSize: 20, color: 'var(--spyne-text-primary)', marginTop: 2 }}>
                {stage.count.toLocaleString()}
              </span>
            </div>
            <FunnelAreaGraph
              data={getAreaData(stage, index)}
              maxValue={maxValue}
              animationDelay={index * 500}
              fill="#4600F2"
            />
          </div>
        ))}
        {conversionRates.map((rate, index) => (
          <FunnelConversionChip key={`conv-${index}`} value={rate} index={index} color="#A78BFA" />
        ))}
      </div>
    </div>
  )
}

/* ─── Detail: Overview Tab (#2, #3, #4 — time filter, funnel, outcome breakdown) ── */

function DetailOverviewTab({ campaign, onLeadClick }) {
  const [leadSearch, setLeadSearch] = useState('')
  const [outcomeFilter, setOutcomeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAllLeads, setShowAllLeads] = useState(false)
  const [timeRange, setTimeRange] = useState('today') // 'today' | 'all'
  const [allTimeFilter, setAllTimeFilter] = useState('all') // 'all' | 'mtd' | 'wtd'

  const LEAD_STATUS = {
    active:    { label: 'Active',    color: 'var(--spyne-brand-dark)',   bg: 'var(--spyne-brand-subtle)' },
    responded: { label: 'Responded', color: 'var(--spyne-success-text)', bg: 'var(--spyne-success-subtle)' },
    booked:    { label: 'Booked',    color: 'var(--spyne-success-text)', bg: 'var(--spyne-success-subtle)' },
    completed: { label: 'Completed', color: 'var(--spyne-text-muted)',   bg: 'var(--spyne-surface-hover)' },
    dropped:   { label: 'Dropped',   color: 'var(--spyne-danger-text)',  bg: 'var(--spyne-danger-subtle)' },
  }

  // Compute outcome breakdown metrics (#4)
  const totalLeads = campaign.leadsEnrolled || 0
  const voicemailLeads = campaign.enrolledLeads.filter(l => l.callOutcome === 'voicemail').length
  const failedLeads = campaign.enrolledLeads.filter(l => l.callOutcome === 'no_answer' || l.callOutcome === 'no_speak').length
  const connectedLeads = campaign.enrolledLeads.filter(l => l.callOutcome === 'connected')
  const avgDurationSecs = connectedLeads.length > 0
    ? connectedLeads.reduce((sum, l) => {
        const parts = (l.callDuration || '0:00').split(':')
        return sum + (parseInt(parts[0]) * 60 + parseInt(parts[1]))
      }, 0) / connectedLeads.length
    : 0
  const avgMin = Math.floor(avgDurationSecs / 60)
  const avgSec = Math.round(avgDurationSecs % 60)
  const rejectedLeads = campaign.enrolledLeads.filter(l => l.status === 'dropped').length
  const noSpeakLeads = campaign.enrolledLeads.filter(l => l.callOutcome === 'no_speak').length
  const noAnswerLeads = campaign.enrolledLeads.filter(l => l.callOutcome === 'no_answer').length

  const voicemailPct = totalLeads ? Math.round((voicemailLeads / totalLeads) * 100) : 0
  const failedPct = totalLeads ? Math.round((failedLeads / totalLeads) * 100) : 0
  const rejectedPct = totalLeads ? Math.round((rejectedLeads / totalLeads) * 100) : 0
  const connectedPct = totalLeads ? Math.round((connectedLeads.length / totalLeads) * 100) : 0
  const noSpeakPct = totalLeads ? Math.round((noSpeakLeads / totalLeads) * 100) : 0
  const noAnswerPct = totalLeads ? Math.round((noAnswerLeads / totalLeads) * 100) : 0

  // Filter leads
  const filteredLeads = campaign.enrolledLeads.filter((lead) => {
    if (leadSearch.length >= 3) {
      const q = leadSearch.toLowerCase()
      if (!lead.name.toLowerCase().includes(q) && !lead.phone?.includes(q)) return false
    }
    if (outcomeFilter !== 'all' && lead.callOutcome !== outcomeFilter) return false
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false
    return true
  })
  const visibleLeads = showAllLeads ? filteredLeads : filteredLeads.slice(0, 10)

  const enrolled = campaign.enrolledLeads || []
  const funnelLeads =
    timeRange === 'today'
      ? enrolled.filter((l) => l.callDaysAgo === 0)
      : allTimeFilter === 'wtd'
        ? enrolled.filter((l) => (l.callDaysAgo ?? 999) <= 7)
        : allTimeFilter === 'mtd'
          ? enrolled.filter((l) => (l.callDaysAgo ?? 999) <= 30)
          : enrolled

  // Funnel stages (#3 — proper 5-stage funnel; cohort follows Today / All Time + MTD/WTD)
  const totalPeople = funnelLeads.length
  const funnelConnected = funnelLeads.filter((l) => l.callOutcome === 'connected')
  const initiated = funnelLeads.filter((l) => l.callOutcome).length
  const qualified = funnelLeads.filter(
    (l) => l.callOutcome === 'connected' || l.status === 'responded' || l.status === 'booked'
  ).length
  const contactedSuccessfully = funnelConnected.length
  const appointmentScheduled = funnelLeads.filter((l) => l.status === 'booked' || l.appointmentDate).length

  const funnelStages = [
    { label: 'Total People', count: totalPeople },
    { label: 'Initiated', count: initiated },
    { label: 'Qualified', count: qualified },
    { label: 'Contacted Successfully', count: contactedSuccessfully },
    { label: 'Appointment Scheduled', count: appointmentScheduled },
  ]

  return (
    <div className="space-y-6">
      {/* ── Time Range Filter (#2) ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['today', 'all'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`spyne-pill ${timeRange === t ? 'spyne-pill-active' : ''}`}
              style={{ height: 32, fontSize: 12, padding: '0 14px', fontWeight: 600 }}
            >
              {t === 'today' ? 'Today' : 'All Time'}
            </button>
          ))}
          {timeRange === 'all' && (
            <div className="flex items-center gap-1 ml-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'mtd', label: 'MTD' },
                { id: 'wtd', label: 'WTD' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setAllTimeFilter(f.id)}
                  className="px-2.5 py-1 cursor-pointer transition-all"
                  style={{
                    borderRadius: 'var(--spyne-radius-sm)',
                    border: allTimeFilter === f.id ? '2px solid var(--spyne-brand)' : '1px solid var(--spyne-border)',
                    background: allTimeFilter === f.id ? 'var(--spyne-brand-subtle)' : 'transparent',
                    color: allTimeFilter === f.id ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Campaign Funnel (#3 — area-chart card style) ── */}
      <CampaignFunnelCards stages={funnelStages} />

      {/* ── Outcome Breakdown ── */}
      <div className="spyne-card p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="spyne-subheading" style={{ fontWeight: 600 }}>Outcome Breakdown</span>
          <span className="spyne-caption tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>{totalLeads} total calls</span>
        </div>
        <div className="space-y-2.5">
          {[
            { label: 'Connected',      count: connectedLeads.length, pct: connectedPct, color: 'var(--spyne-success)',     icon: Phone },
            { label: 'Voicemail',       count: voicemailLeads,        pct: voicemailPct, color: 'var(--spyne-warning)',     icon: VoicemailIcon },
            { label: 'No Answer',       count: noAnswerLeads,         pct: noAnswerPct,  color: 'var(--spyne-info)',        icon: PhoneMissed },
            { label: 'No Speak',        count: noSpeakLeads,          pct: noSpeakPct,   color: 'var(--spyne-text-muted)',  icon: XCircle },
            { label: 'Failed',          count: failedLeads,           pct: failedPct,    color: 'var(--spyne-danger)',      icon: PhoneOff },
            { label: 'Rejected',        count: rejectedLeads,         pct: rejectedPct,  color: 'var(--spyne-brand)',       icon: UserX },
          ].map((item) => {
            const RowIcon = item.icon
            return (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex items-center gap-2 shrink-0" style={{ width: 120 }}>
                  <RowIcon size={13} style={{ color: item.color, flexShrink: 0 }} />
                  <span className="spyne-caption font-medium" style={{ color: 'var(--spyne-text-secondary)' }}>{item.label}</span>
                </div>
                <div className="flex-1 h-6 rounded overflow-hidden relative" style={{ background: 'var(--spyne-surface-hover)' }}>
                  <div
                    className="h-full rounded transition-all"
                    style={{ width: `${Math.max(item.pct, item.count > 0 ? 3 : 0)}%`, background: item.color, opacity: 0.8 }}
                  />
                </div>
                <span className="spyne-label tabular-nums font-semibold shrink-0" style={{ width: 36, textAlign: 'right', color: 'var(--spyne-text-primary)' }}>{item.count}</span>
                <span className="spyne-caption tabular-nums shrink-0" style={{ width: 36, textAlign: 'right', color: 'var(--spyne-text-muted)' }}>{item.pct}%</span>
              </div>
            )
          })}
        </div>
        {/* Avg duration footnote */}
        <div className="flex items-center gap-2 mt-4 pt-3" style={{ borderTop: '1px solid var(--spyne-border)' }}>
          <Clock size={12} style={{ color: 'var(--spyne-text-muted)' }} />
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
            Avg. call duration (connected): <strong style={{ color: 'var(--spyne-text-primary)' }}>{avgMin}:{String(avgSec).padStart(2, '0')}</strong>
          </span>
        </div>
      </div>

      {/* ── Search & filter bar for leads ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <div className="relative" style={{ minWidth: 260 }}>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--spyne-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by customer, phone (min 3 chars)"
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              className="spyne-input pl-9"
              style={{ width: '100%', fontSize: 13 }}
            />
          </div>
          <div className="relative">
            <select value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)} className="spyne-input pr-8 appearance-none cursor-pointer" style={{ fontSize: 13, minWidth: 140, paddingRight: 30 }}>
              <option value="all">All Outcomes</option>
              <option value="connected">Connected</option>
              <option value="voicemail">Voicemail</option>
              <option value="no_answer">No Answer</option>
              <option value="no_speak">No Speak</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--spyne-text-muted)' }} />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="spyne-input pr-8 appearance-none cursor-pointer" style={{ fontSize: 13, minWidth: 130, paddingRight: 30 }}>
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="responded">Responded</option>
              <option value="booked">Booked</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--spyne-text-muted)' }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
            {filteredLeads.length} result{filteredLeads.length !== 1 ? 's' : ''} found
          </span>
          <button className="spyne-btn-secondary" style={{ fontSize: 13 }}>
            <Download size={13} /> Download
          </button>
        </div>
      </div>

      {/* ── Leads Table (#5 — click opens CustomerOverviewPanel) ── */}
      <div className="spyne-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--spyne-surface-hover)' }}>
              <th className="text-left px-5 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>
                <div className="flex items-center gap-1">Customer Details <ChevronDown size={12} /></div>
              </th>
              <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Vehicle Interest</th>
              <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Status</th>
              <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>
                <div className="flex items-center gap-1">Timestamp <ChevronDown size={12} /></div>
              </th>
              <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Duration</th>
              <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Outcome</th>
              <th className="text-right px-5 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>
                <div className="flex items-center gap-1 justify-end">Quality Score <ChevronDown size={12} /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--spyne-border)' }}>
            {visibleLeads.map((lead) => {
              const outcomeConfig = {
                connected: { label: 'Connected', color: 'var(--spyne-success-text)', bg: 'var(--spyne-success-subtle)' },
                voicemail: { label: 'Voicemail', color: 'var(--spyne-warning-text)', bg: 'var(--spyne-warning-subtle)' },
                no_answer: { label: 'No Answer', color: 'var(--spyne-danger-text)', bg: 'var(--spyne-danger-subtle)' },
                no_speak:  { label: 'Call Failed', color: 'var(--spyne-danger-text)', bg: 'var(--spyne-danger-subtle)' },
              }
              const oc = outcomeConfig[lead.callOutcome] || outcomeConfig.no_answer
              return (
                <tr
                  key={lead.id}
                  className="transition-colors cursor-pointer"
                  onClick={() => onLeadClick?.(lead)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--spyne-surface-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = ''}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)' }}>
                        {lead.initials}
                      </div>
                      <div>
                        <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>{lead.name}</span>
                        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{lead.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <Car size={12} style={{ color: 'var(--spyne-text-muted)', flexShrink: 0 }} />
                      <span className="spyne-caption font-medium" style={{ color: 'var(--spyne-text-secondary)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {lead.vehicle || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="spyne-caption px-2 py-0.5 inline-flex items-center gap-1" style={{ borderRadius: 'var(--spyne-radius-pill)', background: oc.bg, color: oc.color }}>
                      {lead.callOutcome === 'no_speak' || lead.callOutcome === 'no_answer' ? <XCircle size={11} /> : null}
                      {oc.label}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div>
                      <span className="spyne-caption block" style={{ color: 'var(--spyne-text-primary)' }}>{lead.callTimestamp?.split(',')[0]}</span>
                      <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{lead.callTimestamp?.split(',').slice(1).join(',').trim()}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="spyne-caption tabular-nums" style={{ color: 'var(--spyne-text-secondary)' }}>
                      {lead.callDuration && lead.callDuration !== '0:00' ? lead.callDuration : '--'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
                      {lead.callOutcome === 'connected' ? 'Qualified' : '--'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="spyne-caption tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>
                      {lead.callOutcome === 'connected' && lead.callDuration !== '0:00' ? '85%' : '--'}
                    </span>
                  </td>
                </tr>
              )
            })}
            {visibleLeads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center">
                  <span className="spyne-body-sm" style={{ color: 'var(--spyne-text-muted)' }}>No leads found</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--spyne-border)', background: 'var(--spyne-surface)' }}>
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
            1-{visibleLeads.length} of {filteredLeads.length}
          </span>
          <div className="flex items-center gap-2">
            {!showAllLeads && filteredLeads.length > 10 && (
              <button className="spyne-btn-primary" style={{ fontSize: 12, padding: '6px 16px' }} onClick={() => setShowAllLeads(true)}>View More</button>
            )}
            {showAllLeads && filteredLeads.length > 10 && (
              <button className="spyne-btn-secondary" style={{ fontSize: 12, padding: '6px 16px' }} onClick={() => setShowAllLeads(false)}>Show Less</button>
            )}
            <span className="spyne-caption tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>
              1 / {Math.ceil(filteredLeads.length / 10)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Campaign Details & Channel Breakdown ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="spyne-card overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--spyne-border)' }}>
            <span className="spyne-subheading" style={{ fontWeight: 600 }}>Campaign Details</span>
          </div>
          <div className="p-5 space-y-4">
            <DetailInfoRow icon={Target} label="Type" value={campaign.type} valueColor="var(--spyne-brand)" />
            <DetailInfoRow icon={Zap} label="Trigger" value={campaign.triggerDescription} />
            <DetailInfoRow icon={Calendar} label="Created" value={campaign.createdAt} />
            <DetailInfoRow icon={GitBranch} label="Sequence" value={`${campaign.workflowSteps.length} steps`} />
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--spyne-surface-hover)' }}>
                <MessageSquare size={14} style={{ color: 'var(--spyne-text-muted)' }} />
              </div>
              <div className="flex-1">
                <span className="spyne-caption block" style={{ color: 'var(--spyne-text-muted)', marginBottom: 4 }}>Channels</span>
                <div className="flex items-center gap-2">
                  {campaign.channels.map((ch) => {
                    const ChIcon = CHANNEL_ICON[ch] || MessageSquare
                    return (
                      <span key={ch} className="spyne-caption px-2.5 py-1 flex items-center gap-1.5" style={{ background: 'var(--spyne-surface-hover)', borderRadius: 'var(--spyne-radius-pill)', color: 'var(--spyne-text-secondary)' }}>
                        <ChIcon size={12} /> {ch}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="spyne-card overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--spyne-border)' }}>
            <span className="spyne-subheading" style={{ fontWeight: 600 }}>Channel Breakdown</span>
          </div>
          <div className="p-5 space-y-4">
            {campaign.channelBreakdown.map((ch) => {
              const maxSent = Math.max(...campaign.channelBreakdown.map(c => c.sent))
              const barPct = maxSent > 0 ? (ch.sent / maxSent) * 100 : 0
              return (
                <div key={ch.channel} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--spyne-surface-hover)' }}>
                        <ch.icon size={14} style={{ color: 'var(--spyne-text-muted)' }} />
                      </div>
                      <div>
                        <span className="spyne-label font-medium block" style={{ color: 'var(--spyne-text-primary)' }}>{ch.channel}</span>
                        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{ch.sent} sent</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="spyne-number" style={{ fontSize: 18, color: 'var(--spyne-success-text)' }}>{ch.responseRate}%</span>
                      <span className="spyne-caption block" style={{ color: 'var(--spyne-text-muted)' }}>response</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--spyne-border)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${barPct}%`, background: ch.responseRate >= 50 ? 'var(--spyne-success)' : ch.responseRate >= 30 ? 'var(--spyne-brand)' : 'var(--spyne-warning)' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, iconColor, iconBg, label, value }) {
  return (
    <div className="spyne-card p-4 flex items-center gap-3" style={{ border: '1px solid var(--spyne-border)' }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        <Icon size={16} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{label}</span>
        </div>
        <span className="spyne-label font-bold tabular-nums" style={{ color: 'var(--spyne-text-primary)', fontSize: 14 }}>{value}</span>
      </div>
    </div>
  )
}

function DetailInfoRow({ icon: Icon, label, value, valueColor }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--spyne-surface-hover)' }}>
        <Icon size={14} style={{ color: 'var(--spyne-text-muted)' }} />
      </div>
      <div className="flex-1">
        <span className="spyne-caption block" style={{ color: 'var(--spyne-text-muted)', marginBottom: 1 }}>{label}</span>
        <span className="spyne-label font-medium" style={{ color: valueColor || 'var(--spyne-text-primary)' }}>{value}</span>
      </div>
    </div>
  )
}

function KPICard({ label, value, highlight }) {
  return (
    <div className="spyne-card p-4">
      <span className="spyne-caption block mb-1" style={{ color: 'var(--spyne-text-muted)' }}>{label}</span>
      <span className="spyne-number" style={{ fontSize: 22, color: highlight ? 'var(--spyne-success-text)' : 'var(--spyne-text-primary)' }}>{value}</span>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="spyne-body-sm" style={{ color: 'var(--spyne-text-muted)' }}>{label}</span>
      <span className="spyne-body-sm font-medium" style={{ color: 'var(--spyne-text-primary)' }}>{value}</span>
    </div>
  )
}

/* ─── Detail: Workflow Tab (read-only preview) ───────────────────── */

function DetailWorkflowTab({ campaign, onEdit }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="spyne-body-sm" style={{ color: 'var(--spyne-text-muted)' }}>
          {campaign.workflowSteps.length} steps in this workflow
        </span>
        <button className="spyne-btn-primary" onClick={onEdit}>
          <Edit3 size={13} /> Edit Workflow
        </button>
      </div>
      <WorkflowPreview steps={campaign.workflowSteps} />
    </div>
  )
}

function WorkflowPreview({ steps }) {
  return (
    <div className="spyne-card p-6 overflow-x-auto">
      <div className="flex items-start gap-0 min-w-min">
        {steps.map((step, i) => {
          const cfg = STEP_TYPE_CONFIG[step.type] || STEP_TYPE_CONFIG.action
          const Icon = cfg.icon
          return (
            <div key={step.id} className="flex items-start">
              <div className="flex flex-col items-center" style={{ width: 160 }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2" style={{ background: cfg.bg, border: `2px solid ${cfg.color}` }}>
                  <Icon size={20} strokeWidth={2} style={{ color: cfg.color }} />
                </div>
                <span className="spyne-label text-center font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{step.label}</span>
                {step.config?.delay && <span className="spyne-caption mt-0.5" style={{ color: 'var(--spyne-text-muted)' }}>{step.config.delay}</span>}
                {step.config?.template && <span className="spyne-caption mt-0.5 text-center" style={{ color: 'var(--spyne-text-muted)' }}>{step.config.template}</span>}
                {step.metrics && (
                  <div className="mt-2 px-2 py-1 text-center" style={{ borderRadius: 'var(--spyne-radius-sm)', background: 'var(--spyne-surface-hover)' }}>
                    <span className="spyne-caption tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>
                      {step.metrics.conversionPct !== undefined ? `${step.metrics.conversionPct}% pass-through` : ''}
                    </span>
                  </div>
                )}
              </div>
              {i < steps.length - 1 && (
                <div className="flex items-center self-center mt-[-20px] px-1" style={{ paddingTop: 6 }}>
                  <div className="w-8 h-0.5" style={{ background: 'var(--spyne-border-strong)' }} />
                  <ArrowRight size={14} style={{ color: 'var(--spyne-border-strong)', margin: '-0 -4px' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Detail: Leads Tab ──────────────────────────────────────────── */

function DetailLeadsTab({ campaign, selectedLead, onSelectLead }) {
  const LEAD_STATUS = {
    active:    { label: 'Active',    color: 'var(--spyne-brand-dark)',   bg: 'var(--spyne-brand-subtle)' },
    responded: { label: 'Responded', color: 'var(--spyne-success-text)', bg: 'var(--spyne-success-subtle)' },
    booked:    { label: 'Booked',    color: 'var(--spyne-success-text)', bg: 'var(--spyne-success-subtle)' },
    completed: { label: 'Completed', color: 'var(--spyne-text-muted)',   bg: 'var(--spyne-surface-hover)' },
    dropped:   { label: 'Dropped',   color: 'var(--spyne-danger-text)',  bg: 'var(--spyne-danger-subtle)' },
  }

  return (
    <div className="spyne-card overflow-hidden" style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 340px)' }}>
      <div style={{ overflowY: 'auto', flex: 1 }}>
      <table className="w-full">
        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <tr style={{ background: 'var(--spyne-surface-hover)' }}>
            <th className="text-left px-5 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Lead</th>
            <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Vehicle</th>
            <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Current Step</th>
            <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Status</th>
            <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Last Activity</th>
            <th className="text-right px-5 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Next Touch</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--spyne-border)' }}>
          {campaign.enrolledLeads.map((lead) => {
            const ls = LEAD_STATUS[lead.status] || LEAD_STATUS.active
            const isSelected = selectedLead?.id === lead.id
            return (
              <tr
                key={lead.id}
                className="transition-colors cursor-pointer"
                onClick={() => onSelectLead?.(lead)}
                style={{ background: isSelected ? 'var(--spyne-brand-subtle)' : undefined }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--spyne-surface-hover)' }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = '' }}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: isSelected ? 'var(--spyne-brand)' : 'var(--spyne-brand-subtle)', color: isSelected ? '#fff' : 'var(--spyne-brand)' }}>
                      {lead.initials}
                    </div>
                    <div>
                      <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>{lead.name}</span>
                      <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{lead.source}</span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="spyne-body-sm" style={{ color: 'var(--spyne-text-secondary)' }}>{lead.vehicle}</span>
                </td>
                <td className="px-3 py-3">
                  <span className="spyne-caption font-medium" style={{ color: 'var(--spyne-text-primary)' }}>
                    Step {lead.currentStep}/{campaign.workflowSteps.length}
                  </span>
                  <span className="spyne-caption block" style={{ color: 'var(--spyne-text-muted)' }}>
                    {campaign.workflowSteps[lead.currentStep - 1]?.label}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="spyne-caption px-2 py-0.5" style={{ borderRadius: 'var(--spyne-radius-pill)', background: ls.bg, color: ls.color }}>{ls.label}</span>
                </td>
                <td className="px-3 py-3">
                  <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{lead.lastActivity}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="spyne-caption tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>{lead.nextTouch}</span>
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

/* ─── Detail: Analytics Tab (#12 — detailed analytics) ─────────── */

function DetailAnalyticsTab({ campaign }) {
  const totalLeads = campaign.leadsEnrolled || 0
  const connectedLeads = campaign.enrolledLeads.filter(l => l.callOutcome === 'connected')
  const voicemailLeads = campaign.enrolledLeads.filter(l => l.callOutcome === 'voicemail').length
  const noAnswerLeads = campaign.enrolledLeads.filter(l => l.callOutcome === 'no_answer').length
  const bookedLeads = campaign.enrolledLeads.filter(l => l.status === 'booked').length
  const respondedLeads = campaign.enrolledLeads.filter(l => l.status === 'responded').length
  const droppedLeads = campaign.enrolledLeads.filter(l => l.status === 'dropped').length

  const avgDurationSecs = connectedLeads.length > 0
    ? connectedLeads.reduce((sum, l) => {
        const parts = (l.callDuration || '0:00').split(':')
        return sum + (parseInt(parts[0]) * 60 + parseInt(parts[1]))
      }, 0) / connectedLeads.length
    : 0
  const avgMin = Math.floor(avgDurationSecs / 60)
  const avgSec = Math.round(avgDurationSecs % 60)

  const connectRate = totalLeads ? Math.round((connectedLeads.length / totalLeads) * 100) : 0
  const bookingRate = connectedLeads.length ? Math.round((bookedLeads / connectedLeads.length) * 100) : 0
  const dropRate = totalLeads ? Math.round((droppedLeads / totalLeads) * 100) : 0

  // Simulated daily data for charts
  const dailyData = [
    { day: 'Mon', calls: 18, appts: 3, connected: 12 },
    { day: 'Tue', calls: 24, appts: 5, connected: 16 },
    { day: 'Wed', calls: 21, appts: 4, connected: 14 },
    { day: 'Thu', calls: 28, appts: 6, connected: 19 },
    { day: 'Fri', calls: 15, appts: 2, connected: 10 },
    { day: 'Sat', calls: 8, appts: 1, connected: 5 },
    { day: 'Sun', calls: 4, appts: 0, connected: 2 },
  ]
  const maxCalls = Math.max(...dailyData.map(d => d.calls))

  // Hourly heatmap data
  const hourlyData = Array.from({ length: 12 }, (_, i) => ({
    hour: `${i + 8}${i + 8 < 12 ? 'am' : 'pm'}`,
    pickupRate: Math.round(30 + Math.random() * 50),
  }))

  return (
    <div className="space-y-5">
      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="spyne-card p-4">
          <span className="spyne-caption block mb-1" style={{ color: 'var(--spyne-text-muted)' }}>Total Calls</span>
          <span className="spyne-number" style={{ fontSize: 24, color: 'var(--spyne-text-primary)' }}>{totalLeads}</span>
        </div>
        <div className="spyne-card p-4">
          <span className="spyne-caption block mb-1" style={{ color: 'var(--spyne-text-muted)' }}>Connect Rate</span>
          <span className="spyne-number" style={{ fontSize: 24, color: 'var(--spyne-success-text)' }}>{connectRate}%</span>
        </div>
        <div className="spyne-card p-4">
          <span className="spyne-caption block mb-1" style={{ color: 'var(--spyne-text-muted)' }}>Avg Duration</span>
          <span className="spyne-number" style={{ fontSize: 24, color: 'var(--spyne-text-primary)' }}>{avgMin}:{String(avgSec).padStart(2, '0')}</span>
        </div>
        <div className="spyne-card p-4">
          <span className="spyne-caption block mb-1" style={{ color: 'var(--spyne-text-muted)' }}>Appts Booked</span>
          <span className="spyne-number" style={{ fontSize: 24, color: 'var(--spyne-success-text)' }}>{bookedLeads}</span>
        </div>
        <div className="spyne-card p-4">
          <span className="spyne-caption block mb-1" style={{ color: 'var(--spyne-text-muted)' }}>Booking Rate</span>
          <span className="spyne-number" style={{ fontSize: 24, color: 'var(--spyne-brand)' }}>{bookingRate}%</span>
        </div>
        <div className="spyne-card p-4">
          <span className="spyne-caption block mb-1" style={{ color: 'var(--spyne-text-muted)' }}>Drop Rate</span>
          <span className="spyne-number" style={{ fontSize: 24, color: 'var(--spyne-danger-text)' }}>{dropRate}%</span>
        </div>
      </div>

      {/* Funnel */}
      <CampaignFunnelCards stages={campaign.funnel} />

      {/* Daily Performance Chart */}
      <div className="spyne-card p-5">
        <span className="spyne-subheading mb-4 block" style={{ fontWeight: 600 }}>Daily Performance</span>
        <div className="flex items-end gap-3" style={{ height: 180 }}>
          {dailyData.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center gap-0.5" style={{ height: 140 }}>
                <div className="w-full flex items-end justify-center gap-1" style={{ height: '100%' }}>
                  <div className="rounded-t" style={{ width: '30%', height: `${(d.calls / maxCalls) * 100}%`, background: 'var(--spyne-brand)', minHeight: 4 }} title={`${d.calls} calls`} />
                  <div className="rounded-t" style={{ width: '30%', height: `${(d.connected / maxCalls) * 100}%`, background: 'var(--spyne-success)', minHeight: 4 }} title={`${d.connected} connected`} />
                  <div className="rounded-t" style={{ width: '30%', height: `${(d.appts / maxCalls) * 100}%`, background: 'var(--spyne-warning)', minHeight: 4 }} title={`${d.appts} appts`} />
                </div>
              </div>
              <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{d.day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: 'var(--spyne-brand)' }} /><span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Calls</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: 'var(--spyne-success)' }} /><span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Connected</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: 'var(--spyne-warning)' }} /><span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Appts</span></div>
        </div>
      </div>

      {/* Outcome Distribution & Best Time Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="spyne-card p-5">
          <span className="spyne-subheading mb-4 block" style={{ fontWeight: 600 }}>Outcome Distribution</span>
          <div className="space-y-3">
            {[
              { label: 'Connected', count: connectedLeads.length, color: 'var(--spyne-success)', pct: connectRate },
              { label: 'Voicemail', count: voicemailLeads, color: 'var(--spyne-warning)', pct: totalLeads ? Math.round((voicemailLeads / totalLeads) * 100) : 0 },
              { label: 'No Answer', count: noAnswerLeads, color: 'var(--spyne-danger)', pct: totalLeads ? Math.round((noAnswerLeads / totalLeads) * 100) : 0 },
              { label: 'Responded', count: respondedLeads, color: 'var(--spyne-info)', pct: totalLeads ? Math.round((respondedLeads / totalLeads) * 100) : 0 },
              { label: 'Booked', count: bookedLeads, color: 'var(--spyne-success)', pct: totalLeads ? Math.round((bookedLeads / totalLeads) * 100) : 0 },
              { label: 'Dropped', count: droppedLeads, color: 'var(--spyne-danger-muted)', pct: dropRate },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="spyne-caption font-medium" style={{ color: 'var(--spyne-text-secondary)' }}>{item.label}</span>
                  <span className="spyne-caption tabular-nums font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{item.count} ({item.pct}%)</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--spyne-border)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${item.pct}%`, background: item.color, minWidth: item.count > 0 ? 4 : 0 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="spyne-card p-5">
          <span className="spyne-subheading mb-4 block" style={{ fontWeight: 600 }}>Best Time to Call</span>
          <div className="space-y-2">
            {hourlyData.map((h) => (
              <div key={h.hour} className="flex items-center gap-3">
                <span className="spyne-caption tabular-nums w-10 text-right shrink-0" style={{ color: 'var(--spyne-text-muted)' }}>{h.hour}</span>
                <div className="flex-1 h-5 rounded overflow-hidden" style={{ background: 'var(--spyne-border)' }}>
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${h.pickupRate}%`,
                      background: h.pickupRate >= 60 ? 'var(--spyne-success)' : h.pickupRate >= 40 ? 'var(--spyne-warning)' : 'var(--spyne-danger-muted)',
                    }}
                  />
                </div>
                <span className="spyne-caption tabular-nums w-8 shrink-0" style={{ color: h.pickupRate >= 60 ? 'var(--spyne-success-text)' : 'var(--spyne-text-muted)' }}>{h.pickupRate}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time-based metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="spyne-card p-5">
          <span className="spyne-subheading mb-2 block">Avg Response Time</span>
          <span className="spyne-number" style={{ fontSize: 28, color: 'var(--spyne-text-primary)' }}>{campaign.analytics.avgResponseTime}</span>
          <span className="spyne-caption block mt-1" style={{ color: 'var(--spyne-text-muted)' }}>from first touch</span>
        </div>
        <div className="spyne-card p-5">
          <span className="spyne-subheading mb-2 block">Avg Time to Book</span>
          <span className="spyne-number" style={{ fontSize: 28, color: 'var(--spyne-text-primary)' }}>{campaign.analytics.avgTimeToBook}</span>
          <span className="spyne-caption block mt-1" style={{ color: 'var(--spyne-text-muted)' }}>from enrollment</span>
        </div>
        <div className="spyne-card p-5">
          <span className="spyne-subheading mb-2 block">Best Performing Channel</span>
          <span className="spyne-number" style={{ fontSize: 28, color: 'var(--spyne-brand)' }}>{campaign.analytics.bestChannel}</span>
          <span className="spyne-caption block mt-1" style={{ color: 'var(--spyne-text-muted)' }}>{campaign.analytics.bestChannelRate}% response rate</span>
        </div>
      </div>

      {/* Channel Performance Comparison */}
      <div className="spyne-card p-5">
        <span className="spyne-subheading mb-4 block" style={{ fontWeight: 600 }}>Channel Performance Comparison</span>
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--spyne-surface-hover)' }}>
                <th className="text-left px-4 py-2.5 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Channel</th>
                <th className="text-right px-4 py-2.5 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Sent</th>
                <th className="text-right px-4 py-2.5 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Delivered</th>
                <th className="text-right px-4 py-2.5 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Response Rate</th>
                <th className="text-right px-4 py-2.5 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Appts</th>
                <th className="text-right px-4 py-2.5 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Cost/Appt</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--spyne-border)' }}>
              {campaign.channelBreakdown.map((ch) => (
                <tr key={ch.channel}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ch.icon size={14} style={{ color: 'var(--spyne-text-muted)' }} />
                      <span className="spyne-label font-medium" style={{ color: 'var(--spyne-text-primary)' }}>{ch.channel}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right"><span className="spyne-label tabular-nums">{ch.sent}</span></td>
                  <td className="px-4 py-3 text-right"><span className="spyne-label tabular-nums">{Math.round(ch.sent * 0.92)}</span></td>
                  <td className="px-4 py-3 text-right">
                    <span className="spyne-label tabular-nums font-semibold" style={{ color: ch.responseRate >= 50 ? 'var(--spyne-success-text)' : 'var(--spyne-text-primary)' }}>{ch.responseRate}%</span>
                  </td>
                  <td className="px-4 py-3 text-right"><span className="spyne-label tabular-nums">{Math.round(ch.sent * ch.responseRate / 100 * 0.3)}</span></td>
                  <td className="px-4 py-3 text-right"><span className="spyne-label tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>${Math.round(12 + Math.random() * 8)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── Workflow Builder ────────────────────────────────────────────── */

function WorkflowBuilder({ campaign, onBack }) {
  const [steps, setSteps] = useState(campaign.workflowSteps)
  const [selectedStep, setSelectedStep] = useState(null)
  const [showAddMenu, setShowAddMenu] = useState(null)

  const addStep = (afterIndex, type) => {
    const id = `step-${Date.now()}`
    const cfg = STEP_TYPE_CONFIG[type]
    const newStep = { id, type, label: cfg?.label || type, config: type === 'wait' ? { delay: '1 hour' } : type === 'sms' ? { template: 'New template' } : {}, metrics: null }
    const updated = [...steps]
    updated.splice(afterIndex + 1, 0, newStep)
    setSteps(updated)
    setShowAddMenu(null)
    setSelectedStep(id)
  }

  const removeStep = (id) => {
    if (steps.length <= 1) return
    setSteps(steps.filter((s) => s.id !== id))
    if (selectedStep === id) setSelectedStep(null)
  }

  const moveStep = (id, direction) => {
    const idx = steps.findIndex((s) => s.id === id)
    if (idx < 0) return
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= steps.length) return
    const updated = [...steps]
    ;[updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]]
    setSteps(updated)
  }

  const selectedStepData = steps.find((s) => s.id === selectedStep)

  return (
    <div className="space-y-5 spyne-animate-fade-in">
      <div>
        <button onClick={onBack} className="spyne-btn-ghost mb-3" style={{ marginLeft: -10 }}>
          <ArrowLeft size={14} /> Back to Campaign
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="spyne-title" style={{ color: 'var(--spyne-text-primary)' }}>Workflow Builder</h1>
            <p className="spyne-body-sm mt-0.5" style={{ color: 'var(--spyne-text-muted)' }}>{campaign.name} · {steps.length} steps</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="spyne-btn-secondary" onClick={onBack}>Cancel</button>
            <button className="spyne-btn-primary"><Check size={14} /> Save Workflow</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 spyne-card p-6 overflow-x-auto">
          <div className="flex flex-col items-center gap-0 min-w-min">
            {steps.map((step, i) => {
              const cfg = STEP_TYPE_CONFIG[step.type] || STEP_TYPE_CONFIG.action
              const Icon = cfg.icon
              const isSelected = selectedStep === step.id
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <button
                    onClick={() => setSelectedStep(step.id)}
                    className="flex items-center gap-3 px-5 py-3 transition-all cursor-pointer"
                    style={{
                      borderRadius: 'var(--spyne-radius-lg)',
                      border: isSelected ? '2px solid var(--spyne-brand)' : '2px solid var(--spyne-border)',
                      background: isSelected ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)',
                      boxShadow: isSelected ? '0 0 0 3px rgba(79, 70, 229, 0.12)' : 'var(--spyne-shadow-sm)',
                      minWidth: 280,
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                      <Icon size={18} strokeWidth={2} style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>{step.label}</span>
                      {step.config?.delay && <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Wait: {step.config.delay}</span>}
                      {step.config?.template && <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Template: {step.config.template}</span>}
                      {step.config?.script && <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Script: {step.config.script}</span>}
                    </div>
                    <span className="spyne-caption shrink-0 tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>{i + 1}</span>
                  </button>
                  {i < steps.length - 1 && (
                    <div className="flex flex-col items-center py-1 relative">
                      <div className="w-0.5 h-4" style={{ background: 'var(--spyne-border-strong)' }} />
                      <button
                        onClick={() => setShowAddMenu(showAddMenu === i ? null : i)}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer"
                        style={{
                          background: showAddMenu === i ? 'var(--spyne-brand)' : 'var(--spyne-surface)',
                          border: `2px solid ${showAddMenu === i ? 'var(--spyne-brand)' : 'var(--spyne-border-strong)'}`,
                          color: showAddMenu === i ? 'var(--spyne-brand-on)' : 'var(--spyne-text-muted)',
                        }}
                        title="Add step"
                      >
                        <Plus size={14} strokeWidth={2.5} />
                      </button>
                      {showAddMenu === i && <AddStepMenu onAdd={(type) => addStep(i, type)} onClose={() => setShowAddMenu(null)} />}
                      <div className="w-0.5 h-4" style={{ background: 'var(--spyne-border-strong)' }} />
                      <ChevronDown size={12} style={{ color: 'var(--spyne-border-strong)', marginTop: -4 }} />
                    </div>
                  )}
                </div>
              )
            })}
            <div className="flex flex-col items-center py-1">
              <div className="w-0.5 h-4" style={{ background: 'var(--spyne-border-strong)' }} />
              <button
                onClick={() => setShowAddMenu(showAddMenu === 'end' ? null : 'end')}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer relative"
                style={{
                  background: showAddMenu === 'end' ? 'var(--spyne-brand)' : 'var(--spyne-surface)',
                  border: `2px solid ${showAddMenu === 'end' ? 'var(--spyne-brand)' : 'var(--spyne-border-strong)'}`,
                  color: showAddMenu === 'end' ? 'var(--spyne-brand-on)' : 'var(--spyne-text-muted)',
                }}
                title="Add step at end"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
              {showAddMenu === 'end' && <AddStepMenu onAdd={(type) => addStep(steps.length - 1, type)} onClose={() => setShowAddMenu(null)} />}
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          {selectedStepData ? (
            <StepConfigPanel
              step={selectedStepData}
              onRemove={() => removeStep(selectedStepData.id)}
              onMoveUp={() => moveStep(selectedStepData.id, -1)}
              onMoveDown={() => moveStep(selectedStepData.id, 1)}
              stepIndex={steps.findIndex((s) => s.id === selectedStepData.id)}
              totalSteps={steps.length}
            />
          ) : (
            <div className="spyne-card p-5 text-center">
              <div className="py-12">
                <Settings size={28} style={{ color: 'var(--spyne-border-strong)', margin: '0 auto 12px' }} />
                <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-muted)' }}>Select a step to configure it</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AddStepMenu({ onAdd, onClose }) {
  const types = ['sms', 'call', 'email', 'wait', 'condition', 'action', 'transfer']
  return (
    <div className="absolute top-full mt-1 z-30 py-1.5" style={{ borderRadius: 'var(--spyne-radius-md)', background: 'var(--spyne-surface)', border: '1px solid var(--spyne-border)', boxShadow: 'var(--spyne-shadow-lg)', minWidth: 180 }}>
      {types.map((type) => {
        const cfg = STEP_TYPE_CONFIG[type]
        const Icon = cfg.icon
        return (
          <button key={type} onClick={() => onAdd(type)} className="flex items-center gap-2.5 w-full px-3 py-2 transition-colors cursor-pointer text-left" style={{ background: 'transparent', border: 'none', fontSize: 13 }} onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--spyne-surface-hover)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
              <Icon size={12} strokeWidth={2.2} style={{ color: cfg.color }} />
            </div>
            <span className="spyne-label" style={{ color: 'var(--spyne-text-primary)' }}>{cfg.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function StepConfigPanel({ step, onRemove, onMoveUp, onMoveDown, stepIndex, totalSteps }) {
  const cfg = STEP_TYPE_CONFIG[step.type] || STEP_TYPE_CONFIG.action
  const Icon = cfg.icon

  return (
    <div className="spyne-card overflow-hidden sticky top-28">
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--spyne-border)' }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: cfg.bg }}>
          <Icon size={16} strokeWidth={2} style={{ color: cfg.color }} />
        </div>
        <div className="flex-1">
          <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>{step.label}</span>
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Step {stepIndex + 1} · {cfg.label}</span>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>Step Name</label>
          <input type="text" defaultValue={step.label} className="spyne-input w-full" style={{ fontSize: 13 }} />
        </div>
        {(step.type === 'sms' || step.type === 'email') && (
          <div>
            <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>Template</label>
            <div className="relative">
              <select className="spyne-input w-full appearance-none pr-8 cursor-pointer" style={{ fontSize: 13 }}>
                <option>{step.config?.template || 'Select template'}</option>
                <option>Follow-up Day 3</option>
                <option>Re-engagement</option>
                <option>Appointment reminder</option>
                <option>Offer / Promotion</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--spyne-text-muted)' }} />
            </div>
          </div>
        )}
        {step.type === 'call' && (
          <div>
            <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>Call Script</label>
            <div className="relative">
              <select className="spyne-input w-full appearance-none pr-8 cursor-pointer" style={{ fontSize: 13 }}>
                <option>{step.config?.script || 'Select script'}</option>
                <option>Intro call</option>
                <option>Follow-up call</option>
                <option>Appointment booking</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--spyne-text-muted)' }} />
            </div>
          </div>
        )}
        {step.type === 'wait' && (
          <div>
            <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>Wait Duration</label>
            <input type="text" defaultValue={step.config?.delay || '1 hour'} className="spyne-input w-full" style={{ fontSize: 13 }} placeholder="e.g. 2 hours, 1 day" />
          </div>
        )}
        {step.type === 'condition' && (
          <div>
            <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>Condition</label>
            <div className="relative">
              <select className="spyne-input w-full appearance-none pr-8 cursor-pointer" style={{ fontSize: 13 }}>
                <option>Lead responded</option>
                <option>Appointment booked</option>
                <option>No response after wait</option>
                <option>Lead opted out</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--spyne-text-muted)' }} />
            </div>
          </div>
        )}
        {step.type === 'trigger' && (
          <div>
            <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>Trigger Source</label>
            <div className="space-y-1.5">
              {['Internet Lead', 'Phone Lead', 'Walk-in', 'Referral', 'Marketplace'].map((src) => (
                <label key={src} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={src === 'Internet Lead' || src === 'Marketplace'} />
                  <span className="spyne-body-sm" style={{ color: 'var(--spyne-text-secondary)' }}>{src}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {step.metrics && (
          <div className="p-3" style={{ borderRadius: 'var(--spyne-radius-md)', background: 'var(--spyne-surface-hover)' }}>
            <span className="spyne-caption font-semibold block mb-2" style={{ color: 'var(--spyne-text-secondary)' }}>Performance</span>
            <div className="space-y-1">
              {step.metrics.sent !== undefined && <div className="flex justify-between"><span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Sent</span><span className="spyne-caption font-semibold tabular-nums" style={{ color: 'var(--spyne-text-primary)' }}>{step.metrics.sent}</span></div>}
              {step.metrics.delivered !== undefined && <div className="flex justify-between"><span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Delivered</span><span className="spyne-caption font-semibold tabular-nums" style={{ color: 'var(--spyne-text-primary)' }}>{step.metrics.delivered}</span></div>}
              {step.metrics.connected !== undefined && <div className="flex justify-between"><span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Connected</span><span className="spyne-caption font-semibold tabular-nums" style={{ color: 'var(--spyne-text-primary)' }}>{step.metrics.connected}</span></div>}
              {step.metrics.replied !== undefined && <div className="flex justify-between"><span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Reply Rate</span><span className="spyne-caption font-semibold tabular-nums" style={{ color: 'var(--spyne-success-text)' }}>{step.metrics.replied}%</span></div>}
              {step.metrics.conversionPct !== undefined && <div className="flex justify-between"><span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Pass-through</span><span className="spyne-caption font-semibold tabular-nums" style={{ color: 'var(--spyne-text-primary)' }}>{step.metrics.conversionPct}%</span></div>}
            </div>
          </div>
        )}
      </div>
      <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--spyne-border)' }}>
        <div className="flex items-center gap-1">
          <button className="spyne-btn-ghost" onClick={onMoveUp} disabled={stepIndex === 0} style={{ opacity: stepIndex === 0 ? 0.4 : 1 }} title="Move up">Move Up</button>
          <button className="spyne-btn-ghost" onClick={onMoveDown} disabled={stepIndex === totalSteps - 1} style={{ opacity: stepIndex === totalSteps - 1 ? 0.4 : 1 }} title="Move down">Move Down</button>
        </div>
        {step.type !== 'trigger' && (
          <button className="spyne-btn-ghost" onClick={onRemove} style={{ color: 'var(--spyne-danger)' }}><Trash2 size={13} /> Remove</button>
        )}
      </div>
    </div>
  )
}

/* ─── Agent Status Pill ─────────────────────────────────────────── */

function AgentStatusPill({ agent }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2 shrink-0" style={{ borderRadius: 'var(--spyne-radius-pill)', border: '1px solid var(--spyne-border)', background: 'var(--spyne-surface)' }}>
      {agent.photo ? (
        <img src={agent.photo} alt={agent.name} className="w-7 h-7 rounded-full object-cover object-top" />
      ) : (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)' }}>{agent.name.charAt(0)}</div>
      )}
      <div className="flex flex-col">
        <span className="spyne-caption font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{agent.name}</span>
        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)', fontSize: 10 }}>{agent.role}</span>
      </div>
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: agent.status === 'online' ? 'var(--spyne-success)' : 'var(--spyne-text-muted)' }} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   CREATE CAMPAIGN WIZARD (#6, #7, #8, #9, #10 — intent step, offer template, CSV, no speed-to-lead, call settings)
   ═══════════════════════════════════════════════════════════════════ */

// #6 — Campaign intents (step before segment)
const CAMPAIGN_INTENTS = [
  { id: 'generate-appointments', label: 'Generate Appointments', desc: 'Drive showroom visits and test drives', icon: Calendar, color: 'var(--spyne-success)' },
  { id: 'move-inventory',        label: 'Move Inventory',        desc: 'Push aging or surplus vehicles off the lot', icon: Car, color: 'var(--spyne-warning)' },
  { id: 're-engage-leads',       label: 'Re-engage Cold Leads',  desc: 'Win back leads that went cold or stopped responding', icon: RefreshCw, color: 'var(--spyne-brand)' },
  { id: 'promote-offer',         label: 'Promote an Offer',      desc: 'Announce a sale, event, or special promotion', icon: Gift, color: 'var(--spyne-danger)' },
  { id: 'nurture-pipeline',      label: 'Nurture Pipeline',      desc: 'Keep warm leads engaged until they are ready to buy', icon: TrendingUp, color: 'var(--spyne-info)' },
  { id: 'recover-lost',          label: 'Recover Lost Deals',    desc: 'Re-engage lost deals with new offers or inventory', icon: Target, color: 'var(--spyne-brand)' },
  { id: 'after-hours',           label: 'After-Hours Coverage',  desc: 'Automatically engage leads arriving outside business hours', icon: Clock, color: 'var(--spyne-text-muted)' },
]

// #9 — Speed-to-lead removed from campaign types
const CAMPAIGN_TYPES = [
  { id: 're-engagement',    label: 'Re-engagement',        desc: 'Win back leads that went cold or stopped responding',            icon: RefreshCw },
  { id: 'appointment-push', label: 'Appointment Push',     desc: 'Drive showroom visits with targeted appointment outreach',       icon: Calendar },
  { id: 'lease-conquest',   label: 'Lease Conquest',       desc: 'Target expiring leases & equity-positive customers for trade-in', icon: Car },
  { id: 'inventory-push',   label: 'Inventory Push',       desc: 'Move aging or surplus inventory by matching to interested leads', icon: DollarSign },
  { id: 'lost-deal',        label: 'Lost Deal Revival',    desc: 'Re-engage lost deals with new offers, pricing, or inventory',    icon: Target },
  { id: 'after-hours',      label: 'After Hours',          desc: 'Engage leads arriving outside business hours automatically',     icon: Clock },
  { id: 'service-to-sales', label: 'Service to Sales',     desc: 'Convert service customers into new vehicle buyers',              icon: TrendingUp },
  { id: 'no-show-recovery', label: 'No-Show Recovery',     desc: 'Automatically follow up with leads who missed appointments',     icon: PhoneMissed },
  { id: 'offer-promotion',  label: 'Offer / Promotion',    desc: 'Black Friday, holiday sales, clearance events, and special offers', icon: Gift },
  { id: 'custom',           label: 'Custom',               desc: 'Build a fully custom campaign from scratch',                     icon: Settings },
]

const SEGMENT_OPTIONS = [
  { id: 'new-internet',        label: 'New Internet Leads',             count: 47,  desc: 'Fresh leads from website & marketplaces' },
  { id: 'waiting-response',    label: 'Waiting for Response',           count: 133, desc: 'Contacted but no reply yet' },
  { id: 'aged-30d',            label: 'Aged Leads — 30+ Days',          count: 89,  desc: 'Leads older than 30 days with no conversion' },
  { id: 'pre-approved',        label: 'Pre-Approved Leads',             count: 34,  desc: 'Financing pre-approved, ready to buy' },
  { id: 'lease-expired',       label: 'Lease Expired / Expiring Soon',  count: 56,  desc: 'Lease ending within 90 days' },
  { id: 'lease-exit',          label: 'Lease Exit — Equity Positive',   count: 28,  desc: 'Customers with positive equity on current lease' },
  { id: 'walk-in-no-buy',      label: 'Walk-in No-Buy',                 count: 41,  desc: 'Visited showroom but left without purchasing' },
  { id: 'lost-deal-revival',   label: 'Lost Deal Revival',              count: 73,  desc: 'Previously lost deals worth re-engaging' },
  { id: 'no-answer-loop',      label: 'No-Answer Loop',                 count: 62,  desc: 'Multiple contact attempts with no pickup' },
  { id: 'last-contacted-30d',  label: 'Last Contacted 30+ Days Ago',    count: 97,  desc: 'No outreach in over a month' },
  { id: 'no-appt-14d',         label: 'No Appointment in 14+ Days',     count: 44,  desc: 'Engaged leads with no appointment scheduled' },
  { id: 'cold-14d',            label: 'Cold 14+ Days',                  count: 68,  desc: 'No activity for 14+ days' },
  { id: 'appt-booked',         label: 'Appointment Booked',             count: 18,  desc: 'Leads with upcoming appointments' },
  { id: 'after-hours',         label: 'After-Hours Leads',              count: 12,  desc: 'Leads arriving outside business hours' },
  { id: 'service-customers',   label: 'Service Customers (60K+ mi)',    count: 214, desc: 'Service customers ripe for trade-in' },
  { id: 'custom-csv',          label: 'Custom — Upload CSV',            count: null, desc: 'Upload your own lead list from a CSV file' },
]

// #6, #8, #10 — Wizard steps updated
const WIZARD_STEPS = ['Intent', 'Type', 'Details', 'Audience', 'Call Settings']

function CreateCampaignWizard({ onClose, onComplete }) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState({
    intent: null,
    type: null,
    name: '',
    description: '',
    segment: null,
    channels: { sms: true, voice: true, email: false },
    // #8 CSV upload state
    csvFile: null,
    csvColumns: [],
    csvFieldMapping: {},
    csvPreviewRows: [],
    // Lead filters
    minAiScore: 0,
    bestTimeToCall: false,
    bestChannel: false,
    workflowTemplate: 'recommended',
    // #10 Call settings
    offers: [],
    newOffer: '',
    startDate: '',
    maxRetryAttempts: 3,
    retryDelayHours: 2,
    voicemailHandling: 'leave_message',
    voicemailMessage: 'Hi, this is Vini from the dealership. We have a great offer for you. Please call us back at your convenience.',
    bestTimeEnabled: true,
    quietHoursStart: '09:00',
    quietHoursEnd: '20:00',
    isRecurring: false,
    recurringInterval: 'weekly',
  })

  const canNext =
    (step === 0 && draft.intent) ||
    (step === 1 && draft.type) ||
    (step === 2 && draft.name.trim()) ||
    (step === 3 && (draft.segment || (draft.csvFile && Object.keys(draft.csvFieldMapping).length > 0))) ||
    step === 4

  const handleNext = () => {
    if (step < WIZARD_STEPS.length - 1) {
      setStep(step + 1)
    } else {
      onComplete(draft)
    }
  }

  // #8 CSV handling
  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target.result
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) return
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const rows = lines.slice(1, 6).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const obj = {}
        headers.forEach((h, i) => { obj[h] = vals[i] || '' })
        return obj
      })
      setDraft({
        ...draft,
        segment: 'custom-csv',
        csvFile: file,
        csvColumns: headers,
        csvPreviewRows: rows,
        csvFieldMapping: {},
      })
    }
    reader.readAsText(file)
  }

  // Intent recommendations based on selection
  const intentRecommendations = {
    'generate-appointments': ['appointment-push', 'no-show-recovery'],
    'move-inventory':        ['inventory-push'],
    're-engage-leads':       ['re-engagement', 'lost-deal'],
    'promote-offer':         ['offer-promotion'],
    'nurture-pipeline':      ['re-engagement', 'lease-conquest'],
    'recover-lost':          ['lost-deal', 're-engagement'],
    'after-hours':           ['after-hours'],
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div
        className="spyne-animate-scale-in"
        style={{
          width: 620,
          maxWidth: '95vw',
          maxHeight: '90vh',
          borderRadius: 'var(--spyne-radius-xl)',
          background: 'var(--spyne-surface)',
          boxShadow: 'var(--spyne-shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between" style={{ borderBottom: '1px solid var(--spyne-border)' }}>
          <div>
            <h2 className="spyne-title" style={{ color: 'var(--spyne-text-primary)' }}>Create Campaign</h2>
            <p className="spyne-caption mt-1" style={{ color: 'var(--spyne-text-muted)' }}>
              Step {step + 1} of {WIZARD_STEPS.length} · {WIZARD_STEPS[step]}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: 'transparent', border: 'none', color: 'var(--spyne-text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 flex" style={{ background: 'var(--spyne-border)' }}>
          <div className="h-full transition-all" style={{ width: `${((step + 1) / WIZARD_STEPS.length) * 100}%`, background: 'var(--spyne-brand)', borderRadius: '0 2px 2px 0' }} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ minHeight: 320 }}>
          {/* Step 0: Intent */}
          {step === 0 && (
            <div className="space-y-3">
              <p className="spyne-body-sm mb-2" style={{ color: 'var(--spyne-text-secondary)' }}>
                What is the goal of this campaign?
              </p>
              <div className="grid grid-cols-2 gap-2.5" style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
                {CAMPAIGN_INTENTS.map((intent) => {
                  const selected = draft.intent === intent.id
                  const IntentIcon = intent.icon
                  return (
                    <button
                      key={intent.id}
                      onClick={() => setDraft({ ...draft, intent: intent.id })}
                      className="text-left p-4 transition-all cursor-pointer"
                      style={{
                        borderRadius: 'var(--spyne-radius-lg)',
                        border: selected ? `2px solid ${intent.color}` : '2px solid var(--spyne-border)',
                        background: selected ? `color-mix(in srgb, ${intent.color} 6%, transparent)` : 'var(--spyne-surface)',
                        boxShadow: selected ? `0 0 0 3px color-mix(in srgb, ${intent.color} 12%, transparent)` : 'none',
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: `color-mix(in srgb, ${intent.color} 15%, transparent)` }}
                      >
                        <IntentIcon size={20} style={{ color: intent.color }} />
                      </div>
                      <span className="spyne-label font-semibold block mb-0.5" style={{ color: 'var(--spyne-text-primary)' }}>{intent.label}</span>
                      <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)', lineHeight: 1.4, display: 'block' }}>{intent.desc}</span>
                    </button>
                  )
                })}
              </div>
              {/* AI recommendation with specifics */}
              {draft.intent && (
                <div
                  className="mt-3 p-3.5 rounded-lg"
                  style={{ background: 'var(--spyne-brand-subtle)', border: '1px solid var(--spyne-brand-muted)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={13} style={{ color: 'var(--spyne-brand)' }} />
                    <span className="spyne-label font-semibold" style={{ color: 'var(--spyne-brand-dark)' }}>Vini AI Suggests</span>
                  </div>
                  <p className="spyne-caption mb-2" style={{ color: 'var(--spyne-brand-dark)', lineHeight: 1.5 }}>
                    Based on your goal, we recommend these campaign types:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(intentRecommendations[draft.intent] || []).map((id) => {
                      const ct = CAMPAIGN_TYPES.find(t => t.id === id)
                      if (!ct) return null
                      const CtIcon = ct.icon
                      return (
                        <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: 'var(--spyne-surface)', border: '1px solid var(--spyne-brand-muted)' }}>
                          <CtIcon size={11} style={{ color: 'var(--spyne-brand)' }} />
                          <span className="spyne-caption font-semibold" style={{ color: 'var(--spyne-brand-dark)' }}>{ct.label}</span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Type — sorted by intent recommendations */}
          {step === 1 && (() => {
            const recs = draft.intent ? (intentRecommendations[draft.intent] || []) : []
            const sorted = [...CAMPAIGN_TYPES].sort((a, b) => {
              const aRec = recs.includes(a.id) ? 0 : 1
              const bRec = recs.includes(b.id) ? 0 : 1
              return aRec - bRec
            })
            const hasRecs = recs.length > 0
            return (
              <div className="space-y-3">
                <p className="spyne-body-sm mb-2" style={{ color: 'var(--spyne-text-secondary)' }}>
                  Choose the type of campaign you want to create
                </p>
                {hasRecs && (
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={12} style={{ color: 'var(--spyne-brand)' }} />
                    <span className="spyne-caption font-semibold" style={{ color: 'var(--spyne-brand)' }}>Recommended for your goal</span>
                    <div className="flex-1 h-px" style={{ background: 'var(--spyne-border)' }} />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2.5" style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
                  {sorted.map((t, idx) => {
                    const selected = draft.type === t.id
                    const recommended = recs.includes(t.id)
                    // Insert divider label before "other" types
                    const showOtherLabel = hasRecs && idx > 0 && recommended === false && recs.includes(sorted[idx - 1]?.id)
                    return [
                      showOtherLabel && (
                        <div key="__divider" className="col-span-2 flex items-center gap-2 pt-2 pb-1">
                          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Other types</span>
                          <div className="flex-1 h-px" style={{ background: 'var(--spyne-border)' }} />
                        </div>
                      ),
                      <button
                        key={t.id}
                        onClick={() => setDraft({ ...draft, type: t.id, name: draft.name || `${t.label} Campaign` })}
                        className="text-left p-3.5 transition-all cursor-pointer relative"
                        style={{
                          borderRadius: 'var(--spyne-radius-md)',
                          border: selected ? '2px solid var(--spyne-brand)' : recommended ? '2px solid var(--spyne-brand-muted)' : '2px solid var(--spyne-border)',
                          background: selected ? 'var(--spyne-brand-subtle)' : recommended ? 'color-mix(in srgb, var(--spyne-brand) 4%, var(--spyne-surface))' : 'var(--spyne-surface)',
                          boxShadow: selected ? '0 0 0 3px rgba(79,70,229,0.12)' : 'none',
                        }}
                      >
                        {recommended && !selected && (
                          <span className="absolute top-2 right-2 spyne-caption px-1.5 py-0.5" style={{ borderRadius: 'var(--spyne-radius-pill)', background: 'var(--spyne-brand)', color: '#fff', fontSize: 9, fontWeight: 700 }}>
                            Best Match
                          </span>
                        )}
                        <div className="flex items-center gap-2 mb-1">
                          <t.icon size={15} style={{ color: selected || recommended ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)' }} />
                          <span className="spyne-label font-semibold" style={{ color: 'var(--spyne-text-primary)', fontSize: 12 }}>{t.label}</span>
                        </div>
                        <p className="spyne-caption" style={{ color: 'var(--spyne-text-muted)', fontSize: 10, lineHeight: 1.4 }}>{t.desc}</p>
                      </button>,
                    ]
                  })}
                </div>
              </div>
            )
          })()}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>Campaign Name</label>
                <input type="text" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="spyne-input w-full" style={{ fontSize: 14 }} placeholder="e.g. Re-engagement — Aged Leads" autoFocus />
              </div>
              <div>
                <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>Description</label>
                <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="spyne-input w-full" style={{ fontSize: 13, height: 80, padding: '10px 12px', resize: 'vertical' }} placeholder="What does this campaign do?" />
              </div>
            </div>
          )}

          {/* Step 3: Audience (#8 — with custom CSV option) */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <p className="spyne-body-sm mb-3" style={{ color: 'var(--spyne-text-secondary)' }}>
                  Choose the lead segment this campaign will target
                </p>
                <div className="space-y-2" style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
                  {SEGMENT_OPTIONS.map((seg) => {
                    const selected = draft.segment === seg.id
                    const isCustom = seg.id === 'custom-csv'
                    return (
                      <button
                        key={seg.id}
                        onClick={() => {
                          if (isCustom) {
                            setDraft({ ...draft, segment: seg.id })
                          } else {
                            setDraft({ ...draft, segment: seg.id, csvFile: null, csvColumns: [], csvFieldMapping: {}, csvPreviewRows: [] })
                          }
                        }}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-all cursor-pointer"
                        style={{
                          borderRadius: 'var(--spyne-radius-md)',
                          border: selected ? '2px solid var(--spyne-brand)' : '2px solid var(--spyne-border)',
                          background: selected ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)',
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isCustom && <Upload size={14} style={{ color: selected ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)', flexShrink: 0 }} />}
                          <div className="min-w-0">
                            <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>{seg.label}</span>
                            {seg.desc && <span className="spyne-caption block mt-0.5" style={{ color: 'var(--spyne-text-muted)' }}>{seg.desc}</span>}
                          </div>
                        </div>
                        {seg.count !== null ? (
                          <span className="spyne-caption font-bold tabular-nums shrink-0" style={{ color: selected ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)' }}>{seg.count} leads</span>
                        ) : (
                          <UploadCloud size={16} style={{ color: selected ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)', flexShrink: 0 }} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* #8 CSV Upload UI */}
              {draft.segment === 'custom-csv' && (
                <div className="space-y-4" style={{ borderTop: '1px solid var(--spyne-border)', paddingTop: 16 }}>
                  {/* Upload area */}
                  {!draft.csvFile && (
                    <label
                      className="flex flex-col items-center justify-center gap-3 px-6 py-8 cursor-pointer transition-colors"
                      style={{ borderRadius: 'var(--spyne-radius-lg)', border: '2px dashed var(--spyne-border-strong)', background: 'var(--spyne-surface-hover)' }}
                    >
                      <UploadCloud size={32} style={{ color: 'var(--spyne-text-muted)' }} />
                      <div className="text-center">
                        <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>Upload CSV File</span>
                        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Click to browse or drag and drop</span>
                      </div>
                      <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
                    </label>
                  )}

                  {/* Field Mapping */}
                  {draft.csvFile && draft.csvColumns.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText size={14} style={{ color: 'var(--spyne-success)' }} />
                        <span className="spyne-label font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{draft.csvFile.name}</span>
                        <button className="spyne-btn-ghost" style={{ fontSize: 11, padding: '2px 6px' }} onClick={() => setDraft({ ...draft, csvFile: null, csvColumns: [], csvFieldMapping: {}, csvPreviewRows: [] })}>
                          <X size={12} /> Remove
                        </button>
                      </div>

                      <div className="spyne-card p-4">
                        <span className="spyne-caption font-semibold block mb-3" style={{ color: 'var(--spyne-text-secondary)' }}>Map CSV Columns to Fields</span>
                        <div className="space-y-2">
                          {['Name', 'Phone', 'Email', 'Vehicle Interest'].map((field) => (
                            <div key={field} className="flex items-center gap-3">
                              <span className="spyne-caption w-28 shrink-0 text-right" style={{ color: 'var(--spyne-text-muted)' }}>{field}</span>
                              <div className="relative flex-1">
                                <select
                                  value={draft.csvFieldMapping[field] || ''}
                                  onChange={(e) => setDraft({ ...draft, csvFieldMapping: { ...draft.csvFieldMapping, [field]: e.target.value } })}
                                  className="spyne-input w-full appearance-none pr-8 cursor-pointer"
                                  style={{ fontSize: 12 }}
                                >
                                  <option value="">— Select column —</option>
                                  {draft.csvColumns.map((col) => (
                                    <option key={col} value={col}>{col}</option>
                                  ))}
                                </select>
                                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--spyne-text-muted)' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Preview */}
                      {draft.csvPreviewRows.length > 0 && (
                        <div className="spyne-card overflow-hidden">
                          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--spyne-border)' }}>
                            <span className="spyne-caption font-semibold" style={{ color: 'var(--spyne-text-secondary)' }}>Preview (first {draft.csvPreviewRows.length} rows)</span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr style={{ background: 'var(--spyne-surface-hover)' }}>
                                  {draft.csvColumns.slice(0, 5).map((col) => (
                                    <th key={col} className="text-left px-3 py-2 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)', fontSize: 10 }}>{col}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y" style={{ borderColor: 'var(--spyne-border)' }}>
                                {draft.csvPreviewRows.map((row, i) => (
                                  <tr key={i}>
                                    {draft.csvColumns.slice(0, 5).map((col) => (
                                      <td key={col} className="px-3 py-2">
                                        <span className="spyne-caption" style={{ color: 'var(--spyne-text-secondary)' }}>{row[col] || '—'}</span>
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Lead Quality Filters (show for non-CSV segments) */}
              {draft.segment && draft.segment !== 'custom-csv' && (
                <div style={{ borderTop: '1px solid var(--spyne-border)', paddingTop: 16 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Filter size={14} style={{ color: 'var(--spyne-brand)' }} />
                    <span className="spyne-label font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>Lead Filters</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ borderRadius: 'var(--spyne-radius-md)', border: `1px solid ${draft.minAiScore >= 80 ? 'var(--spyne-brand-muted)' : 'var(--spyne-border)'}`, background: draft.minAiScore >= 80 ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--spyne-brand-subtle)' }}>
                          <Sparkles size={14} style={{ color: 'var(--spyne-brand)' }} />
                        </div>
                        <div>
                          <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>Min AI Quality Score</span>
                          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Only enroll leads above this score</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {[0, 60, 70, 80, 90].map((val) => (
                          <button key={val} onClick={() => setDraft({ ...draft, minAiScore: val })} className="px-2.5 py-1 cursor-pointer transition-all" style={{ borderRadius: 'var(--spyne-radius-sm)', border: draft.minAiScore === val ? '2px solid var(--spyne-brand)' : '1px solid var(--spyne-border)', background: draft.minAiScore === val ? 'var(--spyne-brand)' : 'transparent', color: draft.minAiScore === val ? '#fff' : 'var(--spyne-text-secondary)', fontSize: 12, fontWeight: 600 }}>
                            {val === 0 ? 'Any' : `${val}+`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Call Settings */}
          {step === 4 && (
            <div className="space-y-0">
              {/* ─── Section 1: Campaign Offers ─── */}
              <div className="pb-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--spyne-brand-subtle)' }}>
                    <Gift size={15} style={{ color: 'var(--spyne-brand)' }} />
                  </div>
                  <div>
                    <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>Campaign Offers</span>
                    <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>The agent will mention these during calls</span>
                  </div>
                </div>
                {draft.offers.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {draft.offers.map((offer, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg" style={{ background: 'var(--spyne-surface-hover)' }}>
                        <Tag size={12} style={{ color: 'var(--spyne-brand)', flexShrink: 0 }} />
                        <span className="spyne-body-sm flex-1" style={{ color: 'var(--spyne-text-primary)' }}>{offer}</span>
                        <button className="spyne-btn-ghost" style={{ padding: 2, opacity: 0.5 }} onClick={() => setDraft({ ...draft, offers: draft.offers.filter((_, idx) => idx !== i) })}><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={draft.newOffer}
                    onChange={(e) => setDraft({ ...draft, newOffer: e.target.value })}
                    className="spyne-input flex-1"
                    style={{ fontSize: 13 }}
                    placeholder="e.g. $2,000 off MSRP on 2024 RAV4"
                    onKeyDown={(e) => { if (e.key === 'Enter' && draft.newOffer.trim()) { setDraft({ ...draft, offers: [...draft.offers, draft.newOffer.trim()], newOffer: '' }) } }}
                  />
                  <button
                    className="spyne-btn-primary"
                    style={{ fontSize: 12, height: 34, paddingLeft: 12, paddingRight: 14 }}
                    onClick={() => { if (draft.newOffer.trim()) { setDraft({ ...draft, offers: [...draft.offers, draft.newOffer.trim()], newOffer: '' }) } }}
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>

              <div className="h-px" style={{ background: 'var(--spyne-border)' }} />

              {/* ─── Section 2: Schedule ─── */}
              <div className="py-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--spyne-success-subtle)' }}>
                    <Calendar size={15} style={{ color: 'var(--spyne-success)' }} />
                  </div>
                  <div>
                    <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>Schedule</span>
                    <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>When should this campaign start?</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="spyne-caption block mb-1.5" style={{ color: 'var(--spyne-text-muted)' }}>Start Date & Time</label>
                    <input type="datetime-local" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} className="spyne-input w-full" style={{ fontSize: 13 }} />
                    <p className="spyne-caption mt-1" style={{ color: 'var(--spyne-text-muted)' }}>Empty = start immediately</p>
                  </div>
                  <div>
                    <label className="spyne-caption block mb-1.5" style={{ color: 'var(--spyne-text-muted)' }}>Recurrence</label>
                    <div className="relative">
                      <select
                        value={draft.isRecurring ? draft.recurringInterval : 'none'}
                        onChange={(e) => {
                          if (e.target.value === 'none') {
                            setDraft({ ...draft, isRecurring: false })
                          } else {
                            setDraft({ ...draft, isRecurring: true, recurringInterval: e.target.value })
                          }
                        }}
                        className="spyne-input w-full appearance-none pr-8 cursor-pointer"
                        style={{ fontSize: 13 }}
                      >
                        <option value="none">One-time</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--spyne-text-muted)' }} />
                    </div>
                    {draft.isRecurring && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Repeat size={11} style={{ color: 'var(--spyne-info)' }} />
                        <span className="spyne-caption" style={{ color: 'var(--spyne-info-text)' }}>Runs {draft.recurringInterval}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-px" style={{ background: 'var(--spyne-border)' }} />

              {/* ─── Section 3: Retry Settings ─── */}
              <div className="py-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--spyne-warning-subtle)' }}>
                    <RefreshCw size={15} style={{ color: 'var(--spyne-warning)' }} />
                  </div>
                  <div>
                    <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>Retry Settings</span>
                    <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>What happens when a call doesn't connect</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="spyne-caption block mb-1.5" style={{ color: 'var(--spyne-text-muted)' }}>Maximum Retry Attempts</label>
                    <div className="flex items-center gap-2">
                      <button className="spyne-btn-ghost" style={{ padding: '4px 8px', height: 34, fontSize: 16 }} onClick={() => setDraft({ ...draft, maxRetryAttempts: Math.max(0, draft.maxRetryAttempts - 1) })}>−</button>
                      <input
                        type="number" min={0} max={10}
                        value={draft.maxRetryAttempts}
                        onChange={(e) => setDraft({ ...draft, maxRetryAttempts: parseInt(e.target.value) || 0 })}
                        className="spyne-input text-center"
                        style={{ fontSize: 14, fontWeight: 600, width: 56 }}
                      />
                      <button className="spyne-btn-ghost" style={{ padding: '4px 8px', height: 34, fontSize: 16 }} onClick={() => setDraft({ ...draft, maxRetryAttempts: Math.min(10, draft.maxRetryAttempts + 1) })}>+</button>
                      <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>retries</span>
                    </div>
                  </div>
                  <div>
                    <label className="spyne-caption block mb-1.5" style={{ color: 'var(--spyne-text-muted)' }}>Retry Delay</label>
                    <div className="flex items-center gap-2">
                      <button className="spyne-btn-ghost" style={{ padding: '4px 8px', height: 34, fontSize: 16 }} onClick={() => setDraft({ ...draft, retryDelayHours: Math.max(1, draft.retryDelayHours - 1) })}>−</button>
                      <input
                        type="number" min={1} max={72}
                        value={draft.retryDelayHours}
                        onChange={(e) => setDraft({ ...draft, retryDelayHours: parseInt(e.target.value) || 1 })}
                        className="spyne-input text-center"
                        style={{ fontSize: 14, fontWeight: 600, width: 56 }}
                      />
                      <button className="spyne-btn-ghost" style={{ padding: '4px 8px', height: 34, fontSize: 16 }} onClick={() => setDraft({ ...draft, retryDelayHours: Math.min(72, draft.retryDelayHours + 1) })}>+</button>
                      <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>hours</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px" style={{ background: 'var(--spyne-border)' }} />

              {/* ─── Section 4: Voicemail Strategy ─── */}
              <div className="py-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--spyne-info-subtle)' }}>
                    <VoicemailIcon size={15} style={{ color: 'var(--spyne-info)' }} />
                  </div>
                  <div>
                    <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>Voicemail Strategy</span>
                    <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>How to handle voicemail</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { id: 'leave_message', label: 'Leave Message', desc: 'AI leaves a personalized voicemail', icon: MessageSquare },
                    { id: 'hangup',        label: 'Hang Up',       desc: 'End call and retry later', icon: PhoneOff },
                  ].map((opt) => {
                    const active = draft.voicemailHandling === opt.id
                    const OptIcon = opt.icon
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setDraft({ ...draft, voicemailHandling: opt.id })}
                        className="text-left p-3.5 transition-all cursor-pointer"
                        style={{
                          borderRadius: 'var(--spyne-radius-md)',
                          border: active ? '2px solid var(--spyne-brand)' : '2px solid var(--spyne-border)',
                          background: active ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <OptIcon size={14} style={{ color: active ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)' }} />
                          <span className="spyne-label font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{opt.label}</span>
                        </div>
                        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{opt.desc}</span>
                      </button>
                    )
                  })}
                </div>
                {draft.voicemailHandling === 'leave_message' && (
                  <div>
                    <label className="spyne-caption block mb-1.5" style={{ color: 'var(--spyne-text-muted)' }}>Voicemail Message</label>
                    <textarea
                      value={draft.voicemailMessage}
                      onChange={(e) => setDraft({ ...draft, voicemailMessage: e.target.value })}
                      className="spyne-input w-full"
                      style={{ fontSize: 12, height: 68, padding: '10px 12px', resize: 'vertical', lineHeight: 1.6 }}
                    />
                  </div>
                )}
              </div>

              <div className="h-px" style={{ background: 'var(--spyne-border)' }} />

              {/* ─── Section 5: Timing ─── */}
              <div className="pt-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--spyne-surface-hover)' }}>
                    <Clock size={15} style={{ color: 'var(--spyne-text-muted)' }} />
                  </div>
                  <div>
                    <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>Call Timing</span>
                    <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Control when calls are made</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <label
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors rounded-lg"
                    style={{
                      border: `1px solid ${draft.bestTimeEnabled ? 'var(--spyne-success-muted)' : 'var(--spyne-border)'}`,
                      background: draft.bestTimeEnabled ? 'var(--spyne-success-subtle)' : 'var(--spyne-surface)',
                    }}
                  >
                    <input type="checkbox" checked={draft.bestTimeEnabled} onChange={() => setDraft({ ...draft, bestTimeEnabled: !draft.bestTimeEnabled })} />
                    <Sparkles size={14} style={{ color: draft.bestTimeEnabled ? 'var(--spyne-success)' : 'var(--spyne-text-muted)' }} />
                    <div>
                      <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>AI Best Time to Call</span>
                      <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Schedule each lead when they're most likely to answer</span>
                    </div>
                  </label>
                  <div className="px-4 py-3 rounded-lg" style={{ border: '1px solid var(--spyne-border)', background: 'var(--spyne-surface)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="spyne-label font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>Quiet Hours</span>
                      <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>No calls outside this window</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="spyne-caption block mb-1" style={{ color: 'var(--spyne-text-muted)', fontSize: 10 }}>From</label>
                        <input type="time" value={draft.quietHoursStart} onChange={(e) => setDraft({ ...draft, quietHoursStart: e.target.value })} className="spyne-input w-full" style={{ fontSize: 13 }} />
                      </div>
                      <span className="spyne-caption mt-4" style={{ color: 'var(--spyne-text-muted)' }}>to</span>
                      <div className="flex-1">
                        <label className="spyne-caption block mb-1" style={{ color: 'var(--spyne-text-muted)', fontSize: 10 }}>Until</label>
                        <input type="time" value={draft.quietHoursEnd} onChange={(e) => setDraft({ ...draft, quietHoursEnd: e.target.value })} className="spyne-input w-full" style={{ fontSize: 13 }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--spyne-border)' }}>
          <button className="spyne-btn-secondary" onClick={step === 0 ? onClose : () => setStep(step - 1)}>
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          <div className="flex items-center gap-2">
            <span className="spyne-caption tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>{step + 1} / {WIZARD_STEPS.length}</span>
            <button className="spyne-btn-primary" onClick={handleNext} disabled={!canNext} style={{ opacity: canNext ? 1 : 0.5 }}>
              {step === WIZARD_STEPS.length - 1 ? (<><Rocket size={14} /> Review & Launch</>) : (<>Next <ArrowRight size={14} /></>)}
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   PRE-LAUNCH INTELLIGENCE MODAL
   ═══════════════════════════════════════════════════════════════════ */

function PreLaunchIntelligenceModal({ campaign, onClose, onLaunch, onOptimize }) {
  const segment = SEGMENT_OPTIONS.find((s) => s.id === campaign?.segment) || SEGMENT_OPTIONS[1]

  const leadPool = { total: 47, high: 12, medium: 28, low: 7, flagged: 3 }
  const pickup = { avg: 58, high: 14, medium: 22, low: 11 }

  const highPct = Math.round((leadPool.high / leadPool.total) * 100)
  const medPct  = Math.round((leadPool.medium / leadPool.total) * 100)
  const lowPct  = Math.round((leadPool.low / leadPool.total) * 100)

  return (
    <ModalOverlay onClose={onClose}>
      <div className="spyne-animate-scale-in" style={{ width: 620, maxWidth: '95vw', maxHeight: '90vh', borderRadius: 'var(--spyne-radius-xl)', background: 'var(--spyne-surface)', boxShadow: 'var(--spyne-shadow-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="px-6 py-5 flex items-start justify-between">
          <div>
            <h2 className="spyne-title" style={{ color: 'var(--spyne-text-primary)' }}>Pre-Launch Intelligence</h2>
            <p className="spyne-body-sm mt-1" style={{ color: 'var(--spyne-text-muted)' }}>
              Segment: <strong style={{ color: 'var(--spyne-text-primary)' }}>{segment.label}</strong> · {segment.count || 'Custom'} leads
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: 'transparent', border: 'none', color: 'var(--spyne-text-muted)' }}><X size={18} /></button>
        </div>

        <div className="h-0.5" style={{ background: 'linear-gradient(90deg, var(--spyne-brand-muted), var(--spyne-success-muted), var(--spyne-brand-muted))' }} />

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--spyne-brand-subtle)' }}><Users size={18} style={{ color: 'var(--spyne-brand)' }} /></div>
              <span className="spyne-heading" style={{ color: 'var(--spyne-text-primary)' }}>Lead Pool Quality</span>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-3">
              <div className="text-center"><span className="block font-bold tabular-nums" style={{ fontSize: 28, color: 'var(--spyne-text-primary)' }}>{leadPool.total}</span><span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Total</span></div>
              <div className="text-center"><span className="block font-bold tabular-nums" style={{ fontSize: 28, color: 'var(--spyne-success-text)' }}>{leadPool.high}</span><span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>High</span></div>
              <div className="text-center"><span className="block font-bold tabular-nums" style={{ fontSize: 28, color: 'var(--spyne-text-primary)' }}>{leadPool.medium}</span><span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Medium</span></div>
              <div className="text-center"><span className="block font-bold tabular-nums" style={{ fontSize: 28, color: 'var(--spyne-danger-text)' }}>{leadPool.low}</span><span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Low</span></div>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden mb-3" style={{ background: 'var(--spyne-border)' }}>
              <div style={{ width: `${highPct}%`, background: 'var(--spyne-success)' }} />
              <div style={{ width: `${medPct}%`, background: 'var(--spyne-border-strong)' }} />
              <div style={{ width: `${lowPct}%`, background: 'var(--spyne-danger-muted)' }} />
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} style={{ color: 'var(--spyne-text-muted)' }} />
              <span className="spyne-body-sm" style={{ color: 'var(--spyne-text-secondary)' }}>{leadPool.flagged} leads flagged for review</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--spyne-success-subtle)' }}><PhoneCall size={18} style={{ color: 'var(--spyne-success)' }} /></div>
              <span className="spyne-heading" style={{ color: 'var(--spyne-text-primary)' }}>Pickup Confidence Distribution</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center py-3"><span className="block font-bold tabular-nums" style={{ fontSize: 32, color: 'var(--spyne-text-primary)' }}>{pickup.avg}%</span><span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Avg confidence</span></div>
              <div className="text-center py-3 px-2" style={{ borderRadius: 'var(--spyne-radius-md)', background: 'var(--spyne-success-subtle)' }}><span className="block font-bold tabular-nums" style={{ fontSize: 28, color: 'var(--spyne-success-text)' }}>{pickup.high}</span><span className="spyne-caption" style={{ color: 'var(--spyne-success-text)' }}>High (&gt;75%)</span></div>
              <div className="text-center py-3 px-2"><span className="block font-bold tabular-nums" style={{ fontSize: 28, color: 'var(--spyne-text-primary)' }}>{pickup.medium}</span><span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Medium</span></div>
              <div className="text-center py-3 px-2" style={{ borderRadius: 'var(--spyne-radius-md)', background: 'var(--spyne-danger-subtle)' }}><span className="block font-bold tabular-nums" style={{ fontSize: 28, color: 'var(--spyne-danger-text)' }}>{pickup.low}</span><span className="spyne-caption" style={{ color: 'var(--spyne-danger-text)' }}>Low (&lt;50%)</span></div>
            </div>
          </div>

          <div className="flex items-start gap-3 px-4 py-3.5" style={{ borderRadius: 'var(--spyne-radius-md)', background: 'var(--spyne-info-subtle)', border: '1px solid var(--spyne-info-muted)' }}>
            <TrendingUp size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--spyne-info)' }} />
            <div>
              <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>Schedule Voice steps for Tue–Thu 6–8pm</span>
              <span className="spyne-caption" style={{ color: 'var(--spyne-text-secondary)' }}>Projected +23% pickup rate vs default timing</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--spyne-border)' }}>
          <button className="spyne-btn-secondary" onClick={onClose}>Cancel</button>
          <div className="flex items-center gap-2.5">
            <button className="spyne-btn-secondary" onClick={onLaunch} style={{ gap: 6 }}><Rocket size={14} /> Launch as configured</button>
            <button className="spyne-btn-primary" onClick={onOptimize} style={{ gap: 6, background: 'var(--spyne-brand)', boxShadow: 'var(--spyne-shadow-brand)' }}><Zap size={14} /> Let Vini Optimize</button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   LOT HOLDING COST CAMPAIGN MODAL
   ═══════════════════════════════════════════════════════════════════ */

function LotCampaignModal({ vehicles, onClose, onLaunch }) {
  const [step, setStep] = useState(0)
  const [channels, setChannels] = useState({ sms: true, voice: true, email: false })
  const [campaignName, setCampaignName] = useState('Aging Inventory — Outbound Push')

  const totalHoldingCost = vehicles.reduce((sum, v) => sum + v.holdingCost, 0)
  const avgDays = Math.round(vehicles.reduce((sum, v) => sum + v.daysOnLot, 0) / vehicles.length)
  const totalMatchedLeads = vehicles.reduce((sum, v) => sum + v.matchedLeads, 0)

  const audienceBrackets = [
    { label: 'Leads interested in these exact models', count: totalMatchedLeads, selected: true },
    { label: 'Leads in same price bracket ($20K–$45K)', count: totalMatchedLeads + 38, selected: true },
    { label: 'Leads interested in similar body style', count: totalMatchedLeads + 24, selected: false },
    { label: 'Cold leads — last contacted 30+ days ago', count: 89, selected: false },
  ]
  const [selectedBrackets, setSelectedBrackets] = useState(audienceBrackets.map(b => b.selected))

  const steps = ['Review Vehicles & Audience', 'Configure Campaign', 'Launch']

  return (
    <ModalOverlay onClose={onClose}>
      <div className="spyne-animate-scale-in" style={{ width: 640, maxWidth: '95vw', maxHeight: '90vh', borderRadius: 'var(--spyne-radius-xl)', background: 'var(--spyne-surface)', boxShadow: 'var(--spyne-shadow-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="px-6 py-5 flex items-start justify-between" style={{ borderBottom: '1px solid var(--spyne-border)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Megaphone size={18} style={{ color: 'var(--spyne-warning)' }} />
              <h2 className="spyne-title" style={{ color: 'var(--spyne-text-primary)' }}>Outbound Campaign — Aging Inventory</h2>
            </div>
            <p className="spyne-caption mt-1" style={{ color: 'var(--spyne-text-muted)' }}>Step {step + 1} of {steps.length} · {steps[step]}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: 'transparent', border: 'none', color: 'var(--spyne-text-muted)' }}><X size={18} /></button>
        </div>

        <div className="h-1 flex" style={{ background: 'var(--spyne-border)' }}>
          <div className="h-full transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%`, background: 'var(--spyne-warning)', borderRadius: '0 2px 2px 0' }} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ minHeight: 320 }}>
          {step === 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 px-4 py-3 rounded-lg" style={{ background: 'var(--spyne-warning-subtle)', border: '1px solid var(--spyne-warning-muted)' }}>
                <div className="flex-1">
                  <span className="spyne-label font-bold" style={{ color: 'var(--spyne-warning-text)' }}>{vehicles.length} high-cost vehicles selected</span>
                  <span className="spyne-caption block mt-0.5" style={{ color: 'var(--spyne-warning-text)', opacity: 0.8 }}>${totalHoldingCost.toLocaleString()} total holding cost · Avg {avgDays} days on lot</span>
                </div>
                <AlertTriangle size={20} style={{ color: 'var(--spyne-warning)', flexShrink: 0 }} />
              </div>

              <div className="space-y-2" style={{ maxHeight: 180, overflowY: 'auto' }}>
                {vehicles.map((v) => {
                  const isHigh = v.daysOnLot >= 45
                  return (
                    <div key={v.id} className="flex items-center gap-3 px-4 py-2.5 rounded-lg" style={{ border: '1px solid var(--spyne-border)', background: 'var(--spyne-surface)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--spyne-surface-hover)' }}><Car size={14} style={{ color: 'var(--spyne-text-muted)' }} /></div>
                      <div className="flex-1 min-w-0">
                        <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>{v.year} {v.make} {v.model} {v.trim}</span>
                        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>${v.price.toLocaleString()} · {v.matchedLeads} interested lead{v.matchedLeads !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="spyne-label tabular-nums font-bold block" style={{ color: isHigh ? 'var(--spyne-danger-text)' : 'var(--spyne-warning-text)' }}>${v.holdingCost.toLocaleString()}</span>
                        <span className="spyne-caption tabular-nums" style={{ color: isHigh ? 'var(--spyne-danger-text)' : 'var(--spyne-warning-text)' }}>{v.daysOnLot}d on lot</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ borderTop: '1px solid var(--spyne-border)', paddingTop: 16 }}>
                <div className="flex items-center gap-2 mb-3">
                  <Users size={14} style={{ color: 'var(--spyne-brand)' }} />
                  <span className="spyne-label font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>Auto-Matched Audience</span>
                </div>
                <div className="space-y-2">
                  {audienceBrackets.map((bracket, idx) => (
                    <label key={idx} className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors" style={{ borderRadius: 'var(--spyne-radius-md)', border: `1px solid ${selectedBrackets[idx] ? 'var(--spyne-brand-muted)' : 'var(--spyne-border)'}`, background: selectedBrackets[idx] ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)' }}>
                      <input type="checkbox" checked={selectedBrackets[idx]} onChange={() => { const updated = [...selectedBrackets]; updated[idx] = !updated[idx]; setSelectedBrackets(updated) }} />
                      <div className="flex-1"><span className="spyne-label font-medium" style={{ color: 'var(--spyne-text-primary)' }}>{bracket.label}</span></div>
                      <span className="spyne-caption font-bold tabular-nums" style={{ color: selectedBrackets[idx] ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)' }}>{bracket.count} leads</span>
                    </label>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-md" style={{ background: 'var(--spyne-success-subtle)' }}>
                  <Sparkles size={12} className="shrink-0" style={{ color: 'var(--spyne-success)' }} />
                  <span className="spyne-caption" style={{ color: 'var(--spyne-success-text)' }}>{selectedBrackets.reduce((sum, sel, i) => sum + (sel ? audienceBrackets[i].count : 0), 0)} total leads will be targeted</span>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>Campaign Name</label>
                <input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className="spyne-input w-full" style={{ fontSize: 14 }} autoFocus />
              </div>
              <div className="px-4 py-3 rounded-lg" style={{ background: 'var(--spyne-brand-subtle)', border: '1px solid var(--spyne-brand-muted)' }}>
                <div className="flex items-center gap-2 mb-2"><Sparkles size={14} style={{ color: 'var(--spyne-brand)' }} /><span className="spyne-label font-semibold" style={{ color: 'var(--spyne-brand-dark)' }}>Vini AI Recommendation</span></div>
                <p className="spyne-body-sm" style={{ color: 'var(--spyne-brand-dark)' }}>Target matched leads ({totalMatchedLeads}) with personalized outreach highlighting price flexibility and urgency on aging units. SMS + voice combo has shown 68% response rate for inventory-push campaigns.</p>
              </div>
              <div>
                <label className="spyne-caption font-semibold block mb-3" style={{ color: 'var(--spyne-text-secondary)' }}>Outreach Channels</label>
                <div className="space-y-2">
                  {[
                    { key: 'sms', label: 'SMS', icon: MessageSquare, desc: 'Text messages with vehicle pricing & offers' },
                    { key: 'voice', label: 'AI Voice Call', icon: Phone, desc: 'AI-powered calls highlighting deals' },
                    { key: 'email', label: 'Email', icon: Mail, desc: 'Email with vehicle photos & incentives' },
                  ].map((ch) => (
                    <label key={ch.key} className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors" style={{ borderRadius: 'var(--spyne-radius-md)', border: `1px solid ${channels[ch.key] ? 'var(--spyne-brand-muted)' : 'var(--spyne-border)'}`, background: channels[ch.key] ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)' }}>
                      <input type="checkbox" checked={channels[ch.key]} onChange={() => setChannels({ ...channels, [ch.key]: !channels[ch.key] })} />
                      <ch.icon size={16} style={{ color: channels[ch.key] ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)' }} />
                      <div>
                        <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>{ch.label}</span>
                        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{ch.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <span className="spyne-caption font-semibold block mb-2" style={{ color: 'var(--spyne-text-secondary)' }}>Suggested Workflow</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { type: 'trigger', label: 'Aging Inventory' },
                    { type: 'sms', label: 'Deal SMS' },
                    { type: 'wait', label: 'Wait 1h' },
                    { type: 'call', label: 'AI Call' },
                    { type: 'condition', label: 'Connected?' },
                    { type: 'action', label: 'Book Appt' },
                    { type: 'end', label: 'End' },
                  ].map((s, i, arr) => {
                    const cfg = STEP_TYPE_CONFIG[s.type] || STEP_TYPE_CONFIG.action
                    const Icon = cfg.icon
                    return (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md" style={{ background: cfg.bg }}><Icon size={11} strokeWidth={2.2} style={{ color: cfg.color }} /><span className="spyne-caption font-medium" style={{ color: cfg.color }}>{s.label}</span></div>
                        {i < arr.length - 1 && <ArrowRight size={10} style={{ color: 'var(--spyne-border-strong)' }} />}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--spyne-success-subtle)' }}><Rocket size={28} style={{ color: 'var(--spyne-success)' }} /></div>
                <h3 className="spyne-title mb-2" style={{ color: 'var(--spyne-text-primary)' }}>Ready to Launch</h3>
                <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-muted)', maxWidth: 400, margin: '0 auto' }}>Campaign will target {totalMatchedLeads} matched leads across {vehicles.length} aging vehicles with ${totalHoldingCost.toLocaleString()} in accumulated holding costs.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="spyne-card p-4"><span className="spyne-caption block mb-1" style={{ color: 'var(--spyne-text-muted)' }}>Campaign</span><span className="spyne-label font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{campaignName}</span></div>
                <div className="spyne-card p-4"><span className="spyne-caption block mb-1" style={{ color: 'var(--spyne-text-muted)' }}>Vehicles</span><span className="spyne-label font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{vehicles.length} units</span></div>
                <div className="spyne-card p-4"><span className="spyne-caption block mb-1" style={{ color: 'var(--spyne-text-muted)' }}>Target Leads</span><span className="spyne-label font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{totalMatchedLeads} leads</span></div>
                <div className="spyne-card p-4"><span className="spyne-caption block mb-1" style={{ color: 'var(--spyne-text-muted)' }}>Channels</span><span className="spyne-label font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{[channels.sms && 'SMS', channels.voice && 'Voice', channels.email && 'Email'].filter(Boolean).join(', ')}</span></div>
              </div>
              <div className="px-4 py-3 rounded-lg" style={{ background: 'var(--spyne-brand-subtle)', border: '1px solid var(--spyne-brand-muted)' }}>
                <div className="flex items-center gap-2 mb-1"><Sparkles size={14} style={{ color: 'var(--spyne-brand)' }} /><span className="spyne-label font-semibold" style={{ color: 'var(--spyne-brand-dark)' }}>Projected Impact</span></div>
                <p className="spyne-body-sm" style={{ color: 'var(--spyne-brand-dark)' }}>Based on similar campaigns, expect ~45% response rate and 3–5 appointments within 48 hours. This could save an estimated ${Math.round(totalHoldingCost * 0.3).toLocaleString()} in future holding costs.</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--spyne-border)' }}>
          <button className="spyne-btn-secondary" onClick={step === 0 ? onClose : () => setStep(step - 1)}>{step === 0 ? 'Cancel' : 'Back'}</button>
          <div className="flex items-center gap-2">
            <span className="spyne-caption tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>{step + 1} / {steps.length}</span>
            <button className="spyne-btn-primary" onClick={step === steps.length - 1 ? onLaunch : () => setStep(step + 1)} style={{ gap: 6, background: step === steps.length - 1 ? 'var(--spyne-success)' : undefined }}>
              {step === steps.length - 1 ? (<><Rocket size={14} /> Launch Campaign</>) : (<>Next <ArrowRight size={14} /></>)}
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  )
}

/* ─── Shared modal overlay ───────────────────────────────────────── */

function ModalOverlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {children}
    </div>
  )
}
