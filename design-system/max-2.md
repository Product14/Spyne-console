# Spyne Console: Max 2.0 design system

**Mandatory reference** for any new Max 2 screen or component under **`/max-2`**. This document mirrors the product spec for **console.spyne.ai** visual DNA: same colors, typography rhythm, spacing scale, radii, surfaces, and icon system.

## Scope

**In scope:** Every route under **`/max-2`** (Home, Studio AI and sub-routes, Lot View, Recon, Sourcing, Sales, Marketing, Service, Customers). `app/max-2/layout.tsx` wraps the **sidebar + main column** in **`Max2SpyneScope`** (`.max2-spyne`). **`isMax2SpyneScopedPath()`** uses prefix **`/max-2`** in `lib/design-system/max-2.ts` for any code that needs a route check.

**Sales Console** (`ConsoleV2SalesExperience` + `styles/console-v2-sales.css` under `.console-v2-sales-root`) lives inside the same Spyne scope.

**Page structure:** Use **`max2Classes.pageTitle`** and **`max2Classes.pageDescription`** for the top-of-page header; **`max2Layout.pageStack`** (`.spyne-max2-page-stack`: **24px** between major blocks, **16px** from the page title block to the next block when the first child contains `.max2-page-title`) for vertical rhythm; **`max2Classes.sectionTitle`** or **`Max2PageSection`** (`components/max-2/max2-page-section.tsx`) for in-page section headings above metrics, tables, or card grids. Match **`spyneSalesLayout.sectionGap`** (`gap-6`) for responsive multi-column grids. **Sales and Service overview** share **`spyneSalesLayout.overviewAgentRow`** (`grid grid-cols-1 md:grid-cols-3`) for the agent / appointments / follow-ups row so breakpoints match.

**Sales Console implementation:** Use **`spyneSalesLayout.pageStack`** for vertical rhythm inside the sales main column, **`SpyneSegmentedControl` + `SpyneSegmentedButton`** for mutually exclusive toggles, **`SpyneLineTabStrip` / `SpyneLineTab`** for underline tab rows, and **`SpyneRoiKpiStrip`** for the overview metrics bar. Sticky page headers share the same top offset and full-bleed padding pattern as Studio/Lot.

Shell chrome (sidebar, mobile bar, page gutters) uses the same Spyne tokens on **all** Max 2 routes so the product reads as one system.

## Source of truth (machine-readable)

| Layer | Location |
|--------|----------|
| CSS variables, `.max2-spyne` subtree rules, sidebar nav utilities | `app/globals.css` (`:root` Spyne block including `--spyne-card-*`, `--spyne-dark-elevated-*`, `--spyne-chart-on-dark-*`, `@layer components`) |
| Typed exports (`spyneConsoleTokens`, `spyneDarkUiTokens`, `spyneCardTokens`, `spyneToolbarTokens`, `spyneComponentClasses`, `max2Classes.overviewPanel*` …), route helpers | `lib/design-system/max-2.ts` |
| Scope wrapper | `components/max-2/max2-spyne-scope.tsx` |
| Page section block (title + optional description + children) | `components/max-2/max2-page-section.tsx` (`Max2PageSection`) |
| Action tab cards | `components/max-2/max2-action-tab.tsx` |
| Overview panel shell (Studio / Media Lot plain `div` cards) | `max2Classes.overviewPanelShell` and related in `lib/design-system/max-2.ts`; § **Overview panel shell** below |
| Lot Action Items suggest banner (warning slab + tab pointer) | `max2Classes.overviewSuggestBanner*` in `lib/design-system/max-2.ts`; `.spyne-overview-suggest-banner__*` in `app/globals.css`; § **Overview panel shell** below |
| Material Symbols helper | `components/max-2/material-symbol.tsx` |
| Inventory filter drawer | `components/max-2/inventory-filter-panel.tsx` |
| Checkbox (shadcn + Spyne chrome) | `components/ui/checkbox.tsx` + `.max2-spyne [data-slot="checkbox"]` in `app/globals.css`; `spyneCheckboxTokens` in `lib/design-system/max-2.ts` |
| Collapsed sidebar rail (icon + label stack, dividers) | `components/max-2/max2-sidebar-rail.tsx` |
| Reusable Spyne UI (chips, filter tags, domain status) | `components/max-2/spyne-ui/` (barrel: `spyne-chip.tsx` re-exports) |
| Domain chip presets (lot / media / publish / pricing labels + tones) | `lib/design-system/spyne-chip-presets.ts` (also re-exported from `lib/design-system/max-2.ts`) |
| ROI / KPI metric strip (Lot KPI row, Sales overview metrics bar) | `components/max-2/spyne-roi-kpi-strip.tsx` + `spyneComponentClasses.roiKpi*` in `lib/design-system/max-2.ts` |
| Segmented switcher + filter dropdown (Sales overview toolbar) | `components/max-2/spyne-toolbar-controls.tsx` + `.spyne-segmented*` / `.spyne-filter-select*` in `app/globals.css`; `spyneToolbarTokens`, `spyneComponentClasses.segmented*` / `filterSelect*` in `lib/design-system/max-2.ts` |
| Line (underline) tabs: strip + tab + count badge | `components/max-2/spyne-line-tabs.tsx` + `.spyne-line-tab-strip*` / `.spyne-line-tab*` in `app/globals.css`; `spyneLineTabTokens`, `spyneComponentClasses.lineTab*` in `lib/design-system/max-2.ts` |
| Insight rows (Studio Insights list, modal action links) | `components/max-2/studio/merchandising-summary.tsx` + `.spyne-insight-row*` in `app/globals.css`; `spyneComponentClasses.insightRow*` in `lib/design-system/max-2.ts` |
| Font link | `app/layout.tsx` (Google Material Symbols Outlined) |

