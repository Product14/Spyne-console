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
  Flame,
  TrendingUp,
  Star,
  Share2,
  Mail,
  Tag,
  Megaphone,
  CheckCircle2,
  Globe,
  Clock,
  Eye,
  MousePointerClick,
  Users,
  BarChart3,
  Image,
  MessageSquare,
  Send,
  type LucideIcon,
} from "lucide-react"
import type { OpportunityItem } from "@/services/max-2/max-2.types"

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
      <p className={`text-lg font-bold font-mono ${highlight ? "text-emerald-700" : ""}`}>
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

// ─── Promotion Types ───

const promotionTypes = [
  {
    id: "featured",
    label: "Featured Listing Boost",
    description: "Pin to top of search results across platforms",
    icon: Star,
    color: "text-amber-600",
    bgSelected: "border-amber-300 bg-amber-50/50",
  },
  {
    id: "social",
    label: "Social Media Spotlight",
    description: "Auto-post to your dealership social pages",
    icon: Share2,
    color: "text-blue-600",
    bgSelected: "border-blue-300 bg-blue-50/50",
  },
  {
    id: "email",
    label: "Email Blast to Leads",
    description: "Notify past inquirers and matching shoppers",
    icon: Mail,
    color: "text-violet-600",
    bgSelected: "border-violet-300 bg-violet-50/50",
  },
  {
    id: "price",
    label: "Price Spotlight",
    description: "Highlight competitive pricing vs. market",
    icon: Tag,
    color: "text-emerald-600",
    bgSelected: "border-emerald-300 bg-emerald-50/50",
  },
]

// ─── Featured Listing Flow ───

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

const featuredLevels = [
  { id: "standard", label: "Standard Boost", detail: "Higher in search results" },
  { id: "premium", label: "Premium Placement", detail: "Top-of-page with highlight badge" },
]

