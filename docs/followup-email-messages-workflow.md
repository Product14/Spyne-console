# Follow-Up on Email & Messages — VINI + Studio Workflow

Automated follow-up system powered by **VINI** (Voice AI) and **Studio** (Visual Merchandising) across **Velocity**, **Used Car Book**, and **Spyne Max** contexts.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Follow-Up Trigger Matrix](#follow-up-trigger-matrix)
3. [VINI + Studio Capabilities](#vini--studio-capabilities)
4. [Channel Strategy by Product](#channel-strategy-by-product)
5. [n8n Workflow Architecture](#n8n-workflow-architecture)
6. [Node Configurations](#node-configurations)
7. [Email Templates](#email-templates)
8. [SMS / Message Templates](#sms--message-templates)
9. [VINI Call Scripts](#vini-call-scripts)
10. [Priority Routing Logic](#priority-routing-logic)
11. [Data Sources & API Reference](#data-sources--api-reference)
12. [Testing & Rollout](#testing--rollout)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FOLLOW-UP ORCHESTRATION ENGINE                       │
│                                                                             │
│  TRIGGERS                    ENRICHMENT              CHANNELS               │
│  ─────────                   ──────────              ────────               │
│  • Price drop               Studio AI:               VINI Call              │
│  • No response              • Vehicle photos          ↓                     │
│  • Post-test-drive          • 360° links             Email (Gmail)          │
│  • Be-back window           • Listing score           ↓                     │
│  • Service-to-sales         • Clone photos           SMS (Twilio)           │
│  • Aging inventory                                    ↓                     │
│  • Lease ending             VINI AI:                 Push Notification      │
│  • Lot visit no-buy         • Personality match       ↓                     │
│                             • Call script            Activity Log           │
│                             • Objection handling                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Principle

> "You don't have a lead problem — you have a follow-up problem."
> — BDC Scorecard, Spyne Max

The system ensures every customer touchpoint gets a timely, personalized follow-up through the right channel, enriched with Studio vehicle visuals and VINI conversational intelligence.

---

## Follow-Up Trigger Matrix

### Trigger Definitions

| # | Trigger | Product | Source Type | Timing | Default Channel |
|---|---------|---------|-------------|--------|-----------------|
| T1 | **Price drop notification** | Velocity / Spyne Max | `OpportunityCategory: "price-drop-follow-up"` | Within 2 hours of price change | Email + SMS |
| T2 | **No response after inquiry** | Spyne Max Sales | `FollowUpOpportunity` (priority: high) | 48 hours after last contact | VINI Call |
| T3 | **Post-test-drive nurture** | Spyne Max Sales | `CustomerActivity.type: "test-drive"` | 24 hours after test drive | VINI Call + Email |
| T4 | **Be-back re-engagement** | Spyne Max Customers | `CustomerStatus: "be-back"` | 5 days after last contact | Email campaign |
| T5 | **Service-to-sales handoff** | Spyne Max Service | `ServiceBuyOpportunity` | Same day as service visit | Email + VINI Call |
| T6 | **Aging inventory push** | Velocity / Used Car Book | `ThreatCategory: "aging"` or `"no-leads"` | When vehicle crosses 30/45/60 day threshold | Email to past inquirers |
| T7 | **Lease ending proximity** | Spyne Max Service | `ServiceBuyOpportunity.buySignal` | 90 / 60 / 30 days before lease end | Email series |
| T8 | **Lot visit without purchase** | Spyne Max Sales | `CustomerActivity.type: "visit"` + no deal | 24 hours after visit | Email + SMS |

### Trigger-to-Action Mapping

```
T1 (Price Drop)
  └─→ Query: all customers who inquired about this VIN in last 60 days
  └─→ Enrich: Studio photos of the vehicle + new price vs old price
  └─→ Send: Email with vehicle gallery + "Price just dropped" subject
  └─→ Send: SMS with short link to VDP

T2 (No Response)
  └─→ Query: FollowUpOpportunity where lastContact > 48h AND priority = "high"
  └─→ Enrich: VINI personality match based on customer source
  └─→ Action: VINI outbound call with financing/availability script
  └─→ Fallback: If no answer → Email with vehicle details

T3 (Post-Test-Drive)
  └─→ Query: CustomerActivity where type = "test-drive" AND no deal within 24h
  └─→ Enrich: Studio 360° link of test-driven vehicle
  └─→ Send: Personalized email — "Still thinking about the {vehicle}?"
  └─→ Action: VINI call scheduled for next business day

T4 (Be-Back)
  └─→ Query: Customers where status = "be-back" AND lastContact > 5 days
  └─→ Enrich: Similar vehicles in stock (based on vehicleInterests)
  └─→ Send: Email — "We have new options that match what you were looking for"

T5 (Service-to-Sales)
  └─→ Query: ServiceBuyOpportunity where estimatedEquity > $3,000
  └─→ Enrich: Trade-in value estimate + upgrade vehicle options with Studio photos
  └─→ Send: Email — "Your {currentVehicle} is worth ${equity} — here's what you could drive next"
  └─→ Action: VINI call with service-to-sales script

T6 (Aging Inventory)
  └─→ Query: LotVehicle where daysInStock > threshold AND leads = 0
  └─→ Enrich: Reprice recommendation + Studio-enhanced listing
  └─→ Send: Email to all past inquirers in same segment
  └─→ Internal: Margin alert to dealer via email/SMS/push

T7 (Lease Ending)
  └─→ Query: Customers with lease ending within 90/60/30 days
  └─→ Enrich: Current equity estimate + matching inventory with Studio photos
  └─→ Send: 3-email drip series (90d intro → 60d options → 30d urgency)

T8 (Lot Visit No-Buy)
  └─→ Query: CustomerActivity where type = "visit" AND no deal closed
  └─→ Enrich: Vehicles viewed during visit (if tracked)
  └─→ Send: Email — "Thanks for visiting! Here's what caught your eye"
  └─→ Send: SMS — "Hi {name}, any questions about the vehicles you saw yesterday?"
```

---

## VINI + Studio Capabilities

### VINI (Voice AI) — Communication Engine

| Capability | Data Field | Usage in Follow-Up |
|------------|------------|-------------------|
| Outbound calls | `ViniActivation.outboundCount` | Automated follow-up calls with personalized scripts |
| Inbound handling | `ViniActivation.inboundCount` | Capture callbacks triggered by follow-up emails/SMS |
| Email initiation | `ViniInteraction.emailsInitiated` | AI-composed follow-up emails |
| Chat initiation | `ViniInteraction.chatsInitiated` | Website chat follow-ups for returning visitors |
| Call duration tracking | `ViniInteraction.avgCallDuration` | Measure follow-up call quality |
| End-call summary | `ViniInteraction.callsWithEndCallSummaryPercent` | Auto-log call outcome for next follow-up |
| Personality matching | `ViniActivation.agentPersonalityDistribution` | Match agent tone to customer profile |

### Studio (Visual Merchandising) — Content Engine

| Capability | Data Field | Usage in Follow-Up |
|------------|------------|-------------------|
| Real photos | `MediaStatus: "real-photos"` | High-quality vehicle images in emails |
| Clone photos | `MediaStatus: "clone-photos"` | Quick visual generation when real photos unavailable |
| 360° spin | `MerchandisingVehicle.has360` | Interactive vehicle link in email CTA |
| Video walkthrough | `MerchandisingVehicle.hasVideo` | Embed video thumbnail in email |
| Listing score | `MerchandisingVehicle.listingScore` | Prioritize vehicles with strong visual assets |
| Photo count | `MerchandisingVehicle.photoCount` | Determine email layout (gallery vs single hero) |

### Combined VINI + Studio Follow-Up Flow

```
Customer Trigger Detected
        │
        ▼
┌─────────────────┐     ┌──────────────────┐
│  VINI decides:   │     │  Studio prepares: │
│  • Channel       │     │  • Best photos    │
│  • Tone/script   │     │  • 360° link      │
│  • Timing        │     │  • Video thumb    │
│  • Personality   │     │  • Price overlay   │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
            ┌────────────────┐
            │ Compose & Send │
            │ Email / SMS /  │
            │ VINI Call      │
            └────────┬───────┘
                     ▼
            ┌────────────────┐
            │  Log Activity  │
            │  Update CRM    │
            │  Schedule Next │
            └────────────────┘
```

---

## Channel Strategy by Product

### Velocity Context (Inventory Turn Focus)

**Goal:** Accelerate inventory turn by alerting the right people at the right time.

| Channel | Use Case | Frequency | Content |
|---------|----------|-----------|---------|
| **Email** | Weekly velocity digest | Weekly (Monday 8 AM) | Aged units, velocity score changes, margin erosion warnings |
| **Email** | Price-drop alerts to past inquirers | Event-driven | Vehicle gallery (Studio), new price, CTA to schedule test drive |
| **SMS** | Threshold crossing alerts | Event-driven | "Your 2018 Equinox just hit Day 45. Margin remaining: $2,100. Action needed." |
| **Push** | Urgent aging alerts | Event-driven | Vehicle crosses 60-day mark or margin < $500 |

**Velocity Metrics in Follow-Ups:**
- `velocityScore` (0–100) — include in internal dealer alerts
- `avgLeadVelocity` — benchmark against follow-up response time
- `daysInStock` thresholds: 30 (yellow), 45 (orange), 60 (red)
- `holdingCostPerDay` × `daysInStock` = total cost shown in urgency messaging

### Used Car Book Context (Dealer Operations)

**Goal:** Ensure no customer falls through the cracks in the used car buying journey.

| Channel | Use Case | Frequency | Content |
|---------|----------|-----------|---------|
| **Email** | Customer follow-up templates | Event-driven per trigger | Personalized vehicle recommendations with Studio photos |
| **VINI Call** | Outbound follow-up calls | Business hours, per priority | Scripted call with objection handling |
| **SMS** | Quick touchpoint | Event-driven | Short link to VDP, appointment scheduling link |
| **Email** | Trade-in value updates | When market data changes | "Your {vehicle} is now worth ${value} — that's up ${change} this month" |

**Used Car Book Data Points:**
- `Customer.estimatedEquity` — drives trade-in messaging
- `Customer.totalTouchpoints` — determines escalation path
- `Customer.appointmentSet` / `testDriveCompleted` / `creditAppSubmitted` — funnel stage for message personalization
- `TradeInOpportunity.estimatedFrontGross` — internal urgency scoring

### Spyne Max Context (Complete Operating System)

**Goal:** Unified follow-up across the entire dealer flywheel — sourcing through service.

| Channel | Lifecycle Stage | Use Case | Content |
|---------|----------------|----------|---------|
| **Email** | Studio / Merchandising | "Your vehicle is now live with new photos" | Studio-enhanced listing preview |
| **Email** | Sales | Follow-up opportunity alerts | Priority-ranked customer list with vehicle interests |
| **VINI Call** | Sales | High-priority follow-ups | Personalized script based on last interaction |
| **SMS** | Sales | Appointment reminders | "Hi {name}, confirming your appointment tomorrow at {time}" |
| **Email** | Service | Service-to-sales opportunity | Trade-in value + upgrade options with Studio photos |
| **Email** | Service | Post-service follow-up | "How was your service experience?" + upgrade CTA |
| **Email** | Monthly | Impact report | Full Spyne impact metrics (see `n8n-spyne-impact-report-workflow.md`) |

**Spyne Max Lifecycle Stages (follow-up relevance):**

```
Sourcing → Recon → Studio → Marketing → Sales → Service
                      │                    │        │
                      │                    │        └─ T5: Service-to-sales email
                      │                    └─ T2, T3, T4, T8: Sales follow-ups
                      └─ Listing-ready notification email
```

---

## n8n Workflow Architecture

### Master Follow-Up Workflow

```
[Schedule: Every 30 min]
        │
        ▼
[Code: Query Follow-Up Queue]
        │
        ▼
[Switch: Route by Trigger Type]
   │    │    │    │    │    │    │    │
   T1   T2   T3   T4   T5   T6   T7   T8
   │    │    │    │    │    │    │    │
   ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼
[Code: Enrich with Studio Data]
        │
        ▼
[Switch: Route by Channel]
   │         │         │         │
  Email    SMS      VINI Call   Push
   │         │         │         │
   ▼         ▼         ▼         ▼
[Build]   [Build]   [Build]   [Build]
   │         │         │         │
   ▼         ▼         ▼         ▼
[Gmail]  [Twilio]  [VINI API] [FCM]
   │         │         │         │
   └────┬────┘────┬────┘────┬────┘
        ▼         ▼         ▼
     [Merge Results]
        │
        ▼
     [Log Activity to CRM]
```

### Sub-Workflow: Price Drop Follow-Up (T1)

```
[Webhook: Price Change Event]
        │
        ▼
[HTTP: Get Past Inquirers for VIN]
        │
        ▼
[IF: inquirers.length > 0?]
   │ Yes              │ No
   ▼                  ▼
[HTTP: Get Studio    [Set: No Action]
 Media for VIN]
   │
   ▼
[Code: Build Price-Drop Email]
   │
   ▼
[SplitInBatches: Per Customer]
   │
   ▼
[Gmail: Send Personalized Email]
   │
   ▼
[Twilio: Send SMS with VDP Link]
   │
   ▼
[HTTP: Log Activity]
```

---

## Node Configurations

### 1. Schedule Trigger Node

```json
{
  "parameters": {
    "rule": {
      "interval": [
        {
          "field": "cronExpression",
          "expression": "*/30 * * * *"
        }
      ]
    }
  },
  "name": "Follow-Up Queue Check",
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.1
}
```

Runs every 30 minutes during business hours. For timezone-aware delivery, add an IF node checking `currentHour >= 8 && currentHour <= 18` in the dealer's local timezone.

### 2. Code Node: Query Follow-Up Queue

```javascript
const now = new Date();
const followUps = [];

// T1: Price drops in last 2 hours
const priceDrops = await $http.request({
  method: 'GET',
  url: `${$env.API_BASE}/api/vehicles/price-changes`,
  qs: { since: new Date(now - 2 * 60 * 60 * 1000).toISOString() }
});
for (const drop of priceDrops.data) {
  followUps.push({
    trigger: 'T1',
    priority: 'high',
    vehicleVin: drop.vin,
    vehicleDescription: `${drop.year} ${drop.make} ${drop.model} ${drop.trim}`,
    oldPrice: drop.oldPrice,
    newPrice: drop.newPrice,
    priceDrop: drop.oldPrice - drop.newPrice,
    pastInquirers: drop.pastInquirers || []
  });
}

// T2: No response after 48 hours
const staleLeads = await $http.request({
  method: 'GET',
  url: `${$env.API_BASE}/api/customers/follow-ups`,
  qs: { minHoursSinceContact: 48, priority: 'high' }
});
for (const lead of staleLeads.data) {
  followUps.push({
    trigger: 'T2',
    priority: lead.priority,
    customerId: lead.id,
    customerName: lead.customerName,
    customerEmail: lead.email,
    customerPhone: lead.phone,
    vehicleInterest: lead.vehicleInterest,
    lastContact: lead.lastContact,
    reason: lead.reason
  });
}

// T3: Post-test-drive (24h window)
const testDrives = await $http.request({
  method: 'GET',
  url: `${$env.API_BASE}/api/activities`,
  qs: {
    type: 'test-drive',
    since: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    noDealClosed: true
  }
});
for (const td of testDrives.data) {
  followUps.push({
    trigger: 'T3',
    priority: 'high',
    customerId: td.customerId,
    customerName: td.customerName,
    customerEmail: td.email,
    vehicleDescription: td.vehicleDescription,
    testDriveDate: td.timestamp,
    salesperson: td.salesperson
  });
}

// T4: Be-back re-engagement (5+ days)
const bebacks = await $http.request({
  method: 'GET',
  url: `${$env.API_BASE}/api/customers`,
  qs: { status: 'be-back', minDaysSinceContact: 5 }
});
for (const bb of bebacks.data) {
  followUps.push({
    trigger: 'T4',
    priority: 'medium',
    customerId: bb.id,
    customerName: bb.name,
    customerEmail: bb.email,
    vehicleInterests: bb.vehicleInterests,
    lastContactDate: bb.lastContactDate,
    estimatedEquity: bb.estimatedEquity
  });
}

// T5: Service-to-sales (same day)
const serviceOpps = await $http.request({
  method: 'GET',
  url: `${$env.API_BASE}/api/service/buy-opportunities`,
  qs: { minEquity: 3000, today: true }
});
for (const svc of serviceOpps.data) {
  followUps.push({
    trigger: 'T5',
    priority: 'high',
    customerId: svc.id,
    customerName: svc.customerName,
    customerEmail: svc.email,
    currentVehicle: svc.currentVehicle,
    estimatedEquity: svc.estimatedEquity,
    buySignal: svc.buySignal,
    recommendedAction: svc.recommendedAction
  });
}

// T6: Aging inventory
const agingVehicles = await $http.request({
  method: 'GET',
  url: `${$env.API_BASE}/api/vehicles/aging`,
  qs: { minDays: 30, maxLeads: 0 }
});
for (const v of agingVehicles.data) {
  followUps.push({
    trigger: 'T6',
    priority: v.daysInStock >= 45 ? 'high' : 'medium',
    vehicleVin: v.vin,
    vehicleDescription: `${v.year} ${v.make} ${v.model} ${v.trim}`,
    daysInStock: v.daysInStock,
    holdingCost: v.totalHoldingCost,
    listPrice: v.listPrice,
    segment: v.segment,
    pastInquirers: v.pastInquirers || []
  });
}

return followUps.map(f => ({ json: f }));
```

### 3. Switch Node: Route by Trigger Type

```json
{
  "parameters": {
    "dataType": "string",
    "value1": "={{ $json.trigger }}",
    "rules": {
      "rules": [
        { "value2": "T1", "output": 0 },
        { "value2": "T2", "output": 1 },
        { "value2": "T3", "output": 2 },
        { "value2": "T4", "output": 3 },
        { "value2": "T5", "output": 4 },
        { "value2": "T6", "output": 5 },
        { "value2": "T7", "output": 6 },
        { "value2": "T8", "output": 7 }
      ]
    }
  },
  "name": "Route by Trigger",
  "type": "n8n-nodes-base.switch",
  "typeVersion": 2
}
```

### 4. Code Node: Enrich with Studio Data

```javascript
const item = $input.item.json;
const vin = item.vehicleVin;

if (!vin) return [item];

const studioData = await $http.request({
  method: 'GET',
  url: `${$env.API_BASE}/api/studio/vehicle/${vin}`
});

const media = studioData.data || {};

item.studio = {
  heroImageUrl: media.photos?.[0]?.url || null,
  galleryUrls: (media.photos || []).slice(0, 6).map(p => p.url),
  has360: media.has360 || false,
  spin360Url: media.spin360Url || null,
  hasVideo: media.hasVideo || false,
  videoThumbnailUrl: media.videoThumbnailUrl || null,
  videoUrl: media.videoUrl || null,
  photoCount: media.photoCount || 0,
  mediaStatus: media.mediaStatus || 'no-photos',
  listingScore: media.listingScore || 0,
  useGalleryLayout: (media.photoCount || 0) >= 6,
  useClonePhotos: media.mediaStatus === 'clone-photos',
};

return [{ json: item }];
```

### 5. Gmail Node: Send Follow-Up Email

```json
{
  "parameters": {
    "sendTo": "={{ $json.customerEmail }}",
    "subject": "={{ $json.emailSubject }}",
    "emailType": "html",
    "message": "={{ $json.emailHtml }}",
    "options": {
      "ccList": "={{ $json.salespersonEmail || '' }}",
      "replyTo": "={{ $json.dealerReplyTo || 'sales@dealer.com' }}"
    }
  },
  "name": "Gmail: Send Follow-Up",
  "type": "n8n-nodes-base.gmail",
  "typeVersion": 2.1,
  "credentials": {
    "gmailOAuth2Api": {
      "id": "GMAIL_CREDENTIAL_ID",
      "name": "Dealer Gmail"
    }
  }
}
```

### 6. Twilio Node: Send SMS

```json
{
  "parameters": {
    "from": "={{ $env.TWILIO_FROM_NUMBER }}",
    "to": "={{ $json.customerPhone }}",
    "message": "={{ $json.smsBody }}"
  },
  "name": "Twilio: Send SMS",
  "type": "n8n-nodes-base.twilio",
  "typeVersion": 1,
  "credentials": {
    "twilioApi": {
      "id": "TWILIO_CREDENTIAL_ID",
      "name": "Dealer Twilio"
    }
  }
}
```

### 7. HTTP Node: Trigger VINI Outbound Call

```json
{
  "parameters": {
    "method": "POST",
    "url": "={{ $env.VINI_API_BASE }}/api/vini/outbound-call",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        { "name": "customerPhone", "value": "={{ $json.customerPhone }}" },
        { "name": "customerName", "value": "={{ $json.customerName }}" },
        { "name": "vehicleInterest", "value": "={{ $json.vehicleDescription || $json.vehicleInterest }}" },
        { "name": "scriptId", "value": "={{ $json.viniScriptId }}" },
        { "name": "personality", "value": "={{ $json.viniPersonality || 'friendly' }}" },
        { "name": "context", "value": "={{ JSON.stringify({ trigger: $json.trigger, reason: $json.reason, lastContact: $json.lastContact }) }}" }
      ]
    },
    "options": {
      "timeout": 30000
    }
  },
  "name": "VINI: Outbound Call",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.1
}
```

### 8. HTTP Node: Log Activity to CRM

```json
{
  "parameters": {
    "method": "POST",
    "url": "={{ $env.API_BASE }}/api/activities",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        { "name": "customerId", "value": "={{ $json.customerId }}" },
        { "name": "type", "value": "={{ $json.channelUsed }}" },
        { "name": "description", "value": "={{ $json.activityDescription }}" },
        { "name": "timestamp", "value": "={{ new Date().toISOString() }}" },
        { "name": "salesperson", "value": "={{ $json.salesperson || 'VINI AI' }}" },
        { "name": "automated", "value": "true" },
        { "name": "trigger", "value": "={{ $json.trigger }}" }
      ]
    }
  },
  "name": "Log Activity",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.1
}
```

---

## Email Templates

### T1: Price Drop Notification

**Subject:** `Great news — the {{vehicleDescription}} just dropped ${{priceDrop}}`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding:24px 32px;">
              <h1 style="color:#ffffff; margin:0; font-size:20px; font-weight:600;">Price Just Dropped!</h1>
            </td>
          </tr>

          <!-- Hero Image (Studio) -->
          <tr>
            <td style="padding:0;">
              <img src="{{studio.heroImageUrl}}" alt="{{vehicleDescription}}" width="600" style="width:100%; display:block;">
            </td>
          </tr>

          <!-- Price Drop Banner -->
          <tr>
            <td style="padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#ecfdf5; border-radius:8px; padding:16px; text-align:center;">
                    <p style="margin:0; font-size:14px; color:#065f46;">Price reduced by</p>
                    <p style="margin:4px 0 0; font-size:32px; font-weight:700; color:#059669;">${{priceDrop}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Vehicle Details -->
          <tr>
            <td style="padding:0 32px 24px;">
              <h2 style="margin:0 0 8px; font-size:22px; color:#18181b;">{{vehicleDescription}}</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding:8px 0;">
                    <p style="margin:0; font-size:13px; color:#71717a;">Was</p>
                    <p style="margin:2px 0 0; font-size:18px; color:#a1a1aa; text-decoration:line-through;">${{oldPrice}}</p>
                  </td>
                  <td width="50%" style="padding:8px 0;">
                    <p style="margin:0; font-size:13px; color:#71717a;">Now</p>
                    <p style="margin:2px 0 0; font-size:18px; font-weight:700; color:#059669;">${{newPrice}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Studio Gallery (if 6+ photos) -->
          {{#if studio.useGalleryLayout}}
          <tr>
            <td style="padding:0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  {{#each studio.galleryUrls}}
                  <td width="33%" style="padding:2px;">
                    <img src="{{this}}" width="176" style="width:100%; border-radius:6px; display:block;">
                  </td>
                  {{/each}}
                </tr>
              </table>
            </td>
          </tr>
          {{/if}}

          <!-- 360° CTA -->
          {{#if studio.has360}}
          <tr>
            <td style="padding:0 32px 16px;">
              <a href="{{studio.spin360Url}}" style="display:block; text-align:center; padding:12px; background-color:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; text-decoration:none; color:#0369a1; font-size:14px; font-weight:500;">
                🔄 View 360° Spin
              </a>
            </td>
          </tr>
          {{/if}}

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 32px 32px;">
              <a href="{{vdpUrl}}" style="display:block; text-align:center; padding:14px 24px; background-color:#6366f1; color:#ffffff; border-radius:8px; text-decoration:none; font-size:16px; font-weight:600;">
                Schedule a Test Drive
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px; border-top:1px solid #e4e4e7;">
              <p style="margin:0; font-size:12px; color:#a1a1aa; text-align:center;">
                Questions? Call us at {{dealerPhone}} or reply to this email.<br>
                <a href="{{unsubscribeUrl}}" style="color:#a1a1aa;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### T3: Post-Test-Drive Follow-Up

**Subject:** `Still thinking about the {{vehicleDescription}}, {{customerFirstName}}?`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 16px;">
              <h1 style="margin:0; font-size:22px; color:#18181b;">Hi {{customerFirstName}},</h1>
              <p style="margin:12px 0 0; font-size:15px; color:#52525b; line-height:1.6;">
                It was great meeting you yesterday! We noticed you took the
                <strong>{{vehicleDescription}}</strong> for a spin and wanted to follow up.
              </p>
            </td>
          </tr>

          <!-- Vehicle Card with Studio Photo -->
          <tr>
            <td style="padding:16px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7; border-radius:12px; overflow:hidden;">
                <tr>
                  <td style="padding:0;">
                    <img src="{{studio.heroImageUrl}}" alt="{{vehicleDescription}}" width="536" style="width:100%; display:block;">
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px;">
                    <h3 style="margin:0; font-size:18px; color:#18181b;">{{vehicleDescription}}</h3>
                    <p style="margin:8px 0 0; font-size:22px; font-weight:700; color:#6366f1;">${{listPrice}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What's Next -->
          <tr>
            <td style="padding:16px 32px;">
              <p style="margin:0; font-size:15px; color:#52525b; line-height:1.6;">
                Here's what we can help with:
              </p>
              <ul style="margin:12px 0; padding-left:20px; color:#52525b; font-size:14px; line-height:1.8;">
                <li>Walk through financing options tailored to your budget</li>
                <li>Get your trade-in appraised (takes 15 minutes)</li>
                <li>Hold this vehicle for you while you decide</li>
              </ul>
            </td>
          </tr>

          <!-- 360° + Video Row -->
          <tr>
            <td style="padding:0 32px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  {{#if studio.has360}}
                  <td width="48%" style="padding-right:8px;">
                    <a href="{{studio.spin360Url}}" style="display:block; text-align:center; padding:12px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; text-decoration:none; color:#0369a1; font-size:13px;">
                      🔄 360° View
                    </a>
                  </td>
                  {{/if}}
                  {{#if studio.hasVideo}}
                  <td width="48%">
                    <a href="{{studio.videoUrl}}" style="display:block; text-align:center; padding:12px; background:#fdf4ff; border:1px solid #e9d5ff; border-radius:8px; text-decoration:none; color:#7c3aed; font-size:13px;">
                      ▶ Watch Video
                    </a>
                  </td>
                  {{/if}}
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 32px 32px;">
              <a href="{{appointmentUrl}}" style="display:block; text-align:center; padding:14px 24px; background-color:#6366f1; color:#ffffff; border-radius:8px; text-decoration:none; font-size:16px; font-weight:600;">
                Schedule a Follow-Up Visit
              </a>
              <p style="margin:12px 0 0; text-align:center; font-size:13px; color:#71717a;">
                Or call {{salesperson}} directly at {{salespersonPhone}}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px; border-top:1px solid #e4e4e7;">
              <p style="margin:0; font-size:12px; color:#a1a1aa; text-align:center;">
                {{dealerName}} · {{dealerAddress}}<br>
                <a href="{{unsubscribeUrl}}" style="color:#a1a1aa;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### T5: Service-to-Sales Handoff

**Subject:** `Your {{currentVehicle}} is worth ${{estimatedEquity}} — see what you could drive next`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 16px;">
              <h1 style="margin:0; font-size:22px; color:#18181b;">Hi {{customerFirstName}},</h1>
              <p style="margin:12px 0 0; font-size:15px; color:#52525b; line-height:1.6;">
                Thanks for bringing your <strong>{{currentVehicle}}</strong> in for service today.
                We wanted to share something that might interest you.
              </p>
            </td>
          </tr>

          <!-- Equity Banner -->
          <tr>
            <td style="padding:16px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border-radius:12px; border:1px solid #bbf7d0;">
                <tr>
                  <td style="padding:24px; text-align:center;">
                    <p style="margin:0; font-size:14px; color:#065f46;">Your estimated trade-in value</p>
                    <p style="margin:8px 0 0; font-size:36px; font-weight:700; color:#059669;">${{estimatedEquity}}</p>
                    <p style="margin:8px 0 0; font-size:13px; color:#065f46;">Based on current market conditions</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Upgrade Options (Studio-powered) -->
          <tr>
            <td style="padding:16px 32px;">
              <h2 style="margin:0 0 16px; font-size:18px; color:#18181b;">Vehicles You Might Love</h2>
              {{#each upgradeOptions}}
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7; border-radius:8px; margin-bottom:12px; overflow:hidden;">
                <tr>
                  <td width="40%" style="padding:0;">
                    <img src="{{this.studioImageUrl}}" alt="{{this.description}}" width="220" style="width:100%; height:120px; object-fit:cover; display:block;">
                  </td>
                  <td width="60%" style="padding:12px 16px; vertical-align:middle;">
                    <p style="margin:0; font-size:15px; font-weight:600; color:#18181b;">{{this.description}}</p>
                    <p style="margin:4px 0 0; font-size:18px; font-weight:700; color:#6366f1;">{{this.price}}</p>
                    <p style="margin:4px 0 0; font-size:12px; color:#059669;">Est. payment: {{this.estPayment}}/mo</p>
                  </td>
                </tr>
              </table>
              {{/each}}
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:16px 32px 32px;">
              <a href="{{tradeAppraisalUrl}}" style="display:block; text-align:center; padding:14px 24px; background-color:#6366f1; color:#ffffff; border-radius:8px; text-decoration:none; font-size:16px; font-weight:600;">
                Get Your Free Appraisal
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px; border-top:1px solid #e4e4e7;">
              <p style="margin:0; font-size:12px; color:#a1a1aa; text-align:center;">
                {{dealerName}} · {{dealerAddress}}<br>
                <a href="{{unsubscribeUrl}}" style="color:#a1a1aa;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## SMS / Message Templates

### T1: Price Drop SMS

```
Hi {{customerFirstName}}, the {{vehicleDescription}} you were interested in just dropped ${{priceDrop}}! Now priced at ${{newPrice}}. View it here: {{vdpShortUrl}} — {{dealerName}}
```

### T2: No Response Follow-Up SMS

```
Hi {{customerFirstName}}, just checking in about the {{vehicleInterest}}. It's still available and we'd love to help. Call us at {{dealerPhone}} or reply to schedule a visit. — {{salesperson}}, {{dealerName}}
```

### T3: Post-Test-Drive SMS

```
Hi {{customerFirstName}}, thanks for test driving the {{vehicleDescription}} yesterday! We can hold it for you — just let us know. Reply or call {{salespersonPhone}}. — {{salesperson}}
```

### T4: Be-Back Re-Engagement SMS

```
Hi {{customerFirstName}}, we have new arrivals matching what you were looking for ({{vehicleInterests}}). Stop by or check them out: {{inventoryShortUrl}} — {{dealerName}}
```

### T8: Lot Visit No-Buy SMS

```
Hi {{customerFirstName}}, thanks for visiting {{dealerName}} yesterday! Any questions about the vehicles you checked out? We're here to help: {{dealerPhone}}
```

### Internal: Aging Inventory Alert SMS (to dealer)

```
⚠️ AGING ALERT: {{vehicleDescription}} (Stock #{{stockNumber}}) has been on lot {{daysInStock}} days. Holding cost: ${{totalHoldingCost}}. Margin remaining: ${{marginRemaining}}. Action needed.
```

---

## VINI Call Scripts

### Script T2: No Response Follow-Up

```
PERSONALITY: friendly
CONTEXT: Customer inquired but never responded to follow-up

[OPENING]
"Hi {{customerFirstName}}, this is {{viniAgentName}} calling from {{dealerName}}.
I'm reaching out because you had expressed interest in the {{vehicleInterest}} —
just wanted to make sure you got all the information you needed."

[IF CUSTOMER ENGAGED]
"Great! The vehicle is still available. Would you like me to:
 - Walk you through financing options?
 - Schedule a test drive at a time that works for you?
 - Send you updated photos and details via email?"

[IF CUSTOMER MENTIONS PRICE]
"I understand budget is important. I can look into what financing would look like
for your situation. We also have a few similar options in different price ranges
if you'd like to explore those."

[IF CUSTOMER NOT INTERESTED]
"No problem at all! If anything changes, feel free to reach out.
We'll keep you in mind if something comes up that matches what you're looking for."

[CLOSING]
"Thanks for your time, {{customerFirstName}}. Have a great day!"

[END-CALL SUMMARY]
→ Log outcome: interested / not_interested / callback_requested / voicemail
→ If interested: schedule follow-up email with Studio vehicle details
→ If voicemail: trigger T2 email fallback
```

### Script T3: Post-Test-Drive Follow-Up

```
PERSONALITY: warm, consultative
CONTEXT: Customer test drove a vehicle within last 24 hours, no deal closed

[OPENING]
"Hi {{customerFirstName}}, this is {{viniAgentName}} from {{dealerName}}.
I wanted to follow up on your visit yesterday — you took the {{vehicleDescription}}
for a test drive and I hope you enjoyed it!"

[GAUGE INTEREST]
"How did you feel about the drive? Was it what you were hoping for?"

[IF POSITIVE]
"That's great to hear! A few things I can help with:
 - We can get a trade-in appraisal on your current vehicle — takes about 15 minutes
 - I can run some financing numbers so you know exactly what the payment would look like
 - We can also put a temporary hold on this one so it's waiting for you"

[IF HESITANT]
"Totally understand — it's a big decision. Would it help if I sent you some
additional details? We have a full 360-degree view and video walkthrough
I can share. No pressure at all."

[IF COMPARING OPTIONS]
"Smart approach. Would you like me to set up test drives for the other vehicles
you're considering? That way you can compare them side-by-side."

[CLOSING]
"I'll send you an email with all the details and photos. Feel free to reply
or call us anytime. Thanks, {{customerFirstName}}!"

[END-CALL SUMMARY]
→ Log outcome: hot / warm / comparing / not_interested
→ If hot: alert salesperson, schedule appointment
→ If warm: send T3 email with Studio 360° link
→ If comparing: send comparison email with alternative vehicles
```

### Script T5: Service-to-Sales

```
PERSONALITY: helpful, low-pressure
CONTEXT: Service customer with high equity, expressed upgrade interest

[OPENING]
"Hi {{customerFirstName}}, this is {{viniAgentName}} from {{dealerName}}.
I see you were in for service on your {{currentVehicle}} today, and I wanted
to share some good news with you."

[VALUE PROPOSITION]
"Based on current market conditions, your {{currentVehicle}} has an estimated
trade value of around ${{estimatedEquity}}. That's actually quite strong right now."

[BRIDGE TO SALES]
"If you've been thinking about an upgrade — and I noticed you mentioned that
during your service visit — I'd love to show you some options. We have several
vehicles that would be a great fit, and the equity in your current car could
go a long way toward the down payment."

[IF INTERESTED]
"Wonderful! I can set up a time for you to come in and see some options.
We'll also do a formal appraisal on your {{currentVehicle}} so you have
the exact number. What day works best for you?"

[IF NOT READY]
"No rush at all. I'll send you an email with some options and your estimated
trade value. That way you have it when you're ready to explore."

[CLOSING]
"Thanks, {{customerFirstName}}. Enjoy the rest of your day!"

[END-CALL SUMMARY]
→ Log outcome: appointment_set / info_requested / not_interested
→ If appointment_set: create CRM appointment, alert sales team
→ If info_requested: send T5 email with upgrade options + Studio photos
```

---

## Priority Routing Logic

### Priority Scoring Algorithm

```javascript
function calculateFollowUpPriority(followUp) {
  let score = 0;

  // Trigger severity
  const triggerWeights = {
    T1: 70,  // Price drop — time-sensitive
    T2: 80,  // No response — customer at risk of going elsewhere
    T3: 90,  // Post-test-drive — highest intent
    T4: 50,  // Be-back — warm but not urgent
    T5: 75,  // Service-to-sales — high equity opportunity
    T6: 40,  // Aging inventory — internal priority
    T7: 60,  // Lease ending — time-based urgency
    T8: 65,  // Lot visit no-buy — recent intent
  };
  score += triggerWeights[followUp.trigger] || 50;

  // Recency boost (more recent = higher priority)
  const hoursSinceLastContact = followUp.hoursSinceLastContact || 0;
  if (hoursSinceLastContact <= 24) score += 20;
  else if (hoursSinceLastContact <= 48) score += 15;
  else if (hoursSinceLastContact <= 72) score += 10;

  // Customer equity boost
  if (followUp.estimatedEquity > 5000) score += 15;
  else if (followUp.estimatedEquity > 3000) score += 10;

  // Touchpoint history (more touchpoints = more invested)
  if (followUp.totalTouchpoints >= 5) score += 10;
  else if (followUp.totalTouchpoints >= 3) score += 5;

  // Vehicle availability
  if (followUp.vehicleInStock) score += 10;

  // Studio content quality boost (better visuals = better follow-up)
  if (followUp.studio?.listingScore >= 80) score += 10;
  else if (followUp.studio?.listingScore >= 50) score += 5;

  // Normalize to priority level
  if (score >= 80) return 'high';
  if (score >= 55) return 'medium';
  return 'low';
}
```

### Channel Selection Logic

```javascript
function selectChannel(followUp) {
  const channels = [];

  switch (followUp.trigger) {
    case 'T1': // Price drop
      channels.push('email');
      if (followUp.priority === 'high') channels.push('sms');
      break;

    case 'T2': // No response
      channels.push('vini_call');
      channels.push('email'); // fallback if no answer
      break;

    case 'T3': // Post-test-drive
      channels.push('vini_call');
      channels.push('email');
      break;

    case 'T4': // Be-back
      channels.push('email');
      if (followUp.daysSinceLastContact > 10) channels.push('sms');
      break;

    case 'T5': // Service-to-sales
      if (followUp.estimatedEquity > 5000) {
        channels.push('vini_call');
      }
      channels.push('email');
      break;

    case 'T6': // Aging inventory
      channels.push('email'); // to past inquirers
      channels.push('internal_alert'); // to dealer
      break;

    case 'T7': // Lease ending
      channels.push('email');
      if (followUp.daysUntilLeaseEnd <= 30) channels.push('vini_call');
      break;

    case 'T8': // Lot visit no-buy
      channels.push('email');
      channels.push('sms');
      break;
  }

  return channels;
}
```

### De-Duplication & Throttling Rules

| Rule | Threshold | Action |
|------|-----------|--------|
| Max emails per customer per week | 3 | Skip email, log suppression |
| Max SMS per customer per week | 2 | Skip SMS |
| Max VINI calls per customer per week | 1 | Skip call, send email instead |
| Cooldown after deal closed | 30 days | No sales follow-ups |
| Cooldown after unsubscribe | Permanent | Remove from email/SMS |
| Cooldown after "not interested" call | 14 days | No outbound calls |
| Same trigger, same vehicle | 7 days | De-duplicate |

---

## Data Sources & API Reference

### Primary Data Types

| Type | File | Key Fields for Follow-Up |
|------|------|-------------------------|
| `FollowUpOpportunity` | `services/max-2/max-2.types.ts` | `customerName`, `vehicleInterest`, `lastContact`, `reason`, `priority` |
| `Customer` | `services/max-2/max-2.types.ts` | `email`, `phone`, `status`, `source`, `vehicleInterests`, `lastContactDate`, `totalTouchpoints` |
| `CustomerActivity` | `services/max-2/max-2.types.ts` | `type`, `description`, `timestamp`, `salesperson` |
| `CustomerSummary` | `services/max-2/max-2.types.ts` | `followUpsDue`, `avgResponseTime`, `beBackOpportunities` |
| `MerchandisingVehicle` | `services/max-2/max-2.types.ts` | `mediaStatus`, `photoCount`, `has360`, `hasVideo`, `listingScore` |
| `LotVehicle` | `services/max-2/max-2.types.ts` | `daysInStock`, `vdpViews`, `leads`, `lastLeadDate`, `recentPriceChange`, `holdingCostPerDay` |
| `ServiceBuyOpportunity` | `services/max-2/max-2.types.ts` | `customerName`, `currentVehicle`, `buySignal`, `estimatedEquity`, `recommendedAction` |
| `ViniActivation` | `services/spyne-flip/spyne-flip.types.ts` | `widgetShown`, `widgetActivated`, `inboundCount`, `outboundCount` |
| `ViniInteraction` | `services/spyne-flip/spyne-flip.types.ts` | `callsInitiated`, `chatsInitiated`, `emailsInitiated`, `avgCallDuration` |

### Enum Categories

| Category Code | Label | Relevance |
|---------------|-------|-----------|
| `followup_communication` | Follow-up & Communications | Issue tracking for missed follow-ups |
| `communication_call_quality` | Communication & Call Quality | VINI call quality scoring |
| `process_customer_management` | Process & Customer Management | CRM activity logging |

### API Endpoints (Expected)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/customers/follow-ups` | GET | Fetch pending follow-up queue |
| `/api/vehicles/price-changes` | GET | Price drops since last check |
| `/api/vehicles/aging` | GET | Vehicles past aging thresholds |
| `/api/activities` | GET/POST | Read/write customer activity log |
| `/api/service/buy-opportunities` | GET | Service-to-sales candidates |
| `/api/studio/vehicle/{vin}` | GET | Studio media assets for a VIN |
| `/api/customers` | GET | Customer list with filters |
| `/api/vini/outbound-call` | POST | Trigger VINI outbound call |

---

## Testing & Rollout

### Step 1: Single Trigger Test

Pick one trigger (recommended: T1 — Price Drop) and test end-to-end:

1. Create a test price change event
2. Verify the follow-up queue picks it up within 30 minutes
3. Confirm Studio enrichment fetches vehicle media
4. Verify email renders correctly (use Litmus or Email on Acid)
5. Confirm SMS delivers with correct short link
6. Verify activity is logged in CRM

### Step 2: Multi-Trigger Test (Limit 5 customers)

1. Seed test data for each trigger type (T1–T8)
2. Run the workflow manually
3. Verify correct channel routing per trigger
4. Check de-duplication logic (same customer, multiple triggers)
5. Verify priority scoring ranks correctly

### Step 3: VINI Call Integration Test

1. Test VINI outbound call with a known phone number
2. Verify script loads correctly based on trigger type
3. Confirm end-call summary logs to CRM
4. Test voicemail fallback → email trigger

### Step 4: Volume & Throttling Test

1. Create 50+ follow-up items across all triggers
2. Verify throttling limits are enforced (max emails/SMS per customer)
3. Check Gmail sending quotas (500/day for Workspace, 100/day for free)
4. Monitor Twilio SMS delivery rates

### Step 5: Staged Rollout

| Phase | Scope | Duration | Success Criteria |
|-------|-------|----------|------------------|
| Alpha | 1 dealership, T1+T2 only | 1 week | >90% delivery rate, 0 errors |
| Beta | 5 dealerships, T1–T5 | 2 weeks | >95% delivery, <2% unsubscribe |
| GA | All dealerships, all triggers | Ongoing | Response rate >15%, appointment rate >5% |

### Verification Checklist

- [ ] Follow-up queue populates correctly for each trigger
- [ ] Studio enrichment works for all media statuses (real, clone, stock, no-photos)
- [ ] Email renders on Gmail, Outlook, Apple Mail, and mobile
- [ ] SMS contains correct short link and stays under 160 characters
- [ ] VINI calls use correct script per trigger type
- [ ] Activity logging captures channel, trigger, outcome, and timestamp
- [ ] De-duplication prevents duplicate messages to the same customer
- [ ] Throttling limits are enforced per customer per week
- [ ] Unsubscribe links work and suppress future messages
- [ ] Error handling logs failures without blocking the queue
- [ ] Salesperson CC'd on relevant customer communications
- [ ] Internal aging alerts reach the dealer (email/SMS/push)

---

## Notes

- **Studio fallback:** When a vehicle has `mediaStatus: "stock-photos"` or `"no-photos"`, emails use a text-only vehicle description block instead of a photo gallery. Clone photos (`"clone-photos"`) are acceptable for email use.
- **VINI personality selection:** Defaults to `"friendly"`. For high-value customers (equity > $5K), use `"consultative"`. For be-backs, use `"warm"`.
- **Timezone handling:** All scheduled sends should respect the dealer's local timezone. The n8n workflow should query dealer timezone from account settings and schedule sends between 8 AM–6 PM local time.
- **Compliance:** All emails must include an unsubscribe link (CAN-SPAM). SMS messages require prior opt-in (TCPA). VINI calls should identify as AI-assisted within the first 10 seconds where required by state law.
- **Related docs:** See `n8n-spyne-impact-report-workflow.md` for the monthly impact report email workflow and `spyne-wrapped-email-v2.html` for LLM prompt templates.
