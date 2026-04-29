import type { LotVehicle } from "@/services/max-2/max-2.types"

/** Same cohort as `LotKPIStrip` on Lot Overview (`/max-2/studio/media-lot`). */
export const LOT_OVERVIEW_ACTIVE_STATUSES = [
  "frontline",
  "wholesale-candidate",
  "sold-pending",
] as const

export function getLotOverviewActiveVehicles(vehicles: LotVehicle[]): LotVehicle[] {
  return vehicles.filter((v) =>
    (LOT_OVERVIEW_ACTIVE_STATUSES as readonly string[]).includes(v.lotStatus),
  )
}

export type LotOverviewKpis = {
  total: number
  frontlineCount: number
  wholesaleCount: number
  newCount: number
  preOwnedCount: number
  mtdCost: number
  dailyCost: number
  totalGrossMargin: number
  avgDays: number
  aged45: number
}

export function computeLotOverviewKpis(vehicles: LotVehicle[]): LotOverviewKpis {
  const activeVehicles = getLotOverviewActiveVehicles(vehicles)
  const total = activeVehicles.length
  const frontlineCount = activeVehicles.filter((v) => v.lotStatus === "frontline").length
  const wholesaleCount = activeVehicles.filter((v) => v.lotStatus === "wholesale-candidate").length
  const newCount = activeVehicles.filter((v) => v.isNew === true).length
  const preOwnedCount = total - newCount

  const mtdCost = activeVehicles.reduce((sum, v) => sum + v.totalHoldingCost, 0)
  const dailyCost = activeVehicles.reduce((sum, v) => sum + v.holdingCostPerDay, 0)
  const totalGrossMargin = activeVehicles.reduce((sum, v) => sum + v.estimatedFrontGross, 0)

  const nonsold = activeVehicles.filter((v) => v.lotStatus !== "sold-pending")
  const avgDays =
    nonsold.length > 0
      ? nonsold.reduce((s, v) => s + v.daysInStock, 0) / nonsold.length
      : 0

  const aged45 = activeVehicles.filter(
    (v) => v.daysInStock >= 45 && v.lotStatus !== "sold-pending",
  ).length

  return {
    total,
    frontlineCount,
    wholesaleCount,
    newCount,
    preOwnedCount,
    mtdCost,
    dailyCost,
    totalGrossMargin,
    avgDays,
    aged45,
  }
}

/** Same lines as the Holding cost tooltip on Lot Overview. */
export function lotHoldingResolutionLines(vehicles: LotVehicle[]): string[] {
  const front = (v: LotVehicle) => v.lotStatus === "frontline"
  const notSold = (v: LotVehicle) => v.lotStatus !== "sold-pending"

  const exitNow = vehicles.filter((v) => notSold(v) && v.daysInStock > 60).length
  const liquidate = vehicles.filter((v) => notSold(v) && v.daysInStock >= 46 && v.daysInStock <= 60).length
  const reprice = vehicles.filter((v) => front(v) && v.daysInStock >= 31 && v.daysInStock <= 45).length
  const smart = vehicles.filter((v) => front(v) && v.leads === 0 && v.daysInStock >= 10).length
  const highHold = vehicles.filter((v) => v.totalHoldingCost >= 1500).length

  const lines: string[] = []
  if (exitNow > 0) lines.push(`Exit now: wholesale or auction (${exitNow} units)`)
  if (liquidate > 0) lines.push(`Liquidate: deep reprice or wholesale (${liquidate} units)`)
  if (reprice > 0) lines.push(`Reprice to market (${reprice} in 31–45 day window)`)
  if (smart > 0) lines.push(`Run Smart Campaign (${smart} frontline, low leads)`)
  if (highHold > 0) lines.push(`High holding cost: prioritize sale or reprice (${highHold} units)`)
  if (lines.length === 0) {
    lines.push("Holding within target: monitor aged inventory weekly")
  }
  return lines.slice(0, 5)
}