## Canonical tokens (exact)

### Colors

- Primary: `#4600F2`
- Secondary / soft primary: `#4600F214`
- Page background: `#F4F5F8`
- Surface: `#FFFFFF`
- Text primary: `#1A1A1A`
- Text secondary: `#6B7280`
- Border: `#E5E7EB`
- Success: `#027A48`
- Warning: `#FACC15`
- Error: `#D13313`
- Info: `#3B82F6`

#### Dark elevated surfaces (tooltips, chart popovers)

Use when a **dark panel** sits on top of a light chart or page (e.g. Recharts tooltip). The light-theme semantic and chart hex values above are tuned for **white / gray-50 backgrounds**; using them unchanged as **foreground** on `#1E1E1E` fails WCAG contrast (especially deep green, blue, and purple).

| Role | Token | Hex | Notes |
|------|--------|-----|--------|
| Panel background | `--spyne-dark-elevated-bg` | `#1E1E1E` | Canonical tooltip / popover surface |
| Primary label (date, title) | `--spyne-on-dark-text` | `#F3F4F6` | Body **700** / semibold headers |
| Secondary / de-emphasized | `--spyne-on-dark-text-muted` | `#9CA3AF` | Axis captions, helper lines |
| Series 1 (violet, primary lineage) | `--spyne-chart-on-dark-1` | `#B794F6` | |
| Series 2 (blue, info lineage) | `--spyne-chart-on-dark-2` | `#7EB6FF` | |
| Series 3 (green, success lineage) | `--spyne-chart-on-dark-3` | `#6EE7A0` | |
| Series 4 (cyan) | `--spyne-chart-on-dark-4` | `#22D3EE` | |
| Series 5 (pink) | `--spyne-chart-on-dark-5` | `#F472B6` | |
| Series 6 (orange) | `--spyne-chart-on-dark-6` | `#FDBA74` | |
| Series 7 (coral, error lineage) | `--spyne-chart-on-dark-7` | `#F87171` | |
| Series 8 (amber, `warningInk` lineage) | `--spyne-chart-on-dark-8` | `#FCD34D` | |

**Rules**

1. **Match series index** between the chart stroke and the tooltip row when possible (same hue family as light `CHART_SERIES` in `spyne-palette.js`, but use the **on-dark** hex in the tooltip).
2. **Target** at least **4.5:1** contrast for **normal** (14px) colored metric text on `--spyne-dark-elevated-bg`; **3:1** minimum only for **large** (≥18px or 14px bold) non-essential decoration.
3. **Tailwind** (when the theme maps these): `bg-spyne-dark-elevated`, `text-spyne-on-dark-text`, `text-spyne-chart-on-dark-3`, etc.
4. **TypeScript / Recharts**: `spyneDarkUiTokens.chartSeries` from `lib/design-system/max-2.ts`, or `CHART_SERIES_ON_DARK` from `components/max-2/sales/console-v2/spyne-palette.js` (same order as `CHART_SERIES`).

#### Dark tooltip shell (Studio inventory, lot KPI)

For **Radix Tooltip** panels that match the **Published** column (near-black card, elevated inner well, arrow fill on shell):

| Role | Token / class | Notes |
|------|----------------|-------|
| Outer card | `--spyne-tooltip-dark-shell-bg` (`#121212`) | Arrow fill matches this |
| Section / label muted | `--spyne-tooltip-dark-label-muted` (`#888888`) | Uppercase row headers, meta lines |
| Shadow | `--spyne-tooltip-dark-shadow` | Card elevation |
| Implementation | `spyneComponentClasses.darkTooltip*` in `lib/design-system/max-2.ts` | Includes `darkTooltipRadixContent` (transparent Radix wrapper) |
| Bullet list body | `SpyneDarkTooltipPanel` | Holding cost, KPI suggested actions; bullets use `--spyne-chart-on-dark-1` |
| Nested well | `--spyne-dark-elevated-bg` via `darkTooltipInnerWell` | Publish sync status pill row |

### Typography

- Font: **Inter** (body already uses Inter in root layout; `.max2-spyne` reinforces `Inter, sans-serif`).
- Page heading: **20px**, **600**, line-height **1.4**; **`max2-page-title`** inside `.max2-spyne`.
- Subheading / description: **14px**, **400**, line-height **1.5**; **`max2-page-description`**.
- Body: **14px**.
- Small: **12px**.

**Copy / punctuation:** Do not use the **em dash** (Unicode **U+2014**) in user-facing Max 2 console copy or in this document. Use a **comma**, **colon**, **parentheses**, or (for numeric or date ranges only) a spaced **en dash** (U+2013, e.g. `Mar 1 – Mar 31`).

### Buttons (border-radius **8px** always for buttons)

| Size | Height | Horizontal padding | Font | Icon |
|------|--------|-------------------|------|------|
| Large | 44px | 16px | 16px | 24px |
| Medium | 40px | 14px | 14px | 20px |
| Small | 36px | 12px | 12px | 16px |

CSS classes (only valid inside `.max2-spyne`): `spyne-btn-primary-lg`, `spyne-btn-primary-md`, `spyne-btn-secondary-md`. See `app/globals.css`.

### Border radius

- sm **4px**, md **6px**, lg **8px**, xl **12px**, full **9999px**
- Mapping: Button **8px**, Input **6px**, Card **8px**, Modal **12px**, Chip **full**, Avatar **full**

### Checkbox (Spyne)

