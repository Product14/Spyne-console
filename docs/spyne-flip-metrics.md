# Spyne Flip Dashboard - Metrics Calculation Guide

This document describes how each metric in the Spyne Flip Analytics Dashboard is calculated. Use this as a reference for understanding the data model, implementing backend queries, and interpreting dashboard values.

---

## Table of Contents

1. [Data Model Overview](#data-model-overview)
2. [Overview KPIs](#overview-kpis)
3. [AI Demo Success Score](#ai-demo-success-score)
4. [Demo Funnel](#demo-funnel)
5. [Dealer-Level Metrics](#dealer-level-metrics)
6. [Sales Leaderboard](#sales-leaderboard)
7. [Usage & Adoption](#usage--adoption)
8. [VINI Engagement](#vini-engagement)
9. [Dealer Coverage](#dealer-coverage)
10. [Failure & Error Reporting](#failure--error-reporting)
11. [Time-Based Trends](#time-based-trends)
12. [System Health](#system-health)
13. [Event Schema Reference](#event-schema-reference)

---

## Data Model Overview

### Core Entities

| Entity | Description |
|--------|-------------|
| **Session** | A single usage instance of the Spyne Flip plugin, from open to close |
| **Sales User** | The Spyne sales representative using the plugin |
| **Dealer** | The dealership website being demoed |
| **VIN** | Individual vehicle processed during a demo |
| **Event** | Telemetry data point logged during a session |

### Session Lifecycle

```
Plugin Opened → Dealer Detected → [Profile Created] → VLP Analyze → VLP Transform → 
Preview Opened → [VINI Triggered] → VDP Analyze → VDP Transform → [VINI Triggered] → Session End
```

---

## Overview KPIs

### 1. Total Spyne Flip Sessions

**Definition:** Count of all plugin sessions initiated within the selected date range.

```sql
SELECT COUNT(DISTINCT session_id) 
FROM sessions 
WHERE started_at BETWEEN :start_date AND :end_date
```

**Change Calculation:**
```
change_percent = ((current_value - previous_value) / previous_value) * 100
```
Where `previous_value` is the count from the equivalent previous period (e.g., if viewing 7 days, compare to prior 7 days).

---

### 2. Unique Sales Users

**Definition:** Count of distinct sales users who initiated at least one session.

```sql
SELECT COUNT(DISTINCT sales_user_id) 
FROM sessions 
WHERE started_at BETWEEN :start_date AND :end_date
```

---

### 3. Unique Dealers Demoed

**Definition:** Count of distinct dealers where a demo was conducted.

```sql
SELECT COUNT(DISTINCT dealer_id) 
FROM sessions 
WHERE started_at BETWEEN :start_date AND :end_date
  AND dealer_detected = TRUE
```

---

### 4. Successful Demos (%)

**Definition:** Percentage of sessions where at least ONE of the following occurred:
- VLP Transform completed
- VDP Transform completed  
- VINI interaction started (call, chat, or email initiated)

```sql
SELECT 
  (COUNT(CASE WHEN vlp_transform_completed = TRUE 
              OR vdp_transform_completed = TRUE 
              OR vini_interaction_started = TRUE 
         THEN 1 END) * 100.0) / COUNT(*)
FROM sessions
WHERE started_at BETWEEN :start_date AND :end_date
```

---

### 5. Avg Demo Duration

**Definition:** Average time (in seconds) from session start to session end.

```sql
SELECT AVG(EXTRACT(EPOCH FROM (ended_at - started_at)))
FROM sessions
WHERE started_at BETWEEN :start_date AND :end_date
  AND ended_at IS NOT NULL
```

**Display Format:** `Xm Ys` (e.g., "5m 42s")

---

### 6. % Demos with VINI Interaction

**Definition:** Percentage of sessions where VINI widget was activated AND at least one interaction occurred.

```sql
SELECT 
  (COUNT(CASE WHEN vini_activated = TRUE 
              AND (vini_calls > 0 OR vini_chats > 0 OR vini_emails > 0) 
         THEN 1 END) * 100.0) / COUNT(*)
FROM sessions
WHERE started_at BETWEEN :start_date AND :end_date
```

---

### 7. % Demos with Studio Transform Completed

**Definition:** Percentage of sessions where at least one transform (VLP or VDP) was completed.

```sql
SELECT 
  (COUNT(CASE WHEN vlp_transform_completed = TRUE 
              OR vdp_transform_completed = TRUE 
         THEN 1 END) * 100.0) / COUNT(*)
FROM sessions
WHERE started_at BETWEEN :start_date AND :end_date
```

---

## AI Demo Success Score

### Score Calculation (0-100)

The AI Demo Success Score is a weighted composite of multiple success factors:

| Factor | Weight | Condition for Full Points |
|--------|--------|---------------------------|
| Studio Transform Completed | 25 | VLP or VDP transform completed |
| Website Preview Opened | 15 | Preview was opened at least once |
| VINI Activated | 15 | VINI widget was activated |
| VINI Interaction Occurred | 20 | At least one call/chat/email initiated |
| Demo Duration > Threshold | 15 | Duration >= 3 minutes (180 seconds) |
| No Critical Errors | 10 | No plugin crashes or critical failures |

**Formula:**
```javascript
score = 0

// Studio Transform (25 points)
if (vlp_transform_completed || vdp_transform_completed) {
  score += 25
}

// Website Preview (15 points)
if (preview_opened) {
  score += 15
}

// VINI Activated (15 points)
if (vini_widget_activated) {
  score += 15
}

// VINI Interaction (20 points)
if (vini_calls > 0 || vini_chats > 0 || vini_emails > 0) {
  score += 20
}

// Duration (15 points) - scaled
if (duration_seconds >= 180) {
  score += 15
} else if (duration_seconds >= 60) {
  score += (duration_seconds / 180) * 15  // Partial credit
}

// No Critical Errors (10 points)
if (!had_critical_error) {
  score += 10
}

return Math.round(score)
```

### Score Distribution

| Category | Score Range |
|----------|-------------|
| High | 80-100 |
| Medium | 50-79 |
| Low | 0-49 |

```sql
SELECT 
  SUM(CASE WHEN ai_demo_score >= 80 THEN 1 ELSE 0 END) as high,
  SUM(CASE WHEN ai_demo_score >= 50 AND ai_demo_score < 80 THEN 1 ELSE 0 END) as medium,
  SUM(CASE WHEN ai_demo_score < 50 THEN 1 ELSE 0 END) as low
FROM sessions
WHERE started_at BETWEEN :start_date AND :end_date
```

### Score Trend

Daily average score over the selected period:

```sql
SELECT 
  DATE(started_at) as date,
  AVG(ai_demo_score) as avg_score
FROM sessions
WHERE started_at BETWEEN :start_date AND :end_date
GROUP BY DATE(started_at)
ORDER BY date
```

---

## Demo Funnel

Each funnel step counts sessions that reached that stage. Conversion rate is relative to the previous step.

### Funnel Steps

| Step | Event/Condition | Calculation |
|------|-----------------|-------------|
| 1. Plugin Opened | `event_type = 'plugin_opened'` | Total sessions |
| 2. Dealer Detected | `dealer_detected = TRUE` | Sessions where dealer was identified |
| 3. Profile Created | `dealer_profile_created = TRUE` | New dealer profiles only |
| 4. VLP Analyze Started | `event_type = 'vlp_analyze_started'` | VLP scan initiated |
| 5. VLP Transform Completed | `vlp_transform_completed = TRUE` | VLP transform finished |
| 6. Website Preview Opened | `preview_opened = TRUE` | Preview mode accessed |
| 7. VINI Triggered on VLP | `vini_triggered_vlp = TRUE` | VINI shown on VLP |
| 8. VDP Analyze Started | `event_type = 'vdp_analyze_started'` | VDP scan initiated |
| 9. VDP Transform Completed | `vdp_transform_completed = TRUE` | VDP transform finished |
| 10. VINI Triggered on VDP | `vini_triggered_vdp = TRUE` | VINI shown on VDP |

### Conversion Rate Formula

```javascript
conversion_rate = (current_step_count / previous_step_count) * 100
drop_off = previous_step_count - current_step_count
```

---

## Dealer-Level Metrics

### Dealer Table Fields

| Field | Calculation |
|-------|-------------|
| **Dealer Name** | From dealer profile or scraped from website |
| **New vs Existing** | `is_new_dealer = (first_demo_date == current_demo_date)` |
| **Last Demo Date** | `MAX(started_at) WHERE dealer_id = :id` |
| **Sales User** | User who conducted the most recent demo |
| **Demo Type** | `'studio'` if only transforms, `'vini'` if only VINI, `'both'` if both |
| **AI Demo Success Score** | Average score across all demos for this dealer |
| **VINs Processed** | `SUM(vins_processed) WHERE dealer_id = :id` |
| **VINI Used** | `TRUE if ANY session had vini_activated = TRUE` |
| **Demo Status** | See below |

### Demo Status Logic

```javascript
if (had_critical_error || abrupt_termination) {
  status = 'failed'
} else if (vlp_transform_completed && vdp_transform_completed && vini_interaction) {
  status = 'completed'
} else if (vlp_transform_completed || vdp_transform_completed || vini_activated) {
  status = 'partial'
} else {
  status = 'failed'
}
```

---

## Sales Leaderboard

### Ranking Criteria

Sales users are ranked by a composite score:

```javascript
ranking_score = (total_demos * 0.3) + 
                (success_rate * 0.25) + 
                (avg_ai_score * 0.25) + 
                (dealers_demoed * 0.2)
```

### Leaderboard Fields

| Field | Calculation |
|-------|-------------|
| **Rank** | Position based on ranking_score (descending) |
| **Total Demos** | `COUNT(*) WHERE sales_user_id = :id` |
| **Successful Demos** | Count where `demo_status = 'completed'` |
| **Success Rate** | `(successful_demos / total_demos) * 100` |
| **Avg Score** | `AVG(ai_demo_score) WHERE sales_user_id = :id` |
| **Dealers Demoed** | `COUNT(DISTINCT dealer_id) WHERE sales_user_id = :id` |
| **VINI Usage %** | `(sessions_with_vini / total_sessions) * 100` |
| **Rank Change** | `previous_rank - current_rank` (positive = moved up) |

---

## Usage & Adoption

### Daily Active Users (DAU)

```sql
SELECT COUNT(DISTINCT sales_user_id)
FROM sessions
WHERE DATE(started_at) = CURRENT_DATE
```

### Weekly Active Users (WAU)

```sql
SELECT COUNT(DISTINCT sales_user_id)
FROM sessions
WHERE started_at >= CURRENT_DATE - INTERVAL '7 days'
```

### DAU/WAU Stickiness Ratio

```javascript
stickiness = (DAU / WAU) * 100
```
A higher ratio indicates users engage more frequently.

### Avg Demos Per User

```sql
SELECT AVG(demo_count)
FROM (
  SELECT sales_user_id, COUNT(*) as demo_count
  FROM sessions
  WHERE started_at BETWEEN :start_date AND :end_date
  GROUP BY sales_user_id
) subquery
```

### Repeat Usage Rate

Percentage of users with more than 1 session per week:

```sql
SELECT 
  (COUNT(CASE WHEN session_count > 1 THEN 1 END) * 100.0) / COUNT(*)
FROM (
  SELECT sales_user_id, COUNT(*) as session_count
  FROM sessions
  WHERE started_at >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY sales_user_id
) subquery
```

### Feature Adoption Rate

For each feature (VLP Transform, VDP Transform, VINI, etc.):

```sql
SELECT 
  (COUNT(DISTINCT CASE WHEN feature_used = TRUE THEN sales_user_id END) * 100.0) / 
  COUNT(DISTINCT sales_user_id)
FROM sessions
WHERE started_at BETWEEN :start_date AND :end_date
```

### Session Duration Distribution

```sql
SELECT 
  CASE 
    WHEN duration_seconds < 60 THEN '<1 min'
    WHEN duration_seconds < 120 THEN '1-2 min'
    WHEN duration_seconds < 300 THEN '2-5 min'
    WHEN duration_seconds < 600 THEN '5-10 min'
    WHEN duration_seconds < 900 THEN '10-15 min'
    WHEN duration_seconds < 1800 THEN '15-30 min'
    ELSE '>30 min'
  END as range,
  COUNT(*) as count
FROM sessions
WHERE started_at BETWEEN :start_date AND :end_date
GROUP BY range
ORDER BY MIN(duration_seconds)
```

### Usage Heatmap

Sessions grouped by hour and day of week:

```sql
SELECT 
  EXTRACT(DOW FROM started_at) as day_of_week,  -- 0=Sun, 1=Mon, etc.
  EXTRACT(HOUR FROM started_at) as hour,
  COUNT(*) as session_count
FROM sessions
WHERE started_at BETWEEN :start_date AND :end_date
GROUP BY day_of_week, hour
ORDER BY day_of_week, hour
```

---

## VINI Engagement

### Activation Metrics

| Metric | Calculation |
|--------|-------------|
| **Widget Shown** | `COUNT(*) WHERE vini_widget_shown = TRUE` |
| **Widget Activated** | `COUNT(*) WHERE vini_widget_activated = TRUE` |
| **Activation Rate** | `(activated / shown) * 100` |
| **Inbound Count** | `COUNT(*) WHERE vini_direction = 'inbound'` |
| **Outbound Count** | `COUNT(*) WHERE vini_direction = 'outbound'` |

### Interaction Metrics

| Metric | Calculation |
|--------|-------------|
| **Calls Initiated** | `SUM(vini_calls)` |
| **Chats Initiated** | `SUM(vini_chats)` |
| **Emails Initiated** | `SUM(vini_emails)` |
| **Avg Call Duration** | `AVG(vini_call_duration_seconds)` |
| **% Calls with End-Call Summary** | `(calls_with_summary / total_calls) * 100` |

### Agent Personality Distribution

```sql
SELECT 
  agent_personality,
  COUNT(*) as count
FROM vini_interactions
WHERE started_at BETWEEN :start_date AND :end_date
GROUP BY agent_personality
```

---

## Dealer Coverage

### Coverage Split

| Category | Definition |
|----------|------------|
| **Studio Only** | Dealers with transforms but no VINI activation |
| **VINI Only** | Dealers with VINI activation but no transforms |
| **Both** | Dealers with both transforms AND VINI activation |

```sql
SELECT 
  SUM(CASE WHEN has_transform AND NOT has_vini THEN 1 ELSE 0 END) as studio_only,
  SUM(CASE WHEN NOT has_transform AND has_vini THEN 1 ELSE 0 END) as vini_only,
  SUM(CASE WHEN has_transform AND has_vini THEN 1 ELSE 0 END) as both
FROM (
  SELECT 
    dealer_id,
    BOOL_OR(vlp_transform_completed OR vdp_transform_completed) as has_transform,
    BOOL_OR(vini_activated) as has_vini
  FROM sessions
  WHERE started_at BETWEEN :start_date AND :end_date
  GROUP BY dealer_id
) subquery
```

### Additional Coverage Metrics

| Metric | Calculation |
|--------|-------------|
| **VINs Scraped Per Dealer** | `AVG(vins_processed) GROUP BY dealer_id` |
| **Dealers with Cached Inventory** | `COUNT(*) WHERE has_cached_inventory = TRUE` |
| **Auto Rooftop Switch Success Rate** | `(successful_switches / total_switches) * 100` |

---

## Failure & Error Reporting

### Failure Types

| Type | Event/Condition |
|------|-----------------|
| `plugin_crash` | `event_type = 'plugin_crash'` |
| `dealer_detection_failed` | `event_type = 'dealer_detection_failed'` |
| `scan_failed` | `event_type = 'scan_failed'` (VLP or VDP) |
| `transform_failed` | `event_type = 'transform_failed'` |
| `preview_load_failed` | `event_type = 'preview_load_failed'` |
| `vini_widget_init_failed` | `event_type = 'vini_init_failed'` |
| `plugin_loaded_too_frequently` | `event_type = 'rate_limit_exceeded'` |

### Metrics Per Failure Type

```sql
SELECT 
  error_type,
  COUNT(*) as count,
  (COUNT(*) * 100.0) / (SELECT COUNT(*) FROM sessions WHERE ...) as percent_of_sessions,
  MAX(occurred_at) as last_occurrence
FROM errors
WHERE occurred_at BETWEEN :start_date AND :end_date
GROUP BY error_type
ORDER BY count DESC
```

---

## Time-Based Trends

### Daily Trends

```sql
SELECT 
  DATE(started_at) as date,
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN demo_status = 'completed' THEN 1 END) as successful_sessions,
  COUNT(CASE WHEN demo_status = 'failed' THEN 1 END) as failed_sessions
FROM sessions
WHERE started_at BETWEEN :start_date AND :end_date
GROUP BY DATE(started_at)
ORDER BY date
```

### Weekly Trends

```sql
SELECT 
  DATE_TRUNC('week', started_at) as week,
  COUNT(*) as sessions,
  -- Week-over-week growth
  ((COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY week)) * 100.0) / 
    NULLIF(LAG(COUNT(*)) OVER (ORDER BY week), 0) as wow_growth,
  -- Failure rate
  (COUNT(CASE WHEN demo_status = 'failed' THEN 1 END) * 100.0) / COUNT(*) as failure_rate
FROM sessions
GROUP BY week
ORDER BY week
```

---

## System Health

### Performance Metrics

| Metric | Event Field | Threshold (Good) | Threshold (Warning) |
|--------|-------------|------------------|---------------------|
| **Avg Scan Time** | `scan_duration_ms / 1000` | ≤ 3s | ≤ 5s |
| **Avg Transform Time** | `transform_duration_ms / 1000` | ≤ 5s | ≤ 8s |
| **Preview Load Time** | `preview_load_ms / 1000` | ≤ 2s | ≤ 4s |
| **VINI Widget Load Time** | `vini_load_ms / 1000` | ≤ 1s | ≤ 2s |

```sql
SELECT 
  AVG(scan_duration_ms) / 1000.0 as avg_scan_time,
  AVG(transform_duration_ms) / 1000.0 as avg_transform_time,
  AVG(preview_load_ms) / 1000.0 as avg_preview_load_time,
  AVG(vini_load_ms) / 1000.0 as avg_vini_load_time
FROM performance_events
WHERE occurred_at BETWEEN :start_date AND :end_date
```

### Reliability Metrics

| Metric | Calculation | Target |
|--------|-------------|--------|
| **Plugin Crashes/Day** | `COUNT(plugin_crash) / days_in_range` | < 2/day |
| **Abrupt Terminations** | `COUNT(*) WHERE ended_abnormally = TRUE` | Minimize |

---

## Event Schema Reference

### Session Table

```sql
CREATE TABLE sessions (
  session_id UUID PRIMARY KEY,
  sales_user_id UUID NOT NULL,
  dealer_id UUID,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  duration_seconds INTEGER,
  
  -- Detection
  dealer_detected BOOLEAN DEFAULT FALSE,
  dealer_profile_created BOOLEAN DEFAULT FALSE,
  
  -- Studio
  vlp_analyze_started BOOLEAN DEFAULT FALSE,
  vlp_transform_completed BOOLEAN DEFAULT FALSE,
  vdp_analyze_started BOOLEAN DEFAULT FALSE,
  vdp_transform_completed BOOLEAN DEFAULT FALSE,
  preview_opened BOOLEAN DEFAULT FALSE,
  vins_processed INTEGER DEFAULT 0,
  
  -- VINI
  vini_widget_shown BOOLEAN DEFAULT FALSE,
  vini_widget_activated BOOLEAN DEFAULT FALSE,
  vini_triggered_vlp BOOLEAN DEFAULT FALSE,
  vini_triggered_vdp BOOLEAN DEFAULT FALSE,
  vini_calls INTEGER DEFAULT 0,
  vini_chats INTEGER DEFAULT 0,
  vini_emails INTEGER DEFAULT 0,
  
  -- Status
  demo_status VARCHAR(20), -- 'completed', 'partial', 'failed'
  ai_demo_score INTEGER,
  had_critical_error BOOLEAN DEFAULT FALSE,
  ended_abnormally BOOLEAN DEFAULT FALSE
);
```

### Events Table

```sql
CREATE TABLE events (
  event_id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(session_id),
  event_type VARCHAR(50) NOT NULL,
  occurred_at TIMESTAMP NOT NULL,
  metadata JSONB
);
```

### Common Event Types

| Event Type | Description |
|------------|-------------|
| `plugin_opened` | Plugin was launched |
| `dealer_detected` | Dealer website identified |
| `dealer_detection_failed` | Could not identify dealer |
| `vlp_analyze_started` | VLP scan began |
| `vlp_analyze_completed` | VLP scan finished |
| `vlp_transform_started` | VLP transform began |
| `vlp_transform_completed` | VLP transform finished |
| `vdp_analyze_started` | VDP scan began |
| `vdp_transform_completed` | VDP transform finished |
| `preview_opened` | Preview mode accessed |
| `vini_widget_shown` | VINI widget displayed |
| `vini_activated` | VINI widget interacted with |
| `vini_call_started` | Call initiated |
| `vini_call_ended` | Call completed |
| `vini_chat_started` | Chat initiated |
| `vini_email_sent` | Email sent |
| `plugin_crash` | Plugin crashed |
| `session_ended` | Session closed normally |

---

## Filter Parameters

All queries should support these global filters:

| Filter | Parameter | Type |
|--------|-----------|------|
| Date Range | `:start_date`, `:end_date` | DATE |
| Sales User | `:sales_user_id` | UUID |
| Dealer | `:dealer_id` | UUID |
| Dealer Type | `:dealer_type` | 'new' \| 'existing' \| 'all' |
| Page Type | `:page_type` | 'vlp' \| 'vdp' \| 'all' |
| Feature | `:feature` | 'studio' \| 'vini' \| 'both' \| 'all' |

---

## Export Data Formats

### CSV Export Fields

#### Dealer Demos Export
```
Dealer Name, Type, Last Demo, Sales User, Demo Type, AI Score, VINs Processed, VINI Used, Status
```

#### Sales Leaderboard Export
```
Rank, Sales Rep, Total Demos, Successful Demos, Success Rate (%), Avg Score, Dealers Demoed, VINI Usage (%)
```

#### Demo Funnel Export
```
Step, Count, Conversion Rate (%), Drop Off
```

#### Error Reports Export
```
Type, Count, % of Sessions, Last Occurrence
```

#### Daily Trends Export
```
Date, Total Sessions, Successful, Failed, Success Rate (%)
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-08 | Initial documentation |

---

*This document should be updated whenever new metrics are added or calculation logic changes.*

