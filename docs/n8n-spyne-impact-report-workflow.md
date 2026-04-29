# n8n Spyne Impact Report Workflow

## Workflow Overview

```
[Cron Trigger] → [Get Account Data] → [IF: Has Emails?] → [Code: Build Email] → [Gmail: Send] → [Merge Results]
                                              ↓ No
                                    [Set: Skip Record]
```

---

## 1. Cron Trigger Node Configuration

**Node Type:** Schedule Trigger

```json
{
  "rule": {
    "interval": [
      {
        "field": "cronExpression",
        "expression": "0 10 1 * *"
      }
    ]
  }
}
```

**Note:** This runs on the 1st of every month at 10:00 AM UTC. Per-dealer timezone scheduling is not possible with a single cron; for timezone-aware delivery, you'd need a separate workflow that checks each dealer's timezone and queues sends accordingly.

---

## 2. IF Node: Has Emails?

**Node Type:** IF

**Condition:**
```
{{ $json.account.emails && $json.account.emails.length > 0 }}
```

---

## 3. Code Node: Build Email HTML

**Node Type:** Code (JavaScript)

```javascript
// n8n Code Node: Build Spyne Impact Report Email
// Input: Single account item from upstream "Account Data" node
// Output: { subject, to, cc, htmlBody }

const item = $input.item.json;

const account = item.account || {};
const period = item.period || {};
const metrics = item.metrics || {};
const featureAdoption = item.featureAdoption || [];
const recentShipped = item.recentShipped || [];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format number with commas (e.g., 11760 → "11,760")
 * Returns "—" if value is null/undefined
 */
function formatNumber(val) {
  if (val === null || val === undefined) return '—';
  return Number(val).toLocaleString('en-US');
}

/**
 * Format rate as percentage (e.g., 0.95 → "95%")
 * Returns "—" if value is null/undefined
 */
function formatPercent(val) {
  if (val === null || val === undefined) return '—';
  return Math.round(val * 100) + '%';
}

/**
 * Safe string getter - returns "—" if null/undefined/empty
 */
function safe(val, fallback = '—') {
  if (val === null || val === undefined || val === '') return fallback;
  return val;
}

/**
 * Get status badge color based on feature status
 */
function getStatusColor(status) {
  const statusLower = (status || '').toLowerCase();
  if (statusLower === 'active') return { bg: '#22C55E', text: '#FFFFFF' };
  if (statusLower === 'available') return { bg: '#3B82F6', text: '#FFFFFF' };
  if (statusLower === 'off') return { bg: '#F59E0B', text: '#FFFFFF' };
  return { bg: '#94A3B8', text: '#FFFFFF' }; // Not activated / default
}

/**
 * Build opportunity CTA based on feature adoption
 */
function buildOpportunityCTA() {
  const videosFeature = featureAdoption.find(f => f.featureKey === 'videos');
  const spinsFeature = featureAdoption.find(f => f.featureKey === 'spins_360');
  const mediaKitFeature = featureAdoption.find(f => f.featureKey === 'media_kit');
  const csaFeature = featureAdoption.find(f => f.featureKey === 'conversational_sales_assistant');

  // Priority 1: Videos not activated and videosGenerated == 0
  if (metrics.videosGenerated === 0 && videosFeature && videosFeature.status !== 'Active') {
    return {
      title: '🎬 Unlock Video Power',
      text: 'Your inventory is ready for videos! Insta-ready visual descriptions can boost engagement by 40%. Reach out to your CSM to activate Videos.',
      cta: 'Learn About Videos'
    };
  }

  // Priority 2: Spins not active and spinsCreated == 0
  if (metrics.spinsCreated === 0 && spinsFeature && spinsFeature.status !== 'Active') {
    return {
      title: '🔄 Try 360° Spins',
      text: 'Give buyers an immersive view of every vehicle. 360° Spins increase time-on-page and shopper confidence.',
      cta: 'Enable 360° Spins'
    };
  }

  // Priority 3: Recommend Media Kit
  if (mediaKitFeature && mediaKitFeature.status !== 'Active') {
    return {
      title: '🎨 Brand Your Inventory',
      text: 'Launch brand-aligned banners and overlays with Media Kit. Consistent branding builds trust and recognition.',
      cta: 'Explore Media Kit'
    };
  }

  // Priority 4: Recommend Conversational Sales Assistant
  if (csaFeature && csaFeature.status !== 'Active') {
    return {
      title: '💬 Capture More Leads',
      text: 'Activate the Conversational Sales Assistant to engage shoppers 24/7 and boost lead capture.',
      cta: 'Activate Sales Assistant'
    };
  }

  // Default fallback
  return {
    title: '📈 Maximize Your ROI',
    text: 'You\'re making great use of Spyne! Talk to your CSM about advanced features and optimization tips.',
    cta: 'Contact Your CSM'
  };
}

// ============================================
// EMAIL CONSTRUCTION
// ============================================

const dealerName = safe(account.dealerName, 'Valued Partner');
const periodLabel = safe(period.label, 'This Month');
const contactName = safe(account.primaryContactName, 'Team');

// Build subject line
const subject = `Your Spyne Impact Report — ${periodLabel} | ${dealerName}`;

// Determine to/cc
// Using CC for additional recipients so they're visible to all (transparency)
// BCC alternative: Use if you want to hide other recipients from each other
const emails = account.emails || [];
const toEmail = emails[0] || '';
const ccEmails = emails.slice(1).join(', ');

// Color palette
const NAVY = '#0B1B3A';
const NAVY_LIGHT = '#1E3A5F';
const BEIGE = '#F6F1E8';
const BEIGE_DARK = '#E8DFD0';
const WHITE = '#FFFFFF';
const GRAY = '#64748B';
const GREEN = '#22C55E';

// Get opportunity CTA
const opportunity = buildOpportunityCTA();

// ============================================
// HTML EMAIL BODY
// ============================================

const htmlBody = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Spyne Impact Report</title>
</head>
<body style="margin: 0; padding: 0; background-color: #E5E7EB; font-family: Arial, Helvetica, sans-serif;">

<!-- Wrapper Table -->
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #E5E7EB;">
  <tr>
    <td align="center" style="padding: 20px 10px;">

      <!-- Main Container 600px -->
      <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: ${WHITE}; border-radius: 8px; overflow: hidden;">

        <!-- ============================================ -->
        <!-- SECTION 1: HEADER (Navy) -->
        <!-- ============================================ -->
        <tr>
          <td style="background-color: ${NAVY}; padding: 32px 24px; text-align: center;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${WHITE}; font-size: 28px; font-weight: bold; padding-bottom: 8px;">
                  ${dealerName}
                </td>
              </tr>
              <tr>
                <td style="color: ${BEIGE}; font-size: 16px; font-weight: normal;">
                  Spyne Impact Report — ${periodLabel}
                </td>
              </tr>
              <tr>
                <td style="color: ${GRAY}; font-size: 14px; padding-top: 16px;">
                  Hi ${contactName}, here's how Spyne performed for you this month.
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ============================================ -->
        <!-- SECTION 2: HERO METRICS (Beige) -->
        <!-- ============================================ -->
        <tr>
          <td style="background-color: ${BEIGE}; padding: 24px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${NAVY}; font-size: 18px; font-weight: bold; padding-bottom: 16px;">
                  📊 Performance Snapshot
                </td>
              </tr>
            </table>

            <!-- Row 1: 3 Metric Tiles -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="33%" style="padding: 8px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${WHITE}; border-radius: 8px;">
                    <tr>
                      <td style="padding: 16px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="color: ${NAVY}; font-size: 28px; font-weight: bold;">
                              ${formatNumber(metrics.totalVinsProcessed)}
                            </td>
                          </tr>
                          <tr>
                            <td style="color: ${GRAY}; font-size: 12px; padding-top: 4px;">
                              VINs Processed
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
                <td width="33%" style="padding: 8px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${WHITE}; border-radius: 8px;">
                    <tr>
                      <td style="padding: 16px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="color: ${NAVY}; font-size: 28px; font-weight: bold;">
                              ${formatNumber(metrics.imagesProcessed)}
                            </td>
                          </tr>
                          <tr>
                            <td style="color: ${GRAY}; font-size: 12px; padding-top: 4px;">
                              Images Processed
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
                <td width="33%" style="padding: 8px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${WHITE}; border-radius: 8px;">
                    <tr>
                      <td style="padding: 16px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="color: ${NAVY}; font-size: 28px; font-weight: bold;">
                              ${safe(metrics.avgTurnaroundHours, '—')}${metrics.avgTurnaroundHours !== null && metrics.avgTurnaroundHours !== undefined ? 'h' : ''}
                            </td>
                          </tr>
                          <tr>
                            <td style="color: ${GRAY}; font-size: 12px; padding-top: 4px;">
                              Avg Turnaround
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Row 2: 3 Metric Tiles -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 0;">
              <tr>
                <td width="33%" style="padding: 8px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${WHITE}; border-radius: 8px;">
                    <tr>
                      <td style="padding: 16px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="color: ${GREEN}; font-size: 28px; font-weight: bold;">
                              ${formatPercent(metrics.backgroundingRate)}
                            </td>
                          </tr>
                          <tr>
                            <td style="color: ${GRAY}; font-size: 12px; padding-top: 4px;">
                              Backgrounding Rate
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
                <td width="33%" style="padding: 8px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${WHITE}; border-radius: 8px;">
                    <tr>
                      <td style="padding: 16px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="color: ${NAVY}; font-size: 28px; font-weight: bold;">
                              ${formatNumber(metrics.spinsCreated)}
                            </td>
                          </tr>
                          <tr>
                            <td style="color: ${GRAY}; font-size: 12px; padding-top: 4px;">
                              Spins Created
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
                <td width="33%" style="padding: 8px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${WHITE}; border-radius: 8px;">
                    <tr>
                      <td style="padding: 16px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="color: ${NAVY}; font-size: 28px; font-weight: bold;">
                              ${formatNumber(metrics.videosGenerated)}
                            </td>
                          </tr>
                          <tr>
                            <td style="color: ${GRAY}; font-size: 12px; padding-top: 4px;">
                              Videos Generated
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Months with Spyne Badge -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 8px;">
              <tr>
                <td style="padding: 8px; text-align: center;">
                  <table border="0" cellpadding="0" cellspacing="0" align="center" style="background-color: ${NAVY}; border-radius: 20px;">
                    <tr>
                      <td style="padding: 8px 20px; color: ${WHITE}; font-size: 13px;">
                        🎉 ${formatNumber(metrics.monthsWithSpyne)} months with Spyne
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ============================================ -->
        <!-- SECTION 3: INVENTORY BREAKDOWN (Navy) -->
        <!-- ============================================ -->
        <tr>
          <td style="background-color: ${NAVY}; padding: 24px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${WHITE}; font-size: 18px; font-weight: bold; padding-bottom: 16px;">
                  🚗 Inventory Breakdown
                </td>
              </tr>
            </table>

            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${NAVY_LIGHT}; border-radius: 8px;">
              <tr>
                <td style="padding: 4px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <!-- Header Row -->
                    <tr>
                      <td style="padding: 12px 16px; color: ${GRAY}; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid ${NAVY};">
                        Metric
                      </td>
                      <td style="padding: 12px 16px; color: ${GRAY}; font-size: 12px; text-transform: uppercase; text-align: right; border-bottom: 1px solid ${NAVY};">
                        Value
                      </td>
                    </tr>
                    <!-- Spyne Backgrounded VINs -->
                    <tr>
                      <td style="padding: 12px 16px; color: ${WHITE}; font-size: 14px;">
                        Spyne Backgrounded VINs
                      </td>
                      <td style="padding: 12px 16px; color: ${WHITE}; font-size: 14px; text-align: right; font-weight: bold;">
                        ${formatNumber(metrics.spyneBackgroundedVins)}
                      </td>
                    </tr>
                    <!-- Raw VINs -->
                    <tr>
                      <td style="padding: 12px 16px; color: ${WHITE}; font-size: 14px;">
                        Raw VINs
                      </td>
                      <td style="padding: 12px 16px; color: ${WHITE}; font-size: 14px; text-align: right; font-weight: bold;">
                        ${formatNumber(metrics.rawVins)}
                      </td>
                    </tr>
                    ${metrics.stockVins !== null && metrics.stockVins !== undefined ? `
                    <!-- Stock VINs (optional) -->
                    <tr>
                      <td style="padding: 12px 16px; color: ${WHITE}; font-size: 14px;">
                        Stock VINs
                      </td>
                      <td style="padding: 12px 16px; color: ${WHITE}; font-size: 14px; text-align: right; font-weight: bold;">
                        ${formatNumber(metrics.stockVins)}
                      </td>
                    </tr>
                    ` : ''}
                    <!-- Proper Sequencing Rate -->
                    <tr>
                      <td style="padding: 12px 16px; color: ${WHITE}; font-size: 14px;">
                        Proper Sequencing Rate
                      </td>
                      <td style="padding: 12px 16px; color: ${GREEN}; font-size: 14px; text-align: right; font-weight: bold;">
                        ${formatPercent(metrics.properSequencingRate)}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ============================================ -->
        <!-- SECTION 4: FEATURE ADOPTION SNAPSHOT (Beige) -->
        <!-- ============================================ -->
        <tr>
          <td style="background-color: ${BEIGE}; padding: 24px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${NAVY}; font-size: 18px; font-weight: bold; padding-bottom: 16px;">
                  ⚡ Feature Adoption Snapshot
                </td>
              </tr>
            </table>

            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${WHITE}; border-radius: 8px;">
              <tr>
                <td style="padding: 4px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <!-- Header Row -->
                    <tr>
                      <td style="padding: 12px 16px; color: ${GRAY}; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid ${BEIGE_DARK};">
                        Feature
                      </td>
                      <td style="padding: 12px 16px; color: ${GRAY}; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid ${BEIGE_DARK};">
                        Note
                      </td>
                      <td style="padding: 12px 16px; color: ${GRAY}; font-size: 12px; text-transform: uppercase; text-align: center; border-bottom: 1px solid ${BEIGE_DARK};">
                        Status
                      </td>
                    </tr>
                    ${featureAdoption.map((feature, idx) => {
                      const statusColor = getStatusColor(feature.status);
                      const isLast = idx === featureAdoption.length - 1;
                      return `
                    <tr>
                      <td style="padding: 12px 16px; color: ${NAVY}; font-size: 14px; font-weight: 600;${!isLast ? ` border-bottom: 1px solid ${BEIGE_DARK};` : ''}">
                        ${safe(feature.label)}
                      </td>
                      <td style="padding: 12px 16px; color: ${GRAY}; font-size: 13px;${!isLast ? ` border-bottom: 1px solid ${BEIGE_DARK};` : ''}">
                        ${safe(feature.note, '')}
                      </td>
                      <td style="padding: 12px 16px; text-align: center;${!isLast ? ` border-bottom: 1px solid ${BEIGE_DARK};` : ''}">
                        <table border="0" cellpadding="0" cellspacing="0" align="center" style="background-color: ${statusColor.bg}; border-radius: 12px;">
                          <tr>
                            <td style="padding: 4px 12px; color: ${statusColor.text}; font-size: 11px; font-weight: bold;">
                              ${safe(feature.status)}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>`;
                    }).join('')}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ============================================ -->
        <!-- SECTION 5: SUPPORT SUMMARY (Navy) -->
        <!-- ============================================ -->
        <tr>
          <td style="background-color: ${NAVY}; padding: 24px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${WHITE}; font-size: 18px; font-weight: bold; padding-bottom: 16px;">
                  🎧 We Heard You
                </td>
              </tr>
            </table>

            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="33%" style="padding: 8px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${NAVY_LIGHT}; border-radius: 8px;">
                    <tr>
                      <td style="padding: 16px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="color: ${WHITE}; font-size: 24px; font-weight: bold;">
                              ${formatNumber(metrics.ticketsRaised)}
                            </td>
                          </tr>
                          <tr>
                            <td style="color: ${GRAY}; font-size: 12px; padding-top: 4px;">
                              Tickets Raised
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
                <td width="33%" style="padding: 8px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${NAVY_LIGHT}; border-radius: 8px;">
                    <tr>
                      <td style="padding: 16px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="color: ${GREEN}; font-size: 24px; font-weight: bold;">
                              ${metrics.ticketsRaised && metrics.ticketsRaised > 0 
                                ? Math.round((metrics.ticketsResolved || 0) / metrics.ticketsRaised * 100) + '%'
                                : '—'}
                            </td>
                          </tr>
                          <tr>
                            <td style="color: ${GRAY}; font-size: 12px; padding-top: 4px;">
                              Resolution Rate
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
                <td width="33%" style="padding: 8px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${NAVY_LIGHT}; border-radius: 8px;">
                    <tr>
                      <td style="padding: 16px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="color: ${WHITE}; font-size: 24px; font-weight: bold;">
                              ${metrics.avgTicketResolutionMins !== null && metrics.avgTicketResolutionMins !== undefined 
                                ? metrics.avgTicketResolutionMins + 'm' 
                                : '—'}
                            </td>
                          </tr>
                          <tr>
                            <td style="color: ${GRAY}; font-size: 12px; padding-top: 4px;">
                              Avg Resolution
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ============================================ -->
        <!-- SECTION 6: YOUR FEEDBACK IN ACTION (Beige) -->
        <!-- ============================================ -->
        ${recentShipped.length > 0 ? `
        <tr>
          <td style="background-color: ${BEIGE}; padding: 24px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${NAVY}; font-size: 18px; font-weight: bold; padding-bottom: 16px;">
                  🚀 Your Feedback in Action
                </td>
              </tr>
            </table>

            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                ${recentShipped.slice(0, 3).map(item => `
                <td width="33%" style="padding: 8px; vertical-align: top;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${WHITE}; border-radius: 8px; border-left: 4px solid ${NAVY};">
                    <tr>
                      <td style="padding: 16px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="color: ${NAVY}; font-size: 14px; font-weight: bold; padding-bottom: 4px;">
                              ${safe(item.title)}
                            </td>
                          </tr>
                          <tr>
                            <td style="color: ${GRAY}; font-size: 12px;">
                              ${safe(item.subtitle)}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
                `).join('')}
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}

        <!-- ============================================ -->
        <!-- SECTION 7: OPPORTUNITY CTA (Navy) -->
        <!-- ============================================ -->
        <tr>
          <td style="background-color: ${NAVY}; padding: 24px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${NAVY_LIGHT}; border-radius: 8px; border: 1px solid #3B5998;">
              <tr>
                <td style="padding: 24px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="color: ${WHITE}; font-size: 18px; font-weight: bold; padding-bottom: 8px;">
                        ${opportunity.title}
                      </td>
                    </tr>
                    <tr>
                      <td style="color: ${BEIGE}; font-size: 14px; line-height: 1.5; padding-bottom: 16px;">
                        ${opportunity.text}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table border="0" cellpadding="0" cellspacing="0" style="background-color: ${GREEN}; border-radius: 6px;">
                          <tr>
                            <td style="padding: 12px 24px;">
                              <a href="mailto:support@spyne.ai?subject=Feature%20Inquiry%20-%20${encodeURIComponent(dealerName)}" style="color: ${WHITE}; font-size: 14px; font-weight: bold; text-decoration: none;">
                                ${opportunity.cta} →
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ============================================ -->
        <!-- SECTION 8: FOOTER (Beige) -->
        <!-- ============================================ -->
        <tr>
          <td style="background-color: ${BEIGE_DARK}; padding: 24px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${GRAY}; font-size: 12px; line-height: 1.6; text-align: center;">
                  You're receiving this because you're a valued Spyne partner.<br />
                  This report is auto-generated based on your account activity for ${periodLabel}.<br /><br />
                  <a href="#MANAGE_PREFERENCES_PLACEHOLDER" style="color: ${NAVY}; text-decoration: underline;">Manage email preferences</a>
                  &nbsp;|&nbsp;
                  <a href="#UNSUBSCRIBE_PLACEHOLDER" style="color: ${NAVY}; text-decoration: underline;">Unsubscribe</a>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 20px; text-align: center;">
                  <table border="0" cellpadding="0" cellspacing="0" align="center">
                    <tr>
                      <td style="color: ${NAVY}; font-size: 14px; font-weight: bold;">
                        Spyne
                      </td>
                    </tr>
                    <tr>
                      <td style="color: ${GRAY}; font-size: 11px; padding-top: 4px;">
                        AI-Powered Automotive Merchandising
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
      <!-- End Main Container -->

    </td>
  </tr>
