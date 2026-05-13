/**
 * Smart Campaigns mocks. Built on top of the existing merchandising vehicle
 * pool so the suggestions reflect a believable aging / holding-cost story,
 * plus festive seasonal and Certified Pre-Owned (CPO) campaigns.
 *
 * Certified-Pre-Owned campaign archetypes come from how franchise dealers
 * actually run programs (Honda True Certified, Toyota Certified, BMW CPO):
 *   - extended warranty / 7-year, 100k coverage messaging
 *   - 169-point inspection + vehicle history report trust badges
 *   - special CPO finance APR tiers (often 1.9% / 2.9%)
 */

import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import { STUDIO_HOLDING_COST_PER_DAY } from "@/lib/inventory-issue-label"
import { demoVehicleThumbnailByKey } from "@/lib/demo-vehicle-hero-images"
import type {
  Campaign,
  CampaignSuggestion,
  CampaignVehicle,
} from "@/services/max-2/smart-campaigns.types"

function toCampaignVehicle(v: (typeof mockMerchandisingVehicles)[number]): CampaignVehicle {
  return {
    vin: v.vin,
    name: `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ""}`,
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim,
    daysInStock: v.daysInStock,
    holdingAccumulated: v.daysInStock * STUDIO_HOLDING_COST_PER_DAY,
    price: v.price,
    thumbnailUrl: v.thumbnailUrl || demoVehicleThumbnailByKey(v.vin),
  }
}

function vehiclesAgedAtLeast(days: number): CampaignVehicle[] {
  return mockMerchandisingVehicles
    .filter((v) => v.daysInStock >= days && v.year > 0)
    .map(toCampaignVehicle)
}

function topHoldingCostVehicles(limit: number): CampaignVehicle[] {
  return [...mockMerchandisingVehicles]
    .filter((v) => v.year > 0)
    .map(toCampaignVehicle)
    .sort((a, b) => b.holdingAccumulated - a.holdingAccumulated)
    .slice(0, limit)
}

/** Hand-picked premium pre-owned for the CPO story. */
function cpoEligibleVehicles(limit: number): CampaignVehicle[] {
  return mockMerchandisingVehicles
    .filter((v) => !v.isNew && v.year >= 2021 && v.year > 0 && v.price >= 25_000)
    .slice(0, limit)
    .map(toCampaignVehicle)
}

/** New-vehicle pool for festive / seasonal pushes. */
function festiveEligibleVehicles(limit: number): CampaignVehicle[] {
  return mockMerchandisingVehicles
    .filter((v) => v.isNew && v.year > 0)
    .slice(0, limit)
    .map(toCampaignVehicle)
}

function sumHolding(list: CampaignVehicle[]): number {
  return list.reduce((acc, v) => acc + v.holdingAccumulated, 0)
}

const NOW = "2026-05-12T09:00:00.000Z"

const aged45 = vehiclesAgedAtLeast(45)
const topHc = topHoldingCostVehicles(8)
const cpo = cpoEligibleVehicles(10)
const festive = festiveEligibleVehicles(8)

/* ────────────────────────── Suggestions ────────────────────────── */

