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
  TrendingDown,
  Wrench,
  Camera,
  DollarSign,
  Megaphone,
  FileText,
  CheckCircle2,
  Image,
  RotateCcw,
  Video,
  Sparkles,
  Globe,
  Eye,
  MousePointerClick,
  TrendingUp,
  Tag,
  Users,
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
    <div className={`rounded-lg border p-3 text-center ${highlight ? "bg-amber-50" : "bg-muted/30"}`}>
      <Icon className={`h-4 w-4 mx-auto mb-1 ${iconColor}`} />
      <p className={`text-lg font-bold font-mono ${highlight ? "text-amber-700" : ""}`}>{value}</p>
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

const SEL = "border-amber-300 bg-amber-50/50"

// ─── Improvement Types ───

const improvementTypes = [
  {
    id: "media",
    label: "Upgrade Media",
    description: "Replace stock/clone photos with real, professional media",
    icon: Camera,
  },
  {
    id: "pricing",
    label: "Pricing Adjustment",
    description: "Reprice to competitive market position",
    icon: DollarSign,
  },
  {
    id: "description",
    label: "Improve Description",
    description: "Rewrite listing copy for higher conversion",
    icon: FileText,
  },
  {
    id: "campaign",
    label: "Run a Campaign",
    description: "Drive traffic with targeted ads or outreach",
    icon: Megaphone,
  },
]

// ─── Media Upgrade Flow ───

const mediaPackages = [
  { id: "photos", label: "Professional Photos", detail: "36-photo studio walkthrough", icon: Image },
  { id: "spin360", label: "360° Spin", detail: "Interior & exterior interactive spin", icon: RotateCcw },
  { id: "video", label: "Video Walkaround", detail: "60-sec cinematic clip", icon: Video },
  { id: "backdrop", label: "AI Background Enhancement", detail: "Swap to lifestyle backdrop", icon: Sparkles },
]

const mediaScheduleSlots = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "thisweek", label: "This Week" },
]

