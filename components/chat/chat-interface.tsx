"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  Trash2,
  ArrowDown,
  Gauge,
  TrendingDown,
  Camera,
  Zap,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  followUps?: string[]
}

const SUGGESTED_PROMPTS = [
  {
    icon: Gauge,
    label: "Capital health check",
    prompt: "Give me a capital health check across my entire inventory right now.",
  },
  {
    icon: TrendingDown,
    label: "At-risk vehicles",
    prompt: "Which vehicles are burning the most margin and need immediate attention?",
  },
  {
    icon: Camera,
    label: "Media upgrade ROI",
    prompt: "Which vehicles would benefit most from a real media upgrade and what's the expected ROI?",
  },
  {
    icon: Zap,
    label: "Acceleration plan",
    prompt: "Build me a weekly acceleration plan to reduce aged inventory and protect margins.",
  },
]

interface AIResponse {
  content: string
  followUps: string[]
}

const MOCK_RESPONSES: Record<string, AIResponse> = {
  default: {
    content: `I've analyzed your current inventory of **142 vehicles** with **$4.82M capital deployed**. Here's the snapshot:

**Capital Health Summary:**
- Velocity Score: **72/100** (up 4.2 pts this month)
- Daily Burn Rate: **$12,640/day** (down 8.1% — good trend)
- Avg Days-to-Live: **18.4 days** (6 days above market benchmark)
- Capital Saved This Month: **$186,400**

**Stage Distribution:**
- Fresh (0–15 days): **68 vehicles** — $2.18M capital, 4.2% margin exposure
- Watch (16–30 days): **41 vehicles** — $1.31M capital, 18.6% margin exposure
- Risk (31–50 days): **24 vehicles** — $960K capital, 42.1% exposure
- Critical (51+ days): **9 vehicles** — $372K capital, 78.3% exposure

**Top Concern:** Your 9 critical vehicles are bleeding **$372K in locked capital** with 78.3% margin exposure. The Nissan Rogue (67 days) has already gone negative at **-$240 margin**.`,
    followUps: [
      "Show me the critical vehicles",
      "Build me an action plan",
      "Check my media mix",
    ],
  },

  capital: {
    content: `## Capital Health Check — Live Inventory

Your lot has **$4.82M deployed** across 142 units. Here's how your capital is performing:

| Metric | Value | Trend | vs. Benchmark |
|--------|-------|-------|---------------|
| Total Capital Locked | $4.82M | — | — |
| Daily Burn Rate | $12,640/day | -8.1% | Below avg (good) |
| Capital at Risk | $412K | -6.8% | Improving |
| Avg Days-to-Live | 18.4 days | +2.4 days | +6 days above market |
| Velocity Score | 72/100 | +4.2 pts | Above median |

**Where Your Capital Sits:**
- **45% in Fresh** ($2.18M) — Healthy, low exposure. These are turning well.
- **27% in Watch** ($1.31M) — 18.6% margin exposure. The BMW X3 and Ram 1500 here still have active campaigns running.
- **20% in Risk** ($960K) — 42.1% exposure. The Ford F-150 ($118/day burn, 0 appointments) and Jeep Grand Cherokee ($106/day, $890 margin left) need campaign activation now.
- **8% in Critical** ($372K) — 78.3% exposure. This is your capital emergency zone.

**Recommendation:** Shift focus to the 3 Risk vehicles with no active campaigns. Activating acceleration packs on the F-150, Grand Cherokee, and Kia Sportage could save an estimated **$2,400/week** in margin bleed.`,
    followUps: [
      "Which vehicles are critical right now?",
      "How can I reduce the daily burn rate?",
      "Compare this to last month's numbers",
    ],
  },

  risk: {
    content: `## High-Burn Vehicles Requiring Immediate Attention

I've ranked your inventory by margin urgency. These vehicles are your top capital risks:

### Critical — Act Today
| Vehicle | Days | Daily Burn | Margin Left | Status |
|---------|------|-----------|-------------|--------|
| 2024 Nissan Rogue SL AWD | 67 days | $76/day | **-$240** | Margin depleted |
| 2024 VW Tiguan SEL R-Line | 58 days | $88/day | **$320** | ~3.6 days left |

The **Rogue** has been on your lot for 67 days with zero leads and 0.2% CTR — it's past the point of organic recovery. The **Tiguan** has about 3.6 days of margin runway at current burn.

### Risk — This Week
| Vehicle | Days | Daily Burn | Margin Left | Campaigns |
|---------|------|-----------|-------------|-----------|
| 2024 Ford F-150 Lariat | 38 days | $118/day | $1,480 | None |
| 2024 Jeep Grand Cherokee | 44 days | $106/day | $890 | Scheduled |
| 2024 Kia Sportage X-Pro | 41 days | $96/day | $1,120 | None |

**The F-150 is your biggest single-vehicle risk** — $118/day burn with only 2 leads and no campaign. At this rate it has ~12 days before margin depletion.

**Recommended Actions:**
1. **Nissan Rogue** — Price to move. Consider wholesale if no leads in 5 days.
2. **VW Tiguan** — Emergency media upgrade + price reduction. $320 margin = 3 days.
3. **Ford F-150** — Activate Acceleration Pack immediately. Estimated 5–8 days faster turn.
4. **Kia Sportage** — Upgrade from clone to real media. Below-benchmark VDP performance.`,
    followUps: [
      "Activate campaigns for these vehicles",
      "What about the watch-stage vehicles?",
      "Price reduction recommendations",
    ],
  },

  media: {
    content: `## Real Media Upgrade — ROI Analysis

I've identified vehicles where upgrading from **AI clone media to real photography** would deliver the highest conversion lift:

### Top Candidates for Media Upgrade

| Vehicle | Stage | VDP Views | CTR | Leads | Current Media |
|---------|-------|-----------|-----|-------|---------------|
| 2024 Ford F-150 Lariat | Risk | 1,240 | 1.2% | 2 | Clone |
| 2025 Chevy Equinox RS | Watch | 640 | 2.1% | 4 | Clone |
| 2024 Kia Sportage X-Pro | Risk | 720 | 1.6% | 3 | Clone |
| 2024 Jeep Grand Cherokee | Risk | 980 | 0.8% | 1 | Clone |

**Why these vehicles?**
- They have meaningful VDP traffic but **below-benchmark conversion rates**
- Real media typically delivers a **+22% lift in lead conversion** vs. clone
- These are in Watch/Risk stages where faster turns save real margin

**Expected Impact if Upgraded:**
- **F-150:** CTR could lift from 1.2% → ~1.5%, adding an estimated 3–4 leads
- **Equinox:** Already decent CTR; real media could push appointments from 1 → 3
- **Sportage:** Below benchmark at 1.6% CTR; real photos could recover ~$456 in margin

**Vehicles already benefiting from real media:**
- 2025 Hyundai Tucson Limited HEV — 5.6% CTR, 18 leads, 5 appointments (your top performer)
- 2024 BMW X3 xDrive30i — 3.4% CTR, 6 leads, performing above benchmark

Your current media mix is **62% AI Instant / 38% Real**. The benchmark threshold for optimal conversion is **70% real media**. Upgrading the 4 candidates above would shift your mix to ~50/50.`,
    followUps: [
      "What's the cost vs return for these upgrades?",
      "Show me clone vs real performance side-by-side",
      "Schedule real media shoots for top 4",
    ],
  },

  acceleration: {
    content: `## Weekly Acceleration Plan — Aged Inventory Reduction

Here's a structured 2-week plan to reduce your aged inventory and protect margins:

### Week 1: Emergency Stabilization

**Monday–Tuesday: Critical Vehicles**
- **VW Tiguan** ($320 margin, ~3 days left) → Activate Tier 2 Acceleration + price drop of $800. Target: generate 2+ leads by Thursday.
- **Nissan Rogue** (-$240 margin, 67 days) → Move to wholesale evaluation. If no offer by Wednesday, list at auction floor price.

**Wednesday–Thursday: Risk Vehicles without Campaigns**
- **Ford F-150** ($118/day burn) → Launch Acceleration Pack Tier 2. Real media upgrade. This is your highest single-vehicle daily burn.
- **Kia Sportage** ($96/day burn) → Activate campaign + upgrade to real media. Below-benchmark VDP at 720 views.

**Friday: Review & Adjust**
- Check lead velocity on activated campaigns
- If F-150 generates 2+ leads, maintain. If zero, escalate to Tier 3 + price reduction.

### Week 2: Watch → Fresh Conversion

**Monday–Tuesday: Watch Vehicles Approaching Risk**
- **Chevy Equinox** (22 days, $94/day burn) → Upgrade media. It has 4 leads but only 2.1% CTR — real photos could push it to close.
- **Subaru Outback** (25 days, $86/day burn) → Activate campaign. 5 leads but 0 appointments — needs ad push.

**Wednesday–Thursday: Optimize Performing Units**
- **Ram 1500** (19 days, already has campaign) → Check campaign attribution. 9 leads, 3 appointments — may close organically.
- **BMW X3** (28 days, real media) → Performing well. Monitor only.

**Friday: Scorecard**
- Target: Move 2 vehicles from Risk → Watch equivalent metrics
- Target: Close 1 Critical vehicle (Tiguan or Rogue exit)
- Target: Protect **$3,200+** in margin through accelerated turns

**Expected Outcomes After 2 Weeks:**
- Daily burn reduction: **$12,640 → ~$11,200/day** (-11%)
- Capital at risk reduction: **$412K → ~$320K** (-22%)
- Vehicles in Risk+Critical: **33 → ~26**`,
    followUps: [
      "Generate campaign details for the F-150",
      "What's the wholesale value on the Rogue?",
      "Show me the budget needed for this plan",
    ],
  },

  campaigns: {
    content: `## Campaign Activation — Recommended Setup

Here's the campaign configuration for your highest-priority vehicles:

### 1. Ford F-150 Lariat 4WD — Tier 2 Acceleration
| Parameter | Value |
|-----------|-------|
| Campaign Type | Acceleration Pack — Tier 2 |
| Budget | $45/day ($315/week) |
| Targeting | 25-mile radius, truck intenders, conquest |
| Estimated Lead Lift | +3–5 leads/week |
| Estimated Days Saved | 5–8 days |
| Margin Protection | ~$590–$944 |

### 2. Kia Sportage X-Pro — Tier 2 Acceleration + Media
| Parameter | Value |
|-----------|-------|
| Campaign Type | Acceleration + Real Media Upgrade |
| Budget | $40/day ($280/week) |
| Targeting | 20-mile radius, SUV shoppers |
| Estimated Lead Lift | +2–4 leads/week |
| Estimated Days Saved | 4–6 days |
| Margin Protection | ~$384–$576 |

### 3. Jeep Grand Cherokee — Tier 1 Boost
| Parameter | Value |
|-----------|-------|
| Campaign Type | Scheduled campaign → upgrade to Tier 2 |
| Budget | $35/day ($245/week) |
| Targeting | 30-mile radius, luxury SUV intenders |
| Estimated Lead Lift | +2–3 leads/week |
| Estimated Days Saved | 3–5 days |
| Margin Protection | ~$318–$530 |

**Total Weekly Budget:** $840/week
**Expected Combined Margin Protection:** $1,292–$2,050/week
**ROI:** 1.5x–2.4x on ad spend`,
    followUps: [
      "Activate all three campaigns now",
      "What if I only do the F-150?",
      "Show me the budget breakdown by week",
    ],
  },

  watch: {
    content: `## Watch-Stage Vehicles — Status & Recommendations

You have **41 vehicles** in Watch stage (16–30 days), representing **$1.31M capital** with 18.6% margin exposure.

### Vehicles Approaching Risk (25+ days)
| Vehicle | Days | Burn | Margin Left | Leads | Campaign |
|---------|------|------|-------------|-------|----------|
| 2024 BMW X3 xDrive30i | 28 days | $142/day | $2,240 | 6 | Active |
| 2024 Subaru Outback XT | 25 days | $86/day | $1,960 | 5 | None |
| 2025 Chevy Equinox RS | 22 days | $94/day | $1,680 | 4 | None |

### Performing Well (under 25 days)
| Vehicle | Days | Burn | Margin Left | Leads | Campaign |
|---------|------|------|-------------|-------|----------|
| 2024 Ram 1500 Big Horn | 19 days | $124/day | $3,104 | 9 | Active |

**Analysis:**
- **BMW X3** — Highest daily burn in Watch ($142/day) but has real media and 6 leads. Campaign is active. Likely to convert if lead-to-appointment improves.
- **Subaru Outback** — 5 leads but zero appointments is a red flag. Needs campaign activation to push to close. Without action, it crosses into Risk in **5 days**.
- **Chevy Equinox** — 4 leads, below-benchmark CTR at 2.1%. Clone media only. Real media upgrade could accelerate conversion.
- **Ram 1500** — Strong performer. 9 leads, 3 appointments. Monitor only — likely to sell within the week.

**Priority Actions:**
1. Activate campaign on the **Subaru Outback** — 5 days until Risk stage
2. Upgrade media on the **Chevy Equinox** — low CTR dragging conversion
3. Monitor **BMW X3** — check if scheduled appointments are converting`,
    followUps: [
      "Activate campaign for the Subaru Outback",
      "What media does the Equinox need?",
      "Show me fresh-stage vehicles that are doing well",
    ],
  },

  pricing: {
    content: `## Price Reduction Recommendations

Based on days-in-stock, margin runway, and lead velocity, here are my pricing recommendations:

### Immediate Price Drops
| Vehicle | Current Margin | Recommended Drop | New Margin | Rationale |
|---------|---------------|-----------------|------------|-----------|
| 2024 VW Tiguan | $320 | -$800 | -$480 | 3.6 days left — price to exit fast, take the loss |
| 2024 Nissan Rogue | -$240 | -$1,200 | -$1,440 | Already negative — wholesale price or auction floor |

### Strategic Reductions
| Vehicle | Current Margin | Recommended Drop | New Margin | Rationale |
|---------|---------------|-----------------|------------|-----------|
| 2024 Jeep Grand Cherokee | $890 | -$500 | $390 | 44 days, only 1 lead — needs price signal |
| 2024 Kia Sportage | $1,120 | -$400 | $720 | 41 days, below-benchmark traffic |

### Hold — Don't Reduce Yet
| Vehicle | Margin | Rationale |
|---------|--------|-----------|
| 2024 Ford F-150 | $1,480 | Try campaign activation first — 12 days of runway |
| 2024 BMW X3 | $2,240 | Active campaign, 6 leads — let it work |
| 2024 Ram 1500 | $3,104 | 9 leads, 3 appointments — likely to close |

**Key Principle:** Price reductions should be the **last lever**, not the first. Prioritize media upgrades and campaign activation for vehicles with 10+ days of margin runway. Only cut price when margin is under 5 days and other levers haven't moved the needle.

**Estimated Impact:** The 2 strategic reductions could accelerate turns by 4–6 days each, protecting the remaining margin on the Jeep and Kia before they hit critical.`,
    followUps: [
      "Apply the recommended price drops",
      "What if I combine price drops with media upgrades?",
      "Show me the vehicles I should never reduce",
    ],
  },

  burn_reduce: {
    content: `## How to Reduce Your Daily Burn Rate

Your current daily burn is **$12,640/day**. Here's a breakdown of where it's coming from and how to bring it down:

### Burn by Stage
| Stage | Vehicles | Daily Burn | % of Total |
|-------|----------|-----------|-----------|
| Fresh | 68 | $4,624/day | 36.6% |
| Watch | 41 | $4,182/day | 33.1% |
| Risk | 24 | $2,616/day | 20.7% |
| Critical | 9 | $1,218/day | 9.6% |

### Top 5 Single-Vehicle Burns
| Vehicle | Daily Burn | Stage | Action |
|---------|-----------|-------|--------|
| 2024 BMW X3 | $142/day | Watch | Campaign active — monitor |
| 2024 Ram 1500 | $124/day | Watch | 9 leads — likely to close |
| 2024 Ford F-150 | $118/day | Risk | **Activate campaign NOW** |
| 2024 Jeep Grand Cherokee | $106/day | Risk | Scheduled campaign — escalate |
| 2024 Kia Sportage | $96/day | Risk | **Needs campaign + media** |

### 3 Fastest Levers to Cut Burn
1. **Exit the 2 critical-stage vehicles** (Rogue + Tiguan) → saves **$164/day** immediately through wholesale or auction
2. **Activate campaigns on F-150 + Sportage** → estimated 5–8 day faster turns, reducing their burn window by **$590–$944 each**
3. **Upgrade media on 4 clone-only risk/watch vehicles** → faster conversion reduces average days-in-stock by 3–5 days across the group

**Realistic 30-Day Target:** $12,640 → **$10,800/day** (-14.5%) by combining exits, campaigns, and media upgrades.`,
    followUps: [
      "Exit the Rogue and Tiguan — what's the process?",
      "Activate campaigns for the F-150 and Sportage",
      "What would our burn look like with 10 fewer vehicles?",
    ],
  },

  month_compare: {
    content: `## Month-over-Month Comparison

Here's how your inventory metrics have trended from last month to today:

| Metric | Last Month | This Month | Change |
|--------|-----------|------------|--------|
| Total Vehicles | 148 | 142 | -6 (-4.1%) |
| Capital Deployed | $5.04M | $4.82M | -$220K (-4.4%) |
| Daily Burn | $13,760/day | $12,640/day | -$1,120 (-8.1%) |
| Capital at Risk | $442K | $412K | -$30K (-6.8%) |
| Avg Days-to-Live | 16.0 days | 18.4 days | +2.4 days |
| Velocity Score | 68/100 | 72/100 | +4 pts |
| Capital Saved | $162K | $186K | +$24K (+14.8%) |

### What Improved
- **Daily burn dropped 8.1%** — you exited 6 aged vehicles and activated 4 campaigns
- **Velocity score up 4 pts** — faster turns in the Fresh/Watch stages
- **Capital saved increased 14.8%** — acceleration packs are working

### What Needs Attention
- **Risk vehicles (24) are similar to last month (26)** — you're exiting critical but watch vehicles are aging into risk
- **Appointment conversion** is flat — leads are up but appointments aren't following
- **Media mix** hasn't changed (still 62/38 clone/real) — need to push real media adoption

### Trend Direction
Your lot is healthier than 30 days ago. The key risk is the **watch-to-risk pipeline** — if you don't activate campaigns on the Equinox, Outback, and Sportage in the next week, they'll cross into Risk and your improvements will plateau.`,
    followUps: [
      "What drove the velocity score improvement?",
      "How do I stop watch vehicles from aging into risk?",
      "Show me a 90-day trend view",
    ],
  },

  media_cost: {
    content: `## Media Upgrade — Cost vs. Return Analysis

Here's the investment breakdown for upgrading your top 4 clone-media vehicles to real photography:

### Per-Vehicle Costs
| Vehicle | Shoot Cost | Editing | Total | Current Margin | ROI Timeframe |
|---------|-----------|---------|-------|---------------|---------------|
| 2024 Ford F-150 | $180 | $45 | $225 | $1,480 | 3–5 days |
| 2025 Chevy Equinox | $180 | $45 | $225 | $1,680 | 4–6 days |
| 2024 Kia Sportage | $180 | $45 | $225 | $1,120 | 3–5 days |
| 2024 Jeep Grand Cherokee | $180 | $45 | $225 | $890 | 2–4 days |

**Total Investment:** $900 for all 4 vehicles

### Expected Returns
| Vehicle | Days Saved | Burn Saved | Margin Protected | Net ROI |
|---------|-----------|-----------|-----------------|---------|
| F-150 | 5–8 days | $590–$944 | $590–$944 | 2.6x–4.2x |
| Equinox | 3–5 days | $282–$470 | $282–$470 | 1.3x–2.1x |
| Sportage | 4–6 days | $384–$576 | $384–$576 | 1.7x–2.6x |
| Grand Cherokee | 3–5 days | $318–$530 | $318–$530 | 1.4x–2.4x |

**Combined:** $900 investment → **$1,574–$2,520 in protected margin**
**Blended ROI:** 1.7x–2.8x return on media spend

The math is straightforward: real media costs $225/vehicle but protects $400–$900+ in margin by accelerating the turn. The F-150 alone could pay for all 4 upgrades.`,
    followUps: [
      "Schedule the shoots for all 4 vehicles",
      "What about 360-degree video — is it worth it?",
      "Show me the clone vs real performance data",
    ],
  },

  media_compare: {
    content: `## Clone vs. Real Media — Performance Comparison

Here's a side-by-side comparison across your inventory:

### Aggregate Performance
| Metric | Clone Media (8 vehicles) | Real Media (4 vehicles) | Difference |
|--------|-------------------------|------------------------|------------|
| Avg CTR | 1.9% | 4.5% | **+137%** |
| Avg Leads/Vehicle | 4.4 | 12.0 | **+173%** |
| Avg Appointments | 1.3 | 3.5 | **+169%** |
| Avg VDP Views | 910 | 2,390 | **+163%** |
| Avg Days in Stock | 33.4 days | 15.5 days | **-54%** |

### Top Performing Real Media Vehicles
| Vehicle | CTR | Leads | Appts | Days | Stage |
|---------|-----|-------|-------|------|-------|
| 2025 Hyundai Tucson HEV | 5.6% | 18 | 5 | 3 | Fresh |
| 2024 BMW X3 xDrive30i | 3.4% | 6 | 2 | 28 | Watch |

### Worst Performing Clone Media Vehicles
| Vehicle | CTR | Leads | Appts | Days | Stage |
|---------|-----|-------|-------|------|-------|
| 2024 VW Tiguan | 0.4% | 0 | 0 | 58 | Critical |
| 2024 Nissan Rogue | 0.2% | 0 | 0 | 67 | Critical |
| 2024 Jeep Grand Cherokee | 0.8% | 1 | 0 | 44 | Risk |

**The data is clear:** Real media vehicles turn **2x faster** with **2.7x more leads**. Your two real-media vehicles are both in strong positions — the Tucson is your #1 performer and the X3 is holding steady despite being at 28 days.

The 8 clone-only vehicles account for **78% of your capital at risk**. Media quality is the single biggest lever you're under-utilizing.`,
    followUps: [
      "Upgrade all clone vehicles to real media",
      "What's the total cost to upgrade everything?",
      "Which clone vehicles are still performing OK?",
    ],
  },

  f150_detail: {
    content: `## Ford F-150 Lariat 4WD — Deep Dive

**VIN:** WBA73AK06R5A91823

### Current Status
| Metric | Value | Assessment |
|--------|-------|------------|
| Stage | Risk | 38 days in stock |
| Daily Burn | $118/day | Highest on your lot |
| Margin Remaining | $1,480 | ~12.5 days of runway |
| Gross Margin | $5,964 | High-margin unit |
| Acquisition Cost | $48,036 | Auction sourced |
| Leads | 2 | Very low for this segment |
| Appointments | 0 | Zero conversion |
| CTR | 1.2% | Below 2.4% benchmark |
| VDP Views | 1,240 | Decent traffic |
| Media | Clone | Upgrade recommended |
| Campaign | None | **Primary issue** |

### What's Going Wrong
The F-150 has **decent visibility** (1,240 VDP views) but terrible conversion. The 1.2% CTR and 0 appointments suggest:
1. **Clone media isn't compelling enough** for a $48K truck — buyers want to see real photos
2. **No campaign running** — zero paid amplification on a high-value unit
3. **Price may be above market** — but with $5,964 gross margin, there's room to work

### Recommended Action Plan
1. **Immediately:** Launch Acceleration Pack Tier 2 ($45/day)
2. **Within 48 hours:** Schedule real media shoot ($225)
3. **If no leads in 5 days:** Apply $500 price reduction
4. **Estimated outcome:** 3–5 additional leads, 5–8 days faster turn, ~$590–$944 margin protected

**If you do nothing:** At $118/day burn, the F-150 will cross into Critical stage in ~12 days and become your most expensive capital liability.`,
    followUps: [
      "Activate the campaign for this F-150",
      "Show me similar F-150s in the market",
      "What about the other risk vehicles?",
    ],
  },

  fresh_vehicles: {
    content: `## Fresh-Stage Vehicles — Performance Report

Your **68 Fresh vehicles** (0–15 days) represent $2.18M capital with only 4.2% margin exposure — this is your healthiest segment.

### Top Performers
| Vehicle | Days | Leads | Appts | CTR | Margin | Media |
|---------|------|-------|-------|-----|--------|-------|
| 2025 Hyundai Tucson HEV | 3 | 18 | 5 | 5.6% | $3,654 | Real |
| 2024 Toyota Camry XSE | 5 | 12 | 3 | 4.2% | $3,200 | Clone |
| 2024 Honda Accord Sport | 8 | 8 | 2 | 3.8% | $2,880 | Clone |

**The Tucson is your best vehicle** — real media, 5.6% CTR, 18 leads in 3 days. It's the proof case for why real media works.

**The Camry is a strong #2** — even with clone media, it's pulling 4.2% CTR and 12 leads. This is a high-demand segment performing organically.

**The Accord** has an active campaign and is converting well at 8 leads and 2 appointments in 8 days.

### Fresh-Stage Health
- Average days in stock: **7 days**
- Average lead velocity: **6.4 leads/vehicle**
- Average margin exposure: **4.2%**
- Vehicles with campaigns: **12 of 68** (18%)

**Recommendation:** Your Fresh inventory is in great shape. Focus your time and budget on the Watch/Risk vehicles instead. The one optimization: the **Camry** could get even more leads with a real media upgrade — it's already performing well with clone, real photos could push it to close faster.`,
    followUps: [
      "Upgrade the Camry to real media",
      "Which fresh vehicles might become watch soon?",
      "What's the average time to first lead?",
    ],
  },

  wholesale: {
    content: `## Wholesale Evaluation — Nissan Rogue SL AWD

**VIN:** JN1TANT31U0000123

### Current Position
| Metric | Value |
|--------|-------|
| Days in Stock | 67 |
| Acquisition Cost | $33,148 |
| Gross Margin (original) | $4,852 |
| Holding Cost So Far | $5,092 (67 × $76/day) |
| Current Margin | **-$240** (underwater) |
| Leads | 0 |
| CTR | 0.2% |
| Campaign History | Completed (no result) |

### Wholesale Market Estimate
- **MMR (Manheim Market Report):** ~$28,400–$29,200
- **Your acquisition cost:** $33,148
- **Estimated wholesale loss:** $3,948–$4,748
- **But continuing to hold costs:** $76/day additional losses

### The Math
Every day you hold this vehicle costs **$76 more in losses**. If you wholesale today at the midpoint ($28,800):
- **Total loss:** $4,348
- **If you hold 30 more days:** Loss grows to **$6,628** ($4,348 + $2,280)

### Recommendation
**Move to wholesale this week.** The vehicle has exhausted all retail channels — zero leads after 67 days, a completed campaign that generated nothing, and 0.2% CTR means the market has passed on this unit.

**Process:**
1. List on OVE/ACV today (Tuesday)
2. Set floor at $28,000 (accept any offer above)
3. If no bids by Thursday, send to physical auction Friday
4. Book the loss and redeploy the freed capital into a fresh unit`,
    followUps: [
      "List the Rogue on OVE today",
      "What about the Tiguan — wholesale too?",
      "How much capital would freeing both units unlock?",
    ],
  },

  budget: {
    content: `## Acceleration Plan — Budget Breakdown

Here's the full budget required to execute the 2-week acceleration plan:

### Week 1 Budget
| Item | Daily | Weekly | Target Vehicle |
|------|-------|--------|----------------|
| VW Tiguan — Tier 2 Campaign | $50/day | $350 | Exit Critical |
| VW Tiguan — Price Reduction | — | $800 (one-time) | Generate 2+ leads |
| Ford F-150 — Tier 2 Campaign | $45/day | $315 | Accelerate turn |
| Ford F-150 — Real Media Shoot | — | $225 (one-time) | Improve CTR |
| Kia Sportage — Tier 2 Campaign | $40/day | $280 | Accelerate turn |
| Kia Sportage — Real Media Shoot | — | $225 (one-time) | Improve CTR |
| **Week 1 Total** | — | **$2,195** | — |

### Week 2 Budget
| Item | Daily | Weekly | Target Vehicle |
|------|-------|--------|----------------|
| Ongoing campaigns (3 vehicles) | $135/day | $945 | Maintain momentum |
| Chevy Equinox — Real Media Shoot | — | $225 (one-time) | Upgrade CTR |
| Subaru Outback — Tier 1 Campaign | $30/day | $210 | Push to close |
| **Week 2 Total** | — | **$1,380** | — |

### Total 2-Week Investment
| Category | Amount |
|----------|--------|
| Campaign Spend | $2,100 |
| Media Upgrades | $675 |
| Price Reductions | $800 |
| **Grand Total** | **$3,575** |

### Expected Return
| Outcome | Value |
|---------|-------|
| Margin Protected | $3,200–$5,100 |
| Daily Burn Reduction | -$1,440/day |
| Capital Freed (vehicle exits) | ~$70K–$110K |
| **Net ROI** | **0.9x–1.4x on spend** (plus freed capital) |

The $3,575 investment is small relative to the **$412K capital at risk**. Even the conservative estimate protects more margin than the plan costs.`,
    followUps: [
      "Approve this budget and start execution",
      "Can we do a lighter version for $2,000?",
      "What's the risk if we don't spend anything?",
    ],
  },
}

