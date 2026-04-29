"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Rocket,
  TrendingUp,
  DollarSign,
  Users,
  MousePointerClick,
  CheckCircle2,
  Phone,
  Camera,
  Megaphone,
  MailCheck,
  CalendarClock,
  PhoneOutgoing,
  Target,
  FileText,
  Image,
  Video,
  RotateCcw,
  Sparkles,
  Globe,
  Send,
  Clock,
  Mail,
  MessageSquare,
  Tag,
  type LucideIcon,
} from "lucide-react"

interface Campaign {
  id: string
  vehicle: string
  segment: string
  demandTrend: string
  suggestedCampaign: string
}

const campaignTypes = [
  {
    id: "vini",
    label: "VINI Campaign",
    description: "AI-powered outbound calls to matched leads",
    icon: Phone,
    color: "text-violet-600",
    bgSelected: "border-violet-300 bg-violet-50/50",
  },
  {
    id: "studio",
    label: "Studio Campaign",
    description: "Enhanced visuals — 360° spins, video & photos",
    icon: Camera,
    color: "text-pink-600",
    bgSelected: "border-pink-300 bg-pink-50/50",
  },
  {
    id: "ads",
    label: "Paid Ads Campaign",
    description: "Targeted ads across search, social & marketplaces",
    icon: Megaphone,
    color: "text-blue-600",
    bgSelected: "border-blue-300 bg-blue-50/50",
  },
  {
    id: "crm",
    label: "CRM / Email Blast",
    description: "Email & SMS outreach to past inquirers",
    icon: MailCheck,
    color: "text-emerald-600",
    bgSelected: "border-emerald-300 bg-emerald-50/50",
  },
]

// ─── Helpers ───

function ToggleCard({
  selected,
  onClick,
  selectedClass,
  children,
}: {
  selected: boolean
  onClick: () => void
  selectedClass: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors w-full ${
        selected ? selectedClass : "hover:bg-muted/40"
      }`}
    >
      {children}
    </button>
  )
}

function CheckCard({
  checked,
  onChange,
  selectedClass,
  children,
}: {
  checked: boolean
  onChange: () => void
  selectedClass: string
  children: React.ReactNode
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
        checked ? selectedClass : "hover:bg-muted/40"
      }`}
    >
      <Checkbox checked={checked} onCheckedChange={onChange} className="mt-0.5" />
      {children}
    </label>
  )
}

