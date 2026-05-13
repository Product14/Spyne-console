"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

export type Plan = "lite" | "pro"

interface PlanContextValue {
  plan: Plan
  setPlan: (next: Plan) => void
  /** True once we've read the persisted preference — avoids hydration flash. */
  hydrated: boolean
}

const PlanContext = createContext<PlanContextValue | null>(null)

const STORAGE_KEY = "spyne.plan"

function isPlan(v: unknown): v is Plan {
  return v === "lite" || v === "pro"
}

interface PlanProviderProps {
  children: ReactNode
  defaultPlan?: Plan
}

/**
 * Plan-tier provider — exposes the active plan ("lite" | "pro") to the Spyne console.
 * Persists the choice to localStorage so it survives reloads.
 */
export function PlanProvider({ children, defaultPlan = "lite" }: PlanProviderProps) {
  const [plan, setPlanState] = useState<Plan>(defaultPlan)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (isPlan(saved)) setPlanState(saved)
    } catch {
      /* ignore — quota / privacy mode */
    }
    setHydrated(true)
  }, [])

  const setPlan = useCallback((next: Plan) => {
    setPlanState(next)
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, next)
      } catch {
        /* ignore */
      }
    }
  }, [])

  return (
    <PlanContext.Provider value={{ plan, setPlan, hydrated }}>{children}</PlanContext.Provider>
  )
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext)
  if (!ctx) throw new Error("usePlan must be used inside <PlanProvider>")
  return ctx
}

/** Convenience boolean for gating Pro-only UI. */
export function useIsPro(): boolean {
  return usePlan().plan === "pro"
}