</table>
<!-- End Wrapper -->

</body>
</html>
`;

// ============================================
// RETURN OUTPUT FOR GMAIL NODE
// ============================================

return {
  json: {
    subject: subject,
    to: toEmail,
    cc: ccEmails,
    htmlBody: htmlBody,
    accountId: account.accountId,
    dealerName: dealerName
  }
};
```

---

## 4. Gmail Node Configuration

**Node Type:** Gmail

**Operation:** Send

### Field Mappings

| Gmail Field | n8n Expression | Notes |
|-------------|----------------|-------|
| **Resource** | `Message` | |
| **Operation** | `Send` | |
| **To** | `{{ $json.to }}` | Primary email |
| **CC** | `{{ $json.cc }}` | Additional recipients (visible to all) |
| **Subject** | `{{ $json.subject }}` | Dynamic subject line |
| **Email Type** | `HTML` | Important: Select HTML, not Text |
| **Message** | `{{ $json.htmlBody }}` | Full HTML body |

### Gmail Node JSON (for import)

```json
{
  "parameters": {
    "resource": "message",
    "operation": "send",
    "to": "={{ $json.to }}",
    "cc": "={{ $json.cc }}",
    "subject": "={{ $json.subject }}",
    "emailType": "html",
    "message": "={{ $json.htmlBody }}",
    "options": {}
  },
  "name": "Gmail: Send Impact Report",
  "type": "n8n-nodes-base.gmail",
  "typeVersion": 2.1,
  "position": [850, 300],
  "credentials": {
    "gmailOAuth2": {
      "id": "YOUR_CREDENTIAL_ID",
      "name": "Gmail account"
    }
  }
}
```

