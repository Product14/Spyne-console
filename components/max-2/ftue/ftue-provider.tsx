"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useFtueInventoryFetch } from "@/lib/max-2/use-ftue-inventory-fetch"
import type { FtueController, FtueImsProvider } from "@/services/max-2/ftue.types"
import { FtueModal } from "./ftue-modal"

const FtueContext = createContext<FtueController | null>(null)

interface FtueProviderProps {
  children: ReactNode
  ims?: FtueImsProvider
}

/**
 * Mounts the FTUE controller + global modal once at the Max 2 layout.
 * Page-level surfaces (e.g. merchandising banner) read the controller via {@link useFtue}.
 */
export function FtueProvider({ children, ims = "vauto" }: FtueProviderProps) {
  const controller = useFtueInventoryFetch({ ims })

  return (
    <FtueContext.Provider value={controller}>
      {children}
      <FtueModal controller={controller} />
    </FtueContext.Provider>
  )
}

export function useFtue(): FtueController {
  const ctx = useContext(FtueContext)
  if (!ctx) {
    throw new Error("useFtue must be used inside <FtueProvider>")
  }
  return ctx
}