Use **`@/components/ui/checkbox`** (Radix) for any Max 2 form or list multi-select. Inside **`.max2-spyne`**, `[data-slot="checkbox"]` picks up scoped rules in **`app/globals.css`**; do not re-specify size, radius, or checked colors with one-off Tailwind unless you are outside Max 2.

| Element | Spec |
|--------|------|
| **Box size** | **20px** × **20px** (`--spyne-checkbox-size`) |
| **Corner radius** | **6px** (`--spyne-checkbox-radius`), soft square (~**30%** of side), not a circle |
| **Border** | **1px** `--spyne-border` when unchecked |
| **Unchecked fill** | `--spyne-surface` |
| **Checked fill** | `--spyne-primary` (`#4600F2`); hover uses `--spyne-primary-hover` |
| **Check mark** | **White** (`#FFFFFF`), centered; icon box **14px** (`--spyne-checkbox-check-size`) |
| **Mark stroke** | **2.25px** (`--spyne-checkbox-check-stroke`), **round** line caps and joins (Lucide `Check` path) |
| **Hover (unchecked)** | Border **35%** mix of primary into `--spyne-border` |
| **Focus** | **3px** ring: `color-mix(primary **14%**, transparent)`; border snaps to primary |
| **Disabled** | Inherits shadcn **`disabled:opacity-50`**; `cursor: not-allowed` |

**TypeScript:** `spyneCheckboxTokens` in `lib/design-system/max-2.ts` for Storybook, tests, or Figma handoff.

**Portals:** If the checkbox mounts outside the layout tree (e.g. some dialogs), wrap the surface in **`max2Classes.spyneScope`** so the rules apply (same pattern as **`SpyneFilterSheet`**).

### Cards (Studio / Lot / Sales)

Canonical `:root` variables: `--spyne-card-radius`, `--spyne-card-border`, `--spyne-card-bg`, `--spyne-card-shadow`, `--spyne-card-gap`, `--spyne-card-padding-x`, `--spyne-card-header-padding-*`, `--spyne-card-content-padding-bottom`, `--spyne-card-title-*`, `--spyne-card-description-*` (see `app/globals.css`). Typed mirror: `spyneCardTokens` in `lib/design-system/max-2.ts`.

| Aspect | Value |
|--------|--------|
| Corner radius | **8px** (`--spyne-card-radius`) |
| Border | **1px** `--spyne-border` (outer shell only) |
| Shadow | **0 1px 2px** black **4%** (`--spyne-card-shadow`) |
| **Header → body** | **No** hairline divider: do **not** use `border-bottom` under the title/description block. Separation is **vertical spacing** only (`gap` on the card flex column, or header `padding-bottom` + content `padding-top`). Under `.max2-spyne`, `[data-slot="card-header"]` is forced **without** a bottom border (see `app/globals.css`). |
| Section title (card header) | **15px**, **600**, line-height **1.2**; shadcn: `[data-slot="card-title"]` under `.max2-spyne`; explicit class: `spyne-card-title` (`spyneComponentClasses.cardTitle`). **Always use one of these — never raw Tailwind like `font-semibold` without an explicit size.** |
| Header padding | horizontal **1rem**, top **1rem**, bottom **0.75rem** |
| Body padding | horizontal **1rem**, bottom **1rem** (shadcn `CardContent`; Sales cards use Tailwind **`p-4`** = **1rem** on the shell where appropriate) |

**Custom card shells** (plain `div` + title row + body, e.g. Studio Insights / Opportunities): same rule — **no** `border-b` between the heading block and the list or table; optional soft tint on the header (`bg-muted/20`–`/30`) is allowed, but not a rule line. **`spyne-action-tab-strip`** also omits a bottom border so tabs flow into the panel body without a separator.

#### Overview panel shell (Studio AI & Media Lot) — **strict**

Use this for **plain `div`** overview blocks that mirror **Action Items** and **Inventory Analysis** on `/max-2/studio` and `/max-2/studio/media-lot` (and the same pattern anywhere else in Max 2). **Do not** use shadcn **`Card`** for these shells; spacing and typography must match the table below.

| Piece | Requirement |
|--------|----------------|
| **Shell** | `max2Classes.overviewPanelShell` — `rounded-xl border border-spyne-border bg-spyne-surface shadow-none overflow-hidden` |
| **Heading block** | `max2Classes.overviewPanelHeader` — **`px-5 pt-5 pb-5`** (20px on all sides). Horizontal inset **must** match the vertical band above the first table row or tab strip. |
| **Title** | `spyneComponentClasses.cardTitle` (15px / 600 / 1.2). No ad-hoc heading classes. |
| **Subtitle** | `max2Classes.overviewPanelDescription` — **`text-sm mt-2 text-muted-foreground`** immediately under the title when a description is present. |
| **Body** | Next sibling **`<div>`** wrapping tabs, `Max2ActionTabStrip`, tables, or `VehicleMediaTable`. **No** extra top padding on this wrapper; the heading block’s **`pb-5`** supplies the only gap before content. First row may use `border-t border-spyne-border` where a separator is needed. |
| **`spyne-action-tab-strip`** under this shell | **`!pt-0 !px-5`** (and bottom override such as `!pb-2` when embedded). Aligns strip horizontal inset with the heading block. |
| **Footer / secondary slab** (insights, dual callouts) | `max2Classes.overviewPanelFooter` — **`border-t border-spyne-border px-5 pt-4 pb-5`**. |
| **Single-row footer** (“View all” link bar) | `max2Classes.overviewPanelFooterRow` — **`border-t border-spyne-border px-5 py-4`**. |
| **Suggest banner** (Action Items, under tabs) | `max2Classes.overviewSuggestBanner` on the warning slab (copy + CTA). Icon + text: `overviewSuggestBannerContent`. Wrap banner + pointer in `overviewSuggestBannerAnchor`; pointer element uses `overviewSuggestBannerPointer` with inline **`left`** (tab center). If the pointer must paint outside the shell clip, add `overviewPanelShellAllowOverflow` next to `overviewPanelShell`. Gap before the table: `overviewSuggestBannerTableGap`. |