---

## 5. Error Handling Setup

### Branch for Missing Emails (IF Node)

Already covered in Section 2. The "false" branch should connect to a "Set" node:

```json
{
  "parameters": {
    "values": {
      "string": [
        {
          "name": "status",
          "value": "skipped"
        },
        {
          "name": "reason",
          "value": "No email addresses found"
        },
        {
          "name": "accountId",
          "value": "={{ $json.account.accountId }}"
        }
      ]
    }
  },
  "name": "Set: Skip Record",
  "type": "n8n-nodes-base.set"
}
```

### Error Handler for Gmail Failures

Wrap the Gmail node in an error workflow or use **Continue On Fail**:

1. On the Gmail node, enable **Continue On Fail** in Settings
2. Add an IF node after Gmail to check for errors:

```
{{ $json.error !== undefined }}
```

3. Route failures to a collection node

### Final Summary Node (Merge + Function)

```javascript
// Code node: Aggregate Results
const items = $input.all();

const summary = {
  totalProcessed: items.length,
  successful: 0,
  failed: 0,
  skipped: 0,
  failures: []
};

for (const item of items) {
  if (item.json.status === 'skipped') {
    summary.skipped++;
  } else if (item.json.error) {
    summary.failed++;
    summary.failures.push({
      accountId: item.json.accountId,
      error: item.json.error.message || 'Unknown error'
    });
  } else {
    summary.successful++;
  }
}

return {
  json: summary
};
```