function FeaturedFlow() {
  const [platforms, setPlatforms] = useState(["website", "autotrader", "carscom"])
  const [duration, setDuration] = useState("7d")
  const [level, setLevel] = useState("standard")

  const vdpLift = level === "premium" ? 65 : 45
  const impressionBoost = platforms.length * (level === "premium" ? 400 : 250)

  return (
    <>
      <div>
        <SectionLabel>Platforms</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {featuredPlatforms.map((p) => (
            <CheckCard
              key={p.id}
              checked={platforms.includes(p.id)}
              onChange={() => setPlatforms(toggleItem(platforms, p.id))}
              selectedClass="border-amber-300 bg-amber-50/50"
            >
              <div>
                <p className="text-sm font-medium">{p.label}</p>
              </div>
            </CheckCard>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Boost Duration</SectionLabel>
        <div className="flex gap-2">
          {featuredDurations.map((d) => (
            <Button
              key={d.value}
              type="button"
              size="sm"
              variant={duration === d.value ? "default" : "outline"}
              onClick={() => setDuration(d.value)}
              className="flex-1"
            >
              {d.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Boost Level</SectionLabel>
        <div className="space-y-2">
          {featuredLevels.map((l) => (
            <ToggleCard
              key={l.id}
              selected={level === l.id}
              onClick={() => setLevel(l.id)}
              selectedClass="border-amber-300 bg-amber-50/50"
            >
              <Star
                className={`h-4 w-4 mt-0.5 ${level === l.id ? "text-amber-600" : "text-muted-foreground"}`}
              />
              <div>
                <p className="text-sm font-medium">{l.label}</p>
                <p className="text-xs text-muted-foreground">{l.detail}</p>
              </div>
            </ToggleCard>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <SectionLabel>Estimated Impact</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Eye} iconColor="text-amber-600" value={`+${vdpLift}%`} label="VDP Views" />
          <StatCard icon={Globe} iconColor="text-blue-600" value={platforms.length} label="Platforms" />
          <StatCard icon={Users} iconColor="text-emerald-600" value={`+${impressionBoost}`} label="Impressions/day" highlight />
        </div>
      </div>
    </>
  )
}

// ─── Social Media Flow ───

const socialPlatforms = [
  { id: "fb-page", label: "Facebook Page" },
  { id: "instagram", label: "Instagram" },
  { id: "fb-marketplace", label: "FB Marketplace" },
]

const socialPostTypes = [
  { id: "single", label: "Single Photo", detail: "Best exterior shot with overlay", icon: Image },
  { id: "carousel", label: "Carousel", detail: "5-image swipeable gallery", icon: Image },
  { id: "video", label: "Video Clip", detail: "15-sec walkaround highlight", icon: Share2 },
  { id: "story", label: "Story / Reel", detail: "Vertical format for max reach", icon: Share2 },
]

const socialSchedules = [
  { id: "now", label: "Post Now" },
  { id: "peak", label: "Next Peak Hour" },
  { id: "tomorrow", label: "Tomorrow 10 AM" },
]

function SocialFlow() {
  const [platforms, setPlatforms] = useState(["fb-page", "instagram"])
  const [postType, setPostType] = useState("carousel")
  const [schedule, setSchedule] = useState("peak")

  const reachPerPlatform = postType === "video" || postType === "story" ? 350 : 200
  const totalReach = platforms.length * reachPerPlatform
  const estEngagement = Math.round(totalReach * 0.045)

  return (
    <>
      <div>
        <SectionLabel>Platforms</SectionLabel>
        <div className="flex gap-2">
          {socialPlatforms.map((p) => (
            <CheckCard
              key={p.id}
              checked={platforms.includes(p.id)}
              onChange={() => setPlatforms(toggleItem(platforms, p.id))}
              selectedClass="border-blue-300 bg-blue-50/50"
            >
              <div>
                <p className="text-sm font-medium">{p.label}</p>
              </div>
            </CheckCard>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Post Type</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {socialPostTypes.map((t) => {
            const Icon = t.icon
            return (
              <ToggleCard
                key={t.id}
                selected={postType === t.id}
                onClick={() => setPostType(t.id)}
                selectedClass="border-blue-300 bg-blue-50/50"
              >
                <Icon
                  className={`h-4 w-4 mt-0.5 ${postType === t.id ? "text-blue-600" : "text-muted-foreground"}`}
                />
                <div>
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.detail}</p>
                </div>
              </ToggleCard>
            )
          })}
        </div>
      </div>

      <div>
        <SectionLabel>Schedule</SectionLabel>
        <div className="flex gap-2">
          {socialSchedules.map((s) => (
            <Button
              key={s.id}
              type="button"
              size="sm"
              variant={schedule === s.id ? "default" : "outline"}
              onClick={() => setSchedule(s.id)}
              className="flex-1 text-xs"
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <SectionLabel>Estimated Impact</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Users} iconColor="text-blue-600" value={totalReach} label="Reach" />
          <StatCard icon={MousePointerClick} iconColor="text-indigo-600" value={estEngagement} label="Engagements" />
          <StatCard icon={Globe} iconColor="text-emerald-600" value={platforms.length} label="Platforms" highlight />
        </div>
      </div>
    </>
  )
}

// ─── Email Blast Flow ───

const emailAudiences = [
  { id: "past", label: "Past inquirers on this vehicle", detail: "5 contacts" },
  { id: "segment", label: "Matching segment shoppers", detail: "18 contacts" },
  { id: "active", label: "All active leads", detail: "42 contacts" },
]

const emailTemplates = [
  { id: "hot", label: "Hot Vehicle Alert", detail: "Demand-driven urgency message" },
  { id: "price", label: "Price Spotlight", detail: "Below-market pricing callout" },
  { id: "limited", label: "Limited Availability", detail: "\"Going fast\" scarcity nudge" },
]

const emailChannels = [
  { id: "email", label: "Email Only", icon: Mail },
  { id: "sms", label: "SMS Only", icon: MessageSquare },
  { id: "both", label: "Email + SMS", icon: Send },
]

const emailSchedules = [
  { id: "now", label: "Send Now" },
  { id: "morning", label: "Tomorrow 9 AM" },
  { id: "optimal", label: "AI Optimal" },
]

function EmailBlastFlow() {
  const [audiences, setAudiences] = useState(["past", "segment"])
  const [template, setTemplate] = useState("hot")
  const [channel, setChannel] = useState("both")
  const [schedule, setSchedule] = useState("optimal")

  const totalRecipients = audiences.reduce((sum, a) => {
    const aud = emailAudiences.find((au) => au.id === a)
    const num = aud ? parseInt(aud.detail) : 0
    return sum + num
  }, 0)
  const estOpens = Math.round(totalRecipients * 0.42)
  const estClicks = Math.round(estOpens * 0.18)

  return (
    <>
      <div>
        <SectionLabel>Audience</SectionLabel>
        <div className="space-y-2">
          {emailAudiences.map((a) => (
            <CheckCard
              key={a.id}
              checked={audiences.includes(a.id)}
              onChange={() => setAudiences(toggleItem(audiences, a.id))}
              selectedClass="border-violet-300 bg-violet-50/50"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.detail}</p>
              </div>
            </CheckCard>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Template</SectionLabel>
        <div className="space-y-2">
          {emailTemplates.map((t) => (
            <ToggleCard
              key={t.id}
              selected={template === t.id}
              onClick={() => setTemplate(t.id)}
              selectedClass="border-violet-300 bg-violet-50/50"
            >
              <div>
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.detail}</p>
              </div>
            </ToggleCard>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <SectionLabel>Send Via</SectionLabel>
          <div className="space-y-1.5">
            {emailChannels.map((c) => (
              <ToggleCard
                key={c.id}
                selected={channel === c.id}
                onClick={() => setChannel(c.id)}
                selectedClass="border-violet-300 bg-violet-50/50"
              >
                <c.icon className="h-4 w-4 text-violet-600 mt-0.5" />
                <p className="text-sm font-medium">{c.label}</p>
              </ToggleCard>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>Schedule</SectionLabel>
          <div className="space-y-1.5">
            {emailSchedules.map((s) => (
              <ToggleCard
                key={s.id}
                selected={schedule === s.id}
                onClick={() => setSchedule(s.id)}
                selectedClass="border-violet-300 bg-violet-50/50"
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
          <StatCard icon={Users} iconColor="text-violet-600" value={totalRecipients} label="Recipients" />
          <StatCard icon={Mail} iconColor="text-indigo-600" value={estOpens} label="Est. Opens" />
          <StatCard icon={MousePointerClick} iconColor="text-emerald-600" value={estClicks} label="Est. Clicks" highlight />
        </div>
      </div>
    </>
  )
}

// ─── Price Spotlight Flow ───

const priceComparisons = [
  { id: "market", label: "vs. Market Average", detail: "Show price against avg in your region" },
  { id: "competitor", label: "vs. Competitor Listings", detail: "Compare to similar listings nearby" },
  { id: "original", label: "vs. Original List Price", detail: "Highlight how much price has dropped" },
]

const priceBadgeStyles = [
  { id: "drop", label: "Price Drop Badge", detail: "Red tag showing $ amount saved" },
  { id: "below", label: "\"Below Market\" Banner", detail: "Green banner across listing photo" },
  { id: "value", label: "\"Best Value\" Tag", detail: "Blue tag with value ranking in segment" },
]

const priceDurations = [
  { value: "7d", label: "7 days" },
  { value: "14d", label: "14 days" },
  { value: "30d", label: "30 days" },
]

const pricePlatforms = [
  { id: "website", label: "Dealer Website" },
  { id: "autotrader", label: "AutoTrader" },
  { id: "carscom", label: "Cars.com" },
  { id: "cargurus", label: "CarGurus" },
]

function PriceSpotlightFlow() {
  const [comparison, setComparison] = useState("market")
  const [badgeStyle, setBadgeStyle] = useState("drop")
  const [duration, setDuration] = useState("14d")
  const [platforms, setPlatforms] = useState(["website", "autotrader", "carscom"])

  const ctrLift = badgeStyle === "value" ? 35 : badgeStyle === "below" ? 30 : 25
  const leadLift = Math.round(ctrLift * 0.4)

  return (
    <>
      <div>
        <SectionLabel>Price Comparison</SectionLabel>
        <div className="space-y-2">
          {priceComparisons.map((c) => (
            <ToggleCard
              key={c.id}
              selected={comparison === c.id}
              onClick={() => setComparison(c.id)}
              selectedClass="border-emerald-300 bg-emerald-50/50"
            >
              <Tag
                className={`h-4 w-4 mt-0.5 ${comparison === c.id ? "text-emerald-600" : "text-muted-foreground"}`}
              />
              <div>
                <p className="text-sm font-medium">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.detail}</p>
              </div>
            </ToggleCard>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Highlight Style</SectionLabel>
        <div className="space-y-2">
          {priceBadgeStyles.map((b) => (
            <ToggleCard
              key={b.id}
              selected={badgeStyle === b.id}
              onClick={() => setBadgeStyle(b.id)}
              selectedClass="border-emerald-300 bg-emerald-50/50"
            >
              <div>
                <p className="text-sm font-medium">{b.label}</p>
                <p className="text-xs text-muted-foreground">{b.detail}</p>
              </div>
            </ToggleCard>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <SectionLabel>Duration</SectionLabel>
          <div className="flex gap-1.5">
            {priceDurations.map((d) => (
              <Button
                key={d.value}
                type="button"
                size="sm"
                variant={duration === d.value ? "default" : "outline"}
                onClick={() => setDuration(d.value)}
                className="flex-1 text-xs"
              >
                {d.label}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>Show On</SectionLabel>
          <div className="grid grid-cols-2 gap-1.5">
            {pricePlatforms.map((p) => (
              <CheckCard
                key={p.id}
                checked={platforms.includes(p.id)}
                onChange={() => setPlatforms(toggleItem(platforms, p.id))}
                selectedClass="border-emerald-300 bg-emerald-50/50"
              >
                <p className="text-xs font-medium">{p.label}</p>
              </CheckCard>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <SectionLabel>Estimated Impact</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={MousePointerClick} iconColor="text-emerald-600" value={`+${ctrLift}%`} label="CTR Lift" />
          <StatCard icon={TrendingUp} iconColor="text-indigo-600" value={`+${leadLift}%`} label="Lead Lift" />
          <StatCard icon={Globe} iconColor="text-emerald-600" value={platforms.length} label="Platforms" highlight />
        </div>
      </div>
    </>
  )
}

// ─── Main Modal ───

interface PromoteVehicleModalProps {
  vehicle: OpportunityItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PromoteVehicleModal({
  vehicle,
  open,
  onOpenChange,
}: PromoteVehicleModalProps) {
  const [promoType, setPromoType] = useState<string | null>(null)
  const [promoted, setPromoted] = useState(false)

  if (!vehicle) return null

  const vdpMatch = vehicle.detail.match(/VDPs?\s+up\s+(\d+)%/)
  const vdpPct = vdpMatch ? vdpMatch[1] : null

  function handlePromote() {
    setPromoted(true)
    setTimeout(() => {
      setPromoted(false)
      setPromoType(null)
      onOpenChange(false)
    }, 1800)
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setPromoted(false)
      setPromoType(null)
    }
    onOpenChange(next)
  }

  if (promoted) {
    const typeInfo = promotionTypes.find((t) => t.id === promoType)
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="rounded-full bg-orange-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-orange-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Promotion Active!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {typeInfo?.label ?? "Promotion"} is now live for {vehicle.title}.
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
            <Flame className="h-5 w-5 text-orange-500" />
            Promote Vehicle
          </DialogTitle>
          <DialogDescription>
            Boost visibility and drive more leads for this high-demand vehicle.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">{vehicle.title}</p>
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200"
            >
              <Flame className="h-3 w-3 mr-1" />
              Hot
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">{vehicle.detail}</p>
          {vdpPct && (
            <div className="flex items-center gap-1.5 text-xs mt-2">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-semibold text-emerald-700">+{vdpPct}%</span>
              <span className="text-muted-foreground">VDP views this week</span>
            </div>
          )}
        </div>

        <Separator />

        <div>
          <SectionLabel>Promotion Type</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {promotionTypes.map((type) => {
              const Icon = type.icon
              const selected = promoType === type.id
              return (
                <ToggleCard
                  key={type.id}
                  selected={selected}
                  onClick={() => setPromoType(type.id)}
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

        {promoType && (
          <>
            <Separator />
            <div className="space-y-4">
              {promoType === "featured" && <FeaturedFlow />}
              {promoType === "social" && <SocialFlow />}
              {promoType === "email" && <EmailBlastFlow />}
              {promoType === "price" && <PriceSpotlightFlow />}
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePromote}
            disabled={!promoType}
            className="gap-1.5 bg-orange-600 hover:bg-orange-700"
          >
            <Megaphone className="h-4 w-4" />
            Start Promotion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
