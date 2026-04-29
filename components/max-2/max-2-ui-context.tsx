"use client"

import * as React from "react"

export type Max2UiContextValue = {
  sidebarCollapsed: boolean
  openMobileSidebar: () => void
}

const Max2UiContext = React.createContext<Max2UiContextValue | null>(null)

export function Max2UiProvider({
  children,
  sidebarCollapsed,
  openMobileSidebar,
}: {
  children: React.ReactNode
  sidebarCollapsed: boolean
  openMobileSidebar: () => void
}) {
  const value = React.useMemo(
    () => ({ sidebarCollapsed, openMobileSidebar }),
    [sidebarCollapsed, openMobileSidebar]
  )
  return <Max2UiContext.Provider value={value}>{children}</Max2UiContext.Provider>
}

export function useMax2Ui(): Max2UiContextValue {
  const ctx = React.useContext(Max2UiContext)
  if (!ctx) {
    return {
      sidebarCollapsed: false,
      openMobileSidebar: () => {},
    }
  }
  return ctx
}
