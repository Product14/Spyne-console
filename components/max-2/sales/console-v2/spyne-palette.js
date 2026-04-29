/**
 * Hex values aligned with design-system/max-2.md & lib/design-system/max-2.ts (spyneConsoleTokens).
 * Use for Recharts, inline styles, and mock data — not the legacy indigo SaaS palette.
 */
export const SPYNE = {
  primary: '#4600F2',
  primarySoft: '#4600F214',
  pageBg: '#F4F5F8',
  surface: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#027A48',
  warning: '#FACC15',
  warningInk: '#854D0E',
  error: '#D13313',
  info: '#3B82F6',
  cyan: '#0891B2',
  pink: '#DB2777',
  orange: '#EA580C',
  crimson: '#B91C1C',
  rose: '#E11D48',
}

/** Soft fills for badges / swimlane headers (hex, safe for inline styles) */
export const SPYNE_SOFT_BG = {
  primary: '#4600F214',
  success: '#E8F5EF',
  warning: '#FFFBEB',
  warningBorder: '#F5E59A',
  info: '#EFF6FF',
  pink: '#FCE7F3',
  orange: '#FFF7ED',
  neutral: '#F9FAFB',
  /** High-priority swimlanes / alerts */
  error: '#FDE8E6',
  errorBorder: '#F5C2BC',
}

/** Selection / drawer elevation using Spyne primary */
export const SPYNE_ELEVATION_PRIMARY = '0 0 0 3px #4600F224'
export const SPYNE_DRAWER_SHADOW = '-4px 0 32px color-mix(in srgb, #4600F2 14%, transparent)'

/** Distinct series for charts / swimlanes (order preserved) */
export const CHART_SERIES = [
  SPYNE.primary,
  SPYNE.info,
  SPYNE.success,
  SPYNE.cyan,
  SPYNE.pink,
  SPYNE.orange,
  SPYNE.error,
  SPYNE.warningInk,
]

/**
 * Same series order as CHART_SERIES — hues tuned for text/lines on dark tooltips (`#1E1E1E`).
 * See design-system/max-2.md — Dark elevated surfaces; `spyneDarkUiTokens` in `lib/design-system/max-2.ts`.
 */
export const CHART_SERIES_ON_DARK = [
  '#B794F6',
  '#7EB6FF',
  '#6EE7A0',
  '#22D3EE',
  '#F472B6',
  '#FDBA74',
  '#F87171',
  '#FCD34D',
]

export const SPYNE_DARK_UI = {
  elevatedBg: '#1E1E1E',
  text: '#F3F4F6',
  textMuted: '#9CA3AF',
}