---

## 6. Complete Workflow JSON (Import Ready)

```json
{
  "name": "Spyne Monthly Impact Report",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 10 1 * *"
            }
          ]
        }
      },
      "name": "Monthly Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.1,
      "position": [100, 300]
    },
    {
      "parameters": {},
      "name": "Get Account Data",
      "type": "n8n-nodes-base.noOp",
      "typeVersion": 1,
      "position": [300, 300],
      "notesInFlow": true,
      "notes": "Replace with your data source (HTTP Request, Database, etc.)"
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{ $json.account.emails && $json.account.emails.length > 0 }}",
              "value2": true
            }
          ]
        }
      },
      "name": "Has Emails?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [500, 300]
    },
    {
      "parameters": {
        "jsCode": "// [PASTE THE FULL CODE FROM SECTION 3 HERE]"
      },
      "name": "Build Email HTML",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [700, 200]
    },
    {
      "parameters": {
        "resource": "message",
        "operation": "send",
        "to": "={{ $json.to }}",
        "cc": "={{ $json.cc }}",
        "subject": "={{ $json.subject }}",
        "emailType": "html",
        "message": "={{ $json.htmlBody }}"
      },
      "name": "Gmail: Send Report",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [900, 200],
      "continueOnFail": true
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "status",
              "value": "skipped"
            },
            {
              "name": "reason", 
              "value": "No email addresses"
            },
            {
              "name": "accountId",
              "value": "={{ $json.account.accountId }}"
            }
          ]
        }
      },
      "name": "Skip: No Email",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3,
      "position": [700, 400]
    },
    {
      "parameters": {},
      "name": "Merge Results",
      "type": "n8n-nodes-base.merge",
      "typeVersion": 2.1,
      "position": [1100, 300]
    }
  ],
  "connections": {
    "Monthly Trigger": {
      "main": [[{"node": "Get Account Data", "type": "main", "index": 0}]]
    },
    "Get Account Data": {
      "main": [[{"node": "Has Emails?", "type": "main", "index": 0}]]
    },
    "Has Emails?": {
      "main": [
        [{"node": "Build Email HTML", "type": "main", "index": 0}],
        [{"node": "Skip: No Email", "type": "main", "index": 0}]
      ]
    },
    "Build Email HTML": {
      "main": [[{"node": "Gmail: Send Report", "type": "main", "index": 0}]]
    },
    "Gmail: Send Report": {
      "main": [[{"node": "Merge Results", "type": "main", "index": 0}]]
    },
    "Skip: No Email": {
      "main": [[{"node": "Merge Results", "type": "main", "index": 1}]]
    }
  }
}
```