function getAIResponse(userMessage: string): AIResponse {
  const lower = userMessage.toLowerCase()

  if (lower.includes("f-150") || lower.includes("f150"))
    return MOCK_RESPONSES.f150_detail
  if (lower.includes("wholesale") || lower.includes("rogue") || lower.includes("auction"))
    return MOCK_RESPONSES.wholesale
  if (lower.includes("budget") || lower.includes("cost") && lower.includes("plan"))
    return MOCK_RESPONSES.budget
  if (lower.includes("campaign") || lower.includes("activate"))
    return MOCK_RESPONSES.campaigns
  if (lower.includes("watch") && (lower.includes("vehicle") || lower.includes("stage")))
    return MOCK_RESPONSES.watch
  if (lower.includes("price") && (lower.includes("reduc") || lower.includes("drop") || lower.includes("cut")))
    return MOCK_RESPONSES.pricing
  if (lower.includes("fresh") || lower.includes("doing well") || lower.includes("top perform"))
    return MOCK_RESPONSES.fresh_vehicles
  if (lower.includes("clone vs") || lower.includes("vs real") || lower.includes("side-by-side") || lower.includes("comparison"))
    return MOCK_RESPONSES.media_compare
  if ((lower.includes("cost") && lower.includes("return")) || lower.includes("cost vs"))
    return MOCK_RESPONSES.media_cost
  if (lower.includes("compare") || lower.includes("last month") || lower.includes("month-over"))
    return MOCK_RESPONSES.month_compare
  if (lower.includes("reduce") && lower.includes("burn") || lower.includes("how can i reduce"))
    return MOCK_RESPONSES.burn_reduce
  if (lower.includes("capital") || lower.includes("health") || lower.includes("overview") || lower.includes("snapshot"))
    return MOCK_RESPONSES.capital
  if (lower.includes("risk") || lower.includes("burn") || lower.includes("attention") || lower.includes("critical") || lower.includes("margin"))
    return MOCK_RESPONSES.risk
  if (lower.includes("media") || lower.includes("upgrade") || lower.includes("photo") || lower.includes("clone") || lower.includes("real"))
    return MOCK_RESPONSES.media
  if (lower.includes("plan") || lower.includes("accelerat") || lower.includes("week") || lower.includes("aged"))
    return MOCK_RESPONSES.acceleration
  return MOCK_RESPONSES.default
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

const THINKING_PHASES = [
  "Analyzing your question…",
  "Scanning inventory data…",
  "Cross-referencing benchmarks…",
  "Generating insights…",
]

function ThinkingIndicator() {
  const [phaseIdx, setPhaseIdx] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setPhaseIdx((i) => (i + 1) % THINKING_PHASES.length)
    }, 750)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-start gap-3 max-w-3xl">
      <div className="relative">
        <Avatar className="h-8 w-8 mt-0.5 shrink-0 border border-primary/20 bg-primary/5">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <span className="absolute -inset-1 rounded-full border-2 border-primary/20 animate-think-ring" />
      </div>
      <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:0ms]" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:150ms]" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:300ms]" />
          </div>
          <span
            key={phaseIdx}
            className="text-xs text-muted-foreground/80 animate-in fade-in duration-300"
          >
            {THINKING_PHASES[phaseIdx]}
          </span>
        </div>
      </div>
    </div>
  )
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono text-foreground">
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      return (
        <em key={i} className="italic">
          {part.slice(1, -1)}
        </em>
      )
    }
    return part
  })
}

