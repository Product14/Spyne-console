"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Recovers from webpack ChunkLoadError during development by forcing
 * a full-page navigation when a stale chunk fails to load.
 */
export function ChunkErrorRecovery() {
  const pathname = usePathname()

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const msg = event.message || ""
      if (
        msg.includes("ChunkLoadError") ||
        msg.includes("Loading chunk") ||
        msg.includes("Failed to fetch dynamically imported module")
      ) {
        event.preventDefault()
        window.location.reload()
      }
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = String(event.reason?.message || event.reason || "")
      if (
        reason.includes("ChunkLoadError") ||
        reason.includes("Loading chunk") ||
        reason.includes("Failed to fetch dynamically imported module")
      ) {
        event.preventDefault()
        window.location.reload()
      }
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleRejection)
    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [pathname])

  return null
}