function MediaFlow({ vehicle }: { vehicle: MerchandisingVehicle }) {
  const [packages, setPackages] = useState(["photos", "spin360"])
  const [scheduleSlot, setScheduleSlot] = useState("tomorrow")

  const currentScore = vehicle.listingScore
  const scoreBoost = packages.length * 18
  const projectedScore = Math.min(currentScore + scoreBoost, 100)

  return (
    <>
      <div className="rounded-lg border bg-red-50/40 p-3">
        <p className="text-xs font-semibold text-red-700 mb-1">Current Media Status</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{vehicle.photoCount} photos</span>
          <span>{vehicle.has360 ? "Has 360°" : "No 360°"}</span>
          <span>{vehicle.hasVideo ? "Has video" : "No video"}</span>
          <span>Score: {currentScore}</span>
        </div>
      </div>
      <div>
        <SectionLabel>Media Package</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {mediaPackages.map((pkg) => {
            const Icon = pkg.icon
            return (
              <CheckCard key={pkg.id} checked={packages.includes(pkg.id)} onChange={() => setPackages(toggleItem(packages, pkg.id))} cls={SEL}>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-4 w-4 text-amber-600" />
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
          {mediaScheduleSlots.map((s) => (
            <Button key={s.id} type="button" size="sm" variant={scheduleSlot === s.id ? "default" : "outline"} onClick={() => setScheduleSlot(s.id)} className="flex-1">
              {s.label}
            </Button>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <SectionLabel>Projected Improvement</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Image} iconColor="text-amber-600" value={`${currentScore} → ${projectedScore}`} label="Listing Score" highlight />
          <StatCard icon={Eye} iconColor="text-blue-600" value={`+${packages.length * 15}%`} label="VDP Lift" />
          <StatCard icon={TrendingUp} iconColor="text-emerald-600" value={`+${scoreBoost}`} label="Score Boost" />
        </div>
      </div>
    </>
  )
}

// ─── Pricing Flow ───

const pricingStrategies = [
  { id: "match", label: "Match Market Average", detail: "Align with regional average for this model" },
  { id: "undercut", label: "Undercut by 3%", detail: "Price slightly below market to drive leads" },
  { id: "value", label: "Value Position", detail: "Below market with 'Best Value' badge" },
  { id: "custom", label: "Custom Price", detail: "Set your own target price" },
]

const pricingHighlights = [
  { id: "drop-badge", label: "Price Drop Badge" },
  { id: "below-market", label: "\"Below Market\" Banner" },
  { id: "best-value", label: "\"Best Value\" Tag" },
]

function PricingFlow({ vehicle }: { vehicle: MerchandisingVehicle }) {
  const [strategy, setStrategy] = useState("match")
  const [highlights, setHighlights] = useState(["drop-badge"])
  const [platforms, setPlatforms] = useState(["website", "autotrader", "carscom"])

  const platformOpts = [
    { id: "website", label: "Website" },
    { id: "autotrader", label: "AutoTrader" },
    { id: "carscom", label: "Cars.com" },
    { id: "cargurus", label: "CarGurus" },
  ]

  return (
    <>
      <div className="rounded-lg border bg-red-50/40 p-3">
        <p className="text-xs font-semibold text-red-700 mb-1">Current Pricing</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{vehicle.vdpViews} VDP views</span>
          <span>{vehicle.daysInStock} days in stock</span>
          <span>Score: {vehicle.listingScore}</span>
        </div>
      </div>
      <div>
        <SectionLabel>Pricing Strategy</SectionLabel>
        <div className="space-y-2">
          {pricingStrategies.map((s) => (
            <ToggleCard key={s.id} selected={strategy === s.id} onClick={() => setStrategy(s.id)} cls={SEL}>
              <Tag className={`h-4 w-4 mt-0.5 ${strategy === s.id ? "text-amber-600" : "text-muted-foreground"}`} />
              <div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.detail}</p>
              </div>
            </ToggleCard>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Price Highlight</SectionLabel>
        <div className="flex gap-2">
          {pricingHighlights.map((h) => (
            <CheckCard key={h.id} checked={highlights.includes(h.id)} onChange={() => setHighlights(toggleItem(highlights, h.id))} cls={SEL}>
              <p className="text-xs font-medium">{h.label}</p>
            </CheckCard>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Update On</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {platformOpts.map((p) => (
            <CheckCard key={p.id} checked={platforms.includes(p.id)} onChange={() => setPlatforms(toggleItem(platforms, p.id))} cls={SEL}>
              <p className="text-sm font-medium">{p.label}</p>
            </CheckCard>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <SectionLabel>Projected Improvement</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={MousePointerClick} iconColor="text-amber-600" value="+25%" label="CTR Lift" highlight />
          <StatCard icon={Eye} iconColor="text-blue-600" value="+35%" label="VDP Lift" />
          <StatCard icon={Users} iconColor="text-emerald-600" value="+3" label="Est. New Leads" />
        </div>
      </div>
    </>
  )
}

// ─── Description Flow ───

const descriptionStyles = [
  { id: "ai-rewrite", label: "AI Rewrite", detail: "Generate optimized listing copy with keywords" },
  { id: "highlight-features", label: "Feature Highlights", detail: "Auto-extract and bullet top selling points" },
  { id: "competitive-edge", label: "Competitive Edge Copy", detail: "Positioning against similar listings nearby" },
]

const descriptionAddOns = [
  { id: "seo", label: "SEO Keywords", detail: "Inject high-traffic search terms" },
  { id: "urgency", label: "Urgency Language", detail: "\"Won't last\" and limited-availability phrasing" },
  { id: "social-proof", label: "Social Proof", detail: "\"X people viewed this week\" counter" },
]

function DescriptionFlow() {
  const [style, setStyle] = useState("ai-rewrite")
  const [addOns, setAddOns] = useState(["seo"])

  return (
    <>
      <div>
        <SectionLabel>Rewrite Style</SectionLabel>
        <div className="space-y-2">
          {descriptionStyles.map((s) => (
            <ToggleCard key={s.id} selected={style === s.id} onClick={() => setStyle(s.id)} cls={SEL}>
              <FileText className={`h-4 w-4 mt-0.5 ${style === s.id ? "text-amber-600" : "text-muted-foreground"}`} />
              <div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.detail}</p>
              </div>
            </ToggleCard>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Add-Ons</SectionLabel>
        <div className="space-y-2">
          {descriptionAddOns.map((a) => (
            <CheckCard key={a.id} checked={addOns.includes(a.id)} onChange={() => setAddOns(toggleItem(addOns, a.id))} cls={SEL}>
              <div>
                <p className="text-sm font-medium">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.detail}</p>
              </div>
            </CheckCard>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <SectionLabel>Projected Improvement</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={FileText} iconColor="text-amber-600" value="+20%" label="Engagement" highlight />
          <StatCard icon={MousePointerClick} iconColor="text-blue-600" value="+15%" label="Lead Conversion" />
          <StatCard icon={Eye} iconColor="text-indigo-600" value="+18%" label="Time on Page" />
        </div>
      </div>
    </>
  )
}

// ─── Campaign Flow ───

const quickCampaignTypes = [
  { id: "search", label: "Search Ads", detail: "Google search results targeting" },
  { id: "social", label: "Social Ads", detail: "Facebook & Instagram targeted post" },
  { id: "email", label: "Email Blast", detail: "Notify matching shoppers in CRM" },
  { id: "retarget", label: "Retargeting", detail: "Re-engage past VDP visitors" },
]

function CampaignFlow() {
  const [types, setTypes] = useState(["search", "social"])
  const [budget, setBudget] = useState("40")
  const [duration, setDuration] = useState("7d")

  const dailyBudget = Math.max(10, Number(budget) || 10)
  const days = duration === "7d" ? 7 : duration === "14d" ? 14 : 30
  const impressions = dailyBudget * days * 10 * Math.max(types.length, 1)
  const clicks = Math.round(impressions * 0.035)
  const leads = Math.round(clicks * 0.09)

  return (
    <>
      <div>
        <SectionLabel>Campaign Channels</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {quickCampaignTypes.map((t) => (
            <CheckCard key={t.id} checked={types.includes(t.id)} onChange={() => setTypes(toggleItem(types, t.id))} cls={SEL}>
              <div>
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.detail}</p>
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
            {[{ v: "7d", l: "7d" }, { v: "14d", l: "14d" }, { v: "30d", l: "30d" }].map((d) => (
              <Button key={d.v} type="button" size="sm" variant={duration === d.v ? "default" : "outline"} onClick={() => setDuration(d.v)} className="flex-1 text-xs">
                {d.l}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <Separator />
      <div>
        <SectionLabel>Projected Improvement</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Users} iconColor="text-amber-600" value={impressions > 1000 ? `${(impressions / 1000).toFixed(1)}k` : impressions} label="Impressions" />
          <StatCard icon={MousePointerClick} iconColor="text-blue-600" value={clicks} label="Clicks" />
          <StatCard icon={TrendingUp} iconColor="text-emerald-600" value={leads} label="Est. Leads" highlight />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Total: ${(dailyBudget * days).toLocaleString()} over {days} days
        </p>
      </div>
    </>
  )
}

// ─── Main Modal ───

interface ImproveListingModalProps {
  vehicle: MerchandisingVehicle | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImproveListingModal({ vehicle, open, onOpenChange }: ImproveListingModalProps) {
  const [improvementType, setImprovementType] = useState<string | null>(null)
  const [applied, setApplied] = useState(false)

  if (!vehicle) return null

  const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`

  function handleApply() {
    setApplied(true)
    setTimeout(() => {
      setApplied(false)
      setImprovementType(null)
      onOpenChange(false)
    }, 1800)
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setApplied(false)
      setImprovementType(null)
    }
    onOpenChange(next)
  }

  if (applied) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="rounded-full bg-amber-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-amber-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Improvement Applied!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {improvementTypes.find((t) => t.id === improvementType)?.label ?? "Improvement"} is underway for {vehicleName}.
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
            <Wrench className="h-5 w-5 text-amber-600" />
            Improve Listing
          </DialogTitle>
          <DialogDescription>
            Fix underperformance and drive more views for this vehicle.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-red-50/40 p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">{vehicleName}</p>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <TrendingDown className="h-3 w-3 mr-1" />
              Needs Attention
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>{vehicle.vdpViews} VDP views</span>
            <span>Score: {vehicle.listingScore}</span>
            <span>{vehicle.daysInStock} days in stock</span>
            <span>{vehicle.photoCount} photos</span>
          </div>
        </div>

        <Separator />

        <div>
          <SectionLabel>What to Improve</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {improvementTypes.map((type) => {
              const Icon = type.icon
              return (
                <ToggleCard key={type.id} selected={improvementType === type.id} onClick={() => setImprovementType(type.id)} cls={SEL}>
                  <Icon className={`h-5 w-5 mt-0.5 ${improvementType === type.id ? "text-amber-600" : "text-muted-foreground"}`} />
                  <div>
                    <p className="text-sm font-medium">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </ToggleCard>
              )
            })}
          </div>
        </div>

        {improvementType && (
          <>
            <Separator />
            <div className="space-y-4">
              {improvementType === "media" && <MediaFlow vehicle={vehicle} />}
              {improvementType === "pricing" && <PricingFlow vehicle={vehicle} />}
              {improvementType === "description" && <DescriptionFlow />}
              {improvementType === "campaign" && <CampaignFlow />}
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleApply} disabled={!improvementType} className="gap-1.5 bg-amber-600 hover:bg-amber-700">
            <Wrench className="h-4 w-4" />
            Apply Improvement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