function StatCard({
  icon: Icon,
  iconColor,
  value,
  label,
  highlight,
}: {
  icon: LucideIcon
  iconColor: string
  value: string | number
  label: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-lg border p-3 text-center ${highlight ? "bg-emerald-50" : "bg-muted/30"}`}
    >
      <Icon className={`h-4 w-4 mx-auto mb-1 ${iconColor}`} />
      <p
        className={`text-lg font-bold font-mono ${highlight ? "text-emerald-700" : ""}`}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold mb-2">{children}</p>
}

function toggleItem(list: string[], id: string) {
  return list.includes(id) ? list.filter((i) => i !== id) : [...list, id]
}

// ─── VINI Flow ───

const viniLeadSources = [
  { id: "website", label: "Website inquirers", detail: "5 leads" },
  { id: "phone", label: "Phone inquirers", detail: "3 leads" },
  { id: "walkin", label: "Past lot visitors", detail: "2 leads" },
  { id: "segment", label: "Matching segment shoppers", detail: "8 leads" },
]

const viniScripts = [
  { id: "appointment", label: "Appointment Setter", detail: "Book a showroom visit" },
  { id: "testdrive", label: "Test Drive Invite", detail: "Invite for a same-day test drive" },
  { id: "pricedrop", label: "Price Drop Alert", detail: "Notify about recent price reduction" },
  { id: "followup", label: "General Follow-up", detail: "Re-engage cold leads with updates" },
]

const viniSchedules = [
  { id: "morning", label: "Morning", detail: "9 AM – 12 PM" },
  { id: "afternoon", label: "Afternoon", detail: "12 – 5 PM" },
  { id: "evening", label: "Evening", detail: "5 – 8 PM" },
]

function ViniFlow() {
  const [sources, setSources] = useState(["website", "phone"])
  const [script, setScript] = useState("appointment")
  const [schedule, setSchedule] = useState(["morning", "afternoon"])

  const totalLeads = sources.reduce((sum, s) => {
    const src = viniLeadSources.find((l) => l.id === s)
    const num = src ? parseInt(src.detail) : 0
    return sum + num
  }, 0)
  const estConnections = Math.round(totalLeads * 0.65)
  const estAppointments = Math.round(estConnections * 0.4)

  return (
    <>
      <div>
        <SectionLabel>Target Leads</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {viniLeadSources.map((src) => (
            <CheckCard
              key={src.id}
              checked={sources.includes(src.id)}
              onChange={() => setSources(toggleItem(sources, src.id))}
              selectedClass="border-violet-300 bg-violet-50/50"
            >
              <div>
                <p className="text-sm font-medium">{src.label}</p>
                <p className="text-xs text-muted-foreground">{src.detail}</p>
              </div>
            </CheckCard>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Call Script</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {viniScripts.map((s) => (
            <ToggleCard
              key={s.id}
              selected={script === s.id}
              onClick={() => setScript(s.id)}
              selectedClass="border-violet-300 bg-violet-50/50"
            >
              <div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.detail}</p>
              </div>
            </ToggleCard>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Call Schedule</SectionLabel>
        <div className="flex gap-2">
          {viniSchedules.map((s) => (
            <CheckCard
              key={s.id}
              checked={schedule.includes(s.id)}
              onChange={() => setSchedule(toggleItem(schedule, s.id))}
              selectedClass="border-violet-300 bg-violet-50/50"
            >
              <div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.detail}</p>
              </div>
            </CheckCard>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <SectionLabel>Estimated Impact</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={PhoneOutgoing} iconColor="text-violet-600" value={totalLeads} label="Calls" />
          <StatCard icon={Phone} iconColor="text-indigo-600" value={estConnections} label="Connections" />
          <StatCard icon={CalendarClock} iconColor="text-emerald-600" value={estAppointments} label="Appointments" highlight />
        </div>
      </div>
    </>
  )
}

// ─── Studio Flow ───

const studioPackages = [
  { id: "photos", label: "Professional Photos", detail: "36-photo walkthrough", icon: Image },
  { id: "spin360", label: "360° Spin", detail: "Interior & exterior spin", icon: RotateCcw },
  { id: "video", label: "Video Walkaround", detail: "60-sec cinematic clip", icon: Video },
  { id: "backdrop", label: "AI Background Enhancement", detail: "Lifestyle backdrop swap", icon: Sparkles },
]

const studioScheduleSlots = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "thisweek", label: "This Week" },
]

const studioPublishTargets = [
  { id: "website", label: "Dealer Website" },
  { id: "autotrader", label: "AutoTrader" },
  { id: "carscom", label: "Cars.com" },
  { id: "fbmarket", label: "FB Marketplace" },
]

function StudioFlow() {
  const [packages, setPackages] = useState(["photos", "spin360"])
  const [scheduleSlot, setScheduleSlot] = useState("tomorrow")
  const [publishTo, setPublishTo] = useState(["website", "autotrader", "carscom"])

  const scoreBoost = packages.length * 18
  const vdpLift = packages.length * 15

  return (
    <>
      <div>
        <SectionLabel>Media Package</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {studioPackages.map((pkg) => {
            const Icon = pkg.icon
            return (
              <CheckCard
                key={pkg.id}
                checked={packages.includes(pkg.id)}
                onChange={() => setPackages(toggleItem(packages, pkg.id))}
                selectedClass="border-pink-300 bg-pink-50/50"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-4 w-4 text-pink-600" />
                    <p className="text-sm font-medium">{pkg.label}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{pkg.detail}</p>
                </div>
              </CheckCard>
            )
          })}
        </div>
      </div>

      <div>
        <SectionLabel>Schedule Shoot</SectionLabel>
        <div className="flex gap-2">
          {studioScheduleSlots.map((s) => (
            <Button
              key={s.id}
              type="button"
              size="sm"
              variant={scheduleSlot === s.id ? "default" : "outline"}
              onClick={() => setScheduleSlot(s.id)}
              className="flex-1"
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Publish To</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {studioPublishTargets.map((t) => (
            <CheckCard
              key={t.id}
              checked={publishTo.includes(t.id)}
              onChange={() => setPublishTo(toggleItem(publishTo, t.id))}
              selectedClass="border-pink-300 bg-pink-50/50"
            >
              <div>
                <p className="text-sm font-medium">{t.label}</p>
              </div>
            </CheckCard>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <SectionLabel>Estimated Impact</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Image} iconColor="text-pink-600" value={`+${scoreBoost}`} label="Listing Score" />
          <StatCard icon={MousePointerClick} iconColor="text-indigo-600" value={`+${vdpLift}%`} label="VDP Lift" />
          <StatCard icon={TrendingUp} iconColor="text-emerald-600" value={publishTo.length} label="Platforms" highlight />
        </div>
      </div>
    </>
  )
}

// ─── Paid Ads Flow ───

const adChannels = [
  { id: "google", label: "Google Ads", description: "Search & display network" },
  { id: "meta", label: "Meta Ads", description: "Facebook & Instagram" },
  { id: "autotrader", label: "AutoTrader / Cars.com", description: "Marketplace boost" },
]

const adFormats = [
  { id: "search", label: "Search Ad", detail: "Text ads on search results" },
  { id: "display", label: "Display Ad", detail: "Banner ads across partner sites" },
  { id: "social", label: "Social Carousel", detail: "Multi-image swipeable post" },
  { id: "marketplace", label: "Marketplace Spotlight", detail: "Featured placement on listings" },
]

const adTargeting = [
  { id: "geo", label: "Geo Radius (25 mi)", description: "Local shoppers within 25 miles" },
  { id: "inmarket", label: "In-Market Shoppers", description: "Actively researching this segment" },
  { id: "retarget", label: "Retargeting", description: "People who visited your VDP" },
  { id: "lookalike", label: "Lookalike Audience", description: "Similar to past buyers" },
]

const durationOptions = [
  { value: 7, label: "7 days" },
  { value: 14, label: "14 days" },
  { value: 30, label: "30 days" },
]

function AdsFlow() {
  const [channels, setChannels] = useState(["google", "meta"])
  const [formats, setFormats] = useState(["search", "social"])
  const [targeting, setTargeting] = useState(["geo", "inmarket"])
  const [dailyBudget, setDailyBudget] = useState(50)
  const [duration, setDuration] = useState(14)

  const channelMult = Math.max(channels.length, 1)
  const base = dailyBudget * duration * 12 * channelMult
  const impressions = base
  const clicks = Math.round(base * 0.032)
  const leads = Math.round(clicks * 0.08)
  const totalBudget = dailyBudget * duration

  return (
    <>
      <div>
        <SectionLabel>Ad Channels</SectionLabel>
        <div className="space-y-2">
          {adChannels.map((ch) => (
            <CheckCard
              key={ch.id}
              checked={channels.includes(ch.id)}
              onChange={() => setChannels(toggleItem(channels, ch.id))}
              selectedClass="border-blue-300 bg-blue-50/50"
            >
              <div>
                <p className="text-sm font-medium">{ch.label}</p>
                <p className="text-xs text-muted-foreground">{ch.description}</p>
              </div>
            </CheckCard>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Ad Format</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {adFormats.map((f) => (
            <CheckCard
              key={f.id}
              checked={formats.includes(f.id)}
              onChange={() => setFormats(toggleItem(formats, f.id))}
              selectedClass="border-blue-300 bg-blue-50/50"
            >
              <div>
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.detail}</p>
              </div>
            </CheckCard>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Targeting</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {adTargeting.map((t) => (
            <CheckCard
              key={t.id}
              checked={targeting.includes(t.id)}
              onChange={() => setTargeting(toggleItem(targeting, t.id))}
              selectedClass="border-blue-300 bg-blue-50/50"
            >
              <div>
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
            </CheckCard>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ads-budget" className="text-sm font-semibold">
            Daily Budget
          </Label>
          <div className="relative mt-2">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="ads-budget"
              type="number"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(Math.max(10, Number(e.target.value)))}
              className="pl-8"
              min={10}
            />
          </div>
        </div>
        <div>
          <Label className="text-sm font-semibold">Duration</Label>
          <div className="flex gap-1.5 mt-2">
            {durationOptions.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                size="sm"
                variant={duration === opt.value ? "default" : "outline"}
                onClick={() => setDuration(opt.value)}
                className="flex-1 text-xs"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <SectionLabel>Estimated Impact</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={Users}
            iconColor="text-blue-600"
            value={impressions > 1000 ? `${(impressions / 1000).toFixed(1)}k` : impressions}
            label="Impressions"
          />
          <StatCard icon={MousePointerClick} iconColor="text-indigo-600" value={clicks} label="Clicks" />
          <StatCard icon={TrendingUp} iconColor="text-emerald-600" value={leads} label="Est. Leads" highlight />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Total budget: ${totalBudget.toLocaleString()} over {duration} days
        </p>
      </div>
    </>
  )
}

// ─── CRM / Email Flow ───

const crmAudiences = [
  { id: "past-inquirers", label: "Past inquirers on this vehicle", detail: "5 contacts" },
  { id: "segment", label: "Segment shoppers", detail: "28 contacts" },
  { id: "service", label: "Service customers (equity match)", detail: "12 contacts" },
  { id: "all-crm", label: "All active CRM contacts", detail: "340 contacts" },
]

const crmTemplates = [
  { id: "pricedrop", label: "Price Drop Alert", detail: "Notify about a new lower price", icon: Tag },
  { id: "newarrival", label: "New Arrival", detail: "Announce vehicle just landed on lot", icon: Sparkles },
  { id: "limited", label: "Limited Availability", detail: "Create urgency with scarcity", icon: Clock },
  { id: "offer", label: "Special Offer", detail: "Financing or trade-in incentive", icon: DollarSign },
]

const crmChannelOpts = [
  { id: "email", label: "Email", icon: Mail },
  { id: "sms", label: "SMS", icon: MessageSquare },
  { id: "both", label: "Email + SMS", icon: Send },
]

const crmScheduleOpts = [
  { id: "now", label: "Send Now" },
  { id: "morning", label: "Tomorrow 9 AM" },
  { id: "optimal", label: "Optimal Time (AI)" },
]

function CrmFlow() {
  const [audiences, setAudiences] = useState(["past-inquirers", "segment"])
  const [template, setTemplate] = useState("pricedrop")
  const [channel, setChannel] = useState("both")
  const [schedule, setSchedule] = useState("optimal")

  const totalReach = audiences.reduce((sum, a) => {
    const aud = crmAudiences.find((au) => au.id === a)
    const num = aud ? parseInt(aud.detail) : 0
    return sum + num
  }, 0)
  const estOpens = Math.round(totalReach * 0.38)
  const estResponses = Math.round(estOpens * 0.12)

  return (
    <>
      <div>
        <SectionLabel>Audience</SectionLabel>
        <div className="space-y-2">
          {crmAudiences.map((a) => (
            <CheckCard
              key={a.id}
              checked={audiences.includes(a.id)}
              onChange={() => setAudiences(toggleItem(audiences, a.id))}
              selectedClass="border-emerald-300 bg-emerald-50/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.detail}</p>
              </div>
            </CheckCard>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Message Template</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {crmTemplates.map((t) => {
            const Icon = t.icon
            return (
              <ToggleCard
                key={t.id}
                selected={template === t.id}
                onClick={() => setTemplate(t.id)}
                selectedClass="border-emerald-300 bg-emerald-50/50"
              >
                <Icon className="h-4 w-4 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.detail}</p>
                </div>
              </ToggleCard>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <SectionLabel>Send Via</SectionLabel>
          <div className="flex gap-1.5">
            {crmChannelOpts.map((c) => (
              <Button
                key={c.id}
                type="button"
                size="sm"
                variant={channel === c.id ? "default" : "outline"}
                onClick={() => setChannel(c.id)}
                className="flex-1 text-xs gap-1"
              >
                <c.icon className="h-3.5 w-3.5" />
                {c.label}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>Schedule</SectionLabel>
          <div className="space-y-1.5">
            {crmScheduleOpts.map((s) => (
              <ToggleCard
                key={s.id}
                selected={schedule === s.id}
                onClick={() => setSchedule(s.id)}
                selectedClass="border-emerald-300 bg-emerald-50/50"
              >
                <p className="text-sm font-medium">{s.label}</p>
              </ToggleCard>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <SectionLabel>Estimated Impact</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Users} iconColor="text-emerald-600" value={totalReach} label="Recipients" />
          <StatCard icon={Mail} iconColor="text-indigo-600" value={estOpens} label="Est. Opens" />
          <StatCard icon={MessageSquare} iconColor="text-emerald-600" value={estResponses} label="Responses" highlight />
        </div>
      </div>
    </>
  )
}

// ─── Main Modal ───

interface LaunchCampaignModalProps {
  campaign: Campaign | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LaunchCampaignModal({
  campaign,
  open,
  onOpenChange,
}: LaunchCampaignModalProps) {
  const [campaignType, setCampaignType] = useState<string | null>(null)
  const [launched, setLaunched] = useState(false)

  if (!campaign) return null

  function handleLaunch() {
    setLaunched(true)
    setTimeout(() => {
      setLaunched(false)
      setCampaignType(null)
      onOpenChange(false)
    }, 1800)
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setLaunched(false)
      setCampaignType(null)
    }
    onOpenChange(next)
  }

  if (launched) {
    const typeInfo = campaignTypes.find((t) => t.id === campaignType)
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="rounded-full bg-emerald-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Campaign Launched!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {typeInfo?.label ?? "Campaign"} for {campaign.vehicle} is now live.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-blue-600" />
            Launch Campaign
          </DialogTitle>
          <DialogDescription>
            Configure and launch a targeted campaign for this vehicle.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="font-semibold text-sm">{campaign.vehicle}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {campaign.segment}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              {campaign.demandTrend}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Suggested: {campaign.suggestedCampaign}
          </p>
        </div>

        <Separator />

        <div>
          <SectionLabel>Campaign Type</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {campaignTypes.map((type) => {
              const Icon = type.icon
              const selected = campaignType === type.id
              return (
                <ToggleCard
                  key={type.id}
                  selected={selected}
                  onClick={() => setCampaignType(type.id)}
                  selectedClass={type.bgSelected}
                >
                  <div className={`mt-0.5 ${type.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </ToggleCard>
              )
            })}
          </div>
        </div>

        {campaignType && (
          <>
            <Separator />
            <div className="space-y-4">
              {campaignType === "vini" && <ViniFlow />}
              {campaignType === "studio" && <StudioFlow />}
              {campaignType === "ads" && <AdsFlow />}
              {campaignType === "crm" && <CrmFlow />}
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleLaunch} disabled={!campaignType} className="gap-1.5">
            <Rocket className="h-4 w-4" />
            Launch Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