export const mockCampaignSuggestions: CampaignSuggestion[] = [
  /* ── Festive (2) ───────────────────────────────────────────────── */
  {
    id: "festive-holiday-sales",
    trigger: "festive",
    category: "festive",
    title: "Holiday Sales Event",
    reason:
      "December delivers the year's highest luxury and SUV intent. Pair sitewide holiday savings with featured new-car inventory to capture last-quarter shoppers.",
    vehicles: festive,
    config: {
      channels: ["google-ads", "meta-ads", "email", "social-organic"],
      budget: 3200,
      durationDays: 14,
      scheduledFor: "2026-12-15T09:00:00.000Z",
      creative: {
        headline: "Holiday savings, limited inventory",
        body: "Wrap up the year in something new. Hand-picked inventory priced for the holiday season.",
      },
    },
    projection: {
      impressions: 248_000,
      leads: 142,
      appointments: 34,
      unitsSold: 7,
      estimatedSpend: 3200,
      estimatedHoldingSavings: 4800,
    },
    surfacedAt: NOW,
  },
  {
    id: "festive-summer-clearance",
    trigger: "festive",
    category: "festive",
    title: "Summer Clearance Tax-Refund Bonus",
    reason:
      "Tax-refund season + early summer drives a 22% lift in showroom intent. Layer a $1,500 bonus message across paid + email.",
    vehicles: festive,
    config: {
      channels: ["google-ads", "meta-ads", "email"],
      budget: 2200,
      durationDays: 14,
      scheduledFor: "2026-06-01T09:00:00.000Z",
      creative: {
        headline: "$1,500 Tax-Refund Bonus this summer",
        body: "Apply your refund toward any new-vehicle purchase. Stack with current incentives.",
      },
    },
    projection: {
      impressions: 168_000,
      leads: 96,
      appointments: 24,
      unitsSold: 5,
      estimatedSpend: 2200,
      estimatedHoldingSavings: 3200,
    },
    surfacedAt: NOW,
  },

  /* ── Aging (2) ─────────────────────────────────────────────────── */
  {
    id: "aging-45plus",
    trigger: "aged-45",
    category: "aging",
    bucket: "45d",
    title: "Move 45+ day aged inventory",
    reason: `${aged45.length} VINs have crossed 45 days. $${Math.round(sumHolding(aged45)).toLocaleString()} in holding cost piling up. Push them before the 60-day cliff.`,
    vehicles: aged45,
    config: {
      channels: ["google-ads", "meta-ads", "vlp-spotlight"],
      budget: 2400,
      durationDays: 10,
      scheduledFor: NOW,
      creative: {
        headline: "Closeout pricing, must-go inventory",
        body: "Aged inventory priced to move this week. Limited stock. Schedule a test drive today.",
      },
    },
    projection: {
      impressions: 142_000,
      leads: 86,
      appointments: 22,
      unitsSold: 4,
      estimatedSpend: 2400,
      estimatedHoldingSavings: 5800,
    },
    surfacedAt: NOW,
  },
  {
    id: "aging-high-holding",
    trigger: "high-holding-cost",
    category: "aging",
    title: "Top holding-cost drag",
    reason: `${topHc.length} VINs are bleeding the most carry. $${Math.round(sumHolding(topHc)).toLocaleString()} combined. Pull them forward with a paid + VLP push.`,
    vehicles: topHc,
    config: {
      channels: ["google-ads", "vlp-spotlight", "email", "sms"],
      budget: 2800,
      durationDays: 10,
      scheduledFor: NOW,
      creative: {
        headline: "Featured this week. High-value picks.",
        body: "Premium inventory hand-selected by our sales team. Reserve today.",
      },
    },
    projection: {
      impressions: 124_000,
      leads: 74,
      appointments: 19,
      unitsSold: 4,
      estimatedSpend: 2800,
      estimatedHoldingSavings: 6200,
    },
    surfacedAt: NOW,
  },

  /* ── Certified (2) ─────────────────────────────────────────────── */
  {
    id: "cpo-trust-drive",
    trigger: "certified-pre-owned",
    category: "certified",
    title: "Certified Pre-Owned Trust Drive",
    reason:
      "Lead with the 169-point inspection, vehicle history report, and extended powertrain warranty. The three trust signals CPO shoppers respond to most.",
    vehicles: cpo,
    config: {
      channels: ["google-ads", "meta-ads", "autotrader", "cars-dot-com"],
      budget: 3600,
      durationDays: 14,
      scheduledFor: NOW,
      creative: {
        headline: "Certified Pre-Owned. Buy with confidence.",
        body: "Every CPO vehicle includes a 169-point inspection, history report, and 7-year/100k mile extended warranty.",
      },
    },
    projection: {
      impressions: 196_000,
      leads: 118,
      appointments: 28,
      unitsSold: 6,
      estimatedSpend: 3600,
      estimatedHoldingSavings: 4400,
    },
    surfacedAt: NOW,
  },
  {
    id: "cpo-1-9-apr",
    trigger: "certified-pre-owned",
    category: "certified",
    title: "CPO 1.9% APR Special Financing",
    reason:
      "Special APR pulls financed buyers off the fence. Pair 1.9% on qualifying CPO inventory with a trade-in bump email to existing service customers.",
    vehicles: cpo,
    config: {
      channels: ["meta-ads", "email", "sms", "vlp-spotlight"],
      budget: 2400,
      durationDays: 21,
      scheduledFor: NOW,
      creative: {
        headline: "1.9% APR on Certified Pre-Owned",
        body: "Limited-time financing on qualifying CPO inventory. Apply your trade-in for an extra $500 bump.",
      },
    },
    projection: {
      impressions: 142_000,
      leads: 92,
      appointments: 22,
      unitsSold: 5,
      estimatedSpend: 2400,
      estimatedHoldingSavings: 3600,
    },
    surfacedAt: NOW,
  },
]

/* ────────────────────────── Existing campaigns ────────────────────────── */

export const mockCampaigns: Campaign[] = [
  {
    id: "camp-2026-q1-spring-launch",
    kind: "manual",
    status: "running",
    title: "Spring Launch. Featured SUVs.",
    vehicles: mockMerchandisingVehicles
      .filter((v) => v.bodyStyle === "SUV" && v.year > 0)
      .slice(0, 6)
      .map(toCampaignVehicle),
    config: {
      channels: ["google-ads", "meta-ads", "autotrader"],
      budget: 4800,
      durationDays: 21,
      scheduledFor: "2026-04-22T09:00:00.000Z",
      creative: {
        headline: "Spring Launch. Featured SUVs.",
        body: "Hand-picked SUV inventory for spring. Reserve your test drive today.",
      },
    },
    performance: {
      impressions: 312_400,
      leads: 184,
      appointments: 46,
      unitsSold: 11,
      spend: 3_200,
    },
    createdAt: "2026-04-18T11:24:00.000Z",
    launchedAt: "2026-04-22T09:00:00.000Z",
    endsAt: "2026-05-13T09:00:00.000Z",
  },
  {
    id: "camp-2026-aged-truck-clearance",
    kind: "agentic",
    trigger: "aged-45",
    status: "completed",
    title: "Aged Truck Clearance · agentic",
    vehicles: mockMerchandisingVehicles
      .filter((v) => v.bodyStyle === "Pickup")
      .slice(0, 3)
      .map(toCampaignVehicle),
    config: {
      channels: ["google-ads", "vlp-spotlight"],
      budget: 1600,
      durationDays: 10,
      scheduledFor: "2026-03-15T09:00:00.000Z",
      creative: {
        headline: "Closeout pricing on aged trucks",
        body: "Limited inventory, priced to move this week.",
      },
    },
    performance: {
      impressions: 86_900,
      leads: 52,
      appointments: 13,
      unitsSold: 3,
      spend: 1_600,
    },
    createdAt: "2026-03-12T16:00:00.000Z",
    launchedAt: "2026-03-15T09:00:00.000Z",
    endsAt: "2026-03-25T09:00:00.000Z",
  },
]
