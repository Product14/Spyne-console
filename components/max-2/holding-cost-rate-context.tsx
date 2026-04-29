"use client"

import * as React from "react"
import { mockLotVehicles, mockLotSummary } from "@/lib/max-2-mocks"
import {
  applyHoldingRateToLotVehicles,
  HOLDING_COST_CHANGED_EVENT,
  readPersistedHoldingStateBrowser,
} from "@/lib/holding-cost-config"
import { computeLotOverviewKpis } from "@/lib/lot-overview-metrics"
import type { LotSummary, LotVehicle } from "@/services/max-2/max-2.types"

export type HoldingCostRateContextValue = {
  /** Persisted daily $/car when configured; otherwise null (mock defaults apply). */
  dailyRate: number | null
  configured: boolean
  vehicles: LotVehicle[]
  /** Lot summary with `totalHoldingCostToday` aligned to KPI daily burn when configured. */
  lotSummary: LotSummary
}

const HoldingCostRateContext = React.createContext<HoldingCostRateContextValue | null>(null)

/** Stable server/SSR snapshot — same reference forever (never changes on server). */
const SERVER_SNAPSHOT: HoldingCostRateContextValue = {
  dailyRate: null,
  configured: false,
  vehicles: mockLotVehicles,
  lotSummary: mockLotSummary,
}

/** Module-level cache so `buildSnapshot` returns the same reference when nothing changed. */
let _cachedSnapshot: HoldingCostRateContextValue = SERVER_SNAPSHOT

function buildSnapshot(): HoldingCostRateContextValue {
  if (typeof window === "undefined") return SERVER_SNAPSHOT

  const { configured, dailyRate } = readPersistedHoldingStateBrowser()

  if (!configured || dailyRate == null) {
    // Return cached unconfigured snapshot if it already matches
    if (!_cachedSnapshot.configured) return _cachedSnapshot
    _cachedSnapshot = SERVER_SNAPSHOT
    return _cachedSnapshot
  }

  // Return cached snapshot if the rate hasn't changed
  if (_cachedSnapshot.configured && _cachedSnapshot.dailyRate === dailyRate) {
    return _cachedSnapshot
  }

  const vehicles = applyHoldingRateToLotVehicles(mockLotVehicles, dailyRate)
  const k = computeLotOverviewKpis(vehicles)
  _cachedSnapshot = {
    dailyRate,
    configured: true,
    vehicles,
    lotSummary: {
      ...mockLotSummary,
      totalHoldingCostToday: k.dailyCost,
    },
  }
  return _cachedSnapshot
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  const handler = () => { _cachedSnapshot = SERVER_SNAPSHOT; onChange() }
  window.addEventListener("storage", handler)
  window.addEventListener(HOLDING_COST_CHANGED_EVENT, handler)
  return () => {
    window.removeEventListener("storage", handler)
    window.removeEventListener(HOLDING_COST_CHANGED_EVENT, handler)
  }
}

function getServerSnapshot(): HoldingCostRateContextValue {
  return SERVER_SNAPSHOT
}

export function HoldingCostRateProvider({ children }: { children: React.ReactNode }) {
  const snapshot = React.useSyncExternalStore(subscribe, buildSnapshot, getServerSnapshot)
  return (
    <HoldingCostRateContext.Provider value={snapshot}>{children}</HoldingCostRateContext.Provider>
  )
}

export function useHoldingCostRate(): HoldingCostRateContextValue {
  const ctx = React.useContext(HoldingCostRateContext)
  if (!ctx) {
    throw new Error("useHoldingCostRate must be used within HoldingCostRateProvider")
  }
  return ctx
}

/** Safe when provider is missing (e.g. tests): falls back to mock data. */
export function useHoldingCostRateOptional(): HoldingCostRateContextValue {
  const ctx = React.useContext(HoldingCostRateContext)
  if (ctx) return ctx
  return getServerSnapshot()
}
