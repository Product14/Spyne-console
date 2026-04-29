import type { LotVehicle } from "@/services/max-2/max-2.types"

export const HOLDING_COST_CONFIGURED_LS_KEY = "hc_configured"
export const HOLDING_COST_DAILY_RATE_LS_KEY = "hc_daily_rate_per_car"

export const HOLDING_COST_CHANGED_EVENT = "holding-cost-changed"

/** Broadcast after persisting rate so all listeners refresh. */
export function dispatchHoldingCostChanged(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(HOLDING_COST_CHANGED_EVENT))
}

export function applyHoldingRateToLotVehicles(
  vehicles: LotVehicle[],
  ratePerDay: number,
): LotVehicle[] {
  return vehicles.map((v) => ({
    ...v,
    holdingCostPerDay: ratePerDay,
    totalHoldingCost: ratePerDay * v.daysInStock,
  }))
}

export function readPersistedHoldingStateBrowser(): {
  configured: boolean
  dailyRate: number | null
} {
  if (typeof window === "undefined") {
    return { configured: false, dailyRate: null }
  }
  try {
    const configured = localStorage.getItem(HOLDING_COST_CONFIGURED_LS_KEY) === "true"
    const raw = localStorage.getItem(HOLDING_COST_DAILY_RATE_LS_KEY)
    const dailyRate =
      raw != null && raw !== "" ? parseFloat(raw) : Number.NaN
    const rateOk = Number.isFinite(dailyRate) && dailyRate > 0
    return {
      configured: configured && rateOk,
      dailyRate: rateOk ? dailyRate : null,
    }
  } catch {
    return { configured: false, dailyRate: null }
  }
}

export function writePersistedHoldingState(dailyRate: number): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(HOLDING_COST_DAILY_RATE_LS_KEY, String(dailyRate))
    localStorage.setItem(HOLDING_COST_CONFIGURED_LS_KEY, "true")
    dispatchHoldingCostChanged()
  } catch {
    /* ignore */
  }
}

/**
 * Single $/car for Studio merchandising issue math when persisted; else default mock.
 * Call only from client (browser) code paths.
 */
export function getEffectiveStudioHoldingCostPerDayClient(fallback = 38): number {
  const { dailyRate } = readPersistedHoldingStateBrowser()
  return dailyRate ?? fallback
}
