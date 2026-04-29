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
import { Separator } from "@/components/ui/separator"
import {
  TrendingUp,
  Zap,
  Star,
  Share2,
  Mail,
  Megaphone,
  CheckCircle2,
  Globe,
  Eye,
  Users,
  MousePointerClick,
  Image,
  MessageSquare,
  Send,
  type LucideIcon,
} from "lucide-react"
import type { MerchandisingVehicle } from "@/services/max-2/max-2.types"

// ─── Helpers ───

function ToggleCard({
  selected,
  onClick,
  cls,
  children,
}: {
  selected: boolean
  onClick: () => void
  cls: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors w-full ${
        selected ? cls : "hover:bg-muted/40"
      }`}
    >
      {children}
    </button>
  )
}

function CheckCard({
  checked,
  onChange,
  cls,
  children,
}: {
  checked: boolean
  onChange: () => void
  cls: string
  children: React.ReactNode
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
        checked ? cls : "hover:bg-muted/40"
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
    <div className={`rounded-lg border p-3 text-center ${highlight ? "bg-emerald-50" : "bg-muted/30"}`}>
      <Icon className={`h-4 w-4 mx-auto mb-1 ${iconColor}`} />
      <p className={`text-lg font-bold font-mono ${highlight ? "text-emerald-700" : ""}`}>{value}</p>
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

const SEL = "border-emerald-300 bg-emerald-50/50"

// ─── Boost Types ───

const boostTypes = [
  {
    id: "featured",
    label: "Featured Listing Boost",
    description: "Pin to top of search results across platforms",
    icon: Star,
  },
  {
    id: "social",
    label: "Social Amplify",
    description: "Post to Facebook, Instagram & Marketplace",
    icon: Share2,
  },
  {
    id: "email",
    label: "Lead Notification",
    description: "Alert interested shoppers via email & SMS",
    icon: Mail,
  },
  {
    id: "ads",
    label: "Quick Ad Campaign",
    description: "Spin up a targeted ad in minutes",
    icon: Megaphone,
  },
]

// ─── Featured Flow ───

const featuredPlatforms = [
  { id: "website", label: "Dealer Website" },
  { id: "autotrader", label: "AutoTrader" },
  { id: "carscom", label: "Cars.com" },
  { id: "cargurus", label: "CarGurus" },
]

const featuredDurations = [
  { value: "3d", label: "3 days" },
  { value: "7d", label: "7 days" },
  { value: "14d", label: "14 days" },
]

function FeaturedFlow() {
  const [platforms, setPlatforms] = useState(["website", "autotrader", "carscom"])
  const [duration, setDuration] = useState("7d")

  return (
    <>
      <div>
        <SectionLabel>Platforms</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {featuredPlatforms.map((p) => (
            <CheckCard key={p.id} checked={platforms.includes(p.id)} onChange={() => setPlatforms(toggleItem(platforms, p.id))} cls={SEL}>
              <p className="text-sm font-medium">{p.label}</p>
            </CheckCard>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Duration</SectionLabel>
        <div className="flex gap-2">
          {featuredDurations.map((d) => (
            <Button key={d.value} type="button" size="sm" variant={duration === d.value ? "default" : "outline"} onClick={() => setDuration(d.value)} className="flex-1">
              {d.label}
            </Button>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <SectionLabel>Estimated Impact</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Eye} iconColor="text-amber-600" value="+45%" label="VDP Lift" />
          <StatCard icon={Globe} iconColor="text-blue-600" value={platforms.length} label="Platforms" />
          <StatCard icon={Users} iconColor="text-emerald-600" value="+800" label="Impressions/day" highlight />
        </div>
      </div>
    </>
  )
}

// ─── Social Flow ───

const socialPlatforms = [
  { id: "fb", label: "Facebook Page" },
  { id: "ig", label: "Instagram" },
  { id: "fbm", label: "FB Marketplace" },
]

const socialFormats = [
  { id: "carousel", label: "Carousel", detail: "Multi-image gallery" },
  { id: "single", label: "Single Photo", detail: "Best exterior shot" },
  { id: "video", label: "Video Clip", detail: "15-sec walkaround" },
  { id: "story", label: "Story / Reel", detail: "Vertical format" },
]

function SocialFlow() {
  const [platforms, setPlatforms] = useState(["fb", "ig"])
  const [format, setFormat] = useState("carousel")
  const [schedule, setSchedule] = useState("peak")

  const reach = platforms.length * (format === "video" || format === "story" ? 350 : 200)

  return (
    <>
      <div>
        <SectionLabel>Platforms</SectionLabel>
        <div className="flex gap-2">
          {socialPlatforms.map((p) => (
            <CheckCard key={p.id} checked={platforms.includes(p.id)} onChange={() => setPlatforms(toggleItem(platforms, p.id))} cls={SEL}>
              <p className="text-sm font-medium">{p.label}</p>
            </CheckCard>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Post Format</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {socialFormats.map((f) => (
            <ToggleCard key={f.id} selected={format === f.id} onClick={() => setFormat(f.id)} cls={SEL}>
              <div>
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.detail}</p>
              </div>
            </ToggleCard>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Schedule</SectionLabel>
        <div className="flex gap-2">
          {[{ id: "now", label: "Post Now" }, { id: "peak", label: "Next Peak Hour" }, { id: "tomorrow", label: "Tomorrow 10 AM" }].map((s) => (
            <Button key={s.id} type="button" size="sm" variant={schedule === s.id ? "default" : "outline"} onClick={() => setSchedule(s.id)} className="flex-1 text-xs">
              {s.label}
            </Button>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <SectionLabel>Estimated Impact</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Users} iconColor="text-blue-600" value={reach} label="Reach" />
          <StatCard icon={MousePointerClick} iconColor="text-indigo-600" value={Math.round(reach * 0.045)} label="Engagements" />
          <StatCard icon={Globe} iconColor="text-emerald-600" value={platforms.length} label="Platforms" highlight />
        </div>
      </div>
    </>
  )
}

// ─── Email Flow ───

const emailAudiences = [
  { id: "inquirers", label: "Past inquirers for this model", detail: "6 contacts" },
  { id: "segment", label: "Matching segment shoppers", detail: "22 contacts" },
  { id: "active", label: "All active leads", detail: "42 contacts" },
]

function EmailFlow() {
  const [audiences, setAudiences] = useState(["inquirers", "segment"])
  const [channel, setChannel] = useState("both")
  const [schedule, setSchedule] = useState("optimal")

  const total = audiences.reduce((s, a) => {
    const au = emailAudiences.find((x) => x.id === a)
    return s + (au ? parseInt(au.detail) : 0)
  }, 0)

  return (
    <>
      <div>
        <SectionLabel>Audience</SectionLabel>
        <div className="space-y-2">
          {emailAudiences.map((a) => (
            <CheckCard key={a.id} checked={audiences.includes(a.id)} onChange={() => setAudiences(toggleItem(audiences, a.id))} cls={SEL}>
              <div className="flex-1">
                <p className="text-sm font-medium">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.detail}</p>
              </div>
            </CheckCard>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <SectionLabel>Send Via</SectionLabel>
          <div className="space-y-1.5">
            {[
              { id: "email", label: "Email", icon: Mail },
              { id: "sms", label: "SMS", icon: MessageSquare },
              { id: "both", label: "Email + SMS", icon: Send },
            ].map((c) => (
              <ToggleCard key={c.id} selected={channel === c.id} onClick={() => setChannel(c.id)} cls={SEL}>
                <c.icon className="h-4 w-4 text-emerald-600 mt-0.5" />
                <p className="text-sm font-medium">{c.label}</p>
              </ToggleCard>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>Schedule</SectionLabel>
          <div className="space-y-1.5">
            {[
              { id: "now", label: "Send Now" },
              { id: "morning", label: "Tomorrow 9 AM" },
              { id: "optimal", label: "AI Optimal" },
            ].map((s) => (
              <ToggleCard key={s.id} selected={schedule === s.id} onClick={() => setSchedule(s.id)} cls={SEL}>
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
          <StatCard icon={Users} iconColor="text-emerald-600" value={total} label="Recipients" />
          <StatCard icon={Mail} iconColor="text-indigo-600" value={Math.round(total * 0.42)} label="Est. Opens" />
          <StatCard icon={MousePointerClick} iconColor="text-emerald-600" value={Math.round(total * 0.42 * 0.18)} label="Est. Clicks" highlight />
        </div>
      </div>
    </>
  )
}

// ─── Quick Ad Flow ───

const adChannels = [
  { id: "google", label: "Google Ads", detail: "Search & display" },
  { id: "meta", label: "Meta Ads", detail: "Facebook & Instagram" },
  { id: "marketplace", label: "AutoTrader / Cars.com", detail: "Marketplace boost" },
]

function QuickAdFlow() {
  const [channels, setChannels] = useState(["google", "meta"])
  const [budget, setBudget] = useState("50")
  const [duration, setDuration] = useState("7d")

  const dailyBudget = Math.max(10, Number(budget) || 10)
  const days = duration === "7d" ? 7 : duration === "14d" ? 14 : 30
  const impressions = dailyBudget * days * 12 * Math.max(channels.length, 1)
  const clicks = Math.round(impressions * 0.032)
  const leads = Math.round(clicks * 0.08)

  return (
    <>
      <div>
        <SectionLabel>Ad Channels</SectionLabel>
        <div className="space-y-2">
          {adChannels.map((ch) => (
            <CheckCard key={ch.id} checked={channels.includes(ch.id)} onChange={() => setChannels(toggleItem(channels, ch.id))} cls={SEL}>
              <div>
                <p className="text-sm font-medium">{ch.label}</p>
                <p className="text-xs text-muted-foreground">{ch.detail}</p>
              </div>
            </CheckCard>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <SectionLabel>Daily Budget</SectionLabel>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              min={10}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-7 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
            />
          </div>
        </div>
        <div>
          <SectionLabel>Duration</SectionLabel>
          <div className="flex gap-1.5">
            {[{ v: "7d", l: "7 days" }, { v: "14d", l: "14 days" }, { v: "30d", l: "30 days" }].map((d) => (
              <Button key={d.v} type="button" size="sm" variant={duration === d.v ? "default" : "outline"} onClick={() => setDuration(d.v)} className="flex-1 text-xs">
                {d.l}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <Separator />
      <div>
        <SectionLabel>Estimated Impact</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Users} iconColor="text-blue-600" value={impressions > 1000 ? `${(impressions / 1000).toFixed(1)}k` : impressions} label="Impressions" />
          <StatCard icon={MousePointerClick} iconColor="text-indigo-600" value={clicks} label="Clicks" />
          <StatCard icon={TrendingUp} iconColor="text-emerald-600" value={leads} label="Est. Leads" highlight />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Total budget: ${(dailyBudget * days).toLocaleString()} over {days} days
        </p>
      </div>
    </>
  )
}

// ─── Main Modal ───

interface BoostPerformerModalProps {
  vehicle: MerchandisingVehicle | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BoostPerformerModal({ vehicle, open, onOpenChange }: BoostPerformerModalProps) {
  const [boostType, setBoostType] = useState<string | null>(null)
  const [launched, setLaunched] = useState(false)

  if (!vehicle) return null

  const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`

  function handleLaunch() {
    setLaunched(true)
    setTimeout(() => {
      setLaunched(false)
      setBoostType(null)
      onOpenChange(false)
    }, 1800)
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setLaunched(false)
      setBoostType(null)
    }
    onOpenChange(next)
  }

  if (launched) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="rounded-full bg-emerald-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Boost Activated!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {boostTypes.find((t) => t.id === boostType)?.label ?? "Boost"} is now live for {vehicleName}.
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
            <Zap className="h-5 w-5 text-emerald-600" />
            Boost Top Performer
          </DialogTitle>
          <DialogDescription>
            Amplify momentum for this high-performing listing.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-emerald-50/40 p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">{vehicleName}</p>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <TrendingUp className="h-3 w-3 mr-1" />
              Top Performer
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>{vehicle.vdpViews} VDP views</span>
            <span>Score: {vehicle.listingScore}</span>
            <span>{vehicle.daysInStock} days in stock</span>
          </div>
        </div>

        <Separator />

        <div>
          <SectionLabel>Boost Type</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {boostTypes.map((type) => {
              const Icon = type.icon
              return (
                <ToggleCard key={type.id} selected={boostType === type.id} onClick={() => setBoostType(type.id)} cls={SEL}>
                  <Icon className={`h-5 w-5 mt-0.5 ${boostType === type.id ? "text-emerald-600" : "text-muted-foreground"}`} />
                  <div>
                    <p className="text-sm font-medium">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </ToggleCard>
              )
            })}
          </div>
        </div>

        {boostType && (
          <>
            <Separator />
            <div className="space-y-4">
              {boostType === "featured" && <FeaturedFlow />}
              {boostType === "social" && <SocialFlow />}
              {boostType === "email" && <EmailFlow />}
              {boostType === "ads" && <QuickAdFlow />}
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleLaunch} disabled={!boostType} className="gap-1.5">
            <Zap className="h-4 w-4" />
            Activate Boost
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