**TypeScript:** `max2Classes.overviewPanelShell`, `overviewPanelHeader`, `overviewPanelDescription`, `overviewPanelFooter`, `overviewPanelFooterRow`, `overviewPanelShellAllowOverflow`, `overviewSuggestBanner`, `overviewSuggestBannerContent`, `overviewSuggestBannerAnchor`, `overviewSuggestBannerPointer`, `overviewSuggestBannerTableGap` in `lib/design-system/max-2.ts`.

### Insight rows (Studio & modals)

Stacked **clickable** rows for inventory / media signals (e.g. Studio **Insights** card). Prefer this over full-width `spyne-row-warn` / `spyne-row-error` fills when you want a **quiet** list on a white card.

| Rule | Spec |
|------|--------|
| **Shadow** | **None** on the row and icon well |
| **Row surface** | **8px** radius, **1px** border `--spyne-border`; background `color-mix(page-bg **40%**, surface)`; hover → page-bg **70%** mix |
| **Padding** | Default (**button** row): **14px** × **16px** — class `spyne-insight-row` on `<button>` |
| **Compact row** | **8px** × **12px**, horizontal flex — `spyne-insight-row spyne-insight-row--compact` on `<a>` (modal links) |
| **Layout** | Inner wrapper `spyne-insight-row__body`: flex, **12px** gap, align start |
| **Icon well** | **36×36px**, **8px** radius, **1px** border; background **10%** semantic mix into surface; **no** fill “pill” saturation |
| **Icon well — warning** | Border: warning **30%** mix into `--spyne-border`; bg: warning **10%** + surface; icon: `--spyne-warning-ink` |
| **Icon well — critical** | Border: error **25%** mix; bg: error **10%** + surface; icon: `--spyne-error` |
| **Icon well — compact** | **32×32px**, **6px** radius; icons **14px** (default well uses **16px** icons) |
| **Title** | **14px**, **500**, `--spyne-text-primary` — `spyne-insight-row__title` |
| **Meta line** | **12px**, `--spyne-text-secondary`, **4px** top margin — `spyne-insight-row__meta` |
| **Title row** | Flex, space-between, **8px** gap — holds title + trailing **count** (`SpyneChip` **`outline`** + `warning` \| `error`) |
| **Chevron** | **16px**, `--spyne-text-secondary` at **50%** opacity — `spyne-insight-row__chevron` |
| **Focus** | **2px** ring: surface gap + **4px** outer ring `color-mix(primary **20%**, transparent) |

**Classes** (only under `.max2-spyne`): `spyne-insight-row`, `spyne-insight-row--compact`, `spyne-insight-row__body`, `spyne-insight-row__icon-well`, `spyne-insight-row__icon-well--warning`, `spyne-insight-row__icon-well--critical`, `spyne-insight-row__icon-well--compact`, `spyne-insight-row__main`, `spyne-insight-row__title-row`, `spyne-insight-row__title`, `spyne-insight-row__meta`, `spyne-insight-row__chevron`.

**TypeScript:** `spyneComponentClasses.insightRow`, `insightRowCompact`, `insightRowBody`, `insightRowIconWell`, `insightRowIconWellWarning`, `insightRowIconWellCritical`, `insightRowIconWellCompact`, `insightRowMain`, `insightRowTitleRow`, `insightRowTitle`, `insightRowMeta`, `insightRowChevron` in `lib/design-system/max-2.ts`.

### Toolbar: segmented switcher & filter dropdown

Canonical `:root` variables: `--spyne-toolbar-control-height`, `--spyne-toolbar-control-radius`, `--spyne-toolbar-control-gap`, `--spyne-toolbar-segment-padding-x`. Typed mirror: **`spyneToolbarTokens`** in `lib/design-system/max-2.ts`.

| Where | Usage |
|-------|--------|
| **Sales** overview | Agent Inbound / Outbound + native date `<select>` |
| **Studio** + **Lot** inventory (`Max2InventoryListHeader`) | **All / New / Pre-owned** with parenthetical counts: `SpyneLineTabStrip` + `SpyneLineTab` + `lineTabLabelWithCount` + `SpyneLineTabInlineCount` (not segmented, not badge pills) |
| **Lot** overview | **Holding cost** popover trigger: `spyne-toolbar-trigger` |
| **Any** shadcn **Select** under `.max2-spyne` | `[data-slot="select-trigger"]` uses the same **8px** radius, **36px** min height, **500** weight, border hover/focus as the filter dropdown (e.g. Lot vehicle table filters) |

| Control | Spec |
|--------|------|
| **Segmented** container | `inline-flex`, **1px** border `--spyne-border`, **8px** radius (`--spyne-toolbar-control-radius`), surface `--spyne-surface`, clip overflow |
| **Segment** button | **36px** min height (`--spyne-toolbar-control-height`), horizontal padding **12px**, **14px** / **500** (active **600**); inactive text `--spyne-text-secondary`; **active** background `--spyne-primary-soft`, text `--spyne-primary`; vertical divider between segments |
| **Status dot** (optional, before label) | **7px** circle; live → `--spyne-success`; idle → `--spyne-text-secondary` |
| **Filter** (native `<select>`) | Same **8px** radius and **36px** min height as segments; **1px** border; **14px** / **500**; **32px** right padding for chevron; focus ring **3px** primary **14%** mix |
| **shadcn Select** trigger | Same chrome as filter row (see `app/globals.css` `.max2-spyne [data-slot="select-trigger"]`) |
| **`spyne-toolbar-trigger`** | Popover/menu anchor: **8px** radius, **1px** border, Spyne surface; optional multi-line label + value |
| **Gap** between segmented and filter | **12px** (`--spyne-toolbar-control-gap`); Tailwind **`gap-3`** |

**Classes** (only under `.max2-spyne`): `spyne-segmented`, `spyne-segmented__btn`, `spyne-segmented__dot`, `spyne-segmented__dot--live`, `spyne-filter-select-wrap`, `spyne-filter-select`, `spyne-filter-select__chevron`, `spyne-toolbar-trigger`.

**React:** `SpyneSegmentedControl`, `SpyneSegmentedButton`, `SpyneSegmentedStatusDot`, `SpyneFilterSelectWrap`, `SpyneFilterSelectChevron` in `components/max-2/spyne-toolbar-controls.tsx`.

### Line tabs (underline row)

Used for **Sales** sub-navigation, in-page tab rows (e.g. campaign detail, action-item queues), and dense in-panel filters. Not a substitute for the **segmented** control (overview toolbar / inventory type row).

| Token / concept | Value / note |
|-----------------|--------------|
| Default label | **14px**, **500** (active **600**), line-height **1.4** |
| Compact label | **12px**; modifier `--compact` on the strip |
| Active indicator | **2px** bottom border `--spyne-primary` |
| Strip hairline | **1px** bottom `--spyne-border` |
| Tab horizontal padding | **12px** (compact inner tabs: **10px** left/right) |
| Tab bottom padding | **10px** |
| Icon/label gap inside tab | **6px** (`--spyne-line-tab-gap`) |
| Gap between tabs | **20px** column-gap (`--spyne-line-tab-strip-column-gap`) |
| Space below strip → next block | **24px** (`margin-bottom: var(--spyne-sales-stack-gap)`; match page `space-y-6` / `gap-6`) |

**Strip modifiers** (classes on `spyne-line-tab-strip`):

| Modifier | When to use |
|----------|-------------|
| *(default)* | Page-level tab row above main content |
| `--embedded` | Sticky shell nav, drawer headers, or anywhere the **24px** gap below the strip is handled by the parent layout (`margin-bottom: 0`) |
| `--tight` | Inside cards: **16px** margin below strip before a list/table |
| `--compact` | 12px labels + tighter horizontal padding (lead panels, dense filters) |
| `--bleed` | Negative horizontal margin so the hairline aligns with **card** edges when the card uses `p-4` |

**Tab count (two variants):**

| Variant | When to use | Token / React |
|--------|-------------|----------------|
| **Badge** (default for nav) | Sales shell, action queues, any row where counts read as KPI pills | `spyne-line-tab__badge`; inactive: light success tint; active: solid success, **white** ink. **`SpyneLineTabBadge`** inside **`SpyneLineTab`**. |
| **Inline parentheses** | Studio / Lot **Active inventory** vehicle-type row: `All(3834)` with **no** space before `(` | `spyne-line-tab__label-with-count` wraps the label + **`SpyneLineTabInlineCount`** (`spyne-line-tab__count-inline`). Count uses **same** color and weight as the tab (secondary / primary when active). |

**React:** `SpyneLineTabStrip`, `SpyneLineTab`, `SpyneLineTabBadge`, `SpyneLineTabInlineCount` in `components/max-2/spyne-line-tabs.tsx`.

**Module secondary nav (Studio AI, Sales, Service):** The underline strip that sits under the main header uses **`SpyneLineTabStrip` + `embedded`** inside a **sticky** shell (**`max2Classes.moduleSecondaryNavShell`**: `pt-2`, **no fixed height**). The shell **shrink-wraps** to the strip so the **bottom hairline is flush with the bottom of the white nav block** (no dead band below the separator). Implemented in `components/max-2/studio/console-v2/components/StudioSecondaryNav.tsx` and `components/max-2/sales/console-v2/components/SecondaryNav.jsx` (`embedded`). **Page body** below the nav: **`max2Classes.moduleSecondaryNavPageBody`** (`px-max2-page pb-6 pt-0`) on **Sales / Service** main content so there is **no extra band between the nav hairline and the page** (the Max 2 layout already uses **`pt-0`** for these routes; overview stickies use **`pt-4`** internally). **Studio** uses **`max2Classes.moduleSecondaryNavPageBodyStudio`** (`px-max2-page pb-6 pt-4`) so titles keep a **16px** inset without the old **24px** top pad. **Studio** tabs use **`<Link>`** with `spyneComponentClasses.lineTab` + `lineTabActive`; **Sales / Service** use **`SpyneLineTab`**. Sticky in-page title rows that full-bleed the gutter should **not** use **`-mt-6`** to cancel top padding (that pattern assumed a **`py-6`** wrapper). Keyboard focus uses the same **`focus-visible`** ring as other Spyne controls (see `.spyne-line-tab:focus-visible` in `app/globals.css`).

**Legacy alias:** `spyne-inventory-tab` / `spyne-inventory-tab--active` share the same tab chrome as `spyne-line-tab` for **in-card** chart/analysis rows (e.g. Lot), not for the Studio/Lot **vehicle type** segmented row.

### ROI / KPI metric strip (Lot View + Sales overview)

Horizontal strip of **five** equal-width columns inside **one** surface: **8px** radius, **1px** border (`bg-card` / theme border), **no** per-cell card shadow. Responsive: stack with **divide-y** on small screens; **lg** and up use **five** columns with **divide-x** between cells.

| Element | Spec |
|--------|------|
| Cell padding | **20px** horizontal (`px-5`), **16px** vertical (`py-4`) |
| Label row | **10px** label only, **600**, **uppercase**, **widest** tracking, `text-muted-foreground`; **12px** margin below (`mb-3`). **No dot in label headers.** |
| Dot (`roiKpiMetricDot`) | **Data legends only** (e.g. disposition retail/wholesale). **Never** use in metric label headers. Colors: **good** → `bg-spyne-success`; **watch** → `bg-spyne-warning`; **bad** → `bg-spyne-error`; **neutral** → `bg-muted-foreground/40` |
| Primary value | **30px** (`text-3xl`), **700**, tight tracking; default ink `text-foreground`; optional accent e.g. `text-spyne-error` for emphasis (MTD holding cost, highlighted Sales KPI) |
| Subtext | **11px**, `text-muted-foreground`, snug line-height |
| Disposition column | **8px** tall stacked bar (`h-2`, `rounded-full`); legend rows **12px** label + bold counts + **10px** right-aligned `%` column (**28px** min width) |

**React:** `SpyneRoiKpiStrip` (shell + grid), `SpyneRoiKpiMetricCell`, `SpyneRoiKpiDispositionPanel` in `components/max-2/spyne-roi-kpi-strip.tsx`. Class bundles: `spyneComponentClasses.roiKpiStrip`, `roiKpiStripGrid`, `roiKpiMetricCell`, `roiKpiMetricLabelRow`, `roiKpiMetricLabel`, `roiKpiMetricValue`, `roiKpiMetricSub`, `roiKpiDisposition*`. (`roiKpiMetricDot` is reserved for data legends only — not label headers.)

### Action tabs (issue / filter row)

Horizontal row of tappable cards for “actions required” (e.g. Studio AI, Lot view). Each card stacks **icon (24px)** → **title (14px / 600)** → **“N vehicles →”** (14px / 500). Pass icons as **`<MaterialSymbol name="snake_case" size={24} />`** only (not Lucide or ad-hoc SVG), per the Icons section below.

**Selected:** border, icon, and title **`--spyne-primary`**; surface **`--spyne-surface`**.

**Vehicle count** (“N vehicles →”): always **`--spyne-error`** (canonical red), including unselected tabs; no amber or other semantic tints on the number line.

Default (unselected) chrome: background `#F9FAFB`, border `--spyne-border`; icon `--spyne-text-secondary`, title `--spyne-text-primary`.

- **Strip container**: class `spyne-action-tab-strip` (`display: grid`, `gap: 12px`, `padding: 16px`, bottom border). Add responsive column classes on the element (e.g. `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`).
- **React**: `Max2ActionTab` + `Max2ActionTabStrip` in `components/max-2/max2-action-tab.tsx`; CSS under `.max2-spyne` in `app/globals.css`.

### Spacing

Base unit **4px**. Allowed steps: 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80, 96.

### Sidebar rail (shell)

Desktop Max 2 layout uses a **narrow collapsed rail**: **toggle** in the top row (centered when collapsed; **Max 2.0** label + toggle when expanded), then primary links as **icon (24px) above a 10px centered label** (max two lines). **Horizontal dividers** (`spyne-sidebar-rail__divider`) group sections; optional **footer** slot on `Max2SidebarRail` for bottom-pinned items. Expanded width **220px**; collapsed **76px**. Classes: `spyneComponentClasses.sidebarRail*` in `lib/design-system/max-2.ts`, `.spyne-sidebar-rail__*` in `app/globals.css`. Active primary link: `max2Classes.navActive`. **Nested items** (Studio AI, Lot View): container `spyne-sidebar-rail__child-group`; links `Max2SidebarRailChildLink` (`spyne-sidebar-rail__child-link` + `--active`). The **desktop shell** (sidebar + main column) is wrapped in **`Max2SpyneScope`** in `app/max-2/layout.tsx` so the rail and page share one `.max2-spyne` subtree; the **mobile menu** `SheetContent` adds `max2Classes.spyneScope` because it portals to `document.body`.

### Layout padding

- **32px** top, **24px** left, right, and bottom for the main content column (extra top inset clears shell chrome; horizontal and bottom unchanged).

Tailwind (from `@theme`): `pt-max2-page-top`, `px-max2-page`, `pb-max2-page`; `px-max2-page` for horizontal-only (e.g. mobile menu bar).

Combined main column: `max2Layout.pagePadding` (`px-max2-page pb-max2-page pt-max2-page-top`) in `lib/design-system/max-2.ts`. **Sales / Service** secondary-nav body adds **`pt-2`** (`max2Classes.moduleSecondaryNavPageBody`); **Studio** under secondary nav uses **`pt-6`** (`moduleSecondaryNavPageBodyStudio`).

### Icons

- Default: **Material Symbols Outlined** via `<MaterialSymbol name="snake_case" size={16|20|24} />`.
- Use Lucide (or other) only when no Material Symbol exists; prefer adding a Material name when possible.

## Implementation rules

1. **Spyne scope**: `app/max-2/layout.tsx` wraps the **sidebar + main column** in a single `Max2SpyneScope` (one `.max2-spyne` root for shell + content). Portaled UI (e.g. mobile nav `SheetContent`) should include `max2Classes.spyneScope` on the portal surface. Do not **nest** a second `.max2-spyne` inside the main column.
2. **Do not** scatter raw hex for Spyne colors in new code. Use `spyneConsoleTokens` / `spyneDarkUiTokens` (TS), CSS `var(--spyne-*)`, or Tailwind `text-spyne-*`, `bg-spyne-*`, `border-spyne-*`, `text-spyne-chart-on-dark-*`, or component classes from `spyneComponentClasses`.
3. **Cards / inputs / dialogs / selects** under `.max2-spyne` are normalized via `[data-slot="..."]` rules in `globals.css`; prefer shadcn primitives without overriding radius unless necessary.
4. **Semantic status** (success / warning / error / info): use `spyneComponentClasses.badge*` and `rowWarn` / `rowError` / `rowPositive` for tables and lists.
5. **Chips / filters**: use **`<SpyneChip />`** (and **`SpyneRemovableFilterChip`** where only the dismiss control should remove a filter) on scoped routes. See **Chips (design system)**. Legacy classes `spyne-chip` / `spyne-chip-filter` / `spyne-inventory-quick-chip*` remain in CSS for reference but **inventory quick filters** are implemented with `SpyneChip` + `spyneDsChipMetricClass`.
6. **Tabs and sub-tabs** (strict): On **every** Max 2 route, **do not** use shadcn `@/components/ui/tabs` (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`) for product UI. Wire state with React (`useState` or URL) and render **only** the Spyne primitives below so **every** tab row and nested sub-tab row matches the same underline, segmented, or action-card chrome (see **Line tabs** and **Toolbar: segmented switcher** above for tokens).

| Navigation pattern | Components | Examples |
|--------------------|------------|----------|
| Underline tab row (page shell, sticky nav, in-card modes, campaign detail) | `SpyneLineTabStrip`, `SpyneLineTab`, optional `SpyneLineTabBadge` **or** `lineTabLabelWithCount` + `SpyneLineTabInlineCount` | Sales `SecondaryNav`, `CampaignsPage` panels; inventory vehicle-type row uses **inline** counts |
| Segmented exclusive controls (short labels, toolbar width) | `SpyneSegmentedControl`, `SpyneSegmentedButton` | Sales overview Inbound / Outbound, dense toolbars |
| Action / issue buckets (icon + title + count) | `Max2ActionTabStrip`, `Max2ActionTab` | Studio and Lot “actions required” strips |

### Chips (design system)

Pill-shaped tags (**border-radius full**), **12px** label, **500** weight, **6×12px** padding (with **6px** gap to icons). Three emphases:

| Emphasis | Look |
|----------|------|
| **outline** | Very light tint, thin border, label + icons in the tone color |
| **soft** | Stronger tint, border, same ink as outline |
| **solid** | Filled background in the tone; label + icons **white** (warning solid uses **dark ink** `#1A1A1A` on yellow for contrast) |

**Structure**

- **Text only**: `children` only.
- **Leading icon**: `leading={<MaterialSymbol name="check_circle" size={14} />}` or any node.
- **Trailing icon**: `trailing={…}` (e.g. close affordance).
- **Compact**: `compact` for dense tables (10px type, tighter padding).
- **Count disc** (Studio AI / Lot header shortcuts): `trailing={<span className={spyneDsChipMetricClass}>{n}</span>}` with `variant="soft" | "outline"` and `tone="primary" | "neutral"`.
- **Removable row filters** (label + X only removes): `<SpyneRemovableFilterChip label="…" onRemove={…} />`.

**Tones** (CSS variables in `:root` + `.spyne-ds-chip--{tone}`):

| Tone | Source |
|------|--------|
| `neutral` | `--spyne-chip-neutral` (#64748B) |
| `charcoal` | `--spyne-chip-charcoal` (#374151) |
| `success` | `--spyne-success` (#027A48) |
| `warning` | `--spyne-warning` / ink `--spyne-warning-ink` |
| `error` | `--spyne-error` |
| `info` | `--spyne-info` |
| `primary` | `--spyne-primary` |
| `cyan`, `pink`, `orange`, `crimson`, `rose` | `--spyne-chip-*` extended tokens |

**Composable exports** (`@/components/max-2/spyne-ui`)

| Component | Use when |
|-----------|----------|
| `SpyneChip` | Base pill: any `variant` × `tone`, optional `leading` / `trailing`, `compact`, `as="button"` |
| `SpyneMetricChip` | Label + count disc (inventory shortcuts) |
| `SpyneDismissibleChip` | Active filter row: whole control dismisses (`ariaLabel` required) |
| `SpyneRemovableFilterChip` | Label + **X only** removes (sheet filter rows) |
| `SpyneLotStatusChip` | `status: LotStatus` |
| `SpyneMediaStatusChip` | `mediaStatus: MediaStatus` |
| `SpynePublishStatusChip` | `publishStatus: PublishStatus` |
| `SpynePricingPositionChip` | `pricingPosition: PricingPosition` |
| `SpyneSeverityChip` | Issue tags: `severity: "error" \| "warning"` |

**Presets**: `spyneLotStatusChipPreset`, `spyneMediaStatusChipPreset`, `spynePublishStatusChipPreset`, `spynePricingPositionChipPreset`, `spyneLotStatusOrder`, `spynePricingPositionOrder` from `@/lib/design-system/max-2` for facets and custom layouts.

**React**

```tsx
import {
  SpyneChip,
  SpyneMetricChip,
  SpyneDismissibleChip,
  SpyneRemovableFilterChip,
  SpyneLotStatusChip,
} from "@/components/max-2/spyne-ui"
import { spyneDsChipMetricClass } from "@/lib/design-system/max-2"
import { MaterialSymbol } from "@/components/max-2/material-symbol"

<SpyneChip variant="outline" tone="success">Label</SpyneChip>
<SpyneChip variant="soft" tone="info" leading={<MaterialSymbol name="schedule" size={14} />}>
  With icon
</SpyneChip>
<SpyneChip as="button" variant="solid" tone="primary" type="button" onClick={…}>
  Dismissible
</SpyneChip>
```

**Plain classes** (inside `.max2-spyne`): `spyne-ds-chip spyne-ds-chip--outline spyne-ds-chip--success` + optional `spyne-ds-chip__icon` / `spyne-ds-chip__metric` / `spyne-ds-chip--compact`. Helpers: `spyneDsChipClassName`, `spyneDsChipIconClass`, `spyneDsChipMetricClass`, `spyneDsChipCompactClass` in `lib/design-system/max-2.ts`.

### VehicleMediaTable (inventory listing table)

`components/max-2/studio/vehicle-media-table.tsx` — the canonical full-featured inventory table used across Studio. Columns: checkbox (optional), thumbnail + hover preview, vehicle + VIN/stock, type, review status, publish state, age, holding cost (% of est. margin), price, 3-dot row menu (mark as sold / rename / delete). Includes floating bulk-action bar and sold toast.

**Props:**

| Prop | Default | When to use |
|------|---------|-------------|
| `showCheckboxes` | `true` | Pass `false` to hide the select-all + per-row checkboxes and the floating bulk-action bar. Use in read-only or embedded contexts (e.g. Studio Overview action items). |
| `embedded` | `false` | Pass `true` to strip the table's own `rounded-xl border border-gray-200` wrapper. **Always use alongside `showCheckboxes={false}`** when the table sits inside a parent that already provides border + border-radius (Card, modal, section container). |

**Rule:** Never nest two borders/rounded wrappers — the parent element owns the border and radius; `VehicleMediaTable` with `embedded` only provides the inner table markup.

```tsx
{/* Full standalone table — default */}
<VehicleMediaTable vehicles={filtered} />

{/* Embedded inside a card / section — no outer shell */}
<VehicleMediaTable vehicles={shown} showCheckboxes={false} embedded />
```

### Inventory filter drawer (Studio AI + Lot inventory)

//hello 

Right-hand **Filters** sheet: light gray header row (`spyne-filter-panel__header`) with **tune** icon + “Filters” title and close control; **scrollable body** (`spyne-filter-panel__body`: `flex: 1 1 0; min-height: 0; overflow-y: auto`) with **accordion sections** (`spyne-filter-section`); each section has an uppercase label trigger (`spyne-filter-section__trigger`) and **checkbox rows** (`spyne-filter-option`) showing label + count in parentheses; overflow values use purple **+N MORE** (`spyne-filter-more`). Footer is sticky with **Clear Filters** (`spyne-btn-secondary-md` + `flex-1`) and **Show Vehicles** (`spyne-btn-primary-md` + `flex-1`).

| Layer | Location |
|--------|-----------|
| CSS (`.max2-spyne` subtree) | `app/globals.css`: `spyne-filter-panel*`, `spyne-filter-section*`, `spyne-filter-option*`, `spyne-filter-more`; buttons reuse `spyne-btn-secondary-md` / `spyne-btn-primary-md` |
| Typed class names | `spyneComponentClasses.filterPanel*` … `btnPrimaryMd` / `btnSecondaryMd` in `lib/design-system/max-2.ts` |
| React layout + sections | `components/max-2/inventory-filter-panel.tsx`: `SpyneFilterSheet`, `SpyneFilterFacetSection` |

**Portals:** Radix `Sheet` renders into `document.body`, so filter markup is **outside** the layout `Max2SpyneScope`. `SpyneFilterSheet` wraps its inner tree in **`max2Classes.spyneScope`** so `.max2-spyne .spyne-filter-*` rules in `globals.css` still match. Use the same pattern for any other portaled Spyne UI (dialogs, menus) that rely on scoped component classes.

## Inferred values (allowed for a11y / interaction)

Documented in `lib/design-system/max-2.ts` as `spyneConsoleTokens` and `spyneDarkUiTokens`:

- Primary hover / pressed for CTA backgrounds
- Disabled background and text
- **`warningInk`** / `--spyne-warning-ink`: readable brown for warning copy on white (same ink as `.spyne-badge-warning` text; pairs with canonical `--spyne-warning`)
- **`spyneDarkUiTokens`**: dark tooltip surface, neutral text, and `chartSeries` hues for accessible copy on `#1E1E1E`
- Soft tints for semantic badges (via `color-mix` in CSS classes)

## TypeScript quick reference

```ts
import {
  max2Classes,
  max2Layout,
  spyneConsoleTokens,
  spyneDarkUiTokens,
  spyneCheckboxTokens,
  spyneComponentClasses,
  isMax2SpyneScopedPath,
} from "@/lib/design-system/max-2"
import { Max2SpyneScope } from "@/components/max-2/max2-spyne-scope"
import { Max2ActionTab, Max2ActionTabStrip } from "@/components/max-2/max2-action-tab"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import {
  SpyneChip,
  SpyneRemovableFilterChip,
} from "@/components/max-2/spyne-ui"
import { SpyneFilterSheet, SpyneFilterFacetSection } from "@/components/max-2/inventory-filter-panel"
import {
  Max2SidebarRail,
  Max2SidebarRailChildLink,
  Max2SidebarRailDivider,
  Max2SidebarRailNavLink,
} from "@/components/max-2/max2-sidebar-rail"
import { Max2PageSection } from "@/components/max-2/max2-page-section"
```

## Sales route

`/max-2/sales` uses `ConsoleV2SalesExperience` with `styles/console-v2-sales.css` (legacy `.spyne-*` helpers under `.console-v2-sales-root`). It shares the same `Max2SpyneScope` wrapper as the rest of Max 2; new Sales UI should use `spyne-ui` chips and tokens like other tabs.