function TableRow({ line, isHeader }: { line: string; isHeader?: boolean }) {
  const cells = line
    .split("|")
    .filter(Boolean)
    .map((c) => c.trim())
  return (
    <div className={cn("flex text-xs", isHeader && "font-semibold border-b border-border")}>
      {cells.map((cell, i) => (
        <div key={i} className="px-2.5 py-1.5 min-w-[90px] flex-1 first:min-w-[140px]">
          {renderInline(cell)}
        </div>
      ))}
    </div>
  )
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n")
  let inTable = false
  let tableHeaderDone = false

  return (
    <div className="text-sm leading-relaxed space-y-0.5">
      {lines.map((line, i) => {
        const isTableLine = line.startsWith("|") && line.endsWith("|")
        const isSeparator = /^\|[\s-:|]+\|$/.test(line)

        if (isSeparator) {
          tableHeaderDone = true
          return null
        }

        if (isTableLine) {
          const wasInTable = inTable
          inTable = true
          if (!wasInTable) tableHeaderDone = false
          return (
            <TableRow
              key={i}
              line={line}
              isHeader={!tableHeaderDone}
            />
          )
        }

        inTable = false
        tableHeaderDone = false

        if (line.startsWith("### ")) {
          return (
            <h4 key={i} className="text-sm font-semibold text-foreground mt-3 mb-1 first:mt-0">
              {renderInline(line.slice(4))}
            </h4>
          )
        }
        if (line.startsWith("## ")) {
          return (
            <h3 key={i} className="text-[15px] font-semibold text-foreground mt-3 mb-1.5 first:mt-0">
              {renderInline(line.slice(3))}
            </h3>
          )
        }
        if (/^\d+\.\s/.test(line)) {
          return (
            <div key={i} className="flex gap-2 ml-1 my-0.5">
              <span className="text-muted-foreground shrink-0 font-medium">{line.match(/^\d+\./)![0]}</span>
              <span>{renderInline(line.replace(/^\d+\.\s/, ""))}</span>
            </div>
          )
        }
        if (line.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2 ml-1 my-0.5">
              <span className="text-muted-foreground shrink-0">•</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          )
        }
        if (line.trim() === "") {
          return <div key={i} className="h-1.5" />
        }
        return (
          <p key={i} className="my-0.5">
            {renderInline(line)}
          </p>
        )
      })}
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  )
}

