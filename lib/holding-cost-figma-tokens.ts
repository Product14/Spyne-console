/**
 * Figma node `5585:54497` — Holding cost setup modal (Inventory handoff).
 * Values read via Talk to Figma MCP (channel session).
 */
export const holdingCostFigma = {
  /** Body copy (calculator + general) */
  ink: "#1A1A1A",
  inkStrong: "#0A0A0A",
  inkMuted: "#6B7280",
  border: "#E5E7EB",
  surface: "#FFFFFF",
  surfaceInput: "#FAFAFA",
  surfaceMuted: "#F9FAFB",
  primary: "#4600F2",
  primaryHover: "#3B00D1",
  primarySoft: "#4600F214",
  purpleMutedFill: "rgba(105, 65, 198, 0.1)",
  /** Why card — screenshot: light blue → white (vertical) */
  whyCardGradient:
    "linear-gradient(180deg, rgba(76, 191, 255, 0.14) 0%, rgba(255, 255, 255, 0.65) 52%, #FFFFFF 100%)",
  /** Hairline under modal top radius (Figma `5585:54498` spectrum) */
  topBarGradient:
    "linear-gradient(90deg, #ED8939 0%, #E83E54 25%, #B651D7 50%, #7F6AF2 72%, #5BBFF6 100%)",
  /** Eyebrow title multi-stop (text fill) */
  titleGradient:
    "linear-gradient(90deg, #ED8939 0%, #E83E54 28%, #B651D7 51%, #7F6AF2 72%, #5BBFF6 100%)",
  error: "#D13313",
  errorSoft: "#FEF2F2",
  aiBadgeInk: "#8F8F8F",
} as const