---

## 7. Testing Steps

### Step 1: Single Account Test

1. **Create a Manual Trigger** node and connect it before "Get Account Data"
2. **Add a "Set" node** to inject test data:

```javascript
// Set node with test account data
{
  "account": {
    "accountId": "test_001",
    "dealerName": "Test Motors",
    "timezone": "America/New_York",
    "primaryContactName": "Test User",
    "emails": ["your-email@company.com"]
  },
  "period": {
    "label": "December 2025",
    "startDate": "2025-12-01",
    "endDate": "2025-12-31"
  },
  "metrics": {
    "totalVinsProcessed": 392,
    "imagesProcessed": 11760,
    "spinsCreated": 392,
    "videosGenerated": 0,
    "backgroundingRate": 1.0,
    "avgTurnaroundHours": 12,
    "monthsWithSpyne": 5,
    "spyneBackgroundedVins": 87,
    "rawVins": 4,
    "stockVins": null,
    "properSequencingRate": 0.95,
    "ticketsRaised": 1,
    "ticketsResolved": 1,
    "avgTicketResolutionMins": 30,
    "featureRequestsRaised": 0,
    "featureRequestsAccepted": 0
  },
  "featureAdoption": [
    { "featureKey": "studio_backgrounding", "label": "Studio Backgrounding", "status": "Active", "note": "Fully scaled ✓" },
    { "featureKey": "spins_360", "label": "360° Spins", "status": "Active", "note": "Video input" },
    { "featureKey": "videos", "label": "Videos", "status": "Not activated", "note": "Insta-ready visual description" },
    { "featureKey": "media_kit", "label": "Media Kit", "status": "Off", "note": "Launch brand-aligned templates" },
    { "featureKey": "conversational_sales_assistant", "label": "Sales Assistant", "status": "Off", "note": "Activate for lead capture lift" }
  ],
  "recentShipped": [
    { "title": "Tagging NEW & OLD Cars", "subtitle": "Live on App and Console" },
    { "title": "App Scanner Accuracy", "subtitle": "Fixed since Dec 12" },
    { "title": "In-App Sequencing", "subtitle": "Live since Nov 15" }
  ]
}
```

