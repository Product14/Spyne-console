# Claude Code Rules — Intelligent Console v2

## Component Reuse (CRITICAL)

**Before creating any new component, search the codebase for an existing one that does the same job.**

- Use `Grep` or `Glob` to search for the pattern before writing new code.
- If a component already exists (even in a different page/feature), import and reuse it — do not duplicate it.
- If the existing component needs a small extension (a new prop, a variant), extend it in place rather than creating a parallel version.
- Only create a new component when nothing in the codebase covers the use case after a thorough search.

### Where to look first

| Need | Look here |
|---|---|
| KPI / metric strip | `components/max-2/spyne-roi-kpi-strip.tsx` |
| Holding cost widget | `components/max-2/lot-view/lot-holding-cost-widget.tsx` |
| Holding cost modals | `components/max-2/lot-view/holding-cost-setup-modals.tsx` |
| Quick filter chips | `QuickFilterCard` in `components/max-2/studio/inventory-filters.tsx` |
| Segmented controls | `components/max-2/spyne-toolbar-controls.tsx` |
| Line tabs | `components/max-2/spyne-line-tabs.tsx` |
| Filter sheet | `components/max-2/inventory-filter-panel.tsx` |
| Inventory list header | `components/max-2/inventory-list-header.tsx` |
| Action tabs / strip | `components/max-2/max2-action-tab.tsx` |
| Icons | `MaterialSymbol` from `components/max-2/material-symbol.tsx` — never add lucide icons where MaterialSymbol covers it |
| Badges / chips | `SpyneChip`, `SpyneMediaStatusChip`, `SpynePublishStatusChip` from `components/max-2/spyne-ui.tsx` |
| Dialogs | shadcn `Dialog` / `DialogContent` — do not build custom modal shells |
| Design tokens | `spyneComponentClasses`, `max2Classes`, `max2Layout` from `lib/design-system/max-2.ts` |

## Design System (CRITICAL)

**Always use design system tokens. Never hand-roll Tailwind when a token exists.**

All tokens live in `lib/design-system/max-2.ts`. Import the relevant export and use the token — do not copy the underlying class string.

### Layout & page structure

| Token | Class | Use for |
|---|---|---|
| `max2Layout.pageStack` | `spyne-max2-page-stack` | Vertical stack of sections on every page |
| `max2Layout.pagePadding` | `px-max2-page pb-max2-page pt-max2-page-top` | Outer page padding |
| `max2Classes.pageTitle` | `max2-page-title` | `<h1>` on every page |
| `max2Classes.pageDescription` | `max2-page-description` | Subtitle below `pageTitle` |
| `max2Classes.sectionTitle` | `text-sm font-semibold …` | Section headings within a page |
| `max2Classes.overviewPanelShell` | `rounded-xl border border-spyne-border …` | Panel / card container |
| `max2Classes.overviewPanelHeader` | `px-5 pt-5 pb-5` | Heading block inside a panel |
| `max2Classes.overviewPanelFooterRow` | `border-t … px-5 py-4` | Footer row with a link or action |

### Buttons & CTAs

| Token | Use for |
|---|---|
| `spyneComponentClasses.btnPrimaryMd` | Primary action buttons (always `spyne-primary` color) |
| `spyneComponentClasses.btnPrimaryLg` | Large primary CTA |
| `spyneComponentClasses.btnSecondaryMd` | Secondary / ghost buttons |

**Never use yellow, red, orange, or any non-primary color for CTA buttons.**

### Badges & chips

| Token | Use for |
|---|---|
| `spyneComponentClasses.badgeSuccess` | Green — Published, Ready, On Target |
| `spyneComponentClasses.badgeWarning` | Amber — In Review, Watch |
| `spyneComponentClasses.badgeError` | Red — critical issues |
| `spyneComponentClasses.badgeNeutral` | Grey — neutral state |
| `spyneComponentClasses.chip` / `chipFilter` | Generic filter chips |

Use `SpyneChip`, `SpyneMediaStatusChip`, `SpynePublishStatusChip` from `components/max-2/spyne-ui.tsx` — do not build ad-hoc badge `<span>` elements.

### KPI strips & metric cells

| Token | Use for |
|---|---|
| `spyneComponentClasses.roiKpiStrip` | White rounded KPI container |
| `spyneComponentClasses.roiKpiStripGrid` | Default 5-col responsive grid inside strip |
| `spyneComponentClasses.roiKpiMetricCell` | One metric column (padding) |
| `spyneComponentClasses.roiKpiMetricLabel` | Uppercase label above value |
| `spyneComponentClasses.roiKpiMetricValue` | Large headline number |
| `spyneComponentClasses.roiKpiMetricSub` | Subtext below value |

Use `SpyneRoiKpiStrip` + `SpyneRoiKpiMetricCell` — do not build custom metric card markup.

### Insight rows (action lists inside panels/modals)

| Token | Use for |
|---|---|
| `spyneComponentClasses.insightRow` | Tinted list row |
| `spyneComponentClasses.insightRowCompact` | Dense horizontal row |
| `spyneComponentClasses.insightRowIconWell` | Icon container |
| `spyneComponentClasses.insightRowIconWellCritical` | Red tint |
| `spyneComponentClasses.insightRowIconWellWarning` | Amber tint |
| `spyneComponentClasses.insightRowIconWellSuccess` | Green tint |

### Dark tooltips

Use `spyneComponentClasses.darkTooltipRadixContent` + `darkTooltipPanel` + `SpyneDarkTooltipPanel`. Never build a custom dark tooltip from scratch.

### Toolbar / filter triggers

Use `spyneComponentClasses.toolbarTrigger` (`spyne-toolbar-trigger`) for popover trigger buttons (e.g. Holding Cost widget). Never style these with ad-hoc borders/padding.

### Tabs

- Line tabs: `SpyneLineTabStrip` + `SpyneLineTab` + `SpyneLineTabInlineCount`
- Segmented control: `SpyneSegmentedControl` + `SpyneSegmentedButton`
- Action tabs: `Max2ActionTabStrip` + `Max2ActionTab`

### Color tokens (non-Tailwind contexts only)

Use `spyneConsoleTokens` from `lib/design-system/max-2.ts` for SVG fills, inline styles, or Recharts colors. Never hard-code hex values that exist in this map.

### Icons

Always use `MaterialSymbol` from `components/max-2/material-symbol.tsx`. Only fall back to lucide icons for shapes not available in Material Symbols (e.g. `TrendingDown`, `Megaphone`). Never mix icon libraries arbitrarily.

## General

- All CTAs use `spyne-primary` color only — no yellow, red, or orange action buttons.
- Keep components small and focused. Extend via props, not duplication.
- The Max 2 shell is wrapped in `Max2SpyneScope` (`app/max-2/layout.tsx`) — all design-system CSS classes only work inside this scope.