function StreamingMessage({
  content,
  onComplete,
}: {
  content: string
  onComplete: () => void
}) {
  const [charIdx, setCharIdx] = React.useState(0)
  const doneRef = React.useRef(false)

  React.useEffect(() => {
    doneRef.current = false
    let i = 0
    const timer = setInterval(() => {
      const step = 10 + Math.floor(Math.random() * 14)
      let next = Math.min(i + step, content.length)
      while (next < content.length && !/\s/.test(content[next])) {
        next++
      }
      i = Math.min(next, content.length)
      setCharIdx(i)
      if (i >= content.length && !doneRef.current) {
        doneRef.current = true
        clearInterval(timer)
        setTimeout(onComplete, 150)
      }
    }, 18)
    return () => clearInterval(timer)
  }, [content, onComplete])

  const isComplete = charIdx >= content.length

  return (
    <>
      <MessageContent content={content.substring(0, charIdx)} />
      {!isComplete && (
        <span className="inline-block w-[3px] h-[14px] bg-primary/70 rounded-full ml-0.5 mt-1 animate-cursor-blink" />
      )}
    </>
  )
}

function FollowUpChips({
  items,
  onSelect,
}: {
  items: string[]
  onSelect: (text: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((text, i) => (
        <button
          key={text}
          onClick={() => onSelect(text)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-primary/15 bg-white text-foreground hover:bg-primary/5 hover:border-primary/30 transition-all shadow-sm animate-chip-enter"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          <Sparkles className="h-3 w-3 text-primary/40" />
          {text}
        </button>
      ))}
    </div>
  )
}

export function ChatInterface() {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [phase, setPhase] = React.useState<"idle" | "thinking" | "streaming">("idle")
  const [streamingMsgId, setStreamingMsgId] = React.useState<string | null>(null)
  const [showScrollButton, setShowScrollButton] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const isBusy = phase !== "idle"

  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  React.useEffect(() => {
    scrollToBottom()
  }, [messages, phase, scrollToBottom])

  const handleScroll = React.useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const { scrollTop, scrollHeight, clientHeight } = container
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100)
  }, [])

  const handleStreamComplete = React.useCallback(() => {
    setStreamingMsgId(null)
    setPhase("idle")
  }, [])

  const sendMessage = React.useCallback(
    async (content: string) => {
      if (!content.trim() || isBusy) return

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])
      setInput("")
      setPhase("thinking")

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }

      const thinkingDelay = 1500 + Math.random() * 1200
      setTimeout(() => {
        const response = getAIResponse(content)
        const aiMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.content,
          timestamp: new Date(),
          followUps: response.followUps,
        }
        setMessages((prev) => [...prev, aiMsg])
        setStreamingMsgId(aiMsg.id)
        setPhase("streaming")
      }, thinkingDelay)
    },
    [isBusy]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 200) + "px"
  }

  const clearChat = () => {
    setMessages([])
    setPhase("idle")
    setStreamingMsgId(null)
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-background -mx-6 -mt-6 border-t">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-white">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Inventory AI Assistant</h1>
            <p className="text-xs text-muted-foreground">Ask about capital, aging, media, or any vehicle</p>
          </div>
        </div>
        {hasMessages && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive gap-1.5 text-xs"
            onClick={clearChat}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear chat
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-gray-50/30 relative"
      >
        {!hasMessages && phase === "idle" ? (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="max-w-lg w-full text-center space-y-8">
              <div className="space-y-3">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mx-auto shadow-lg shadow-slate-900/20">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  What would you like to know?
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  I can analyze your inventory capital, identify at-risk vehicles, recommend media upgrades, and build acceleration plans.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => sendMessage(prompt.prompt)}
                    className="group flex items-start gap-3 p-4 rounded-xl border border-border/60 bg-white hover:bg-gray-50 hover:border-border transition-all duration-200 text-left shadow-sm"
                  >
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                      <prompt.icon className="h-4 w-4 text-slate-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{prompt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {prompt.prompt}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
            {messages.map((msg) => {
              const isStreaming = msg.id === streamingMsgId
              const isLastAssistant =
                msg.role === "assistant" &&
                msg.id === messages[messages.length - 1]?.id
              const showFollowUps =
                isLastAssistant &&
                !isStreaming &&
                phase === "idle" &&
                msg.followUps &&
                msg.followUps.length > 0

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-start gap-3 group",
                    msg.role === "user" && "flex-row-reverse"
                  )}
                >
                  <Avatar
                    className={cn(
                      "h-8 w-8 mt-0.5 shrink-0 border",
                      msg.role === "assistant"
                        ? "border-slate-200 bg-slate-50"
                        : "border-border bg-muted"
                    )}
                  >
                    <AvatarFallback
                      className={cn(
                        msg.role === "assistant"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <Sparkles className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      "flex flex-col gap-1 max-w-[85%]",
                      msg.role === "user" && "items-end"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3",
                        msg.role === "assistant"
                          ? "bg-white border border-border/60 rounded-tl-md shadow-sm"
                          : "bg-slate-800 text-white rounded-tr-md"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        isStreaming ? (
                          <StreamingMessage
                            content={msg.content}
                            onComplete={handleStreamComplete}
                          />
                        ) : (
                          <MessageContent content={msg.content} />
                        )
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      )}
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        msg.role === "user" && "flex-row-reverse"
                      )}
                    >
                      <span className="text-[10px] text-muted-foreground/60 px-1">
                        {formatTime(msg.timestamp)}
                      </span>
                      {msg.role === "assistant" && !isStreaming && (
                        <CopyButton text={msg.content} />
                      )}
                    </div>

                    {showFollowUps && (
                      <FollowUpChips
                        items={msg.followUps!}
                        onSelect={sendMessage}
                      />
                    )}
                  </div>
                </div>
              )
            })}

            {phase === "thinking" && <ThinkingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Scroll to bottom FAB */}
        {showScrollButton && (
          <div className="sticky bottom-4 flex justify-center z-10">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full shadow-lg border"
              onClick={scrollToBottom}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-white px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2 bg-gray-50 border border-border rounded-2xl px-4 py-2 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your inventory..."
              disabled={isBusy}
              rows={1}
              className="flex-1 resize-none bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/60 py-1.5 max-h-[200px] min-h-[24px] disabled:opacity-50"
            />
            <Button
              size="icon"
              className={cn(
                "h-8 w-8 rounded-xl shrink-0 transition-all",
                input.trim()
                  ? "bg-slate-800 text-white shadow-sm hover:bg-slate-700"
                  : "bg-gray-200 text-gray-400"
              )}
              disabled={!input.trim() || isBusy}
              onClick={() => sendMessage(input)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