3. **Execute manually** and verify:
   - Email arrives in your inbox
   - Subject line is correct
   - All sections render properly
   - Numbers are formatted with commas
   - Percentages display correctly
   - Feature adoption table shows correct statuses
   - Opportunity CTA is appropriate based on feature adoption

### Step 2: Multi-Client Test (Limit 5)

1. Connect to real data source with a **Limit node** (set to 5)
2. Use internal/test email addresses only
3. Verify all 5 emails arrive correctly
4. Check for any error outputs

### Step 3: Staged Rollout

| Phase | Accounts | Actions |
|-------|----------|---------|
| 1 | 10 accounts | Hand-pick known accounts, monitor delivery |
| 2 | 50 accounts | Expand, check bounce rates |
| 3 | 200 accounts | Larger batch, monitor Gmail quotas |
| 4 | All 800+ | Full rollout |

### Step 4: Gmail Quotas

**Important:** Gmail API has daily sending limits:
- Free Gmail: 100 emails/day
- Google Workspace: 2,000 emails/day (varies by plan)

For 800+ accounts, consider:
- Batch sends over multiple days
- Use `SplitInBatches` node with delays
- Consider dedicated email service (SendGrid, Mailgun) for scale

### Verification Checklist

- [ ] Email renders in Gmail (web)
- [ ] Email renders in Gmail (mobile)
- [ ] Email renders in Outlook
- [ ] Email renders in Apple Mail
- [ ] Subject line shows dealer name and period
- [ ] All metrics display correctly (or "—" if null)
- [ ] Feature adoption table is complete
- [ ] Opportunity CTA matches feature status
- [ ] Footer links are present (placeholder URLs)
- [ ] No broken tables or misaligned content

---

## 8. Preview of Email Output

**Subject:** `Your Spyne Impact Report — December 2025 | Joseph Toyota`

**Layout:**
```
┌─────────────────────────────────────┐
│  HEADER (Navy)                      │
│  Joseph Toyota                      │
│  Spyne Impact Report — Dec 2025     │
│  Hi Amit, here's how Spyne...       │
├─────────────────────────────────────┤
│  HERO METRICS (Beige)               │
│  ┌───────┬───────┬───────┐          │
│  │  392  │11,760 │  12h  │          │
│  │ VINs  │Images │Turnaround│       │
│  ├───────┼───────┼───────┤          │
│  │ 100%  │  392  │   0   │          │
│  │ BG %  │ Spins │Videos │          │
│  └───────┴───────┴───────┘          │
│  🎉 5 months with Spyne             │
├─────────────────────────────────────┤
│  INVENTORY BREAKDOWN (Navy)         │
│  Spyne Backgrounded VINs: 87        │
│  Raw VINs: 4                        │
│  Proper Sequencing Rate: 95%        │
├─────────────────────────────────────┤
│  FEATURE ADOPTION (Beige)           │
│  Studio Backgrounding | Active ✓    │
│  360° Spins | Active ✓              │
│  Videos | Not activated             │
│  Media Kit | Off                    │
│  Sales Assistant | Off              │
├─────────────────────────────────────┤
│  WE HEARD YOU (Navy)                │
│  1 Ticket | 100% Resolved | 30m     │
├─────────────────────────────────────┤
│  YOUR FEEDBACK IN ACTION (Beige)    │
│  [Card] [Card] [Card]               │
├─────────────────────────────────────┤
│  OPPORTUNITY (Navy)                 │
│  🎬 Unlock Video Power              │
│  Your inventory is ready...         │
│  [Learn About Videos →]             │
├─────────────────────────────────────┤
│  FOOTER (Beige)                     │
│  You're receiving this because...   │
│  Manage preferences | Unsubscribe   │
│  Spyne                              │
└─────────────────────────────────────┘
```

---

## Notes

1. **CC vs BCC Decision:** Using CC makes all recipients visible to each other, promoting transparency within the dealership. Use BCC if you prefer to hide additional recipients.

2. **Timezone Limitation:** The cron trigger runs at a fixed UTC time. For timezone-aware delivery, implement a pre-filter workflow that checks dealer timezone and queues sends appropriately.

3. **Gmail Rate Limits:** For 800+ accounts, implement batching with delays or consider a dedicated transactional email service.

4. **Unsubscribe Logic:** The placeholder links (`#MANAGE_PREFERENCES_PLACEHOLDER`, `#UNSUBSCRIBE_PLACEHOLDER`) should be replaced with actual URLs when the preference management system is built.
